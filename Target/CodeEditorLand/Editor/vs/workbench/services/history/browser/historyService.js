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
var HistoryService_1, EditorNavigationStack_1;
import { localize } from '../../../../nls.js';
import { URI } from '../../../../base/common/uri.js';
import { EditorResourceAccessor, SideBySideEditor, isResourceEditorInput, isEditorInput, isSideBySideEditorInput, EditorCloseContext, isEditorPaneWithSelection } from '../../../common/editor.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IHistoryService } from '../common/history.js';
import { FileChangesEvent, IFileService, FILES_EXCLUDE_CONFIG, FileOperationEvent } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { dispose, Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IEditorGroupsService } from '../../editor/common/editorGroupsService.js';
import { getExcludes, SEARCH_EXCLUDE_CONFIG } from '../../search/common/search.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchLayoutService } from '../../layout/browser/layoutService.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { coalesce, remove } from '../../../../base/common/arrays.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { addDisposableListener, EventType, EventHelper, WindowIdleValue } from '../../../../base/browser/dom.js';
import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.js';
import { Schemas } from '../../../../base/common/network.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { ResourceGlobMatcher } from '../../../common/resources.js';
import { IPathService } from '../../path/common/pathService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { ILogService, LogLevel } from '../../../../platform/log/common/log.js';
import { mainWindow } from '../../../../base/browser/window.js';
let HistoryService = class HistoryService extends Disposable {
    static { HistoryService_1 = this; }
    static { this.MOUSE_NAVIGATION_SETTING = 'workbench.editor.mouseBackForwardToNavigate'; }
    static { this.NAVIGATION_SCOPE_SETTING = 'workbench.editor.navigationScope'; }
    constructor(editorService, editorGroupService, contextService, storageService, configurationService, fileService, workspacesService, instantiationService, layoutService, contextKeyService, logService) {
        super();
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.contextService = contextService;
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.fileService = fileService;
        this.workspacesService = workspacesService;
        this.instantiationService = instantiationService;
        this.layoutService = layoutService;
        this.contextKeyService = contextKeyService;
        this.logService = logService;
        this.activeEditorListeners = this._register(new DisposableStore());
        this.lastActiveEditor = undefined;
        this.editorHelper = this.instantiationService.createInstance(EditorHelper);
        //#region History Context Keys
        this.canNavigateBackContextKey = (new RawContextKey('canNavigateBack', false, localize('canNavigateBack', "Whether it is possible to navigate back in editor history"))).bindTo(this.contextKeyService);
        this.canNavigateForwardContextKey = (new RawContextKey('canNavigateForward', false, localize('canNavigateForward', "Whether it is possible to navigate forward in editor history"))).bindTo(this.contextKeyService);
        this.canNavigateBackInNavigationsContextKey = (new RawContextKey('canNavigateBackInNavigationLocations', false, localize('canNavigateBackInNavigationLocations', "Whether it is possible to navigate back in editor navigation locations history"))).bindTo(this.contextKeyService);
        this.canNavigateForwardInNavigationsContextKey = (new RawContextKey('canNavigateForwardInNavigationLocations', false, localize('canNavigateForwardInNavigationLocations', "Whether it is possible to navigate forward in editor navigation locations history"))).bindTo(this.contextKeyService);
        this.canNavigateToLastNavigationLocationContextKey = (new RawContextKey('canNavigateToLastNavigationLocation', false, localize('canNavigateToLastNavigationLocation', "Whether it is possible to navigate to the last editor navigation location"))).bindTo(this.contextKeyService);
        this.canNavigateBackInEditsContextKey = (new RawContextKey('canNavigateBackInEditLocations', false, localize('canNavigateBackInEditLocations', "Whether it is possible to navigate back in editor edit locations history"))).bindTo(this.contextKeyService);
        this.canNavigateForwardInEditsContextKey = (new RawContextKey('canNavigateForwardInEditLocations', false, localize('canNavigateForwardInEditLocations', "Whether it is possible to navigate forward in editor edit locations history"))).bindTo(this.contextKeyService);
        this.canNavigateToLastEditLocationContextKey = (new RawContextKey('canNavigateToLastEditLocation', false, localize('canNavigateToLastEditLocation', "Whether it is possible to navigate to the last editor edit location"))).bindTo(this.contextKeyService);
        this.canReopenClosedEditorContextKey = (new RawContextKey('canReopenClosedEditor', false, localize('canReopenClosedEditor', "Whether it is possible to reopen the last closed editor"))).bindTo(this.contextKeyService);
        //#endregion
        //#region Editor History Navigation (limit: 50)
        this._onDidChangeEditorNavigationStack = this._register(new Emitter());
        this.onDidChangeEditorNavigationStack = this._onDidChangeEditorNavigationStack.event;
        this.defaultScopedEditorNavigationStack = undefined;
        this.editorGroupScopedNavigationStacks = new Map();
        this.editorScopedNavigationStacks = new Map();
        this.editorNavigationScope = 0 /* GoScope.DEFAULT */;
        //#endregion
        //#region Navigation: Next/Previous Used Editor
        this.recentlyUsedEditorsStack = undefined;
        this.recentlyUsedEditorsStackIndex = 0;
        this.recentlyUsedEditorsInGroupStack = undefined;
        this.recentlyUsedEditorsInGroupStackIndex = 0;
        this.navigatingInRecentlyUsedEditorsStack = false;
        this.navigatingInRecentlyUsedEditorsInGroupStack = false;
        this.recentlyClosedEditors = [];
        this.ignoreEditorCloseEvent = false;
        this.history = undefined;
        this.editorHistoryListeners = new Map();
        this.resourceExcludeMatcher = this._register(new WindowIdleValue(mainWindow, () => {
            const matcher = this._register(this.instantiationService.createInstance(ResourceGlobMatcher, root => getExcludes(root ? this.configurationService.getValue({ resource: root }) : this.configurationService.getValue()) || Object.create(null), event => event.affectsConfiguration(FILES_EXCLUDE_CONFIG) || event.affectsConfiguration(SEARCH_EXCLUDE_CONFIG)));
            this._register(matcher.onExpressionChange(() => this.removeExcludedFromHistory()));
            return matcher;
        }));
        this.registerListeners();
        // if the service is created late enough that an editor is already opened
        // make sure to trigger the onActiveEditorChanged() to track the editor
        // properly (fixes https://github.com/microsoft/vscode/issues/59908)
        if (this.editorService.activeEditorPane) {
            this.onDidActiveEditorChange();
        }
    }
    registerListeners() {
        // Mouse back/forward support
        this.registerMouseNavigationListener();
        // Editor changes
        this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
        this._register(this.editorService.onDidOpenEditorFail(event => this.remove(event.editor)));
        this._register(this.editorService.onDidCloseEditor(event => this.onDidCloseEditor(event)));
        this._register(this.editorService.onDidMostRecentlyActiveEditorsChange(() => this.handleEditorEventInRecentEditorsStack()));
        // Editor group changes
        this._register(this.editorGroupService.onDidRemoveGroup(e => this.onDidRemoveGroup(e)));
        // File changes
        this._register(this.fileService.onDidFilesChange(event => this.onDidFilesChange(event)));
        this._register(this.fileService.onDidRunOperation(event => this.onDidFilesChange(event)));
        // Storage
        this._register(this.storageService.onWillSaveState(() => this.saveState()));
        // Configuration
        this.registerEditorNavigationScopeChangeListener();
        // Context keys
        this._register(this.onDidChangeEditorNavigationStack(() => this.updateContextKeys()));
        this._register(this.editorGroupService.onDidChangeActiveGroup(() => this.updateContextKeys()));
    }
    onDidCloseEditor(e) {
        this.handleEditorCloseEventInHistory(e);
        this.handleEditorCloseEventInReopen(e);
    }
    registerMouseNavigationListener() {
        const mouseBackForwardSupportListener = this._register(new DisposableStore());
        const handleMouseBackForwardSupport = () => {
            mouseBackForwardSupportListener.clear();
            if (this.configurationService.getValue(HistoryService_1.MOUSE_NAVIGATION_SETTING)) {
                this._register(Event.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container, disposables }) => {
                    const eventDisposables = disposables.add(new DisposableStore());
                    eventDisposables.add(addDisposableListener(container, EventType.MOUSE_DOWN, e => this.onMouseDownOrUp(e, true)));
                    eventDisposables.add(addDisposableListener(container, EventType.MOUSE_UP, e => this.onMouseDownOrUp(e, false)));
                    mouseBackForwardSupportListener.add(eventDisposables);
                }, { container: this.layoutService.mainContainer, disposables: this._store }));
            }
        };
        this._register(this.configurationService.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(HistoryService_1.MOUSE_NAVIGATION_SETTING)) {
                handleMouseBackForwardSupport();
            }
        }));
        handleMouseBackForwardSupport();
    }
    onMouseDownOrUp(event, isMouseDown) {
        // Support to navigate in history when mouse buttons 4/5 are pressed
        // We want to trigger this on mouse down for a faster experience
        // but we also need to prevent mouse up from triggering the default
        // which is to navigate in the browser history.
        switch (event.button) {
            case 3:
                EventHelper.stop(event);
                if (isMouseDown) {
                    this.goBack();
                }
                break;
            case 4:
                EventHelper.stop(event);
                if (isMouseDown) {
                    this.goForward();
                }
                break;
        }
    }
    onDidRemoveGroup(group) {
        this.handleEditorGroupRemoveInNavigationStacks(group);
    }
    onDidActiveEditorChange() {
        const activeEditorGroup = this.editorGroupService.activeGroup;
        const activeEditorPane = activeEditorGroup.activeEditorPane;
        if (this.lastActiveEditor && this.editorHelper.matchesEditorIdentifier(this.lastActiveEditor, activeEditorPane)) {
            return; // return if the active editor is still the same
        }
        // Remember as last active editor (can be undefined if none opened)
        this.lastActiveEditor = activeEditorPane?.input ? { editor: activeEditorPane.input, groupId: activeEditorPane.group.id } : undefined;
        // Dispose old listeners
        this.activeEditorListeners.clear();
        // Handle editor change unless the editor is transient. In that case
        // setup a listener to see if the transient editor becomes non-transient
        // (https://github.com/microsoft/vscode/issues/211769)
        if (!activeEditorPane?.group.isTransient(activeEditorPane.input)) {
            this.handleActiveEditorChange(activeEditorGroup, activeEditorPane);
        }
        else {
            this.logService.trace(`[History]: ignoring transient editor change until becoming non-transient (editor: ${activeEditorPane.input?.resource?.toString()}})`);
            const transientListener = activeEditorGroup.onDidModelChange(e => {
                if (e.kind === 12 /* GroupModelChangeKind.EDITOR_TRANSIENT */ && e.editor === activeEditorPane.input && !activeEditorPane.group.isTransient(activeEditorPane.input)) {
                    transientListener.dispose();
                    this.handleActiveEditorChange(activeEditorGroup, activeEditorPane);
                }
            });
            this.activeEditorListeners.add(transientListener);
        }
        // Listen to selection changes unless the editor is transient
        if (isEditorPaneWithSelection(activeEditorPane)) {
            this.activeEditorListeners.add(activeEditorPane.onDidChangeSelection(e => {
                if (!activeEditorPane.group.isTransient(activeEditorPane.input)) {
                    this.handleActiveEditorSelectionChangeEvent(activeEditorGroup, activeEditorPane, e);
                }
                else {
                    this.logService.trace(`[History]: ignoring transient editor selection change (editor: ${activeEditorPane.input?.resource?.toString()}})`);
                }
            }));
        }
        // Context keys
        this.updateContextKeys();
    }
    onDidFilesChange(event) {
        // External file changes (watcher)
        if (event instanceof FileChangesEvent) {
            if (event.gotDeleted()) {
                this.remove(event);
            }
        }
        // Internal file changes (e.g. explorer)
        else {
            // Delete
            if (event.isOperation(1 /* FileOperation.DELETE */)) {
                this.remove(event);
            }
            // Move
            else if (event.isOperation(2 /* FileOperation.MOVE */) && event.target.isFile) {
                this.move(event);
            }
        }
    }
    handleActiveEditorChange(group, editorPane) {
        this.handleActiveEditorChangeInHistory(editorPane);
        this.handleActiveEditorChangeInNavigationStacks(group, editorPane);
    }
    handleActiveEditorSelectionChangeEvent(group, editorPane, event) {
        this.handleActiveEditorSelectionChangeInNavigationStacks(group, editorPane, event);
    }
    move(event) {
        this.moveInHistory(event);
        this.moveInEditorNavigationStacks(event);
    }
    remove(arg1) {
        this.removeFromHistory(arg1);
        this.removeFromEditorNavigationStacks(arg1);
        this.removeFromRecentlyClosedEditors(arg1);
        this.removeFromRecentlyOpened(arg1);
    }
    removeFromRecentlyOpened(arg1) {
        let resource = undefined;
        if (isEditorInput(arg1)) {
            resource = EditorResourceAccessor.getOriginalUri(arg1);
        }
        else if (arg1 instanceof FileChangesEvent) {
            // Ignore for now (recently opened are most often out of workspace files anyway for which there are no file events)
        }
        else {
            resource = arg1.resource;
        }
        if (resource) {
            this.workspacesService.removeRecentlyOpened([resource]);
        }
    }
    clear() {
        // History
        this.clearRecentlyOpened();
        // Navigation (next, previous)
        this.clearEditorNavigationStacks();
        // Recently closed editors
        this.recentlyClosedEditors = [];
        // Context Keys
        this.updateContextKeys();
    }
    updateContextKeys() {
        this.contextKeyService.bufferChangeEvents(() => {
            const activeStack = this.getStack();
            this.canNavigateBackContextKey.set(activeStack.canGoBack(0 /* GoFilter.NONE */));
            this.canNavigateForwardContextKey.set(activeStack.canGoForward(0 /* GoFilter.NONE */));
            this.canNavigateBackInNavigationsContextKey.set(activeStack.canGoBack(2 /* GoFilter.NAVIGATION */));
            this.canNavigateForwardInNavigationsContextKey.set(activeStack.canGoForward(2 /* GoFilter.NAVIGATION */));
            this.canNavigateToLastNavigationLocationContextKey.set(activeStack.canGoLast(2 /* GoFilter.NAVIGATION */));
            this.canNavigateBackInEditsContextKey.set(activeStack.canGoBack(1 /* GoFilter.EDITS */));
            this.canNavigateForwardInEditsContextKey.set(activeStack.canGoForward(1 /* GoFilter.EDITS */));
            this.canNavigateToLastEditLocationContextKey.set(activeStack.canGoLast(1 /* GoFilter.EDITS */));
            this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
        });
    }
    registerEditorNavigationScopeChangeListener() {
        const handleEditorNavigationScopeChange = () => {
            // Ensure to start fresh when setting changes
            this.disposeEditorNavigationStacks();
            // Update scope
            const configuredScope = this.configurationService.getValue(HistoryService_1.NAVIGATION_SCOPE_SETTING);
            if (configuredScope === 'editorGroup') {
                this.editorNavigationScope = 1 /* GoScope.EDITOR_GROUP */;
            }
            else if (configuredScope === 'editor') {
                this.editorNavigationScope = 2 /* GoScope.EDITOR */;
            }
            else {
                this.editorNavigationScope = 0 /* GoScope.DEFAULT */;
            }
        };
        this._register(this.configurationService.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(HistoryService_1.NAVIGATION_SCOPE_SETTING)) {
                handleEditorNavigationScopeChange();
            }
        }));
        handleEditorNavigationScopeChange();
    }
    getStack(group = this.editorGroupService.activeGroup, editor = group.activeEditor) {
        switch (this.editorNavigationScope) {
            // Per Editor
            case 2 /* GoScope.EDITOR */: {
                if (!editor) {
                    return new NoOpEditorNavigationStacks();
                }
                let stacksForGroup = this.editorScopedNavigationStacks.get(group.id);
                if (!stacksForGroup) {
                    stacksForGroup = new Map();
                    this.editorScopedNavigationStacks.set(group.id, stacksForGroup);
                }
                let stack = stacksForGroup.get(editor)?.stack;
                if (!stack) {
                    const disposable = new DisposableStore();
                    stack = disposable.add(this.instantiationService.createInstance(EditorNavigationStacks, 2 /* GoScope.EDITOR */));
                    disposable.add(stack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
                    stacksForGroup.set(editor, { stack, disposable });
                }
                return stack;
            }
            // Per Editor Group
            case 1 /* GoScope.EDITOR_GROUP */: {
                let stack = this.editorGroupScopedNavigationStacks.get(group.id)?.stack;
                if (!stack) {
                    const disposable = new DisposableStore();
                    stack = disposable.add(this.instantiationService.createInstance(EditorNavigationStacks, 1 /* GoScope.EDITOR_GROUP */));
                    disposable.add(stack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
                    this.editorGroupScopedNavigationStacks.set(group.id, { stack, disposable });
                }
                return stack;
            }
            // Global
            case 0 /* GoScope.DEFAULT */: {
                if (!this.defaultScopedEditorNavigationStack) {
                    this.defaultScopedEditorNavigationStack = this._register(this.instantiationService.createInstance(EditorNavigationStacks, 0 /* GoScope.DEFAULT */));
                    this._register(this.defaultScopedEditorNavigationStack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
                }
                return this.defaultScopedEditorNavigationStack;
            }
        }
    }
    goForward(filter) {
        return this.getStack().goForward(filter);
    }
    goBack(filter) {
        return this.getStack().goBack(filter);
    }
    goPrevious(filter) {
        return this.getStack().goPrevious(filter);
    }
    goLast(filter) {
        return this.getStack().goLast(filter);
    }
    handleActiveEditorChangeInNavigationStacks(group, editorPane) {
        this.getStack(group, editorPane?.input).handleActiveEditorChange(editorPane);
    }
    handleActiveEditorSelectionChangeInNavigationStacks(group, editorPane, event) {
        this.getStack(group, editorPane.input).handleActiveEditorSelectionChange(editorPane, event);
    }
    handleEditorCloseEventInHistory(e) {
        const editors = this.editorScopedNavigationStacks.get(e.groupId);
        if (editors) {
            const editorStack = editors.get(e.editor);
            if (editorStack) {
                editorStack.disposable.dispose();
                editors.delete(e.editor);
            }
            if (editors.size === 0) {
                this.editorScopedNavigationStacks.delete(e.groupId);
            }
        }
    }
    handleEditorGroupRemoveInNavigationStacks(group) {
        // Global
        this.defaultScopedEditorNavigationStack?.remove(group.id);
        // Editor groups
        const editorGroupStack = this.editorGroupScopedNavigationStacks.get(group.id);
        if (editorGroupStack) {
            editorGroupStack.disposable.dispose();
            this.editorGroupScopedNavigationStacks.delete(group.id);
        }
    }
    clearEditorNavigationStacks() {
        this.withEachEditorNavigationStack(stack => stack.clear());
    }
    removeFromEditorNavigationStacks(arg1) {
        this.withEachEditorNavigationStack(stack => stack.remove(arg1));
    }
    moveInEditorNavigationStacks(event) {
        this.withEachEditorNavigationStack(stack => stack.move(event));
    }
    withEachEditorNavigationStack(fn) {
        // Global
        if (this.defaultScopedEditorNavigationStack) {
            fn(this.defaultScopedEditorNavigationStack);
        }
        // Per editor group
        for (const [, entry] of this.editorGroupScopedNavigationStacks) {
            fn(entry.stack);
        }
        // Per editor
        for (const [, entries] of this.editorScopedNavigationStacks) {
            for (const [, entry] of entries) {
                fn(entry.stack);
            }
        }
    }
    disposeEditorNavigationStacks() {
        // Global
        this.defaultScopedEditorNavigationStack?.dispose();
        this.defaultScopedEditorNavigationStack = undefined;
        // Per Editor group
        for (const [, stack] of this.editorGroupScopedNavigationStacks) {
            stack.disposable.dispose();
        }
        this.editorGroupScopedNavigationStacks.clear();
        // Per Editor
        for (const [, stacks] of this.editorScopedNavigationStacks) {
            for (const [, stack] of stacks) {
                stack.disposable.dispose();
            }
        }
        this.editorScopedNavigationStacks.clear();
    }
    openNextRecentlyUsedEditor(groupId) {
        const [stack, index] = this.ensureRecentlyUsedStack(index => index - 1, groupId);
        return this.doNavigateInRecentlyUsedEditorsStack(stack[index], groupId);
    }
    openPreviouslyUsedEditor(groupId) {
        const [stack, index] = this.ensureRecentlyUsedStack(index => index + 1, groupId);
        return this.doNavigateInRecentlyUsedEditorsStack(stack[index], groupId);
    }
    async doNavigateInRecentlyUsedEditorsStack(editorIdentifier, groupId) {
        if (editorIdentifier) {
            const acrossGroups = typeof groupId !== 'number' || !this.editorGroupService.getGroup(groupId);
            if (acrossGroups) {
                this.navigatingInRecentlyUsedEditorsStack = true;
            }
            else {
                this.navigatingInRecentlyUsedEditorsInGroupStack = true;
            }
            const group = this.editorGroupService.getGroup(editorIdentifier.groupId) ?? this.editorGroupService.activeGroup;
            try {
                await group.openEditor(editorIdentifier.editor);
            }
            finally {
                if (acrossGroups) {
                    this.navigatingInRecentlyUsedEditorsStack = false;
                }
                else {
                    this.navigatingInRecentlyUsedEditorsInGroupStack = false;
                }
            }
        }
    }
    ensureRecentlyUsedStack(indexModifier, groupId) {
        let editors;
        let index;
        const group = typeof groupId === 'number' ? this.editorGroupService.getGroup(groupId) : undefined;
        // Across groups
        if (!group) {
            editors = this.recentlyUsedEditorsStack || this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
            index = this.recentlyUsedEditorsStackIndex;
        }
        // Within group
        else {
            editors = this.recentlyUsedEditorsInGroupStack || group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ groupId: group.id, editor }));
            index = this.recentlyUsedEditorsInGroupStackIndex;
        }
        // Adjust index
        let newIndex = indexModifier(index);
        if (newIndex < 0) {
            newIndex = 0;
        }
        else if (newIndex > editors.length - 1) {
            newIndex = editors.length - 1;
        }
        // Remember index and editors
        if (!group) {
            this.recentlyUsedEditorsStack = editors;
            this.recentlyUsedEditorsStackIndex = newIndex;
        }
        else {
            this.recentlyUsedEditorsInGroupStack = editors;
            this.recentlyUsedEditorsInGroupStackIndex = newIndex;
        }
        return [editors, newIndex];
    }
    handleEditorEventInRecentEditorsStack() {
        // Drop all-editors stack unless navigating in all editors
        if (!this.navigatingInRecentlyUsedEditorsStack) {
            this.recentlyUsedEditorsStack = undefined;
            this.recentlyUsedEditorsStackIndex = 0;
        }
        // Drop in-group-editors stack unless navigating in group
        if (!this.navigatingInRecentlyUsedEditorsInGroupStack) {
            this.recentlyUsedEditorsInGroupStack = undefined;
            this.recentlyUsedEditorsInGroupStackIndex = 0;
        }
    }
    //#endregion
    //#region File: Reopen Closed Editor (limit: 20)
    static { this.MAX_RECENTLY_CLOSED_EDITORS = 20; }
    handleEditorCloseEventInReopen(event) {
        if (this.ignoreEditorCloseEvent) {
            return; // blocked
        }
        const { editor, context } = event;
        if (context === EditorCloseContext.REPLACE || context === EditorCloseContext.MOVE) {
            return; // ignore if editor was replaced or moved
        }
        const untypedEditor = editor.toUntyped();
        if (!untypedEditor) {
            return; // we need a untyped editor to restore from going forward
        }
        const associatedResources = [];
        const editorResource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.BOTH });
        if (URI.isUri(editorResource)) {
            associatedResources.push(editorResource);
        }
        else if (editorResource) {
            associatedResources.push(...coalesce([editorResource.primary, editorResource.secondary]));
        }
        // Remove from list of recently closed before...
        this.removeFromRecentlyClosedEditors(editor);
        // ...adding it as last recently closed
        this.recentlyClosedEditors.push({
            editorId: editor.editorId,
            editor: untypedEditor,
            resource: EditorResourceAccessor.getOriginalUri(editor),
            associatedResources,
            index: event.index,
            sticky: event.sticky
        });
        // Bounding
        if (this.recentlyClosedEditors.length > HistoryService_1.MAX_RECENTLY_CLOSED_EDITORS) {
            this.recentlyClosedEditors.shift();
        }
        // Context
        this.canReopenClosedEditorContextKey.set(true);
    }
    async reopenLastClosedEditor() {
        // Open editor if we have one
        const lastClosedEditor = this.recentlyClosedEditors.pop();
        let reopenClosedEditorPromise = undefined;
        if (lastClosedEditor) {
            reopenClosedEditorPromise = this.doReopenLastClosedEditor(lastClosedEditor);
        }
        // Update context
        this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
        return reopenClosedEditorPromise;
    }
    async doReopenLastClosedEditor(lastClosedEditor) {
        const options = { pinned: true, sticky: lastClosedEditor.sticky, index: lastClosedEditor.index, ignoreError: true };
        // Special sticky handling: remove the index property from options
        // if that would result in sticky state to not preserve or apply
        // wrongly.
        if ((lastClosedEditor.sticky && !this.editorGroupService.activeGroup.isSticky(lastClosedEditor.index)) ||
            (!lastClosedEditor.sticky && this.editorGroupService.activeGroup.isSticky(lastClosedEditor.index))) {
            options.index = undefined;
        }
        // Re-open editor unless already opened
        let editorPane = undefined;
        if (!this.editorGroupService.activeGroup.contains(lastClosedEditor.editor)) {
            // Fix for https://github.com/microsoft/vscode/issues/107850
            // If opening an editor fails, it is possible that we get
            // another editor-close event as a result. But we really do
            // want to ignore that in our list of recently closed editors
            //  to prevent endless loops.
            this.ignoreEditorCloseEvent = true;
            try {
                editorPane = await this.editorService.openEditor({
                    ...lastClosedEditor.editor,
                    options: {
                        ...lastClosedEditor.editor.options,
                        ...options
                    }
                });
            }
            finally {
                this.ignoreEditorCloseEvent = false;
            }
        }
        // If no editor was opened, try with the next one
        if (!editorPane) {
            // Fix for https://github.com/microsoft/vscode/issues/67882
            // If opening of the editor fails, make sure to try the next one
            // but make sure to remove this one from the list to prevent
            // endless loops.
            remove(this.recentlyClosedEditors, lastClosedEditor);
            // Try with next one
            this.reopenLastClosedEditor();
        }
    }
    removeFromRecentlyClosedEditors(arg1) {
        this.recentlyClosedEditors = this.recentlyClosedEditors.filter(recentlyClosedEditor => {
            if (isEditorInput(arg1) && recentlyClosedEditor.editorId !== arg1.editorId) {
                return true; // keep: different editor identifiers
            }
            if (recentlyClosedEditor.resource && this.editorHelper.matchesFile(recentlyClosedEditor.resource, arg1)) {
                return false; // remove: editor matches directly
            }
            if (recentlyClosedEditor.associatedResources.some(associatedResource => this.editorHelper.matchesFile(associatedResource, arg1))) {
                return false; // remove: an associated resource matches
            }
            return true; // keep
        });
        // Update context
        this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
    }
    //#endregion
    //#region Go to: Recently Opened Editor (limit: 200, persisted)
    static { this.MAX_HISTORY_ITEMS = 200; }
    static { this.HISTORY_STORAGE_KEY = 'history.entries'; }
    handleActiveEditorChangeInHistory(editorPane) {
        // Ensure we have not configured to exclude input and don't track invalid inputs
        const editor = editorPane?.input;
        if (!editor || editor.isDisposed() || !this.includeInHistory(editor)) {
            return;
        }
        // Remove any existing entry and add to the beginning
        this.removeFromHistory(editor);
        this.addToHistory(editor);
    }
    addToHistory(editor, insertFirst = true) {
        this.ensureHistoryLoaded(this.history);
        const historyInput = this.editorHelper.preferResourceEditorInput(editor);
        if (!historyInput) {
            return;
        }
        // Insert based on preference
        if (insertFirst) {
            this.history.unshift(historyInput);
        }
        else {
            this.history.push(historyInput);
        }
        // Respect max entries setting
        if (this.history.length > HistoryService_1.MAX_HISTORY_ITEMS) {
            this.editorHelper.clearOnEditorDispose(this.history.pop(), this.editorHistoryListeners);
        }
        // React to editor input disposing
        if (isEditorInput(editor)) {
            this.editorHelper.onEditorDispose(editor, () => this.updateHistoryOnEditorDispose(historyInput), this.editorHistoryListeners);
        }
    }
    updateHistoryOnEditorDispose(editor) {
        if (isEditorInput(editor)) {
            // Any non side-by-side editor input gets removed directly on dispose
            if (!isSideBySideEditorInput(editor)) {
                this.removeFromHistory(editor);
            }
            // Side-by-side editors get special treatment: we try to distill the
            // possibly untyped resource inputs from both sides to be able to
            // offer these entries from the history to the user still unless
            // they are excluded.
            else {
                const resourceInputs = [];
                const sideInputs = editor.primary.matches(editor.secondary) ? [editor.primary] : [editor.primary, editor.secondary];
                for (const sideInput of sideInputs) {
                    const candidateResourceInput = this.editorHelper.preferResourceEditorInput(sideInput);
                    if (isResourceEditorInput(candidateResourceInput) && this.includeInHistory(candidateResourceInput)) {
                        resourceInputs.push(candidateResourceInput);
                    }
                }
                // Insert the untyped resource inputs where our disposed
                // side-by-side editor input is in the history stack
                this.replaceInHistory(editor, ...resourceInputs);
            }
        }
        else {
            // Remove any editor that should not be included in history
            if (!this.includeInHistory(editor)) {
                this.removeFromHistory(editor);
            }
        }
    }
    includeInHistory(editor) {
        if (isEditorInput(editor)) {
            return true; // include any non files
        }
        return !this.resourceExcludeMatcher.value.matches(editor.resource);
    }
    removeExcludedFromHistory() {
        this.ensureHistoryLoaded(this.history);
        this.history = this.history.filter(entry => {
            const include = this.includeInHistory(entry);
            // Cleanup any listeners associated with the input when removing from history
            if (!include) {
                this.editorHelper.clearOnEditorDispose(entry, this.editorHistoryListeners);
            }
            return include;
        });
    }
    moveInHistory(event) {
        if (event.isOperation(2 /* FileOperation.MOVE */)) {
            const removed = this.removeFromHistory(event);
            if (removed) {
                this.addToHistory({ resource: event.target.resource });
            }
        }
    }
    removeFromHistory(arg1) {
        let removed = false;
        this.ensureHistoryLoaded(this.history);
        this.history = this.history.filter(entry => {
            const matches = this.editorHelper.matchesEditor(arg1, entry);
            // Cleanup any listeners associated with the input when removing from history
            if (matches) {
                this.editorHelper.clearOnEditorDispose(arg1, this.editorHistoryListeners);
                removed = true;
            }
            return !matches;
        });
        return removed;
    }
    replaceInHistory(editor, ...replacements) {
        this.ensureHistoryLoaded(this.history);
        let replaced = false;
        const newHistory = [];
        for (const entry of this.history) {
            // Entry matches and is going to be disposed + replaced
            if (this.editorHelper.matchesEditor(editor, entry)) {
                // Cleanup any listeners associated with the input when replacing from history
                this.editorHelper.clearOnEditorDispose(editor, this.editorHistoryListeners);
                // Insert replacements but only once
                if (!replaced) {
                    newHistory.push(...replacements);
                    replaced = true;
                }
            }
            // Entry does not match, but only add it if it didn't match
            // our replacements already
            else if (!replacements.some(replacement => this.editorHelper.matchesEditor(replacement, entry))) {
                newHistory.push(entry);
            }
        }
        // If the target editor to replace was not found, make sure to
        // insert the replacements to the end to ensure we got them
        if (!replaced) {
            newHistory.push(...replacements);
        }
        this.history = newHistory;
    }
    clearRecentlyOpened() {
        this.history = [];
        for (const [, disposable] of this.editorHistoryListeners) {
            dispose(disposable);
        }
        this.editorHistoryListeners.clear();
    }
    getHistory() {
        this.ensureHistoryLoaded(this.history);
        return this.history;
    }
    ensureHistoryLoaded(history) {
        if (!this.history) {
            // Until history is loaded, it is just empty
            this.history = [];
            // We want to seed history from opened editors
            // too as well as previous stored state, so we
            // need to wait for the editor groups being ready
            if (this.editorGroupService.isReady) {
                this.loadHistory();
            }
            else {
                (async () => {
                    await this.editorGroupService.whenReady;
                    this.loadHistory();
                })();
            }
        }
    }
    loadHistory() {
        // Init as empty before adding - since we are about to
        // populate the history from opened editors, we capture
        // the right order here.
        this.history = [];
        // All stored editors from previous session
        const storedEditorHistory = this.loadHistoryFromStorage();
        // All restored editors from previous session
        // in reverse editor from least to most recently
        // used.
        const openedEditorsLru = [...this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)].reverse();
        // We want to merge the opened editors from the last
        // session with the stored editors from the last
        // session. Because not all editors can be serialised
        // we want to make sure to include all opened editors
        // too.
        // Opened editors should always be first in the history
        const handledEditors = new Set();
        // Add all opened editors first
        for (const { editor } of openedEditorsLru) {
            if (!this.includeInHistory(editor)) {
                continue;
            }
            // Add into history
            this.addToHistory(editor);
            // Remember as added
            if (editor.resource) {
                handledEditors.add(`${editor.resource.toString()}/${editor.editorId}`);
            }
        }
        // Add remaining from storage if not there already
        // We check on resource and `editorId` (from `override`)
        // to figure out if the editor has been already added.
        for (const editor of storedEditorHistory) {
            if (!handledEditors.has(`${editor.resource.toString()}/${editor.options?.override}`) &&
                this.includeInHistory(editor)) {
                this.addToHistory(editor, false /* at the end */);
            }
        }
    }
    loadHistoryFromStorage() {
        const entries = [];
        const entriesRaw = this.storageService.get(HistoryService_1.HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
        if (entriesRaw) {
            try {
                const entriesParsed = JSON.parse(entriesRaw);
                for (const entryParsed of entriesParsed) {
                    if (!entryParsed.editor || !entryParsed.editor.resource) {
                        continue; // unexpected data format
                    }
                    try {
                        entries.push({
                            ...entryParsed.editor,
                            resource: typeof entryParsed.editor.resource === 'string' ?
                                URI.parse(entryParsed.editor.resource) : //  from 1.67.x: URI is stored efficiently as URI.toString()
                                URI.from(entryParsed.editor.resource) // until 1.66.x: URI was stored very verbose as URI.toJSON()
                        });
                    }
                    catch (error) {
                        onUnexpectedError(error); // do not fail entire history when one entry fails
                    }
                }
            }
            catch (error) {
                onUnexpectedError(error); // https://github.com/microsoft/vscode/issues/99075
            }
        }
        return entries;
    }
    saveState() {
        if (!this.history) {
            return; // nothing to save because history was not used
        }
        const entries = [];
        for (const editor of this.history) {
            if (isEditorInput(editor) || !isResourceEditorInput(editor)) {
                continue; // only save resource editor inputs
            }
            entries.push({
                editor: {
                    ...editor,
                    resource: editor.resource.toString()
                }
            });
        }
        this.storageService.store(HistoryService_1.HISTORY_STORAGE_KEY, JSON.stringify(entries), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    //#endregion
    //#region Last Active Workspace/File
    getLastActiveWorkspaceRoot(schemeFilter, authorityFilter) {
        // No Folder: return early
        const folders = this.contextService.getWorkspace().folders;
        if (folders.length === 0) {
            return undefined;
        }
        // Single Folder: return early
        if (folders.length === 1) {
            const resource = folders[0].uri;
            if ((!schemeFilter || resource.scheme === schemeFilter) && (!authorityFilter || resource.authority === authorityFilter)) {
                return resource;
            }
            return undefined;
        }
        // Multiple folders: find the last active one
        for (const input of this.getHistory()) {
            if (isEditorInput(input)) {
                continue;
            }
            if (schemeFilter && input.resource.scheme !== schemeFilter) {
                continue;
            }
            if (authorityFilter && input.resource.authority !== authorityFilter) {
                continue;
            }
            const resourceWorkspace = this.contextService.getWorkspaceFolder(input.resource);
            if (resourceWorkspace) {
                return resourceWorkspace.uri;
            }
        }
        // Fallback to first workspace matching scheme filter if any
        for (const folder of folders) {
            const resource = folder.uri;
            if ((!schemeFilter || resource.scheme === schemeFilter) && (!authorityFilter || resource.authority === authorityFilter)) {
                return resource;
            }
        }
        return undefined;
    }
    getLastActiveFile(filterByScheme, filterByAuthority) {
        for (const input of this.getHistory()) {
            let resource;
            if (isEditorInput(input)) {
                resource = EditorResourceAccessor.getOriginalUri(input, { filterByScheme });
            }
            else {
                resource = input.resource;
            }
            if (resource && resource.scheme === filterByScheme && (!filterByAuthority || resource.authority === filterByAuthority)) {
                return resource;
            }
        }
        return undefined;
    }
    //#endregion
    dispose() {
        super.dispose();
        for (const [, stack] of this.editorGroupScopedNavigationStacks) {
            stack.disposable.dispose();
        }
        for (const [, editors] of this.editorScopedNavigationStacks) {
            for (const [, stack] of editors) {
                stack.disposable.dispose();
            }
        }
        for (const [, listener] of this.editorHistoryListeners) {
            listener.dispose();
        }
    }
};
HistoryService = HistoryService_1 = __decorate([
    __param(0, IEditorService),
    __param(1, IEditorGroupsService),
    __param(2, IWorkspaceContextService),
    __param(3, IStorageService),
    __param(4, IConfigurationService),
    __param(5, IFileService),
    __param(6, IWorkspacesService),
    __param(7, IInstantiationService),
    __param(8, IWorkbenchLayoutService),
    __param(9, IContextKeyService),
    __param(10, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], HistoryService);
export { HistoryService };
registerSingleton(IHistoryService, HistoryService, 0 /* InstantiationType.Eager */);
class EditorSelectionState {
    constructor(editorIdentifier, selection, reason) {
        this.editorIdentifier = editorIdentifier;
        this.selection = selection;
        this.reason = reason;
    }
    justifiesNewNavigationEntry(other) {
        if (this.editorIdentifier.groupId !== other.editorIdentifier.groupId) {
            return true; // different group
        }
        if (!this.editorIdentifier.editor.matches(other.editorIdentifier.editor)) {
            return true; // different editor
        }
        if (!this.selection || !other.selection) {
            return true; // unknown selections
        }
        const result = this.selection.compare(other.selection);
        if (result === 2 /* EditorPaneSelectionCompareResult.SIMILAR */ && (other.reason === 4 /* EditorPaneSelectionChangeReason.NAVIGATION */ || other.reason === 5 /* EditorPaneSelectionChangeReason.JUMP */)) {
            // let navigation sources win even if the selection is `SIMILAR`
            // (e.g. "Go to definition" should add a history entry)
            return true;
        }
        return result === 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
    }
}
let EditorNavigationStacks = class EditorNavigationStacks extends Disposable {
    constructor(scope, instantiationService) {
        super();
        this.scope = scope;
        this.instantiationService = instantiationService;
        this.selectionsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 0 /* GoFilter.NONE */, this.scope));
        this.editsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 1 /* GoFilter.EDITS */, this.scope));
        this.navigationsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 2 /* GoFilter.NAVIGATION */, this.scope));
        this.stacks = [
            this.selectionsStack,
            this.editsStack,
            this.navigationsStack
        ];
        this.onDidChange = Event.any(this.selectionsStack.onDidChange, this.editsStack.onDidChange, this.navigationsStack.onDidChange);
    }
    canGoForward(filter) {
        return this.getStack(filter).canGoForward();
    }
    goForward(filter) {
        return this.getStack(filter).goForward();
    }
    canGoBack(filter) {
        return this.getStack(filter).canGoBack();
    }
    goBack(filter) {
        return this.getStack(filter).goBack();
    }
    goPrevious(filter) {
        return this.getStack(filter).goPrevious();
    }
    canGoLast(filter) {
        return this.getStack(filter).canGoLast();
    }
    goLast(filter) {
        return this.getStack(filter).goLast();
    }
    getStack(filter = 0 /* GoFilter.NONE */) {
        switch (filter) {
            case 0 /* GoFilter.NONE */: return this.selectionsStack;
            case 1 /* GoFilter.EDITS */: return this.editsStack;
            case 2 /* GoFilter.NAVIGATION */: return this.navigationsStack;
        }
    }
    handleActiveEditorChange(editorPane) {
        // Always send to selections navigation stack
        this.selectionsStack.notifyNavigation(editorPane);
    }
    handleActiveEditorSelectionChange(editorPane, event) {
        const previous = this.selectionsStack.current;
        // Always send to selections navigation stack
        this.selectionsStack.notifyNavigation(editorPane, event);
        // Check for edits
        if (event.reason === 3 /* EditorPaneSelectionChangeReason.EDIT */) {
            this.editsStack.notifyNavigation(editorPane, event);
        }
        // Check for navigations
        //
        // Note: ignore if selections navigation stack is navigating because
        // in that case we do not want to receive repeated entries in
        // the navigation stack.
        else if ((event.reason === 4 /* EditorPaneSelectionChangeReason.NAVIGATION */ || event.reason === 5 /* EditorPaneSelectionChangeReason.JUMP */) &&
            !this.selectionsStack.isNavigating()) {
            // A "JUMP" navigation selection change always has a source and
            // target. As such, we add the previous entry of the selections
            // navigation stack so that our navigation stack receives both
            // entries unless the user is currently navigating.
            if (event.reason === 5 /* EditorPaneSelectionChangeReason.JUMP */ && !this.navigationsStack.isNavigating()) {
                if (previous) {
                    this.navigationsStack.addOrReplace(previous.groupId, previous.editor, previous.selection);
                }
            }
            this.navigationsStack.notifyNavigation(editorPane, event);
        }
    }
    clear() {
        for (const stack of this.stacks) {
            stack.clear();
        }
    }
    remove(arg1) {
        for (const stack of this.stacks) {
            stack.remove(arg1);
        }
    }
    move(event) {
        for (const stack of this.stacks) {
            stack.move(event);
        }
    }
};
EditorNavigationStacks = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Number, Object])
], EditorNavigationStacks);
class NoOpEditorNavigationStacks {
    constructor() {
        this.onDidChange = Event.None;
    }
    canGoForward() { return false; }
    async goForward() { }
    canGoBack() { return false; }
    async goBack() { }
    async goPrevious() { }
    canGoLast() { return false; }
    async goLast() { }
    handleActiveEditorChange() { }
    handleActiveEditorSelectionChange() { }
    clear() { }
    remove() { }
    move() { }
    dispose() { }
}
let EditorNavigationStack = class EditorNavigationStack extends Disposable {
    static { EditorNavigationStack_1 = this; }
    static { this.MAX_STACK_SIZE = 50; }
    get current() {
        return this.stack[this.index];
    }
    set current(entry) {
        if (entry) {
            this.stack[this.index] = entry;
        }
    }
    constructor(filter, scope, instantiationService, editorService, editorGroupService, logService) {
        super();
        this.filter = filter;
        this.scope = scope;
        this.instantiationService = instantiationService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.logService = logService;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.mapEditorToDisposable = new Map();
        this.mapGroupToDisposable = new Map();
        this.editorHelper = this.instantiationService.createInstance(EditorHelper);
        this.stack = [];
        this.index = -1;
        this.previousIndex = -1;
        this.navigating = false;
        this.currentSelectionState = undefined;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.onDidChange(() => this.traceStack()));
        this._register(this.logService.onDidChangeLogLevel(() => this.traceStack()));
    }
    traceStack() {
        if (this.logService.getLevel() !== LogLevel.Trace) {
            return;
        }
        const entryLabels = [];
        for (const entry of this.stack) {
            if (typeof entry.selection?.log === 'function') {
                entryLabels.push(`- group: ${entry.groupId}, editor: ${entry.editor.resource?.toString()}, selection: ${entry.selection.log()}`);
            }
            else {
                entryLabels.push(`- group: ${entry.groupId}, editor: ${entry.editor.resource?.toString()}, selection: <none>`);
            }
        }
        if (entryLabels.length === 0) {
            this.trace(`index: ${this.index}, navigating: ${this.isNavigating()}: <empty>`);
        }
        else {
            this.trace(`index: ${this.index}, navigating: ${this.isNavigating()}
${entryLabels.join('\n')}
			`);
        }
    }
    trace(msg, editor = null, event) {
        if (this.logService.getLevel() !== LogLevel.Trace) {
            return;
        }
        let filterLabel;
        switch (this.filter) {
            case 0 /* GoFilter.NONE */:
                filterLabel = 'global';
                break;
            case 1 /* GoFilter.EDITS */:
                filterLabel = 'edits';
                break;
            case 2 /* GoFilter.NAVIGATION */:
                filterLabel = 'navigation';
                break;
        }
        let scopeLabel;
        switch (this.scope) {
            case 0 /* GoScope.DEFAULT */:
                scopeLabel = 'default';
                break;
            case 1 /* GoScope.EDITOR_GROUP */:
                scopeLabel = 'editorGroup';
                break;
            case 2 /* GoScope.EDITOR */:
                scopeLabel = 'editor';
                break;
        }
        if (editor !== null) {
            this.logService.trace(`[History stack ${filterLabel}-${scopeLabel}]: ${msg} (editor: ${editor?.resource?.toString()}, event: ${this.traceEvent(event)})`);
        }
        else {
            this.logService.trace(`[History stack ${filterLabel}-${scopeLabel}]: ${msg}`);
        }
    }
    traceEvent(event) {
        if (!event) {
            return '<none>';
        }
        switch (event.reason) {
            case 3 /* EditorPaneSelectionChangeReason.EDIT */: return 'edit';
            case 4 /* EditorPaneSelectionChangeReason.NAVIGATION */: return 'navigation';
            case 5 /* EditorPaneSelectionChangeReason.JUMP */: return 'jump';
            case 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */: return 'programmatic';
            case 2 /* EditorPaneSelectionChangeReason.USER */: return 'user';
        }
    }
    registerGroupListeners(groupId) {
        if (!this.mapGroupToDisposable.has(groupId)) {
            const group = this.editorGroupService.getGroup(groupId);
            if (group) {
                this.mapGroupToDisposable.set(groupId, group.onWillMoveEditor(e => this.onWillMoveEditor(e)));
            }
        }
    }
    onWillMoveEditor(e) {
        this.trace('onWillMoveEditor()', e.editor);
        if (this.scope === 1 /* GoScope.EDITOR_GROUP */) {
            return; // ignore move events if our scope is group based
        }
        for (const entry of this.stack) {
            if (entry.groupId !== e.groupId) {
                continue; // not in the group that reported the event
            }
            if (!this.editorHelper.matchesEditor(e.editor, entry.editor)) {
                continue; // not the editor this event is about
            }
            // Update to target group
            entry.groupId = e.target;
        }
    }
    //#region Stack Mutation
    notifyNavigation(editorPane, event) {
        this.trace('notifyNavigation()', editorPane?.input, event);
        const isSelectionAwareEditorPane = isEditorPaneWithSelection(editorPane);
        const hasValidEditor = editorPane?.input && !editorPane.input.isDisposed();
        // Treat editor changes that happen as part of stack navigation specially
        // we do not want to add a new stack entry as a matter of navigating the
        // stack but we need to keep our currentEditorSelectionState up to date
        // with the navigtion that occurs.
        if (this.navigating) {
            this.trace(`notifyNavigation() ignoring (navigating)`, editorPane?.input, event);
            if (isSelectionAwareEditorPane && hasValidEditor) {
                this.trace('notifyNavigation() updating current selection state', editorPane?.input, event);
                this.currentSelectionState = new EditorSelectionState({ groupId: editorPane.group.id, editor: editorPane.input }, editorPane.getSelection(), event?.reason);
            }
            else {
                this.trace('notifyNavigation() dropping current selection state', editorPane?.input, event);
                this.currentSelectionState = undefined; // we navigated to a non-selection aware or disposed editor
            }
        }
        // Normal navigation not part of stack navigation
        else {
            this.trace(`notifyNavigation() not ignoring`, editorPane?.input, event);
            // Navigation inside selection aware editor
            if (isSelectionAwareEditorPane && hasValidEditor) {
                this.onSelectionAwareEditorNavigation(editorPane.group.id, editorPane.input, editorPane.getSelection(), event);
            }
            // Navigation to non-selection aware or disposed editor
            else {
                this.currentSelectionState = undefined; // at this time we have no active selection aware editor
                if (hasValidEditor) {
                    this.onNonSelectionAwareEditorNavigation(editorPane.group.id, editorPane.input);
                }
            }
        }
    }
    onSelectionAwareEditorNavigation(groupId, editor, selection, event) {
        if (this.current?.groupId === groupId && !selection && this.editorHelper.matchesEditor(this.current.editor, editor)) {
            return; // do not push same editor input again of same group if we have no valid selection
        }
        this.trace('onSelectionAwareEditorNavigation()', editor, event);
        const stateCandidate = new EditorSelectionState({ groupId, editor }, selection, event?.reason);
        // Add to stack if we dont have a current state or this new state justifies a push
        if (!this.currentSelectionState || this.currentSelectionState.justifiesNewNavigationEntry(stateCandidate)) {
            this.doAdd(groupId, editor, stateCandidate.selection);
        }
        // Otherwise we replace the current stack entry with this one
        else {
            this.doReplace(groupId, editor, stateCandidate.selection);
        }
        // Update our current navigation editor state
        this.currentSelectionState = stateCandidate;
    }
    onNonSelectionAwareEditorNavigation(groupId, editor) {
        if (this.current?.groupId === groupId && this.editorHelper.matchesEditor(this.current.editor, editor)) {
            return; // do not push same editor input again of same group
        }
        this.trace('onNonSelectionAwareEditorNavigation()', editor);
        this.doAdd(groupId, editor);
    }
    doAdd(groupId, editor, selection) {
        if (!this.navigating) {
            this.addOrReplace(groupId, editor, selection);
        }
    }
    doReplace(groupId, editor, selection) {
        if (!this.navigating) {
            this.addOrReplace(groupId, editor, selection, true /* force replace */);
        }
    }
    addOrReplace(groupId, editorCandidate, selection, forceReplace) {
        // Ensure we listen to changes in group
        this.registerGroupListeners(groupId);
        // Check whether to replace an existing entry or not
        let replace = false;
        if (this.current) {
            if (forceReplace) {
                replace = true; // replace if we are forced to
            }
            else if (this.shouldReplaceStackEntry(this.current, { groupId, editor: editorCandidate, selection })) {
                replace = true; // replace if the group & input is the same and selection indicates as such
            }
        }
        const editor = this.editorHelper.preferResourceEditorInput(editorCandidate);
        if (!editor) {
            return;
        }
        if (replace) {
            this.trace('replace()', editor);
        }
        else {
            this.trace('add()', editor);
        }
        const newStackEntry = { groupId, editor, selection };
        // Replace at current position
        const removedEntries = [];
        if (replace) {
            if (this.current) {
                removedEntries.push(this.current);
            }
            this.current = newStackEntry;
        }
        // Add to stack at current position
        else {
            // If we are not at the end of history, we remove anything after
            if (this.stack.length > this.index + 1) {
                for (let i = this.index + 1; i < this.stack.length; i++) {
                    removedEntries.push(this.stack[i]);
                }
                this.stack = this.stack.slice(0, this.index + 1);
            }
            // Insert entry at index
            this.stack.splice(this.index + 1, 0, newStackEntry);
            // Check for limit
            if (this.stack.length > EditorNavigationStack_1.MAX_STACK_SIZE) {
                removedEntries.push(this.stack.shift()); // remove first
                if (this.previousIndex >= 0) {
                    this.previousIndex--;
                }
            }
            else {
                this.setIndex(this.index + 1, true /* skip event, we fire it later */);
            }
        }
        // Clear editor listeners from removed entries
        for (const removedEntry of removedEntries) {
            this.editorHelper.clearOnEditorDispose(removedEntry.editor, this.mapEditorToDisposable);
        }
        // Remove this from the stack unless the stack input is a resource
        // that can easily be restored even when the input gets disposed
        if (isEditorInput(editor)) {
            this.editorHelper.onEditorDispose(editor, () => this.remove(editor), this.mapEditorToDisposable);
        }
        // Event
        this._onDidChange.fire();
    }
    shouldReplaceStackEntry(entry, candidate) {
        if (entry.groupId !== candidate.groupId) {
            return false; // different group
        }
        if (!this.editorHelper.matchesEditor(entry.editor, candidate.editor)) {
            return false; // different editor
        }
        if (!entry.selection) {
            return true; // always replace when we have no specific selection yet
        }
        if (!candidate.selection) {
            return false; // otherwise, prefer to keep existing specific selection over new unspecific one
        }
        // Finally, replace when selections are considered identical
        return entry.selection.compare(candidate.selection) === 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
    }
    move(event) {
        if (event.isOperation(2 /* FileOperation.MOVE */)) {
            for (const entry of this.stack) {
                if (this.editorHelper.matchesEditor(event, entry.editor)) {
                    entry.editor = { resource: event.target.resource };
                }
            }
        }
    }
    remove(arg1) {
        const previousStackSize = this.stack.length;
        // Remove all stack entries that match `arg1`
        this.stack = this.stack.filter(entry => {
            const matches = typeof arg1 === 'number' ? entry.groupId === arg1 : this.editorHelper.matchesEditor(arg1, entry.editor);
            // Cleanup any listeners associated with the input when removing
            if (matches) {
                this.editorHelper.clearOnEditorDispose(entry.editor, this.mapEditorToDisposable);
            }
            return !matches;
        });
        if (previousStackSize === this.stack.length) {
            return; // nothing removed
        }
        // Given we just removed entries, we need to make sure
        // to remove entries that are now identical and next
        // to each other to prevent no-op navigations.
        this.flatten();
        // Reset indeces
        this.index = this.stack.length - 1;
        this.previousIndex = -1;
        // Clear group listener
        if (typeof arg1 === 'number') {
            this.mapGroupToDisposable.get(arg1)?.dispose();
            this.mapGroupToDisposable.delete(arg1);
        }
        // Event
        this._onDidChange.fire();
    }
    flatten() {
        const flattenedStack = [];
        let previousEntry = undefined;
        for (const entry of this.stack) {
            if (previousEntry && this.shouldReplaceStackEntry(entry, previousEntry)) {
                continue; // skip over entry when it is considered the same
            }
            previousEntry = entry;
            flattenedStack.push(entry);
        }
        this.stack = flattenedStack;
    }
    clear() {
        this.index = -1;
        this.previousIndex = -1;
        this.stack.splice(0);
        for (const [, disposable] of this.mapEditorToDisposable) {
            dispose(disposable);
        }
        this.mapEditorToDisposable.clear();
        for (const [, disposable] of this.mapGroupToDisposable) {
            dispose(disposable);
        }
        this.mapGroupToDisposable.clear();
    }
    dispose() {
        super.dispose();
        this.clear();
    }
    //#endregion
    //#region Navigation
    canGoForward() {
        return this.stack.length > this.index + 1;
    }
    async goForward() {
        const navigated = await this.maybeGoCurrent();
        if (navigated) {
            return;
        }
        if (!this.canGoForward()) {
            return;
        }
        this.setIndex(this.index + 1);
        return this.navigate();
    }
    canGoBack() {
        return this.index > 0;
    }
    async goBack() {
        const navigated = await this.maybeGoCurrent();
        if (navigated) {
            return;
        }
        if (!this.canGoBack()) {
            return;
        }
        this.setIndex(this.index - 1);
        return this.navigate();
    }
    async goPrevious() {
        const navigated = await this.maybeGoCurrent();
        if (navigated) {
            return;
        }
        // If we never navigated, just go back
        if (this.previousIndex === -1) {
            return this.goBack();
        }
        // Otherwise jump to previous stack entry
        this.setIndex(this.previousIndex);
        return this.navigate();
    }
    canGoLast() {
        return this.stack.length > 0;
    }
    async goLast() {
        if (!this.canGoLast()) {
            return;
        }
        this.setIndex(this.stack.length - 1);
        return this.navigate();
    }
    async maybeGoCurrent() {
        // When this navigation stack works with a specific
        // filter where not every selection change is added
        // to the stack, we want to first reveal the current
        // selection before attempting to navigate in the
        // stack.
        if (this.filter === 0 /* GoFilter.NONE */) {
            return false; // only applies when  we are a filterd stack
        }
        if (this.isCurrentSelectionActive()) {
            return false; // we are at the current navigation stop
        }
        // Go to current selection
        await this.navigate();
        return true;
    }
    isCurrentSelectionActive() {
        if (!this.current?.selection) {
            return false; // we need a current selection
        }
        const pane = this.editorService.activeEditorPane;
        if (!isEditorPaneWithSelection(pane)) {
            return false; // we need an active editor pane with selection support
        }
        if (pane.group.id !== this.current.groupId) {
            return false; // we need matching groups
        }
        if (!pane.input || !this.editorHelper.matchesEditor(pane.input, this.current.editor)) {
            return false; // we need matching editors
        }
        const paneSelection = pane.getSelection();
        if (!paneSelection) {
            return false; // we need a selection to compare with
        }
        return paneSelection.compare(this.current.selection) === 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
    }
    setIndex(newIndex, skipEvent) {
        this.previousIndex = this.index;
        this.index = newIndex;
        // Event
        if (!skipEvent) {
            this._onDidChange.fire();
        }
    }
    async navigate() {
        this.navigating = true;
        try {
            if (this.current) {
                await this.doNavigate(this.current);
            }
        }
        finally {
            this.navigating = false;
        }
    }
    doNavigate(location) {
        let options = Object.create(null);
        // Apply selection if any
        if (location.selection) {
            options = location.selection.restore(options);
        }
        if (isEditorInput(location.editor)) {
            return this.editorService.openEditor(location.editor, options, location.groupId);
        }
        return this.editorService.openEditor({
            ...location.editor,
            options: {
                ...location.editor.options,
                ...options
            }
        }, location.groupId);
    }
    isNavigating() {
        return this.navigating;
    }
};
EditorNavigationStack = EditorNavigationStack_1 = __decorate([
    __param(2, IInstantiationService),
    __param(3, IEditorService),
    __param(4, IEditorGroupsService),
    __param(5, ILogService),
    __metadata("design:paramtypes", [Number, Number, Object, Object, Object, Object])
], EditorNavigationStack);
export { EditorNavigationStack };
let EditorHelper = class EditorHelper {
    constructor(uriIdentityService, lifecycleService, fileService, pathService) {
        this.uriIdentityService = uriIdentityService;
        this.lifecycleService = lifecycleService;
        this.fileService = fileService;
        this.pathService = pathService;
    }
    preferResourceEditorInput(editor) {
        const resource = EditorResourceAccessor.getOriginalUri(editor);
        // For now, only prefer well known schemes that we control to prevent
        // issues such as https://github.com/microsoft/vscode/issues/85204
        // from being used as resource inputs
        // resource inputs survive editor disposal and as such are a lot more
        // durable across editor changes and restarts
        const hasValidResourceEditorInputScheme = resource?.scheme === Schemas.file ||
            resource?.scheme === Schemas.vscodeRemote ||
            resource?.scheme === Schemas.vscodeUserData ||
            resource?.scheme === this.pathService.defaultUriScheme;
        // Scheme is valid: prefer the untyped input
        // over the typed input if possible to keep
        // the entry across restarts
        if (hasValidResourceEditorInputScheme) {
            if (isEditorInput(editor)) {
                const untypedInput = editor.toUntyped();
                if (isResourceEditorInput(untypedInput)) {
                    return untypedInput;
                }
            }
            return editor;
        }
        // Scheme is invalid: allow the editor input
        // for as long as it is not disposed
        else {
            return isEditorInput(editor) ? editor : undefined;
        }
    }
    matchesEditor(arg1, inputB) {
        if (arg1 instanceof FileChangesEvent || arg1 instanceof FileOperationEvent) {
            if (isEditorInput(inputB)) {
                return false; // we only support this for `IResourceEditorInputs` that are file based
            }
            if (arg1 instanceof FileChangesEvent) {
                return arg1.contains(inputB.resource, 2 /* FileChangeType.DELETED */);
            }
            return this.matchesFile(inputB.resource, arg1);
        }
        if (isEditorInput(arg1)) {
            if (isEditorInput(inputB)) {
                return arg1.matches(inputB);
            }
            return this.matchesFile(inputB.resource, arg1);
        }
        if (isEditorInput(inputB)) {
            return this.matchesFile(arg1.resource, inputB);
        }
        return arg1 && inputB && this.uriIdentityService.extUri.isEqual(arg1.resource, inputB.resource);
    }
    matchesFile(resource, arg2) {
        if (arg2 instanceof FileChangesEvent) {
            return arg2.contains(resource, 2 /* FileChangeType.DELETED */);
        }
        if (arg2 instanceof FileOperationEvent) {
            return this.uriIdentityService.extUri.isEqualOrParent(resource, arg2.resource);
        }
        if (isEditorInput(arg2)) {
            const inputResource = arg2.resource;
            if (!inputResource) {
                return false;
            }
            if (this.lifecycleService.phase >= 3 /* LifecyclePhase.Restored */ && !this.fileService.hasProvider(inputResource)) {
                return false; // make sure to only check this when workbench has restored (for https://github.com/microsoft/vscode/issues/48275)
            }
            return this.uriIdentityService.extUri.isEqual(inputResource, resource);
        }
        return this.uriIdentityService.extUri.isEqual(arg2?.resource, resource);
    }
    matchesEditorIdentifier(identifier, editorPane) {
        if (!editorPane?.group) {
            return false;
        }
        if (identifier.groupId !== editorPane.group.id) {
            return false;
        }
        return editorPane.input ? identifier.editor.matches(editorPane.input) : false;
    }
    onEditorDispose(editor, listener, mapEditorToDispose) {
        const toDispose = Event.once(editor.onWillDispose)(() => listener());
        let disposables = mapEditorToDispose.get(editor);
        if (!disposables) {
            disposables = new DisposableStore();
            mapEditorToDispose.set(editor, disposables);
        }
        disposables.add(toDispose);
    }
    clearOnEditorDispose(editor, mapEditorToDispose) {
        if (!isEditorInput(editor)) {
            return; // only supported when passing in an actual editor input
        }
        const disposables = mapEditorToDispose.get(editor);
        if (disposables) {
            dispose(disposables);
            mapEditorToDispose.delete(editor);
        }
    }
};
EditorHelper = __decorate([
    __param(0, IUriIdentityService),
    __param(1, ILifecycleService),
    __param(2, IFileService),
    __param(3, IPathService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], EditorHelper);
