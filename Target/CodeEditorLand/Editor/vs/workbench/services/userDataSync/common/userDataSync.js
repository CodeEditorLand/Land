import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ContextKeyExpr, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { localize, localize2 } from '../../../../nls.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
export const IUserDataSyncWorkbenchService = createDecorator('IUserDataSyncWorkbenchService');
export function getSyncAreaLabel(source) {
    switch (source) {
        case "settings": return localize('settings', "Settings");
        case "keybindings": return localize('keybindings', "Keyboard Shortcuts");
        case "snippets": return localize('snippets', "Snippets");
        case "tasks": return localize('tasks', "Tasks");
        case "extensions": return localize('extensions', "Extensions");
        case "globalState": return localize('ui state label', "UI State");
        case "profiles": return localize('profiles', "Profiles");
        case "workspaceState": return localize('workspace state label', "Workspace State");
    }
}
export const SYNC_TITLE = localize2('sync category', "Settings Sync");
export const SYNC_VIEW_ICON = registerIcon('settings-sync-view-icon', Codicon.sync, localize('syncViewIcon', 'View icon of the Settings Sync view.'));
export const CONTEXT_SYNC_STATE = new RawContextKey('syncStatus', "uninitialized");
export const CONTEXT_SYNC_ENABLEMENT = new RawContextKey('syncEnabled', false);
export const CONTEXT_ACCOUNT_STATE = new RawContextKey('userDataSyncAccountStatus', "unavailable");
export const CONTEXT_ENABLE_ACTIVITY_VIEWS = new RawContextKey(`enableSyncActivityViews`, false);
export const CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW = new RawContextKey(`enableSyncConflictsView`, false);
export const CONTEXT_HAS_CONFLICTS = new RawContextKey('hasConflicts', false);
export const CONFIGURE_SYNC_COMMAND_ID = 'workbench.userDataSync.actions.configure';
export const SHOW_SYNC_LOG_COMMAND_ID = 'workbench.userDataSync.actions.showLog';
export const SYNC_VIEW_CONTAINER_ID = 'workbench.view.sync';
export const SYNC_CONFLICTS_VIEW_ID = 'workbench.views.sync.conflicts';
export const DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR = {
    id: 'workbench.userDataSync.actions.downloadSyncActivity',
    title: localize2('download sync activity title', "Download Settings Sync Activity"),
    category: Categories.Developer,
    f1: true,
    precondition: ContextKeyExpr.and(CONTEXT_ACCOUNT_STATE.isEqualTo("available"), CONTEXT_SYNC_STATE.notEqualsTo("uninitialized"))
};
