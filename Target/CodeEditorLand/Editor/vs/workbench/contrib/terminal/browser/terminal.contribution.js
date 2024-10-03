import { Schemas } from '../../../../base/common/network.js';
import { isIOS, isWindows } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import './media/terminal.css';
import './media/terminalVoice.css';
import './media/widgets.css';
import './media/xterm.css';
import * as nls from '../../../../nls.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../platform/accessibility/common/accessibility.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { Extensions as DragAndDropExtensions } from '../../../../platform/dnd/browser/dnd.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ITerminalLogService } from '../../../../platform/terminal/common/terminal.js';
import { TerminalLogService } from '../../../../platform/terminal/common/terminalLogService.js';
import { registerTerminalPlatformConfiguration } from '../../../../platform/terminal/common/terminalPlatformConfiguration.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { EditorExtensions } from '../../../common/editor.js';
import { Extensions as ViewContainerExtensions } from '../../../common/views.js';
import { RemoteTerminalBackendContribution } from './remoteTerminalBackend.js';
import { ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService, terminalEditorId } from './terminal.js';
import { registerTerminalActions } from './terminalActions.js';
import { setupTerminalCommands } from './terminalCommands.js';
import { TerminalConfigurationService } from './terminalConfigurationService.js';
import { TerminalEditor } from './terminalEditor.js';
import { TerminalEditorInput } from './terminalEditorInput.js';
import { TerminalInputSerializer } from './terminalEditorSerializer.js';
import { TerminalEditorService } from './terminalEditorService.js';
import { TerminalGroupService } from './terminalGroupService.js';
import { terminalViewIcon } from './terminalIcons.js';
import { TerminalInstanceService } from './terminalInstanceService.js';
import { TerminalMainContribution } from './terminalMainContribution.js';
import { setupTerminalMenus } from './terminalMenus.js';
import { TerminalProfileService } from './terminalProfileService.js';
import { TerminalService } from './terminalService.js';
import { TerminalViewPane } from './terminalView.js';
import { ITerminalProfileService, TERMINAL_VIEW_ID } from '../common/terminal.js';
import { registerColors } from '../common/terminalColorRegistry.js';
import { registerTerminalConfiguration } from '../common/terminalConfiguration.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
import { terminalStrings } from '../common/terminalStrings.js';
import { registerSendSequenceKeybinding } from './terminalKeybindings.js';
registerSingleton(ITerminalLogService, TerminalLogService, 1);
registerSingleton(ITerminalConfigurationService, TerminalConfigurationService, 1);
registerSingleton(ITerminalService, TerminalService, 1);
registerSingleton(ITerminalEditorService, TerminalEditorService, 1);
registerSingleton(ITerminalGroupService, TerminalGroupService, 1);
registerSingleton(ITerminalInstanceService, TerminalInstanceService, 1);
registerSingleton(ITerminalProfileService, TerminalProfileService, 1);
registerWorkbenchContribution2(TerminalMainContribution.ID, TerminalMainContribution, 1);
registerWorkbenchContribution2(RemoteTerminalBackendContribution.ID, RemoteTerminalBackendContribution, 3);
registerTerminalPlatformConfiguration();
registerTerminalConfiguration();
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(TerminalEditorInput.ID, TerminalInputSerializer);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(TerminalEditor, terminalEditorId, terminalStrings.terminal), [
    new SyncDescriptor(TerminalEditorInput)
]);
Registry.as(DragAndDropExtensions.DragAndDropContribution).register({
    dataFormatKey: "Terminals",
    getEditorInputs(data) {
        const editors = [];
        try {
            const terminalEditors = JSON.parse(data);
            for (const terminalEditor of terminalEditors) {
                editors.push({ resource: URI.parse(terminalEditor) });
            }
        }
        catch (error) {
        }
        return editors;
    },
    setData(resources, event) {
        const terminalResources = resources.filter(({ resource }) => resource.scheme === Schemas.vscodeTerminal);
        if (terminalResources.length) {
            event.dataTransfer?.setData("Terminals", JSON.stringify(terminalResources.map(({ resource }) => resource.toString())));
        }
    }
});
const VIEW_CONTAINER = Registry.as(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
    id: TERMINAL_VIEW_ID,
    title: nls.localize2('terminal', "Terminal"),
    icon: terminalViewIcon,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [TERMINAL_VIEW_ID, { mergeViewWithContainerWhenSingleView: true }]),
    storageId: TERMINAL_VIEW_ID,
    hideIfEmpty: true,
    order: 3,
}, 1, { doNotRegisterOpenCommand: true, isDefault: true });
Registry.as(ViewContainerExtensions.ViewsRegistry).registerViews([{
        id: TERMINAL_VIEW_ID,
        name: nls.localize2('terminal', "Terminal"),
        containerIcon: terminalViewIcon,
        canToggleVisibility: false,
        canMoveView: true,
        ctorDescriptor: new SyncDescriptor(TerminalViewPane),
        openCommandActionDescriptor: {
            id: "workbench.action.terminal.toggleTerminal",
            mnemonicTitle: nls.localize({ key: 'miToggleIntegratedTerminal', comment: ['&& denotes a mnemonic'] }, "&&Terminal"),
            keybindings: {
                primary: 2048 | 91,
                mac: { primary: 256 | 91 }
            },
            order: 3
        }
    }], VIEW_CONTAINER);
