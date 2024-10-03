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
import { BrowserFeatures } from '../../../../base/browser/canIUse.js';
import { Action } from '../../../../base/common/actions.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { KeyChord } from '../../../../base/common/keyCodes.js';
import { Schemas } from '../../../../base/common/network.js';
import { isLinux, isWindows } from '../../../../base/common/platform.js';
import { isObject, isString } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { localize, localize2 } from '../../../../nls.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../platform/accessibility/common/accessibility.js';
import { Action2, registerAction2, MenuId } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IListService } from '../../../../platform/list/browser/listService.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { TerminalExitReason, TerminalLocation } from '../../../../platform/terminal/common/terminal.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from '../../../browser/actions/workspaceCommands.js';
import { CLOSE_EDITOR_COMMAND_ID } from '../../../browser/parts/editor/editorCommands.js';
import { ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from './terminal.js';
import { ITerminalProfileResolverService, ITerminalProfileService, TERMINAL_VIEW_ID } from '../common/terminal.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
import { createProfileSchemaEnums } from '../../../../platform/terminal/common/terminalProfiles.js';
import { terminalStrings } from '../common/terminalStrings.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { isAbsolute } from '../../../../base/common/path.js';
import { AbstractVariableResolverService } from '../../../services/configurationResolver/common/variableResolver.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { getIconId, getColorClass, getUriClasses } from './terminalIcon.js';
import { clearShellFileHistory, getCommandHistory } from '../common/history.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { dirname } from '../../../../base/common/resources.js';
import { getIconClasses } from '../../../../editor/common/services/getIconClasses.js';
import { FileKind } from '../../../../platform/files/common/files.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { killTerminalIcon, newTerminalIcon } from './terminalIcons.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { accessibleViewCurrentProviderId, accessibleViewIsShown, accessibleViewOnLastLine } from '../../accessibility/browser/accessibilityConfiguration.js';
import { isKeyboardEvent, isMouseEvent, isPointerEvent } from '../../../../base/browser/dom.js';
import { editorGroupToColumn } from '../../../services/editor/common/editorGroupColumn.js';
import { InstanceContext } from './terminalContextMenu.js';
export const switchTerminalActionViewItemSeparator = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
export const switchTerminalShowTabsTitle = localize('showTerminalTabs', "Show Tabs");
const category = terminalStrings.actionCategory;
const sharedWhenClause = (() => {
    const terminalAvailable = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);
    return {
        terminalAvailable,
        terminalAvailable_and_opened: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.isOpen),
        terminalAvailable_and_editorActive: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.terminalEditorActive),
        terminalAvailable_and_singularSelection: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.tabsSingularSelection),
        focusInAny_and_normalBuffer: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.altBufferActive.negate())
    };
})();
export async function getCwdForSplit(instance, folders, commandService, configService) {
    switch (configService.config.splitCwd) {
        case 'workspaceRoot':
            if (folders !== undefined && commandService !== undefined) {
                if (folders.length === 1) {
                    return folders[0].uri;
                }
                else if (folders.length > 1) {
                    const options = {
                        placeHolder: localize('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                    };
                    const workspace = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                    if (!workspace) {
                        return undefined;
                    }
                    return Promise.resolve(workspace.uri);
                }
            }
            return '';
        case 'initial':
            return instance.getInitialCwd();
        case 'inherited':
            return instance.getCwd();
    }
}
export const terminalSendSequenceCommand = async (accessor, args) => {
    const instance = accessor.get(ITerminalService).activeInstance;
    if (instance) {
        const text = isObject(args) && 'text' in args ? toOptionalString(args.text) : undefined;
        if (!text) {
            return;
        }
        const configurationResolverService = accessor.get(IConfigurationResolverService);
        const workspaceContextService = accessor.get(IWorkspaceContextService);
        const historyService = accessor.get(IHistoryService);
        const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(instance.isRemote ? Schemas.vscodeRemote : Schemas.file);
        const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
        const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, text);
        instance.sendText(resolvedText, false);
    }
};
let TerminalLaunchHelpAction = class TerminalLaunchHelpAction extends Action {
    constructor(_openerService) {
        super('workbench.action.terminal.launchHelp', localize('terminalLaunchHelp', "Open Help"));
        this._openerService = _openerService;
    }
    async run() {
        this._openerService.open('https://aka.ms/vscode-troubleshoot-terminal-launch');
    }
};
TerminalLaunchHelpAction = __decorate([
    __param(0, IOpenerService),
    __metadata("design:paramtypes", [Object])
], TerminalLaunchHelpAction);
export { TerminalLaunchHelpAction };
export function registerTerminalAction(options) {
    options.f1 = options.f1 ?? true;
    options.category = options.category ?? category;
    options.precondition = options.precondition ?? TerminalContextKeys.processSupported;
    const runFunc = options.run;
    const strictOptions = options;
    delete strictOptions['run'];
    return registerAction2(class extends Action2 {
        constructor() {
            super(strictOptions);
        }
        run(accessor, args, args2) {
            return runFunc(getTerminalServices(accessor), accessor, args, args2);
        }
    });
}
function parseActionArgs(args) {
    if (Array.isArray(args)) {
        if (args.every(e => e instanceof InstanceContext)) {
            return args;
        }
    }
    else if (args instanceof InstanceContext) {
        return [args];
    }
    return undefined;
}
export function registerContextualInstanceAction(options) {
    const originalRun = options.run;
    return registerTerminalAction({
        ...options,
        run: async (c, accessor, focusedInstanceArgs, allInstanceArgs) => {
            let instances = getSelectedInstances2(accessor, allInstanceArgs);
            if (!instances) {
                const activeInstance = (options.activeInstanceType === 'view'
                    ? c.groupService
                    : options.activeInstanceType === 'editor' ?
                        c.editorService
                        : c.service).activeInstance;
                if (!activeInstance) {
                    return;
                }
                instances = [activeInstance];
            }
            const results = [];
            for (const instance of instances) {
                results.push(originalRun(instance, c, accessor, focusedInstanceArgs));
            }
            await Promise.all(results);
            if (options.runAfter) {
                options.runAfter(instances, c, accessor, focusedInstanceArgs);
            }
        }
    });
}
export function registerActiveInstanceAction(options) {
    const originalRun = options.run;
    return registerTerminalAction({
        ...options,
        run: (c, accessor, args) => {
            const activeInstance = c.service.activeInstance;
            if (activeInstance) {
                return originalRun(activeInstance, c, accessor, args);
            }
        }
    });
}
export function registerActiveXtermAction(options) {
    const originalRun = options.run;
    return registerTerminalAction({
        ...options,
        run: (c, accessor, args) => {
            const activeDetached = Iterable.find(c.service.detachedInstances, d => d.xterm.isFocused);
            if (activeDetached) {
                return originalRun(activeDetached.xterm, accessor, activeDetached, args);
            }
            const activeInstance = c.service.activeInstance;
            if (activeInstance?.xterm) {
                return originalRun(activeInstance.xterm, accessor, activeInstance, args);
            }
        }
    });
}
function getTerminalServices(accessor) {
    return {
        service: accessor.get(ITerminalService),
        configService: accessor.get(ITerminalConfigurationService),
        groupService: accessor.get(ITerminalGroupService),
        instanceService: accessor.get(ITerminalInstanceService),
        editorService: accessor.get(ITerminalEditorService),
        profileService: accessor.get(ITerminalProfileService),
        profileResolverService: accessor.get(ITerminalProfileResolverService)
    };
}
export function registerTerminalActions() {
    registerTerminalAction({
        id: "workbench.action.terminal.newInActiveWorkspace",
        title: localize2('workbench.action.terminal.newInActiveWorkspace', 'Create New Terminal (In Active Workspace)'),
        run: async (c) => {
            if (c.service.isProcessSupportRegistered) {
                const instance = await c.service.createTerminal({ location: c.service.defaultLocation });
                if (!instance) {
                    return;
                }
                c.service.setActiveInstance(instance);
            }
            await c.groupService.showPanel(true);
        }
    });
    refreshTerminalActions([]);
    registerTerminalAction({
        id: "workbench.action.createTerminalEditor",
        title: localize2('workbench.action.terminal.createTerminalEditor', 'Create New Terminal in Editor Area'),
        run: async (c, _, args) => {
            const options = (isObject(args) && 'location' in args) ? args : { location: TerminalLocation.Editor };
            const instance = await c.service.createTerminal(options);
            await instance.focusWhenReady();
        }
    });
    registerTerminalAction({
        id: "workbench.action.createTerminalEditorSameGroup",
        title: localize2('workbench.action.terminal.createTerminalEditor', 'Create New Terminal in Editor Area'),
        f1: false,
        run: async (c, accessor, args) => {
            const editorGroupsService = accessor.get(IEditorGroupsService);
            const instance = await c.service.createTerminal({
                location: { viewColumn: editorGroupToColumn(editorGroupsService, editorGroupsService.activeGroup) }
            });
            await instance.focusWhenReady();
        }
    });
    registerTerminalAction({
        id: "workbench.action.createTerminalEditorSide",
        title: localize2('workbench.action.terminal.createTerminalEditorSide', 'Create New Terminal in Editor Area to the Side'),
        run: async (c) => {
            const instance = await c.service.createTerminal({
                location: { viewColumn: SIDE_GROUP }
            });
            await instance.focusWhenReady();
        }
    });
    registerContextualInstanceAction({
        id: "workbench.action.terminal.moveToEditor",
        title: terminalStrings.moveToEditor,
        precondition: sharedWhenClause.terminalAvailable_and_opened,
        activeInstanceType: 'view',
        run: (instance, c) => c.service.moveToEditor(instance),
        runAfter: (instances) => instances.at(-1)?.focus()
    });
    registerContextualInstanceAction({
        id: "workbench.action.terminal.moveIntoNewWindow",
        title: terminalStrings.moveIntoNewWindow,
        precondition: sharedWhenClause.terminalAvailable_and_opened,
        run: (instance, c) => c.service.moveIntoNewEditor(instance),
        runAfter: (instances) => instances.at(-1)?.focus()
    });
    registerTerminalAction({
        id: "workbench.action.terminal.moveToTerminalPanel",
        title: terminalStrings.moveToTerminalPanel,
        precondition: sharedWhenClause.terminalAvailable_and_editorActive,
        run: (c, _, args) => {
            const source = toOptionalUri(args) ?? c.editorService.activeInstance;
            if (source) {
                c.service.moveToTerminalView(source);
            }
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.focusPreviousPane",
        title: localize2('workbench.action.terminal.focusPreviousPane', 'Focus Previous Terminal in Terminal Group'),
        keybinding: {
            primary: 512 | 15,
            secondary: [512 | 16],
            mac: {
                primary: 512 | 2048 | 15,
                secondary: [512 | 2048 | 16]
            },
            when: TerminalContextKeys.focus,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: async (c) => {
            c.groupService.activeGroup?.focusPreviousPane();
            await c.groupService.showPanel(true);
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.focusNextPane",
        title: localize2('workbench.action.terminal.focusNextPane', 'Focus Next Terminal in Terminal Group'),
        keybinding: {
            primary: 512 | 17,
            secondary: [512 | 18],
            mac: {
                primary: 512 | 2048 | 17,
                secondary: [512 | 2048 | 18]
            },
            when: TerminalContextKeys.focus,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: async (c) => {
            c.groupService.activeGroup?.focusNextPane();
            await c.groupService.showPanel(true);
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.runRecentCommand",
        title: localize2('workbench.action.terminal.runRecentCommand', 'Run Recent Command...'),
        precondition: sharedWhenClause.terminalAvailable,
        keybinding: [
            {
                primary: 2048 | 48,
                when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(TerminalContextKeys.focus, ContextKeyExpr.and(accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo("terminal")))),
                weight: 200
            },
            {
                primary: 2048 | 512 | 48,
                mac: { primary: 256 | 512 | 48 },
                when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                weight: 200
            }
        ],
        run: async (activeInstance, c) => {
            await activeInstance.runRecent('command');
            if (activeInstance?.target === TerminalLocation.Editor) {
                await c.editorService.revealActiveEditor();
            }
            else {
                await c.groupService.showPanel(false);
            }
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.copyLastCommand",
        title: localize2('workbench.action.terminal.copyLastCommand', "Copy Last Command"),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (instance, c, accessor) => {
            const clipboardService = accessor.get(IClipboardService);
            const commands = instance.capabilities.get(2)?.commands;
            if (!commands || commands.length === 0) {
                return;
            }
            const command = commands[commands.length - 1];
            if (!command.command) {
                return;
            }
            await clipboardService.writeText(command.command);
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.copyLastCommandOutput",
        title: localize2('workbench.action.terminal.copyLastCommandOutput', "Copy Last Command Output"),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (instance, c, accessor) => {
            const clipboardService = accessor.get(IClipboardService);
            const commands = instance.capabilities.get(2)?.commands;
            if (!commands || commands.length === 0) {
                return;
            }
            const command = commands[commands.length - 1];
            if (!command?.hasOutput()) {
                return;
            }
            const output = command.getOutput();
            if (isString(output)) {
                await clipboardService.writeText(output);
            }
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.copyLastCommandAndLastCommandOutput",
        title: localize2('workbench.action.terminal.copyLastCommandAndOutput', "Copy Last Command and Output"),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (instance, c, accessor) => {
            const clipboardService = accessor.get(IClipboardService);
            const commands = instance.capabilities.get(2)?.commands;
            if (!commands || commands.length === 0) {
                return;
            }
            const command = commands[commands.length - 1];
            if (!command?.hasOutput()) {
                return;
            }
            const output = command.getOutput();
            if (isString(output)) {
                await clipboardService.writeText(`${command.command !== '' ? command.command + '\n' : ''}${output}`);
            }
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.goToRecentDirectory",
        title: localize2('workbench.action.terminal.goToRecentDirectory', 'Go to Recent Directory...'),
        metadata: {
            description: localize2('goToRecentDirectory.metadata', 'Goes to a recent folder'),
        },
        precondition: sharedWhenClause.terminalAvailable,
        keybinding: {
            primary: 2048 | 37,
            when: TerminalContextKeys.focus,
            weight: 200
        },
        run: async (activeInstance, c) => {
            await activeInstance.runRecent('cwd');
            if (activeInstance?.target === TerminalLocation.Editor) {
                await c.editorService.revealActiveEditor();
            }
            else {
                await c.groupService.showPanel(false);
            }
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.resizePaneLeft",
        title: localize2('workbench.action.terminal.resizePaneLeft', 'Resize Terminal Left'),
        keybinding: {
            linux: { primary: 2048 | 1024 | 15 },
            mac: { primary: 2048 | 256 | 15 },
            when: TerminalContextKeys.focus,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (c) => c.groupService.activeGroup?.resizePane(0)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.resizePaneRight",
        title: localize2('workbench.action.terminal.resizePaneRight', 'Resize Terminal Right'),
        keybinding: {
            linux: { primary: 2048 | 1024 | 17 },
            mac: { primary: 2048 | 256 | 17 },
            when: TerminalContextKeys.focus,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (c) => c.groupService.activeGroup?.resizePane(1)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.resizePaneUp",
        title: localize2('workbench.action.terminal.resizePaneUp', 'Resize Terminal Up'),
        keybinding: {
            mac: { primary: 2048 | 256 | 16 },
            when: TerminalContextKeys.focus,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (c) => c.groupService.activeGroup?.resizePane(2)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.resizePaneDown",
        title: localize2('workbench.action.terminal.resizePaneDown', 'Resize Terminal Down'),
        keybinding: {
            mac: { primary: 2048 | 256 | 18 },
            when: TerminalContextKeys.focus,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (c) => c.groupService.activeGroup?.resizePane(3)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.focus",
        title: terminalStrings.focus,
        keybinding: {
            when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibleViewOnLastLine, accessibleViewCurrentProviderId.isEqualTo("terminal")),
            primary: 2048 | 18,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: async (c) => {
            const instance = c.service.activeInstance || await c.service.createTerminal({ location: TerminalLocation.Panel });
            if (!instance) {
                return;
            }
            c.service.setActiveInstance(instance);
            focusActiveTerminal(instance, c);
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.focusTabs",
        title: localize2('workbench.action.terminal.focus.tabsView', 'Focus Terminal Tabs View'),
        keybinding: {
            primary: 2048 | 1024 | 93,
            weight: 200,
            when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus),
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (c) => c.groupService.focusTabs()
    });
    registerTerminalAction({
        id: "workbench.action.terminal.focusNext",
        title: localize2('workbench.action.terminal.focusNext', 'Focus Next Terminal Group'),
        precondition: sharedWhenClause.terminalAvailable,
        keybinding: {
            primary: 2048 | 12,
            mac: {
                primary: 2048 | 1024 | 94
            },
            when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
            weight: 200
        },
        run: async (c) => {
            c.groupService.setActiveGroupToNext();
            await c.groupService.showPanel(true);
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.focusPrevious",
        title: localize2('workbench.action.terminal.focusPrevious', 'Focus Previous Terminal Group'),
        precondition: sharedWhenClause.terminalAvailable,
        keybinding: {
            primary: 2048 | 11,
            mac: {
                primary: 2048 | 1024 | 92
            },
            when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
            weight: 200
        },
        run: async (c) => {
            c.groupService.setActiveGroupToPrevious();
            await c.groupService.showPanel(true);
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.runSelectedText",
        title: localize2('workbench.action.terminal.runSelectedText', 'Run Selected Text In Active Terminal'),
        run: async (c, accessor) => {
            const codeEditorService = accessor.get(ICodeEditorService);
            const editor = codeEditorService.getActiveCodeEditor();
            if (!editor || !editor.hasModel()) {
                return;
            }
            const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
            const selection = editor.getSelection();
            let text;
            if (selection.isEmpty()) {
                text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
            }
            else {
                const endOfLinePreference = isWindows ? 1 : 2;
                text = editor.getModel().getValueInRange(selection, endOfLinePreference);
            }
            instance.sendText(text, true, true);
            await c.service.revealActiveTerminal(true);
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.runActiveFile",
        title: localize2('workbench.action.terminal.runActiveFile', 'Run Active File In Active Terminal'),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (c, accessor) => {
            const codeEditorService = accessor.get(ICodeEditorService);
            const notificationService = accessor.get(INotificationService);
            const workbenchEnvironmentService = accessor.get(IWorkbenchEnvironmentService);
            const editor = codeEditorService.getActiveCodeEditor();
            if (!editor || !editor.hasModel()) {
                return;
            }
            const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
            const isRemote = instance ? instance.isRemote : (workbenchEnvironmentService.remoteAuthority ? true : false);
            const uri = editor.getModel().uri;
            if ((!isRemote && uri.scheme !== Schemas.file && uri.scheme !== Schemas.vscodeUserData) || (isRemote && uri.scheme !== Schemas.vscodeRemote)) {
                notificationService.warn(localize('workbench.action.terminal.runActiveFile.noFile', 'Only files on disk can be run in the terminal'));
                return;
            }
            await instance.sendPath(uri, true);
            return c.groupService.showPanel();
        }
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.scrollDown",
        title: localize2('workbench.action.terminal.scrollDown', 'Scroll Down (Line)'),
        keybinding: {
            primary: 2048 | 512 | 12,
            linux: { primary: 2048 | 1024 | 18 },
            when: sharedWhenClause.focusInAny_and_normalBuffer,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (xterm) => xterm.scrollDownLine()
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.scrollDownPage",
        title: localize2('workbench.action.terminal.scrollDownPage', 'Scroll Down (Page)'),
        keybinding: {
            primary: 1024 | 12,
            mac: { primary: 12 },
            when: sharedWhenClause.focusInAny_and_normalBuffer,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (xterm) => xterm.scrollDownPage()
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.scrollToBottom",
        title: localize2('workbench.action.terminal.scrollToBottom', 'Scroll to Bottom'),
        keybinding: {
            primary: 2048 | 13,
            linux: { primary: 1024 | 13 },
            when: sharedWhenClause.focusInAny_and_normalBuffer,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (xterm) => xterm.scrollToBottom()
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.scrollUp",
        title: localize2('workbench.action.terminal.scrollUp', 'Scroll Up (Line)'),
        keybinding: {
            primary: 2048 | 512 | 11,
            linux: { primary: 2048 | 1024 | 16 },
            when: sharedWhenClause.focusInAny_and_normalBuffer,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (xterm) => xterm.scrollUpLine()
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.scrollUpPage",
        title: localize2('workbench.action.terminal.scrollUpPage', 'Scroll Up (Page)'),
        f1: true,
        category,
        keybinding: {
            primary: 1024 | 11,
            mac: { primary: 11 },
            when: sharedWhenClause.focusInAny_and_normalBuffer,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (xterm) => xterm.scrollUpPage()
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.scrollToTop",
        title: localize2('workbench.action.terminal.scrollToTop', 'Scroll to Top'),
        keybinding: {
            primary: 2048 | 14,
            linux: { primary: 1024 | 14 },
            when: sharedWhenClause.focusInAny_and_normalBuffer,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (xterm) => xterm.scrollToTop()
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.clearSelection",
        title: localize2('workbench.action.terminal.clearSelection', 'Clear Selection'),
        keybinding: {
            primary: 9,
            when: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.textSelected, TerminalContextKeys.notFindVisible),
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (xterm) => {
            if (xterm.hasSelection()) {
                xterm.clearSelection();
            }
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.changeIcon",
        title: terminalStrings.changeIcon,
        precondition: sharedWhenClause.terminalAvailable,
        run: (c, _, args) => getResourceOrActiveInstance(c, args)?.changeIcon()
    });
    registerTerminalAction({
        id: "workbench.action.terminal.changeIconActiveTab",
        title: terminalStrings.changeIcon,
        f1: false,
        precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
        run: async (c, accessor, args) => {
            let icon;
            if (c.groupService.lastAccessedMenu === 'inline-tab') {
                getResourceOrActiveInstance(c, args)?.changeIcon();
                return;
            }
            for (const terminal of getSelectedInstances(accessor) ?? []) {
                icon = await terminal.changeIcon(icon);
            }
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.changeColor",
        title: terminalStrings.changeColor,
        precondition: sharedWhenClause.terminalAvailable,
        run: (c, _, args) => getResourceOrActiveInstance(c, args)?.changeColor()
    });
    registerTerminalAction({
        id: "workbench.action.terminal.changeColorActiveTab",
        title: terminalStrings.changeColor,
        f1: false,
        precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
        run: async (c, accessor, args) => {
            let color;
            let i = 0;
            if (c.groupService.lastAccessedMenu === 'inline-tab') {
                getResourceOrActiveInstance(c, args)?.changeColor();
                return;
            }
            for (const terminal of getSelectedInstances(accessor) ?? []) {
                const skipQuickPick = i !== 0;
                color = await terminal.changeColor(color, skipQuickPick);
                i++;
            }
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.rename",
        title: terminalStrings.rename,
        precondition: sharedWhenClause.terminalAvailable,
        run: (c, accessor, args) => renameWithQuickPick(c, accessor, args)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.renameActiveTab",
        title: terminalStrings.rename,
        f1: false,
        keybinding: {
            primary: 60,
            mac: {
                primary: 3
            },
            when: ContextKeyExpr.and(TerminalContextKeys.tabsFocus),
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
        run: async (c, accessor) => {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const notificationService = accessor.get(INotificationService);
            const instances = getSelectedInstances(accessor);
            const firstInstance = instances?.[0];
            if (!firstInstance) {
                return;
            }
            if (terminalGroupService.lastAccessedMenu === 'inline-tab') {
                return renameWithQuickPick(c, accessor, firstInstance);
            }
            c.service.setEditingTerminal(firstInstance);
            c.service.setEditable(firstInstance, {
                validationMessage: value => validateTerminalName(value),
                onFinish: async (value, success) => {
                    c.service.setEditable(firstInstance, null);
                    c.service.setEditingTerminal(undefined);
                    if (success) {
                        const promises = [];
                        for (const instance of instances) {
                            promises.push((async () => {
                                await instance.rename(value);
                            })());
                        }
                        try {
                            await Promise.all(promises);
                        }
                        catch (e) {
                            notificationService.error(e);
                        }
                    }
                }
            });
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.detachSession",
        title: localize2('workbench.action.terminal.detachSession', 'Detach Session'),
        run: (activeInstance) => activeInstance.detachProcessAndDispose(TerminalExitReason.User)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.attachToSession",
        title: localize2('workbench.action.terminal.attachToSession', 'Attach to Session'),
        run: async (c, accessor) => {
            const quickInputService = accessor.get(IQuickInputService);
            const labelService = accessor.get(ILabelService);
            const remoteAgentService = accessor.get(IRemoteAgentService);
            const notificationService = accessor.get(INotificationService);
            const remoteAuthority = remoteAgentService.getConnection()?.remoteAuthority ?? undefined;
            const backend = await accessor.get(ITerminalInstanceService).getBackend(remoteAuthority);
            if (!backend) {
                throw new Error(`No backend registered for remote authority '${remoteAuthority}'`);
            }
            const terms = await backend.listProcesses();
            backend.reduceConnectionGraceTime();
            const unattachedTerms = terms.filter(term => !c.service.isAttachedToTerminal(term));
            const items = unattachedTerms.map(term => {
                const cwdLabel = labelService.getUriLabel(URI.file(term.cwd));
                return {
                    label: term.title,
                    detail: term.workspaceName ? `${term.workspaceName} \u2E31 ${cwdLabel}` : cwdLabel,
                    description: term.pid ? String(term.pid) : '',
                    term
                };
            });
            if (items.length === 0) {
                notificationService.info(localize('noUnattachedTerminals', 'There are no unattached terminals to attach to'));
                return;
            }
            const selected = await quickInputService.pick(items, { canPickMany: false });
            if (selected) {
                const instance = await c.service.createTerminal({
                    config: { attachPersistentProcess: selected.term }
                });
                c.service.setActiveInstance(instance);
                await focusActiveTerminal(instance, c);
            }
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.scrollToPreviousCommand",
        title: terminalStrings.scrollToPreviousCommand,
        keybinding: {
            primary: 2048 | 16,
            when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        icon: Codicon.arrowUp,
        menu: [
            {
                id: MenuId.ViewTitle,
                group: 'navigation',
                order: 4,
                when: ContextKeyExpr.equals('view', TERMINAL_VIEW_ID),
                isHiddenByDefault: true
            }
        ],
        run: (activeInstance) => activeInstance.xterm?.markTracker.scrollToPreviousMark(undefined, undefined, activeInstance.capabilities.has(2))
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.scrollToNextCommand",
        title: terminalStrings.scrollToNextCommand,
        keybinding: {
            primary: 2048 | 18,
            when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        icon: Codicon.arrowDown,
        menu: [
            {
                id: MenuId.ViewTitle,
                group: 'navigation',
                order: 4,
                when: ContextKeyExpr.equals('view', TERMINAL_VIEW_ID),
                isHiddenByDefault: true
            }
        ],
        run: (activeInstance) => {
            activeInstance.xterm?.markTracker.scrollToNextMark();
            activeInstance.focus();
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.selectToPreviousCommand",
        title: localize2('workbench.action.terminal.selectToPreviousCommand', 'Select To Previous Command'),
        keybinding: {
            primary: 2048 | 1024 | 16,
            when: TerminalContextKeys.focus,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (activeInstance) => {
            activeInstance.xterm?.markTracker.selectToPreviousMark();
            activeInstance.focus();
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.selectToNextCommand",
        title: localize2('workbench.action.terminal.selectToNextCommand', 'Select To Next Command'),
        keybinding: {
            primary: 2048 | 1024 | 18,
            when: TerminalContextKeys.focus,
            weight: 200
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: (activeInstance) => {
            activeInstance.xterm?.markTracker.selectToNextMark();
            activeInstance.focus();
        }
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.selectToPreviousLine",
        title: localize2('workbench.action.terminal.selectToPreviousLine', 'Select To Previous Line'),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (xterm, _, instance) => {
            xterm.markTracker.selectToPreviousLine();
            (instance || xterm).focus();
        }
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.selectToNextLine",
        title: localize2('workbench.action.terminal.selectToNextLine', 'Select To Next Line'),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (xterm, _, instance) => {
            xterm.markTracker.selectToNextLine();
            (instance || xterm).focus();
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.sendSequence",
        title: terminalStrings.sendSequence,
        f1: false,
        metadata: {
            description: terminalStrings.sendSequence.value,
            args: [{
                    name: 'args',
                    schema: {
                        type: 'object',
                        required: ['text'],
                        properties: {
                            text: {
                                description: localize('sendSequence', "The sequence of text to send to the terminal"),
                                type: 'string'
                            }
                        },
                    }
                }]
        },
        run: (c, accessor, args) => terminalSendSequenceCommand(accessor, args)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.newWithCwd",
        title: terminalStrings.newWithCwd,
        metadata: {
            description: terminalStrings.newWithCwd.value,
            args: [{
                    name: 'args',
                    schema: {
                        type: 'object',
                        required: ['cwd'],
                        properties: {
                            cwd: {
                                description: localize('workbench.action.terminal.newWithCwd.cwd', "The directory to start the terminal at"),
                                type: 'string'
                            }
                        },
                    }
                }]
        },
        run: async (c, _, args) => {
            const cwd = isObject(args) && 'cwd' in args ? toOptionalString(args.cwd) : undefined;
            const instance = await c.service.createTerminal({ cwd });
            if (!instance) {
                return;
            }
            c.service.setActiveInstance(instance);
            await focusActiveTerminal(instance, c);
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.renameWithArg",
        title: terminalStrings.renameWithArgs,
        metadata: {
            description: terminalStrings.renameWithArgs.value,
            args: [{
                    name: 'args',
                    schema: {
                        type: 'object',
                        required: ['name'],
                        properties: {
                            name: {
                                description: localize('workbench.action.terminal.renameWithArg.name', "The new name for the terminal"),
                                type: 'string',
                                minLength: 1
                            }
                        }
                    }
                }]
        },
        precondition: sharedWhenClause.terminalAvailable,
        run: async (activeInstance, c, accessor, args) => {
            const notificationService = accessor.get(INotificationService);
            const name = isObject(args) && 'name' in args ? toOptionalString(args.name) : undefined;
            if (!name) {
                notificationService.warn(localize('workbench.action.terminal.renameWithArg.noName', "No name argument provided"));
                return;
            }
            activeInstance.rename(name);
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.relaunch",
        title: localize2('workbench.action.terminal.relaunch', 'Relaunch Active Terminal'),
        run: (activeInstance) => activeInstance.relaunch()
    });
    registerTerminalAction({
        id: "workbench.action.terminal.split",
        title: terminalStrings.split,
        precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
        keybinding: {
            primary: 2048 | 1024 | 26,
            weight: 200,
            mac: {
                primary: 2048 | 93,
                secondary: [256 | 1024 | 26]
            },
            when: TerminalContextKeys.focus
        },
        icon: Codicon.splitHorizontal,
        run: async (c, accessor, args) => {
            const optionsOrProfile = isObject(args) ? args : undefined;
            const commandService = accessor.get(ICommandService);
            const workspaceContextService = accessor.get(IWorkspaceContextService);
            const options = convertOptionsOrProfileToOptions(optionsOrProfile);
            const activeInstance = (await c.service.getInstanceHost(options?.location)).activeInstance;
            if (!activeInstance) {
                return;
            }
            const cwd = await getCwdForSplit(activeInstance, workspaceContextService.getWorkspace().folders, commandService, c.configService);
            if (cwd === undefined) {
                return;
            }
            const instance = await c.service.createTerminal({ location: { parentTerminal: activeInstance }, config: options?.config, cwd });
            await focusActiveTerminal(instance, c);
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.splitActiveTab",
        title: terminalStrings.split,
        f1: false,
        keybinding: {
            primary: 2048 | 1024 | 26,
            mac: {
                primary: 2048 | 93,
                secondary: [256 | 1024 | 26]
            },
            weight: 200,
            when: TerminalContextKeys.tabsFocus
        },
        run: async (c, accessor) => {
            const instances = getSelectedInstances(accessor);
            if (instances) {
                const promises = [];
                for (const t of instances) {
                    promises.push((async () => {
                        await c.service.createTerminal({ location: { parentTerminal: t } });
                        await c.groupService.showPanel(true);
                    })());
                }
                await Promise.all(promises);
            }
        }
    });
    registerContextualInstanceAction({
        id: "workbench.action.terminal.unsplit",
        title: terminalStrings.unsplit,
        precondition: sharedWhenClause.terminalAvailable,
        run: async (instance, c) => {
            const group = c.groupService.getGroupForInstance(instance);
            if (group && group?.terminalInstances.length > 1) {
                c.groupService.unsplitInstance(instance);
            }
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.joinActiveTab",
        title: localize2('workbench.action.terminal.joinInstance', 'Join Terminals'),
        precondition: ContextKeyExpr.and(sharedWhenClause.terminalAvailable, TerminalContextKeys.tabsSingularSelection.toNegated()),
        run: async (c, accessor) => {
            const instances = getSelectedInstances(accessor);
            if (instances && instances.length > 1) {
                c.groupService.joinInstances(instances);
            }
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.join",
        title: localize2('workbench.action.terminal.join', 'Join Terminals...'),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (c, accessor) => {
            const themeService = accessor.get(IThemeService);
            const notificationService = accessor.get(INotificationService);
            const quickInputService = accessor.get(IQuickInputService);
            const picks = [];
            if (c.groupService.instances.length <= 1) {
                notificationService.warn(localize('workbench.action.terminal.join.insufficientTerminals', 'Insufficient terminals for the join action'));
                return;
            }
            const otherInstances = c.groupService.instances.filter(i => i.instanceId !== c.groupService.activeInstance?.instanceId);
            for (const terminal of otherInstances) {
                const group = c.groupService.getGroupForInstance(terminal);
                if (group?.terminalInstances.length === 1) {
                    const iconId = getIconId(accessor, terminal);
                    const label = `$(${iconId}): ${terminal.title}`;
                    const iconClasses = [];
                    const colorClass = getColorClass(terminal);
                    if (colorClass) {
                        iconClasses.push(colorClass);
                    }
                    const uriClasses = getUriClasses(terminal, themeService.getColorTheme().type);
                    if (uriClasses) {
                        iconClasses.push(...uriClasses);
                    }
                    picks.push({
                        terminal,
                        label,
                        iconClasses
                    });
                }
            }
            if (picks.length === 0) {
                notificationService.warn(localize('workbench.action.terminal.join.onlySplits', 'All terminals are joined already'));
                return;
            }
            const result = await quickInputService.pick(picks, {});
            if (result) {
                c.groupService.joinInstances([result.terminal, c.groupService.activeInstance]);
            }
        }
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.splitInActiveWorkspace",
        title: localize2('workbench.action.terminal.splitInActiveWorkspace', 'Split Terminal (In Active Workspace)'),
        run: async (instance, c) => {
            const newInstance = await c.service.createTerminal({ location: { parentTerminal: instance } });
            if (newInstance?.target !== TerminalLocation.Editor) {
                await c.groupService.showPanel(true);
            }
        }
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.selectAll",
        title: localize2('workbench.action.terminal.selectAll', 'Select All'),
        precondition: sharedWhenClause.terminalAvailable,
        keybinding: [{
                primary: 0,
                mac: { primary: 2048 | 31 },
                weight: 200,
                when: TerminalContextKeys.focusInAny
            }],
        run: (xterm) => xterm.selectAll()
    });
    registerTerminalAction({
        id: "workbench.action.terminal.new",
        title: localize2('workbench.action.terminal.new', 'Create New Terminal'),
        precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
        icon: newTerminalIcon,
        keybinding: {
            primary: 2048 | 1024 | 91,
            mac: { primary: 256 | 1024 | 91 },
            weight: 200
        },
        run: async (c, accessor, args) => {
            let eventOrOptions = isObject(args) ? args : undefined;
            const workspaceContextService = accessor.get(IWorkspaceContextService);
            const commandService = accessor.get(ICommandService);
            const folders = workspaceContextService.getWorkspace().folders;
            if (eventOrOptions && isMouseEvent(eventOrOptions) && (eventOrOptions.altKey || eventOrOptions.ctrlKey)) {
                await c.service.createTerminal({ location: { splitActiveTerminal: true } });
                return;
            }
            if (c.service.isProcessSupportRegistered) {
                eventOrOptions = !eventOrOptions || isMouseEvent(eventOrOptions) ? {} : eventOrOptions;
                let instance;
                if (folders.length <= 1) {
                    instance = await c.service.createTerminal(eventOrOptions);
                }
                else {
                    const cwd = (await pickTerminalCwd(accessor))?.cwd;
                    if (!cwd) {
                        return;
                    }
                    eventOrOptions.cwd = cwd;
                    instance = await c.service.createTerminal(eventOrOptions);
                }
                c.service.setActiveInstance(instance);
                await focusActiveTerminal(instance, c);
            }
            else {
                if (c.profileService.contributedProfiles.length > 0) {
                    commandService.executeCommand("workbench.action.terminal.newWithProfile");
                }
                else {
                    commandService.executeCommand("workbench.action.terminal.toggleTerminal");
                }
            }
        }
    });
    async function killInstance(c, instance) {
        if (!instance) {
            return;
        }
        await c.service.safeDisposeTerminal(instance);
        if (c.groupService.instances.length > 0) {
            await c.groupService.showPanel(true);
        }
    }
    registerTerminalAction({
        id: "workbench.action.terminal.kill",
        title: localize2('workbench.action.terminal.kill', 'Kill the Active Terminal Instance'),
        precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
        icon: killTerminalIcon,
        run: async (c) => killInstance(c, c.groupService.activeInstance)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.killViewOrEditor",
        title: terminalStrings.kill,
        f1: false,
        precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
        run: async (c) => killInstance(c, c.service.activeInstance)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.killAll",
        title: localize2('workbench.action.terminal.killAll', 'Kill All Terminals'),
        precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
        icon: Codicon.trash,
        run: async (c) => {
            const disposePromises = [];
            for (const instance of c.service.instances) {
                disposePromises.push(c.service.safeDisposeTerminal(instance));
            }
            await Promise.all(disposePromises);
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.killEditor",
        title: localize2('workbench.action.terminal.killEditor', 'Kill the Active Terminal in Editor Area'),
        precondition: sharedWhenClause.terminalAvailable,
        keybinding: {
            primary: 2048 | 53,
            win: { primary: 2048 | 62, secondary: [2048 | 53] },
            weight: 200,
            when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus)
        },
        run: (c, accessor) => accessor.get(ICommandService).executeCommand(CLOSE_EDITOR_COMMAND_ID)
    });
    registerTerminalAction({
        id: "workbench.action.terminal.killActiveTab",
        title: terminalStrings.kill,
        f1: false,
        precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
        keybinding: {
            primary: 20,
            mac: {
                primary: 2048 | 1,
                secondary: [20]
            },
            weight: 200,
            when: TerminalContextKeys.tabsFocus
        },
        run: async (c, accessor) => {
            const disposePromises = [];
            for (const terminal of getSelectedInstances(accessor, true) ?? []) {
                disposePromises.push(c.service.safeDisposeTerminal(terminal));
            }
            await Promise.all(disposePromises);
            c.groupService.focusTabs();
        }
    });
    registerTerminalAction({
        id: "workbench.action.terminal.focusHover",
        title: terminalStrings.focusHover,
        precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
        keybinding: {
            primary: KeyChord(2048 | 41, 2048 | 39),
            weight: 200,
            when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus)
        },
        run: (c) => c.groupService.focusHover()
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.clear",
        title: localize2('workbench.action.terminal.clear', 'Clear'),
        precondition: sharedWhenClause.terminalAvailable,
        keybinding: [{
                primary: 0,
                mac: { primary: 2048 | 41 },
                weight: 200 + 1,
                when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()), ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo("terminal"))),
            }],
        run: (activeInstance) => activeInstance.clearBuffer()
    });
    registerTerminalAction({
        id: "workbench.action.terminal.selectDefaultShell",
        title: localize2('workbench.action.terminal.selectDefaultShell', 'Select Default Profile'),
        run: (c) => c.service.showProfileQuickPick('setDefault')
    });
    registerTerminalAction({
        id: "workbench.action.terminal.openSettings",
        title: localize2('workbench.action.terminal.openSettings', 'Configure Terminal Settings'),
        precondition: sharedWhenClause.terminalAvailable,
        run: (c, accessor) => accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: '@feature:terminal' })
    });
    registerActiveInstanceAction({
        id: "workbench.action.terminal.setDimensions",
        title: localize2('workbench.action.terminal.setFixedDimensions', 'Set Fixed Dimensions'),
        precondition: sharedWhenClause.terminalAvailable_and_opened,
        run: (activeInstance) => activeInstance.setFixedDimensions()
    });
    registerContextualInstanceAction({
        id: "workbench.action.terminal.sizeToContentWidth",
        title: terminalStrings.toggleSizeToContentWidth,
        precondition: sharedWhenClause.terminalAvailable_and_opened,
        keybinding: {
            primary: 512 | 56,
            weight: 200,
            when: TerminalContextKeys.focus
        },
        run: (instance) => instance.toggleSizeToContentWidth()
    });
    registerTerminalAction({
        id: "workbench.action.terminal.clearPreviousSessionHistory",
        title: localize2('workbench.action.terminal.clearPreviousSessionHistory', 'Clear Previous Session History'),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (c, accessor) => {
            getCommandHistory(accessor).clear();
            clearShellFileHistory();
        }
    });
    if (BrowserFeatures.clipboard.writeText) {
        registerActiveXtermAction({
            id: "workbench.action.terminal.copySelection",
            title: localize2('workbench.action.terminal.copySelection', 'Copy Selection'),
            precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(sharedWhenClause.terminalAvailable, TerminalContextKeys.textSelected)),
            keybinding: [{
                    primary: 2048 | 1024 | 33,
                    mac: { primary: 2048 | 33 },
                    weight: 200,
                    when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.textSelected, TerminalContextKeys.focus), TerminalContextKeys.textSelectedInFocused)
                }],
            run: (activeInstance) => activeInstance.copySelection()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.copyAndClearSelection",
            title: localize2('workbench.action.terminal.copyAndClearSelection', 'Copy and Clear Selection'),
            precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(sharedWhenClause.terminalAvailable, TerminalContextKeys.textSelected)),
            keybinding: [{
                    win: { primary: 2048 | 33 },
                    weight: 200,
                    when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.textSelected, TerminalContextKeys.focus), TerminalContextKeys.textSelectedInFocused)
                }],
            run: async (xterm) => {
                await xterm.copySelection();
                xterm.clearSelection();
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.copySelectionAsHtml",
            title: localize2('workbench.action.terminal.copySelectionAsHtml', 'Copy Selection as HTML'),
            f1: true,
            category,
            precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(sharedWhenClause.terminalAvailable, TerminalContextKeys.textSelected)),
            run: (xterm) => xterm.copySelection(true)
        });
    }
    if (BrowserFeatures.clipboard.readText) {
        registerActiveInstanceAction({
            id: "workbench.action.terminal.paste",
            title: localize2('workbench.action.terminal.paste', 'Paste into Active Terminal'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: [{
                    primary: 2048 | 52,
                    win: { primary: 2048 | 52, secondary: [2048 | 1024 | 52] },
                    linux: { primary: 2048 | 1024 | 52 },
                    weight: 200,
                    when: TerminalContextKeys.focus
                }],
            run: (activeInstance) => activeInstance.paste()
        });
    }
    if (BrowserFeatures.clipboard.readText && isLinux) {
        registerActiveInstanceAction({
            id: "workbench.action.terminal.pasteSelection",
            title: localize2('workbench.action.terminal.pasteSelection', 'Paste Selection into Active Terminal'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: [{
                    linux: { primary: 1024 | 19 },
                    weight: 200,
                    when: TerminalContextKeys.focus
                }],
            run: (activeInstance) => activeInstance.pasteSelection()
        });
    }
    registerTerminalAction({
        id: "workbench.action.terminal.switchTerminal",
        title: localize2('workbench.action.terminal.switchTerminal', 'Switch Terminal'),
        precondition: sharedWhenClause.terminalAvailable,
        run: async (c, accessor, args) => {
            const item = toOptionalString(args);
            if (!item) {
                return;
            }
            if (item === switchTerminalActionViewItemSeparator) {
                c.service.refreshActiveGroup();
                return;
            }
            if (item === switchTerminalShowTabsTitle) {
                accessor.get(IConfigurationService).updateValue("terminal.integrated.tabs.enabled", true);
                return;
            }
            const terminalIndexRe = /^([0-9]+): /;
            const indexMatches = terminalIndexRe.exec(item);
            if (indexMatches) {
                c.groupService.setActiveGroupByIndex(Number(indexMatches[1]) - 1);
                return c.groupService.showPanel(true);
            }
            const quickSelectProfiles = c.profileService.availableProfiles;
            const profileSelection = item.substring(4);
            if (quickSelectProfiles) {
                const profile = quickSelectProfiles.find(profile => profile.profileName === profileSelection);
                if (profile) {
                    const instance = await c.service.createTerminal({
                        config: profile
                    });
                    c.service.setActiveInstance(instance);
                }
                else {
                    console.warn(`No profile with name "${profileSelection}"`);
                }
            }
            else {
                console.warn(`Unmatched terminal item: "${item}"`);
            }
        }
    });
}
function getSelectedInstances2(accessor, args) {
    const terminalService = accessor.get(ITerminalService);
    const result = [];
    const context = parseActionArgs(args);
    if (context && context.length > 0) {
        for (const instanceContext of context) {
            const instance = terminalService.getInstanceFromId(instanceContext.instanceId);
            if (instance) {
                result.push(instance);
            }
        }
        if (result.length > 0) {
            return result;
        }
    }
    return undefined;
}
function getSelectedInstances(accessor, args, args2) {
    const listService = accessor.get(IListService);
    const terminalService = accessor.get(ITerminalService);
    const terminalGroupService = accessor.get(ITerminalGroupService);
    const result = [];
    const list = listService.lastFocusedList;
    const selections = list?.getSelection();
    if (terminalGroupService.lastAccessedMenu === 'inline-tab' && !selections?.length) {
        const instance = terminalGroupService.activeInstance;
        return instance ? [terminalGroupService.activeInstance] : undefined;
    }
    if (!list || !selections) {
        return undefined;
    }
    const focused = list.getFocus();
    if (focused.length === 1 && !selections.includes(focused[0])) {
        result.push(terminalService.getInstanceFromIndex(focused[0]));
        return result;
    }
    for (const selection of selections) {
        result.push(terminalService.getInstanceFromIndex(selection));
    }
    return result.filter(r => !!r);
}
export function validateTerminalName(name) {
    if (!name || name.trim().length === 0) {
        return {
            content: localize('emptyTerminalNameInfo', "Providing no name will reset it to the default value"),
            severity: Severity.Info
        };
    }
    return null;
}
function convertOptionsOrProfileToOptions(optionsOrProfile) {
    if (isObject(optionsOrProfile) && 'profileName' in optionsOrProfile) {
        return { config: optionsOrProfile, location: optionsOrProfile.location };
    }
    return optionsOrProfile;
}
let newWithProfileAction;
export function refreshTerminalActions(detectedProfiles) {
    const profileEnum = createProfileSchemaEnums(detectedProfiles);
    newWithProfileAction?.dispose();
    newWithProfileAction = registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.newWithProfile",
                title: localize2('workbench.action.terminal.newWithProfile', 'Create New Terminal (With Profile)'),
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
                metadata: {
                    description: "workbench.action.terminal.newWithProfile",
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                required: ['profileName'],
                                properties: {
                                    profileName: {
                                        description: localize('workbench.action.terminal.newWithProfile.profileName', "The name of the profile to create"),
                                        type: 'string',
                                        enum: profileEnum.values,
                                        markdownEnumDescriptions: profileEnum.markdownDescriptions
                                    },
                                    location: {
                                        description: localize('newWithProfile.location', "Where to create the terminal"),
                                        type: 'string',
                                        enum: ['view', 'editor'],
                                        enumDescriptions: [
                                            localize('newWithProfile.location.view', 'Create the terminal in the terminal view'),
                                            localize('newWithProfile.location.editor', 'Create the terminal in the editor'),
                                        ]
                                    }
                                }
                            }
                        }]
                },
            });
        }
        async run(accessor, eventOrOptionsOrProfile, profile) {
            const c = getTerminalServices(accessor);
            const workspaceContextService = accessor.get(IWorkspaceContextService);
            const commandService = accessor.get(ICommandService);
            let event;
            let options;
            let instance;
            let cwd;
            if (isObject(eventOrOptionsOrProfile) && eventOrOptionsOrProfile && 'profileName' in eventOrOptionsOrProfile) {
                const config = c.profileService.availableProfiles.find(profile => profile.profileName === eventOrOptionsOrProfile.profileName);
                if (!config) {
                    throw new Error(`Could not find terminal profile "${eventOrOptionsOrProfile.profileName}"`);
                }
                options = { config };
                if ('location' in eventOrOptionsOrProfile) {
                    switch (eventOrOptionsOrProfile.location) {
                        case 'editor':
                            options.location = TerminalLocation.Editor;
                            break;
                        case 'view':
                            options.location = TerminalLocation.Panel;
                            break;
                    }
                }
            }
            else if (isMouseEvent(eventOrOptionsOrProfile) || isPointerEvent(eventOrOptionsOrProfile) || isKeyboardEvent(eventOrOptionsOrProfile)) {
                event = eventOrOptionsOrProfile;
                options = profile ? { config: profile } : undefined;
            }
            else {
                options = convertOptionsOrProfileToOptions(eventOrOptionsOrProfile);
            }
            if (event && (event.altKey || event.ctrlKey)) {
                const parentTerminal = c.service.activeInstance;
                if (parentTerminal) {
                    await c.service.createTerminal({ location: { parentTerminal }, config: options?.config });
                    return;
                }
            }
            const folders = workspaceContextService.getWorkspace().folders;
            if (folders.length > 1) {
                const options = {
                    placeHolder: localize('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                };
                const workspace = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                if (!workspace) {
                    return;
                }
                cwd = workspace.uri;
            }
            if (options) {
                options.cwd = cwd;
                instance = await c.service.createTerminal(options);
            }
            else {
                instance = await c.service.showProfileQuickPick('createInstance', cwd);
            }
            if (instance) {
                c.service.setActiveInstance(instance);
                await focusActiveTerminal(instance, c);
            }
        }
    });
    return newWithProfileAction;
}
function getResourceOrActiveInstance(c, resource) {
    return c.service.getInstanceFromResource(toOptionalUri(resource)) || c.service.activeInstance;
}
async function pickTerminalCwd(accessor, cancel) {
    const quickInputService = accessor.get(IQuickInputService);
    const labelService = accessor.get(ILabelService);
    const contextService = accessor.get(IWorkspaceContextService);
    const modelService = accessor.get(IModelService);
    const languageService = accessor.get(ILanguageService);
    const configurationService = accessor.get(IConfigurationService);
    const configurationResolverService = accessor.get(IConfigurationResolverService);
    const folders = contextService.getWorkspace().folders;
    if (!folders.length) {
        return;
    }
    const folderCwdPairs = await Promise.all(folders.map(e => resolveWorkspaceFolderCwd(e, configurationService, configurationResolverService)));
    const shrinkedPairs = shrinkWorkspaceFolderCwdPairs(folderCwdPairs);
    if (shrinkedPairs.length === 1) {
        return shrinkedPairs[0];
    }
    const folderPicks = shrinkedPairs.map(pair => {
        const label = pair.folder.name;
        const description = pair.isOverridden
            ? localize('workbench.action.terminal.overriddenCwdDescription', "(Overriden) {0}", labelService.getUriLabel(pair.cwd, { relative: !pair.isAbsolute }))
            : labelService.getUriLabel(dirname(pair.cwd), { relative: true });
        return {
            label,
            description: description !== label ? description : undefined,
            pair: pair,
            iconClasses: getIconClasses(modelService, languageService, pair.cwd, FileKind.ROOT_FOLDER)
        };
    });
    const options = {
        placeHolder: localize('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal"),
        matchOnDescription: true,
        canPickMany: false,
    };
    const token = cancel || CancellationToken.None;
    const pick = await quickInputService.pick(folderPicks, options, token);
    return pick?.pair;
}
async function resolveWorkspaceFolderCwd(folder, configurationService, configurationResolverService) {
    const cwdConfig = configurationService.getValue("terminal.integrated.cwd", { resource: folder.uri });
    if (!isString(cwdConfig) || cwdConfig.length === 0) {
        return { folder, cwd: folder.uri, isAbsolute: false, isOverridden: false };
    }
    const resolvedCwdConfig = await configurationResolverService.resolveAsync(folder, cwdConfig);
    return isAbsolute(resolvedCwdConfig) || resolvedCwdConfig.startsWith(AbstractVariableResolverService.VARIABLE_LHS)
        ? { folder, isAbsolute: true, isOverridden: true, cwd: URI.from({ ...folder.uri, path: resolvedCwdConfig }) }
        : { folder, isAbsolute: false, isOverridden: true, cwd: URI.joinPath(folder.uri, resolvedCwdConfig) };
}
export function shrinkWorkspaceFolderCwdPairs(pairs) {
    const map = new Map();
    for (const pair of pairs) {
        const key = pair.cwd.toString();
        const value = map.get(key);
        if (!value || key === pair.folder.uri.toString()) {
            map.set(key, pair);
        }
    }
    const selectedPairs = new Set(map.values());
    const selectedPairsInOrder = pairs.filter(x => selectedPairs.has(x));
    return selectedPairsInOrder;
}
async function focusActiveTerminal(instance, c) {
    if (instance.target === TerminalLocation.Editor) {
        await c.editorService.revealActiveEditor();
        await instance.focusWhenReady(true);
    }
    else {
        await c.groupService.showPanel(true);
    }
}
async function renameWithQuickPick(c, accessor, resource) {
    let instance = resource;
    if (!instance || !instance?.rename) {
        instance = getResourceOrActiveInstance(c, resource);
    }
    if (instance) {
        const title = await accessor.get(IQuickInputService).input({
            value: instance.title,
            prompt: localize('workbench.action.terminal.rename.prompt', "Enter terminal name"),
        });
        instance.rename(title);
    }
}
function toOptionalUri(obj) {
    return URI.isUri(obj) ? obj : undefined;
}
function toOptionalString(obj) {
    return isString(obj) ? obj : undefined;
}
