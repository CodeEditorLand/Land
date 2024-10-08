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
import { ResourceMap } from '../../../../../base/common/map.js';
import { getDefaultNotebookCreationOptions, NotebookEditorWidget } from '../notebookEditorWidget.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { isCompositeNotebookEditorInput, isNotebookEditorInput, NotebookEditorInput } from '../../common/notebookEditorInput.js';
import { Emitter } from '../../../../../base/common/event.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { InteractiveWindowOpen } from '../../common/notebookContextKeys.js';
import { ServiceCollection } from '../../../../../platform/instantiation/common/serviceCollection.js';
import { IEditorProgressService } from '../../../../../platform/progress/common/progress.js';
let NotebookEditorWidgetService = class NotebookEditorWidgetService {
    constructor(editorGroupService, editorService, contextKeyService, instantiationService) {
        this.editorGroupService = editorGroupService;
        this.instantiationService = instantiationService;
        this._tokenPool = 1;
        this._disposables = new DisposableStore();
        this._notebookEditors = new Map();
        this.groupListener = new Map();
        this._onNotebookEditorAdd = new Emitter();
        this._onNotebookEditorsRemove = new Emitter();
        this.onDidAddNotebookEditor = this._onNotebookEditorAdd.event;
        this.onDidRemoveNotebookEditor = this._onNotebookEditorsRemove.event;
        this._borrowableEditors = new Map();
        const onNewGroup = (group) => {
            const { id } = group;
            const listeners = [];
            listeners.push(group.onDidCloseEditor(e => {
                const widgetMap = this._borrowableEditors.get(group.id);
                if (!widgetMap) {
                    return;
                }
                const inputs = e.editor instanceof NotebookEditorInput ? [e.editor] : (isCompositeNotebookEditorInput(e.editor) ? e.editor.editorInputs : []);
                inputs.forEach(input => {
                    const widgets = widgetMap.get(input.resource);
                    const index = widgets?.findIndex(widget => widget.editorType === input.typeId);
                    if (!widgets || index === undefined || index === -1) {
                        return;
                    }
                    const value = widgets.splice(index, 1)[0];
                    value.token = undefined;
                    this._disposeWidget(value.widget);
                    value.widget = undefined; // unset the widget so that others that still hold a reference don't harm us
                });
            }));
            listeners.push(group.onWillMoveEditor(e => {
                if (isNotebookEditorInput(e.editor)) {
                    this._allowWidgetMove(e.editor, e.groupId, e.target);
                }
                if (isCompositeNotebookEditorInput(e.editor)) {
                    e.editor.editorInputs.forEach(input => {
                        this._allowWidgetMove(input, e.groupId, e.target);
                    });
                }
            }));
            this.groupListener.set(id, listeners);
        };
        this._disposables.add(editorGroupService.onDidAddGroup(onNewGroup));
        editorGroupService.whenReady.then(() => editorGroupService.groups.forEach(onNewGroup));
        // group removed -> clean up listeners, clean up widgets
        this._disposables.add(editorGroupService.onDidRemoveGroup(group => {
            const listeners = this.groupListener.get(group.id);
            if (listeners) {
                listeners.forEach(listener => listener.dispose());
                this.groupListener.delete(group.id);
            }
            const widgets = this._borrowableEditors.get(group.id);
            this._borrowableEditors.delete(group.id);
            if (widgets) {
                for (const values of widgets.values()) {
                    for (const value of values) {
                        value.token = undefined;
                        this._disposeWidget(value.widget);
                    }
                }
            }
        }));
        const interactiveWindowOpen = InteractiveWindowOpen.bindTo(contextKeyService);
        this._disposables.add(editorService.onDidEditorsChange(e => {
            if (e.event.kind === 5 /* GroupModelChangeKind.EDITOR_OPEN */ && !interactiveWindowOpen.get()) {
                if (editorService.editors.find(editor => isCompositeNotebookEditorInput(editor))) {
                    interactiveWindowOpen.set(true);
                }
            }
            else if (e.event.kind === 6 /* GroupModelChangeKind.EDITOR_CLOSE */ && interactiveWindowOpen.get()) {
                if (!editorService.editors.find(editor => isCompositeNotebookEditorInput(editor))) {
                    interactiveWindowOpen.set(false);
                }
            }
        }));
    }
    dispose() {
        this._disposables.dispose();
        this._onNotebookEditorAdd.dispose();
        this._onNotebookEditorsRemove.dispose();
        this.groupListener.forEach((listeners) => {
            listeners.forEach(listener => listener.dispose());
        });
        this.groupListener.clear();
    }
    // --- group-based editor borrowing...
    _disposeWidget(widget) {
        widget.onWillHide();
        const domNode = widget.getDomNode();
        widget.dispose();
        domNode.remove();
    }
    _allowWidgetMove(input, sourceID, targetID) {
        const sourcePart = this.editorGroupService.getPart(sourceID);
        const targetPart = this.editorGroupService.getPart(targetID);
        if (sourcePart.windowId !== targetPart.windowId) {
            return;
        }
        const target = this._borrowableEditors.get(targetID)?.get(input.resource)?.findIndex(widget => widget.editorType === input.typeId);
        if (target !== undefined && target !== -1) {
            // not needed, a separate widget is already there
            return;
        }
        const widget = this._borrowableEditors.get(sourceID)?.get(input.resource)?.find(widget => widget.editorType === input.typeId);
        if (!widget) {
            throw new Error('no widget at source group');
        }
        // don't allow the widget to be retrieved at its previous location any more
        const sourceWidgets = this._borrowableEditors.get(sourceID)?.get(input.resource);
        if (sourceWidgets) {
            const indexToRemove = sourceWidgets.findIndex(widget => widget.editorType === input.typeId);
            if (indexToRemove !== -1) {
                sourceWidgets.splice(indexToRemove, 1);
            }
        }
        // allow the widget to be retrieved at its new location
        let targetMap = this._borrowableEditors.get(targetID);
        if (!targetMap) {
            targetMap = new ResourceMap();
            this._borrowableEditors.set(targetID, targetMap);
        }
        const widgetsAtTarget = targetMap.get(input.resource) ?? [];
        widgetsAtTarget?.push(widget);
        targetMap.set(input.resource, widgetsAtTarget);
    }
    retrieveExistingWidgetFromURI(resource) {
        for (const widgetInfo of this._borrowableEditors.values()) {
            const widgets = widgetInfo.get(resource);
            if (widgets && widgets.length > 0) {
                return this._createBorrowValue(widgets[0].token, widgets[0]);
            }
        }
        return undefined;
    }
    retrieveAllExistingWidgets() {
        const ret = [];
        for (const widgetInfo of this._borrowableEditors.values()) {
            for (const widgets of widgetInfo.values()) {
                for (const widget of widgets) {
                    ret.push(this._createBorrowValue(widget.token, widget));
                }
            }
        }
        return ret;
    }
    retrieveWidget(accessor, groupId, input, creationOptions, initialDimension, codeWindow) {
        let value = this._borrowableEditors.get(groupId)?.get(input.resource)?.find(widget => widget.editorType === input.typeId);
        if (!value) {
            // NEW widget
            const editorGroupContextKeyService = accessor.get(IContextKeyService);
            const editorGroupEditorProgressService = accessor.get(IEditorProgressService);
            const widget = this.createWidget(editorGroupContextKeyService, editorGroupEditorProgressService, creationOptions, codeWindow, initialDimension);
            const token = this._tokenPool++;
            value = { widget, editorType: input.typeId, token };
            let map = this._borrowableEditors.get(groupId);
            if (!map) {
                map = new ResourceMap();
                this._borrowableEditors.set(groupId, map);
            }
            const values = map.get(input.resource) ?? [];
            values.push(value);
            map.set(input.resource, values);
        }
        else {
            // reuse a widget which was either free'ed before or which
            // is simply being reused...
            value.token = this._tokenPool++;
        }
        return this._createBorrowValue(value.token, value);
    }
    // protected for unit testing overrides
    createWidget(editorGroupContextKeyService, editorGroupEditorProgressService, creationOptions, codeWindow, initialDimension) {
        const notebookInstantiationService = this.instantiationService.createChild(new ServiceCollection([IContextKeyService, editorGroupContextKeyService], [IEditorProgressService, editorGroupEditorProgressService]));
        const ctorOptions = creationOptions ?? getDefaultNotebookCreationOptions();
        const widget = notebookInstantiationService.createInstance(NotebookEditorWidget, {
            ...ctorOptions,
            codeWindow: codeWindow ?? ctorOptions.codeWindow,
        }, initialDimension);
        return widget;
    }
    _createBorrowValue(myToken, widget) {
        return {
            get value() {
                return widget.token === myToken ? widget.widget : undefined;
            }
        };
    }
    // --- editor management
    addNotebookEditor(editor) {
        this._notebookEditors.set(editor.getId(), editor);
        this._onNotebookEditorAdd.fire(editor);
    }
    removeNotebookEditor(editor) {
        if (this._notebookEditors.has(editor.getId())) {
            this._notebookEditors.delete(editor.getId());
            this._onNotebookEditorsRemove.fire(editor);
        }
    }
    getNotebookEditor(editorId) {
        return this._notebookEditors.get(editorId);
    }
    listNotebookEditors() {
        return [...this._notebookEditors].map(e => e[1]);
    }
};
NotebookEditorWidgetService = __decorate([
    __param(0, IEditorGroupsService),
    __param(1, IEditorService),
    __param(2, IContextKeyService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NotebookEditorWidgetService);
export { NotebookEditorWidgetService };
