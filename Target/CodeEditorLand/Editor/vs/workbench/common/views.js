import { Emitter } from '../../base/common/event.js';
import { localize } from '../../nls.js';
import { createDecorator } from '../../platform/instantiation/common/instantiation.js';
import { Disposable, toDisposable } from '../../base/common/lifecycle.js';
import { getOrSet, SetMap } from '../../base/common/map.js';
import { Registry } from '../../platform/registry/common/platform.js';
import { mixin } from '../../base/common/objects.js';
import { Codicon } from '../../base/common/codicons.js';
import { registerIcon } from '../../platform/theme/common/iconRegistry.js';
export const VIEWS_LOG_ID = 'views';
export const VIEWS_LOG_NAME = localize('views log', "Views");
export const defaultViewIcon = registerIcon('default-view-icon', Codicon.window, localize('defaultViewIcon', 'Default view icon.'));
export var Extensions;
(function (Extensions) {
    Extensions.ViewContainersRegistry = 'workbench.registry.view.containers';
    Extensions.ViewsRegistry = 'workbench.registry.view';
})(Extensions || (Extensions = {}));
export const ViewContainerLocations = [0, 1, 2];
export function ViewContainerLocationToString(viewContainerLocation) {
    switch (viewContainerLocation) {
        case 0: return 'sidebar';
        case 1: return 'panel';
        case 2: return 'auxiliarybar';
    }
}
class ViewContainersRegistryImpl extends Disposable {
    constructor() {
        super(...arguments);
        this._onDidRegister = this._register(new Emitter());
        this.onDidRegister = this._onDidRegister.event;
        this._onDidDeregister = this._register(new Emitter());
        this.onDidDeregister = this._onDidDeregister.event;
        this.viewContainers = new Map();
        this.defaultViewContainers = [];
    }
    get all() {
        return [...this.viewContainers.values()].flat();
    }
    registerViewContainer(viewContainerDescriptor, viewContainerLocation, options) {
        const existing = this.get(viewContainerDescriptor.id);
        if (existing) {
            return existing;
        }
        const viewContainer = viewContainerDescriptor;
        viewContainer.openCommandActionDescriptor = options?.doNotRegisterOpenCommand ? undefined : (viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id });
        const viewContainers = getOrSet(this.viewContainers, viewContainerLocation, []);
        viewContainers.push(viewContainer);
        if (options?.isDefault) {
            this.defaultViewContainers.push(viewContainer);
        }
        this._onDidRegister.fire({ viewContainer, viewContainerLocation });
        return viewContainer;
    }
    deregisterViewContainer(viewContainer) {
        for (const viewContainerLocation of this.viewContainers.keys()) {
            const viewContainers = this.viewContainers.get(viewContainerLocation);
            const index = viewContainers?.indexOf(viewContainer);
            if (index !== -1) {
                viewContainers?.splice(index, 1);
                if (viewContainers.length === 0) {
                    this.viewContainers.delete(viewContainerLocation);
                }
                this._onDidDeregister.fire({ viewContainer, viewContainerLocation });
                return;
            }
        }
    }
    get(id) {
        return this.all.filter(viewContainer => viewContainer.id === id)[0];
    }
    getViewContainers(location) {
        return [...(this.viewContainers.get(location) || [])];
    }
    getViewContainerLocation(container) {
        return [...this.viewContainers.keys()].filter(location => this.getViewContainers(location).filter(viewContainer => viewContainer?.id === container.id).length > 0)[0];
    }
    getDefaultViewContainer(location) {
        return this.defaultViewContainers.find(viewContainer => this.getViewContainerLocation(viewContainer) === location);
    }
}
Registry.add(Extensions.ViewContainersRegistry, new ViewContainersRegistryImpl());
export var ViewContentGroups;
(function (ViewContentGroups) {
    ViewContentGroups["Open"] = "2_open";
    ViewContentGroups["Debug"] = "4_debug";
    ViewContentGroups["SCM"] = "5_scm";
    ViewContentGroups["More"] = "9_more";
})(ViewContentGroups || (ViewContentGroups = {}));
function compareViewContentDescriptors(a, b) {
    const aGroup = a.group ?? ViewContentGroups.More;
    const bGroup = b.group ?? ViewContentGroups.More;
    if (aGroup !== bGroup) {
        return aGroup.localeCompare(bGroup);
    }
    return (a.order ?? 5) - (b.order ?? 5);
}
class ViewsRegistry extends Disposable {
    constructor() {
        super(...arguments);
        this._onViewsRegistered = this._register(new Emitter());
        this.onViewsRegistered = this._onViewsRegistered.event;
        this._onViewsDeregistered = this._register(new Emitter());
        this.onViewsDeregistered = this._onViewsDeregistered.event;
        this._onDidChangeContainer = this._register(new Emitter());
        this.onDidChangeContainer = this._onDidChangeContainer.event;
        this._onDidChangeViewWelcomeContent = this._register(new Emitter());
        this.onDidChangeViewWelcomeContent = this._onDidChangeViewWelcomeContent.event;
        this._viewContainers = [];
        this._views = new Map();
        this._viewWelcomeContents = new SetMap();
    }
    registerViews(views, viewContainer) {
        this.registerViews2([{ views, viewContainer }]);
    }
    registerViews2(views) {
        views.forEach(({ views, viewContainer }) => this.addViews(views, viewContainer));
        this._onViewsRegistered.fire(views);
    }
    deregisterViews(viewDescriptors, viewContainer) {
        const views = this.removeViews(viewDescriptors, viewContainer);
        if (views.length) {
            this._onViewsDeregistered.fire({ views, viewContainer });
        }
    }
    moveViews(viewsToMove, viewContainer) {
        for (const container of this._views.keys()) {
            if (container !== viewContainer) {
                const views = this.removeViews(viewsToMove, container);
                if (views.length) {
                    this.addViews(views, viewContainer);
                    this._onDidChangeContainer.fire({ views, from: container, to: viewContainer });
                }
            }
        }
    }
    getViews(loc) {
        return this._views.get(loc) || [];
    }
    getView(id) {
        for (const viewContainer of this._viewContainers) {
            const viewDescriptor = (this._views.get(viewContainer) || []).filter(v => v.id === id)[0];
            if (viewDescriptor) {
                return viewDescriptor;
            }
        }
        return null;
    }
    getViewContainer(viewId) {
        for (const viewContainer of this._viewContainers) {
            const viewDescriptor = (this._views.get(viewContainer) || []).filter(v => v.id === viewId)[0];
            if (viewDescriptor) {
                return viewContainer;
            }
        }
        return null;
    }
    registerViewWelcomeContent(id, viewContent) {
        this._viewWelcomeContents.add(id, viewContent);
        this._onDidChangeViewWelcomeContent.fire(id);
        return toDisposable(() => {
            this._viewWelcomeContents.delete(id, viewContent);
            this._onDidChangeViewWelcomeContent.fire(id);
        });
    }
    registerViewWelcomeContent2(id, viewContentMap) {
        const disposables = new Map();
        for (const [key, content] of viewContentMap) {
            this._viewWelcomeContents.add(id, content);
            disposables.set(key, toDisposable(() => {
                this._viewWelcomeContents.delete(id, content);
                this._onDidChangeViewWelcomeContent.fire(id);
            }));
        }
        this._onDidChangeViewWelcomeContent.fire(id);
        return disposables;
    }
    getViewWelcomeContent(id) {
        const result = [];
        this._viewWelcomeContents.forEach(id, descriptor => result.push(descriptor));
        return result.sort(compareViewContentDescriptors);
    }
    addViews(viewDescriptors, viewContainer) {
        let views = this._views.get(viewContainer);
        if (!views) {
            views = [];
            this._views.set(viewContainer, views);
            this._viewContainers.push(viewContainer);
        }
        for (const viewDescriptor of viewDescriptors) {
            if (this.getView(viewDescriptor.id) !== null) {
                throw new Error(localize('duplicateId', "A view with id '{0}' is already registered", viewDescriptor.id));
            }
            views.push(viewDescriptor);
        }
    }
    removeViews(viewDescriptors, viewContainer) {
        const views = this._views.get(viewContainer);
        if (!views) {
            return [];
        }
        const viewsToDeregister = [];
        const remaningViews = [];
        for (const view of views) {
            if (!viewDescriptors.includes(view)) {
                remaningViews.push(view);
            }
            else {
                viewsToDeregister.push(view);
            }
        }
        if (viewsToDeregister.length) {
            if (remaningViews.length) {
                this._views.set(viewContainer, remaningViews);
            }
            else {
                this._views.delete(viewContainer);
                this._viewContainers.splice(this._viewContainers.indexOf(viewContainer), 1);
            }
        }
        return viewsToDeregister;
    }
}
Registry.add(Extensions.ViewsRegistry, new ViewsRegistry());
export const IViewDescriptorService = createDecorator('viewDescriptorService');
export var ViewVisibilityState;
(function (ViewVisibilityState) {
    ViewVisibilityState[ViewVisibilityState["Default"] = 0] = "Default";
    ViewVisibilityState[ViewVisibilityState["Expand"] = 1] = "Expand";
})(ViewVisibilityState || (ViewVisibilityState = {}));
export var TreeItemCollapsibleState;
(function (TreeItemCollapsibleState) {
    TreeItemCollapsibleState[TreeItemCollapsibleState["None"] = 0] = "None";
    TreeItemCollapsibleState[TreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
    TreeItemCollapsibleState[TreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
})(TreeItemCollapsibleState || (TreeItemCollapsibleState = {}));
export class ResolvableTreeItem {
    constructor(treeItem, resolve) {
        this.resolved = false;
        this._hasResolve = false;
        mixin(this, treeItem);
        this._hasResolve = !!resolve;
        this.resolve = async (token) => {
            if (resolve && !this.resolved) {
                const resolvedItem = await resolve(token);
                if (resolvedItem) {
                    this.tooltip = this.tooltip ?? resolvedItem.tooltip;
                    this.command = this.command ?? resolvedItem.command;
                }
            }
            if (!token.isCancellationRequested) {
                this.resolved = true;
            }
        };
    }
    get hasResolve() {
        return this._hasResolve;
    }
    resetResolve() {
        this.resolved = false;
    }
    asTreeItem() {
        return {
            handle: this.handle,
            parentHandle: this.parentHandle,
            collapsibleState: this.collapsibleState,
            label: this.label,
            description: this.description,
            icon: this.icon,
            iconDark: this.iconDark,
            themeIcon: this.themeIcon,
            resourceUri: this.resourceUri,
            tooltip: this.tooltip,
            contextValue: this.contextValue,
            command: this.command,
            children: this.children,
            accessibilityInformation: this.accessibilityInformation
        };
    }
}
export class NoTreeViewError extends Error {
    constructor(treeViewId) {
        super(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
        this.name = 'NoTreeViewError';
    }
    static is(err) {
        return !!err && err.name === 'NoTreeViewError';
    }
}
