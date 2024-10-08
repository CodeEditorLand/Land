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
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { score } from '../../../../editor/common/languageSelector.js';
import { localize } from '../../../../nls.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
export const ShareProviderCountContext = new RawContextKey('shareProviderCount', 0, localize('shareProviderCount', "The number of available share providers"));
let ShareService = class ShareService {
    constructor(contextKeyService, labelService, quickInputService, codeEditorService, telemetryService) {
        this.contextKeyService = contextKeyService;
        this.labelService = labelService;
        this.quickInputService = quickInputService;
        this.codeEditorService = codeEditorService;
        this.telemetryService = telemetryService;
        this._providers = new Set();
        this.providerCount = ShareProviderCountContext.bindTo(this.contextKeyService);
    }
    registerShareProvider(provider) {
        this._providers.add(provider);
        this.providerCount.set(this._providers.size);
        return {
            dispose: () => {
                this._providers.delete(provider);
                this.providerCount.set(this._providers.size);
            }
        };
    }
    getShareActions() {
        // todo@joyceerhl return share actions
        return [];
    }
    async provideShare(item, token) {
        const language = this.codeEditorService.getActiveCodeEditor()?.getModel()?.getLanguageId() ?? '';
        const providers = [...this._providers.values()]
            .filter((p) => score(p.selector, item.resourceUri, language, true, undefined, undefined) > 0)
            .sort((a, b) => a.priority - b.priority);
        if (providers.length === 0) {
            return undefined;
        }
        if (providers.length === 1) {
            this.telemetryService.publicLog2('shareService.share', { providerId: providers[0].id });
            return providers[0].provideShare(item, token);
        }
        const items = providers.map((p) => ({ label: p.label, provider: p }));
        const selected = await this.quickInputService.pick(items, { canPickMany: false, placeHolder: localize('type to filter', 'Choose how to share {0}', this.labelService.getUriLabel(item.resourceUri)) }, token);
        if (selected !== undefined) {
            this.telemetryService.publicLog2('shareService.share', { providerId: selected.provider.id });
            return selected.provider.provideShare(item, token);
        }
        return;
    }
};
ShareService = __decorate([
    __param(0, IContextKeyService),
    __param(1, ILabelService),
    __param(2, IQuickInputService),
    __param(3, ICodeEditorService),
    __param(4, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ShareService);
export { ShareService };
