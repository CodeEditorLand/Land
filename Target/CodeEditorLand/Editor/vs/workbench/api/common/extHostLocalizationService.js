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
import { LANGUAGE_DEFAULT } from '../../../base/common/platform.js';
import { format2 } from '../../../base/common/strings.js';
import { URI } from '../../../base/common/uri.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
let ExtHostLocalizationService = class ExtHostLocalizationService {
    constructor(initData, rpc, logService) {
        this.logService = logService;
        this.bundleCache = new Map();
        this._proxy = rpc.getProxy(MainContext.MainThreadLocalization);
        this.currentLanguage = initData.environment.appLanguage;
        this.isDefaultLanguage = this.currentLanguage === LANGUAGE_DEFAULT;
    }
    getMessage(extensionId, details) {
        const { message, args, comment } = details;
        if (this.isDefaultLanguage) {
            return format2(message, (args ?? {}));
        }
        let key = message;
        if (comment && comment.length > 0) {
            key += `/${Array.isArray(comment) ? comment.join('') : comment}`;
        }
        const str = this.bundleCache.get(extensionId)?.contents[key];
        if (!str) {
            this.logService.warn(`Using default string since no string found in i18n bundle that has the key: ${key}`);
        }
        return format2(str ?? message, (args ?? {}));
    }
    getBundle(extensionId) {
        return this.bundleCache.get(extensionId)?.contents;
    }
    getBundleUri(extensionId) {
        return this.bundleCache.get(extensionId)?.uri;
    }
    async initializeLocalizedMessages(extension) {
        if (this.isDefaultLanguage
            || (!extension.l10n && !extension.isBuiltin)) {
            return;
        }
        if (this.bundleCache.has(extension.identifier.value)) {
            return;
        }
        let contents;
        const bundleUri = await this.getBundleLocation(extension);
        if (!bundleUri) {
            this.logService.error(`No bundle location found for extension ${extension.identifier.value}`);
            return;
        }
        try {
            const response = await this._proxy.$fetchBundleContents(bundleUri);
            const result = JSON.parse(response);
            contents = extension.isBuiltin ? result.contents?.bundle : result;
        }
        catch (e) {
            this.logService.error(`Failed to load translations for ${extension.identifier.value} from ${bundleUri}: ${e.message}`);
            return;
        }
        if (contents) {
            this.bundleCache.set(extension.identifier.value, {
                contents,
                uri: bundleUri
            });
        }
    }
    async getBundleLocation(extension) {
        if (extension.isBuiltin) {
            const uri = await this._proxy.$fetchBuiltInBundleUri(extension.identifier.value, this.currentLanguage);
            return URI.revive(uri);
        }
        return extension.l10n
            ? URI.joinPath(extension.extensionLocation, extension.l10n, `bundle.l10n.${this.currentLanguage}.json`)
            : undefined;
    }
};
ExtHostLocalizationService = __decorate([
    __param(0, IExtHostInitDataService),
    __param(1, IExtHostRpcService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExtHostLocalizationService);
export { ExtHostLocalizationService };
export const IExtHostLocalizationService = createDecorator('IExtHostLocalizationService');
