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
var EditorGroupView_1;
import './media/editorgroupview.css';
import { EditorGroupModel, isGroupEditorCloseEvent, isGroupEditorOpenEvent, isSerializedEditorGroupModel } from '../../../common/editor/editorGroupModel.js';
import { EditorResourceAccessor, DEFAULT_EDITOR_ASSOCIATION, SideBySideEditor, EditorCloseContext, TEXT_DIFF_EDITOR_ID } from '../../../common/editor.js';
import { ActiveEditorGroupLockedContext, ActiveEditorDirtyContext, EditorGroupEditorsCountContext, ActiveEditorStickyContext, ActiveEditorPinnedContext, ActiveEditorLastInGroupContext, ActiveEditorFirstInGroupContext, ResourceContextKey, applyAvailableEditorIds, ActiveEditorAvailableEditorIdsContext, ActiveEditorCanSplitInGroupContext, SideBySideEditorActiveContext, TextCompareEditorVisibleContext, TextCompareEditorActiveContext, ActiveEditorContext, ActiveEditorReadonlyContext, ActiveEditorCanRevertContext, ActiveEditorCanToggleReadonlyContext, ActiveCompareEditorCanSwapContext, MultipleEditorsSelectedInGroupContext, TwoEditorsSelectedInGroupContext, SelectedEditorsInGroupFileOrUntitledResourceContextKey } from '../../../common/contextkeys.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { Emitter, Relay } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Dimension, trackFocus, addDisposableListener, EventType, EventHelper, findParentWithClass, isAncestor, isMouseEvent, isActiveElement, getWindow, getActiveElement } from '../../../../base/browser/dom.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ProgressBar } from '../../../../base/browser/ui/progressbar/progressbar.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { editorBackground, contrastBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { EDITOR_GROUP_HEADER_TABS_BACKGROUND, EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND, EDITOR_GROUP_EMPTY_BACKGROUND, EDITOR_GROUP_HEADER_BORDER } from '../../../common/theme.js';
import { EditorPanes } from './editorPanes.js';
import { IEditorProgressService } from '../../../../platform/progress/common/progress.js';
import { EditorProgressIndicator } from '../../../services/progress/browser/progressIndicator.js';
import { localize } from '../../../../nls.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { DeferredPromise, Promises, RunOnceWorker } from '../../../../base/common/async.js';
import { EventType as TouchEventType } from '../../../../base/browser/touch.js';
import { fillActiveEditorViewState } from './editor.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { createAndFillInActionBarActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { hash } from '../../../../base/common/hash.js';
import { getMimeTypes } from '../../../../editor/common/services/languagesAssociations.js';
import { extname, isEqual } from '../../../../base/common/resources.js';
import { Schemas } from '../../../../base/common/network.js';
import { EditorActivation } from '../../../../platform/editor/common/editor.js';
import { IFileDialogService, IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { URI } from '../../../../base/common/uri.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { isLinux, isMacintosh, isNative, isWindows } from '../../../../base/common/platform.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { TelemetryTrustedValue } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { defaultProgressBarStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { EditorGroupWatermark } from './editorGroupWatermark.js';
import { EditorTitleControl } from './editorTitleControl.js';
import { EditorPane } from './editorPane.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { IFileService } from '../../../../platform/files/common/files.js';
let EditorGroupView = EditorGroupView_1 = class EditorGroupView extends Themable {
    static createNew(editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService, options) {
        return instantiationService.createInstance(EditorGroupView_1, null, editorPartsView, groupsView, groupsLabel, groupIndex, options);
    }
    static createFromSerialized(serialized, editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService, options) {
        return instantiationService.createInstance(EditorGroupView_1, serialized, editorPartsView, groupsView, groupsLabel, groupIndex, options);
    }
    static createCopy(copyFrom, editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService, options) {
        return instantiationService.createInstance(EditorGroupView_1, copyFrom, editorPartsView, groupsView, groupsLabel, groupIndex, options);
    }
    constructor(from, editorPartsView, groupsView, groupsLabel, _index, options, instantiationService, contextKeyService, themeService, telemetryService, keybindingService, menuService, contextMenuService, fileDialogService, editorService, filesConfigurationService, uriIdentityService, logService, editorResolverService, hostService, dialogService, fileService) {
        super(themeService);
        this.editorPartsView = editorPartsView;
        this.groupsView = groupsView;
        this.groupsLabel = groupsLabel;
        this._index = _index;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.telemetryService = telemetryService;
        this.keybindingService = keybindingService;
        this.menuService = menuService;
        this.contextMenuService = contextMenuService;
        this.fileDialogService = fileDialogService;
        this.editorService = editorService;
        this.filesConfigurationService = filesConfigurationService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        this.editorResolverService = editorResolverService;
        this.hostService = hostService;
        this.dialogService = dialogService;
        this.fileService = fileService;
        this._onDidFocus = this._register(new Emitter());
        this.onDidFocus = this._onDidFocus.event;
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        this._onDidModelChange = this._register(new Emitter());
        this.onDidModelChange = this._onDidModelChange.event;
        this._onDidActiveEditorChange = this._register(new Emitter());
        this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
        this._onDidOpenEditorFail = this._register(new Emitter());
        this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
        this._onWillCloseEditor = this._register(new Emitter());
        this.onWillCloseEditor = this._onWillCloseEditor.event;
        this._onDidCloseEditor = this._register(new Emitter());
        this.onDidCloseEditor = this._onDidCloseEditor.event;
        this._onWillMoveEditor = this._register(new Emitter());
        this.onWillMoveEditor = this._onWillMoveEditor.event;
        this._onWillOpenEditor = this._register(new Emitter());
        this.onWillOpenEditor = this._onWillOpenEditor.event;
        this.disposedEditorsWorker = this._register(new RunOnceWorker(editors => this.handleDisposedEditors(editors), 0));
        this.mapEditorToPendingConfirmation = new Map();
        this.containerToolBarMenuDisposable = this._register(new MutableDisposable());
        this.whenRestoredPromise = new DeferredPromise();
        this.whenRestored = this.whenRestoredPromise.p;
        this._disposed = false;
        this.element = document.createElement('div');
        this._onDidChange = this._register(new Relay());
        this.onDidChange = this._onDidChange.event;
        if (from instanceof EditorGroupView_1) {
            this.model = this._register(from.model.clone());
        }
        else if (isSerializedEditorGroupModel(from)) {
            this.model = this._register(instantiationService.createInstance(EditorGroupModel, from));
        }
        else {
            this.model = this._register(instantiationService.createInstance(EditorGroupModel, undefined));
        }
        {
            this.scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
            this.element.classList.add(...coalesce(['editor-group-container', this.model.isLocked ? 'locked' : undefined]));
            this.registerContainerListeners();
            this.createContainerToolbar();
            this.createContainerContextMenu();
            this._register(this.instantiationService.createInstance(EditorGroupWatermark, this.element));
            this.progressBar = this._register(new ProgressBar(this.element, defaultProgressBarStyles));
            this.progressBar.hide();
            this.scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService], [IEditorProgressService, this._register(new EditorProgressIndicator(this.progressBar, this))])));
            this.resourceContext = this._register(this.scopedInstantiationService.createInstance(ResourceContextKey));
            this.handleGroupContextKeys();
            this.titleContainer = document.createElement('div');
            this.titleContainer.classList.add('title');
            this.element.appendChild(this.titleContainer);
            this.titleControl = this._register(this.scopedInstantiationService.createInstance(EditorTitleControl, this.titleContainer, this.editorPartsView, this.groupsView, this, this.model));
            this.editorContainer = document.createElement('div');
            this.editorContainer.classList.add('editor-container');
            this.element.appendChild(this.editorContainer);
            this.editorPane = this._register(this.scopedInstantiationService.createInstance(EditorPanes, this.element, this.editorContainer, this));
            this._onDidChange.input = this.editorPane.onDidChangeSizeConstraints;
            this.doTrackFocus();
            this.updateTitleContainer();
            this.updateContainer();
            this.updateStyles();
        }
        const restoreEditorsPromise = this.restoreEditors(from, options) ?? Promise.resolve();
        restoreEditorsPromise.finally(() => {
            this.whenRestoredPromise.complete();
        });
        this.registerListeners();
    }
    handleGroupContextKeys() {
        const groupActiveEditorDirtyContext = this.editorPartsView.bind(ActiveEditorDirtyContext, this);
        const groupActiveEditorPinnedContext = this.editorPartsView.bind(ActiveEditorPinnedContext, this);
        const groupActiveEditorFirstContext = this.editorPartsView.bind(ActiveEditorFirstInGroupContext, this);
        const groupActiveEditorLastContext = this.editorPartsView.bind(ActiveEditorLastInGroupContext, this);
        const groupActiveEditorStickyContext = this.editorPartsView.bind(ActiveEditorStickyContext, this);
        const groupEditorsCountContext = this.editorPartsView.bind(EditorGroupEditorsCountContext, this);
        const groupLockedContext = this.editorPartsView.bind(ActiveEditorGroupLockedContext, this);
        const multipleEditorsSelectedContext = MultipleEditorsSelectedInGroupContext.bindTo(this.scopedContextKeyService);
        const twoEditorsSelectedContext = TwoEditorsSelectedInGroupContext.bindTo(this.scopedContextKeyService);
        const selectedEditorsHaveFileOrUntitledResourceContext = SelectedEditorsInGroupFileOrUntitledResourceContextKey.bindTo(this.scopedContextKeyService);
        const groupActiveEditorContext = this.editorPartsView.bind(ActiveEditorContext, this);
        const groupActiveEditorIsReadonly = this.editorPartsView.bind(ActiveEditorReadonlyContext, this);
        const groupActiveEditorCanRevert = this.editorPartsView.bind(ActiveEditorCanRevertContext, this);
        const groupActiveEditorCanToggleReadonly = this.editorPartsView.bind(ActiveEditorCanToggleReadonlyContext, this);
        const groupActiveCompareEditorCanSwap = this.editorPartsView.bind(ActiveCompareEditorCanSwapContext, this);
        const groupTextCompareEditorVisibleContext = this.editorPartsView.bind(TextCompareEditorVisibleContext, this);
        const groupTextCompareEditorActiveContext = this.editorPartsView.bind(TextCompareEditorActiveContext, this);
        const groupActiveEditorAvailableEditorIds = this.editorPartsView.bind(ActiveEditorAvailableEditorIdsContext, this);
        const groupActiveEditorCanSplitInGroupContext = this.editorPartsView.bind(ActiveEditorCanSplitInGroupContext, this);
        const groupActiveEditorIsSideBySideEditorContext = this.editorPartsView.bind(SideBySideEditorActiveContext, this);
        const activeEditorListener = this._register(new MutableDisposable());
        const observeActiveEditor = () => {
            activeEditorListener.clear();
            this.scopedContextKeyService.bufferChangeEvents(() => {
                const activeEditor = this.activeEditor;
                const activeEditorPane = this.activeEditorPane;
                this.resourceContext.set(EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY }));
                applyAvailableEditorIds(groupActiveEditorAvailableEditorIds, activeEditor, this.editorResolverService);
                if (activeEditor) {
                    groupActiveEditorCanSplitInGroupContext.set(activeEditor.hasCapability(32));
                    groupActiveEditorIsSideBySideEditorContext.set(activeEditor.typeId === SideBySideEditorInput.ID);
                    groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
                    activeEditorListener.value = activeEditor.onDidChangeDirty(() => {
                        groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
                    });
                }
                else {
                    groupActiveEditorCanSplitInGroupContext.set(false);
                    groupActiveEditorIsSideBySideEditorContext.set(false);
                    groupActiveEditorDirtyContext.set(false);
                }
                if (activeEditorPane) {
                    groupActiveEditorContext.set(activeEditorPane.getId());
                    groupActiveEditorCanRevert.set(!activeEditorPane.input.hasCapability(4));
                    groupActiveEditorIsReadonly.set(!!activeEditorPane.input.isReadonly());
                    const primaryEditorResource = EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: SideBySideEditor.PRIMARY });
                    const secondaryEditorResource = EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: SideBySideEditor.SECONDARY });
                    groupActiveCompareEditorCanSwap.set(activeEditorPane.input instanceof DiffEditorInput && !activeEditorPane.input.original.isReadonly() && !!primaryEditorResource && (this.fileService.hasProvider(primaryEditorResource) || primaryEditorResource.scheme === Schemas.untitled) && !!secondaryEditorResource && (this.fileService.hasProvider(secondaryEditorResource) || secondaryEditorResource.scheme === Schemas.untitled));
                    groupActiveEditorCanToggleReadonly.set(!!primaryEditorResource && this.fileService.hasProvider(primaryEditorResource) && !this.fileService.hasCapability(primaryEditorResource, 2048));
                    const activePaneDiffEditor = activeEditorPane?.getId() === TEXT_DIFF_EDITOR_ID;
                    groupTextCompareEditorActiveContext.set(activePaneDiffEditor);
                    groupTextCompareEditorVisibleContext.set(activePaneDiffEditor);
                }
                else {
                    groupActiveEditorContext.reset();
                    groupActiveEditorCanRevert.reset();
                    groupActiveEditorIsReadonly.reset();
                    groupActiveCompareEditorCanSwap.reset();
                    groupActiveEditorCanToggleReadonly.reset();
                }
            });
        };
        const updateGroupContextKeys = (e) => {
            switch (e.kind) {
                case 3:
                    groupLockedContext.set(this.isLocked);
                    break;
                case 8:
                    groupActiveEditorFirstContext.set(this.model.isFirst(this.model.activeEditor));
                    groupActiveEditorLastContext.set(this.model.isLast(this.model.activeEditor));
                    groupActiveEditorPinnedContext.set(this.model.activeEditor ? this.model.isPinned(this.model.activeEditor) : false);
                    groupActiveEditorStickyContext.set(this.model.activeEditor ? this.model.isSticky(this.model.activeEditor) : false);
                    break;
                case 6:
                    groupActiveEditorPinnedContext.set(this.model.activeEditor ? this.model.isPinned(this.model.activeEditor) : false);
                    groupActiveEditorStickyContext.set(this.model.activeEditor ? this.model.isSticky(this.model.activeEditor) : false);
                case 5:
                case 7:
                    groupActiveEditorFirstContext.set(this.model.isFirst(this.model.activeEditor));
                    groupActiveEditorLastContext.set(this.model.isLast(this.model.activeEditor));
                    break;
                case 11:
                    if (e.editor && e.editor === this.model.activeEditor) {
                        groupActiveEditorPinnedContext.set(this.model.isPinned(this.model.activeEditor));
                    }
                    break;
                case 13:
                    if (e.editor && e.editor === this.model.activeEditor) {
                        groupActiveEditorStickyContext.set(this.model.isSticky(this.model.activeEditor));
                    }
                    break;
                case 4:
                    multipleEditorsSelectedContext.set(this.model.selectedEditors.length > 1);
                    twoEditorsSelectedContext.set(this.model.selectedEditors.length === 2);
                    selectedEditorsHaveFileOrUntitledResourceContext.set(this.model.selectedEditors.every(e => e.resource && (this.fileService.hasProvider(e.resource) || e.resource.scheme === Schemas.untitled)));
                    break;
            }
            groupEditorsCountContext.set(this.count);
        };
        this._register(this.onDidModelChange(e => updateGroupContextKeys(e)));
        this._register(this.onDidActiveEditorChange(() => observeActiveEditor()));
        observeActiveEditor();
        updateGroupContextKeys({ kind: 8 });
        updateGroupContextKeys({ kind: 3 });
    }
    registerContainerListeners() {
        this._register(addDisposableListener(this.element, EventType.DBLCLICK, e => {
            if (this.isEmpty) {
                EventHelper.stop(e);
                this.editorService.openEditor({
                    resource: undefined,
                    options: {
                        pinned: true,
                        override: DEFAULT_EDITOR_ASSOCIATION.id
                    }
                }, this.id);
            }
        }));
        this._register(addDisposableListener(this.element, EventType.AUXCLICK, e => {
            if (this.isEmpty && e.button === 1) {
                EventHelper.stop(e, true);
                this.groupsView.removeGroup(this);
            }
        }));
    }
    createContainerToolbar() {
        const toolbarContainer = document.createElement('div');
        toolbarContainer.classList.add('editor-group-container-toolbar');
        this.element.appendChild(toolbarContainer);
        const containerToolbar = this._register(new ActionBar(toolbarContainer, {
            ariaLabel: localize('ariaLabelGroupActions', "Empty editor group actions"),
            highlightToggledItems: true
        }));
        const containerToolbarMenu = this._register(this.menuService.createMenu(MenuId.EmptyEditorGroup, this.scopedContextKeyService));
        const updateContainerToolbar = () => {
            const actions = { primary: [], secondary: [] };
            this.containerToolBarMenuDisposable.value = toDisposable(() => containerToolbar.clear());
            createAndFillInActionBarActions(containerToolbarMenu, { arg: { groupId: this.id }, shouldForwardArgs: true }, actions, 'navigation');
            for (const action of [...actions.primary, ...actions.secondary]) {
                const keybinding = this.keybindingService.lookupKeybinding(action.id);
                containerToolbar.push(action, { icon: true, label: false, keybinding: keybinding?.getLabel() });
            }
        };
        updateContainerToolbar();
        this._register(containerToolbarMenu.onDidChange(updateContainerToolbar));
    }
    createContainerContextMenu() {
        this._register(addDisposableListener(this.element, EventType.CONTEXT_MENU, e => this.onShowContainerContextMenu(e)));
        this._register(addDisposableListener(this.element, TouchEventType.Contextmenu, () => this.onShowContainerContextMenu()));
    }
    onShowContainerContextMenu(e) {
        if (!this.isEmpty) {
            return;
        }
        let anchor = this.element;
        if (e) {
            anchor = new StandardMouseEvent(getWindow(this.element), e);
        }
        this.contextMenuService.showContextMenu({
            menuId: MenuId.EmptyEditorGroupContext,
            contextKeyService: this.contextKeyService,
            getAnchor: () => anchor,
            onHide: () => {
                this.focus();
            }
        });
    }
    doTrackFocus() {
        const containerFocusTracker = this._register(trackFocus(this.element));
        this._register(containerFocusTracker.onDidFocus(() => {
            if (this.isEmpty) {
                this._onDidFocus.fire();
            }
        }));
        const handleTitleClickOrTouch = (e) => {
            let target;
            if (isMouseEvent(e)) {
                if (e.button !== 0 || (isMacintosh && e.ctrlKey)) {
                    return undefined;
                }
                target = e.target;
            }
            else {
                target = e.initialTarget;
            }
            if (findParentWithClass(target, 'monaco-action-bar', this.titleContainer) ||
                findParentWithClass(target, 'monaco-breadcrumb-item', this.titleContainer)) {
                return;
            }
            setTimeout(() => {
                this.focus();
            });
        };
        this._register(addDisposableListener(this.titleContainer, EventType.MOUSE_DOWN, e => handleTitleClickOrTouch(e)));
        this._register(addDisposableListener(this.titleContainer, TouchEventType.Tap, e => handleTitleClickOrTouch(e)));
        this._register(this.editorPane.onDidFocus(() => {
            this._onDidFocus.fire();
        }));
    }
    updateContainer() {
        if (this.isEmpty) {
            this.element.classList.add('empty');
            this.element.tabIndex = 0;
            this.element.setAttribute('aria-label', localize('emptyEditorGroup', "{0} (empty)", this.ariaLabel));
        }
        else {
            this.element.classList.remove('empty');
            this.element.removeAttribute('tabIndex');
            this.element.removeAttribute('aria-label');
        }
        this.updateStyles();
    }
    updateTitleContainer() {
        this.titleContainer.classList.toggle('tabs', this.groupsView.partOptions.showTabs === 'multiple');
        this.titleContainer.classList.toggle('show-file-icons', this.groupsView.partOptions.showIcons);
    }
    restoreEditors(from, groupViewOptions) {
        if (this.count === 0) {
            return;
        }
        let options;
        if (from instanceof EditorGroupView_1) {
            options = fillActiveEditorViewState(from);
        }
        else {
            options = Object.create(null);
        }
        const activeEditor = this.model.activeEditor;
        if (!activeEditor) {
            return;
        }
        options.pinned = this.model.isPinned(activeEditor);
        options.sticky = this.model.isSticky(activeEditor);
        options.preserveFocus = true;
        const internalOptions = {
            preserveWindowOrder: true,
            skipTitleUpdate: true,
        };
        const activeElement = getActiveElement();
        const result = this.doShowEditor(activeEditor, { active: true, isNew: false }, options, internalOptions).then(() => {
            if (this.groupsView.activeGroup === this && activeElement && isActiveElement(activeElement) && !groupViewOptions?.preserveFocus) {
                this.focus();
            }
        });
        this.titleControl.openEditors(this.editors);
        return result;
    }
    registerListeners() {
        this._register(this.model.onDidModelChange(e => this.onDidGroupModelChange(e)));
        this._register(this.groupsView.onDidChangeEditorPartOptions(e => this.onDidChangeEditorPartOptions(e)));
        this._register(this.groupsView.onDidVisibilityChange(e => this.onDidVisibilityChange(e)));
        this._register(this.onDidFocus(() => this.onDidGainFocus()));
    }
    onDidGroupModelChange(e) {
        this._onDidModelChange.fire(e);
        switch (e.kind) {
            case 3:
                this.element.classList.toggle('locked', this.isLocked);
                break;
            case 4:
                this.onDidChangeEditorSelection();
                break;
        }
        if (!e.editor) {
            return;
        }
        switch (e.kind) {
            case 5:
                if (isGroupEditorOpenEvent(e)) {
                    this.onDidOpenEditor(e.editor, e.editorIndex);
                }
                break;
            case 6:
                if (isGroupEditorCloseEvent(e)) {
                    this.handleOnDidCloseEditor(e.editor, e.editorIndex, e.context, e.sticky);
                }
                break;
            case 15:
                this.onWillDisposeEditor(e.editor);
                break;
            case 14:
                this.onDidChangeEditorDirty(e.editor);
                break;
            case 12:
                this.onDidChangeEditorTransient(e.editor);
                break;
            case 9:
                this.onDidChangeEditorLabel(e.editor);
                break;
        }
    }
    onDidOpenEditor(editor, editorIndex) {
        this.telemetryService.publicLog('editorOpened', this.toEditorTelemetryDescriptor(editor));
        this.updateContainer();
    }
    handleOnDidCloseEditor(editor, editorIndex, context, sticky) {
        this._onWillCloseEditor.fire({ groupId: this.id, editor, context, index: editorIndex, sticky });
        const editorsToClose = [editor];
        if (editor instanceof SideBySideEditorInput) {
            editorsToClose.push(editor.primary, editor.secondary);
        }
        for (const editor of editorsToClose) {
            if (this.canDispose(editor)) {
                editor.dispose();
            }
        }
        this.telemetryService.publicLog('editorClosed', this.toEditorTelemetryDescriptor(editor));
        this.updateContainer();
        this._onDidCloseEditor.fire({ groupId: this.id, editor, context, index: editorIndex, sticky });
    }
    canDispose(editor) {
        for (const groupView of this.editorPartsView.groups) {
            if (groupView instanceof EditorGroupView_1 && groupView.model.contains(editor, {
                strictEquals: true,
                supportSideBySide: SideBySideEditor.ANY
            })) {
                return false;
            }
        }
        return true;
    }
    toResourceTelemetryDescriptor(resource) {
        if (!resource) {
            return undefined;
        }
        const path = resource ? resource.scheme === Schemas.file ? resource.fsPath : resource.path : undefined;
        if (!path) {
            return undefined;
        }
        let resourceExt = extname(resource);
        const queryStringLocation = resourceExt.indexOf('?');
        resourceExt = queryStringLocation !== -1 ? resourceExt.substr(0, queryStringLocation) : resourceExt;
        return {
            mimeType: new TelemetryTrustedValue(getMimeTypes(resource).join(', ')),
            scheme: resource.scheme,
            ext: resourceExt,
            path: hash(path)
        };
    }
    toEditorTelemetryDescriptor(editor) {
        const descriptor = editor.getTelemetryDescriptor();
        const resource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.BOTH });
        if (URI.isUri(resource)) {
            descriptor['resource'] = this.toResourceTelemetryDescriptor(resource);
            return descriptor;
        }
        else if (resource) {
            if (resource.primary) {
                descriptor['resource'] = this.toResourceTelemetryDescriptor(resource.primary);
            }
            if (resource.secondary) {
                descriptor['resourceSecondary'] = this.toResourceTelemetryDescriptor(resource.secondary);
            }
            return descriptor;
        }
        return descriptor;
    }
    onWillDisposeEditor(editor) {
        this.disposedEditorsWorker.work(editor);
    }
    handleDisposedEditors(disposedEditors) {
        let activeEditor;
        const inactiveEditors = [];
        for (const disposedEditor of disposedEditors) {
            const editorFindResult = this.model.findEditor(disposedEditor);
            if (!editorFindResult) {
                continue;
            }
            const editor = editorFindResult[0];
            if (!editor.isDisposed()) {
                continue;
            }
            if (this.model.isActive(editor)) {
                activeEditor = editor;
            }
            else {
                inactiveEditors.push(editor);
            }
        }
        for (const inactiveEditor of inactiveEditors) {
            this.doCloseEditor(inactiveEditor, true);
        }
        if (activeEditor) {
            this.doCloseEditor(activeEditor, true);
        }
    }
    onDidChangeEditorPartOptions(event) {
        this.updateTitleContainer();
        this.titleControl.updateOptions(event.oldPartOptions, event.newPartOptions);
        if (event.oldPartOptions.showTabs !== event.newPartOptions.showTabs ||
            event.oldPartOptions.tabHeight !== event.newPartOptions.tabHeight ||
            (event.oldPartOptions.showTabs === 'multiple' && event.oldPartOptions.pinnedTabsOnSeparateRow !== event.newPartOptions.pinnedTabsOnSeparateRow)) {
            this.relayout();
            if (this.model.activeEditor) {
                this.titleControl.openEditors(this.model.getEditors(1));
            }
        }
        this.updateStyles();
        if (event.oldPartOptions.enablePreview && !event.newPartOptions.enablePreview) {
            if (this.model.previewEditor) {
                this.pinEditor(this.model.previewEditor);
            }
        }
    }
    onDidChangeEditorDirty(editor) {
        this.pinEditor(editor);
        this.titleControl.updateEditorDirty(editor);
    }
    onDidChangeEditorTransient(editor) {
        const transient = this.model.isTransient(editor);
        if (!transient && !this.groupsView.partOptions.enablePreview) {
            this.pinEditor(editor);
        }
    }
    onDidChangeEditorLabel(editor) {
        this.titleControl.updateEditorLabel(editor);
    }
    onDidChangeEditorSelection() {
        this.titleControl.updateEditorSelections();
    }
    onDidVisibilityChange(visible) {
        this.editorPane.setVisible(visible);
    }
    onDidGainFocus() {
        if (this.activeEditor) {
            this.model.setTransient(this.activeEditor, false);
        }
    }
    get index() {
        return this._index;
    }
    get label() {
        if (this.groupsLabel) {
            return localize('groupLabelLong', "{0}: Group {1}", this.groupsLabel, this._index + 1);
        }
        return localize('groupLabel', "Group {0}", this._index + 1);
    }
    get ariaLabel() {
        if (this.groupsLabel) {
            return localize('groupAriaLabelLong', "{0}: Editor Group {1}", this.groupsLabel, this._index + 1);
        }
        return localize('groupAriaLabel', "Editor Group {0}", this._index + 1);
    }
    get disposed() {
        return this._disposed;
    }
    get isEmpty() {
        return this.count === 0;
    }
    get titleHeight() {
        return this.titleControl.getHeight();
    }
    notifyIndexChanged(newIndex) {
        if (this._index !== newIndex) {
            this._index = newIndex;
            this.model.setIndex(newIndex);
        }
    }
    notifyLabelChanged(newLabel) {
        if (this.groupsLabel !== newLabel) {
            this.groupsLabel = newLabel;
            this.model.setLabel(newLabel);
        }
    }
    setActive(isActive) {
        this.active = isActive;
        if (!isActive && this.activeEditor && this.selectedEditors.length > 1) {
            this.setSelection(this.activeEditor, []);
        }
        this.element.classList.toggle('active', isActive);
        this.element.classList.toggle('inactive', !isActive);
        this.titleControl.setActive(isActive);
        this.updateStyles();
        this.model.setActive(undefined);
    }
    get id() {
        return this.model.id;
    }
    get windowId() {
        return this.groupsView.windowId;
    }
    get editors() {
        return this.model.getEditors(1);
    }
    get count() {
        return this.model.count;
    }
    get stickyCount() {
        return this.model.stickyCount;
    }
    get activeEditorPane() {
        return this.editorPane ? this.editorPane.activeEditorPane ?? undefined : undefined;
    }
    get activeEditor() {
        return this.model.activeEditor;
    }
    get selectedEditors() {
        return this.model.selectedEditors;
    }
    get previewEditor() {
        return this.model.previewEditor;
    }
    isPinned(editorOrIndex) {
        return this.model.isPinned(editorOrIndex);
    }
    isSticky(editorOrIndex) {
        return this.model.isSticky(editorOrIndex);
    }
    isSelected(editor) {
        return this.model.isSelected(editor);
    }
    isTransient(editorOrIndex) {
        return this.model.isTransient(editorOrIndex);
    }
    isActive(editor) {
        return this.model.isActive(editor);
    }
    async setSelection(activeSelectedEditor, inactiveSelectedEditors) {
        if (!this.isActive(activeSelectedEditor)) {
            await this.openEditor(activeSelectedEditor, { activation: EditorActivation.ACTIVATE }, { inactiveSelection: inactiveSelectedEditors });
        }
        else {
            this.model.setSelection(activeSelectedEditor, inactiveSelectedEditors);
        }
    }
    contains(candidate, options) {
        return this.model.contains(candidate, options);
    }
    getEditors(order, options) {
        return this.model.getEditors(order, options);
    }
    findEditors(resource, options) {
        const canonicalResource = this.uriIdentityService.asCanonicalUri(resource);
        return this.getEditors(1).filter(editor => {
            if (editor.resource && isEqual(editor.resource, canonicalResource)) {
                return true;
            }
            if (options?.supportSideBySide === SideBySideEditor.PRIMARY || options?.supportSideBySide === SideBySideEditor.ANY) {
                const primaryResource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
                if (primaryResource && isEqual(primaryResource, canonicalResource)) {
                    return true;
                }
            }
            if (options?.supportSideBySide === SideBySideEditor.SECONDARY || options?.supportSideBySide === SideBySideEditor.ANY) {
                const secondaryResource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: SideBySideEditor.SECONDARY });
                if (secondaryResource && isEqual(secondaryResource, canonicalResource)) {
                    return true;
                }
            }
            return false;
        });
    }
    getEditorByIndex(index) {
        return this.model.getEditorByIndex(index);
    }
    getIndexOfEditor(editor) {
        return this.model.indexOf(editor);
    }
    isFirst(editor) {
        return this.model.isFirst(editor);
    }
    isLast(editor) {
        return this.model.isLast(editor);
    }
    focus() {
        if (this.activeEditorPane) {
            this.activeEditorPane.focus();
        }
        else {
            this.element.focus();
        }
        this._onDidFocus.fire();
    }
    pinEditor(candidate = this.activeEditor || undefined) {
        if (candidate && !this.model.isPinned(candidate)) {
            const editor = this.model.pin(candidate);
            if (editor) {
                this.titleControl.pinEditor(editor);
            }
        }
    }
    stickEditor(candidate = this.activeEditor || undefined) {
        this.doStickEditor(candidate, true);
    }
    unstickEditor(candidate = this.activeEditor || undefined) {
        this.doStickEditor(candidate, false);
    }
    doStickEditor(candidate, sticky) {
        if (candidate && this.model.isSticky(candidate) !== sticky) {
            const oldIndexOfEditor = this.getIndexOfEditor(candidate);
            const editor = sticky ? this.model.stick(candidate) : this.model.unstick(candidate);
            if (!editor) {
                return;
            }
            const newIndexOfEditor = this.getIndexOfEditor(editor);
            if (newIndexOfEditor !== oldIndexOfEditor) {
                this.titleControl.moveEditor(editor, oldIndexOfEditor, newIndexOfEditor, true);
            }
            if (sticky) {
                this.titleControl.stickEditor(editor);
            }
            else {
                this.titleControl.unstickEditor(editor);
            }
        }
    }
    async openEditor(editor, options, internalOptions) {
        return this.doOpenEditor(editor, options, {
            ...internalOptions,
            supportSideBySide: SideBySideEditor.BOTH
        });
    }
    async doOpenEditor(editor, options, internalOptions) {
        if (!editor || editor.isDisposed()) {
            return;
        }
        this._onWillOpenEditor.fire({ editor, groupId: this.id });
        const pinned = options?.sticky
            || (!this.groupsView.partOptions.enablePreview && !options?.transient)
            || editor.isDirty()
            || (options?.pinned ?? typeof options?.index === 'number')
            || (typeof options?.index === 'number' && this.model.isSticky(options.index))
            || editor.hasCapability(512);
        const openEditorOptions = {
            index: options ? options.index : undefined,
            pinned,
            sticky: options?.sticky || (typeof options?.index === 'number' && this.model.isSticky(options.index)),
            transient: !!options?.transient,
            inactiveSelection: internalOptions?.inactiveSelection,
            active: this.count === 0 || !options || !options.inactive,
            supportSideBySide: internalOptions?.supportSideBySide
        };
        if (!openEditorOptions.active && !openEditorOptions.pinned && this.model.activeEditor && !this.model.isPinned(this.model.activeEditor)) {
            openEditorOptions.active = true;
        }
        let activateGroup = false;
        let restoreGroup = false;
        if (options?.activation === EditorActivation.ACTIVATE) {
            activateGroup = true;
        }
        else if (options?.activation === EditorActivation.RESTORE) {
            restoreGroup = true;
        }
        else if (options?.activation === EditorActivation.PRESERVE) {
            activateGroup = false;
            restoreGroup = false;
        }
        else if (openEditorOptions.active) {
            activateGroup = !options || !options.preserveFocus;
            restoreGroup = !activateGroup;
        }
        if (typeof openEditorOptions.index === 'number') {
            const indexOfEditor = this.model.indexOf(editor);
            if (indexOfEditor !== -1 && indexOfEditor !== openEditorOptions.index) {
                this.doMoveEditorInsideGroup(editor, openEditorOptions);
            }
        }
        const { editor: openedEditor, isNew } = this.model.openEditor(editor, openEditorOptions);
        if (isNew &&
            this.count === 1 &&
            this.editorPartsView.groups.length > 1) {
            if (openedEditor.editorId && this.groupsView.partOptions.autoLockGroups?.has(openedEditor.editorId)) {
                this.lock(true);
            }
        }
        const showEditorResult = this.doShowEditor(openedEditor, { active: !!openEditorOptions.active, isNew }, options, internalOptions);
        if (activateGroup) {
            this.groupsView.activateGroup(this);
        }
        else if (restoreGroup) {
            this.groupsView.restoreGroup(this);
        }
        return showEditorResult;
    }
    doShowEditor(editor, context, options, internalOptions) {
        let openEditorPromise;
        if (context.active) {
            openEditorPromise = (async () => {
                const { pane, changed, cancelled, error } = await this.editorPane.openEditor(editor, options, internalOptions, { newInGroup: context.isNew });
                if (cancelled) {
                    return undefined;
                }
                if (changed) {
                    this._onDidActiveEditorChange.fire({ editor });
                }
                if (error) {
                    this._onDidOpenEditorFail.fire(editor);
                }
                if (!pane && this.activeEditor === editor) {
                    this.doCloseEditor(editor, options?.preserveFocus, { fromError: true });
                }
                return pane;
            })();
        }
        else {
            openEditorPromise = Promise.resolve(undefined);
        }
        if (!internalOptions?.skipTitleUpdate) {
            this.titleControl.openEditor(editor, internalOptions);
        }
        return openEditorPromise;
    }
    async openEditors(editors) {
        const editorsToOpen = coalesce(editors).filter(({ editor }) => !editor.isDisposed());
        const firstEditor = editorsToOpen.at(0);
        if (!firstEditor) {
            return;
        }
        const openEditorsOptions = {
            supportSideBySide: SideBySideEditor.BOTH
        };
        await this.doOpenEditor(firstEditor.editor, firstEditor.options, openEditorsOptions);
        const inactiveEditors = editorsToOpen.slice(1);
        const startingIndex = this.getIndexOfEditor(firstEditor.editor) + 1;
        await Promises.settled(inactiveEditors.map(({ editor, options }, index) => {
            return this.doOpenEditor(editor, {
                ...options,
                inactive: true,
                pinned: true,
                index: startingIndex + index
            }, {
                ...openEditorsOptions,
                skipTitleUpdate: true
            });
        }));
        this.titleControl.openEditors(inactiveEditors.map(({ editor }) => editor));
        return this.editorPane.activeEditorPane ?? undefined;
    }
    moveEditors(editors, target) {
        const internalOptions = {
            skipTitleUpdate: this !== target
        };
        let moveFailed = false;
        const movedEditors = new Set();
        for (const { editor, options } of editors) {
            if (this.moveEditor(editor, target, options, internalOptions)) {
                movedEditors.add(editor);
            }
            else {
                moveFailed = true;
            }
        }
        if (internalOptions.skipTitleUpdate) {
            target.titleControl.openEditors(Array.from(movedEditors));
            this.titleControl.closeEditors(Array.from(movedEditors));
        }
        return !moveFailed;
    }
    moveEditor(editor, target, options, internalOptions) {
        if (this === target) {
            this.doMoveEditorInsideGroup(editor, options);
            return true;
        }
        else {
            return this.doMoveOrCopyEditorAcrossGroups(editor, target, options, { ...internalOptions, keepCopy: false });
        }
    }
    doMoveEditorInsideGroup(candidate, options) {
        const moveToIndex = options ? options.index : undefined;
        if (typeof moveToIndex !== 'number') {
            return;
        }
        const currentIndex = this.model.indexOf(candidate);
        const editor = this.model.getEditorByIndex(currentIndex);
        if (!editor) {
            return;
        }
        if (currentIndex !== moveToIndex) {
            const oldStickyCount = this.model.stickyCount;
            this.model.moveEditor(editor, moveToIndex);
            this.model.pin(editor);
            this.titleControl.moveEditor(editor, currentIndex, moveToIndex, oldStickyCount !== this.model.stickyCount);
            this.titleControl.pinEditor(editor);
        }
        if (options?.sticky) {
            this.stickEditor(editor);
        }
    }
    doMoveOrCopyEditorAcrossGroups(editor, target, openOptions, internalOptions) {
        const keepCopy = internalOptions?.keepCopy;
        if (!keepCopy || editor.hasCapability(8)) {
            const canMoveVeto = editor.canMove(this.id, target.id);
            if (typeof canMoveVeto === 'string') {
                this.dialogService.error(canMoveVeto, localize('moveErrorDetails', "Try saving or reverting the editor first and then try again."));
                return false;
            }
        }
        const options = fillActiveEditorViewState(this, editor, {
            ...openOptions,
            pinned: true,
            sticky: openOptions?.sticky ?? (!keepCopy && this.model.isSticky(editor))
        });
        if (!keepCopy) {
            this._onWillMoveEditor.fire({
                groupId: this.id,
                editor,
                target: target.id
            });
        }
        target.doOpenEditor(keepCopy ? editor.copy() : editor, options, internalOptions);
        if (!keepCopy) {
            this.doCloseEditor(editor, true, { ...internalOptions, context: EditorCloseContext.MOVE });
        }
        return true;
    }
    copyEditors(editors, target) {
        const internalOptions = {
            skipTitleUpdate: this !== target
        };
        for (const { editor, options } of editors) {
            this.copyEditor(editor, target, options, internalOptions);
        }
        if (internalOptions.skipTitleUpdate) {
            const copiedEditors = editors.map(({ editor }) => editor);
            target.titleControl.openEditors(copiedEditors);
        }
    }
    copyEditor(editor, target, options, internalOptions) {
        if (this === target) {
            this.doMoveEditorInsideGroup(editor, options);
        }
        else {
            this.doMoveOrCopyEditorAcrossGroups(editor, target, options, { ...internalOptions, keepCopy: true });
        }
    }
    async closeEditor(editor = this.activeEditor || undefined, options) {
        return this.doCloseEditorWithConfirmationHandling(editor, options);
    }
    async doCloseEditorWithConfirmationHandling(editor = this.activeEditor || undefined, options, internalOptions) {
        if (!editor) {
            return false;
        }
        const veto = await this.handleCloseConfirmation([editor]);
        if (veto) {
            return false;
        }
        this.doCloseEditor(editor, options?.preserveFocus, internalOptions);
        return true;
    }
    doCloseEditor(editor, preserveFocus = (this.groupsView.activeGroup !== this), internalOptions) {
        if (!internalOptions?.skipTitleUpdate) {
            this.titleControl.beforeCloseEditor(editor);
        }
        if (this.model.isActive(editor)) {
            this.doCloseActiveEditor(preserveFocus, internalOptions);
        }
        else {
            this.doCloseInactiveEditor(editor, internalOptions);
        }
        if (!internalOptions?.skipTitleUpdate) {
            this.titleControl.closeEditor(editor);
        }
    }
    doCloseActiveEditor(preserveFocus = (this.groupsView.activeGroup !== this), internalOptions) {
        const editorToClose = this.activeEditor;
        const restoreFocus = !preserveFocus && this.shouldRestoreFocus(this.element);
        const closeEmptyGroup = this.groupsView.partOptions.closeEmptyGroups;
        if (closeEmptyGroup && this.active && this.count === 1) {
            const mostRecentlyActiveGroups = this.groupsView.getGroups(1);
            const nextActiveGroup = mostRecentlyActiveGroups[1];
            if (nextActiveGroup) {
                if (restoreFocus) {
                    nextActiveGroup.focus();
                }
                else {
                    this.groupsView.activateGroup(nextActiveGroup, true);
                }
            }
        }
        if (editorToClose) {
            this.model.closeEditor(editorToClose, internalOptions?.context);
        }
        const nextActiveEditor = this.model.activeEditor;
        if (nextActiveEditor) {
            let activation = undefined;
            if (preserveFocus && this.groupsView.activeGroup !== this) {
                activation = EditorActivation.PRESERVE;
            }
            const options = {
                preserveFocus,
                activation,
                ignoreError: internalOptions?.fromError
            };
            const internalEditorOpenOptions = {
                preserveWindowOrder: true
            };
            this.doOpenEditor(nextActiveEditor, options, internalEditorOpenOptions);
        }
        else {
            if (editorToClose) {
                this.editorPane.closeEditor(editorToClose);
            }
            if (restoreFocus && !closeEmptyGroup) {
                this.focus();
            }
            this._onDidActiveEditorChange.fire({ editor: undefined });
            if (closeEmptyGroup) {
                this.groupsView.removeGroup(this, preserveFocus);
            }
        }
    }
    shouldRestoreFocus(target) {
        const activeElement = getActiveElement();
        if (activeElement === target.ownerDocument.body) {
            return true;
        }
        return isAncestor(activeElement, target);
    }
    doCloseInactiveEditor(editor, internalOptions) {
        this.model.closeEditor(editor, internalOptions?.context);
    }
    async handleCloseConfirmation(editors) {
        if (!editors.length) {
            return false;
        }
        const editor = editors.shift();
        let handleCloseConfirmationPromise = this.mapEditorToPendingConfirmation.get(editor);
        if (!handleCloseConfirmationPromise) {
            handleCloseConfirmationPromise = this.doHandleCloseConfirmation(editor);
            this.mapEditorToPendingConfirmation.set(editor, handleCloseConfirmationPromise);
        }
        let veto;
        try {
            veto = await handleCloseConfirmationPromise;
        }
        finally {
            this.mapEditorToPendingConfirmation.delete(editor);
        }
        if (veto) {
            return veto;
        }
        return this.handleCloseConfirmation(editors);
    }
    async doHandleCloseConfirmation(editor, options) {
        if (!this.shouldConfirmClose(editor)) {
            return false;
        }
        if (editor instanceof SideBySideEditorInput && this.model.contains(editor.primary)) {
            return false;
        }
        if (this.editorPartsView.groups.some(groupView => {
            if (groupView === this) {
                return false;
            }
            const otherGroup = groupView;
            if (otherGroup.contains(editor, { supportSideBySide: SideBySideEditor.BOTH })) {
                return true;
            }
            if (editor instanceof SideBySideEditorInput && otherGroup.contains(editor.primary)) {
                return true;
            }
            return false;
        })) {
            return false;
        }
        let confirmation = 2;
        let saveReason = 1;
        let autoSave = false;
        if (!editor.hasCapability(4) && !options?.skipAutoSave && !editor.closeHandler) {
            if (this.filesConfigurationService.getAutoSaveMode(editor).mode === 3) {
                autoSave = true;
                confirmation = 0;
                saveReason = 3;
            }
            else if ((isNative && (isWindows || isLinux)) && this.filesConfigurationService.getAutoSaveMode(editor).mode === 4) {
                autoSave = true;
                confirmation = 0;
                saveReason = 4;
            }
        }
        if (!autoSave) {
            if (!this.activeEditor || !this.activeEditor.matches(editor)) {
                await this.doOpenEditor(editor);
            }
            await this.hostService.focus(getWindow(this.element));
            if (typeof editor.closeHandler?.confirm === 'function') {
                confirmation = await editor.closeHandler.confirm([{ editor, groupId: this.id }]);
            }
            else {
                let name;
                if (editor instanceof SideBySideEditorInput) {
                    name = editor.primary.getName();
                }
                else {
                    name = editor.getName();
                }
                confirmation = await this.fileDialogService.showSaveConfirm([name]);
            }
        }
        if (!editor.closeHandler && !this.shouldConfirmClose(editor)) {
            return confirmation === 2 ? true : false;
        }
        switch (confirmation) {
            case 0: {
                const result = await editor.save(this.id, { reason: saveReason });
                if (!result && autoSave) {
                    return this.doHandleCloseConfirmation(editor, { skipAutoSave: true });
                }
                return editor.isDirty();
            }
            case 1:
                try {
                    await editor.revert(this.id);
                    return editor.isDirty();
                }
                catch (error) {
                    this.logService.error(error);
                    await editor.revert(this.id, { soft: true });
                    return editor.isDirty();
                }
            case 2:
                return true;
        }
    }
    shouldConfirmClose(editor) {
        if (editor.closeHandler) {
            return editor.closeHandler.showConfirm();
        }
        return editor.isDirty() && !editor.isSaving();
    }
    async closeEditors(args, options) {
        if (this.isEmpty) {
            return true;
        }
        const editors = this.doGetEditorsToClose(args);
        const veto = await this.handleCloseConfirmation(editors.slice(0));
        if (veto) {
            return false;
        }
        this.doCloseEditors(editors, options);
        return true;
    }
    doGetEditorsToClose(args) {
        if (Array.isArray(args)) {
            return args;
        }
        const filter = args;
        const hasDirection = typeof filter.direction === 'number';
        let editorsToClose = this.model.getEditors(hasDirection ? 1 : 0, filter);
        if (filter.savedOnly) {
            editorsToClose = editorsToClose.filter(editor => !editor.isDirty() || editor.isSaving());
        }
        else if (hasDirection && filter.except) {
            editorsToClose = (filter.direction === 0) ?
                editorsToClose.slice(0, this.model.indexOf(filter.except, editorsToClose)) :
                editorsToClose.slice(this.model.indexOf(filter.except, editorsToClose) + 1);
        }
        else if (filter.except) {
            editorsToClose = editorsToClose.filter(editor => filter.except && !editor.matches(filter.except));
        }
        return editorsToClose;
    }
    doCloseEditors(editors, options) {
        let closeActiveEditor = false;
        for (const editor of editors) {
            if (!this.isActive(editor)) {
                this.doCloseInactiveEditor(editor);
            }
            else {
                closeActiveEditor = true;
            }
        }
        if (closeActiveEditor) {
            this.doCloseActiveEditor(options?.preserveFocus);
        }
        if (editors.length) {
            this.titleControl.closeEditors(editors);
        }
    }
    async closeAllEditors(options) {
        if (this.isEmpty) {
            if (this.groupsView.partOptions.closeEmptyGroups) {
                this.groupsView.removeGroup(this);
            }
            return true;
        }
        let editors = this.model.getEditors(0, options);
        if (options?.excludeConfirming) {
            editors = editors.filter(editor => !this.shouldConfirmClose(editor));
        }
        const veto = await this.handleCloseConfirmation(editors);
        if (veto) {
            return false;
        }
        this.doCloseAllEditors(options);
        return true;
    }
    doCloseAllEditors(options) {
        let editors = this.model.getEditors(1, options);
        if (options?.excludeConfirming) {
            editors = editors.filter(editor => !this.shouldConfirmClose(editor));
        }
        const editorsToClose = [];
        for (const editor of editors) {
            if (!this.isActive(editor)) {
                this.doCloseInactiveEditor(editor);
            }
            editorsToClose.push(editor);
        }
        if (this.activeEditor && editorsToClose.includes(this.activeEditor)) {
            this.doCloseActiveEditor();
        }
        if (editorsToClose.length) {
            this.titleControl.closeEditors(editorsToClose);
        }
    }
    async replaceEditors(editors) {
        let activeReplacement;
        const inactiveReplacements = [];
        for (let { editor, replacement, forceReplaceDirty, options } of editors) {
            const index = this.getIndexOfEditor(editor);
            if (index >= 0) {
                const isActiveEditor = this.isActive(editor);
                if (options) {
                    options.index = index;
                }
                else {
                    options = { index };
                }
                options.inactive = !isActiveEditor;
                options.pinned = options.pinned ?? true;
                const editorToReplace = { editor, replacement, forceReplaceDirty, options };
                if (isActiveEditor) {
                    activeReplacement = editorToReplace;
                }
                else {
                    inactiveReplacements.push(editorToReplace);
                }
            }
        }
        for (const { editor, replacement, forceReplaceDirty, options } of inactiveReplacements) {
            await this.doOpenEditor(replacement, options);
            if (!editor.matches(replacement)) {
                let closed = false;
                if (forceReplaceDirty) {
                    this.doCloseEditor(editor, true, { context: EditorCloseContext.REPLACE });
                    closed = true;
                }
                else {
                    closed = await this.doCloseEditorWithConfirmationHandling(editor, { preserveFocus: true }, { context: EditorCloseContext.REPLACE });
                }
                if (!closed) {
                    return;
                }
            }
        }
        if (activeReplacement) {
            const openEditorResult = this.doOpenEditor(activeReplacement.replacement, activeReplacement.options);
            if (!activeReplacement.editor.matches(activeReplacement.replacement)) {
                if (activeReplacement.forceReplaceDirty) {
                    this.doCloseEditor(activeReplacement.editor, true, { context: EditorCloseContext.REPLACE });
                }
                else {
                    await this.doCloseEditorWithConfirmationHandling(activeReplacement.editor, { preserveFocus: true }, { context: EditorCloseContext.REPLACE });
                }
            }
            await openEditorResult;
        }
    }
    get isLocked() {
        return this.model.isLocked;
    }
    lock(locked) {
        this.model.lock(locked);
    }
    createEditorActions(disposables) {
        const primary = [];
        const secondary = [];
        let onDidChange;
        const activeEditorPane = this.activeEditorPane;
        if (activeEditorPane instanceof EditorPane) {
            const editorScopedContextKeyService = activeEditorPane.scopedContextKeyService ?? this.scopedContextKeyService;
            const editorTitleMenu = disposables.add(this.menuService.createMenu(MenuId.EditorTitle, editorScopedContextKeyService, { emitEventsForSubmenuChanges: true, eventDebounceDelay: 0 }));
            onDidChange = editorTitleMenu.onDidChange;
            const shouldInlineGroup = (action, group) => group === 'navigation' && action.actions.length <= 1;
            createAndFillInActionBarActions(editorTitleMenu, { arg: this.resourceContext.get(), shouldForwardArgs: true }, { primary, secondary }, 'navigation', shouldInlineGroup);
        }
        else {
            const _onDidChange = disposables.add(new Emitter());
            onDidChange = _onDidChange.event;
            disposables.add(this.onDidActiveEditorChange(() => _onDidChange.fire()));
        }
        return { actions: { primary, secondary }, onDidChange };
    }
    updateStyles() {
        const isEmpty = this.isEmpty;
        if (isEmpty) {
            this.element.style.backgroundColor = this.getColor(EDITOR_GROUP_EMPTY_BACKGROUND) || '';
        }
        else {
            this.element.style.backgroundColor = '';
        }
        const borderColor = this.getColor(EDITOR_GROUP_HEADER_BORDER) || this.getColor(contrastBorder);
        if (!isEmpty && borderColor) {
            this.titleContainer.classList.add('title-border-bottom');
            this.titleContainer.style.setProperty('--title-border-bottom-color', borderColor);
        }
        else {
            this.titleContainer.classList.remove('title-border-bottom');
            this.titleContainer.style.removeProperty('--title-border-bottom-color');
        }
        const { showTabs } = this.groupsView.partOptions;
        this.titleContainer.style.backgroundColor = this.getColor(showTabs === 'multiple' ? EDITOR_GROUP_HEADER_TABS_BACKGROUND : EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND) || '';
        this.editorContainer.style.backgroundColor = this.getColor(editorBackground) || '';
    }
    get minimumWidth() { return this.editorPane.minimumWidth; }
    get minimumHeight() { return this.editorPane.minimumHeight; }
    get maximumWidth() { return this.editorPane.maximumWidth; }
    get maximumHeight() { return this.editorPane.maximumHeight; }
    get proportionalLayout() {
        if (!this.lastLayout) {
            return true;
        }
        return !(this.lastLayout.width === this.minimumWidth || this.lastLayout.height === this.minimumHeight);
    }
    layout(width, height, top, left) {
        this.lastLayout = { width, height, top, left };
        this.element.classList.toggle('max-height-478px', height <= 478);
        const titleControlSize = this.titleControl.layout({
            container: new Dimension(width, height),
            available: new Dimension(width, height - this.editorPane.minimumHeight)
        });
        this.progressBar.getContainer().style.top = `${Math.max(this.titleHeight.offset - 2, 0)}px`;
        const editorHeight = Math.max(0, height - titleControlSize.height);
        this.editorContainer.style.height = `${editorHeight}px`;
        this.editorPane.layout({ width, height: editorHeight, top: top + titleControlSize.height, left });
    }
    relayout() {
        if (this.lastLayout) {
            const { width, height, top, left } = this.lastLayout;
            this.layout(width, height, top, left);
        }
    }
    setBoundarySashes(sashes) {
        this.editorPane.setBoundarySashes(sashes);
    }
    toJSON() {
        return this.model.serialize();
    }
    dispose() {
        this._disposed = true;
        this._onWillDispose.fire();
        super.dispose();
    }
};
EditorGroupView = EditorGroupView_1 = __decorate([
    __param(6, IInstantiationService),
    __param(7, IContextKeyService),
    __param(8, IThemeService),
    __param(9, ITelemetryService),
    __param(10, IKeybindingService),
    __param(11, IMenuService),
    __param(12, IContextMenuService),
    __param(13, IFileDialogService),
    __param(14, IEditorService),
    __param(15, IFilesConfigurationService),
    __param(16, IUriIdentityService),
    __param(17, ILogService),
    __param(18, IEditorResolverService),
    __param(19, IHostService),
    __param(20, IDialogService),
    __param(21, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object, String, Number, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], EditorGroupView);
export { EditorGroupView };
