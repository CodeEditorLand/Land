import { Disposable } from '../../../base/common/lifecycle.js';
import { MainThreadTreeViewsShape } from '../common/extHost.protocol.js';
import { ITreeItem, IRevealOptions, IViewBadge } from '../../common/views.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { IViewsService } from '../../services/views/common/viewsService.js';
export declare class MainThreadTreeViews extends Disposable implements MainThreadTreeViewsShape {
    private readonly viewsService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly logService;
    private readonly _proxy;
    private readonly _dataProviders;
    private readonly _dndControllers;
    constructor(extHostContext: IExtHostContext, viewsService: IViewsService, notificationService: INotificationService, extensionService: IExtensionService, logService: ILogService);
    $registerTreeViewDataProvider(treeViewId: string, options: {
        showCollapseAll: boolean;
        canSelectMany: boolean;
        dropMimeTypes: string[];
        dragMimeTypes: string[];
        hasHandleDrag: boolean;
        hasHandleDrop: boolean;
        manuallyManageCheckboxes: boolean;
    }): Promise<void>;
    $reveal(treeViewId: string, itemInfo: {
        item: ITreeItem;
        parentChain: ITreeItem[];
    } | undefined, options: IRevealOptions): Promise<void>;
    $refresh(treeViewId: string, itemsToRefreshByHandle: {
        [treeItemHandle: string]: ITreeItem;
    }): Promise<void>;
    $setMessage(treeViewId: string, message: string | IMarkdownString): void;
    $setTitle(treeViewId: string, title: string, description: string | undefined): void;
    $setBadge(treeViewId: string, badge: IViewBadge | undefined): void;
    $resolveDropFileData(destinationViewId: string, requestId: number, dataItemId: string): Promise<VSBuffer>;
    $disposeTree(treeViewId: string): Promise<void>;
    private reveal;
    private registerListeners;
    private getTreeView;
    dispose(): void;
}
