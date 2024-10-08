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
var OpenEditorsView_1;
import './media/openeditors.css';
import * as nls from '../../../../../nls.js';
import { RunOnceScheduler } from '../../../../../base/common/async.js';
import { ActionRunner } from '../../../../../base/common/actions.js';
import * as dom from '../../../../../base/browser/dom.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { EditorResourceAccessor, SideBySideEditor, preventEditorClose, EditorCloseMethod } from '../../../../common/editor.js';
import { SaveAllInGroupAction, CloseGroupAction } from '../fileActions.js';
import { OpenEditorsFocusedContext, ExplorerFocusedContext, OpenEditor } from '../../common/files.js';
import { CloseAllEditorsAction, CloseEditorAction, UnpinEditorAction } from '../../../../browser/parts/editor/editorActions.js';
import { IContextKeyService, ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { asCssVariable, badgeBackground, badgeForeground, contrastBorder } from '../../../../../platform/theme/common/colorRegistry.js';
import { WorkbenchList } from '../../../../../platform/list/browser/listService.js';
import { ResourceLabels } from '../../../../browser/labels.js';
import { ActionBar } from '../../../../../base/browser/ui/actionbar/actionbar.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { DisposableMap, dispose } from '../../../../../base/common/lifecycle.js';
import { MenuId, Action2, registerAction2, MenuRegistry } from '../../../../../platform/actions/common/actions.js';
import { OpenEditorsDirtyEditorContext, OpenEditorsGroupContext, OpenEditorsReadonlyEditorContext, SAVE_ALL_LABEL, SAVE_ALL_COMMAND_ID, NEW_UNTITLED_FILE_COMMAND_ID, OpenEditorsSelectedFileOrUntitledContext } from '../fileConstants.js';
import { ResourceContextKey, MultipleEditorGroupsContext } from '../../../../common/contextkeys.js';
import { CodeDataTransfers, containsDragType } from '../../../../../platform/dnd/browser/dnd.js';
import { ResourcesDropHandler, fillEditorsDragData } from '../../../../browser/dnd.js';
import { ViewPane } from '../../../../browser/parts/views/viewPane.js';
import { DataTransfers } from '../../../../../base/browser/dnd.js';
import { memoize } from '../../../../../base/common/decorators.js';
import { ElementsDragAndDropData, NativeDragAndDropData } from '../../../../../base/browser/ui/list/listView.js';
import { IWorkingCopyService } from '../../../../services/workingCopy/common/workingCopyService.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IViewDescriptorService } from '../../../../common/views.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { compareFileNamesDefault } from '../../../../../base/common/comparers.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { Schemas } from '../../../../../base/common/network.js';
import { extUriIgnorePathCase } from '../../../../../base/common/resources.js';
import { mainWindow } from '../../../../../base/browser/window.js';
import { EditorGroupView } from '../../../../browser/parts/editor/editorGroupView.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
const $ = dom.$;
let OpenEditorsView = class OpenEditorsView extends ViewPane {
    static { OpenEditorsView_1 = this; }
    static { this.DEFAULT_VISIBLE_OPEN_EDITORS = 9; }
    static { this.DEFAULT_MIN_VISIBLE_OPEN_EDITORS = 0; }
    static { this.ID = 'workbench.explorer.openEditorsView'; }
    static { this.NAME = nls.localize2({ key: 'openEditors', comment: ['Open is an adjective'] }, "Open Editors"); }
    constructor(options, instantiationService, viewDescriptorService, contextMenuService, editorGroupService, configurationService, keybindingService, contextKeyService, themeService, telemetryService, hoverService, workingCopyService, filesConfigurationService, openerService, fileService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.editorGroupService = editorGroupService;
        this.workingCopyService = workingCopyService;
        this.filesConfigurationService = filesConfigurationService;
        this.fileService = fileService;
        this.needsRefresh = false;
        this.elements = [];
        this.blockFocusActiveEditorTracking = false;
        this.structuralRefreshDelay = 0;
        this.sortOrder = configurationService.getValue('explorer.openEditors.sortOrder');
        this.registerUpdateEvents();
        // Also handle configuration updates
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChange(e)));
        // Handle dirty counter
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.updateDirtyIndicator(workingCopy)));
    }
    registerUpdateEvents() {
        const updateWholeList = () => {
            if (!this.isBodyVisible() || !this.list) {
                this.needsRefresh = true;
                return;
            }
            this.listRefreshScheduler?.schedule(this.structuralRefreshDelay);
        };
        const groupDisposables = this._register(new DisposableMap());
        const addGroupListener = (group) => {
            const groupModelChangeListener = group.onDidModelChange(e => {
                if (this.listRefreshScheduler?.isScheduled()) {
                    return;
                }
                if (!this.isBodyVisible() || !this.list) {
                    this.needsRefresh = true;
                    return;
                }
                const index = this.getIndex(group, e.editor);
                switch (e.kind) {
                    case 8 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                        this.focusActiveEditor();
                        break;
                    case 1 /* GroupModelChangeKind.GROUP_INDEX */:
                    case 2 /* GroupModelChangeKind.GROUP_LABEL */:
                        if (index >= 0) {
                            this.list.splice(index, 1, [group]);
                        }
                        break;
                    case 14 /* GroupModelChangeKind.EDITOR_DIRTY */:
                    case 13 /* GroupModelChangeKind.EDITOR_STICKY */:
                    case 10 /* GroupModelChangeKind.EDITOR_CAPABILITIES */:
                    case 11 /* GroupModelChangeKind.EDITOR_PIN */:
                    case 9 /* GroupModelChangeKind.EDITOR_LABEL */:
                        this.list.splice(index, 1, [new OpenEditor(e.editor, group)]);
                        this.focusActiveEditor();
                        break;
                    case 5 /* GroupModelChangeKind.EDITOR_OPEN */:
                    case 7 /* GroupModelChangeKind.EDITOR_MOVE */:
                    case 6 /* GroupModelChangeKind.EDITOR_CLOSE */:
                        updateWholeList();
                        break;
                }
            });
            groupDisposables.set(group.id, groupModelChangeListener);
        };
        this.editorGroupService.groups.forEach(g => addGroupListener(g));
        this._register(this.editorGroupService.onDidAddGroup(group => {
            addGroupListener(group);
            updateWholeList();
        }));
        this._register(this.editorGroupService.onDidMoveGroup(() => updateWholeList()));
        this._register(this.editorGroupService.onDidChangeActiveGroup(() => this.focusActiveEditor()));
        this._register(this.editorGroupService.onDidRemoveGroup(group => {
            groupDisposables.deleteAndDispose(group.id);
            updateWholeList();
        }));
    }
    renderHeaderTitle(container) {
        super.renderHeaderTitle(container, this.title);
        const count = dom.append(container, $('.open-editors-dirty-count-container'));
        this.dirtyCountElement = dom.append(count, $('.dirty-count.monaco-count-badge.long'));
        this.dirtyCountElement.style.backgroundColor = asCssVariable(badgeBackground);
        this.dirtyCountElement.style.color = asCssVariable(badgeForeground);
        this.dirtyCountElement.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
        this.updateDirtyIndicator();
    }
    renderBody(container) {
        super.renderBody(container);
        container.classList.add('open-editors');
        container.classList.add('show-file-icons');
        const delegate = new OpenEditorsDelegate();
        if (this.list) {
            this.list.dispose();
        }
        if (this.listLabels) {
            this.listLabels.clear();
        }
        this.dnd = new OpenEditorsDragAndDrop(this.sortOrder, this.instantiationService, this.editorGroupService);
        this.listLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
        this.list = this.instantiationService.createInstance(WorkbenchList, 'OpenEditors', container, delegate, [
            new EditorGroupRenderer(this.keybindingService, this.instantiationService),
            new OpenEditorRenderer(this.listLabels, this.instantiationService, this.keybindingService, this.configurationService)
        ], {
            identityProvider: { getId: (element) => element instanceof OpenEditor ? element.getId() : element.id.toString() },
            dnd: this.dnd,
            overrideStyles: this.getLocationBasedColors().listOverrideStyles,
            accessibilityProvider: new OpenEditorsAccessibilityProvider()
        });
        this._register(this.list);
        this._register(this.listLabels);
        // Register the refresh scheduler
        let labelChangeListeners = [];
        this.listRefreshScheduler = this._register(new RunOnceScheduler(() => {
            // No need to refresh the list if it's not rendered
            if (!this.list) {
                return;
            }
            labelChangeListeners = dispose(labelChangeListeners);
            const previousLength = this.list.length;
            const elements = this.getElements();
            this.list.splice(0, this.list.length, elements);
            this.focusActiveEditor();
            if (previousLength !== this.list.length) {
                this.updateSize();
            }
            this.needsRefresh = false;
            if (this.sortOrder === 'alphabetical' || this.sortOrder === 'fullPath') {
                // We need to resort the list if the editor label changed
                elements.forEach(e => {
                    if (e instanceof OpenEditor) {
                        labelChangeListeners.push(e.editor.onDidChangeLabel(() => this.listRefreshScheduler?.schedule()));
                    }
                });
            }
        }, this.structuralRefreshDelay));
        this.updateSize();
        this.handleContextKeys();
        this._register(this.list.onContextMenu(e => this.onListContextMenu(e)));
        // Open when selecting via keyboard
        this._register(this.list.onMouseMiddleClick(e => {
            if (e && e.element instanceof OpenEditor) {
                if (preventEditorClose(e.element.group, e.element.editor, EditorCloseMethod.MOUSE, this.editorGroupService.partOptions)) {
                    return;
                }
                e.element.group.closeEditor(e.element.editor, { preserveFocus: true });
            }
        }));
        this._register(this.list.onDidOpen(e => {
            const element = e.element;
            if (!element) {
                return;
            }
            else if (element instanceof OpenEditor) {
                if (dom.isMouseEvent(e.browserEvent) && e.browserEvent.button === 1) {
                    return; // middle click already handled above: closes the editor
                }
                this.withActiveEditorFocusTrackingDisabled(() => {
                    this.openEditor(element, { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, sideBySide: e.sideBySide });
                });
            }
            else {
                this.withActiveEditorFocusTrackingDisabled(() => {
                    this.editorGroupService.activateGroup(element);
                    if (!e.editorOptions.preserveFocus) {
                        element.focus();
                    }
                });
            }
        }));
        this.listRefreshScheduler.schedule(0);
        this._register(this.onDidChangeBodyVisibility(visible => {
            if (visible && this.needsRefresh) {
                this.listRefreshScheduler?.schedule(0);
            }
        }));
        const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
        this._register(containerModel.onDidChangeAllViewDescriptors(() => {
            this.updateSize();
        }));
    }
    handleContextKeys() {
        if (!this.list) {
            return;
        }
        // Bind context keys
        OpenEditorsFocusedContext.bindTo(this.list.contextKeyService);
        ExplorerFocusedContext.bindTo(this.list.contextKeyService);
        const groupFocusedContext = OpenEditorsGroupContext.bindTo(this.contextKeyService);
        const dirtyEditorFocusedContext = OpenEditorsDirtyEditorContext.bindTo(this.contextKeyService);
        const readonlyEditorFocusedContext = OpenEditorsReadonlyEditorContext.bindTo(this.contextKeyService);
        const openEditorsSelectedFileOrUntitledContext = OpenEditorsSelectedFileOrUntitledContext.bindTo(this.contextKeyService);
        const resourceContext = this.instantiationService.createInstance(ResourceContextKey);
        this._register(resourceContext);
        this._register(this.list.onDidChangeFocus(e => {
            resourceContext.reset();
            groupFocusedContext.reset();
            dirtyEditorFocusedContext.reset();
            readonlyEditorFocusedContext.reset();
            const element = e.elements.length ? e.elements[0] : undefined;
            if (element instanceof OpenEditor) {
                const resource = element.getResource();
                dirtyEditorFocusedContext.set(element.editor.isDirty() && !element.editor.isSaving());
                readonlyEditorFocusedContext.set(!!element.editor.isReadonly());
                resourceContext.set(resource ?? null);
            }
            else if (!!element) {
                groupFocusedContext.set(true);
            }
        }));
        this._register(this.list.onDidChangeSelection(e => {
            const selectedAreFileOrUntitled = e.elements.every(e => {
                if (e instanceof OpenEditor) {
                    const resource = e.getResource();
                    return resource && (resource.scheme === Schemas.untitled || this.fileService.hasProvider(resource));
                }
                return false;
            });
            openEditorsSelectedFileOrUntitledContext.set(selectedAreFileOrUntitled);
        }));
    }
    focus() {
        super.focus();
        this.list?.domFocus();
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.list?.layout(height, width);
    }
    get showGroups() {
        return this.editorGroupService.groups.length > 1;
    }
    getElements() {
        this.elements = [];
        this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).forEach(g => {
            if (this.showGroups) {
                this.elements.push(g);
            }
            let editors = g.editors.map(ei => new OpenEditor(ei, g));
            if (this.sortOrder === 'alphabetical') {
                editors = editors.sort((first, second) => compareFileNamesDefault(first.editor.getName(), second.editor.getName()));
            }
            else if (this.sortOrder === 'fullPath') {
                editors = editors.sort((first, second) => {
                    const firstResource = first.editor.resource;
                    const secondResource = second.editor.resource;
                    //put 'system' editors before everything
                    if (firstResource === undefined && secondResource === undefined) {
                        return compareFileNamesDefault(first.editor.getName(), second.editor.getName());
                    }
                    else if (firstResource === undefined) {
                        return -1;
                    }
                    else if (secondResource === undefined) {
                        return 1;
                    }
                    else {
                        const firstScheme = firstResource.scheme;
                        const secondScheme = secondResource.scheme;
                        //put non-file editors before files
                        if (firstScheme !== Schemas.file && secondScheme !== Schemas.file) {
                            return extUriIgnorePathCase.compare(firstResource, secondResource);
                        }
                        else if (firstScheme !== Schemas.file) {
                            return -1;
                        }
                        else if (secondScheme !== Schemas.file) {
                            return 1;
                        }
                        else {
                            return extUriIgnorePathCase.compare(firstResource, secondResource);
                        }
                    }
                });
            }
            this.elements.push(...editors);
        });
        return this.elements;
    }
    getIndex(group, editor) {
        if (!editor) {
            return this.elements.findIndex(e => !(e instanceof OpenEditor) && e.id === group.id);
        }
        return this.elements.findIndex(e => e instanceof OpenEditor && e.editor === editor && e.group.id === group.id);
    }
    openEditor(element, options) {
        if (element) {
            this.telemetryService.publicLog2('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'openEditors' });
            const preserveActivateGroup = options.sideBySide && options.preserveFocus; // needed for https://github.com/microsoft/vscode/issues/42399
            if (!preserveActivateGroup) {
                this.editorGroupService.activateGroup(element.group); // needed for https://github.com/microsoft/vscode/issues/6672
            }
            const targetGroup = options.sideBySide ? this.editorGroupService.sideGroup : element.group;
            targetGroup.openEditor(element.editor, options);
        }
    }
    onListContextMenu(e) {
        if (!e.element) {
            return;
        }
        const element = e.element;
        this.contextMenuService.showContextMenu({
            menuId: MenuId.OpenEditorsContext,
            menuActionOptions: { shouldForwardArgs: true, arg: element instanceof OpenEditor ? EditorResourceAccessor.getOriginalUri(element.editor) : {} },
            contextKeyService: this.list?.contextKeyService,
            getAnchor: () => e.anchor,
            getActionsContext: () => element instanceof OpenEditor ? { groupId: element.groupId, editorIndex: element.group.getIndexOfEditor(element.editor) } : { groupId: element.id }
        });
    }
    withActiveEditorFocusTrackingDisabled(fn) {
        this.blockFocusActiveEditorTracking = true;
        try {
            fn();
        }
        finally {
            this.blockFocusActiveEditorTracking = false;
        }
    }
    focusActiveEditor() {
        if (!this.list || this.blockFocusActiveEditorTracking) {
            return;
        }
        if (this.list.length && this.editorGroupService.activeGroup) {
            const index = this.getIndex(this.editorGroupService.activeGroup, this.editorGroupService.activeGroup.activeEditor);
            if (index >= 0) {
                try {
                    this.list.setFocus([index]);
                    this.list.setSelection([index]);
                    this.list.reveal(index);
                }
                catch (e) {
                    // noop list updated in the meantime
                }
                return;
            }
        }
        this.list.setFocus([]);
        this.list.setSelection([]);
    }
    onConfigurationChange(event) {
        if (event.affectsConfiguration('explorer.openEditors')) {
            this.updateSize();
        }
        // Trigger a 'repaint' when decoration settings change or the sort order changed
        if (event.affectsConfiguration('explorer.decorations') || event.affectsConfiguration('explorer.openEditors.sortOrder')) {
            this.sortOrder = this.configurationService.getValue('explorer.openEditors.sortOrder');
            if (this.dnd) {
                this.dnd.sortOrder = this.sortOrder;
            }
            this.listRefreshScheduler?.schedule();
        }
    }
    updateSize() {
        // Adjust expanded body size
        this.minimumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? this.getMinExpandedBodySize() : 170;
        this.maximumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? this.getMaxExpandedBodySize() : Number.POSITIVE_INFINITY;
    }
    updateDirtyIndicator(workingCopy) {
        if (workingCopy) {
            const gotDirty = workingCopy.isDirty();
            if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.hasShortAutoSaveDelay(workingCopy.resource)) {
                return; // do not indicate dirty of working copies that are auto saved after short delay
            }
        }
        const dirty = this.workingCopyService.dirtyCount;
        if (dirty === 0) {
            this.dirtyCountElement.classList.add('hidden');
        }
        else {
            this.dirtyCountElement.textContent = nls.localize('dirtyCounter', "{0} unsaved", dirty);
            this.dirtyCountElement.classList.remove('hidden');
        }
    }
    get elementCount() {
        return this.editorGroupService.groups.map(g => g.count)
            .reduce((first, second) => first + second, this.showGroups ? this.editorGroupService.groups.length : 0);
    }
    getMaxExpandedBodySize() {
        let minVisibleOpenEditors = this.configurationService.getValue('explorer.openEditors.minVisible');
        // If it's not a number setting it to 0 will result in dynamic resizing.
        if (typeof minVisibleOpenEditors !== 'number') {
            minVisibleOpenEditors = OpenEditorsView_1.DEFAULT_MIN_VISIBLE_OPEN_EDITORS;
        }
        const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
        if (containerModel.visibleViewDescriptors.length <= 1) {
            return Number.POSITIVE_INFINITY;
        }
        return (Math.max(this.elementCount, minVisibleOpenEditors)) * OpenEditorsDelegate.ITEM_HEIGHT;
    }
    getMinExpandedBodySize() {
        let visibleOpenEditors = this.configurationService.getValue('explorer.openEditors.visible');
        if (typeof visibleOpenEditors !== 'number') {
            visibleOpenEditors = OpenEditorsView_1.DEFAULT_VISIBLE_OPEN_EDITORS;
        }
        return this.computeMinExpandedBodySize(visibleOpenEditors);
    }
    computeMinExpandedBodySize(visibleOpenEditors = OpenEditorsView_1.DEFAULT_VISIBLE_OPEN_EDITORS) {
        const itemsToShow = Math.min(Math.max(visibleOpenEditors, 1), this.elementCount);
        return itemsToShow * OpenEditorsDelegate.ITEM_HEIGHT;
    }
    setStructuralRefreshDelay(delay) {
        this.structuralRefreshDelay = delay;
    }
    getOptimalWidth() {
        if (!this.list) {
            return super.getOptimalWidth();
        }
        const parentNode = this.list.getHTMLElement();
        const childNodes = [].slice.call(parentNode.querySelectorAll('.open-editor > a'));
        return dom.getLargestChildWidth(parentNode, childNodes);
    }
};
OpenEditorsView = OpenEditorsView_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IViewDescriptorService),
    __param(3, IContextMenuService),
    __param(4, IEditorGroupsService),
    __param(5, IConfigurationService),
    __param(6, IKeybindingService),
    __param(7, IContextKeyService),
    __param(8, IThemeService),
    __param(9, ITelemetryService),
    __param(10, IHoverService),
    __param(11, IWorkingCopyService),
    __param(12, IFilesConfigurationService),
    __param(13, IOpenerService),
    __param(14, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], OpenEditorsView);
