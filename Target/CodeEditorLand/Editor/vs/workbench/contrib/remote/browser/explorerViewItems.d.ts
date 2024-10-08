import { IRemoteExplorerService } from '../../../services/remote/common/remoteExplorerService.js';
import { IViewDescriptor } from '../../../common/views.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare const SELECTED_REMOTE_IN_EXPLORER: RawContextKey<string>;
export declare class SwitchRemoteViewItem extends Disposable {
    private readonly contextKeyService;
    private remoteExplorerService;
    private environmentService;
    private readonly storageService;
    private readonly workspaceContextService;
    private switchRemoteMenu;
    private completedRemotes;
    private readonly selectedRemoteContext;
    constructor(contextKeyService: IContextKeyService, remoteExplorerService: IRemoteExplorerService, environmentService: IWorkbenchEnvironmentService, storageService: IStorageService, workspaceContextService: IWorkspaceContextService);
    setSelectionForConnection(): boolean;
    private select;
    private getAuthorityForExplorerType;
    removeOptionItems(views: IViewDescriptor[]): void;
    createOptionItems(views: IViewDescriptor[]): void;
}
