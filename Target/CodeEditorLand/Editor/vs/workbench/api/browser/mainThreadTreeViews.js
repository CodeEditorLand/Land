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
import { Disposable, DisposableMap, DisposableStore } from '../../../base/common/lifecycle.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { Extensions, ResolvableTreeItem, NoTreeViewError } from '../../common/views.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { distinct } from '../../../base/common/arrays.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { isUndefinedOrNull, isNumber } from '../../../base/common/types.js';
import { Registry } from '../../../platform/registry/common/platform.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { createStringDataTransferItem, VSDataTransfer } from '../../../base/common/dataTransfer.js';
import { DataTransferFileCache } from '../common/shared/dataTransferCache.js';
import * as typeConvert from '../common/extHostTypeConverters.js';
import { IViewsService } from '../../services/views/common/viewsService.js';
let MainThreadTreeViews = class MainThreadTreeViews extends Disposable {
    constructor(extHostContext, viewsService, notificationService, extensionService, logService) {
        super();
        this.viewsService = viewsService;
        this.notificationService = notificationService;
        this.extensionService = extensionService;
        this.logService = logService;
        this._dataProviders = this._register(new DisposableMap());
        this._dndControllers = new Map();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTreeViews);
    }
    async $registerTreeViewDataProvider(treeViewId, options) {
        this.logService.trace('MainThreadTreeViews#$registerTreeViewDataProvider', treeViewId, options);
        this.extensionService.whenInstalledExtensionsRegistered().then(() => {
            const dataProvider = new TreeViewDataProvider(treeViewId, this._proxy, this.notificationService);
            const disposables = new DisposableStore();
            this._dataProviders.set(treeViewId, { dataProvider, dispose: () => disposables.dispose() });
            const dndController = (options.hasHandleDrag || options.hasHandleDrop)
                ? new TreeViewDragAndDropController(treeViewId, options.dropMimeTypes, options.dragMimeTypes, options.hasHandleDrag, this._proxy) : undefined;
            const viewer = this.getTreeView(treeViewId);
            if (viewer) {
                // Order is important here. The internal tree isn't created until the dataProvider is set.
                // Set all other properties first!
                viewer.showCollapseAllAction = options.showCollapseAll;
                viewer.canSelectMany = options.canSelectMany;
                viewer.manuallyManageCheckboxes = options.manuallyManageCheckboxes;
                viewer.dragAndDropController = dndController;
                if (dndController) {
                    this._dndControllers.set(treeViewId, dndController);
                }
                viewer.dataProvider = dataProvider;
                this.registerListeners(treeViewId, viewer, disposables);
                this._proxy.$setVisible(treeViewId, viewer.visible);
            }
            else {
                this.notificationService.error('No view is registered with id: ' + treeViewId);
            }
        });
    }
    $reveal(treeViewId, itemInfo, options) {
        this.logService.trace('MainThreadTreeViews#$reveal', treeViewId, itemInfo?.item, itemInfo?.parentChain, options);
        return this.viewsService.openView(treeViewId, options.focus)
            .then(() => {
            const viewer = this.getTreeView(treeViewId);
            if (viewer && itemInfo) {
                return this.reveal(viewer, this._dataProviders.get(treeViewId).dataProvider, itemInfo.item, itemInfo.parentChain, options);
            }
            return undefined;
        });
    }
    $refresh(treeViewId, itemsToRefreshByHandle) {
        this.logService.trace('MainThreadTreeViews#$refresh', treeViewId, itemsToRefreshByHandle);
        const viewer = this.getTreeView(treeViewId);
        const dataProvider = this._dataProviders.get(treeViewId);
        if (viewer && dataProvider) {
            const itemsToRefresh = dataProvider.dataProvider.getItemsToRefresh(itemsToRefreshByHandle);
            return viewer.refresh(itemsToRefresh.items.length ? itemsToRefresh.items : undefined, itemsToRefresh.checkboxes.length ? itemsToRefresh.checkboxes : undefined);
        }
        return Promise.resolve();
    }
    $setMessage(treeViewId, message) {
        this.logService.trace('MainThreadTreeViews#$setMessage', treeViewId, message.toString());
        const viewer = this.getTreeView(treeViewId);
        if (viewer) {
            viewer.message = message;
        }
    }
    $setTitle(treeViewId, title, description) {
        this.logService.trace('MainThreadTreeViews#$setTitle', treeViewId, title, description);
        const viewer = this.getTreeView(treeViewId);
        if (viewer) {
            viewer.title = title;
            viewer.description = description;
        }
    }
    $setBadge(treeViewId, badge) {
        this.logService.trace('MainThreadTreeViews#$setBadge', treeViewId, badge?.value, badge?.tooltip);
        const viewer = this.getTreeView(treeViewId);
        if (viewer) {
            viewer.badge = badge;
        }
    }
    $resolveDropFileData(destinationViewId, requestId, dataItemId) {
        const controller = this._dndControllers.get(destinationViewId);
        if (!controller) {
            throw new Error('Unknown tree');
        }
        return controller.resolveDropFileData(requestId, dataItemId);
    }
    async $disposeTree(treeViewId) {
        const viewer = this.getTreeView(treeViewId);
        if (viewer) {
            viewer.dataProvider = undefined;
        }
        this._dataProviders.deleteAndDispose(treeViewId);
    }
    async reveal(treeView, dataProvider, itemIn, parentChain, options) {
        options = options ? options : { select: false, focus: false };
        const select = isUndefinedOrNull(options.select) ? false : options.select;
        const focus = isUndefinedOrNull(options.focus) ? false : options.focus;
        let expand = Math.min(isNumber(options.expand) ? options.expand : options.expand === true ? 1 : 0, 3);
        if (dataProvider.isEmpty()) {
            // Refresh if empty
            await treeView.refresh();
        }
        for (const parent of parentChain) {
            const parentItem = dataProvider.getItem(parent.handle);
            if (parentItem) {
                await treeView.expand(parentItem);
            }
        }
        const item = dataProvider.getItem(itemIn.handle);
        if (item) {
            await treeView.reveal(item);
            if (select) {
                treeView.setSelection([item]);
            }
            if (focus === false) {
                treeView.setFocus();
            }
            else if (focus) {
                treeView.setFocus(item);
            }
            let itemsToExpand = [item];
            for (; itemsToExpand.length > 0 && expand > 0; expand--) {
                await treeView.expand(itemsToExpand);
                itemsToExpand = itemsToExpand.reduce((result, itemValue) => {
                    const item = dataProvider.getItem(itemValue.handle);
                    if (item && item.children && item.children.length) {
                        result.push(...item.children);
                    }
                    return result;
                }, []);
            }
        }
    }
    registerListeners(treeViewId, treeView, disposables) {
        disposables.add(treeView.onDidExpandItem(item => this._proxy.$setExpanded(treeViewId, item.handle, true)));
        disposables.add(treeView.onDidCollapseItem(item => this._proxy.$setExpanded(treeViewId, item.handle, false)));
        disposables.add(treeView.onDidChangeSelectionAndFocus(items => this._proxy.$setSelectionAndFocus(treeViewId, items.selection.map(({ handle }) => handle), items.focus.handle)));
        disposables.add(treeView.onDidChangeVisibility(isVisible => this._proxy.$setVisible(treeViewId, isVisible)));
        disposables.add(treeView.onDidChangeCheckboxState(items => {
            this._proxy.$changeCheckboxState(treeViewId, items.map(item => {
                return { treeItemHandle: item.handle, newState: item.checkbox?.isChecked ?? false };
            }));
        }));
    }
    getTreeView(treeViewId) {
        const viewDescriptor = Registry.as(Extensions.ViewsRegistry).getView(treeViewId);
        return viewDescriptor ? viewDescriptor.treeView : null;
    }
    dispose() {
        for (const dataprovider of this._dataProviders) {
            const treeView = this.getTreeView(dataprovider[0]);
            if (treeView) {
                treeView.dataProvider = undefined;
            }
        }
        this._dataProviders.dispose();
        this._dndControllers.clear();
        super.dispose();
    }
};
MainThreadTreeViews = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTreeViews),
    __param(1, IViewsService),
    __param(2, INotificationService),
    __param(3, IExtensionService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], MainThreadTreeViews);
