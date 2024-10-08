/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { streamToBuffer } from '../../../base/common/buffer.js';
import { getErrorMessage } from '../../../base/common/errors.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { localize } from '../../../nls.js';
import { Extensions } from '../../configuration/common/configurationRegistry.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { Registry } from '../../registry/common/platform.js';
export const IRequestService = createDecorator('requestService');
class LoggableHeaders {
    constructor(original) {
        this.original = original;
    }
    toJSON() {
        if (!this.headers) {
            const headers = Object.create(null);
            for (const key in this.original) {
                if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'proxy-authorization') {
                    headers[key] = '*****';
                }
                else {
                    headers[key] = this.original[key];
                }
            }
            this.headers = headers;
        }
        return this.headers;
    }
}
export class AbstractRequestService extends Disposable {
    constructor(logService) {
        super();
        this.logService = logService;
        this.counter = 0;
    }
    async logAndRequest(options, request) {
        const prefix = `[network] #${++this.counter}: ${options.url}`;
        this.logService.trace(`${prefix} - begin`, options.type, new LoggableHeaders(options.headers ?? {}));
        try {
            const result = await request();
            this.logService.trace(`${prefix} - end`, options.type, result.res.statusCode, result.res.headers);
            return result;
        }
        catch (error) {
            this.logService.error(`${prefix} - error`, options.type, getErrorMessage(error));
            throw error;
        }
    }
}
export function isSuccess(context) {
    return (context.res.statusCode && context.res.statusCode >= 200 && context.res.statusCode < 300) || context.res.statusCode === 1223;
}
export function hasNoContent(context) {
    return context.res.statusCode === 204;
}
export async function asText(context) {
    if (hasNoContent(context)) {
        return null;
    }
    const buffer = await streamToBuffer(context.stream);
    return buffer.toString();
}
export async function asTextOrError(context) {
    if (!isSuccess(context)) {
        throw new Error('Server returned ' + context.res.statusCode);
    }
    return asText(context);
}
export async function asJson(context) {
    if (!isSuccess(context)) {
        throw new Error('Server returned ' + context.res.statusCode);
    }
    if (hasNoContent(context)) {
        return null;
    }
    const buffer = await streamToBuffer(context.stream);
    const str = buffer.toString();
    try {
        return JSON.parse(str);
    }
    catch (err) {
        err.message += ':\n' + str;
        throw err;
    }
}
export function updateProxyConfigurationsScope(scope) {
    registerProxyConfigurations(scope);
}
let proxyConfiguration;
function registerProxyConfigurations(scope) {
    const configurationRegistry = Registry.as(Extensions.Configuration);
    const oldProxyConfiguration = proxyConfiguration;
    proxyConfiguration = {
        id: 'http',
        order: 15,
        title: localize('httpConfigurationTitle', "HTTP"),
        type: 'object',
        scope,
        properties: {
            'http.proxy': {
                type: 'string',
                pattern: '^(https?|socks|socks4a?|socks5h?)://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$',
                markdownDescription: localize('proxy', "The proxy setting to use. If not set, will be inherited from the `http_proxy` and `https_proxy` environment variables."),
                restricted: true
            },
            'http.proxyStrictSSL': {
                type: 'boolean',
                default: true,
                description: localize('strictSSL', "Controls whether the proxy server certificate should be verified against the list of supplied CAs."),
                restricted: true
            },
            'http.proxyKerberosServicePrincipal': {
                type: 'string',
                markdownDescription: localize('proxyKerberosServicePrincipal', "Overrides the principal service name for Kerberos authentication with the HTTP proxy. A default based on the proxy hostname is used when this is not set."),
                restricted: true
            },
            'http.noProxy': {
                type: 'array',
                items: { type: 'string' },
                markdownDescription: localize('noProxy', "Specifies domain names for which proxy settings should be ignored for HTTP/HTTPS requests."),
                restricted: true
            },
            'http.proxyAuthorization': {
                type: ['null', 'string'],
                default: null,
                markdownDescription: localize('proxyAuthorization', "The value to send as the `Proxy-Authorization` header for every network request."),
                restricted: true
            },
            'http.proxySupport': {
                type: 'string',
                enum: ['off', 'on', 'fallback', 'override'],
                enumDescriptions: [
                    localize('proxySupportOff', "Disable proxy support for extensions."),
                    localize('proxySupportOn', "Enable proxy support for extensions."),
                    localize('proxySupportFallback', "Enable proxy support for extensions, fall back to request options, when no proxy found."),
                    localize('proxySupportOverride', "Enable proxy support for extensions, override request options."),
                ],
                default: 'override',
                description: localize('proxySupport', "Use the proxy support for extensions."),
                restricted: true
            },
            'http.systemCertificates': {
                type: 'boolean',
                default: true,
                description: localize('systemCertificates', "Controls whether CA certificates should be loaded from the OS. (On Windows and macOS, a reload of the window is required after turning this off.)"),
                restricted: true
            },
            'http.experimental.systemCertificatesV2': {
                type: 'boolean',
                tags: ['experimental'],
                default: false,
                description: localize('systemCertificatesV2', "Controls whether experimental loading of CA certificates from the OS should be enabled. This uses a more general approach than the default implemenation."),
                restricted: true
            },
            'http.electronFetch': {
                type: 'boolean',
                default: false,
                description: localize('electronFetch', "Controls whether use of Electron's fetch implementation instead of Node.js' should be enabled. All local extensions will get Electron's fetch implementation for the global fetch API."),
                restricted: true
            }
        }
    };
    configurationRegistry.updateConfigurations({ add: [proxyConfiguration], remove: oldProxyConfiguration ? [oldProxyConfiguration] : [] });
}
registerProxyConfigurations(1 /* ConfigurationScope.APPLICATION */);
