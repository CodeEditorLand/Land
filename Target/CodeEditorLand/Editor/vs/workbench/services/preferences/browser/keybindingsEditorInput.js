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
var KeybindingsEditorInput_1;
import { Codicon } from '../../../../base/common/codicons.js';
import { OS } from '../../../../base/common/platform.js';
import * as nls from '../../../../nls.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { KeybindingsEditorModel } from './keybindingsEditorModel.js';
const KeybindingsEditorIcon = registerIcon('keybindings-editor-label-icon', Codicon.keyboard, nls.localize('keybindingsEditorLabelIcon', 'Icon of the keybindings editor label.'));
let KeybindingsEditorInput = class KeybindingsEditorInput extends EditorInput {
    static { KeybindingsEditorInput_1 = this; }
    static { this.ID = 'workbench.input.keybindings'; }
    constructor(instantiationService) {
        super();
        this.searchOptions = null;
        this.resource = undefined;
        this.keybindingsModel = instantiationService.createInstance(KeybindingsEditorModel, OS);
    }
    get typeId() {
        return KeybindingsEditorInput_1.ID;
    }
    getName() {
        return nls.localize('keybindingsInputName', "Keyboard Shortcuts");
    }
    getIcon() {
        return KeybindingsEditorIcon;
    }
    async resolve() {
        return this.keybindingsModel;
    }
    matches(otherInput) {
        return otherInput instanceof KeybindingsEditorInput_1;
    }
    dispose() {
        this.keybindingsModel.dispose();
        super.dispose();
    }
};
KeybindingsEditorInput = KeybindingsEditorInput_1 = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], KeybindingsEditorInput);
export { KeybindingsEditorInput };
