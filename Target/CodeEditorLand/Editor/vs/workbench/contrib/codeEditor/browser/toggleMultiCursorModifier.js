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
import { isMacintosh } from '../../../../base/common/platform.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
export class ToggleMultiCursorModifierAction extends Action2 {
    static { this.ID = 'workbench.action.toggleMultiCursorModifier'; }
    static { this.multiCursorModifierConfigurationKey = 'editor.multiCursorModifier'; }
    constructor() {
        super({
            id: ToggleMultiCursorModifierAction.ID,
            title: localize2('toggleLocation', 'Toggle Multi-Cursor Modifier'),
            f1: true
        });
    }
    run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        const editorConf = configurationService.getValue('editor');
        const newValue = (editorConf.multiCursorModifier === 'ctrlCmd' ? 'alt' : 'ctrlCmd');
        return configurationService.updateValue(ToggleMultiCursorModifierAction.multiCursorModifierConfigurationKey, newValue);
    }
}
const multiCursorModifier = new RawContextKey('multiCursorModifier', 'altKey');
let MultiCursorModifierContextKeyController = class MultiCursorModifierContextKeyController extends Disposable {
    constructor(configurationService, contextKeyService) {
        super();
        this.configurationService = configurationService;
        this._multiCursorModifier = multiCursorModifier.bindTo(contextKeyService);
        this._update();
        this._register(configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('editor.multiCursorModifier')) {
                this._update();
            }
        }));
    }
    _update() {
        const editorConf = this.configurationService.getValue('editor');
        const value = (editorConf.multiCursorModifier === 'ctrlCmd' ? 'ctrlCmd' : 'altKey');
        this._multiCursorModifier.set(value);
    }
};
MultiCursorModifierContextKeyController = __decorate([
    __param(0, IConfigurationService),
    __param(1, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object])
], MultiCursorModifierContextKeyController);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(MultiCursorModifierContextKeyController, 3 /* LifecyclePhase.Restored */);
registerAction2(ToggleMultiCursorModifierAction);
MenuRegistry.appendMenuItem(MenuId.MenubarSelectionMenu, {
    group: '4_config',
    command: {
        id: ToggleMultiCursorModifierAction.ID,
        title: localize('miMultiCursorAlt', "Switch to Alt+Click for Multi-Cursor")
    },
    when: multiCursorModifier.isEqualTo('ctrlCmd'),
    order: 1
});
MenuRegistry.appendMenuItem(MenuId.MenubarSelectionMenu, {
    group: '4_config',
    command: {
        id: ToggleMultiCursorModifierAction.ID,
        title: (isMacintosh
            ? localize('miMultiCursorCmd', "Switch to Cmd+Click for Multi-Cursor")
            : localize('miMultiCursorCtrl', "Switch to Ctrl+Click for Multi-Cursor"))
    },
    when: multiCursorModifier.isEqualTo('altKey'),
    order: 1
});
