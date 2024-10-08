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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { applyTextEditorOptions } from '../../../common/editor/editorOptions.js';
import { SimpleCommentEditor } from './simpleCommentEditor.js';
let CommentsInputContentProvider = class CommentsInputContentProvider extends Disposable {
    static { this.ID = 'comments.input.contentProvider'; }
    constructor(textModelService, codeEditorService, _modelService, _languageService) {
        super();
        this._modelService = _modelService;
        this._languageService = _languageService;
        this._register(textModelService.registerTextModelContentProvider(Schemas.commentsInput, this));
        this._register(codeEditorService.registerCodeEditorOpenHandler(async (input, editor, _sideBySide) => {
            if (!(editor instanceof SimpleCommentEditor)) {
                return null;
            }
            if (editor.getModel()?.uri.toString() !== input.resource.toString()) {
                return null;
            }
            if (input.options) {
                applyTextEditorOptions(input.options, editor, 1 /* ScrollType.Immediate */);
            }
            return editor;
        }));
    }
    async provideTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        return existing ?? this._modelService.createModel('', this._languageService.createById('markdown'), resource);
    }
};
CommentsInputContentProvider = __decorate([
    __param(0, ITextModelService),
    __param(1, ICodeEditorService),
    __param(2, IModelService),
    __param(3, ILanguageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CommentsInputContentProvider);
export { CommentsInputContentProvider };
