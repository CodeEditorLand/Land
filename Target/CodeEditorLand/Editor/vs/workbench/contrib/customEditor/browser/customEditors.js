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
import './media/customEditor.css';
import { coalesce } from '../../../../base/common/arrays.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { extname, isEqual } from '../../../../base/common/resources.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { RedoCommand, UndoCommand } from '../../../../editor/browser/editorExtensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { DEFAULT_EDITOR_ASSOCIATION, EditorExtensions } from '../../../common/editor.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { CONTEXT_ACTIVE_CUSTOM_EDITOR_ID, CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE, CustomEditorInfoCollection } from '../common/customEditor.js';
import { CustomEditorModelManager } from '../common/customEditorModelManager.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ContributedCustomEditors } from '../common/contributedCustomEditors.js';
import { CustomEditorInput } from './customEditorInput.js';
let CustomEditorService = class CustomEditorService extends Disposable {
    constructor(fileService, storageService, editorService, editorGroupService, instantiationService, uriIdentityService, editorResolverService) {
        super();
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.instantiationService = instantiationService;
        this.uriIdentityService = uriIdentityService;
        this.editorResolverService = editorResolverService;
        this._untitledCounter = 0;
        this._editorResolverDisposables = this._register(new DisposableStore());
        this._editorCapabilities = new Map();
        this._models = new CustomEditorModelManager();
        this._onDidChangeEditorTypes = this._register(new Emitter());
        this.onDidChangeEditorTypes = this._onDidChangeEditorTypes.event;
        this._fileEditorFactory = Registry.as(EditorExtensions.EditorFactory).getFileEditorFactory();
        this._contributedEditors = this._register(new ContributedCustomEditors(storageService));
        // Register the contribution points only emitting one change from the resolver
        this.editorResolverService.bufferChangeEvents(this.registerContributionPoints.bind(this));
        this._register(this._contributedEditors.onChange(() => {
            // Register the contribution points only emitting one change from the resolver
            this.editorResolverService.bufferChangeEvents(this.registerContributionPoints.bind(this));
            this._onDidChangeEditorTypes.fire();
        }));
        // Register group context key providers.
        // These set the context keys for each editor group and the global context
        const activeCustomEditorContextKeyProvider = {
            contextKey: CONTEXT_ACTIVE_CUSTOM_EDITOR_ID,
            getGroupContextKeyValue: group => this.getActiveCustomEditorId(group),
            onDidChange: this.onDidChangeEditorTypes
        };
        const customEditorIsEditableContextKeyProvider = {
            contextKey: CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE,
            getGroupContextKeyValue: group => this.getCustomEditorIsEditable(group),
            onDidChange: this.onDidChangeEditorTypes
        };
        this._register(this.editorGroupService.registerContextKeyProvider(activeCustomEditorContextKeyProvider));
        this._register(this.editorGroupService.registerContextKeyProvider(customEditorIsEditableContextKeyProvider));
        this._register(fileService.onDidRunOperation(e => {
            if (e.isOperation(2 /* FileOperation.MOVE */)) {
                this.handleMovedFileInOpenedFileEditors(e.resource, this.uriIdentityService.asCanonicalUri(e.target.resource));
            }
        }));
        const PRIORITY = 105;
        this._register(UndoCommand.addImplementation(PRIORITY, 'custom-editor', () => {
            return this.withActiveCustomEditor(editor => editor.undo());
        }));
        this._register(RedoCommand.addImplementation(PRIORITY, 'custom-editor', () => {
            return this.withActiveCustomEditor(editor => editor.redo());
        }));
    }
    getEditorTypes() {
        return [...this._contributedEditors];
    }
    withActiveCustomEditor(f) {
        const activeEditor = this.editorService.activeEditor;
        if (activeEditor instanceof CustomEditorInput) {
            const result = f(activeEditor);
            if (result) {
                return result;
            }
            return true;
        }
        return false;
    }
    registerContributionPoints() {
        // Clear all previous contributions we know
        this._editorResolverDisposables.clear();
        for (const contributedEditor of this._contributedEditors) {
            for (const globPattern of contributedEditor.selector) {
                if (!globPattern.filenamePattern) {
                    continue;
                }
                this._editorResolverDisposables.add(this.editorResolverService.registerEditor(globPattern.filenamePattern, {
                    id: contributedEditor.id,
                    label: contributedEditor.displayName,
                    detail: contributedEditor.providerDisplayName,
                    priority: contributedEditor.priority,
                }, {
                    singlePerResource: () => !(this.getCustomEditorCapabilities(contributedEditor.id)?.supportsMultipleEditorsPerDocument ?? false)
                }, {
                    createEditorInput: ({ resource }, group) => {
                        return { editor: CustomEditorInput.create(this.instantiationService, resource, contributedEditor.id, group.id) };
                    },
                    createUntitledEditorInput: ({ resource }, group) => {
                        return { editor: CustomEditorInput.create(this.instantiationService, resource ?? URI.from({ scheme: Schemas.untitled, authority: `Untitled-${this._untitledCounter++}` }), contributedEditor.id, group.id) };
                    },
                    createDiffEditorInput: (diffEditorInput, group) => {
                        return { editor: this.createDiffEditorInput(diffEditorInput, contributedEditor.id, group) };
                    },
                }));
            }
        }
    }
    createDiffEditorInput(editor, editorID, group) {
        const modifiedOverride = CustomEditorInput.create(this.instantiationService, assertIsDefined(editor.modified.resource), editorID, group.id, { customClasses: 'modified' });
        const originalOverride = CustomEditorInput.create(this.instantiationService, assertIsDefined(editor.original.resource), editorID, group.id, { customClasses: 'original' });
        return this.instantiationService.createInstance(DiffEditorInput, editor.label, editor.description, originalOverride, modifiedOverride, true);
    }
    get models() { return this._models; }
    getCustomEditor(viewType) {
        return this._contributedEditors.get(viewType);
    }
    getContributedCustomEditors(resource) {
        return new CustomEditorInfoCollection(this._contributedEditors.getContributedEditors(resource));
    }
    getUserConfiguredCustomEditors(resource) {
        const resourceAssocations = this.editorResolverService.getAssociationsForResource(resource);
        return new CustomEditorInfoCollection(coalesce(resourceAssocations
            .map(association => this._contributedEditors.get(association.viewType))));
    }
    getAllCustomEditors(resource) {
        return new CustomEditorInfoCollection([
            ...this.getUserConfiguredCustomEditors(resource).allEditors,
            ...this.getContributedCustomEditors(resource).allEditors,
        ]);
    }
    registerCustomEditorCapabilities(viewType, options) {
        if (this._editorCapabilities.has(viewType)) {
            throw new Error(`Capabilities for ${viewType} already set`);
        }
        this._editorCapabilities.set(viewType, options);
        return toDisposable(() => {
            this._editorCapabilities.delete(viewType);
        });
    }
    getCustomEditorCapabilities(viewType) {
        return this._editorCapabilities.get(viewType);
    }
    getActiveCustomEditorId(group) {
        const activeEditorPane = group.activeEditorPane;
        const resource = activeEditorPane?.input?.resource;
        if (!resource) {
            return '';
        }
        return activeEditorPane?.input instanceof CustomEditorInput ? activeEditorPane.input.viewType : '';
    }
    getCustomEditorIsEditable(group) {
        const activeEditorPane = group.activeEditorPane;
        const resource = activeEditorPane?.input?.resource;
        if (!resource) {
            return false;
        }
        return activeEditorPane?.input instanceof CustomEditorInput;
    }
    async handleMovedFileInOpenedFileEditors(oldResource, newResource) {
        if (extname(oldResource).toLowerCase() === extname(newResource).toLowerCase()) {
            return;
        }
        const possibleEditors = this.getAllCustomEditors(newResource);
        // See if we have any non-optional custom editor for this resource
        if (!possibleEditors.allEditors.some(editor => editor.priority !== RegisteredEditorPriority.option)) {
            return;
        }
        // If so, check all editors to see if there are any file editors open for the new resource
        const editorsToReplace = new Map();
        for (const group of this.editorGroupService.groups) {
            for (const editor of group.editors) {
                if (this._fileEditorFactory.isFileEditor(editor)
                    && !(editor instanceof CustomEditorInput)
                    && isEqual(editor.resource, newResource)) {
                    let entry = editorsToReplace.get(group.id);
                    if (!entry) {
                        entry = [];
                        editorsToReplace.set(group.id, entry);
                    }
                    entry.push(editor);
                }
            }
        }
        if (!editorsToReplace.size) {
            return;
        }
        for (const [group, entries] of editorsToReplace) {
            this.editorService.replaceEditors(entries.map(editor => {
                let replacement;
                if (possibleEditors.defaultEditor) {
                    const viewType = possibleEditors.defaultEditor.id;
                    replacement = CustomEditorInput.create(this.instantiationService, newResource, viewType, group);
                }
                else {
                    replacement = { resource: newResource, options: { override: DEFAULT_EDITOR_ASSOCIATION.id } };
                }
                return {
                    editor,
                    replacement,
                    options: {
                        preserveFocus: true,
                    }
                };
            }), group);
        }
    }
};
CustomEditorService = __decorate([
    __param(0, IFileService),
    __param(1, IStorageService),
    __param(2, IEditorService),
    __param(3, IEditorGroupsService),
    __param(4, IInstantiationService),
    __param(5, IUriIdentityService),
    __param(6, IEditorResolverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], CustomEditorService);
export { CustomEditorService };