export { OpenEditorsView };
class OpenEditorActionRunner extends ActionRunner {
    async run(action) {
        if (!this.editor) {
            return;
        }
        return super.run(action, { groupId: this.editor.groupId, editorIndex: this.editor.group.getIndexOfEditor(this.editor.editor) });
    }
}
class OpenEditorsDelegate {
    static { this.ITEM_HEIGHT = 22; }
    getHeight(_element) {
        return OpenEditorsDelegate.ITEM_HEIGHT;
    }
    getTemplateId(element) {
        if (element instanceof OpenEditor) {
            return OpenEditorRenderer.ID;
        }
        return EditorGroupRenderer.ID;
    }
}
class EditorGroupRenderer {
    static { this.ID = 'editorgroup'; }
    constructor(keybindingService, instantiationService) {
        this.keybindingService = keybindingService;
        this.instantiationService = instantiationService;
        // noop
    }
    get templateId() {
        return EditorGroupRenderer.ID;
    }
    renderTemplate(container) {
        const editorGroupTemplate = Object.create(null);
        editorGroupTemplate.root = dom.append(container, $('.editor-group'));
        editorGroupTemplate.name = dom.append(editorGroupTemplate.root, $('span.name'));
        editorGroupTemplate.actionBar = new ActionBar(container);
        const saveAllInGroupAction = this.instantiationService.createInstance(SaveAllInGroupAction, SaveAllInGroupAction.ID, SaveAllInGroupAction.LABEL);
        const saveAllInGroupKey = this.keybindingService.lookupKeybinding(saveAllInGroupAction.id);
        editorGroupTemplate.actionBar.push(saveAllInGroupAction, { icon: true, label: false, keybinding: saveAllInGroupKey ? saveAllInGroupKey.getLabel() : undefined });
        const closeGroupAction = this.instantiationService.createInstance(CloseGroupAction, CloseGroupAction.ID, CloseGroupAction.LABEL);
        const closeGroupActionKey = this.keybindingService.lookupKeybinding(closeGroupAction.id);
        editorGroupTemplate.actionBar.push(closeGroupAction, { icon: true, label: false, keybinding: closeGroupActionKey ? closeGroupActionKey.getLabel() : undefined });
        return editorGroupTemplate;
    }
    renderElement(editorGroup, _index, templateData) {
        templateData.editorGroup = editorGroup;
        templateData.name.textContent = editorGroup.label;
        templateData.actionBar.context = { groupId: editorGroup.id };
    }
    disposeTemplate(templateData) {
        templateData.actionBar.dispose();
    }
}
class OpenEditorRenderer {
    static { this.ID = 'openeditor'; }
    constructor(labels, instantiationService, keybindingService, configurationService) {
        this.labels = labels;
        this.instantiationService = instantiationService;
        this.keybindingService = keybindingService;
        this.configurationService = configurationService;
        this.closeEditorAction = this.instantiationService.createInstance(CloseEditorAction, CloseEditorAction.ID, CloseEditorAction.LABEL);
        this.unpinEditorAction = this.instantiationService.createInstance(UnpinEditorAction, UnpinEditorAction.ID, UnpinEditorAction.LABEL);
        // noop
    }
    get templateId() {
        return OpenEditorRenderer.ID;
    }
    renderTemplate(container) {
        const editorTemplate = Object.create(null);
        editorTemplate.container = container;
        editorTemplate.actionRunner = new OpenEditorActionRunner();
        editorTemplate.actionBar = new ActionBar(container, { actionRunner: editorTemplate.actionRunner });
        editorTemplate.root = this.labels.create(container);
        return editorTemplate;
    }
    renderElement(openedEditor, _index, templateData) {
        const editor = openedEditor.editor;
        templateData.actionRunner.editor = openedEditor;
        templateData.container.classList.toggle('dirty', editor.isDirty() && !editor.isSaving());
        templateData.container.classList.toggle('sticky', openedEditor.isSticky());
        templateData.root.setResource({
            resource: EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.BOTH }),
            name: editor.getName(),
            description: editor.getDescription(1 /* Verbosity.MEDIUM */)
        }, {
            italic: openedEditor.isPreview(),
            extraClasses: ['open-editor'].concat(openedEditor.editor.getLabelExtraClasses()),
            fileDecorations: this.configurationService.getValue().explorer.decorations,
            title: editor.getTitle(2 /* Verbosity.LONG */),
            icon: editor.getIcon()
        });
        const editorAction = openedEditor.isSticky() ? this.unpinEditorAction : this.closeEditorAction;
        if (!templateData.actionBar.hasAction(editorAction)) {
            if (!templateData.actionBar.isEmpty()) {
                templateData.actionBar.clear();
            }
            templateData.actionBar.push(editorAction, { icon: true, label: false, keybinding: this.keybindingService.lookupKeybinding(editorAction.id)?.getLabel() });
        }
    }
    disposeTemplate(templateData) {
        templateData.actionBar.dispose();
        templateData.root.dispose();
        templateData.actionRunner.dispose();
    }
}
class OpenEditorsDragAndDrop {
    set sortOrder(value) {
        this._sortOrder = value;
    }
    constructor(sortOrder, instantiationService, editorGroupService) {
        this.instantiationService = instantiationService;
        this.editorGroupService = editorGroupService;
        this._sortOrder = sortOrder;
    }
    get dropHandler() {
        return this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: false });
    }
    getDragURI(element) {
        if (element instanceof OpenEditor) {
            const resource = element.getResource();
            if (resource) {
                return resource.toString();
            }
        }
        return null;
    }
    getDragLabel(elements) {
        if (elements.length > 1) {
            return String(elements.length);
        }
        const element = elements[0];
        return element instanceof OpenEditor ? element.editor.getName() : element.label;
    }
    onDragStart(data, originalEvent) {
        const items = data.elements;
        const editors = [];
        if (items) {
            for (const item of items) {
                if (item instanceof OpenEditor) {
                    editors.push(item);
                }
            }
        }
        if (editors.length) {
            // Apply some datatransfer types to allow for dragging the element outside of the application
            this.instantiationService.invokeFunction(fillEditorsDragData, editors, originalEvent);
        }
    }
    onDragOver(data, _targetElement, _targetIndex, targetSector, originalEvent) {
        if (data instanceof NativeDragAndDropData) {
            if (!containsDragType(originalEvent, DataTransfers.FILES, CodeDataTransfers.FILES)) {
                return false;
            }
        }
        if (this._sortOrder !== 'editorOrder') {
            if (data instanceof ElementsDragAndDropData) {
                // No reordering supported when sorted
                return false;
            }
            else {
                // Allow droping files to open them
                return { accept: true, effect: { type: 1 /* ListDragOverEffectType.Move */ }, feedback: [-1] };
            }
        }
        let dropEffectPosition = undefined;
        switch (targetSector) {
            case 0 /* ListViewTargetSector.TOP */:
            case 1 /* ListViewTargetSector.CENTER_TOP */:
                dropEffectPosition = (_targetIndex === 0 && _targetElement instanceof EditorGroupView) ? "drop-target-after" /* ListDragOverEffectPosition.After */ : "drop-target-before" /* ListDragOverEffectPosition.Before */;
                break;
            case 2 /* ListViewTargetSector.CENTER_BOTTOM */:
            case 3 /* ListViewTargetSector.BOTTOM */:
                dropEffectPosition = "drop-target-after" /* ListDragOverEffectPosition.After */;
                break;
        }
        return { accept: true, effect: { type: 1 /* ListDragOverEffectType.Move */, position: dropEffectPosition }, feedback: [_targetIndex] };
    }
    drop(data, targetElement, _targetIndex, targetSector, originalEvent) {
        let group = targetElement instanceof OpenEditor ? targetElement.group : targetElement || this.editorGroupService.groups[this.editorGroupService.count - 1];
        let targetEditorIndex = targetElement instanceof OpenEditor ? targetElement.group.getIndexOfEditor(targetElement.editor) : 0;
        switch (targetSector) {
            case 0 /* ListViewTargetSector.TOP */:
            case 1 /* ListViewTargetSector.CENTER_TOP */:
                if (targetElement instanceof EditorGroupView && group.index !== 0) {
                    group = this.editorGroupService.groups[group.index - 1];
                    targetEditorIndex = group.count;
                }
                break;
            case 3 /* ListViewTargetSector.BOTTOM */:
            case 2 /* ListViewTargetSector.CENTER_BOTTOM */:
                if (targetElement instanceof OpenEditor) {
                    targetEditorIndex++;
                }
                break;
        }
        if (data instanceof ElementsDragAndDropData) {
            for (const oe of data.elements) {
                const sourceEditorIndex = oe.group.getIndexOfEditor(oe.editor);
                if (oe.group === group && sourceEditorIndex < targetEditorIndex) {
                    targetEditorIndex--;
                }
                oe.group.moveEditor(oe.editor, group, { index: targetEditorIndex, preserveFocus: true });
                targetEditorIndex++;
            }
            this.editorGroupService.activateGroup(group);
        }
        else {
            this.dropHandler.handleDrop(originalEvent, mainWindow, () => group, () => group.focus(), { index: targetEditorIndex });
        }
    }
    dispose() { }
}
__decorate([
    memoize,
    __metadata("design:type", ResourcesDropHandler),
    __metadata("design:paramtypes", [])
], OpenEditorsDragAndDrop.prototype, "dropHandler", null);
class OpenEditorsAccessibilityProvider {
    getWidgetAriaLabel() {
        return nls.localize('openEditors', "Open Editors");
    }
    getAriaLabel(element) {
        if (element instanceof OpenEditor) {
            return `${element.editor.getName()}, ${element.editor.getDescription()}`;
        }
        return element.ariaLabel;
    }
}
const toggleEditorGroupLayoutId = 'workbench.action.toggleEditorGroupLayout';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleEditorGroupLayout',
            title: nls.localize2('flipLayout', "Toggle Vertical/Horizontal Editor Layout"),
            f1: true,
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 21 /* KeyCode.Digit0 */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 21 /* KeyCode.Digit0 */ },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            icon: Codicon.editorLayout,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', OpenEditorsView.ID), MultipleEditorGroupsContext),
                order: 10
            }
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const newOrientation = (editorGroupService.orientation === 1 /* GroupOrientation.VERTICAL */) ? 0 /* GroupOrientation.HORIZONTAL */ : 1 /* GroupOrientation.VERTICAL */;
        editorGroupService.setGroupOrientation(newOrientation);
        editorGroupService.activeGroup.focus();
    }
});
MenuRegistry.appendMenuItem(MenuId.MenubarLayoutMenu, {
    group: '5_flip',
    command: {
        id: toggleEditorGroupLayoutId,
        title: {
            ...nls.localize2('miToggleEditorLayoutWithoutMnemonic', "Flip Layout"),
            mnemonicTitle: nls.localize({ key: 'miToggleEditorLayout', comment: ['&& denotes a mnemonic'] }, "Flip &&Layout")
        }
    },
    order: 1
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.files.saveAll',
            title: SAVE_ALL_LABEL,
            f1: true,
            icon: Codicon.saveAll,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', OpenEditorsView.ID),
                order: 20
            }
        });
    }
    async run(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SAVE_ALL_COMMAND_ID);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'openEditors.closeAll',
            title: CloseAllEditorsAction.LABEL,
            f1: false,
            icon: Codicon.closeAll,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', OpenEditorsView.ID),
                order: 30
            }
        });
    }
    async run(accessor) {
        const instantiationService = accessor.get(IInstantiationService);
        const closeAll = new CloseAllEditorsAction();
        await instantiationService.invokeFunction(accessor => closeAll.run(accessor));
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'openEditors.newUntitledFile',
            title: nls.localize2('newUntitledFile', "New Untitled Text File"),
            f1: false,
            icon: Codicon.newFile,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', OpenEditorsView.ID),
                order: 5
            }
        });
    }
    async run(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
    }
});