export { MainThreadTreeViews };
class TreeViewDragAndDropController {
    constructor(treeViewId, dropMimeTypes, dragMimeTypes, hasWillDrop, _proxy) {
        this.treeViewId = treeViewId;
        this.dropMimeTypes = dropMimeTypes;
        this.dragMimeTypes = dragMimeTypes;
        this.hasWillDrop = hasWillDrop;
        this._proxy = _proxy;
        this.dataTransfersCache = new DataTransferFileCache();
    }
    async handleDrop(dataTransfer, targetTreeItem, token, operationUuid, sourceTreeId, sourceTreeItemHandles) {
        const request = this.dataTransfersCache.add(dataTransfer);
        try {
            const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
            if (token.isCancellationRequested) {
                return;
            }
            return await this._proxy.$handleDrop(this.treeViewId, request.id, dataTransferDto, targetTreeItem?.handle, token, operationUuid, sourceTreeId, sourceTreeItemHandles);
        }
        finally {
            request.dispose();
        }
    }
    async handleDrag(sourceTreeItemHandles, operationUuid, token) {
        if (!this.hasWillDrop) {
            return;
        }
        const additionalDataTransferDTO = await this._proxy.$handleDrag(this.treeViewId, sourceTreeItemHandles, operationUuid, token);
        if (!additionalDataTransferDTO) {
            return;
        }
        const additionalDataTransfer = new VSDataTransfer();
        additionalDataTransferDTO.items.forEach(([type, item]) => {
            additionalDataTransfer.replace(type, createStringDataTransferItem(item.asString));
        });
        return additionalDataTransfer;
    }
    resolveDropFileData(requestId, dataItemId) {
        return this.dataTransfersCache.resolveFileData(requestId, dataItemId);
    }
}
class TreeViewDataProvider {
    constructor(treeViewId, _proxy, notificationService) {
        this.treeViewId = treeViewId;
        this._proxy = _proxy;
        this.notificationService = notificationService;
        this.itemsMap = new Map();
        this.hasResolve = this._proxy.$hasResolve(this.treeViewId);
    }
    getChildren(treeItem) {
        if (!treeItem) {
            this.itemsMap.clear();
        }
        return this._proxy.$getChildren(this.treeViewId, treeItem ? treeItem.handle : undefined)
            .then(children => this.postGetChildren(children), err => {
            // It can happen that a tree view is disposed right as `getChildren` is called. This results in an error because the data provider gets removed.
            // The tree will shortly get cleaned up in this case. We just need to handle the error here.
            if (!NoTreeViewError.is(err)) {
                this.notificationService.error(err);
            }
            return [];
        });
    }
    getItemsToRefresh(itemsToRefreshByHandle) {
        const itemsToRefresh = [];
        const checkboxesToRefresh = [];
        if (itemsToRefreshByHandle) {
            for (const newTreeItemHandle of Object.keys(itemsToRefreshByHandle)) {
                const currentTreeItem = this.getItem(newTreeItemHandle);
                if (currentTreeItem) { // Refresh only if the item exists
                    const newTreeItem = itemsToRefreshByHandle[newTreeItemHandle];
                    if (currentTreeItem.checkbox?.isChecked !== newTreeItem.checkbox?.isChecked) {
                        checkboxesToRefresh.push(currentTreeItem);
                    }
                    // Update the current item with refreshed item
                    this.updateTreeItem(currentTreeItem, newTreeItem);
                    if (newTreeItemHandle === newTreeItem.handle) {
                        itemsToRefresh.push(currentTreeItem);
                    }
                    else {
                        // Update maps when handle is changed and refresh parent
                        this.itemsMap.delete(newTreeItemHandle);
                        this.itemsMap.set(currentTreeItem.handle, currentTreeItem);
                        const parent = newTreeItem.parentHandle ? this.itemsMap.get(newTreeItem.parentHandle) : null;
                        if (parent) {
                            itemsToRefresh.push(parent);
                        }
                    }
                }
            }
        }
        return { items: itemsToRefresh, checkboxes: checkboxesToRefresh };
    }
    getItem(treeItemHandle) {
        return this.itemsMap.get(treeItemHandle);
    }
    isEmpty() {
        return this.itemsMap.size === 0;
    }
    async postGetChildren(elements) {
        if (elements === undefined) {
            return undefined;
        }
        const result = [];
        const hasResolve = await this.hasResolve;
        if (elements) {
            for (const element of elements) {
                const resolvable = new ResolvableTreeItem(element, hasResolve ? (token) => {
                    return this._proxy.$resolve(this.treeViewId, element.handle, token);
                } : undefined);
                this.itemsMap.set(element.handle, resolvable);
                result.push(resolvable);
            }
        }
        return result;
    }
    updateTreeItem(current, treeItem) {
        treeItem.children = treeItem.children ? treeItem.children : undefined;
        if (current) {
            const properties = distinct([...Object.keys(current instanceof ResolvableTreeItem ? current.asTreeItem() : current),
                ...Object.keys(treeItem)]);
            for (const property of properties) {
                current[property] = treeItem[property];
            }
            if (current instanceof ResolvableTreeItem) {
                current.resetResolve();
            }
        }
    }
}
