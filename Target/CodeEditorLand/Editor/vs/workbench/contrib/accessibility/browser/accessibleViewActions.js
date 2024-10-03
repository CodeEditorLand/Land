import { Codicon } from '../../../../base/common/codicons.js';
import { MultiCommand } from '../../../../editor/browser/editorExtensions.js';
import { localize } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { accessibilityHelpIsShown, accessibleViewContainsCodeBlocks, accessibleViewCurrentProviderId, accessibleViewGoToSymbolSupported, accessibleViewHasAssignedKeybindings, accessibleViewHasUnassignedKeybindings, accessibleViewIsShown, accessibleViewSupportsNavigation, accessibleViewVerbosityEnabled } from './accessibilityConfiguration.js';
import { IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { InlineCompletionsController } from '../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js';
const accessibleViewMenu = {
    id: MenuId.AccessibleView,
    group: 'navigation',
    when: accessibleViewIsShown
};
const commandPalette = {
    id: MenuId.CommandPalette,
    group: '',
    order: 1
};
class AccessibleViewNextAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibleViewNext",
            precondition: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewSupportsNavigation),
            keybinding: {
                primary: 512 | 94,
                weight: 200
            },
            menu: [
                commandPalette,
                {
                    ...accessibleViewMenu,
                    when: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewSupportsNavigation),
                }
            ],
            icon: Codicon.arrowDown,
            title: localize('editor.action.accessibleViewNext', "Show Next in Accessible View")
        });
    }
    run(accessor) {
        accessor.get(IAccessibleViewService).next();
    }
}
registerAction2(AccessibleViewNextAction);
class AccessibleViewNextCodeBlockAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibleViewNextCodeBlock",
            precondition: ContextKeyExpr.and(accessibleViewContainsCodeBlocks, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "panelChat")),
            keybinding: {
                primary: 2048 | 512 | 12,
                mac: { primary: 2048 | 512 | 12, },
                weight: 200,
            },
            icon: Codicon.arrowRight,
            menu: {
                ...accessibleViewMenu,
                when: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewContainsCodeBlocks),
            },
            title: localize('editor.action.accessibleViewNextCodeBlock', "Accessible View: Next Code Block")
        });
    }
    run(accessor) {
        accessor.get(IAccessibleViewService).navigateToCodeBlock('next');
    }
}
registerAction2(AccessibleViewNextCodeBlockAction);
class AccessibleViewPreviousCodeBlockAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibleViewPreviousCodeBlock",
            precondition: ContextKeyExpr.and(accessibleViewContainsCodeBlocks, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "panelChat")),
            keybinding: {
                primary: 2048 | 512 | 11,
                mac: { primary: 2048 | 512 | 11, },
                weight: 200,
            },
            icon: Codicon.arrowLeft,
            menu: {
                ...accessibleViewMenu,
                when: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewContainsCodeBlocks),
            },
            title: localize('editor.action.accessibleViewPreviousCodeBlock', "Accessible View: Previous Code Block")
        });
    }
    run(accessor) {
        accessor.get(IAccessibleViewService).navigateToCodeBlock('previous');
    }
}
registerAction2(AccessibleViewPreviousCodeBlockAction);
class AccessibleViewPreviousAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibleViewPrevious",
            precondition: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewSupportsNavigation),
            keybinding: {
                primary: 512 | 92,
                weight: 200
            },
            icon: Codicon.arrowUp,
            menu: [
                commandPalette,
                {
                    ...accessibleViewMenu,
                    when: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewSupportsNavigation),
                }
            ],
            title: localize('editor.action.accessibleViewPrevious', "Show Previous in Accessible View")
        });
    }
    run(accessor) {
        accessor.get(IAccessibleViewService).previous();
    }
}
registerAction2(AccessibleViewPreviousAction);
class AccessibleViewGoToSymbolAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibleViewGoToSymbol",
            precondition: ContextKeyExpr.and(ContextKeyExpr.or(accessibleViewIsShown, accessibilityHelpIsShown), accessibleViewGoToSymbolSupported),
            keybinding: {
                primary: 2048 | 1024 | 45,
                secondary: [2048 | 1024 | 89],
                weight: 200 + 10
            },
            icon: Codicon.symbolField,
            menu: [
                commandPalette,
                {
                    ...accessibleViewMenu,
                    when: ContextKeyExpr.and(ContextKeyExpr.or(accessibleViewIsShown, accessibilityHelpIsShown), accessibleViewGoToSymbolSupported),
                }
            ],
            title: localize('editor.action.accessibleViewGoToSymbol', "Go To Symbol in Accessible View")
        });
    }
    run(accessor) {
        accessor.get(IAccessibleViewService).goToSymbol();
    }
}
registerAction2(AccessibleViewGoToSymbolAction);
function registerCommand(command) {
    command.register();
    return command;
}
export const AccessibilityHelpAction = registerCommand(new MultiCommand({
    id: "editor.action.accessibilityHelp",
    precondition: undefined,
    kbOpts: {
        primary: 512 | 59,
        weight: 200,
        linux: {
            primary: 512 | 1024 | 59,
            secondary: [512 | 59]
        },
        kbExpr: accessibilityHelpIsShown.toNegated()
    },
    menuOpts: [{
            menuId: MenuId.CommandPalette,
            group: '',
            title: localize('editor.action.accessibilityHelp', "Open Accessibility Help"),
            order: 1
        }],
}));
export const AccessibleViewAction = registerCommand(new MultiCommand({
    id: "editor.action.accessibleView",
    precondition: undefined,
    kbOpts: {
        primary: 512 | 60,
        weight: 200,
        linux: {
            primary: 512 | 1024 | 60,
            secondary: [512 | 60]
        }
    },
    menuOpts: [{
            menuId: MenuId.CommandPalette,
            group: '',
            title: localize('editor.action.accessibleView', "Open Accessible View"),
            order: 1
        }],
}));
class AccessibleViewDisableHintAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibleViewDisableHint",
            precondition: ContextKeyExpr.and(ContextKeyExpr.or(accessibleViewIsShown, accessibilityHelpIsShown), accessibleViewVerbosityEnabled),
            keybinding: {
                primary: 512 | 64,
                weight: 200
            },
            icon: Codicon.bellSlash,
            menu: [
                commandPalette,
                {
                    id: MenuId.AccessibleView,
                    group: 'navigation',
                    when: ContextKeyExpr.and(ContextKeyExpr.or(accessibleViewIsShown, accessibilityHelpIsShown), accessibleViewVerbosityEnabled),
                }
            ],
            title: localize('editor.action.accessibleViewDisableHint', "Disable Accessible View Hint")
        });
    }
    run(accessor) {
        accessor.get(IAccessibleViewService).disableHint();
    }
}
registerAction2(AccessibleViewDisableHintAction);
class AccessibilityHelpConfigureKeybindingsAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibilityHelpConfigureKeybindings",
            precondition: ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewHasUnassignedKeybindings),
            icon: Codicon.key,
            keybinding: {
                primary: 512 | 41,
                weight: 200
            },
            menu: [
                {
                    id: MenuId.AccessibleView,
                    group: 'navigation',
                    order: 3,
                    when: accessibleViewHasUnassignedKeybindings,
                }
            ],
            title: localize('editor.action.accessibilityHelpConfigureUnassignedKeybindings', "Accessibility Help Configure Unassigned Keybindings")
        });
    }
    async run(accessor) {
        await accessor.get(IAccessibleViewService).configureKeybindings(true);
    }
}
registerAction2(AccessibilityHelpConfigureKeybindingsAction);
class AccessibilityHelpConfigureAssignedKeybindingsAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibilityHelpConfigureAssignedKeybindings",
            precondition: ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewHasAssignedKeybindings),
            icon: Codicon.key,
            keybinding: {
                primary: 512 | 31,
                weight: 200
            },
            menu: [
                {
                    id: MenuId.AccessibleView,
                    group: 'navigation',
                    order: 4,
                    when: accessibleViewHasAssignedKeybindings,
                }
            ],
            title: localize('editor.action.accessibilityHelpConfigureAssignedKeybindings', "Accessibility Help Configure Assigned Keybindings")
        });
    }
    async run(accessor) {
        await accessor.get(IAccessibleViewService).configureKeybindings(false);
    }
}
registerAction2(AccessibilityHelpConfigureAssignedKeybindingsAction);
class AccessibilityHelpOpenHelpLinkAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibilityHelpOpenHelpLink",
            precondition: ContextKeyExpr.and(accessibilityHelpIsShown),
            keybinding: {
                primary: 512 | 38,
                weight: 200
            },
            title: localize('editor.action.accessibilityHelpOpenHelpLink', "Accessibility Help Open Help Link")
        });
    }
    run(accessor) {
        accessor.get(IAccessibleViewService).openHelpLink();
    }
}
registerAction2(AccessibilityHelpOpenHelpLinkAction);
class AccessibleViewAcceptInlineCompletionAction extends Action2 {
    constructor() {
        super({
            id: "editor.action.accessibleViewAcceptInlineCompletion",
            precondition: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "inlineCompletions")),
            keybinding: {
                primary: 2048 | 90,
                mac: { primary: 256 | 90 },
                weight: 200
            },
            icon: Codicon.check,
            menu: [
                commandPalette,
                {
                    id: MenuId.AccessibleView,
                    group: 'navigation',
                    order: 0,
                    when: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "inlineCompletions"))
                }
            ],
            title: localize('editor.action.accessibleViewAcceptInlineCompletionAction', "Accept Inline Completion")
        });
    }
    async run(accessor) {
        const codeEditorService = accessor.get(ICodeEditorService);
        const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
        if (!editor) {
            return;
        }
        const model = InlineCompletionsController.get(editor)?.model.get();
        const state = model?.state.get();
        if (!model || !state) {
            return;
        }
        await model.accept(editor);
        model.stop();
        editor.focus();
    }
}
registerAction2(AccessibleViewAcceptInlineCompletionAction);
