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
import { isNonEmptyArray } from '../../../../base/common/arrays.js';
import { localize } from '../../../../nls.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { allApiProposals } from '../../../../platform/extensions/common/extensionsApiProposals.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { Extensions } from '../../extensionManagement/common/extensionFeatures.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
let ExtensionsProposedApi = class ExtensionsProposedApi {
    constructor(_logService, _environmentService, productService) {
        this._logService = _logService;
        this._environmentService = _environmentService;
        this._envEnabledExtensions = new Set((_environmentService.extensionEnabledProposedApi ?? []).map(id => ExtensionIdentifier.toKey(id)));
        this._envEnablesProposedApiForAll =
            !_environmentService.isBuilt ||
                (_environmentService.isExtensionDevelopment && productService.quality !== 'stable') ||
                (this._envEnabledExtensions.size === 0 && Array.isArray(_environmentService.extensionEnabledProposedApi));
        this._productEnabledExtensions = new Map();
        if (productService.extensionEnabledApiProposals) {
            for (const [k, value] of Object.entries(productService.extensionEnabledApiProposals)) {
                const key = ExtensionIdentifier.toKey(k);
                const proposalNames = value.filter(name => {
                    if (!allApiProposals[name]) {
                        _logService.warn(`Via 'product.json#extensionEnabledApiProposals' extension '${key}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
                        return false;
                    }
                    return true;
                });
                this._productEnabledExtensions.set(key, proposalNames);
            }
        }
    }
    updateEnabledApiProposals(extensions) {
        for (const extension of extensions) {
            this.doUpdateEnabledApiProposals(extension);
        }
    }
    doUpdateEnabledApiProposals(extension) {
        const key = ExtensionIdentifier.toKey(extension.identifier);
        if (isNonEmptyArray(extension.enabledApiProposals)) {
            extension.enabledApiProposals = extension.enabledApiProposals.filter(name => {
                const result = Boolean(allApiProposals[name]);
                if (!result) {
                    this._logService.error(`Extension '${key}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
                }
                return result;
            });
        }
        if (this._productEnabledExtensions.has(key)) {
            const productEnabledProposals = this._productEnabledExtensions.get(key);
            const productSet = new Set(productEnabledProposals);
            const extensionSet = new Set(extension.enabledApiProposals);
            const diff = new Set([...extensionSet].filter(a => !productSet.has(a)));
            if (diff.size > 0) {
                this._logService.error(`Extension '${key}' appears in product.json but enables LESS API proposals than the extension wants.\npackage.json (LOSES): ${[...extensionSet].join(', ')}\nproduct.json (WINS): ${[...productSet].join(', ')}`);
                if (this._environmentService.isExtensionDevelopment) {
                    this._logService.error(`Proceeding with EXTRA proposals (${[...diff].join(', ')}) because extension is in development mode. Still, this EXTENSION WILL BE BROKEN unless product.json is updated.`);
                    productEnabledProposals.push(...diff);
                }
            }
            extension.enabledApiProposals = productEnabledProposals;
            return;
        }
        if (this._envEnablesProposedApiForAll || this._envEnabledExtensions.has(key)) {
            return;
        }
        if (!extension.isBuiltin && isNonEmptyArray(extension.enabledApiProposals)) {
            this._logService.error(`Extension '${extension.identifier.value} CANNOT USE these API proposals '${extension.enabledApiProposals?.join(', ') || '*'}'. You MUST start in extension development mode or use the --enable-proposed-api command line flag`);
            extension.enabledApiProposals = [];
        }
    }
};
ExtensionsProposedApi = __decorate([
    __param(0, ILogService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExtensionsProposedApi);
export { ExtensionsProposedApi };
class ApiProposalsMarkdowneRenderer extends Disposable {
    constructor() {
        super(...arguments);
        this.type = 'markdown';
    }
    shouldRender(manifest) {
        return !!manifest.originalEnabledApiProposals?.length || !!manifest.enabledApiProposals?.length;
    }
    render(manifest) {
        const enabledApiProposals = manifest.originalEnabledApiProposals ?? manifest.enabledApiProposals ?? [];
        const data = new MarkdownString();
        if (enabledApiProposals.length) {
            for (const proposal of enabledApiProposals) {
                data.appendMarkdown(`- \`${proposal}\`\n`);
            }
        }
        return {
            data,
            dispose: () => { }
        };
    }
}
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
    id: 'enabledApiProposals',
    label: localize('enabledProposedAPIs', "API Proposals"),
    access: {
        canToggle: false
    },
    renderer: new SyncDescriptor(ApiProposalsMarkdowneRenderer),
});
