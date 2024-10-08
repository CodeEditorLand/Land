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
import { Event } from '../../../../base/common/event.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { EditorPane } from './editorPane.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { MutableDisposable } from '../../../../base/common/lifecycle.js';
/**
 * Base class of editors that want to store and restore view state.
 */
let AbstractEditorWithViewState = class AbstractEditorWithViewState extends EditorPane {
    constructor(id, group, viewStateStorageKey, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService) {
        super(id, group, telemetryService, themeService, storageService);
        this.instantiationService = instantiationService;
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.groupListener = this._register(new MutableDisposable());
        this.viewState = this.getEditorMemento(editorGroupService, textResourceConfigurationService, viewStateStorageKey, 100);
    }
    setEditorVisible(visible) {
        // Listen to close events to trigger `onWillCloseEditorInGroup`
        this.groupListener.value = this.group.onWillCloseEditor(e => this.onWillCloseEditor(e));
        super.setEditorVisible(visible);
    }
    onWillCloseEditor(e) {
        const editor = e.editor;
        if (editor === this.input) {
            // React to editors closing to preserve or clear view state. This needs to happen
            // in the `onWillCloseEditor` because at that time the editor has not yet
            // been disposed and we can safely persist the view state.
            this.updateEditorViewState(editor);
        }
    }
    clearInput() {
        // Preserve current input view state before clearing
        this.updateEditorViewState(this.input);
        super.clearInput();
    }
    saveState() {
        // Preserve current input view state before shutting down
        this.updateEditorViewState(this.input);
        super.saveState();
    }
    updateEditorViewState(input) {
        if (!input || !this.tracksEditorViewState(input)) {
            return; // ensure we have an input to handle view state for
        }
        const resource = this.toEditorViewStateResource(input);
        if (!resource) {
            return; // we need a resource
        }
        // If we are not tracking disposed editor view state
        // make sure to clear the view state once the editor
        // is disposed.
        if (!this.tracksDisposedEditorViewState()) {
            if (!this.editorViewStateDisposables) {
                this.editorViewStateDisposables = new Map();
            }
            if (!this.editorViewStateDisposables.has(input)) {
                this.editorViewStateDisposables.set(input, Event.once(input.onWillDispose)(() => {
                    this.clearEditorViewState(resource, this.group);
                    this.editorViewStateDisposables?.delete(input);
                }));
            }
        }
        // Clear the editor view state if:
        // - the editor view state should not be tracked for disposed editors
        // - the user configured to not restore view state unless the editor is still opened in the group
        if ((input.isDisposed() && !this.tracksDisposedEditorViewState()) ||
            (!this.shouldRestoreEditorViewState(input) && !this.group.contains(input))) {
            this.clearEditorViewState(resource, this.group);
        }
        // Otherwise we save the view state
        else if (!input.isDisposed()) {
            this.saveEditorViewState(resource);
        }
    }
    shouldRestoreEditorViewState(input, context) {
        // new editor: check with workbench.editor.restoreViewState setting
        if (context?.newInGroup) {
            return this.textResourceConfigurationService.getValue(EditorResourceAccessor.getOriginalUri(input, { supportSideBySide: SideBySideEditor.PRIMARY }), 'workbench.editor.restoreViewState') === false ? false : true /* restore by default */;
        }
        // existing editor: always restore viewstate
        return true;
    }
    getViewState() {
        const input = this.input;
        if (!input || !this.tracksEditorViewState(input)) {
            return; // need valid input for view state
        }
        const resource = this.toEditorViewStateResource(input);
        if (!resource) {
            return; // need a resource for finding view state
        }
        return this.computeEditorViewState(resource);
    }
    saveEditorViewState(resource) {
        const editorViewState = this.computeEditorViewState(resource);
        if (!editorViewState) {
            return;
        }
        this.viewState.saveEditorState(this.group, resource, editorViewState);
    }
    loadEditorViewState(input, context) {
        if (!input) {
            return undefined; // we need valid input
        }
        if (!this.tracksEditorViewState(input)) {
            return undefined; // not tracking for input
        }
        if (!this.shouldRestoreEditorViewState(input, context)) {
            return undefined; // not enabled for input
        }
        const resource = this.toEditorViewStateResource(input);
        if (!resource) {
            return; // need a resource for finding view state
        }
        return this.viewState.loadEditorState(this.group, resource);
    }
    moveEditorViewState(source, target, comparer) {
        return this.viewState.moveEditorState(source, target, comparer);
    }
    clearEditorViewState(resource, group) {
        this.viewState.clearEditorState(resource, group);
    }
    dispose() {
        super.dispose();
        if (this.editorViewStateDisposables) {
            for (const [, disposables] of this.editorViewStateDisposables) {
                disposables.dispose();
            }
            this.editorViewStateDisposables = undefined;
        }
    }
    /**
     * Whether view state should be tracked even when the editor is
     * disposed.
     *
     * Subclasses should override this if the input can be restored
     * from the resource at a later point, e.g. if backed by files.
     */
    tracksDisposedEditorViewState() {
        return false;
    }
};
AbstractEditorWithViewState = __decorate([
    __param(3, ITelemetryService),
    __param(4, IInstantiationService),
    __param(5, IStorageService),
    __param(6, ITextResourceConfigurationService),
    __param(7, IThemeService),
    __param(8, IEditorService),
    __param(9, IEditorGroupsService),
    __metadata("design:paramtypes", [String, Object, String, Object, Object, Object, Object, Object, Object, Object])
], AbstractEditorWithViewState);
export { AbstractEditorWithViewState };
