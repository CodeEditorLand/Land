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
import { app } from 'electron';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { hash } from '../../../base/common/hash.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEncryptionMainService } from '../../encryption/common/encryptionService.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IApplicationStorageMainService } from '../../storage/electron-main/storageMainService.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
export const IProxyAuthService = createDecorator('proxyAuthService');
let ProxyAuthService = class ProxyAuthService extends Disposable {
    constructor(logService, windowsMainService, encryptionMainService, applicationStorageMainService, configurationService, environmentMainService) {
        super();
        this.logService = logService;
        this.windowsMainService = windowsMainService;
        this.encryptionMainService = encryptionMainService;
        this.applicationStorageMainService = applicationStorageMainService;
        this.configurationService = configurationService;
        this.environmentMainService = environmentMainService;
        this.PROXY_CREDENTIALS_SERVICE_KEY = 'proxy-credentials://';
        this.pendingProxyResolves = new Map();
        this.currentDialog = undefined;
        this.cancelledAuthInfoHashes = new Set();
        this.sessionCredentials = new Map();
        this.registerListeners();
    }
    registerListeners() {
        const onLogin = Event.fromNodeEventEmitter(app, 'login', (event, _webContents, req, authInfo, callback) => ({ event, authInfo: { ...authInfo, attempt: req.firstAuthAttempt ? 1 : 2 }, callback }));
        this._register(onLogin(this.onLogin, this));
    }
    async lookupAuthorization(authInfo) {
        return this.onLogin({ authInfo });
    }
    async onLogin({ event, authInfo, callback }) {
        if (!authInfo.isProxy) {
            return;
        }
        event?.preventDefault();
        const authInfoHash = String(hash({ scheme: authInfo.scheme, host: authInfo.host, port: authInfo.port }));
        let credentials = undefined;
        let pendingProxyResolve = this.pendingProxyResolves.get(authInfoHash);
        if (!pendingProxyResolve) {
            this.logService.trace('auth#onLogin (proxy) - no pending proxy handling found, starting new');
            pendingProxyResolve = this.resolveProxyCredentials(authInfo, authInfoHash);
            this.pendingProxyResolves.set(authInfoHash, pendingProxyResolve);
            try {
                credentials = await pendingProxyResolve;
            }
            finally {
                this.pendingProxyResolves.delete(authInfoHash);
            }
        }
        else {
            this.logService.trace('auth#onLogin (proxy) - pending proxy handling found');
            credentials = await pendingProxyResolve;
        }
        callback?.(credentials?.username, credentials?.password);
        return credentials;
    }
    async resolveProxyCredentials(authInfo, authInfoHash) {
        this.logService.trace('auth#resolveProxyCredentials (proxy) - enter');
        try {
            const credentials = await this.doResolveProxyCredentials(authInfo, authInfoHash);
            if (credentials) {
                this.logService.trace('auth#resolveProxyCredentials (proxy) - got credentials');
                return credentials;
            }
            else {
                this.logService.trace('auth#resolveProxyCredentials (proxy) - did not get credentials');
            }
        }
        finally {
            this.logService.trace('auth#resolveProxyCredentials (proxy) - exit');
        }
        return undefined;
    }
    async doResolveProxyCredentials(authInfo, authInfoHash) {
        this.logService.trace('auth#doResolveProxyCredentials - enter', authInfo);
        if (this.environmentMainService.extensionTestsLocationURI) {
            const credentials = this.configurationService.getValue('integration-test.http.proxyAuth');
            if (credentials) {
                const j = credentials.indexOf(':');
                if (j !== -1) {
                    return {
                        username: credentials.substring(0, j),
                        password: credentials.substring(j + 1)
                    };
                }
                else {
                    return {
                        username: credentials,
                        password: ''
                    };
                }
            }
            return undefined;
        }
        const newHttpProxy = (this.configurationService.getValue('http.proxy') || '').trim()
            || (process.env['https_proxy'] || process.env['HTTPS_PROXY'] || process.env['http_proxy'] || process.env['HTTP_PROXY'] || '').trim()
            || undefined;
        if (newHttpProxy?.indexOf('@') !== -1) {
            const uri = URI.parse(newHttpProxy);
            const i = uri.authority.indexOf('@');
            if (i !== -1) {
                if (authInfo.attempt > 1) {
                    this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - ignoring previously used config/envvar credentials');
                    return undefined;
                }
                this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - found config/envvar credentials to use');
                const credentials = uri.authority.substring(0, i);
                const j = credentials.indexOf(':');
                if (j !== -1) {
                    return {
                        username: credentials.substring(0, j),
                        password: credentials.substring(j + 1)
                    };
                }
                else {
                    return {
                        username: credentials,
                        password: ''
                    };
                }
            }
        }
        const sessionCredentials = authInfo.attempt === 1 && this.sessionCredentials.get(authInfoHash);
        if (sessionCredentials) {
            this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - found session credentials to use');
            const { username, password } = sessionCredentials;
            return { username, password };
        }
        let storedUsername;
        let storedPassword;
        try {
            const encryptedValue = this.applicationStorageMainService.get(this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash, -1);
            if (encryptedValue) {
                const credentials = JSON.parse(await this.encryptionMainService.decrypt(encryptedValue));
                storedUsername = credentials.username;
                storedPassword = credentials.password;
            }
        }
        catch (error) {
            this.logService.error(error);
        }
        if (authInfo.attempt === 1 && typeof storedUsername === 'string' && typeof storedPassword === 'string') {
            this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - found stored credentials to use');
            this.sessionCredentials.set(authInfoHash, { username: storedUsername, password: storedPassword });
            return { username: storedUsername, password: storedPassword };
        }
        const previousDialog = this.currentDialog;
        const currentDialog = this.currentDialog = (async () => {
            await previousDialog;
            const credentials = await this.showProxyCredentialsDialog(authInfo, authInfoHash, storedUsername, storedPassword);
            if (this.currentDialog === currentDialog) {
                this.currentDialog = undefined;
            }
            return credentials;
        })();
        return currentDialog;
    }
    async showProxyCredentialsDialog(authInfo, authInfoHash, storedUsername, storedPassword) {
        if (this.cancelledAuthInfoHashes.has(authInfoHash)) {
            this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - login dialog was cancelled before, not showing again');
            return undefined;
        }
        const window = this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
        if (!window) {
            this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - no opened window found to show dialog in');
            return undefined;
        }
        this.logService.trace(`auth#doResolveProxyCredentials (proxy) - asking window ${window.id} to handle proxy login`);
        const sessionCredentials = this.sessionCredentials.get(authInfoHash);
        const payload = {
            authInfo,
            username: sessionCredentials?.username ?? storedUsername,
            password: sessionCredentials?.password ?? storedPassword,
            replyChannel: `vscode:proxyAuthResponse:${generateUuid()}`
        };
        window.sendWhenReady('vscode:openProxyAuthenticationDialog', CancellationToken.None, payload);
        const loginDialogCredentials = await new Promise(resolve => {
            const proxyAuthResponseHandler = async (event, channel, reply) => {
                if (channel === payload.replyChannel) {
                    this.logService.trace(`auth#doResolveProxyCredentials - exit - received credentials from window ${window.id}`);
                    window.win?.webContents.off('ipc-message', proxyAuthResponseHandler);
                    if (reply) {
                        const credentials = { username: reply.username, password: reply.password };
                        try {
                            if (reply.remember) {
                                const encryptedSerializedCredentials = await this.encryptionMainService.encrypt(JSON.stringify(credentials));
                                this.applicationStorageMainService.store(this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash, encryptedSerializedCredentials, -1, 1);
                            }
                            else {
                                this.applicationStorageMainService.remove(this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash, -1);
                            }
                        }
                        catch (error) {
                            this.logService.error(error);
                        }
                        resolve({ username: credentials.username, password: credentials.password });
                    }
                    else {
                        this.cancelledAuthInfoHashes.add(authInfoHash);
                        resolve(undefined);
                    }
                }
            };
            window.win?.webContents.on('ipc-message', proxyAuthResponseHandler);
        });
        this.sessionCredentials.set(authInfoHash, loginDialogCredentials);
        return loginDialogCredentials;
    }
};
ProxyAuthService = __decorate([
    __param(0, ILogService),
    __param(1, IWindowsMainService),
    __param(2, IEncryptionMainService),
    __param(3, IApplicationStorageMainService),
    __param(4, IConfigurationService),
    __param(5, IEnvironmentMainService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ProxyAuthService);
export { ProxyAuthService };
