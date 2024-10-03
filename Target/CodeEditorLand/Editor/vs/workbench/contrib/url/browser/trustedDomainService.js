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
import { WindowIdleValue } from '../../../../base/browser/dom.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService, createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { TRUSTED_DOMAINS_STORAGE_KEY, readStaticTrustedDomains } from './trustedDomains.js';
import { testUrlMatchesGlob } from '../common/urlGlob.js';
export const ITrustedDomainService = createDecorator('ITrustedDomainService');
let TrustedDomainService = class TrustedDomainService extends Disposable {
    constructor(_instantiationService, _storageService) {
        super();
        this._instantiationService = _instantiationService;
        this._storageService = _storageService;
        const initStaticDomainsResult = () => {
            return new WindowIdleValue(mainWindow, () => {
                const { defaultTrustedDomains, trustedDomains, } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
                return [
                    ...defaultTrustedDomains,
                    ...trustedDomains
                ];
            });
        };
        this._staticTrustedDomainsResult = initStaticDomainsResult();
        this._register(this._storageService.onDidChangeValue(-1, TRUSTED_DOMAINS_STORAGE_KEY, this._register(new DisposableStore()))(() => {
            this._staticTrustedDomainsResult?.dispose();
            this._staticTrustedDomainsResult = initStaticDomainsResult();
        }));
    }
    isValid(resource) {
        const { defaultTrustedDomains, trustedDomains, } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
        const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains];
        return isURLDomainTrusted(resource, allTrustedDomains);
    }
};
TrustedDomainService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IStorageService),
    __metadata("design:paramtypes", [Object, Object])
], TrustedDomainService);
export { TrustedDomainService };
const rLocalhost = /^localhost(:\d+)?$/i;
const r127 = /^127.0.0.1(:\d+)?$/;
function isLocalhostAuthority(authority) {
    return rLocalhost.test(authority) || r127.test(authority);
}
function normalizeURL(url) {
    const caseInsensitiveAuthorities = ['github.com'];
    try {
        const parsed = typeof url === 'string' ? URI.parse(url, true) : url;
        if (caseInsensitiveAuthorities.includes(parsed.authority)) {
            return parsed.with({ path: parsed.path.toLowerCase() }).toString(true);
        }
        else {
            return parsed.toString(true);
        }
    }
    catch {
        return url.toString();
    }
}
export function isURLDomainTrusted(url, trustedDomains) {
    url = URI.parse(normalizeURL(url));
    trustedDomains = trustedDomains.map(normalizeURL);
    if (isLocalhostAuthority(url.authority)) {
        return true;
    }
    for (let i = 0; i < trustedDomains.length; i++) {
        if (trustedDomains[i] === '*') {
            return true;
        }
        if (testUrlMatchesGlob(url, trustedDomains[i])) {
            return true;
        }
    }
    return false;
}
