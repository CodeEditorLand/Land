import { localize, localize2 } from '../../../nls.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { MenuRegistry, MenuId, Action2, registerAction2 } from '../../../platform/actions/common/actions.js';
import { KeyChord } from '../../../base/common/keyCodes.js';
import { IsMainWindowFullscreenContext } from '../../common/contextkeys.js';
import { IsMacNativeContext, IsDevelopmentContext, IsWebContext, IsIOSContext } from '../../../platform/contextkey/common/contextkeys.js';
import { Categories } from '../../../platform/action/common/actionCommonCategories.js';
import { KeybindingsRegistry } from '../../../platform/keybinding/common/keybindingsRegistry.js';
import { IQuickInputService } from '../../../platform/quickinput/common/quickInput.js';
import { IWorkspaceContextService } from '../../../platform/workspace/common/workspace.js';
import { ILabelService } from '../../../platform/label/common/label.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { ILanguageService } from '../../../editor/common/languages/language.js';
import { isRecentFolder, isRecentWorkspace, IWorkspacesService } from '../../../platform/workspaces/common/workspaces.js';
import { getIconClasses } from '../../../editor/common/services/getIconClasses.js';
import { FileKind } from '../../../platform/files/common/files.js';
import { splitRecentLabel } from '../../../base/common/labels.js';
import { isMacintosh, isWeb, isWindows } from '../../../base/common/platform.js';
import { ContextKeyExpr } from '../../../platform/contextkey/common/contextkey.js';
import { inQuickPickContext, getQuickNavigateHandler } from '../quickaccess.js';
import { IHostService } from '../../services/host/browser/host.js';
import { ResourceMap } from '../../../base/common/map.js';
import { Codicon } from '../../../base/common/codicons.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { CommandsRegistry } from '../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { isFolderBackupInfo, isWorkspaceBackupInfo } from '../../../platform/backup/common/backup.js';
import { getActiveElement, getActiveWindow, isHTMLElement } from '../../../base/browser/dom.js';
export const inRecentFilesPickerContextKey = 'inRecentFilesPicker';
class BaseOpenRecentAction extends Action2 {
    constructor(desc) {
        super(desc);
        this.removeFromRecentlyOpened = {
            iconClass: ThemeIcon.asClassName(Codicon.removeClose),
            tooltip: localize('remove', "Remove from Recently Opened")
        };
        this.dirtyRecentlyOpenedFolder = {
            iconClass: 'dirty-workspace ' + ThemeIcon.asClassName(Codicon.closeDirty),
            tooltip: localize('dirtyRecentlyOpenedFolder', "Folder With Unsaved Files"),
            alwaysVisible: true
        };
        this.dirtyRecentlyOpenedWorkspace = {
            ...this.dirtyRecentlyOpenedFolder,
            tooltip: localize('dirtyRecentlyOpenedWorkspace', "Workspace With Unsaved Files"),
        };
    }
    async run(accessor) {
        const workspacesService = accessor.get(IWorkspacesService);
        const quickInputService = accessor.get(IQuickInputService);
        const contextService = accessor.get(IWorkspaceContextService);
        const labelService = accessor.get(ILabelService);
        const keybindingService = accessor.get(IKeybindingService);
        const modelService = accessor.get(IModelService);
        const languageService = accessor.get(ILanguageService);
        const hostService = accessor.get(IHostService);
        const dialogService = accessor.get(IDialogService);
        const recentlyOpened = await workspacesService.getRecentlyOpened();
        const dirtyWorkspacesAndFolders = await workspacesService.getDirtyWorkspaces();
        let hasWorkspaces = false;
        const dirtyFolders = new ResourceMap();
        const dirtyWorkspaces = new ResourceMap();
        for (const dirtyWorkspace of dirtyWorkspacesAndFolders) {
            if (isFolderBackupInfo(dirtyWorkspace)) {
                dirtyFolders.set(dirtyWorkspace.folderUri, true);
            }
            else {
                dirtyWorkspaces.set(dirtyWorkspace.workspace.configPath, dirtyWorkspace.workspace);
                hasWorkspaces = true;
            }
        }
        const recentFolders = new ResourceMap();
        const recentWorkspaces = new ResourceMap();
        for (const recent of recentlyOpened.workspaces) {
            if (isRecentFolder(recent)) {
                recentFolders.set(recent.folderUri, true);
            }
            else {
                recentWorkspaces.set(recent.workspace.configPath, recent.workspace);
                hasWorkspaces = true;
            }
        }
        const workspacePicks = [];
        for (const recent of recentlyOpened.workspaces) {
            const isDirty = isRecentFolder(recent) ? dirtyFolders.has(recent.folderUri) : dirtyWorkspaces.has(recent.workspace.configPath);
            workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, recent, isDirty));
        }
        for (const dirtyWorkspaceOrFolder of dirtyWorkspacesAndFolders) {
            if (isFolderBackupInfo(dirtyWorkspaceOrFolder) && !recentFolders.has(dirtyWorkspaceOrFolder.folderUri)) {
                workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, dirtyWorkspaceOrFolder, true));
            }
            else if (isWorkspaceBackupInfo(dirtyWorkspaceOrFolder) && !recentWorkspaces.has(dirtyWorkspaceOrFolder.workspace.configPath)) {
                workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, dirtyWorkspaceOrFolder, true));
            }
        }
        const filePicks = recentlyOpened.files.map(p => this.toQuickPick(modelService, languageService, labelService, p, false));
        const firstEntry = recentlyOpened.workspaces[0];
        const autoFocusSecondEntry = firstEntry && contextService.isCurrentWorkspace(isRecentWorkspace(firstEntry) ? firstEntry.workspace : firstEntry.folderUri);
        let keyMods;
        const workspaceSeparator = { type: 'separator', label: hasWorkspaces ? localize('workspacesAndFolders', "folders & workspaces") : localize('folders', "folders") };
        const fileSeparator = { type: 'separator', label: localize('files', "files") };
        const picks = [workspaceSeparator, ...workspacePicks, fileSeparator, ...filePicks];
        const pick = await quickInputService.pick(picks, {
            contextKey: inRecentFilesPickerContextKey,
            activeItem: [...workspacePicks, ...filePicks][autoFocusSecondEntry ? 1 : 0],
            placeHolder: isMacintosh ? localize('openRecentPlaceholderMac', "Select to open (hold Cmd-key to force new window or Option-key for same window)") : localize('openRecentPlaceholder', "Select to open (hold Ctrl-key to force new window or Alt-key for same window)"),
            matchOnDescription: true,
            onKeyMods: mods => keyMods = mods,
            quickNavigate: this.isQuickNavigate() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : undefined,
            hideInput: this.isQuickNavigate(),
            onDidTriggerItemButton: async (context) => {
                if (context.button === this.removeFromRecentlyOpened) {
                    await workspacesService.removeRecentlyOpened([context.item.resource]);
                    context.removeItem();
                }
                else if (context.button === this.dirtyRecentlyOpenedFolder || context.button === this.dirtyRecentlyOpenedWorkspace) {
                    const isDirtyWorkspace = context.button === this.dirtyRecentlyOpenedWorkspace;
                    const { confirmed } = await dialogService.confirm({
                        title: isDirtyWorkspace ? localize('dirtyWorkspace', "Workspace with Unsaved Files") : localize('dirtyFolder', "Folder with Unsaved Files"),
                        message: isDirtyWorkspace ? localize('dirtyWorkspaceConfirm', "Do you want to open the workspace to review the unsaved files?") : localize('dirtyFolderConfirm', "Do you want to open the folder to review the unsaved files?"),
                        detail: isDirtyWorkspace ? localize('dirtyWorkspaceConfirmDetail', "Workspaces with unsaved files cannot be removed until all unsaved files have been saved or reverted.") : localize('dirtyFolderConfirmDetail', "Folders with unsaved files cannot be removed until all unsaved files have been saved or reverted.")
                    });
                    if (confirmed) {
                        hostService.openWindow([context.item.openable], {
                            remoteAuthority: context.item.remoteAuthority || null
                        });
                        quickInputService.cancel();
                    }
                }
            }
        });
        if (pick) {
            return hostService.openWindow([pick.openable], {
                forceNewWindow: keyMods?.ctrlCmd,
                forceReuseWindow: keyMods?.alt,
                remoteAuthority: pick.remoteAuthority || null
            });
        }
    }
    toQuickPick(modelService, languageService, labelService, recent, isDirty) {
        let openable;
        let iconClasses;
        let fullLabel;
        let resource;
        let isWorkspace = false;
        if (isRecentFolder(recent)) {
            resource = recent.folderUri;
            iconClasses = getIconClasses(modelService, languageService, resource, FileKind.FOLDER);
            openable = { folderUri: resource };
            fullLabel = recent.label || labelService.getWorkspaceLabel(resource, { verbose: 2 });
        }
        else if (isRecentWorkspace(recent)) {
            resource = recent.workspace.configPath;
            iconClasses = getIconClasses(modelService, languageService, resource, FileKind.ROOT_FOLDER);
            openable = { workspaceUri: resource };
            fullLabel = recent.label || labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 });
            isWorkspace = true;
        }
        else {
            resource = recent.fileUri;
            iconClasses = getIconClasses(modelService, languageService, resource, FileKind.FILE);
            openable = { fileUri: resource };
            fullLabel = recent.label || labelService.getUriLabel(resource);
        }
        const { name, parentPath } = splitRecentLabel(fullLabel);
        return {
            iconClasses,
            label: name,
            ariaLabel: isDirty ? isWorkspace ? localize('recentDirtyWorkspaceAriaLabel', "{0}, workspace with unsaved changes", name) : localize('recentDirtyFolderAriaLabel', "{0}, folder with unsaved changes", name) : name,
            description: parentPath,
            buttons: isDirty ? [isWorkspace ? this.dirtyRecentlyOpenedWorkspace : this.dirtyRecentlyOpenedFolder] : [this.removeFromRecentlyOpened],
            openable,
            resource,
            remoteAuthority: recent.remoteAuthority
        };
    }
}
export class OpenRecentAction extends BaseOpenRecentAction {
    static { this.ID = 'workbench.action.openRecent'; }
    constructor() {
        super({
            id: OpenRecentAction.ID,
            title: {
                ...localize2('openRecent', "Open Recent..."),
                mnemonicTitle: localize({ key: 'miMore', comment: ['&& denotes a mnemonic'] }, "&&More..."),
            },
            category: Categories.File,
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 48,
                mac: { primary: 256 | 48 }
            },
            menu: {
                id: MenuId.MenubarRecentMenu,
                group: 'y_more',
                order: 1
            }
        });
    }
    isQuickNavigate() {
        return false;
    }
}
class QuickPickRecentAction extends BaseOpenRecentAction {
    constructor() {
        super({
            id: 'workbench.action.quickOpenRecent',
            title: localize2('quickOpenRecent', 'Quick Open Recent...'),
            category: Categories.File,
            f1: false
        });
    }
    isQuickNavigate() {
        return true;
    }
}
class ToggleFullScreenAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleFullScreen',
            title: {
                ...localize2('toggleFullScreen', "Toggle Full Screen"),
                mnemonicTitle: localize({ key: 'miToggleFullScreen', comment: ['&& denotes a mnemonic'] }, "&&Full Screen"),
            },
            category: Categories.View,
            f1: true,
            keybinding: {
                weight: 200,
                primary: 69,
                mac: {
                    primary: 2048 | 256 | 36
                }
            },
            precondition: IsIOSContext.toNegated(),
            toggled: IsMainWindowFullscreenContext,
            menu: [{
                    id: MenuId.MenubarAppearanceMenu,
                    group: '1_toggle_view',
                    order: 1
                }]
        });
    }
    run(accessor) {
        const hostService = accessor.get(IHostService);
        return hostService.toggleFullScreen(getActiveWindow());
    }
}
export class ReloadWindowAction extends Action2 {
    static { this.ID = 'workbench.action.reloadWindow'; }
    constructor() {
        super({
            id: ReloadWindowAction.ID,
            title: localize2('reloadWindow', 'Reload Window'),
            category: Categories.Developer,
            f1: true,
            keybinding: {
                weight: 200 + 50,
                when: IsDevelopmentContext,
                primary: 2048 | 48
            }
        });
    }
    async run(accessor) {
        const hostService = accessor.get(IHostService);
        return hostService.reload();
    }
}
class ShowAboutDialogAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.showAboutDialog',
            title: {
                ...localize2('about', "About"),
                mnemonicTitle: localize({ key: 'miAbout', comment: ['&& denotes a mnemonic'] }, "&&About"),
            },
            category: Categories.Help,
            f1: true,
            menu: {
                id: MenuId.MenubarHelpMenu,
                group: 'z_about',
                order: 1,
                when: IsMacNativeContext.toNegated()
            }
        });
    }
    run(accessor) {
        const dialogService = accessor.get(IDialogService);
        return dialogService.about();
    }
}
class NewWindowAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.newWindow',
            title: {
                ...localize2('newWindow', "New Window"),
                mnemonicTitle: localize({ key: 'miNewWindow', comment: ['&& denotes a mnemonic'] }, "New &&Window"),
            },
            f1: true,
            keybinding: {
                weight: 200,
                primary: isWeb ? (isWindows ? KeyChord(2048 | 41, 1024 | 44) : 2048 | 512 | 1024 | 44) : 2048 | 1024 | 44,
                secondary: isWeb ? [2048 | 1024 | 44] : undefined
            },
            menu: {
                id: MenuId.MenubarFileMenu,
                group: '1_new',
                order: 3
            }
        });
    }
    run(accessor) {
        const hostService = accessor.get(IHostService);
        return hostService.openWindow({ remoteAuthority: null });
    }
}
class BlurAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.blur',
            title: localize2('blur', 'Remove keyboard focus from focused element')
        });
    }
    run() {
        const activeElement = getActiveElement();
        if (isHTMLElement(activeElement)) {
            activeElement.blur();
        }
    }
}
registerAction2(NewWindowAction);
registerAction2(ToggleFullScreenAction);
registerAction2(QuickPickRecentAction);
registerAction2(OpenRecentAction);
registerAction2(ReloadWindowAction);
registerAction2(ShowAboutDialogAction);
registerAction2(BlurAction);
const recentFilesPickerContext = ContextKeyExpr.and(inQuickPickContext, ContextKeyExpr.has(inRecentFilesPickerContextKey));
const quickPickNavigateNextInRecentFilesPickerId = 'workbench.action.quickOpenNavigateNextInRecentFilesPicker';
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: quickPickNavigateNextInRecentFilesPickerId,
    weight: 200 + 50,
    handler: getQuickNavigateHandler(quickPickNavigateNextInRecentFilesPickerId, true),
    when: recentFilesPickerContext,
    primary: 2048 | 48,
    mac: { primary: 256 | 48 }
});
const quickPickNavigatePreviousInRecentFilesPicker = 'workbench.action.quickOpenNavigatePreviousInRecentFilesPicker';
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: quickPickNavigatePreviousInRecentFilesPicker,
    weight: 200 + 50,
    handler: getQuickNavigateHandler(quickPickNavigatePreviousInRecentFilesPicker, false),
    when: recentFilesPickerContext,
    primary: 2048 | 1024 | 48,
    mac: { primary: 256 | 1024 | 48 }
});
CommandsRegistry.registerCommand('workbench.action.toggleConfirmBeforeClose', accessor => {
    const configurationService = accessor.get(IConfigurationService);
    const setting = configurationService.inspect('window.confirmBeforeClose').userValue;
    return configurationService.updateValue('window.confirmBeforeClose', setting === 'never' ? 'keyboardOnly' : 'never');
});
MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
    group: 'z_ConfirmClose',
    command: {
        id: 'workbench.action.toggleConfirmBeforeClose',
        title: localize('miConfirmClose', "Confirm Before Close"),
        toggled: ContextKeyExpr.notEquals('config.window.confirmBeforeClose', 'never')
    },
    order: 1,
    when: IsWebContext
});
MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
    title: localize({ key: 'miOpenRecent', comment: ['&& denotes a mnemonic'] }, "Open &&Recent"),
    submenu: MenuId.MenubarRecentMenu,
    group: '2_open',
    order: 4
});
