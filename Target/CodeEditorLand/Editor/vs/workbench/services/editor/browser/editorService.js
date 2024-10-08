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
var EditorService_1;
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { SideBySideEditor, isEditorInputWithOptions, EditorResourceAccessor, isResourceDiffEditorInput, isResourceEditorInput, isEditorInput, isEditorInputWithOptionsAndGroup, isResourceMergeEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { ResourceMap, ResourceSet } from '../../../../base/common/map.js';
import { IFileService, FileChangesEvent } from '../../../../platform/files/common/files.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { joinPath } from '../../../../base/common/resources.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { SideBySideEditor as SideBySideEditorPane } from '../../../browser/parts/editor/sideBySideEditor.js';
import { IEditorGroupsService, isEditorReplacement } from '../common/editorGroupsService.js';
import { IEditorService, isPreferredGroup } from '../common/editorService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Disposable, dispose, DisposableStore } from '../../../../base/common/lifecycle.js';
import { coalesce, distinct } from '../../../../base/common/arrays.js';
import { isCodeEditor, isDiffEditor, isCompositeEditor } from '../../../../editor/browser/editorBrowser.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { isUndefined } from '../../../../base/common/types.js';
import { EditorsObserver } from '../../../browser/parts/editor/editorsObserver.js';
import { Promises, timeout } from '../../../../base/common/async.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { indexOfPath } from '../../../../base/common/extpath.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IEditorResolverService } from '../common/editorResolverService.js';
import { IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IHostService } from '../../host/browser/host.js';
import { findGroup } from '../common/editorGroupFinder.js';
import { ITextEditorService } from '../../textfile/common/textEditorService.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
let EditorService = EditorService_1 = class EditorService extends Disposable {
    constructor(editorGroupsContainer, editorGroupService, instantiationService, fileService, configurationService, contextService, uriIdentityService, editorResolverService, workspaceTrustRequestService, hostService, textEditorService) {
        super();
        this.editorGroupService = editorGroupService;
        this.instantiationService = instantiationService;
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.contextService = contextService;
        this.uriIdentityService = uriIdentityService;
        this.editorResolverService = editorResolverService;
        this.workspaceTrustRequestService = workspaceTrustRequestService;
        this.hostService = hostService;
        this.textEditorService = textEditorService;
        //#region events
        this._onDidActiveEditorChange = this._register(new Emitter());
        this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
        this._onDidVisibleEditorsChange = this._register(new Emitter());
        this.onDidVisibleEditorsChange = this._onDidVisibleEditorsChange.event;
        this._onDidEditorsChange = this._register(new Emitter());
        this.onDidEditorsChange = this._onDidEditorsChange.event;
        this._onWillOpenEditor = this._register(new Emitter());
        this.onWillOpenEditor = this._onWillOpenEditor.event;
        this._onDidCloseEditor = this._register(new Emitter());
        this.onDidCloseEditor = this._onDidCloseEditor.event;
        this._onDidOpenEditorFail = this._register(new Emitter());
        this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
        this._onDidMostRecentlyActiveEditorsChange = this._register(new Emitter());
        this.onDidMostRecentlyActiveEditorsChange = this._onDidMostRecentlyActiveEditorsChange.event;
        //#region Editor & group event handlers
        this.lastActiveEditor = undefined;
        //#endregion
        //#region Visible Editors Change: Install file watchers for out of workspace resources that became visible
        this.activeOutOfWorkspaceWatchers = new ResourceMap();
        this.closeOnFileDelete = false;
        this.editorGroupsContainer = editorGroupsContainer ?? editorGroupService;
        this.editorsObserver = this._register(this.instantiationService.createInstance(EditorsObserver, this.editorGroupsContainer));
        this.onConfigurationUpdated();
        this.registerListeners();
    }
    createScoped(editorGroupsContainer, disposables) {
        return disposables.add(new EditorService_1(editorGroupsContainer === 'main' ? this.editorGroupService.mainPart : editorGroupsContainer, this.editorGroupService, this.instantiationService, this.fileService, this.configurationService, this.contextService, this.uriIdentityService, this.editorResolverService, this.workspaceTrustRequestService, this.hostService, this.textEditorService));
    }
    registerListeners() {
        // Editor & group changes
        if (this.editorGroupsContainer === this.editorGroupService.mainPart || this.editorGroupsContainer === this.editorGroupService) {
            this.editorGroupService.whenReady.then(() => this.onEditorGroupsReady());
        }
        else {
            this.onEditorGroupsReady();
        }
        this._register(this.editorGroupsContainer.onDidChangeActiveGroup(group => this.handleActiveEditorChange(group)));
        this._register(this.editorGroupsContainer.onDidAddGroup(group => this.registerGroupListeners(group)));
        this._register(this.editorsObserver.onDidMostRecentlyActiveEditorsChange(() => this._onDidMostRecentlyActiveEditorsChange.fire()));
        // Out of workspace file watchers
        this._register(this.onDidVisibleEditorsChange(() => this.handleVisibleEditorsChange()));
        // File changes & operations
        // Note: there is some duplication with the two file event handlers- Since we cannot always rely on the disk events
        // carrying all necessary data in all environments, we also use the file operation events to make sure operations are handled.
        // In any case there is no guarantee if the local event is fired first or the disk one. Thus, code must handle the case
        // that the event ordering is random as well as might not carry all information needed.
        this._register(this.fileService.onDidRunOperation(e => this.onDidRunFileOperation(e)));
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        // Configuration
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
    }
    onEditorGroupsReady() {
        // Register listeners to each opened group
        for (const group of this.editorGroupsContainer.groups) {
            this.registerGroupListeners(group);
        }
        // Fire initial set of editor events if there is an active editor
        if (this.activeEditor) {
            this.doHandleActiveEditorChangeEvent();
            this._onDidVisibleEditorsChange.fire();
        }
    }
    handleActiveEditorChange(group) {
        if (group !== this.editorGroupsContainer.activeGroup) {
            return; // ignore if not the active group
        }
        if (!this.lastActiveEditor && !group.activeEditor) {
            return; // ignore if we still have no active editor
        }
        this.doHandleActiveEditorChangeEvent();
    }
    doHandleActiveEditorChangeEvent() {
        // Remember as last active
        const activeGroup = this.editorGroupsContainer.activeGroup;
        this.lastActiveEditor = activeGroup.activeEditor ?? undefined;
        // Fire event to outside parties
        this._onDidActiveEditorChange.fire();
    }
    registerGroupListeners(group) {
        const groupDisposables = new DisposableStore();
        groupDisposables.add(group.onDidModelChange(e => {
            this._onDidEditorsChange.fire({ groupId: group.id, event: e });
        }));
        groupDisposables.add(group.onDidActiveEditorChange(() => {
            this.handleActiveEditorChange(group);
            this._onDidVisibleEditorsChange.fire();
        }));
        groupDisposables.add(group.onWillOpenEditor(e => {
            this._onWillOpenEditor.fire(e);
        }));
        groupDisposables.add(group.onDidCloseEditor(e => {
            this._onDidCloseEditor.fire(e);
        }));
        groupDisposables.add(group.onDidOpenEditorFail(editor => {
            this._onDidOpenEditorFail.fire({ editor, groupId: group.id });
        }));
        Event.once(group.onWillDispose)(() => {
            dispose(groupDisposables);
        });
    }
    handleVisibleEditorsChange() {
        const visibleOutOfWorkspaceResources = new ResourceSet();
        for (const editor of this.visibleEditors) {
            const resources = distinct(coalesce([
                EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY }),
                EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: SideBySideEditor.SECONDARY })
            ]), resource => resource.toString());
            for (const resource of resources) {
                if (this.fileService.hasProvider(resource) && !this.contextService.isInsideWorkspace(resource)) {
                    visibleOutOfWorkspaceResources.add(resource);
                }
            }
        }
        // Handle no longer visible out of workspace resources
        for (const resource of this.activeOutOfWorkspaceWatchers.keys()) {
            if (!visibleOutOfWorkspaceResources.has(resource)) {
                dispose(this.activeOutOfWorkspaceWatchers.get(resource));
                this.activeOutOfWorkspaceWatchers.delete(resource);
            }
        }
        // Handle newly visible out of workspace resources
        for (const resource of visibleOutOfWorkspaceResources.keys()) {
            if (!this.activeOutOfWorkspaceWatchers.get(resource)) {
                const disposable = this.fileService.watch(resource);
                this.activeOutOfWorkspaceWatchers.set(resource, disposable);
            }
        }
    }
    //#endregion
    //#region File Changes: Move & Deletes to move or close opend editors
    async onDidRunFileOperation(e) {
        // Handle moves specially when file is opened
        if (e.isOperation(2 /* FileOperation.MOVE */)) {
            this.handleMovedFile(e.resource, e.target.resource);
        }
        // Handle deletes
        if (e.isOperation(1 /* FileOperation.DELETE */) || e.isOperation(2 /* FileOperation.MOVE */)) {
            this.handleDeletedFile(e.resource, false, e.target ? e.target.resource : undefined);
        }
    }
    onDidFilesChange(e) {
        if (e.gotDeleted()) {
            this.handleDeletedFile(e, true);
        }
    }
    async handleMovedFile(source, target) {
        for (const group of this.editorGroupsContainer.groups) {
            const replacements = [];
            for (const editor of group.editors) {
                const resource = editor.resource;
                if (!resource || !this.uriIdentityService.extUri.isEqualOrParent(resource, source)) {
                    continue; // not matching our resource
                }
                // Determine new resulting target resource
                let targetResource;
                if (this.uriIdentityService.extUri.isEqual(source, resource)) {
                    targetResource = target; // file got moved
                }
                else {
                    const index = indexOfPath(resource.path, source.path, this.uriIdentityService.extUri.ignorePathCasing(resource));
                    targetResource = joinPath(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
                }
                // Delegate rename() to editor instance
                const moveResult = await editor.rename(group.id, targetResource);
                if (!moveResult) {
                    return; // not target - ignore
                }
                const optionOverrides = {
                    preserveFocus: true,
                    pinned: group.isPinned(editor),
                    sticky: group.isSticky(editor),
                    index: group.getIndexOfEditor(editor),
                    inactive: !group.isActive(editor)
                };
                // Construct a replacement with our extra options mixed in
                if (isEditorInput(moveResult.editor)) {
                    replacements.push({
                        editor,
                        replacement: moveResult.editor,
                        options: {
                            ...moveResult.options,
                            ...optionOverrides
                        }
                    });
                }
                else {
                    replacements.push({
                        editor,
                        replacement: {
                            ...moveResult.editor,
                            options: {
                                ...moveResult.editor.options,
                                ...optionOverrides
                            }
                        }
                    });
                }
            }
            // Apply replacements
            if (replacements.length) {
                this.replaceEditors(replacements, group);
            }
        }
    }
    onConfigurationUpdated(e) {
        if (e && !e.affectsConfiguration('workbench.editor.closeOnFileDelete')) {
            return;
        }
        const configuration = this.configurationService.getValue();
        if (typeof configuration.workbench?.editor?.closeOnFileDelete === 'boolean') {
            this.closeOnFileDelete = configuration.workbench.editor.closeOnFileDelete;
        }
        else {
            this.closeOnFileDelete = false; // default
        }
    }
    handleDeletedFile(arg1, isExternal, movedTo) {
        for (const editor of this.getAllNonDirtyEditors({ includeUntitled: false, supportSideBySide: true })) {
            (async () => {
                const resource = editor.resource;
                if (!resource) {
                    return;
                }
                // Handle deletes in opened editors depending on:
                // - we close any editor when `closeOnFileDelete: true`
                // - we close any editor when the delete occurred from within VSCode
                if (this.closeOnFileDelete || !isExternal) {
                    // Do NOT close any opened editor that matches the resource path (either equal or being parent) of the
                    // resource we move to (movedTo). Otherwise we would close a resource that has been renamed to the same
                    // path but different casing.
                    if (movedTo && this.uriIdentityService.extUri.isEqualOrParent(resource, movedTo)) {
                        return;
                    }
                    let matches = false;
                    if (arg1 instanceof FileChangesEvent) {
                        matches = arg1.contains(resource, 2 /* FileChangeType.DELETED */);
                    }
                    else {
                        matches = this.uriIdentityService.extUri.isEqualOrParent(resource, arg1);
                    }
                    if (!matches) {
                        return;
                    }
                    // We have received reports of users seeing delete events even though the file still
                    // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                    // Since we do not want to close an editor without reason, we have to check if the
                    // file is really gone and not just a faulty file event.
                    // This only applies to external file events, so we need to check for the isExternal
                    // flag.
                    let exists = false;
                    if (isExternal && this.fileService.hasProvider(resource)) {
                        await timeout(100);
                        exists = await this.fileService.exists(resource);
                    }
                    if (!exists && !editor.isDisposed()) {
                        editor.dispose();
                    }
                }
            })();
        }
    }
    getAllNonDirtyEditors(options) {
        const editors = [];
        function conditionallyAddEditor(editor) {
            if (editor.hasCapability(4 /* EditorInputCapabilities.Untitled */) && !options.includeUntitled) {
                return;
            }
            if (editor.isDirty()) {
                return;
            }
            editors.push(editor);
        }
        for (const editor of this.editors) {
            if (options.supportSideBySide && editor instanceof SideBySideEditorInput) {
                conditionallyAddEditor(editor.primary);
                conditionallyAddEditor(editor.secondary);
            }
            else {
                conditionallyAddEditor(editor);
            }
        }
        return editors;
    }
    get activeEditorPane() {
        return this.editorGroupsContainer.activeGroup?.activeEditorPane;
    }
    get activeTextEditorControl() {
        const activeEditorPane = this.activeEditorPane;
        if (activeEditorPane) {
            const activeControl = activeEditorPane.getControl();
            if (isCodeEditor(activeControl) || isDiffEditor(activeControl)) {
                return activeControl;
            }
            if (isCompositeEditor(activeControl) && isCodeEditor(activeControl.activeCodeEditor)) {
                return activeControl.activeCodeEditor;
            }
        }
        return undefined;
    }
    get activeTextEditorLanguageId() {
        let activeCodeEditor = undefined;
        const activeTextEditorControl = this.activeTextEditorControl;
        if (isDiffEditor(activeTextEditorControl)) {
            activeCodeEditor = activeTextEditorControl.getModifiedEditor();
        }
        else {
            activeCodeEditor = activeTextEditorControl;
        }
        return activeCodeEditor?.getModel()?.getLanguageId();
    }
    get count() {
        return this.editorsObserver.count;
    }
    get editors() {
        return this.getEditors(1 /* EditorsOrder.SEQUENTIAL */).map(({ editor }) => editor);
    }
    getEditors(order, options) {
        switch (order) {
            // MRU
            case 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */:
                if (options?.excludeSticky) {
                    return this.editorsObserver.editors.filter(({ groupId, editor }) => !this.editorGroupsContainer.getGroup(groupId)?.isSticky(editor));
                }
                return this.editorsObserver.editors;
            // Sequential
            case 1 /* EditorsOrder.SEQUENTIAL */: {
                const editors = [];
                for (const group of this.editorGroupsContainer.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
                    editors.push(...group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, options).map(editor => ({ editor, groupId: group.id })));
                }
                return editors;
            }
        }
    }
    get activeEditor() {
        const activeGroup = this.editorGroupsContainer.activeGroup;
        return activeGroup ? activeGroup.activeEditor ?? undefined : undefined;
    }
    get visibleEditorPanes() {
        return coalesce(this.editorGroupsContainer.groups.map(group => group.activeEditorPane));
    }
    get visibleTextEditorControls() {
        const visibleTextEditorControls = [];
        for (const visibleEditorPane of this.visibleEditorPanes) {
            const controls = [];
            if (visibleEditorPane instanceof SideBySideEditorPane) {
                controls.push(visibleEditorPane.getPrimaryEditorPane()?.getControl());
                controls.push(visibleEditorPane.getSecondaryEditorPane()?.getControl());
            }
            else {
                controls.push(visibleEditorPane.getControl());
            }
            for (const control of controls) {
                if (isCodeEditor(control) || isDiffEditor(control)) {
                    visibleTextEditorControls.push(control);
                }
            }
        }
        return visibleTextEditorControls;
    }
    get visibleEditors() {
        return coalesce(this.editorGroupsContainer.groups.map(group => group.activeEditor));
    }
    async openEditor(editor, optionsOrPreferredGroup, preferredGroup) {
        let typedEditor = undefined;
        let options = isEditorInput(editor) ? optionsOrPreferredGroup : editor.options;
        let group = undefined;
        if (isPreferredGroup(optionsOrPreferredGroup)) {
            preferredGroup = optionsOrPreferredGroup;
        }
        // Resolve override unless disabled
        if (!isEditorInput(editor)) {
            const resolvedEditor = await this.editorResolverService.resolveEditor(editor, preferredGroup);
            if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                return; // skip editor if override is aborted
            }
            // We resolved an editor to use
            if (isEditorInputWithOptionsAndGroup(resolvedEditor)) {
                typedEditor = resolvedEditor.editor;
                options = resolvedEditor.options;
                group = resolvedEditor.group;
            }
        }
        // Override is disabled or did not apply: fallback to default
        if (!typedEditor) {
            typedEditor = isEditorInput(editor) ? editor : await this.textEditorService.resolveTextEditor(editor);
        }
        // If group still isn't defined because of a disabled override we resolve it
        if (!group) {
            let activation = undefined;
            const findGroupResult = this.instantiationService.invokeFunction(findGroup, { editor: typedEditor, options }, preferredGroup);
            if (findGroupResult instanceof Promise) {
                ([group, activation] = await findGroupResult);
            }
            else {
                ([group, activation] = findGroupResult);
            }
            // Mixin editor group activation if returned
            if (activation) {
                options = { ...options, activation };
            }
        }
        return group.openEditor(typedEditor, options);
    }
    async openEditors(editors, preferredGroup, options) {
        // Pass all editors to trust service to determine if
        // we should proceed with opening the editors if we
        // are asked to validate trust.
        if (options?.validateTrust) {
            const editorsTrusted = await this.handleWorkspaceTrust(editors);
            if (!editorsTrusted) {
                return [];
            }
        }
        // Find target groups for editors to open
        const mapGroupToTypedEditors = new Map();
        for (const editor of editors) {
            let typedEditor = undefined;
            let group = undefined;
            // Resolve override unless disabled
            if (!isEditorInputWithOptions(editor)) {
                const resolvedEditor = await this.editorResolverService.resolveEditor(editor, preferredGroup);
                if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                    continue; // skip editor if override is aborted
                }
                // We resolved an editor to use
                if (isEditorInputWithOptionsAndGroup(resolvedEditor)) {
                    typedEditor = resolvedEditor;
                    group = resolvedEditor.group;
                }
            }
            // Override is disabled or did not apply: fallback to default
            if (!typedEditor) {
                typedEditor = isEditorInputWithOptions(editor) ? editor : { editor: await this.textEditorService.resolveTextEditor(editor), options: editor.options };
            }
            // If group still isn't defined because of a disabled override we resolve it
            if (!group) {
                const findGroupResult = this.instantiationService.invokeFunction(findGroup, typedEditor, preferredGroup);
                if (findGroupResult instanceof Promise) {
                    ([group] = await findGroupResult);
                }
                else {
                    ([group] = findGroupResult);
                }
            }
            // Update map of groups to editors
            let targetGroupEditors = mapGroupToTypedEditors.get(group);
            if (!targetGroupEditors) {
                targetGroupEditors = [];
                mapGroupToTypedEditors.set(group, targetGroupEditors);
            }
            targetGroupEditors.push(typedEditor);
        }
        // Open in target groups
        const result = [];
        for (const [group, editors] of mapGroupToTypedEditors) {
            result.push(group.openEditors(editors));
        }
        return coalesce(await Promises.settled(result));
    }
    async handleWorkspaceTrust(editors) {
        const { resources, diffMode, mergeMode } = this.extractEditorResources(editors);
        const trustResult = await this.workspaceTrustRequestService.requestOpenFilesTrust(resources);
        switch (trustResult) {
            case 1 /* WorkspaceTrustUriResponse.Open */:
                return true;
            case 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */:
                await this.hostService.openWindow(resources.map(resource => ({ fileUri: resource })), { forceNewWindow: true, diffMode, mergeMode });
                return false;
            case 3 /* WorkspaceTrustUriResponse.Cancel */:
                return false;
        }
    }
    extractEditorResources(editors) {
        const resources = new ResourceSet();
        let diffMode = false;
        let mergeMode = false;
        for (const editor of editors) {
            // Typed Editor
            if (isEditorInputWithOptions(editor)) {
                const resource = EditorResourceAccessor.getOriginalUri(editor.editor, { supportSideBySide: SideBySideEditor.BOTH });
                if (URI.isUri(resource)) {
                    resources.add(resource);
                }
                else if (resource) {
                    if (resource.primary) {
                        resources.add(resource.primary);
                    }
                    if (resource.secondary) {
                        resources.add(resource.secondary);
                    }
                    diffMode = editor.editor instanceof DiffEditorInput;
                }
            }
            // Untyped editor
            else {
                if (isResourceMergeEditorInput(editor)) {
                    if (URI.isUri(editor.input1)) {
                        resources.add(editor.input1.resource);
                    }
                    if (URI.isUri(editor.input2)) {
                        resources.add(editor.input2.resource);
                    }
                    if (URI.isUri(editor.base)) {
                        resources.add(editor.base.resource);
                    }
                    if (URI.isUri(editor.result)) {
                        resources.add(editor.result.resource);
                    }
                    mergeMode = true;
                }
                if (isResourceDiffEditorInput(editor)) {
                    if (URI.isUri(editor.original.resource)) {
                        resources.add(editor.original.resource);
                    }
                    if (URI.isUri(editor.modified.resource)) {
                        resources.add(editor.modified.resource);
                    }
                    diffMode = true;
                }
                else if (isResourceEditorInput(editor)) {
                    resources.add(editor.resource);
                }
            }
        }
        return {
            resources: Array.from(resources.keys()),
            diffMode,
            mergeMode
        };
    }
    //#endregion
    //#region isOpened() / isVisible()
    isOpened(editor) {
        return this.editorsObserver.hasEditor({
            resource: this.uriIdentityService.asCanonicalUri(editor.resource),
            typeId: editor.typeId,
            editorId: editor.editorId
        });
    }
    isVisible(editor) {
        for (const group of this.editorGroupsContainer.groups) {
            if (group.activeEditor?.matches(editor)) {
                return true;
            }
        }
        return false;
    }
    //#endregion
    //#region closeEditor()
    async closeEditor({ editor, groupId }, options) {
        const group = this.editorGroupsContainer.getGroup(groupId);
        await group?.closeEditor(editor, options);
    }
    //#endregion
    //#region closeEditors()
    async closeEditors(editors, options) {
        const mapGroupToEditors = new Map();
        for (const { editor, groupId } of editors) {
            const group = this.editorGroupsContainer.getGroup(groupId);
            if (!group) {
                continue;
            }
            let editors = mapGroupToEditors.get(group);
            if (!editors) {
                editors = [];
                mapGroupToEditors.set(group, editors);
            }
            editors.push(editor);
        }
        for (const [group, editors] of mapGroupToEditors) {
            await group.closeEditors(editors, options);
        }
    }
    findEditors(arg1, options, arg2) {
        const resource = URI.isUri(arg1) ? arg1 : arg1.resource;
        const typeId = URI.isUri(arg1) ? undefined : arg1.typeId;
        // Do a quick check for the resource via the editor observer
        // which is a very efficient way to find an editor by resource.
        // However, we can only do that unless we are asked to find an
        // editor on the secondary side of a side by side editor, because
        // the editor observer provides fast lookups only for primary
        // editors.
        if (options?.supportSideBySide !== SideBySideEditor.ANY && options?.supportSideBySide !== SideBySideEditor.SECONDARY) {
            if (!this.editorsObserver.hasEditors(resource)) {
                if (URI.isUri(arg1) || isUndefined(arg2)) {
                    return [];
                }
                return undefined;
            }
        }
        // Search only in specific group
        if (!isUndefined(arg2)) {
            const targetGroup = typeof arg2 === 'number' ? this.editorGroupsContainer.getGroup(arg2) : arg2;
            // Resource provided: result is an array
            if (URI.isUri(arg1)) {
                if (!targetGroup) {
                    return [];
                }
                return targetGroup.findEditors(resource, options);
            }
            // Editor identifier provided, result is single
            else {
                if (!targetGroup) {
                    return undefined;
                }
                const editors = targetGroup.findEditors(resource, options);
                for (const editor of editors) {
                    if (editor.typeId === typeId) {
                        return editor;
                    }
                }
                return undefined;
            }
        }
        // Search across all groups in MRU order
        else {
            const result = [];
            for (const group of this.editorGroupsContainer.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                const editors = [];
                // Resource provided: result is an array
                if (URI.isUri(arg1)) {
                    editors.push(...this.findEditors(arg1, options, group));
                }
                // Editor identifier provided, result is single
                else {
                    const editor = this.findEditors(arg1, options, group);
                    if (editor) {
                        editors.push(editor);
                    }
                }
                result.push(...editors.map(editor => ({ editor, groupId: group.id })));
            }
            return result;
        }
    }
    async replaceEditors(replacements, group) {
        const targetGroup = typeof group === 'number' ? this.editorGroupsContainer.getGroup(group) : group;
        // Convert all replacements to typed editors unless already
        // typed and handle overrides properly.
        const typedReplacements = [];
        for (const replacement of replacements) {
            let typedReplacement = undefined;
            // Resolve override unless disabled
            if (!isEditorInput(replacement.replacement)) {
                const resolvedEditor = await this.editorResolverService.resolveEditor(replacement.replacement, targetGroup);
                if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                    continue; // skip editor if override is aborted
                }
                // We resolved an editor to use
                if (isEditorInputWithOptionsAndGroup(resolvedEditor)) {
                    typedReplacement = {
                        editor: replacement.editor,
                        replacement: resolvedEditor.editor,
                        options: resolvedEditor.options,
                        forceReplaceDirty: replacement.forceReplaceDirty
                    };
                }
            }
            // Override is disabled or did not apply: fallback to default
            if (!typedReplacement) {
                typedReplacement = {
                    editor: replacement.editor,
                    replacement: isEditorReplacement(replacement) ? replacement.replacement : await this.textEditorService.resolveTextEditor(replacement.replacement),
                    options: isEditorReplacement(replacement) ? replacement.options : replacement.replacement.options,
                    forceReplaceDirty: replacement.forceReplaceDirty
                };
            }
            typedReplacements.push(typedReplacement);
        }
        return targetGroup?.replaceEditors(typedReplacements);
    }
    //#endregion
    //#region save/revert
    async save(editors, options) {
        // Convert to array
        if (!Array.isArray(editors)) {
            editors = [editors];
        }
        // Make sure to not save the same editor multiple times
        // by using the `matches()` method to find duplicates
        const uniqueEditors = this.getUniqueEditors(editors);
        // Split editors up into a bucket that is saved in parallel
        // and sequentially. Unless "Save As", all non-untitled editors
        // can be saved in parallel to speed up the operation. Remaining
        // editors are potentially bringing up some UI and thus run
        // sequentially.
        const editorsToSaveParallel = [];
        const editorsToSaveSequentially = [];
        if (options?.saveAs) {
            editorsToSaveSequentially.push(...uniqueEditors);
        }
        else {
            for (const { groupId, editor } of uniqueEditors) {
                if (editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    editorsToSaveSequentially.push({ groupId, editor });
                }
                else {
                    editorsToSaveParallel.push({ groupId, editor });
                }
            }
        }
        // Editors to save in parallel
        const saveResults = await Promises.settled(editorsToSaveParallel.map(({ groupId, editor }) => {
            // Use save as a hint to pin the editor if used explicitly
            if (options?.reason === 1 /* SaveReason.EXPLICIT */) {
                this.editorGroupsContainer.getGroup(groupId)?.pinEditor(editor);
            }
            // Save
            return editor.save(groupId, options);
        }));
        // Editors to save sequentially
        for (const { groupId, editor } of editorsToSaveSequentially) {
            if (editor.isDisposed()) {
                continue; // might have been disposed from the save already
            }
            // Preserve view state by opening the editor first if the editor
            // is untitled or we "Save As". This also allows the user to review
            // the contents of the editor before making a decision.
            const editorPane = await this.openEditor(editor, groupId);
            const editorOptions = {
                pinned: true,
                viewState: editorPane?.getViewState()
            };
            const result = options?.saveAs ? await editor.saveAs(groupId, options) : await editor.save(groupId, options);
            saveResults.push(result);
            if (!result) {
                break; // failed or cancelled, abort
            }
            // Replace editor preserving viewstate (either across all groups or
            // only selected group) if the resulting editor is different from the
            // current one.
            if (!editor.matches(result)) {
                const targetGroups = editor.hasCapability(4 /* EditorInputCapabilities.Untitled */) ? this.editorGroupsContainer.groups.map(group => group.id) /* untitled replaces across all groups */ : [groupId];
                for (const targetGroup of targetGroups) {
                    if (result instanceof EditorInput) {
                        await this.replaceEditors([{ editor, replacement: result, options: editorOptions }], targetGroup);
                    }
                    else {
                        await this.replaceEditors([{ editor, replacement: { ...result, options: editorOptions } }], targetGroup);
                    }
                }
            }
        }
        return {
            success: saveResults.every(result => !!result),
            editors: coalesce(saveResults)
        };
    }
    saveAll(options) {
        return this.save(this.getAllModifiedEditors(options), options);
    }
    async revert(editors, options) {
        // Convert to array
        if (!Array.isArray(editors)) {
            editors = [editors];
        }
        // Make sure to not revert the same editor multiple times
        // by using the `matches()` method to find duplicates
        const uniqueEditors = this.getUniqueEditors(editors);
        await Promises.settled(uniqueEditors.map(async ({ groupId, editor }) => {
            // Use revert as a hint to pin the editor
            this.editorGroupsContainer.getGroup(groupId)?.pinEditor(editor);
            return editor.revert(groupId, options);
        }));
        return !uniqueEditors.some(({ editor }) => editor.isDirty());
    }
    async revertAll(options) {
        return this.revert(this.getAllModifiedEditors(options), options);
    }
    getAllModifiedEditors(options) {
        const editors = [];
        for (const group of this.editorGroupsContainer.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
            for (const editor of group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (!editor.isModified()) {
                    continue;
                }
                if ((typeof options?.includeUntitled === 'boolean' || !options?.includeUntitled?.includeScratchpad)
                    && editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */)) {
                    continue;
                }
                if (!options?.includeUntitled && editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    continue;
                }
                if (options?.excludeSticky && group.isSticky(editor)) {
                    continue;
                }
                editors.push({ groupId: group.id, editor });
            }
        }
        return editors;
    }
    getUniqueEditors(editors) {
        const uniqueEditors = [];
        for (const { editor, groupId } of editors) {
            if (uniqueEditors.some(uniqueEditor => uniqueEditor.editor.matches(editor))) {
                continue;
            }
            uniqueEditors.push({ editor, groupId });
        }
        return uniqueEditors;
    }
    //#endregion
    dispose() {
        super.dispose();
        // Dispose remaining watchers if any
        this.activeOutOfWorkspaceWatchers.forEach(disposable => dispose(disposable));
        this.activeOutOfWorkspaceWatchers.clear();
    }
};
EditorService = EditorService_1 = __decorate([
    __param(1, IEditorGroupsService),
    __param(2, IInstantiationService),
    __param(3, IFileService),
    __param(4, IConfigurationService),
    __param(5, IWorkspaceContextService),
    __param(6, IUriIdentityService),
    __param(7, IEditorResolverService),
    __param(8, IWorkspaceTrustRequestService),
    __param(9, IHostService),
    __param(10, ITextEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], EditorService);
export { EditorService };
registerSingleton(IEditorService, new SyncDescriptor(EditorService, [undefined], false));
