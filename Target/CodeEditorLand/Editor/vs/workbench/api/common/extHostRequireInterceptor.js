/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
var NodeModuleAliasingModuleFactory_1;
import * as performance from '../../../base/common/performance.js';
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostConfiguration } from './extHostConfiguration.js';
import { nullExtensionDescription } from '../../services/extensions/common/extensions.js';
import { ExtensionIdentifierMap } from '../../../platform/extensions/common/extensions.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { ExtensionPaths, IExtHostExtensionService } from './extHostExtensionService.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { escapeRegExpCharacters } from '../../../base/common/strings.js';
let RequireInterceptor = class RequireInterceptor {
    constructor(_apiFactory, _extensionRegistry, _instaService, _extHostConfiguration, _extHostExtensionService, _initData, _logService) {
        this._apiFactory = _apiFactory;
        this._extensionRegistry = _extensionRegistry;
        this._instaService = _instaService;
        this._extHostConfiguration = _extHostConfiguration;
        this._extHostExtensionService = _extHostExtensionService;
        this._initData = _initData;
        this._logService = _logService;
        this._factories = new Map();
        this._alternatives = [];
    }
    async install() {
        this._installInterceptor();
        performance.mark('code/extHost/willWaitForConfig');
        const configProvider = await this._extHostConfiguration.getConfigProvider();
        performance.mark('code/extHost/didWaitForConfig');
        const extensionPaths = await this._extHostExtensionService.getExtensionPathIndex();
        this.register(new VSCodeNodeModuleFactory(this._apiFactory, extensionPaths, this._extensionRegistry, configProvider, this._logService));
        this.register(this._instaService.createInstance(NodeModuleAliasingModuleFactory));
        if (this._initData.remote.isRemote) {
            this.register(this._instaService.createInstance(OpenNodeModuleFactory, extensionPaths, this._initData.environment.appUriScheme));
        }
    }
    register(interceptor) {
        if ('nodeModuleName' in interceptor) {
            if (Array.isArray(interceptor.nodeModuleName)) {
                for (const moduleName of interceptor.nodeModuleName) {
                    this._factories.set(moduleName, interceptor);
                }
            }
            else {
                this._factories.set(interceptor.nodeModuleName, interceptor);
            }
        }
        if (typeof interceptor.alternativeModuleName === 'function') {
            this._alternatives.push((moduleName) => {
                return interceptor.alternativeModuleName(moduleName);
            });
        }
    }
};
RequireInterceptor = __decorate([
    __param(2, IInstantiationService),
    __param(3, IExtHostConfiguration),
    __param(4, IExtHostExtensionService),
    __param(5, IExtHostInitDataService),
    __param(6, ILogService),
    __metadata("design:paramtypes", [Function, Object, Object, Object, Object, Object, Object])
], RequireInterceptor);
export { RequireInterceptor };
//#region --- module renames
let NodeModuleAliasingModuleFactory = class NodeModuleAliasingModuleFactory {
    static { NodeModuleAliasingModuleFactory_1 = this; }
    /**
     * Map of aliased internal node_modules, used to allow for modules to be
     * renamed without breaking extensions. In the form "original -> new name".
     */
    static { this.aliased = new Map([
        ['vscode-ripgrep', '@vscode/ripgrep'],
        ['vscode-windows-registry', '@vscode/windows-registry'],
    ]); }
    constructor(initData) {
        if (initData.environment.appRoot && NodeModuleAliasingModuleFactory_1.aliased.size) {
            const root = escapeRegExpCharacters(this.forceForwardSlashes(initData.environment.appRoot.fsPath));
            // decompose ${appRoot}/node_modules/foo/bin to ['${appRoot}/node_modules/', 'foo', '/bin'],
            // and likewise the more complex form ${appRoot}/node_modules.asar.unpacked/@vcode/foo/bin
            // to ['${appRoot}/node_modules.asar.unpacked/',' @vscode/foo', '/bin'].
            const npmIdChrs = `[a-z0-9_.-]`;
            const npmModuleName = `@${npmIdChrs}+\\/${npmIdChrs}+|${npmIdChrs}+`;
            const moduleFolders = 'node_modules|node_modules\\.asar(?:\\.unpacked)?';
            this.re = new RegExp(`^(${root}/${moduleFolders}\\/)(${npmModuleName})(.*)$`, 'i');
        }
    }
    alternativeModuleName(name) {
        if (!this.re) {
            return;
        }
        const result = this.re.exec(this.forceForwardSlashes(name));
        if (!result) {
            return;
        }
        const [, prefix, moduleName, suffix] = result;
        const dealiased = NodeModuleAliasingModuleFactory_1.aliased.get(moduleName);
        if (dealiased === undefined) {
            return;
        }
        console.warn(`${moduleName} as been renamed to ${dealiased}, please update your imports`);
        return prefix + dealiased + suffix;
    }
    forceForwardSlashes(str) {
        return str.replace(/\\/g, '/');
    }
};
NodeModuleAliasingModuleFactory = NodeModuleAliasingModuleFactory_1 = __decorate([
    __param(0, IExtHostInitDataService),
    __metadata("design:paramtypes", [Object])
], NodeModuleAliasingModuleFactory);
//#endregion
//#region --- vscode-module
class VSCodeNodeModuleFactory {
    constructor(_apiFactory, _extensionPaths, _extensionRegistry, _configProvider, _logService) {
        this._apiFactory = _apiFactory;
        this._extensionPaths = _extensionPaths;
        this._extensionRegistry = _extensionRegistry;
        this._configProvider = _configProvider;
        this._logService = _logService;
        this.nodeModuleName = 'vscode';
        this._extApiImpl = new ExtensionIdentifierMap();
    }
    load(_request, parent) {
        // get extension id from filename and api for extension
        const ext = this._extensionPaths.findSubstr(parent);
        if (ext) {
            let apiImpl = this._extApiImpl.get(ext.identifier);
            if (!apiImpl) {
                apiImpl = this._apiFactory(ext, this._extensionRegistry, this._configProvider);
                this._extApiImpl.set(ext.identifier, apiImpl);
            }
            return apiImpl;
        }
        // fall back to a default implementation
        if (!this._defaultApiImpl) {
            let extensionPathsPretty = '';
            this._extensionPaths.forEach((value, index) => extensionPathsPretty += `\t${index} -> ${value.identifier.value}\n`);
            this._logService.warn(`Could not identify extension for 'vscode' require call from ${parent}. These are the extension path mappings: \n${extensionPathsPretty}`);
            this._defaultApiImpl = this._apiFactory(nullExtensionDescription, this._extensionRegistry, this._configProvider);
        }
        return this._defaultApiImpl;
    }
}
let OpenNodeModuleFactory = class OpenNodeModuleFactory {
    constructor(_extensionPaths, _appUriScheme, rpcService) {
        this._extensionPaths = _extensionPaths;
        this._appUriScheme = _appUriScheme;
        this.nodeModuleName = ['open', 'opn'];
        this._mainThreadTelemetry = rpcService.getProxy(MainContext.MainThreadTelemetry);
        const mainThreadWindow = rpcService.getProxy(MainContext.MainThreadWindow);
        this._impl = (target, options) => {
            const uri = URI.parse(target);
            // If we have options use the original method.
            if (options) {
                return this.callOriginal(target, options);
            }
            if (uri.scheme === 'http' || uri.scheme === 'https') {
                return mainThreadWindow.$openUri(uri, target, { allowTunneling: true });
            }
            else if (uri.scheme === 'mailto' || uri.scheme === this._appUriScheme) {
                return mainThreadWindow.$openUri(uri, target, {});
            }
            return this.callOriginal(target, options);
        };
    }
    load(request, parent, original) {
        // get extension id from filename and api for extension
        const extension = this._extensionPaths.findSubstr(parent);
        if (extension) {
            this._extensionId = extension.identifier.value;
            this.sendShimmingTelemetry();
        }
        this._original = original(request);
        return this._impl;
    }
    callOriginal(target, options) {
        this.sendNoForwardTelemetry();
        return this._original(target, options);
    }
    sendShimmingTelemetry() {
        if (!this._extensionId) {
            return;
        }
        this._mainThreadTelemetry.$publicLog2('shimming.open', { extension: this._extensionId });
    }
    sendNoForwardTelemetry() {
        if (!this._extensionId) {
            return;
        }
        this._mainThreadTelemetry.$publicLog2('shimming.open.call.noForward', { extension: this._extensionId });
    }
};
OpenNodeModuleFactory = __decorate([
    __param(2, IExtHostRpcService),
    __metadata("design:paramtypes", [ExtensionPaths, String, Object])
], OpenNodeModuleFactory);
//#endregion
