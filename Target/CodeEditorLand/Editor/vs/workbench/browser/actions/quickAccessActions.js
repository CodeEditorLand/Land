/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize, localize2 } from '../../../nls.js';
import { MenuId, Action2, registerAction2 } from '../../../platform/actions/common/actions.js';
import { KeybindingsRegistry } from '../../../platform/keybinding/common/keybindingsRegistry.js';
import { IQuickInputService, ItemActivation } from '../../../platform/quickinput/common/quickInput.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { CommandsRegistry } from '../../../platform/commands/common/commands.js';
import { inQuickPickContext, defaultQuickAccessContext, getQuickNavigateHandler } from '../quickaccess.js';
import { Codicon } from '../../../base/common/codicons.js';
//#region Quick access management commands and keys
const globalQuickAccessKeybinding = {
    primary: 2048 /* KeyMod.CtrlCmd */ | 46 /* KeyCode.KeyP */,
    secondary: [2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */],
    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 46 /* KeyCode.KeyP */, secondary: undefined }
};
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.action.closeQuickOpen',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: inQuickPickContext,
    primary: 9 /* KeyCode.Escape */, secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
    handler: accessor => {
        const quickInputService = accessor.get(IQuickInputService);
        return quickInputService.cancel();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.action.acceptSelectedQuickOpenItem',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: inQuickPickContext,
    primary: 0,
    handler: accessor => {
        const quickInputService = accessor.get(IQuickInputService);
        return quickInputService.accept();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.action.alternativeAcceptSelectedQuickOpenItem',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: inQuickPickContext,
    primary: 0,
    handler: accessor => {
        const quickInputService = accessor.get(IQuickInputService);
        return quickInputService.accept({ ctrlCmd: true, alt: false });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.action.focusQuickOpen',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: inQuickPickContext,
    primary: 0,
    handler: accessor => {
        const quickInputService = accessor.get(IQuickInputService);
        quickInputService.focus();
    }
});
const quickAccessNavigateNextInFilePickerId = 'workbench.action.quickOpenNavigateNextInFilePicker';
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: quickAccessNavigateNextInFilePickerId,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
    handler: getQuickNavigateHandler(quickAccessNavigateNextInFilePickerId, true),
    when: defaultQuickAccessContext,
    primary: globalQuickAccessKeybinding.primary,
    secondary: globalQuickAccessKeybinding.secondary,
    mac: globalQuickAccessKeybinding.mac
});
const quickAccessNavigatePreviousInFilePickerId = 'workbench.action.quickOpenNavigatePreviousInFilePicker';
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: quickAccessNavigatePreviousInFilePickerId,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
    handler: getQuickNavigateHandler(quickAccessNavigatePreviousInFilePickerId, false),
    when: defaultQuickAccessContext,
    primary: globalQuickAccessKeybinding.primary | 1024 /* KeyMod.Shift */,
    secondary: [globalQuickAccessKeybinding.secondary[0] | 1024 /* KeyMod.Shift */],
    mac: {
        primary: globalQuickAccessKeybinding.mac.primary | 1024 /* KeyMod.Shift */,
        secondary: undefined
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.action.quickPickManyToggle',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: inQuickPickContext,
    primary: 0,
    handler: accessor => {
        const quickInputService = accessor.get(IQuickInputService);
        quickInputService.toggle();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.action.quickInputBack',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
    when: inQuickPickContext,
    primary: 0,
    win: { primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
    mac: { primary: 256 /* KeyMod.WinCtrl */ | 88 /* KeyCode.Minus */ },
    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 88 /* KeyCode.Minus */ },
    handler: accessor => {
        const quickInputService = accessor.get(IQuickInputService);
        quickInputService.back();
    }
});
registerAction2(class QuickAccessAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.quickOpen',
            title: localize2('quickOpen', "Go to File..."),
            metadata: {
                description: `Quick access`,
                args: [{
                        name: 'prefix',
                        schema: {
                            'type': 'string'
                        }
                    }]
            },
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: globalQuickAccessKeybinding.primary,
                secondary: globalQuickAccessKeybinding.secondary,
                mac: globalQuickAccessKeybinding.mac
            },
            f1: true
        });
    }
    run(accessor, prefix) {
        const quickInputService = accessor.get(IQuickInputService);
        quickInputService.quickAccess.show(typeof prefix === 'string' ? prefix : undefined, { preserveValue: typeof prefix === 'string' /* preserve as is if provided */ });
    }
});
registerAction2(class QuickAccessAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.quickOpenWithModes',
            title: localize('quickOpenWithModes', "Quick Open"),
            icon: Codicon.search,
            menu: {
                id: MenuId.CommandCenterCenter,
                order: 100
            }
        });
    }
    run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        const providerOptions = {
            includeHelp: true,
            from: 'commandCenter',
        };
        quickInputService.quickAccess.show(undefined, {
            preserveValue: true,
            providerOptions
        });
    }
});
CommandsRegistry.registerCommand('workbench.action.quickOpenPreviousEditor', async (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show('', { itemActivation: ItemActivation.SECOND });
});
//#endregion
//#region Workbench actions
class BaseQuickAccessNavigateAction extends Action2 {
    constructor(id, title, next, quickNavigate, keybinding) {
        super({ id, title, f1: true, keybinding });
        this.id = id;
        this.next = next;
        this.quickNavigate = quickNavigate;
    }
    async run(accessor) {
        const keybindingService = accessor.get(IKeybindingService);
        const quickInputService = accessor.get(IQuickInputService);
        const keys = keybindingService.lookupKeybindings(this.id);
        const quickNavigate = this.quickNavigate ? { keybindings: keys } : undefined;
        quickInputService.navigate(this.next, quickNavigate);
    }
}
class QuickAccessNavigateNextAction extends BaseQuickAccessNavigateAction {
    constructor() {
        super('workbench.action.quickOpenNavigateNext', localize2('quickNavigateNext', 'Navigate Next in Quick Open'), true, true);
    }
}
class QuickAccessNavigatePreviousAction extends BaseQuickAccessNavigateAction {
    constructor() {
        super('workbench.action.quickOpenNavigatePrevious', localize2('quickNavigatePrevious', 'Navigate Previous in Quick Open'), false, true);
    }
}
class QuickAccessSelectNextAction extends BaseQuickAccessNavigateAction {
    constructor() {
        super('workbench.action.quickOpenSelectNext', localize2('quickSelectNext', 'Select Next in Quick Open'), true, false, {
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
            when: inQuickPickContext,
            primary: 0,
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */ }
        });
    }
}
class QuickAccessSelectPreviousAction extends BaseQuickAccessNavigateAction {
    constructor() {
        super('workbench.action.quickOpenSelectPrevious', localize2('quickSelectPrevious', 'Select Previous in Quick Open'), false, false, {
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
            when: inQuickPickContext,
            primary: 0,
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */ }
        });
    }
}
registerAction2(QuickAccessSelectNextAction);
registerAction2(QuickAccessSelectPreviousAction);
registerAction2(QuickAccessNavigateNextAction);
registerAction2(QuickAccessNavigatePreviousAction);
//#endregion
