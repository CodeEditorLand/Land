import { IAuthenticationProvider, SyncResource, IUserDataSyncResource, IResourcePreview } from '../../../../platform/userDataSync/common/userDataSync.js';
import { Event } from '../../../../base/common/event.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { URI } from '../../../../base/common/uri.js';
import { IView } from '../../../common/views.js';
import { IAction2Options } from '../../../../platform/actions/common/actions.js';
import { ILocalizedString } from '../../../../platform/action/common/action.js';
export interface IUserDataSyncAccount {
    readonly authenticationProviderId: string;
    readonly accountName: string;
    readonly accountId: string;
}
export declare const IUserDataSyncWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncWorkbenchService>;
export interface IUserDataSyncWorkbenchService {
    _serviceBrand: any;
    readonly enabled: boolean;
    readonly authenticationProviders: IAuthenticationProvider[];
    readonly current: IUserDataSyncAccount | undefined;
    readonly accountStatus: AccountStatus;
    readonly onDidChangeAccountStatus: Event<AccountStatus>;
    readonly onDidTurnOnSync: Event<void>;
    turnOn(): Promise<void>;
    turnoff(everyWhere: boolean): Promise<void>;
    signIn(): Promise<void>;
    resetSyncedData(): Promise<void>;
    showSyncActivity(): Promise<void>;
    syncNow(): Promise<void>;
    synchroniseUserDataSyncStoreType(): Promise<void>;
    showConflicts(conflictToOpen?: IResourcePreview): Promise<void>;
    accept(resource: IUserDataSyncResource, conflictResource: URI, content: string | null | undefined, apply: boolean): Promise<void>;
    getAllLogResources(): Promise<URI[]>;
    downloadSyncActivity(): Promise<URI | undefined>;
}
export declare function getSyncAreaLabel(source: SyncResource): string;
export declare const enum AccountStatus {
    Unavailable = "unavailable",
    Available = "available"
}
export interface IUserDataSyncConflictsView extends IView {
    open(conflict: IResourcePreview): Promise<void>;
}
export declare const SYNC_TITLE: ILocalizedString;
export declare const SYNC_VIEW_ICON: import("../../../../base/common/themables.js").ThemeIcon;
export declare const CONTEXT_SYNC_STATE: RawContextKey<string>;
export declare const CONTEXT_SYNC_ENABLEMENT: RawContextKey<boolean>;
export declare const CONTEXT_ACCOUNT_STATE: RawContextKey<string>;
export declare const CONTEXT_ENABLE_ACTIVITY_VIEWS: RawContextKey<boolean>;
export declare const CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW: RawContextKey<boolean>;
export declare const CONTEXT_HAS_CONFLICTS: RawContextKey<boolean>;
export declare const CONFIGURE_SYNC_COMMAND_ID = "workbench.userDataSync.actions.configure";
export declare const SHOW_SYNC_LOG_COMMAND_ID = "workbench.userDataSync.actions.showLog";
export declare const SYNC_VIEW_CONTAINER_ID = "workbench.view.sync";
export declare const SYNC_CONFLICTS_VIEW_ID = "workbench.views.sync.conflicts";
export declare const DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR: Readonly<IAction2Options>;
