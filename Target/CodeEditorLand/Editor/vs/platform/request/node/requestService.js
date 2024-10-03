var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { parse as parseUrl } from 'url';
import { Promises } from '../../../base/common/async.js';
import { streamToBufferReadableStream } from '../../../base/common/buffer.js';
import { CancellationError, getErrorMessage } from '../../../base/common/errors.js';
import { isBoolean, isNumber } from '../../../base/common/types.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { getResolvedShellEnv } from '../../shell/node/shellEnv.js';
import { ILogService } from '../../log/common/log.js';
import { AbstractRequestService } from '../common/request.js';
import { getProxyAgent } from './proxy.js';
import { createGunzip } from 'zlib';
let RequestService = class RequestService extends AbstractRequestService {
    constructor(configurationService, environmentService, logService) {
        super(logService);
        this.configurationService = configurationService;
        this.environmentService = environmentService;
        this.configure();
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('http')) {
                this.configure();
            }
        }));
    }
    configure() {
        const config = this.configurationService.getValue('http');
        this.proxyUrl = config?.proxy;
        this.strictSSL = !!config?.proxyStrictSSL;
        this.authorization = config?.proxyAuthorization;
    }
    async request(options, token) {
        const { proxyUrl, strictSSL } = this;
        let shellEnv = undefined;
        try {
            shellEnv = await getResolvedShellEnv(this.configurationService, this.logService, this.environmentService.args, process.env);
        }
        catch (error) {
            if (!this.shellEnvErrorLogged) {
                this.shellEnvErrorLogged = true;
                this.logService.error(`resolving shell environment failed`, getErrorMessage(error));
            }
        }
        const env = {
            ...process.env,
            ...shellEnv
        };
        const agent = options.agent ? options.agent : await getProxyAgent(options.url || '', env, { proxyUrl, strictSSL });
        options.agent = agent;
        options.strictSSL = strictSSL;
        if (this.authorization) {
            options.headers = {
                ...(options.headers || {}),
                'Proxy-Authorization': this.authorization
            };
        }
        return this.logAndRequest(options, () => nodeRequest(options, token));
    }
    async resolveProxy(url) {
        return undefined;
    }
    async lookupAuthorization(authInfo) {
        return undefined;
    }
    async lookupKerberosAuthorization(urlStr) {
        try {
            const kerberos = await import('kerberos');
            const url = new URL(urlStr);
            const spn = this.configurationService.getValue('http.proxyKerberosServicePrincipal')
                || (process.platform === 'win32' ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
            this.logService.debug('RequestService#lookupKerberosAuthorization Kerberos authentication lookup', `proxyURL:${url}`, `spn:${spn}`);
            const client = await kerberos.initializeClient(spn);
            const response = await client.step('');
            return 'Negotiate ' + response;
        }
        catch (err) {
            this.logService.debug('RequestService#lookupKerberosAuthorization Kerberos authentication failed', err);
            return undefined;
        }
    }
    async loadCertificates() {
        const proxyAgent = await import('@vscode/proxy-agent');
        return proxyAgent.loadSystemCertificates({ log: this.logService });
    }
};
RequestService = __decorate([
    __param(0, IConfigurationService),
    __param(1, INativeEnvironmentService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], RequestService);
export { RequestService };
async function getNodeRequest(options) {
    const endpoint = parseUrl(options.url);
    const module = endpoint.protocol === 'https:' ? await import('https') : await import('http');
    return module.request;
}
export async function nodeRequest(options, token) {
    return Promises.withAsyncBody(async (resolve, reject) => {
        const endpoint = parseUrl(options.url);
        const rawRequest = options.getRawRequest
            ? options.getRawRequest(options)
            : await getNodeRequest(options);
        const opts = {
            hostname: endpoint.hostname,
            port: endpoint.port ? parseInt(endpoint.port) : (endpoint.protocol === 'https:' ? 443 : 80),
            protocol: endpoint.protocol,
            path: endpoint.path,
            method: options.type || 'GET',
            headers: options.headers,
            agent: options.agent,
            rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true
        };
        if (options.user && options.password) {
            opts.auth = options.user + ':' + options.password;
        }
        const req = rawRequest(opts, (res) => {
            const followRedirects = isNumber(options.followRedirects) ? options.followRedirects : 3;
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers['location']) {
                nodeRequest({
                    ...options,
                    url: res.headers['location'],
                    followRedirects: followRedirects - 1
                }, token).then(resolve, reject);
            }
            else {
                let stream = res;
                if (!options.isChromiumNetwork && res.headers['content-encoding'] === 'gzip') {
                    stream = res.pipe(createGunzip());
                }
                resolve({ res, stream: streamToBufferReadableStream(stream) });
            }
        });
        req.on('error', reject);
        if (options.timeout) {
            req.setTimeout(options.timeout);
        }
        if (options.isChromiumNetwork) {
            req.removeHeader('Content-Length');
        }
        if (options.data) {
            if (typeof options.data === 'string') {
                req.write(options.data);
            }
        }
        req.end();
        token.onCancellationRequested(() => {
            req.abort();
            reject(new CancellationError());
        });
    });
}
