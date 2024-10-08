/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../nls.js';
import { EditorResourceAccessor, EditorExtensions, SideBySideEditor, EditorCloseContext } from '../common/editor.js';
import { Registry } from '../../platform/registry/common/platform.js';
import { toDisposable } from '../../base/common/lifecycle.js';
import { Promises } from '../../base/common/async.js';
import { IEditorService } from '../services/editor/common/editorService.js';
import { IUriIdentityService } from '../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkingCopyService } from '../services/workingCopy/common/workingCopyService.js';
import { Schemas } from '../../base/common/network.js';
import { Iterable } from '../../base/common/iterator.js';
import { Emitter } from '../../base/common/event.js';
/**
 * A lightweight descriptor of an editor pane. The descriptor is deferred so that heavy editor
 * panes can load lazily in the workbench.
 */
export class EditorPaneDescriptor {
    static { this.instantiatedEditorPanes = new Set(); }
    static didInstantiateEditorPane(typeId) {
        return EditorPaneDescriptor.instantiatedEditorPanes.has(typeId);
    }
    static { this._onWillInstantiateEditorPane = new Emitter(); }
    static { this.onWillInstantiateEditorPane = EditorPaneDescriptor._onWillInstantiateEditorPane.event; }
    static create(ctor, typeId, name) {
        return new EditorPaneDescriptor(ctor, typeId, name);
    }
    constructor(ctor, typeId, name) {
        this.ctor = ctor;
        this.typeId = typeId;
        this.name = name;
    }
    instantiate(instantiationService, group) {
        EditorPaneDescriptor._onWillInstantiateEditorPane.fire({ typeId: this.typeId });
        const pane = instantiationService.createInstance(this.ctor, group);
        EditorPaneDescriptor.instantiatedEditorPanes.add(this.typeId);
        return pane;
    }
    describes(editorPane) {
        return editorPane.getId() === this.typeId;
    }
}
export class EditorPaneRegistry {
    constructor() {
        this.mapEditorPanesToEditors = new Map();
        //#endregion
    }
    registerEditorPane(editorPaneDescriptor, editorDescriptors) {
        this.mapEditorPanesToEditors.set(editorPaneDescriptor, editorDescriptors);
        return toDisposable(() => {
            this.mapEditorPanesToEditors.delete(editorPaneDescriptor);
        });
    }
    getEditorPane(editor) {
        const descriptors = this.findEditorPaneDescriptors(editor);
        if (descriptors.length === 0) {
            return undefined;
        }
        if (descriptors.length === 1) {
            return descriptors[0];
        }
        return editor.prefersEditorPane(descriptors);
    }
    findEditorPaneDescriptors(editor, byInstanceOf) {
        const matchingEditorPaneDescriptors = [];
        for (const editorPane of this.mapEditorPanesToEditors.keys()) {
            const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane) || [];
            for (const editorDescriptor of editorDescriptors) {
                const editorClass = editorDescriptor.ctor;
                // Direct check on constructor type (ignores prototype chain)
                if (!byInstanceOf && editor.constructor === editorClass) {
                    matchingEditorPaneDescriptors.push(editorPane);
                    break;
                }
                // Normal instanceof check
                else if (byInstanceOf && editor instanceof editorClass) {
                    matchingEditorPaneDescriptors.push(editorPane);
                    break;
                }
            }
        }
        // If no descriptors found, continue search using instanceof and prototype chain
        if (!byInstanceOf && matchingEditorPaneDescriptors.length === 0) {
            return this.findEditorPaneDescriptors(editor, true);
        }
        return matchingEditorPaneDescriptors;
    }
    //#region Used for tests only
    getEditorPaneByType(typeId) {
        return Iterable.find(this.mapEditorPanesToEditors.keys(), editor => editor.typeId === typeId);
    }
    getEditorPanes() {
        return Array.from(this.mapEditorPanesToEditors.keys());
    }
    getEditors() {
        const editorClasses = [];
        for (const editorPane of this.mapEditorPanesToEditors.keys()) {
            const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane);
            if (editorDescriptors) {
                editorClasses.push(...editorDescriptors.map(editorDescriptor => editorDescriptor.ctor));
            }
        }
        return editorClasses;
    }
}
Registry.add(EditorExtensions.EditorPane, new EditorPaneRegistry());
//#endregion
//#region Editor Close Tracker
export function whenEditorClosed(accessor, resources) {
    const editorService = accessor.get(IEditorService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    const workingCopyService = accessor.get(IWorkingCopyService);
    return new Promise(resolve => {
        let remainingResources = [...resources];
        // Observe any editor closing from this moment on
        const listener = editorService.onDidCloseEditor(async (event) => {
            if (event.context === EditorCloseContext.MOVE) {
                return; // ignore move events where the editor will open in another group
            }
            let primaryResource = EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: SideBySideEditor.PRIMARY });
            let secondaryResource = EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: SideBySideEditor.SECONDARY });
            // Specially handle an editor getting replaced: if the new active editor
            // matches any of the resources from the closed editor, ignore those
            // resources because they were actually not closed, but replaced.
            // (see https://github.com/microsoft/vscode/issues/134299)
            if (event.context === EditorCloseContext.REPLACE) {
                const newPrimaryResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
                const newSecondaryResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.SECONDARY });
                if (uriIdentityService.extUri.isEqual(primaryResource, newPrimaryResource)) {
                    primaryResource = undefined;
                }
                if (uriIdentityService.extUri.isEqual(secondaryResource, newSecondaryResource)) {
                    secondaryResource = undefined;
                }
            }
            // Remove from resources to wait for being closed based on the
            // resources from editors that got closed
            remainingResources = remainingResources.filter(resource => {
                // Closing editor matches resource directly: remove from remaining
                if (uriIdentityService.extUri.isEqual(resource, primaryResource) || uriIdentityService.extUri.isEqual(resource, secondaryResource)) {
                    return false;
                }
                // Closing editor is untitled with associated resource
                // that matches resource directly: remove from remaining
                // but only if the editor was not replaced, otherwise
                // saving an untitled with associated resource would
                // release the `--wait` call.
                // (see https://github.com/microsoft/vscode/issues/141237)
                if (event.context !== EditorCloseContext.REPLACE) {
                    if ((primaryResource?.scheme === Schemas.untitled && uriIdentityService.extUri.isEqual(resource, primaryResource.with({ scheme: resource.scheme }))) ||
                        (secondaryResource?.scheme === Schemas.untitled && uriIdentityService.extUri.isEqual(resource, secondaryResource.with({ scheme: resource.scheme })))) {
                        return false;
                    }
                }
                // Editor is not yet closed, so keep it in waiting mode
                return true;
            });
            // All resources to wait for being closed are closed
            if (remainingResources.length === 0) {
                // If auto save is configured with the default delay (1s) it is possible
                // to close the editor while the save still continues in the background. As such
                // we have to also check if the editors to track for are dirty and if so wait
                // for them to get saved.
                const dirtyResources = resources.filter(resource => workingCopyService.isDirty(resource));
                if (dirtyResources.length > 0) {
                    await Promises.settled(dirtyResources.map(async (resource) => await new Promise(resolve => {
                        if (!workingCopyService.isDirty(resource)) {
                            return resolve(); // return early if resource is not dirty
                        }
                        // Otherwise resolve promise when resource is saved
                        const listener = workingCopyService.onDidChangeDirty(workingCopy => {
                            if (!workingCopy.isDirty() && uriIdentityService.extUri.isEqual(resource, workingCopy.resource)) {
                                listener.dispose();
                                return resolve();
                            }
                        });
                    })));
                }
                listener.dispose();
                return resolve();
            }
        });
    });
}
//#endregion
//#region ARIA
export function computeEditorAriaLabel(input, index, group, groupCount) {
    let ariaLabel = input.getAriaLabel();
    if (group && !group.isPinned(input)) {
        ariaLabel = localize('preview', "{0}, preview", ariaLabel);
    }
    if (group?.isSticky(index ?? input)) {
        ariaLabel = localize('pinned', "{0}, pinned", ariaLabel);
    }
    // Apply group information to help identify in
    // which group we are (only if more than one group
    // is actually opened)
    if (group && typeof groupCount === 'number' && groupCount > 1) {
        ariaLabel = `${ariaLabel}, ${group.ariaLabel}`;
    }
    return ariaLabel;
}
//#endregion
