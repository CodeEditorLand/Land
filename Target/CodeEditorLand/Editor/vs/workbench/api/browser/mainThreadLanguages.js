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
import { URI } from '../../../base/common/uri.js';
import { ILanguageService } from '../../../editor/common/languages/language.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { MainContext, ExtHostContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { Range } from '../../../editor/common/core/range.js';
import { ITextModelService } from '../../../editor/common/services/resolverService.js';
import { ILanguageStatusService } from '../../services/languageStatus/common/languageStatusService.js';
import { DisposableMap, DisposableStore } from '../../../base/common/lifecycle.js';
let MainThreadLanguages = class MainThreadLanguages {
    constructor(_extHostContext, _languageService, _modelService, _resolverService, _languageStatusService) {
        this._languageService = _languageService;
        this._modelService = _modelService;
        this._resolverService = _resolverService;
        this._languageStatusService = _languageStatusService;
        this._disposables = new DisposableStore();
        this._status = new DisposableMap();
        this._proxy = _extHostContext.getProxy(ExtHostContext.ExtHostLanguages);
        this._proxy.$acceptLanguageIds(_languageService.getRegisteredLanguageIds());
        this._disposables.add(_languageService.onDidChange(_ => {
            this._proxy.$acceptLanguageIds(_languageService.getRegisteredLanguageIds());
        }));
    }
    dispose() {
        this._disposables.dispose();
        this._status.dispose();
    }
    async $changeLanguage(resource, languageId) {
        if (!this._languageService.isRegisteredLanguageId(languageId)) {
            return Promise.reject(new Error(`Unknown language id: ${languageId}`));
        }
        const uri = URI.revive(resource);
        const ref = await this._resolverService.createModelReference(uri);
        try {
            ref.object.textEditorModel.setLanguage(this._languageService.createById(languageId));
        }
        finally {
            ref.dispose();
        }
    }
    async $tokensAtPosition(resource, position) {
        const uri = URI.revive(resource);
        const model = this._modelService.getModel(uri);
        if (!model) {
            return undefined;
        }
        model.tokenization.tokenizeIfCheap(position.lineNumber);
        const tokens = model.tokenization.getLineTokens(position.lineNumber);
        const idx = tokens.findTokenIndexAtOffset(position.column - 1);
        return {
            type: tokens.getStandardTokenType(idx),
            range: new Range(position.lineNumber, 1 + tokens.getStartOffset(idx), position.lineNumber, 1 + tokens.getEndOffset(idx))
        };
    }
    // --- language status
    $setLanguageStatus(handle, status) {
        this._status.get(handle)?.dispose();
        this._status.set(handle, this._languageStatusService.addStatus(status));
    }
    $removeLanguageStatus(handle) {
        this._status.get(handle)?.dispose();
    }
};
MainThreadLanguages = __decorate([
    extHostNamedCustomer(MainContext.MainThreadLanguages),
    __param(1, ILanguageService),
    __param(2, IModelService),
    __param(3, ITextModelService),
    __param(4, ILanguageStatusService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], MainThreadLanguages);
export { MainThreadLanguages };
