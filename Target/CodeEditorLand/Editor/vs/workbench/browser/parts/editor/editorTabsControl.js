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
var EditorTabsControl_1;
import './media/editortabscontrol.css';
import { localize } from '../../../../nls.js';
import { applyDragImage, DataTransfers } from '../../../../base/browser/dnd.js';
import { getActiveWindow, getWindow, isMouseEvent } from '../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { prepareActions } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { ActionRunner } from '../../../../base/common/actions.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { createActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { listActiveSelectionBackground, listActiveSelectionForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { DraggedEditorGroupIdentifier, fillEditorsDragData, isWindowDraggedOver } from '../../dnd.js';
import { EditorPane } from './editorPane.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { ResourceContextKey, ActiveEditorPinnedContext, ActiveEditorStickyContext, ActiveEditorGroupLockedContext, ActiveEditorCanSplitInGroupContext, SideBySideEditorActiveContext, ActiveEditorFirstInGroupContext, ActiveEditorAvailableEditorIdsContext, applyAvailableEditorIds, ActiveEditorLastInGroupContext } from '../../../common/contextkeys.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { isFirefox } from '../../../../base/browser/browser.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { WorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { LocalSelectionTransfer } from '../../../../platform/dnd/browser/dnd.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { EDITOR_CORE_NAVIGATION_COMMANDS } from './editorCommands.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
export class EditorCommandsContextActionRunner extends ActionRunner {
    constructor(context) {
        super();
        this.context = context;
    }
    run(action, context) {
        // Even though we have a fixed context for editor commands,
        // allow to preserve the context that is given to us in case
        // it applies.
        let mergedContext = this.context;
        if (context?.preserveFocus) {
            mergedContext = {
                ...this.context,
                preserveFocus: true
            };
        }
        return super.run(action, mergedContext);
    }
}
let EditorTabsControl = class EditorTabsControl extends Themable {
    static { EditorTabsControl_1 = this; }
    static { this.EDITOR_TAB_HEIGHT = {
        normal: 35,
        compact: 22
    }; }
    constructor(parent, editorPartsView, groupsView, groupView, tabsModel, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorResolverService, hostService) {
        super(themeService);
        this.parent = parent;
        this.editorPartsView = editorPartsView;
        this.groupsView = groupsView;
        this.groupView = groupView;
        this.tabsModel = tabsModel;
        this.contextMenuService = contextMenuService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.keybindingService = keybindingService;
        this.notificationService = notificationService;
        this.quickInputService = quickInputService;
        this.editorResolverService = editorResolverService;
        this.hostService = hostService;
        this.editorTransfer = LocalSelectionTransfer.getInstance();
        this.groupTransfer = LocalSelectionTransfer.getInstance();
        this.treeItemsTransfer = LocalSelectionTransfer.getInstance();
        this.editorActionsToolbarDisposables = this._register(new DisposableStore());
        this.editorActionsDisposables = this._register(new DisposableStore());
        this.renderDropdownAsChildElement = false;
        const container = this.create(parent);
        // Context Keys
        this.contextMenuContextKeyService = this._register(this.contextKeyService.createScoped(container));
        const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.contextMenuContextKeyService])));
        this.resourceContext = this._register(scopedInstantiationService.createInstance(ResourceContextKey));
        this.editorPinnedContext = ActiveEditorPinnedContext.bindTo(this.contextMenuContextKeyService);
        this.editorIsFirstContext = ActiveEditorFirstInGroupContext.bindTo(this.contextMenuContextKeyService);
        this.editorIsLastContext = ActiveEditorLastInGroupContext.bindTo(this.contextMenuContextKeyService);
        this.editorStickyContext = ActiveEditorStickyContext.bindTo(this.contextMenuContextKeyService);
        this.editorAvailableEditorIds = ActiveEditorAvailableEditorIdsContext.bindTo(this.contextMenuContextKeyService);
        this.editorCanSplitInGroupContext = ActiveEditorCanSplitInGroupContext.bindTo(this.contextMenuContextKeyService);
        this.sideBySideEditorContext = SideBySideEditorActiveContext.bindTo(this.contextMenuContextKeyService);
        this.groupLockedContext = ActiveEditorGroupLockedContext.bindTo(this.contextMenuContextKeyService);
    }
    create(parent) {
        this.updateTabHeight();
        return parent;
    }
    get editorActionsEnabled() {
        return this.groupsView.partOptions.editorActionsLocation === 'default' && this.groupsView.partOptions.showTabs !== 'none';
    }
    createEditorActionsToolBar(parent, classes) {
        this.editorActionsToolbarContainer = document.createElement('div');
        this.editorActionsToolbarContainer.classList.add(...classes);
        parent.appendChild(this.editorActionsToolbarContainer);
        this.handleEditorActionToolBarVisibility(this.editorActionsToolbarContainer);
    }
    handleEditorActionToolBarVisibility(container) {
        const editorActionsEnabled = this.editorActionsEnabled;
        const editorActionsVisible = !!this.editorActionsToolbar;
        // Create toolbar if it is enabled (and not yet created)
        if (editorActionsEnabled && !editorActionsVisible) {
            this.doCreateEditorActionsToolBar(container);
        }
        // Remove toolbar if it is not enabled (and is visible)
        else if (!editorActionsEnabled && editorActionsVisible) {
            this.editorActionsToolbar?.getElement().remove();
            this.editorActionsToolbar = undefined;
            this.editorActionsToolbarDisposables.clear();
            this.editorActionsDisposables.clear();
        }
        container.classList.toggle('hidden', !editorActionsEnabled);
    }
    doCreateEditorActionsToolBar(container) {
        const context = { groupId: this.groupView.id };
        // Toolbar Widget
        this.editorActionsToolbar = this.editorActionsToolbarDisposables.add(this.instantiationService.createInstance(WorkbenchToolBar, container, {
            actionViewItemProvider: (action, options) => this.actionViewItemProvider(action, options),
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            ariaLabel: localize('ariaLabelEditorActions', "Editor actions"),
            getKeyBinding: action => this.getKeybinding(action),
            actionRunner: this.editorActionsToolbarDisposables.add(new EditorCommandsContextActionRunner(context)),
            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
            renderDropdownAsChildElement: this.renderDropdownAsChildElement,
            telemetrySource: 'editorPart',
            resetMenu: MenuId.EditorTitle,
            overflowBehavior: { maxItems: 9, exempted: EDITOR_CORE_NAVIGATION_COMMANDS },
            highlightToggledItems: true
        }));
        // Context
        this.editorActionsToolbar.context = context;
        // Action Run Handling
        this.editorActionsToolbarDisposables.add(this.editorActionsToolbar.actionRunner.onDidRun(e => {
            // Notify for Error
            if (e.error && !isCancellationError(e.error)) {
                this.notificationService.error(e.error);
            }
        }));
    }
    actionViewItemProvider(action, options) {
        const activeEditorPane = this.groupView.activeEditorPane;
        // Check Active Editor
        if (activeEditorPane instanceof EditorPane) {
            const result = activeEditorPane.getActionViewItem(action, options);
            if (result) {
                return result;
            }
        }
        // Check extensions
        return createActionViewItem(this.instantiationService, action, { ...options, menuAsChild: this.renderDropdownAsChildElement });
    }
    updateEditorActionsToolbar() {
        if (!this.editorActionsEnabled) {
            return;
        }
        this.editorActionsDisposables.clear();
        const editorActions = this.groupView.createEditorActions(this.editorActionsDisposables);
        this.editorActionsDisposables.add(editorActions.onDidChange(() => this.updateEditorActionsToolbar()));
        const editorActionsToolbar = assertIsDefined(this.editorActionsToolbar);
        const { primary, secondary } = this.prepareEditorActions(editorActions.actions);
        editorActionsToolbar.setActions(prepareActions(primary), prepareActions(secondary));
    }
    getEditorPaneAwareContextKeyService() {
        return this.groupView.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
    }
    clearEditorActionsToolbar() {
        if (!this.editorActionsEnabled) {
            return;
        }
        const editorActionsToolbar = assertIsDefined(this.editorActionsToolbar);
        editorActionsToolbar.setActions([], []);
    }
    onGroupDragStart(e, element) {
        if (e.target !== element) {
            return false; // only if originating from tabs container
        }
        const isNewWindowOperation = this.isNewWindowOperation(e);
        // Set editor group as transfer
        this.groupTransfer.setData([new DraggedEditorGroupIdentifier(this.groupView.id)], DraggedEditorGroupIdentifier.prototype);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'copyMove';
        }
        // Drag all tabs of the group if tabs are enabled
        let hasDataTransfer = false;
        if (this.groupsView.partOptions.showTabs === 'multiple') {
            hasDataTransfer = this.doFillResourceDataTransfers(this.groupView.getEditors(1 /* EditorsOrder.SEQUENTIAL */), e, isNewWindowOperation);
        }
        // Otherwise only drag the active editor
        else {
            if (this.groupView.activeEditor) {
                hasDataTransfer = this.doFillResourceDataTransfers([this.groupView.activeEditor], e, isNewWindowOperation);
            }
        }
        // Firefox: requires to set a text data transfer to get going
        if (!hasDataTransfer && isFirefox) {
            e.dataTransfer?.setData(DataTransfers.TEXT, String(this.groupView.label));
        }
        // Drag Image
        if (this.groupView.activeEditor) {
            let label = this.groupView.activeEditor.getName();
            if (this.groupsView.partOptions.showTabs === 'multiple' && this.groupView.count > 1) {
                label = localize('draggedEditorGroup', "{0} (+{1})", label, this.groupView.count - 1);
            }
            applyDragImage(e, label, 'monaco-editor-group-drag-image', this.getColor(listActiveSelectionBackground), this.getColor(listActiveSelectionForeground));
        }
        return isNewWindowOperation;
    }
    async onGroupDragEnd(e, previousDragEvent, element, isNewWindowOperation) {
        this.groupTransfer.clearData(DraggedEditorGroupIdentifier.prototype);
        if (e.target !== element ||
            !isNewWindowOperation ||
            isWindowDraggedOver()) {
            return; // drag to open in new window is disabled
        }
        const auxiliaryEditorPart = await this.maybeCreateAuxiliaryEditorPartAt(e, element);
        if (!auxiliaryEditorPart) {
            return;
        }
        const targetGroup = auxiliaryEditorPart.activeGroup;
        this.groupsView.mergeGroup(this.groupView, targetGroup.id, {
            mode: this.isMoveOperation(previousDragEvent ?? e, targetGroup.id) ? 1 /* MergeGroupMode.MOVE_EDITORS */ : 0 /* MergeGroupMode.COPY_EDITORS */
        });
        targetGroup.focus();
    }
    async maybeCreateAuxiliaryEditorPartAt(e, offsetElement) {
        const { point, display } = await this.hostService.getCursorScreenPoint() ?? { point: { x: e.screenX, y: e.screenY } };
        const window = getActiveWindow();
        if (window.document.visibilityState === 'visible' && window.document.hasFocus()) {
            if (point.x >= window.screenX && point.x <= window.screenX + window.outerWidth && point.y >= window.screenY && point.y <= window.screenY + window.outerHeight) {
                return; // refuse to create as long as the mouse was released over active focused window to reduce chance of opening by accident
            }
        }
        const offsetX = offsetElement.offsetWidth / 2;
        const offsetY = 30 /* take title bar height into account (approximation) */ + offsetElement.offsetHeight / 2;
        const bounds = {
            x: point.x - offsetX,
            y: point.y - offsetY
        };
        if (display) {
            if (bounds.x < display.x) {
                bounds.x = display.x; // prevent overflow to the left
            }
            if (bounds.y < display.y) {
                bounds.y = display.y; // prevent overflow to the top
            }
        }
        return this.editorPartsView.createAuxiliaryEditorPart({ bounds });
    }
    isNewWindowOperation(e) {
        if (this.groupsView.partOptions.dragToOpenWindow) {
            return !e.altKey;
        }
        return e.altKey;
    }
    isMoveOperation(e, sourceGroup, sourceEditor) {
        if (sourceEditor?.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
            return true; // Singleton editors cannot be split
        }
        const isCopy = (e.ctrlKey && !isMacintosh) || (e.altKey && isMacintosh);
        return (!isCopy || sourceGroup === this.groupView.id);
    }
    doFillResourceDataTransfers(editors, e, disableStandardTransfer) {
        if (editors.length) {
            this.instantiationService.invokeFunction(fillEditorsDragData, editors.map(editor => ({ editor, groupId: this.groupView.id })), e, { disableStandardTransfer });
            return true;
        }
        return false;
    }
    onTabContextMenu(editor, e, node) {
        // Update contexts based on editor picked and remember previous to restore
        this.resourceContext.set(EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY }));
        this.editorPinnedContext.set(this.tabsModel.isPinned(editor));
        this.editorIsFirstContext.set(this.tabsModel.isFirst(editor));
        this.editorIsLastContext.set(this.tabsModel.isLast(editor));
        this.editorStickyContext.set(this.tabsModel.isSticky(editor));
        this.groupLockedContext.set(this.tabsModel.isLocked);
        this.editorCanSplitInGroupContext.set(editor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */));
        this.sideBySideEditorContext.set(editor.typeId === SideBySideEditorInput.ID);
        applyAvailableEditorIds(this.editorAvailableEditorIds, editor, this.editorResolverService);
        // Find target anchor
        let anchor = node;
        if (isMouseEvent(e)) {
            anchor = new StandardMouseEvent(getWindow(node), e);
        }
        // Show it
        this.contextMenuService.showContextMenu({
            getAnchor: () => anchor,
            menuId: MenuId.EditorTitleContext,
            menuActionOptions: { shouldForwardArgs: true, arg: this.resourceContext.get() },
            contextKeyService: this.contextMenuContextKeyService,
            getActionsContext: () => ({ groupId: this.groupView.id, editorIndex: this.groupView.getIndexOfEditor(editor) }),
            getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id, this.contextMenuContextKeyService),
            onHide: () => this.groupsView.activeGroup.focus() // restore focus to active group
        });
    }
    getKeybinding(action) {
        return this.keybindingService.lookupKeybinding(action.id, this.getEditorPaneAwareContextKeyService());
    }
    getKeybindingLabel(action) {
        const keybinding = this.getKeybinding(action);
        return keybinding ? keybinding.getLabel() ?? undefined : undefined;
    }
    get tabHeight() {
        return this.groupsView.partOptions.tabHeight !== 'compact' ? EditorTabsControl_1.EDITOR_TAB_HEIGHT.normal : EditorTabsControl_1.EDITOR_TAB_HEIGHT.compact;
    }
    getHoverTitle(editor) {
        const title = editor.getTitle(2 /* Verbosity.LONG */);
        if (!this.tabsModel.isPinned(editor)) {
            return {
                markdown: new MarkdownString('', { supportThemeIcons: true, isTrusted: true }).
                    appendText(title).
                    appendMarkdown(' (_preview_ [$(gear)](command:workbench.action.openSettings?%5B%22workbench.editor.enablePreview%22%5D "Configure Preview Mode"))'),
                markdownNotSupportedFallback: title + ' (preview)'
            };
        }
        return title;
    }
    updateTabHeight() {
        this.parent.style.setProperty('--editor-group-tab-height', `${this.tabHeight}px`);
    }
    updateOptions(oldOptions, newOptions) {
        // Update tab height
        if (oldOptions.tabHeight !== newOptions.tabHeight) {
            this.updateTabHeight();
        }
        // Update Editor Actions Toolbar
        if (oldOptions.editorActionsLocation !== newOptions.editorActionsLocation ||
            oldOptions.showTabs !== newOptions.showTabs) {
            if (this.editorActionsToolbarContainer) {
                this.handleEditorActionToolBarVisibility(this.editorActionsToolbarContainer);
                this.updateEditorActionsToolbar();
            }
        }
    }
};
EditorTabsControl = EditorTabsControl_1 = __decorate([
    __param(5, IContextMenuService),
    __param(6, IInstantiationService),
    __param(7, IContextKeyService),
    __param(8, IKeybindingService),
    __param(9, INotificationService),
    __param(10, IQuickInputService),
    __param(11, IThemeService),
    __param(12, IEditorResolverService),
    __param(13, IHostService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], EditorTabsControl);
export { EditorTabsControl };
