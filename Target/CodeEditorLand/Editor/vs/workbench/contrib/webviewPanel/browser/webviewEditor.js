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
var WebviewEditor_1;
import * as DOM from '../../../../base/browser/dom.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { isWeb } from '../../../../base/common/platform.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import * as nls from '../../../../nls.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { WebviewWindowDragMonitor } from '../../webview/browser/webviewWindowDragMonitor.js';
import { WebviewInput } from './webviewEditorInput.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
export const CONTEXT_ACTIVE_WEBVIEW_PANEL_ID = new RawContextKey('activeWebviewPanelId', '', {
    type: 'string',
    description: nls.localize('context.activeWebviewId', "The viewType of the currently active webview panel."),
});
let WebviewEditor = class WebviewEditor extends EditorPane {
    static { WebviewEditor_1 = this; }
    static { this.ID = 'WebviewEditor'; }
    get onDidFocus() { return this._onDidFocusWebview.event; }
    constructor(group, telemetryService, themeService, storageService, _editorGroupsService, _editorService, _workbenchLayoutService, _hostService, _contextKeyService) {
        super(WebviewEditor_1.ID, group, telemetryService, themeService, storageService);
        this._editorGroupsService = _editorGroupsService;
        this._editorService = _editorService;
        this._workbenchLayoutService = _workbenchLayoutService;
        this._hostService = _hostService;
        this._contextKeyService = _contextKeyService;
        this._visible = false;
        this._isDisposed = false;
        this._webviewVisibleDisposables = this._register(new DisposableStore());
        this._onFocusWindowHandler = this._register(new MutableDisposable());
        this._onDidFocusWebview = this._register(new Emitter());
        this._scopedContextKeyService = this._register(new MutableDisposable());
        const part = _editorGroupsService.getPart(group);
        this._register(Event.any(part.onDidScroll, part.onDidAddGroup, part.onDidRemoveGroup, part.onDidMoveGroup)(() => {
            if (this.webview && this._visible) {
                this.synchronizeWebviewContainerDimensions(this.webview);
            }
        }));
    }
    get webview() {
        return this.input instanceof WebviewInput ? this.input.webview : undefined;
    }
    get scopedContextKeyService() {
        return this._scopedContextKeyService.value;
    }
    createEditor(parent) {
        const element = document.createElement('div');
        this._element = element;
        this._element.id = `webview-editor-element-${generateUuid()}`;
        parent.appendChild(element);
        this._scopedContextKeyService.value = this._register(this._contextKeyService.createScoped(element));
    }
    dispose() {
        this._isDisposed = true;
        this._element?.remove();
        this._element = undefined;
        super.dispose();
    }
    layout(dimension) {
        this._dimension = dimension;
        if (this.webview && this._visible) {
            this.synchronizeWebviewContainerDimensions(this.webview, dimension);
        }
    }
    focus() {
        super.focus();
        if (!this._onFocusWindowHandler.value && !isWeb) {
            this._onFocusWindowHandler.value = this._hostService.onDidChangeFocus(focused => {
                if (focused && this._editorService.activeEditorPane === this && this._workbenchLayoutService.hasFocus("workbench.parts.editor")) {
                    this.focus();
                }
            });
        }
        this.webview?.focus();
    }
    setEditorVisible(visible) {
        this._visible = visible;
        if (this.input instanceof WebviewInput && this.webview) {
            if (visible) {
                this.claimWebview(this.input);
            }
            else {
                this.webview.release(this);
            }
        }
        super.setEditorVisible(visible);
    }
    clearInput() {
        if (this.webview) {
            this.webview.release(this);
            this._webviewVisibleDisposables.clear();
        }
        super.clearInput();
    }
    async setInput(input, options, context, token) {
        if (this.input && input.matches(this.input)) {
            return;
        }
        const alreadyOwnsWebview = input instanceof WebviewInput && input.webview === this.webview;
        if (this.webview && !alreadyOwnsWebview) {
            this.webview.release(this);
        }
        await super.setInput(input, options, context, token);
        await input.resolve();
        if (token.isCancellationRequested || this._isDisposed) {
            return;
        }
        if (input instanceof WebviewInput) {
            input.updateGroup(this.group.id);
            if (!alreadyOwnsWebview) {
                this.claimWebview(input);
            }
            if (this._dimension) {
                this.layout(this._dimension);
            }
        }
    }
    claimWebview(input) {
        input.claim(this, this.window, this.scopedContextKeyService);
        if (this._element) {
            this._element.setAttribute('aria-flowto', input.webview.container.id);
            DOM.setParentFlowTo(input.webview.container, this._element);
        }
        this._webviewVisibleDisposables.clear();
        this._webviewVisibleDisposables.add(this._editorGroupsService.createEditorDropTarget(input.webview.container, {
            containsGroup: (group) => this.group.id === group.id
        }));
        this._webviewVisibleDisposables.add(new WebviewWindowDragMonitor(this.window, () => this.webview));
        this.synchronizeWebviewContainerDimensions(input.webview);
        this._webviewVisibleDisposables.add(this.trackFocus(input.webview));
    }
    synchronizeWebviewContainerDimensions(webview, dimension) {
        if (!this._element?.isConnected) {
            return;
        }
        const rootContainer = this._workbenchLayoutService.getContainer(this.window, "workbench.parts.editor");
        webview.layoutWebviewOverElement(this._element.parentElement, dimension, rootContainer);
    }
    trackFocus(webview) {
        const store = new DisposableStore();
        const webviewContentFocusTracker = DOM.trackFocus(webview.container);
        store.add(webviewContentFocusTracker);
        store.add(webviewContentFocusTracker.onDidFocus(() => this._onDidFocusWebview.fire()));
        store.add(webview.onDidFocus(() => this._onDidFocusWebview.fire()));
        return store;
    }
};
WebviewEditor = WebviewEditor_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IThemeService),
    __param(3, IStorageService),
    __param(4, IEditorGroupsService),
    __param(5, IEditorService),
    __param(6, IWorkbenchLayoutService),
    __param(7, IHostService),
    __param(8, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WebviewEditor);
export { WebviewEditor };
