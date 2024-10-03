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
import { Schemas, matchesScheme } from '../../../../base/common/network.js';
import Severity from '../../../../base/common/severity.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { ITrustedDomainService, isURLDomainTrusted } from './trustedDomainService.js';
import { configureOpenerTrustedDomainsHandler, readStaticTrustedDomains } from './trustedDomains.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
let OpenerValidatorContributions = class OpenerValidatorContributions {
    constructor(_openerService, _storageService, _dialogService, _productService, _quickInputService, _editorService, _clipboardService, _telemetryService, _instantiationService, _configurationService, _workspaceTrustService, _trustedDomainService) {
        this._openerService = _openerService;
        this._storageService = _storageService;
        this._dialogService = _dialogService;
        this._productService = _productService;
        this._quickInputService = _quickInputService;
        this._editorService = _editorService;
        this._clipboardService = _clipboardService;
        this._telemetryService = _telemetryService;
        this._instantiationService = _instantiationService;
        this._configurationService = _configurationService;
        this._workspaceTrustService = _workspaceTrustService;
        this._trustedDomainService = _trustedDomainService;
        this._openerService.registerValidator({ shouldOpen: (uri, options) => this.validateLink(uri, options) });
    }
    async validateLink(resource, openOptions) {
        if (!matchesScheme(resource, Schemas.http) && !matchesScheme(resource, Schemas.https)) {
            return true;
        }
        if (openOptions?.fromWorkspace && this._workspaceTrustService.isWorkspaceTrusted() && !this._configurationService.getValue('workbench.trustedDomains.promptInTrustedWorkspace')) {
            return true;
        }
        const originalResource = resource;
        let resourceUri;
        if (typeof resource === 'string') {
            resourceUri = URI.parse(resource);
        }
        else {
            resourceUri = resource;
        }
        if (await this._trustedDomainService.isValid(resourceUri)) {
            return true;
        }
        else {
            const { scheme, authority, path, query, fragment } = resourceUri;
            let formattedLink = `${scheme}://${authority}${path}`;
            const linkTail = `${query ? '?' + query : ''}${fragment ? '#' + fragment : ''}`;
            const remainingLength = Math.max(0, 60 - formattedLink.length);
            const linkTailLengthToKeep = Math.min(Math.max(5, remainingLength), linkTail.length);
            if (linkTailLengthToKeep === linkTail.length) {
                formattedLink += linkTail;
            }
            else {
                formattedLink += linkTail.charAt(0) + '...' + linkTail.substring(linkTail.length - linkTailLengthToKeep + 1);
            }
            const { result } = await this._dialogService.prompt({
                type: Severity.Info,
                message: localize('openExternalLinkAt', 'Do you want {0} to open the external website?', this._productService.nameShort),
                detail: typeof originalResource === 'string' ? originalResource : formattedLink,
                buttons: [
                    {
                        label: localize({ key: 'open', comment: ['&& denotes a mnemonic'] }, '&&Open'),
                        run: () => true
                    },
                    {
                        label: localize({ key: 'copy', comment: ['&& denotes a mnemonic'] }, '&&Copy'),
                        run: () => {
                            this._clipboardService.writeText(typeof originalResource === 'string' ? originalResource : resourceUri.toString(true));
                            return false;
                        }
                    },
                    {
                        label: localize({ key: 'configureTrustedDomains', comment: ['&& denotes a mnemonic'] }, 'Configure &&Trusted Domains'),
                        run: async () => {
                            const { trustedDomains, } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
                            const domainToOpen = `${scheme}://${authority}`;
                            const pickedDomains = await configureOpenerTrustedDomainsHandler(trustedDomains, domainToOpen, resourceUri, this._quickInputService, this._storageService, this._editorService, this._telemetryService);
                            if (pickedDomains.indexOf('*') !== -1) {
                                return true;
                            }
                            if (isURLDomainTrusted(resourceUri, pickedDomains)) {
                                return true;
                            }
                            return false;
                        }
                    }
                ],
                cancelButton: {
                    run: () => false
                }
            });
            return result;
        }
    }
};
OpenerValidatorContributions = __decorate([
    __param(0, IOpenerService),
    __param(1, IStorageService),
    __param(2, IDialogService),
    __param(3, IProductService),
    __param(4, IQuickInputService),
    __param(5, IEditorService),
    __param(6, IClipboardService),
    __param(7, ITelemetryService),
    __param(8, IInstantiationService),
    __param(9, IConfigurationService),
    __param(10, IWorkspaceTrustManagementService),
    __param(11, ITrustedDomainService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], OpenerValidatorContributions);
export { OpenerValidatorContributions };
