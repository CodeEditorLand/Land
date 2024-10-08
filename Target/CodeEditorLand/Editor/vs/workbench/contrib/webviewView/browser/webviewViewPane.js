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
var WebviewViewPane_1;
import { addDisposableListener, Dimension, EventType, findParentWithClass, getWindow } from '../../../../base/browser/dom.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ViewPane, ViewPaneShowActions } from '../../../browser/parts/views/viewPane.js';
import { Memento } from '../../../common/memento.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ExtensionKeyedWebviewOriginStore, IWebviewService } from '../../webview/browser/webview.js';
import { WebviewWindowDragMonitor } from '../../webview/browser/webviewWindowDragMonitor.js';
import { IWebviewViewService } from './webviewViewService.js';
import { IActivityService, NumberBadge } from '../../../services/activity/common/activity.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
const storageKeys = {
    webviewState: 'webviewState',
};
let WebviewViewPane = class WebviewViewPane extends ViewPane {
    static { WebviewViewPane_1 = this; }
    static getOriginStore(storageService) {
        this._originStore ??= new ExtensionKeyedWebviewOriginStore('webviewViews.origins', storageService);
        return this._originStore;
    }
    constructor(options, configurationService, contextKeyService, contextMenuService, instantiationService, keybindingService, openerService, telemetryService, hoverService, themeService, viewDescriptorService, activityService, extensionService, progressService, storageService, viewService, webviewService, webviewViewService) {
        super({ ...options, titleMenuId: MenuId.ViewTitle, showActions: ViewPaneShowActions.WhenExpanded }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.activityService = activityService;
        this.extensionService = extensionService;
        this.progressService = progressService;
        this.storageService = storageService;
        this.viewService = viewService;
        this.webviewService = webviewService;
        this.webviewViewService = webviewViewService;
        this._webview = this._register(new MutableDisposable());
        this._webviewDisposables = this._register(new DisposableStore());
        this._activated = false;
        this.activity = this._register(new MutableDisposable());
        this._onDidChangeVisibility = this._register(new Emitter());
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this._onDispose = this._register(new Emitter());
        this.onDispose = this._onDispose.event;
        this.extensionId = options.fromExtensionId;
        this.defaultTitle = this.title;
        this.memento = new Memento(`webviewView.${this.id}`, storageService);
        this.viewState = this.memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
        this._register(this.webviewViewService.onNewResolverRegistered(e => {
            if (e.viewType === this.id) {
                // Potentially re-activate if we have a new resolver
                this.updateTreeVisibility();
            }
        }));
        this.updateTreeVisibility();
    }
    dispose() {
        this._onDispose.fire();
        clearTimeout(this._repositionTimeout);
        super.dispose();
    }
    focus() {
        super.focus();
        this._webview.value?.focus();
    }
    renderBody(container) {
        super.renderBody(container);
        this._container = container;
        this._rootContainer = undefined;
        if (!this._resizeObserver) {
            this._resizeObserver = new ResizeObserver(() => {
                setTimeout(() => {
                    this.layoutWebview();
                }, 0);
            });
            this._register(toDisposable(() => {
                this._resizeObserver.disconnect();
            }));
            this._resizeObserver.observe(container);
        }
    }
    saveState() {
        if (this._webview.value) {
            this.viewState[storageKeys.webviewState] = this._webview.value.state;
        }
        this.memento.saveMemento();
        super.saveState();
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.layoutWebview(new Dimension(width, height));
    }
    updateTreeVisibility() {
        if (this.isBodyVisible()) {
            this.activate();
            this._webview.value?.claim(this, getWindow(this.element), undefined);
        }
        else {
            this._webview.value?.release(this);
        }
    }
    activate() {
        if (this._activated) {
            return;
        }
        this._activated = true;
        const origin = this.extensionId ? WebviewViewPane_1.getOriginStore(this.storageService).getOrigin(this.id, this.extensionId) : undefined;
        const webview = this.webviewService.createWebviewOverlay({
            origin,
            providedViewType: this.id,
            title: this.title,
            options: { purpose: "webviewView" /* WebviewContentPurpose.WebviewView */ },
            contentOptions: {},
            extension: this.extensionId ? { id: this.extensionId } : undefined
        });
        webview.state = this.viewState[storageKeys.webviewState];
        this._webview.value = webview;
        if (this._container) {
            this.layoutWebview();
        }
        this._webviewDisposables.add(toDisposable(() => {
            this._webview.value?.release(this);
        }));
        this._webviewDisposables.add(webview.onDidUpdateState(() => {
            this.viewState[storageKeys.webviewState] = webview.state;
        }));
        // Re-dispatch all drag events back to the drop target to support view drag drop
        for (const event of [EventType.DRAG, EventType.DRAG_END, EventType.DRAG_ENTER, EventType.DRAG_LEAVE, EventType.DRAG_START]) {
            this._webviewDisposables.add(addDisposableListener(this._webview.value.container, event, e => {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.dropTargetElement.dispatchEvent(new DragEvent(e.type, e));
            }));
        }
        this._webviewDisposables.add(new WebviewWindowDragMonitor(getWindow(this.element), () => this._webview.value));
        const source = this._webviewDisposables.add(new CancellationTokenSource());
        this.withProgress(async () => {
            await this.extensionService.activateByEvent(`onView:${this.id}`);
            const self = this;
            const webviewView = {
                webview,
                onDidChangeVisibility: this.onDidChangeBodyVisibility,
                onDispose: this.onDispose,
                get title() { return self.setTitle; },
                set title(value) { self.updateTitle(value); },
                get description() { return self.titleDescription; },
                set description(value) { self.updateTitleDescription(value); },
                get badge() { return self.badge; },
                set badge(badge) { self.updateBadge(badge); },
                dispose: () => {
                    // Only reset and clear the webview itself. Don't dispose of the view container
                    this._activated = false;
                    this._webview.clear();
                    this._webviewDisposables.clear();
                },
                show: (preserveFocus) => {
                    this.viewService.openView(this.id, !preserveFocus);
                }
            };
            await this.webviewViewService.resolve(this.id, webviewView, source.token);
        });
    }
    updateTitle(value) {
        this.setTitle = value;
        super.updateTitle(typeof value === 'string' ? value : this.defaultTitle);
    }
    updateBadge(badge) {
        if (this.badge?.value === badge?.value &&
            this.badge?.tooltip === badge?.tooltip) {
            return;
        }
        this.badge = badge;
        if (badge) {
            const activity = {
                badge: new NumberBadge(badge.value, () => badge.tooltip),
                priority: 150
            };
            this.activity.value = this.activityService.showViewActivity(this.id, activity);
        }
    }
    async withProgress(task) {
        return this.progressService.withProgress({ location: this.id, delay: 500 }, task);
    }
    onDidScrollRoot() {
        this.layoutWebview();
    }
    doLayoutWebview(dimension) {
        const webviewEntry = this._webview.value;
        if (!this._container || !webviewEntry) {
            return;
        }
        if (!this._rootContainer || !this._rootContainer.isConnected) {
            this._rootContainer = this.findRootContainer(this._container);
        }
        webviewEntry.layoutWebviewOverElement(this._container, dimension, this._rootContainer);
    }
    layoutWebview(dimension) {
        this.doLayoutWebview(dimension);
        // Temporary fix for https://github.com/microsoft/vscode/issues/110450
        // There is an animation that lasts about 200ms, update the webview positioning once this animation is complete.
        clearTimeout(this._repositionTimeout);
        this._repositionTimeout = setTimeout(() => this.doLayoutWebview(dimension), 200);
    }
    findRootContainer(container) {
        return findParentWithClass(container, 'monaco-scrollable-element') ?? undefined;
    }
};
WebviewViewPane = WebviewViewPane_1 = __decorate([
    __param(1, IConfigurationService),
    __param(2, IContextKeyService),
    __param(3, IContextMenuService),
    __param(4, IInstantiationService),
    __param(5, IKeybindingService),
    __param(6, IOpenerService),
    __param(7, ITelemetryService),
    __param(8, IHoverService),
    __param(9, IThemeService),
    __param(10, IViewDescriptorService),
    __param(11, IActivityService),
    __param(12, IExtensionService),
    __param(13, IProgressService),
    __param(14, IStorageService),
    __param(15, IViewsService),
    __param(16, IWebviewService),
    __param(17, IWebviewViewService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WebviewViewPane);
export { WebviewViewPane };
