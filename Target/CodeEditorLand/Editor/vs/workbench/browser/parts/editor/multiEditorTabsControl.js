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
var MultiEditorTabsControl_1;
import './media/multieditortabscontrol.css';
import { isLinux, isMacintosh, isWindows } from '../../../../base/common/platform.js';
import { shorten } from '../../../../base/common/labels.js';
import { EditorResourceAccessor, SideBySideEditor, DEFAULT_EDITOR_ASSOCIATION, preventEditorClose, EditorCloseMethod } from '../../../common/editor.js';
import { computeEditorAriaLabel } from '../../editor.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { EventType as TouchEventType, Gesture } from '../../../../base/browser/touch.js';
import { ResourceLabels, DEFAULT_LABELS_CONTAINER } from '../../labels.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { EditorCommandsContextActionRunner, EditorTabsControl } from './editorTabsControl.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { dispose, DisposableStore, combinedDisposable, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { ScrollableElement } from '../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { getOrSet } from '../../../../base/common/map.js';
import { IThemeService, registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { TAB_INACTIVE_BACKGROUND, TAB_ACTIVE_BACKGROUND, TAB_BORDER, EDITOR_DRAG_AND_DROP_BACKGROUND, TAB_UNFOCUSED_ACTIVE_BACKGROUND, TAB_UNFOCUSED_ACTIVE_BORDER, TAB_ACTIVE_BORDER, TAB_HOVER_BACKGROUND, TAB_HOVER_BORDER, TAB_UNFOCUSED_HOVER_BACKGROUND, TAB_UNFOCUSED_HOVER_BORDER, EDITOR_GROUP_HEADER_TABS_BACKGROUND, WORKBENCH_BACKGROUND, TAB_ACTIVE_BORDER_TOP, TAB_UNFOCUSED_ACTIVE_BORDER_TOP, TAB_ACTIVE_MODIFIED_BORDER, TAB_INACTIVE_MODIFIED_BORDER, TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER, TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER, TAB_UNFOCUSED_INACTIVE_BACKGROUND, TAB_HOVER_FOREGROUND, TAB_UNFOCUSED_HOVER_FOREGROUND, EDITOR_GROUP_HEADER_TABS_BORDER, TAB_LAST_PINNED_BORDER, TAB_SELECTED_BORDER_TOP } from '../../../common/theme.js';
import { activeContrastBorder, contrastBorder, editorBackground, listActiveSelectionBackground, listActiveSelectionForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { ResourcesDropHandler, DraggedEditorIdentifier, DraggedEditorGroupIdentifier, extractTreeDropData, isWindowDraggedOver } from '../../dnd.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { addDisposableListener, EventType, EventHelper, Dimension, scheduleAtNextAnimationFrame, findParentWithClass, clearNode, DragAndDropObserver, isMouseEvent, getWindow } from '../../../../base/browser/dom.js';
import { localize } from '../../../../nls.js';
import { CloseEditorTabAction, UnpinEditorAction } from './editorActions.js';
import { assertAllDefined, assertIsDefined } from '../../../../base/common/types.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { basenameOrAuthority } from '../../../../base/common/resources.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { win32, posix } from '../../../../base/common/path.js';
import { coalesce, insert } from '../../../../base/common/arrays.js';
import { isHighContrast } from '../../../../platform/theme/common/theme.js';
import { isSafari } from '../../../../base/browser/browser.js';
import { equals } from '../../../../base/common/objects.js';
import { EditorActivation } from '../../../../platform/editor/common/editor.js';
import { UNLOCK_GROUP_COMMAND_ID } from './editorCommands.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { ITreeViewsDnDService } from '../../../../editor/common/services/treeViewsDndService.js';
import { DraggedTreeItemsIdentifier } from '../../../../editor/common/services/treeViewsDnd.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { StickyEditorGroupModel, UnstickyEditorGroupModel } from '../../../common/editor/filteredEditorGroupModel.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { applyDragImage } from '../../../../base/browser/dnd.js';
let MultiEditorTabsControl = class MultiEditorTabsControl extends EditorTabsControl {
    static { MultiEditorTabsControl_1 = this; }
    static { this.SCROLLBAR_SIZES = {
        default: 3,
        large: 10
    }; }
    static { this.TAB_WIDTH = {
        compact: 38,
        shrink: 80,
        fit: 120
    }; }
    static { this.DRAG_OVER_OPEN_TAB_THRESHOLD = 1500; }
    static { this.MOUSE_WHEEL_EVENT_THRESHOLD = 150; }
    static { this.MOUSE_WHEEL_DISTANCE_THRESHOLD = 1.5; }
    constructor(parent, editorPartsView, groupsView, groupView, tabsModel, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorService, pathService, treeViewsDragAndDropService, editorResolverService, hostService) {
        super(parent, editorPartsView, groupsView, groupView, tabsModel, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorResolverService, hostService);
        this.editorService = editorService;
        this.pathService = pathService;
        this.treeViewsDragAndDropService = treeViewsDragAndDropService;
        this.closeEditorAction = this._register(this.instantiationService.createInstance(CloseEditorTabAction, CloseEditorTabAction.ID, CloseEditorTabAction.LABEL));
        this.unpinEditorAction = this._register(this.instantiationService.createInstance(UnpinEditorAction, UnpinEditorAction.ID, UnpinEditorAction.LABEL));
        this.tabResourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
        this.tabLabels = [];
        this.tabActionBars = [];
        this.tabDisposables = [];
        this.dimensions = {
            container: Dimension.None,
            available: Dimension.None
        };
        this.layoutScheduler = this._register(new MutableDisposable());
        this.path = isWindows ? win32 : posix;
        this.lastMouseWheelEventTime = 0;
        this.isMouseOverTabs = false;
        this.updateEditorLabelScheduler = this._register(new RunOnceScheduler(() => this.doUpdateEditorLabels(), 0));
        (async () => this.path = await this.pathService.path)();
        this._register(this.tabResourceLabels.onDidChangeDecorations(() => this.doHandleDecorationsChange()));
    }
    create(parent) {
        super.create(parent);
        this.titleContainer = parent;
        this.tabsAndActionsContainer = document.createElement('div');
        this.tabsAndActionsContainer.classList.add('tabs-and-actions-container');
        this.titleContainer.appendChild(this.tabsAndActionsContainer);
        this.tabsContainer = document.createElement('div');
        this.tabsContainer.setAttribute('role', 'tablist');
        this.tabsContainer.draggable = true;
        this.tabsContainer.classList.add('tabs-container');
        this._register(Gesture.addTarget(this.tabsContainer));
        this.tabSizingFixedDisposables = this._register(new DisposableStore());
        this.updateTabSizing(false);
        this.tabsScrollbar = this.createTabsScrollbar(this.tabsContainer);
        this.tabsAndActionsContainer.appendChild(this.tabsScrollbar.getDomNode());
        this.registerTabsContainerListeners(this.tabsContainer, this.tabsScrollbar);
        this.createEditorActionsToolBar(this.tabsAndActionsContainer, ['editor-actions']);
        this.updateTabsControlVisibility();
        return this.tabsAndActionsContainer;
    }
    createTabsScrollbar(scrollable) {
        const tabsScrollbar = this._register(new ScrollableElement(scrollable, {
            horizontal: 1,
            horizontalScrollbarSize: this.getTabsScrollbarSizing(),
            vertical: 2,
            scrollYToX: true,
            useShadows: false
        }));
        this._register(tabsScrollbar.onScroll(e => {
            if (e.scrollLeftChanged) {
                scrollable.scrollLeft = e.scrollLeft;
            }
        }));
        return tabsScrollbar;
    }
    updateTabsScrollbarSizing() {
        this.tabsScrollbar?.updateOptions({
            horizontalScrollbarSize: this.getTabsScrollbarSizing()
        });
    }
    updateTabSizing(fromEvent) {
        const [tabsContainer, tabSizingFixedDisposables] = assertAllDefined(this.tabsContainer, this.tabSizingFixedDisposables);
        tabSizingFixedDisposables.clear();
        const options = this.groupsView.partOptions;
        if (options.tabSizing === 'fixed') {
            tabsContainer.style.setProperty('--tab-sizing-fixed-min-width', `${options.tabSizingFixedMinWidth}px`);
            tabsContainer.style.setProperty('--tab-sizing-fixed-max-width', `${options.tabSizingFixedMaxWidth}px`);
            tabSizingFixedDisposables.add(addDisposableListener(tabsContainer, EventType.MOUSE_ENTER, () => {
                this.isMouseOverTabs = true;
            }));
            tabSizingFixedDisposables.add(addDisposableListener(tabsContainer, EventType.MOUSE_LEAVE, () => {
                this.isMouseOverTabs = false;
                this.updateTabsFixedWidth(false);
            }));
        }
        else if (fromEvent) {
            tabsContainer.style.removeProperty('--tab-sizing-fixed-min-width');
            tabsContainer.style.removeProperty('--tab-sizing-fixed-max-width');
            this.updateTabsFixedWidth(false);
        }
    }
    updateTabsFixedWidth(fixed) {
        this.forEachTab((editor, tabIndex, tabContainer) => {
            if (fixed) {
                const { width } = tabContainer.getBoundingClientRect();
                tabContainer.style.setProperty('--tab-sizing-current-width', `${width}px`);
            }
            else {
                tabContainer.style.removeProperty('--tab-sizing-current-width');
            }
        });
    }
    getTabsScrollbarSizing() {
        if (this.groupsView.partOptions.titleScrollbarSizing !== 'large') {
            return MultiEditorTabsControl_1.SCROLLBAR_SIZES.default;
        }
        return MultiEditorTabsControl_1.SCROLLBAR_SIZES.large;
    }
    registerTabsContainerListeners(tabsContainer, tabsScrollbar) {
        this._register(addDisposableListener(tabsContainer, EventType.SCROLL, () => {
            if (tabsContainer.classList.contains('scroll')) {
                tabsScrollbar.setScrollPosition({
                    scrollLeft: tabsContainer.scrollLeft
                });
            }
        }));
        for (const eventType of [TouchEventType.Tap, EventType.DBLCLICK]) {
            this._register(addDisposableListener(tabsContainer, eventType, (e) => {
                if (eventType === EventType.DBLCLICK) {
                    if (e.target !== tabsContainer) {
                        return;
                    }
                }
                else {
                    if (e.tapCount !== 2) {
                        return;
                    }
                    if (e.initialTarget !== tabsContainer) {
                        return;
                    }
                }
                EventHelper.stop(e);
                this.editorService.openEditor({
                    resource: undefined,
                    options: {
                        pinned: true,
                        index: this.groupView.count,
                        override: DEFAULT_EDITOR_ASSOCIATION.id
                    }
                }, this.groupView.id);
            }));
        }
        this._register(addDisposableListener(tabsContainer, EventType.MOUSE_DOWN, e => {
            if (e.button === 1) {
                e.preventDefault();
            }
        }));
        if (isLinux) {
            this._register(addDisposableListener(tabsContainer, EventType.MOUSE_UP, e => {
                if (e.button === 1) {
                    e.preventDefault();
                }
            }));
        }
        let lastDragEvent = undefined;
        let isNewWindowOperation = false;
        this._register(new DragAndDropObserver(tabsContainer, {
            onDragStart: e => {
                isNewWindowOperation = this.onGroupDragStart(e, tabsContainer);
            },
            onDrag: e => {
                lastDragEvent = e;
            },
            onDragEnter: e => {
                tabsContainer.classList.add('scroll');
                if (e.target !== tabsContainer) {
                    return;
                }
                if (!this.isSupportedDropTransfer(e)) {
                    if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'none';
                    }
                    return;
                }
                if (!this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
                    if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                }
                this.updateDropFeedback(tabsContainer, true, e);
            },
            onDragLeave: e => {
                this.updateDropFeedback(tabsContainer, false, e);
                tabsContainer.classList.remove('scroll');
            },
            onDragEnd: e => {
                this.updateDropFeedback(tabsContainer, false, e);
                tabsContainer.classList.remove('scroll');
                this.onGroupDragEnd(e, lastDragEvent, tabsContainer, isNewWindowOperation);
            },
            onDrop: e => {
                this.updateDropFeedback(tabsContainer, false, e);
                tabsContainer.classList.remove('scroll');
                if (e.target === tabsContainer) {
                    const isGroupTransfer = this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype);
                    this.onDrop(e, isGroupTransfer ? this.groupView.count : this.tabsModel.count, tabsContainer);
                }
            }
        }));
        this._register(addDisposableListener(tabsContainer, EventType.MOUSE_WHEEL, (e) => {
            const activeEditor = this.groupView.activeEditor;
            if (!activeEditor || this.groupView.count < 2) {
                return;
            }
            if (this.groupsView.partOptions.scrollToSwitchTabs === true) {
                if (e.shiftKey) {
                    return;
                }
            }
            else {
                if (!e.shiftKey) {
                    return;
                }
            }
            const now = Date.now();
            if (now - this.lastMouseWheelEventTime < MultiEditorTabsControl_1.MOUSE_WHEEL_EVENT_THRESHOLD - 2 * (Math.abs(e.deltaX) + Math.abs(e.deltaY))) {
                return;
            }
            this.lastMouseWheelEventTime = now;
            let tabSwitchDirection;
            if (e.deltaX + e.deltaY < -MultiEditorTabsControl_1.MOUSE_WHEEL_DISTANCE_THRESHOLD) {
                tabSwitchDirection = -1;
            }
            else if (e.deltaX + e.deltaY > MultiEditorTabsControl_1.MOUSE_WHEEL_DISTANCE_THRESHOLD) {
                tabSwitchDirection = 1;
            }
            else {
                return;
            }
            const nextEditor = this.groupView.getEditorByIndex(this.groupView.getIndexOfEditor(activeEditor) + tabSwitchDirection);
            if (!nextEditor) {
                return;
            }
            this.groupView.openEditor(nextEditor);
            EventHelper.stop(e, true);
        }));
        const showContextMenu = (e) => {
            EventHelper.stop(e);
            let anchor = tabsContainer;
            if (isMouseEvent(e)) {
                anchor = new StandardMouseEvent(getWindow(this.parent), e);
            }
            this.contextMenuService.showContextMenu({
                getAnchor: () => anchor,
                menuId: MenuId.EditorTabsBarContext,
                contextKeyService: this.contextKeyService,
                menuActionOptions: { shouldForwardArgs: true },
                getActionsContext: () => ({ groupId: this.groupView.id }),
                getKeyBinding: action => this.getKeybinding(action),
                onHide: () => this.groupView.focus()
            });
        };
        this._register(addDisposableListener(tabsContainer, TouchEventType.Contextmenu, e => showContextMenu(e)));
        this._register(addDisposableListener(tabsContainer, EventType.CONTEXT_MENU, e => showContextMenu(e)));
    }
    doHandleDecorationsChange() {
        this.layout(this.dimensions);
    }
    updateEditorActionsToolbar() {
        super.updateEditorActionsToolbar();
        this.layout(this.dimensions);
    }
    openEditor(editor, options) {
        const changed = this.handleOpenedEditors();
        if (options?.focusTabControl) {
            this.withTab(editor, (editor, tabIndex, tabContainer) => tabContainer.focus());
        }
        return changed;
    }
    openEditors(editors) {
        return this.handleOpenedEditors();
    }
    handleOpenedEditors() {
        this.updateTabsControlVisibility();
        const [tabsContainer, tabsScrollbar] = assertAllDefined(this.tabsContainer, this.tabsScrollbar);
        for (let i = tabsContainer.children.length; i < this.tabsModel.count; i++) {
            tabsContainer.appendChild(this.createTab(i, tabsContainer, tabsScrollbar));
        }
        const activeEditorChanged = this.didActiveEditorChange();
        const oldActiveTabLabel = this.activeTabLabel;
        const oldTabLabelsLength = this.tabLabels.length;
        this.computeTabLabels();
        let didChange = false;
        if (activeEditorChanged ||
            oldTabLabelsLength !== this.tabLabels.length ||
            !this.equalsEditorInputLabel(oldActiveTabLabel, this.activeTabLabel)) {
            this.redraw({ forceRevealActiveTab: true });
            didChange = true;
        }
        else {
            this.layout(this.dimensions, { forceRevealActiveTab: true });
        }
        return didChange;
    }
    didActiveEditorChange() {
        if (!this.activeTabLabel?.editor && this.tabsModel.activeEditor ||
            this.activeTabLabel?.editor && !this.tabsModel.activeEditor ||
            (!this.activeTabLabel?.editor || !this.tabsModel.isActive(this.activeTabLabel.editor))) {
            return true;
        }
        return false;
    }
    equalsEditorInputLabel(labelA, labelB) {
        if (labelA === labelB) {
            return true;
        }
        if (!labelA || !labelB) {
            return false;
        }
        return labelA.name === labelB.name &&
            labelA.description === labelB.description &&
            labelA.forceDescription === labelB.forceDescription &&
            labelA.title === labelB.title &&
            labelA.ariaLabel === labelB.ariaLabel;
    }
    beforeCloseEditor(editor) {
        if (this.isMouseOverTabs && this.groupsView.partOptions.tabSizing === 'fixed') {
            const closingLastTab = this.tabsModel.isLast(editor);
            this.updateTabsFixedWidth(!closingLastTab);
        }
    }
    closeEditor(editor) {
        this.handleClosedEditors();
    }
    closeEditors(editors) {
        this.handleClosedEditors();
    }
    handleClosedEditors() {
        if (this.tabsModel.count) {
            const tabsContainer = assertIsDefined(this.tabsContainer);
            while (tabsContainer.children.length > this.tabsModel.count) {
                tabsContainer.lastChild?.remove();
                dispose(this.tabDisposables.pop());
            }
            this.computeTabLabels();
            this.redraw({ forceRevealActiveTab: true });
        }
        else {
            if (this.tabsContainer) {
                clearNode(this.tabsContainer);
            }
            this.tabDisposables = dispose(this.tabDisposables);
            this.tabResourceLabels.clear();
            this.tabLabels = [];
            this.activeTabLabel = undefined;
            this.tabActionBars = [];
            this.clearEditorActionsToolbar();
            this.updateTabsControlVisibility();
        }
    }
    moveEditor(editor, fromTabIndex, targeTabIndex) {
        const editorLabel = this.tabLabels[fromTabIndex];
        this.tabLabels.splice(fromTabIndex, 1);
        this.tabLabels.splice(targeTabIndex, 0, editorLabel);
        this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
            this.redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
        }, Math.min(fromTabIndex, targeTabIndex), Math.max(fromTabIndex, targeTabIndex));
        this.layout(this.dimensions, { forceRevealActiveTab: true });
    }
    pinEditor(editor) {
        this.withTab(editor, (editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) => this.redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel));
    }
    stickEditor(editor) {
        this.doHandleStickyEditorChange(editor);
    }
    unstickEditor(editor) {
        this.doHandleStickyEditorChange(editor);
    }
    doHandleStickyEditorChange(editor) {
        this.withTab(editor, (editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar));
        this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) => {
            this.redrawTabBorders(tabIndex, tabContainer);
        });
        this.layout(this.dimensions, { forceRevealActiveTab: true });
    }
    setActive(isGroupActive) {
        this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
            this.redrawTabSelectedActiveAndDirty(isGroupActive, editor, tabContainer, tabActionBar);
        });
        this.updateEditorActionsToolbar();
        this.layout(this.dimensions, { forceRevealActiveTab: true });
    }
    updateEditorSelections() {
        this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
            this.redrawTabSelectedActiveAndDirty(this.groupsView.activeGroup === this.groupView, editor, tabContainer, tabActionBar);
        });
    }
    updateEditorLabel(editor) {
        this.updateEditorLabelScheduler.schedule();
    }
    doUpdateEditorLabels() {
        this.computeTabLabels();
        this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) => {
            this.redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel);
        });
        this.layout(this.dimensions);
    }
    updateEditorDirty(editor) {
        this.withTab(editor, (editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTabSelectedActiveAndDirty(this.groupsView.activeGroup === this.groupView, editor, tabContainer, tabActionBar));
    }
    updateOptions(oldOptions, newOptions) {
        super.updateOptions(oldOptions, newOptions);
        if (oldOptions.labelFormat !== newOptions.labelFormat) {
            this.computeTabLabels();
        }
        if (oldOptions.titleScrollbarSizing !== newOptions.titleScrollbarSizing) {
            this.updateTabsScrollbarSizing();
        }
        if (oldOptions.alwaysShowEditorActions !== newOptions.alwaysShowEditorActions) {
            this.updateEditorActionsToolbar();
        }
        if (oldOptions.tabSizingFixedMinWidth !== newOptions.tabSizingFixedMinWidth ||
            oldOptions.tabSizingFixedMaxWidth !== newOptions.tabSizingFixedMaxWidth ||
            oldOptions.tabSizing !== newOptions.tabSizing) {
            this.updateTabSizing(true);
        }
        if (oldOptions.labelFormat !== newOptions.labelFormat ||
            oldOptions.tabActionLocation !== newOptions.tabActionLocation ||
            oldOptions.tabActionCloseVisibility !== newOptions.tabActionCloseVisibility ||
            oldOptions.tabActionUnpinVisibility !== newOptions.tabActionUnpinVisibility ||
            oldOptions.tabSizing !== newOptions.tabSizing ||
            oldOptions.pinnedTabSizing !== newOptions.pinnedTabSizing ||
            oldOptions.showIcons !== newOptions.showIcons ||
            oldOptions.hasIcons !== newOptions.hasIcons ||
            oldOptions.highlightModifiedTabs !== newOptions.highlightModifiedTabs ||
            oldOptions.wrapTabs !== newOptions.wrapTabs ||
            !equals(oldOptions.decorations, newOptions.decorations)) {
            this.redraw();
        }
    }
    updateStyles() {
        this.redraw();
    }
    forEachTab(fn, fromTabIndex, toTabIndex) {
        this.tabsModel.getEditors(1).forEach((editor, tabIndex) => {
            if (typeof fromTabIndex === 'number' && fromTabIndex > tabIndex) {
                return;
            }
            if (typeof toTabIndex === 'number' && toTabIndex < tabIndex) {
                return;
            }
            this.doWithTab(tabIndex, editor, fn);
        });
    }
    withTab(editor, fn) {
        this.doWithTab(this.tabsModel.indexOf(editor), editor, fn);
    }
    doWithTab(tabIndex, editor, fn) {
        const tabsContainer = assertIsDefined(this.tabsContainer);
        const tabContainer = tabsContainer.children[tabIndex];
        const tabResourceLabel = this.tabResourceLabels.get(tabIndex);
        const tabLabel = this.tabLabels[tabIndex];
        const tabActionBar = this.tabActionBars[tabIndex];
        if (tabContainer && tabResourceLabel && tabLabel) {
            fn(editor, tabIndex, tabContainer, tabResourceLabel, tabLabel, tabActionBar);
        }
    }
    createTab(tabIndex, tabsContainer, tabsScrollbar) {
        const tabContainer = document.createElement('div');
        tabContainer.draggable = true;
        tabContainer.setAttribute('role', 'tab');
        tabContainer.classList.add('tab');
        this._register(Gesture.addTarget(tabContainer));
        const tabBorderTopContainer = document.createElement('div');
        tabBorderTopContainer.classList.add('tab-border-top-container');
        tabContainer.appendChild(tabBorderTopContainer);
        const editorLabel = this.tabResourceLabels.create(tabContainer, { hoverDelegate: this.getHoverDelegate() });
        const tabActionsContainer = document.createElement('div');
        tabActionsContainer.classList.add('tab-actions');
        tabContainer.appendChild(tabActionsContainer);
        const that = this;
        const tabActionRunner = new EditorCommandsContextActionRunner({
            groupId: this.groupView.id,
            get editorIndex() { return that.toEditorIndex(tabIndex); }
        });
        const tabActionBar = new ActionBar(tabActionsContainer, { ariaLabel: localize('ariaLabelTabActions', "Tab actions"), actionRunner: tabActionRunner });
        const tabActionListener = tabActionBar.onWillRun(e => {
            if (e.action.id === this.closeEditorAction.id) {
                this.blockRevealActiveTabOnce();
            }
        });
        const tabActionBarDisposable = combinedDisposable(tabActionBar, tabActionListener, toDisposable(insert(this.tabActionBars, tabActionBar)));
        const tabShadowHider = document.createElement('div');
        tabShadowHider.classList.add('tab-fade-hider');
        tabContainer.appendChild(tabShadowHider);
        const tabBorderBottomContainer = document.createElement('div');
        tabBorderBottomContainer.classList.add('tab-border-bottom-container');
        tabContainer.appendChild(tabBorderBottomContainer);
        const eventsDisposable = this.registerTabListeners(tabContainer, tabIndex, tabsContainer, tabsScrollbar);
        this.tabDisposables.push(combinedDisposable(eventsDisposable, tabActionBarDisposable, tabActionRunner, editorLabel));
        return tabContainer;
    }
    toEditorIndex(tabIndex) {
        const editor = assertIsDefined(this.tabsModel.getEditorByIndex(tabIndex));
        return this.groupView.getIndexOfEditor(editor);
    }
    registerTabListeners(tab, tabIndex, tabsContainer, tabsScrollbar) {
        const disposables = new DisposableStore();
        const handleClickOrTouch = async (e, preserveFocus) => {
            tab.blur();
            if (isMouseEvent(e) && (e.button !== 0 || (isMacintosh && e.ctrlKey))) {
                if (e.button === 1) {
                    e.preventDefault();
                }
                return;
            }
            if (this.originatesFromTabActionBar(e)) {
                return;
            }
            const editor = this.tabsModel.getEditorByIndex(tabIndex);
            if (editor) {
                if (e.shiftKey) {
                    let anchor;
                    if (this.lastSingleSelectSelectedEditor && this.tabsModel.isSelected(this.lastSingleSelectSelectedEditor)) {
                        anchor = this.lastSingleSelectSelectedEditor;
                    }
                    else {
                        const activeEditor = assertIsDefined(this.groupView.activeEditor);
                        this.lastSingleSelectSelectedEditor = activeEditor;
                        anchor = activeEditor;
                    }
                    await this.selectEditorsBetween(editor, anchor);
                }
                else if ((e.ctrlKey && !isMacintosh) || (e.metaKey && isMacintosh)) {
                    if (this.tabsModel.isSelected(editor)) {
                        await this.unselectEditor(editor);
                    }
                    else {
                        await this.selectEditor(editor);
                        this.lastSingleSelectSelectedEditor = editor;
                    }
                }
                else {
                    const inactiveSelection = this.tabsModel.isSelected(editor) ? this.groupView.selectedEditors.filter(e => !e.matches(editor)) : [];
                    await this.groupView.openEditor(editor, { preserveFocus, activation: EditorActivation.ACTIVATE }, { inactiveSelection, focusTabControl: true });
                }
            }
        };
        const showContextMenu = (e) => {
            EventHelper.stop(e);
            const editor = this.tabsModel.getEditorByIndex(tabIndex);
            if (editor) {
                this.onTabContextMenu(editor, e, tab);
            }
        };
        disposables.add(addDisposableListener(tab, EventType.MOUSE_DOWN, e => handleClickOrTouch(e, false)));
        disposables.add(addDisposableListener(tab, TouchEventType.Tap, (e) => handleClickOrTouch(e, true)));
        disposables.add(addDisposableListener(tab, TouchEventType.Change, (e) => {
            tabsScrollbar.setScrollPosition({ scrollLeft: tabsScrollbar.getScrollPosition().scrollLeft - e.translationX });
        }));
        disposables.add(addDisposableListener(tab, EventType.MOUSE_UP, async (e) => {
            EventHelper.stop(e);
            tab.blur();
            if (isMouseEvent(e) && (e.button !== 0 || (isMacintosh && e.ctrlKey))) {
                return;
            }
            if (this.originatesFromTabActionBar(e)) {
                return;
            }
            const isCtrlCmd = (e.ctrlKey && !isMacintosh) || (e.metaKey && isMacintosh);
            if (!isCtrlCmd && !e.shiftKey && this.groupView.selectedEditors.length > 1) {
                await this.unselectAllEditors();
            }
        }));
        disposables.add(addDisposableListener(tab, EventType.AUXCLICK, e => {
            if (e.button === 1) {
                EventHelper.stop(e, true);
                const editor = this.tabsModel.getEditorByIndex(tabIndex);
                if (editor) {
                    if (preventEditorClose(this.tabsModel, editor, EditorCloseMethod.MOUSE, this.groupsView.partOptions)) {
                        return;
                    }
                    this.blockRevealActiveTabOnce();
                    this.closeEditorAction.run({ groupId: this.groupView.id, editorIndex: this.groupView.getIndexOfEditor(editor) });
                }
            }
        }));
        disposables.add(addDisposableListener(tab, EventType.KEY_DOWN, e => {
            const event = new StandardKeyboardEvent(e);
            if (event.shiftKey && event.keyCode === 68) {
                showContextMenu(e);
            }
        }));
        disposables.add(addDisposableListener(tab, TouchEventType.Contextmenu, (e) => {
            showContextMenu(e);
        }));
        disposables.add(addDisposableListener(tab, EventType.KEY_UP, e => {
            const event = new StandardKeyboardEvent(e);
            let handled = false;
            if (event.equals(3) || event.equals(10)) {
                handled = true;
                const editor = this.tabsModel.getEditorByIndex(tabIndex);
                if (editor) {
                    this.groupView.openEditor(editor);
                }
            }
            else if ([15, 17, 16, 18, 14, 13].some(kb => event.equals(kb))) {
                let editorIndex = this.toEditorIndex(tabIndex);
                if (event.equals(15) || event.equals(16)) {
                    editorIndex = editorIndex - 1;
                }
                else if (event.equals(17) || event.equals(18)) {
                    editorIndex = editorIndex + 1;
                }
                else if (event.equals(14)) {
                    editorIndex = 0;
                }
                else {
                    editorIndex = this.groupView.count - 1;
                }
                const target = this.groupView.getEditorByIndex(editorIndex);
                if (target) {
                    handled = true;
                    this.groupView.openEditor(target, { preserveFocus: true }, { focusTabControl: true });
                }
            }
            if (handled) {
                EventHelper.stop(e, true);
            }
            tabsScrollbar.setScrollPosition({
                scrollLeft: tabsContainer.scrollLeft
            });
        }));
        for (const eventType of [TouchEventType.Tap, EventType.DBLCLICK]) {
            disposables.add(addDisposableListener(tab, eventType, (e) => {
                if (eventType === EventType.DBLCLICK) {
                    EventHelper.stop(e);
                }
                else if (e.tapCount !== 2) {
                    return;
                }
                const editor = this.tabsModel.getEditorByIndex(tabIndex);
                if (editor && this.tabsModel.isPinned(editor)) {
                    switch (this.groupsView.partOptions.doubleClickTabToToggleEditorGroupSizes) {
                        case 'maximize':
                            this.groupsView.toggleMaximizeGroup(this.groupView);
                            break;
                        case 'expand':
                            this.groupsView.toggleExpandGroup(this.groupView);
                            break;
                        case 'off':
                            break;
                    }
                }
                else {
                    this.groupView.pinEditor(editor);
                }
            }));
        }
        disposables.add(addDisposableListener(tab, EventType.CONTEXT_MENU, e => {
            EventHelper.stop(e, true);
            const editor = this.tabsModel.getEditorByIndex(tabIndex);
            if (editor) {
                this.onTabContextMenu(editor, e, tab);
            }
        }, true));
        let lastDragEvent = undefined;
        let isNewWindowOperation = false;
        disposables.add(new DragAndDropObserver(tab, {
            onDragStart: e => {
                const editor = this.tabsModel.getEditorByIndex(tabIndex);
                if (!editor) {
                    return;
                }
                isNewWindowOperation = this.isNewWindowOperation(e);
                const selectedEditors = this.groupView.selectedEditors;
                this.editorTransfer.setData(selectedEditors.map(e => new DraggedEditorIdentifier({ editor: e, groupId: this.groupView.id })), DraggedEditorIdentifier.prototype);
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'copyMove';
                    if (selectedEditors.length > 1) {
                        const label = `${editor.getName()} + ${selectedEditors.length - 1}`;
                        applyDragImage(e, label, 'monaco-editor-group-drag-image', this.getColor(listActiveSelectionBackground), this.getColor(listActiveSelectionForeground));
                    }
                    else {
                        e.dataTransfer.setDragImage(tab, 0, 0);
                    }
                }
                this.doFillResourceDataTransfers(selectedEditors, e, isNewWindowOperation);
                scheduleAtNextAnimationFrame(getWindow(this.parent), () => this.updateDropFeedback(tab, false, e, tabIndex));
            },
            onDrag: e => {
                lastDragEvent = e;
            },
            onDragEnter: e => {
                if (!this.isSupportedDropTransfer(e)) {
                    if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'none';
                    }
                    return;
                }
                if (!this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
                    if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                }
                this.updateDropFeedback(tab, true, e, tabIndex);
            },
            onDragOver: (e, dragDuration) => {
                if (dragDuration >= MultiEditorTabsControl_1.DRAG_OVER_OPEN_TAB_THRESHOLD) {
                    const draggedOverTab = this.tabsModel.getEditorByIndex(tabIndex);
                    if (draggedOverTab && this.tabsModel.activeEditor !== draggedOverTab) {
                        this.groupView.openEditor(draggedOverTab, { preserveFocus: true });
                    }
                }
                this.updateDropFeedback(tab, true, e, tabIndex);
            },
            onDragEnd: async (e) => {
                this.updateDropFeedback(tab, false, e, tabIndex);
                const draggedEditors = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
                this.editorTransfer.clearData(DraggedEditorIdentifier.prototype);
                if (!isNewWindowOperation ||
                    isWindowDraggedOver() ||
                    !draggedEditors ||
                    draggedEditors.length === 0) {
                    return;
                }
                const auxiliaryEditorPart = await this.maybeCreateAuxiliaryEditorPartAt(e, tab);
                if (!auxiliaryEditorPart) {
                    return;
                }
                const targetGroup = auxiliaryEditorPart.activeGroup;
                const editors = draggedEditors.map(de => ({ editor: de.identifier.editor }));
                if (this.isMoveOperation(lastDragEvent ?? e, targetGroup.id, draggedEditors[0].identifier.editor)) {
                    this.groupView.moveEditors(editors, targetGroup);
                }
                else {
                    this.groupView.copyEditors(editors, targetGroup);
                }
                targetGroup.focus();
            },
            onDrop: e => {
                this.updateDropFeedback(tab, false, e, tabIndex);
                let targetIndex = tabIndex;
                if (this.getTabDragOverLocation(e, tab) === 'right') {
                    targetIndex++;
                }
                this.onDrop(e, targetIndex, tabsContainer);
            }
        }));
        return disposables;
    }
    isSupportedDropTransfer(e) {
        if (this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype)) {
            const data = this.groupTransfer.getData(DraggedEditorGroupIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                const group = data[0];
                if (group.identifier === this.groupView.id) {
                    return false;
                }
            }
            return true;
        }
        if (this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
            return true;
        }
        if (e.dataTransfer && e.dataTransfer.types.length > 0) {
            return true;
        }
        return false;
    }
    updateDropFeedback(element, isDND, e, tabIndex) {
        const isTab = (typeof tabIndex === 'number');
        let dropTarget;
        if (isDND) {
            if (isTab) {
                dropTarget = this.computeDropTarget(e, tabIndex, element);
            }
            else {
                dropTarget = { leftElement: element.lastElementChild, rightElement: undefined };
            }
        }
        else {
            dropTarget = undefined;
        }
        this.updateDropTarget(dropTarget);
    }
    updateDropTarget(newTarget) {
        const oldTargets = this.dropTarget;
        if (oldTargets === newTarget || oldTargets && newTarget && oldTargets.leftElement === newTarget.leftElement && oldTargets.rightElement === newTarget.rightElement) {
            return;
        }
        const dropClassLeft = 'drop-target-left';
        const dropClassRight = 'drop-target-right';
        if (oldTargets) {
            oldTargets.leftElement?.classList.remove(dropClassLeft);
            oldTargets.rightElement?.classList.remove(dropClassRight);
        }
        if (newTarget) {
            newTarget.leftElement?.classList.add(dropClassLeft);
            newTarget.rightElement?.classList.add(dropClassRight);
        }
        this.dropTarget = newTarget;
    }
    getTabDragOverLocation(e, tab) {
        const rect = tab.getBoundingClientRect();
        const offsetXRelativeToParent = e.clientX - rect.left;
        return offsetXRelativeToParent <= rect.width / 2 ? 'left' : 'right';
    }
    computeDropTarget(e, tabIndex, targetTab) {
        const isLeftSideOfTab = this.getTabDragOverLocation(e, targetTab) === 'left';
        const isLastTab = tabIndex === this.tabsModel.count - 1;
        const isFirstTab = tabIndex === 0;
        if (isLeftSideOfTab && isFirstTab) {
            return { leftElement: undefined, rightElement: targetTab };
        }
        if (!isLeftSideOfTab && isLastTab) {
            return { leftElement: targetTab, rightElement: undefined };
        }
        const tabBefore = isLeftSideOfTab ? targetTab.previousElementSibling : targetTab;
        const tabAfter = isLeftSideOfTab ? targetTab : targetTab.nextElementSibling;
        return { leftElement: tabBefore, rightElement: tabAfter };
    }
    async selectEditor(editor) {
        if (this.groupView.isActive(editor)) {
            return;
        }
        await this.groupView.setSelection(editor, this.groupView.selectedEditors);
    }
    async selectEditorsBetween(target, anchor) {
        const editorIndex = this.groupView.getIndexOfEditor(target);
        if (editorIndex === -1) {
            throw new BugIndicatingError();
        }
        const anchorEditorIndex = this.groupView.getIndexOfEditor(anchor);
        if (anchorEditorIndex === -1) {
            throw new BugIndicatingError();
        }
        let selection = this.groupView.selectedEditors;
        let currentEditorIndex = anchorEditorIndex;
        while (currentEditorIndex >= 0 && currentEditorIndex <= this.groupView.count - 1) {
            currentEditorIndex = anchorEditorIndex < editorIndex ? currentEditorIndex - 1 : currentEditorIndex + 1;
            const currentEditor = this.groupView.getEditorByIndex(currentEditorIndex);
            if (!currentEditor) {
                break;
            }
            if (!this.groupView.isSelected(currentEditor)) {
                break;
            }
            selection = selection.filter(editor => !editor.matches(currentEditor));
        }
        const fromEditorIndex = anchorEditorIndex < editorIndex ? anchorEditorIndex : editorIndex;
        const toEditorIndex = anchorEditorIndex < editorIndex ? editorIndex : anchorEditorIndex;
        const editorsToSelect = this.groupView.getEditors(1).slice(fromEditorIndex, toEditorIndex + 1);
        for (const editor of editorsToSelect) {
            if (!this.groupView.isSelected(editor)) {
                selection.push(editor);
            }
        }
        const inactiveSelectedEditors = selection.filter(editor => !editor.matches(target));
        await this.groupView.setSelection(target, inactiveSelectedEditors);
    }
    async unselectEditor(editor) {
        const isUnselectingActiveEditor = this.groupView.isActive(editor);
        if (isUnselectingActiveEditor && this.groupView.selectedEditors.length === 1) {
            return;
        }
        let newActiveEditor = assertIsDefined(this.groupView.activeEditor);
        if (isUnselectingActiveEditor) {
            const recentEditors = this.groupView.getEditors(0);
            for (let i = 1; i < recentEditors.length; i++) {
                const recentEditor = recentEditors[i];
                if (this.groupView.isSelected(recentEditor)) {
                    newActiveEditor = recentEditor;
                    break;
                }
            }
        }
        const inactiveSelectedEditors = this.groupView.selectedEditors.filter(e => !e.matches(editor) && !e.matches(newActiveEditor));
        await this.groupView.setSelection(newActiveEditor, inactiveSelectedEditors);
    }
    async unselectAllEditors() {
        if (this.groupView.selectedEditors.length > 1) {
            const activeEditor = assertIsDefined(this.groupView.activeEditor);
            await this.groupView.setSelection(activeEditor, []);
        }
    }
    computeTabLabels() {
        const { labelFormat } = this.groupsView.partOptions;
        const { verbosity, shortenDuplicates } = this.getLabelConfigFlags(labelFormat);
        const labels = [];
        let activeEditorTabIndex = -1;
        this.tabsModel.getEditors(1).forEach((editor, tabIndex) => {
            labels.push({
                editor,
                name: editor.getName(),
                description: editor.getDescription(verbosity),
                forceDescription: editor.hasCapability(64),
                title: editor.getTitle(2),
                ariaLabel: computeEditorAriaLabel(editor, tabIndex, this.groupView, this.editorPartsView.count)
            });
            if (editor === this.tabsModel.activeEditor) {
                activeEditorTabIndex = tabIndex;
            }
        });
        if (shortenDuplicates) {
            this.shortenTabLabels(labels);
        }
        this.tabLabels = labels;
        this.activeTabLabel = labels[activeEditorTabIndex];
    }
    shortenTabLabels(labels) {
        const mapNameToDuplicates = new Map();
        for (const label of labels) {
            if (typeof label.description === 'string') {
                getOrSet(mapNameToDuplicates, label.name, []).push(label);
            }
            else {
                label.description = '';
            }
        }
        for (const [, duplicateLabels] of mapNameToDuplicates) {
            if (duplicateLabels.length === 1 && !duplicateLabels[0].forceDescription) {
                duplicateLabels[0].description = '';
                continue;
            }
            const mapDescriptionToDuplicates = new Map();
            for (const duplicateLabel of duplicateLabels) {
                getOrSet(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
            }
            let useLongDescriptions = false;
            for (const [, duplicateLabels] of mapDescriptionToDuplicates) {
                if (!useLongDescriptions && duplicateLabels.length > 1) {
                    const [first, ...rest] = duplicateLabels.map(({ editor }) => editor.getDescription(2));
                    useLongDescriptions = rest.some(description => description !== first);
                }
            }
            if (useLongDescriptions) {
                mapDescriptionToDuplicates.clear();
                for (const duplicateLabel of duplicateLabels) {
                    duplicateLabel.description = duplicateLabel.editor.getDescription(2);
                    getOrSet(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
                }
            }
            const descriptions = [];
            for (const [description] of mapDescriptionToDuplicates) {
                descriptions.push(description);
            }
            if (descriptions.length === 1) {
                for (const label of mapDescriptionToDuplicates.get(descriptions[0]) || []) {
                    if (!label.forceDescription) {
                        label.description = '';
                    }
                }
                continue;
            }
            const shortenedDescriptions = shorten(descriptions, this.path.sep);
            descriptions.forEach((description, tabIndex) => {
                for (const label of mapDescriptionToDuplicates.get(description) || []) {
                    label.description = shortenedDescriptions[tabIndex];
                }
            });
        }
    }
    getLabelConfigFlags(value) {
        switch (value) {
            case 'short':
                return { verbosity: 0, shortenDuplicates: false };
            case 'medium':
                return { verbosity: 1, shortenDuplicates: false };
            case 'long':
                return { verbosity: 2, shortenDuplicates: false };
            default:
                return { verbosity: 1, shortenDuplicates: true };
        }
    }
    redraw(options) {
        if (this.tabsAndActionsContainer) {
            let tabsContainerBorderColor = this.getColor(EDITOR_GROUP_HEADER_TABS_BORDER);
            if (!tabsContainerBorderColor && isHighContrast(this.theme.type)) {
                tabsContainerBorderColor = this.getColor(TAB_BORDER) || this.getColor(contrastBorder);
            }
            if (tabsContainerBorderColor) {
                this.tabsAndActionsContainer.classList.add('tabs-border-bottom');
                this.tabsAndActionsContainer.style.setProperty('--tabs-border-bottom-color', tabsContainerBorderColor.toString());
            }
            else {
                this.tabsAndActionsContainer.classList.remove('tabs-border-bottom');
                this.tabsAndActionsContainer.style.removeProperty('--tabs-border-bottom-color');
            }
        }
        this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
            this.redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
        });
        this.updateEditorActionsToolbar();
        this.layout(this.dimensions, options);
    }
    redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) {
        const isTabSticky = this.tabsModel.isSticky(tabIndex);
        const options = this.groupsView.partOptions;
        this.redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel);
        const hasUnpinAction = isTabSticky && options.tabActionUnpinVisibility;
        const hasCloseAction = !hasUnpinAction && options.tabActionCloseVisibility;
        const hasAction = hasUnpinAction || hasCloseAction;
        let tabAction;
        if (hasAction) {
            tabAction = hasUnpinAction ? this.unpinEditorAction : this.closeEditorAction;
        }
        else {
            tabAction = isTabSticky ? this.unpinEditorAction : this.closeEditorAction;
        }
        if (!tabActionBar.hasAction(tabAction)) {
            if (!tabActionBar.isEmpty()) {
                tabActionBar.clear();
            }
            tabActionBar.push(tabAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(tabAction) });
        }
        tabContainer.classList.toggle(`pinned-action-off`, isTabSticky && !hasUnpinAction);
        tabContainer.classList.toggle(`close-action-off`, !hasUnpinAction && !hasCloseAction);
        for (const option of ['left', 'right']) {
            tabContainer.classList.toggle(`tab-actions-${option}`, hasAction && options.tabActionLocation === option);
        }
        const tabSizing = isTabSticky && options.pinnedTabSizing === 'shrink' ? 'shrink' : options.tabSizing;
        for (const option of ['fit', 'shrink', 'fixed']) {
            tabContainer.classList.toggle(`sizing-${option}`, tabSizing === option);
        }
        tabContainer.classList.toggle('has-icon', options.showIcons && options.hasIcons);
        tabContainer.classList.toggle('sticky', isTabSticky);
        for (const option of ['normal', 'compact', 'shrink']) {
            tabContainer.classList.toggle(`sticky-${option}`, isTabSticky && options.pinnedTabSizing === option);
        }
        if (!options.wrapTabs && isTabSticky && options.pinnedTabSizing !== 'normal') {
            let stickyTabWidth = 0;
            switch (options.pinnedTabSizing) {
                case 'compact':
                    stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.compact;
                    break;
                case 'shrink':
                    stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.shrink;
                    break;
            }
            tabContainer.style.left = `${tabIndex * stickyTabWidth}px`;
        }
        else {
            tabContainer.style.left = 'auto';
        }
        this.redrawTabBorders(tabIndex, tabContainer);
        this.redrawTabSelectedActiveAndDirty(this.groupsView.activeGroup === this.groupView, editor, tabContainer, tabActionBar);
    }
    redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) {
        const options = this.groupsView.partOptions;
        let name;
        let forceLabel = false;
        let fileDecorationBadges = Boolean(options.decorations?.badges);
        const fileDecorationColors = Boolean(options.decorations?.colors);
        let description;
        if (options.pinnedTabSizing === 'compact' && this.tabsModel.isSticky(tabIndex)) {
            const isShowingIcons = options.showIcons && options.hasIcons;
            name = isShowingIcons ? '' : tabLabel.name?.charAt(0).toUpperCase();
            description = '';
            forceLabel = true;
            fileDecorationBadges = false;
        }
        else {
            name = tabLabel.name;
            description = tabLabel.description || '';
        }
        if (tabLabel.ariaLabel) {
            tabContainer.setAttribute('aria-label', tabLabel.ariaLabel);
            tabContainer.setAttribute('aria-description', '');
        }
        tabLabelWidget.setResource({ name, description, resource: EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.BOTH }) }, {
            title: this.getHoverTitle(editor),
            extraClasses: coalesce(['tab-label', fileDecorationBadges ? 'tab-label-has-badge' : undefined].concat(editor.getLabelExtraClasses())),
            italic: !this.tabsModel.isPinned(editor),
            forceLabel,
            fileDecorations: {
                colors: fileDecorationColors,
                badges: fileDecorationBadges
            },
            icon: editor.getIcon(),
            hideIcon: options.showIcons === false,
        });
        const resource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
        if (resource) {
            tabContainer.setAttribute('data-resource-name', basenameOrAuthority(resource));
        }
        else {
            tabContainer.removeAttribute('data-resource-name');
        }
    }
    redrawTabSelectedActiveAndDirty(isGroupActive, editor, tabContainer, tabActionBar) {
        const isTabActive = this.tabsModel.isActive(editor);
        const hasModifiedBorderTop = this.doRedrawTabDirty(isGroupActive, isTabActive, editor, tabContainer);
        this.doRedrawTabActive(isGroupActive, !hasModifiedBorderTop, editor, tabContainer, tabActionBar);
    }
    doRedrawTabActive(isGroupActive, allowBorderTop, editor, tabContainer, tabActionBar) {
        const isActive = this.tabsModel.isActive(editor);
        const isSelected = this.tabsModel.isSelected(editor);
        tabContainer.classList.toggle('active', isActive);
        tabContainer.classList.toggle('selected', isSelected);
        tabContainer.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tabContainer.tabIndex = isActive ? 0 : -1;
        tabActionBar.setFocusable(isActive);
        if (isActive) {
            const activeTabBorderColorBottom = this.getColor(isGroupActive ? TAB_ACTIVE_BORDER : TAB_UNFOCUSED_ACTIVE_BORDER);
            tabContainer.classList.toggle('tab-border-bottom', !!activeTabBorderColorBottom);
            tabContainer.style.setProperty('--tab-border-bottom-color', activeTabBorderColorBottom ?? '');
        }
        let tabBorderColorTop = null;
        if (allowBorderTop) {
            if (isActive) {
                tabBorderColorTop = this.getColor(isGroupActive ? TAB_ACTIVE_BORDER_TOP : TAB_UNFOCUSED_ACTIVE_BORDER_TOP);
            }
            if (tabBorderColorTop === null && isSelected) {
                tabBorderColorTop = this.getColor(TAB_SELECTED_BORDER_TOP);
            }
        }
        tabContainer.classList.toggle('tab-border-top', !!tabBorderColorTop);
        tabContainer.style.setProperty('--tab-border-top-color', tabBorderColorTop ?? '');
    }
    doRedrawTabDirty(isGroupActive, isTabActive, editor, tabContainer) {
        let hasModifiedBorderColor = false;
        if (editor.isDirty() && !editor.isSaving()) {
            tabContainer.classList.add('dirty');
            if (this.groupsView.partOptions.highlightModifiedTabs) {
                let modifiedBorderColor;
                if (isGroupActive && isTabActive) {
                    modifiedBorderColor = this.getColor(TAB_ACTIVE_MODIFIED_BORDER);
                }
                else if (isGroupActive && !isTabActive) {
                    modifiedBorderColor = this.getColor(TAB_INACTIVE_MODIFIED_BORDER);
                }
                else if (!isGroupActive && isTabActive) {
                    modifiedBorderColor = this.getColor(TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER);
                }
                else {
                    modifiedBorderColor = this.getColor(TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER);
                }
                if (modifiedBorderColor) {
                    hasModifiedBorderColor = true;
                    tabContainer.classList.add('dirty-border-top');
                    tabContainer.style.setProperty('--tab-dirty-border-top-color', modifiedBorderColor);
                }
            }
            else {
                tabContainer.classList.remove('dirty-border-top');
                tabContainer.style.removeProperty('--tab-dirty-border-top-color');
            }
        }
        else {
            tabContainer.classList.remove('dirty', 'dirty-border-top');
            tabContainer.style.removeProperty('--tab-dirty-border-top-color');
        }
        return hasModifiedBorderColor;
    }
    redrawTabBorders(tabIndex, tabContainer) {
        const isTabSticky = this.tabsModel.isSticky(tabIndex);
        const isTabLastSticky = isTabSticky && this.tabsModel.stickyCount === tabIndex + 1;
        const showLastStickyTabBorderColor = this.tabsModel.stickyCount !== this.tabsModel.count;
        const borderRightColor = ((isTabLastSticky && showLastStickyTabBorderColor ? this.getColor(TAB_LAST_PINNED_BORDER) : undefined) || this.getColor(TAB_BORDER) || this.getColor(contrastBorder));
        tabContainer.style.borderRight = borderRightColor ? `1px solid ${borderRightColor}` : '';
        tabContainer.style.outlineColor = this.getColor(activeContrastBorder) || '';
    }
    prepareEditorActions(editorActions) {
        const isGroupActive = this.groupsView.activeGroup === this.groupView;
        if (isGroupActive) {
            return editorActions;
        }
        else {
            return {
                primary: this.groupsView.partOptions.alwaysShowEditorActions ? editorActions.primary : editorActions.primary.filter(action => action.id === UNLOCK_GROUP_COMMAND_ID),
                secondary: editorActions.secondary
            };
        }
    }
    getHeight() {
        if (this.dimensions.used) {
            return this.dimensions.used.height;
        }
        else {
            return this.computeHeight();
        }
    }
    computeHeight() {
        let height;
        if (!this.visible) {
            height = 0;
        }
        else if (this.groupsView.partOptions.wrapTabs && this.tabsAndActionsContainer?.classList.contains('wrapping')) {
            height = this.tabsAndActionsContainer.offsetHeight;
        }
        else {
            height = this.tabHeight;
        }
        return height;
    }
    layout(dimensions, options) {
        Object.assign(this.dimensions, dimensions);
        if (this.visible) {
            if (!this.layoutScheduler.value) {
                const disposable = scheduleAtNextAnimationFrame(getWindow(this.parent), () => {
                    this.doLayout(this.dimensions, this.layoutScheduler.value?.options);
                    this.layoutScheduler.clear();
                });
                this.layoutScheduler.value = { options, dispose: () => disposable.dispose() };
            }
            if (options?.forceRevealActiveTab) {
                this.layoutScheduler.value.options = {
                    ...this.layoutScheduler.value.options,
                    forceRevealActiveTab: true
                };
            }
        }
        if (!this.dimensions.used) {
            this.dimensions.used = new Dimension(dimensions.container.width, this.computeHeight());
        }
        return this.dimensions.used;
    }
    doLayout(dimensions, options) {
        if (dimensions.container !== Dimension.None && dimensions.available !== Dimension.None) {
            this.doLayoutTabs(dimensions, options);
        }
        const oldDimension = this.dimensions.used;
        const newDimension = this.dimensions.used = new Dimension(dimensions.container.width, this.computeHeight());
        if (oldDimension && oldDimension.height !== newDimension.height) {
            this.groupView.relayout();
        }
    }
    doLayoutTabs(dimensions, options) {
        const tabsWrapMultiLine = this.doLayoutTabsWrapping(dimensions);
        if (!tabsWrapMultiLine) {
            this.doLayoutTabsNonWrapping(options);
        }
    }
    doLayoutTabsWrapping(dimensions) {
        const [tabsAndActionsContainer, tabsContainer, editorToolbarContainer, tabsScrollbar] = assertAllDefined(this.tabsAndActionsContainer, this.tabsContainer, this.editorActionsToolbarContainer, this.tabsScrollbar);
        const didTabsWrapMultiLine = tabsAndActionsContainer.classList.contains('wrapping');
        let tabsWrapMultiLine = didTabsWrapMultiLine;
        function updateTabsWrapping(enabled) {
            tabsWrapMultiLine = enabled;
            tabsAndActionsContainer.classList.toggle('wrapping', tabsWrapMultiLine);
            tabsContainer.style.setProperty('--last-tab-margin-right', tabsWrapMultiLine ? `${editorToolbarContainer.offsetWidth}px` : '0');
            for (const tab of tabsContainer.children) {
                tab.classList.remove('last-in-row');
            }
        }
        if (this.groupsView.partOptions.wrapTabs) {
            const visibleTabsWidth = tabsContainer.offsetWidth;
            const allTabsWidth = tabsContainer.scrollWidth;
            const lastTabFitsWrapped = () => {
                const lastTab = this.getLastTab();
                if (!lastTab) {
                    return true;
                }
                const lastTabOverlapWithToolbarWidth = lastTab.offsetWidth + editorToolbarContainer.offsetWidth - dimensions.available.width;
                if (lastTabOverlapWithToolbarWidth > 1) {
                    return false;
                }
                return true;
            };
            if (tabsWrapMultiLine || (allTabsWidth > visibleTabsWidth && lastTabFitsWrapped())) {
                updateTabsWrapping(true);
            }
            if (tabsWrapMultiLine) {
                if ((tabsContainer.offsetHeight > dimensions.available.height) ||
                    (allTabsWidth === visibleTabsWidth && tabsContainer.offsetHeight === this.tabHeight) ||
                    (!lastTabFitsWrapped())) {
                    updateTabsWrapping(false);
                }
            }
        }
        else if (didTabsWrapMultiLine) {
            updateTabsWrapping(false);
        }
        if (tabsWrapMultiLine && !didTabsWrapMultiLine) {
            const visibleTabsWidth = tabsContainer.offsetWidth;
            tabsScrollbar.setScrollDimensions({
                width: visibleTabsWidth,
                scrollWidth: visibleTabsWidth
            });
        }
        if (tabsWrapMultiLine) {
            const tabs = new Map();
            let currentTabsPosY = undefined;
            let lastTab = undefined;
            for (const child of tabsContainer.children) {
                const tab = child;
                const tabPosY = tab.offsetTop;
                if (tabPosY !== currentTabsPosY) {
                    currentTabsPosY = tabPosY;
                    if (lastTab) {
                        tabs.set(lastTab, true);
                    }
                }
                lastTab = tab;
                tabs.set(tab, false);
            }
            if (lastTab) {
                tabs.set(lastTab, true);
            }
            for (const [tab, lastInRow] of tabs) {
                tab.classList.toggle('last-in-row', lastInRow);
            }
        }
        return tabsWrapMultiLine;
    }
    doLayoutTabsNonWrapping(options) {
        const [tabsContainer, tabsScrollbar] = assertAllDefined(this.tabsContainer, this.tabsScrollbar);
        const visibleTabsWidth = tabsContainer.offsetWidth;
        const allTabsWidth = tabsContainer.scrollWidth;
        let stickyTabsWidth = 0;
        if (this.tabsModel.stickyCount > 0) {
            let stickyTabWidth = 0;
            switch (this.groupsView.partOptions.pinnedTabSizing) {
                case 'compact':
                    stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.compact;
                    break;
                case 'shrink':
                    stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.shrink;
                    break;
            }
            stickyTabsWidth = this.tabsModel.stickyCount * stickyTabWidth;
        }
        const activeTabAndIndex = this.tabsModel.activeEditor ? this.getTabAndIndex(this.tabsModel.activeEditor) : undefined;
        const [activeTab, activeTabIndex] = activeTabAndIndex ?? [undefined, undefined];
        let activeTabPositionStatic = this.groupsView.partOptions.pinnedTabSizing !== 'normal' && typeof activeTabIndex === 'number' && this.tabsModel.isSticky(activeTabIndex);
        let availableTabsContainerWidth = visibleTabsWidth - stickyTabsWidth;
        if (this.tabsModel.stickyCount > 0 && availableTabsContainerWidth < MultiEditorTabsControl_1.TAB_WIDTH.fit) {
            tabsContainer.classList.add('disable-sticky-tabs');
            availableTabsContainerWidth = visibleTabsWidth;
            stickyTabsWidth = 0;
            activeTabPositionStatic = false;
        }
        else {
            tabsContainer.classList.remove('disable-sticky-tabs');
        }
        let activeTabPosX;
        let activeTabWidth;
        if (!this.blockRevealActiveTab && activeTab) {
            activeTabPosX = activeTab.offsetLeft;
            activeTabWidth = activeTab.offsetWidth;
        }
        const { width: oldVisibleTabsWidth, scrollWidth: oldAllTabsWidth } = tabsScrollbar.getScrollDimensions();
        tabsScrollbar.setScrollDimensions({
            width: visibleTabsWidth,
            scrollWidth: allTabsWidth
        });
        const dimensionsChanged = oldVisibleTabsWidth !== visibleTabsWidth || oldAllTabsWidth !== allTabsWidth;
        if (this.blockRevealActiveTab ||
            typeof activeTabPosX !== 'number' ||
            typeof activeTabWidth !== 'number' ||
            activeTabPositionStatic ||
            (!dimensionsChanged && !options?.forceRevealActiveTab)) {
            this.blockRevealActiveTab = false;
            return;
        }
        const tabsContainerScrollPosX = tabsScrollbar.getScrollPosition().scrollLeft;
        const activeTabFits = activeTabWidth <= availableTabsContainerWidth;
        const adjustedActiveTabPosX = activeTabPosX - stickyTabsWidth;
        if (activeTabFits && tabsContainerScrollPosX + availableTabsContainerWidth < adjustedActiveTabPosX + activeTabWidth) {
            tabsScrollbar.setScrollPosition({
                scrollLeft: tabsContainerScrollPosX + ((adjustedActiveTabPosX + activeTabWidth) - (tabsContainerScrollPosX + availableTabsContainerWidth))
            });
        }
        else if (tabsContainerScrollPosX > adjustedActiveTabPosX || !activeTabFits) {
            tabsScrollbar.setScrollPosition({
                scrollLeft: adjustedActiveTabPosX
            });
        }
    }
    updateTabsControlVisibility() {
        const tabsAndActionsContainer = assertIsDefined(this.tabsAndActionsContainer);
        tabsAndActionsContainer.classList.toggle('empty', !this.visible);
        if (!this.visible && this.dimensions) {
            this.dimensions.used = undefined;
        }
    }
    get visible() {
        return this.tabsModel.count > 0;
    }
    getTabAndIndex(editor) {
        const tabIndex = this.tabsModel.indexOf(editor);
        const tab = this.getTabAtIndex(tabIndex);
        if (tab) {
            return [tab, tabIndex];
        }
        return undefined;
    }
    getTabAtIndex(tabIndex) {
        if (tabIndex >= 0) {
            const tabsContainer = assertIsDefined(this.tabsContainer);
            return tabsContainer.children[tabIndex];
        }
        return undefined;
    }
    getLastTab() {
        return this.getTabAtIndex(this.tabsModel.count - 1);
    }
    blockRevealActiveTabOnce() {
        this.blockRevealActiveTab = true;
    }
    originatesFromTabActionBar(e) {
        let element;
        if (isMouseEvent(e)) {
            element = (e.target || e.srcElement);
        }
        else {
            element = e.initialTarget;
        }
        return !!findParentWithClass(element, 'action-item', 'tab');
    }
    async onDrop(e, targetTabIndex, tabsContainer) {
        EventHelper.stop(e, true);
        this.updateDropFeedback(tabsContainer, false, e, targetTabIndex);
        tabsContainer.classList.remove('scroll');
        let targetEditorIndex = this.tabsModel instanceof UnstickyEditorGroupModel ? targetTabIndex + this.groupView.stickyCount : targetTabIndex;
        const options = {
            sticky: this.tabsModel instanceof StickyEditorGroupModel && this.tabsModel.stickyCount === targetEditorIndex,
            index: targetEditorIndex
        };
        if (this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype)) {
            const data = this.groupTransfer.getData(DraggedEditorGroupIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                const sourceGroup = this.editorPartsView.getGroup(data[0].identifier);
                if (sourceGroup) {
                    const mergeGroupOptions = { index: targetEditorIndex };
                    if (!this.isMoveOperation(e, sourceGroup.id)) {
                        mergeGroupOptions.mode = 0;
                    }
                    this.groupsView.mergeGroup(sourceGroup, this.groupView, mergeGroupOptions);
                }
                this.groupView.focus();
                this.groupTransfer.clearData(DraggedEditorGroupIdentifier.prototype);
            }
        }
        else if (this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
            const data = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                const sourceGroup = this.editorPartsView.getGroup(data[0].identifier.groupId);
                if (sourceGroup) {
                    for (const de of data) {
                        const editor = de.identifier.editor;
                        if (sourceGroup.id !== de.identifier.groupId) {
                            continue;
                        }
                        const sourceEditorIndex = sourceGroup.getIndexOfEditor(editor);
                        if (sourceGroup === this.groupView && sourceEditorIndex < targetEditorIndex) {
                            targetEditorIndex--;
                        }
                        if (this.isMoveOperation(e, de.identifier.groupId, editor)) {
                            sourceGroup.moveEditor(editor, this.groupView, { ...options, index: targetEditorIndex });
                        }
                        else {
                            sourceGroup.copyEditor(editor, this.groupView, { ...options, index: targetEditorIndex });
                        }
                        targetEditorIndex++;
                    }
                }
            }
            this.groupView.focus();
            this.editorTransfer.clearData(DraggedEditorIdentifier.prototype);
        }
        else if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
            const data = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                const editors = [];
                for (const id of data) {
                    const dataTransferItem = await this.treeViewsDragAndDropService.removeDragOperationTransfer(id.identifier);
                    if (dataTransferItem) {
                        const treeDropData = await extractTreeDropData(dataTransferItem);
                        editors.push(...treeDropData.map(editor => ({ ...editor, options: { ...editor.options, pinned: true, index: targetEditorIndex } })));
                    }
                }
                this.editorService.openEditors(editors, this.groupView, { validateTrust: true });
            }
            this.treeItemsTransfer.clearData(DraggedTreeItemsIdentifier.prototype);
        }
        else {
            const dropHandler = this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: false });
            dropHandler.handleDrop(e, getWindow(this.parent), () => this.groupView, () => this.groupView.focus(), options);
        }
    }
    dispose() {
        super.dispose();
        this.tabDisposables = dispose(this.tabDisposables);
    }
};
MultiEditorTabsControl = MultiEditorTabsControl_1 = __decorate([
    __param(5, IContextMenuService),
    __param(6, IInstantiationService),
    __param(7, IContextKeyService),
    __param(8, IKeybindingService),
    __param(9, INotificationService),
    __param(10, IQuickInputService),
    __param(11, IThemeService),
    __param(12, IEditorService),
    __param(13, IPathService),
    __param(14, ITreeViewsDnDService),
    __param(15, IEditorResolverService),
    __param(16, IHostService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MultiEditorTabsControl);
export { MultiEditorTabsControl };
registerThemingParticipant((theme, collector) => {
    const borderColor = theme.getColor(TAB_BORDER);
    if (borderColor) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title > .tabs-and-actions-container.wrapping .tabs-container > .tab {
				border-bottom: 1px solid ${borderColor};
			}
		`);
    }
    const activeContrastBorderColor = theme.getColor(activeContrastBorder);
    if (activeContrastBorderColor) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active,
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active:hover  {
				outline: 1px solid;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.selected:not(.active):not(:hover)  {
				outline: 1px dotted;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active:focus {
				outline-style: dashed;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active {
				outline: 1px dotted;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				outline: 1px dashed;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active:hover > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.dirty > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.sticky > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover > .tab-actions .action-label {
				opacity: 1 !important;
			}
		`);
    }
    const contrastBorderColor = theme.getColor(contrastBorder);
    if (contrastBorderColor) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions {
				outline: 1px solid ${contrastBorderColor}
			}
		`);
    }
    const tabHoverBackground = theme.getColor(TAB_HOVER_BACKGROUND);
    if (tabHoverBackground) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:not(.selected):hover {
				background-color: ${tabHoverBackground} !important;
			}
		`);
    }
    const tabUnfocusedHoverBackground = theme.getColor(TAB_UNFOCUSED_HOVER_BACKGROUND);
    if (tabUnfocusedHoverBackground) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:not(.selected):hover  {
				background-color: ${tabUnfocusedHoverBackground} !important;
			}
		`);
    }
    const tabHoverForeground = theme.getColor(TAB_HOVER_FOREGROUND);
    if (tabHoverForeground) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:not(.selected):hover  {
				color: ${tabHoverForeground} !important;
			}
		`);
    }
    const tabUnfocusedHoverForeground = theme.getColor(TAB_UNFOCUSED_HOVER_FOREGROUND);
    if (tabUnfocusedHoverForeground) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:not(.selected):hover  {
				color: ${tabUnfocusedHoverForeground} !important;
			}
		`);
    }
    const tabHoverBorder = theme.getColor(TAB_HOVER_BORDER);
    if (tabHoverBorder) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover > .tab-border-bottom-container {
				display: block;
				position: absolute;
				left: 0;
				pointer-events: none;
				width: 100%;
				z-index: 10;
				bottom: 0;
				height: 1px;
				background-color: ${tabHoverBorder};
			}
		`);
    }
    const tabUnfocusedHoverBorder = theme.getColor(TAB_UNFOCUSED_HOVER_BORDER);
    if (tabUnfocusedHoverBorder) {
        collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover > .tab-border-bottom-container  {
				display: block;
				position: absolute;
				left: 0;
				pointer-events: none;
				width: 100%;
				z-index: 10;
				bottom: 0;
				height: 1px;
				background-color: ${tabUnfocusedHoverBorder};
			}
		`);
    }
    if (!isHighContrast(theme.type) && !isSafari && !activeContrastBorderColor) {
        const workbenchBackground = WORKBENCH_BACKGROUND(theme);
        const editorBackgroundColor = theme.getColor(editorBackground);
        const editorGroupHeaderTabsBackground = theme.getColor(EDITOR_GROUP_HEADER_TABS_BACKGROUND);
        const editorDragAndDropBackground = theme.getColor(EDITOR_DRAG_AND_DROP_BACKGROUND);
        let adjustedTabBackground;
        if (editorGroupHeaderTabsBackground && editorBackgroundColor) {
            adjustedTabBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorBackgroundColor, workbenchBackground);
        }
        let adjustedTabDragBackground;
        if (editorGroupHeaderTabsBackground && editorBackgroundColor && editorDragAndDropBackground && editorBackgroundColor) {
            adjustedTabDragBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorDragAndDropBackground, editorBackgroundColor, workbenchBackground);
        }
        const makeTabHoverBackgroundRule = (color, colorDrag, hasFocus = false) => `
			.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-shrink:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after,
			.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-fixed:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after {
				background: linear-gradient(to left, ${color}, transparent) !important;
			}

			.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-shrink:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after,
			.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-fixed:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after {
				background: linear-gradient(to left, ${colorDrag}, transparent) !important;
			}
		`;
        if (tabHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
            const adjustedColor = tabHoverBackground.flatten(adjustedTabBackground);
            const adjustedColorDrag = tabHoverBackground.flatten(adjustedTabDragBackground);
            collector.addRule(makeTabHoverBackgroundRule(adjustedColor, adjustedColorDrag, true));
        }
        if (tabUnfocusedHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
            const adjustedColor = tabUnfocusedHoverBackground.flatten(adjustedTabBackground);
            const adjustedColorDrag = tabUnfocusedHoverBackground.flatten(adjustedTabDragBackground);
            collector.addRule(makeTabHoverBackgroundRule(adjustedColor, adjustedColorDrag));
        }
        if (editorDragAndDropBackground && adjustedTabDragBackground) {
            const adjustedColorDrag = editorDragAndDropBackground.flatten(adjustedTabDragBackground);
            collector.addRule(`
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container.active > .title .tabs-container > .tab.sizing-shrink.dragged-over:not(.active):not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container:not(.active) > .title .tabs-container > .tab.sizing-shrink.dragged-over:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container.active > .title .tabs-container > .tab.sizing-fixed.dragged-over:not(.active):not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container:not(.active) > .title .tabs-container > .tab.sizing-fixed.dragged-over:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${adjustedColorDrag}, transparent) !important;
				}
		`);
        }
        const makeTabBackgroundRule = (color, colorDrag, focused, active) => `
				.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-shrink${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-fixed${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${color}, transparent);
				}

				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-shrink${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-fixed${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${colorDrag}, transparent);
				}
		`;
        const tabActiveBackground = theme.getColor(TAB_ACTIVE_BACKGROUND);
        if (tabActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
            const adjustedColor = tabActiveBackground.flatten(adjustedTabBackground);
            const adjustedColorDrag = tabActiveBackground.flatten(adjustedTabDragBackground);
            collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, true));
        }
        const tabUnfocusedActiveBackground = theme.getColor(TAB_UNFOCUSED_ACTIVE_BACKGROUND);
        if (tabUnfocusedActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
            const adjustedColor = tabUnfocusedActiveBackground.flatten(adjustedTabBackground);
            const adjustedColorDrag = tabUnfocusedActiveBackground.flatten(adjustedTabDragBackground);
            collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, true));
        }
        const tabInactiveBackground = theme.getColor(TAB_INACTIVE_BACKGROUND);
        if (tabInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
            const adjustedColor = tabInactiveBackground.flatten(adjustedTabBackground);
            const adjustedColorDrag = tabInactiveBackground.flatten(adjustedTabDragBackground);
            collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, false));
        }
        const tabUnfocusedInactiveBackground = theme.getColor(TAB_UNFOCUSED_INACTIVE_BACKGROUND);
        if (tabUnfocusedInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
            const adjustedColor = tabUnfocusedInactiveBackground.flatten(adjustedTabBackground);
            const adjustedColorDrag = tabUnfocusedInactiveBackground.flatten(adjustedTabDragBackground);
            collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, false));
        }
    }
});