registerTerminalActions();
if (isWindows) {
    registerSendSequenceKeybinding(String.fromCharCode('V'.charCodeAt(0) - 64), {
        when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType", "pwsh"), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
        primary: 2048 | 52
    });
}
registerSendSequenceKeybinding('\x1b[24~a', {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType", "pwsh"), TerminalContextKeys.terminalShellIntegrationEnabled, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
    primary: 2048 | 10,
    mac: { primary: 256 | 10 }
});
registerSendSequenceKeybinding('\x1b[24~b', {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType", "pwsh"), TerminalContextKeys.terminalShellIntegrationEnabled, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
    primary: 512 | 10
});
registerSendSequenceKeybinding('\x1b[24~c', {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType", "pwsh"), TerminalContextKeys.terminalShellIntegrationEnabled, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
    primary: 1024 | 3
});
registerSendSequenceKeybinding('\x1b[24~d', {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType", "pwsh"), TerminalContextKeys.terminalShellIntegrationEnabled, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
    mac: { primary: 1024 | 2048 | 17 }
});
registerSendSequenceKeybinding('\x1b[1;2H', {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType", "pwsh")),
    mac: { primary: 1024 | 2048 | 15 }
});
registerSendSequenceKeybinding('\x12', {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED),
    primary: 2048 | 512 | 48,
    mac: { primary: 256 | 512 | 48 }
});
registerSendSequenceKeybinding('\x07', {
    when: TerminalContextKeys.focus,
    primary: 2048 | 512 | 37,
    mac: { primary: 256 | 512 | 37 }
});
if (isIOS) {
    registerSendSequenceKeybinding(String.fromCharCode('C'.charCodeAt(0) - 64), {
        when: ContextKeyExpr.and(TerminalContextKeys.focus),
        primary: 256 | 33
    });
}
registerSendSequenceKeybinding(String.fromCharCode('W'.charCodeAt(0) - 64), {
    primary: 2048 | 1,
    mac: { primary: 512 | 1 }
});
if (isWindows) {
    registerSendSequenceKeybinding(String.fromCharCode('H'.charCodeAt(0) - 64), {
        when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType", "cmd")),
        primary: 2048 | 1,
    });
}
registerSendSequenceKeybinding('\u001bd', {
    primary: 2048 | 20,
    mac: { primary: 512 | 20 }
});
registerSendSequenceKeybinding('\u0015', {
    mac: { primary: 2048 | 1 }
});
registerSendSequenceKeybinding(String.fromCharCode('A'.charCodeAt(0) - 64), {
    mac: { primary: 2048 | 15 }
});
registerSendSequenceKeybinding(String.fromCharCode('E'.charCodeAt(0) - 64), {
    mac: { primary: 2048 | 17 }
});
registerSendSequenceKeybinding('\u0000', {
    primary: 2048 | 1024 | 23,
    mac: { primary: 256 | 1024 | 23 }
});
registerSendSequenceKeybinding('\u001e', {
    primary: 2048 | 1024 | 27,
    mac: { primary: 256 | 1024 | 27 }
});
registerSendSequenceKeybinding('\u001f', {
    primary: 2048 | 90,
    mac: { primary: 256 | 90 }
});
setupTerminalCommands();
setupTerminalMenus();
registerColors();
