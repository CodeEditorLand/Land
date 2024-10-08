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
var DropOverlay_1;
import './media/editordroptarget.css';
import { DataTransfers } from '../../../../base/browser/dnd.js';
import { addDisposableListener, DragAndDropObserver, EventHelper, EventType, getWindow, isAncestor } from '../../../../base/browser/dom.js';
import { renderFormattedText } from '../../../../base/browser/formattedTextRenderer.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { isMacintosh, isWeb } from '../../../../base/common/platform.js';
import { assertAllDefined, assertIsDefined } from '../../../../base/common/types.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { activeContrastBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { isTemporaryWorkspace, IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { CodeDataTransfers, containsDragType, Extensions as DragAndDropExtensions, LocalSelectionTransfer } from '../../../../platform/dnd/browser/dnd.js';
import { DraggedEditorGroupIdentifier, DraggedEditorIdentifier, extractTreeDropData, ResourcesDropHandler } from '../../dnd.js';
import { fillActiveEditorViewState } from './editor.js';
import { EDITOR_DRAG_AND_DROP_BACKGROUND, EDITOR_DROP_INTO_PROMPT_BACKGROUND, EDITOR_DROP_INTO_PROMPT_BORDER, EDITOR_DROP_INTO_PROMPT_FOREGROUND } from '../../../common/theme.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ITreeViewsDnDService } from '../../../../editor/common/services/treeViewsDndService.js';
import { DraggedTreeItemsIdentifier } from '../../../../editor/common/services/treeViewsDnd.js';
function isDropIntoEditorEnabledGlobally(configurationService) {
    return configurationService.getValue('editor.dropIntoEditor.enabled');
}
function isDragIntoEditorEvent(e) {
    return e.shiftKey;
}
let DropOverlay = class DropOverlay extends Themable {
    static { DropOverlay_1 = this; }
    static { this.OVERLAY_ID = 'monaco-workbench-editor-drop-overlay'; }
    get disposed() { return !!this._disposed; }
    constructor(groupView, themeService, configurationService, instantiationService, editorService, editorGroupService, treeViewsDragAndDropService, contextService) {
        super(themeService);
        this.groupView = groupView;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.treeViewsDragAndDropService = treeViewsDragAndDropService;
        this.contextService = contextService;
        this.editorTransfer = LocalSelectionTransfer.getInstance();
        this.groupTransfer = LocalSelectionTransfer.getInstance();
        this.treeItemsTransfer = LocalSelectionTransfer.getInstance();
        this.cleanupOverlayScheduler = this._register(new RunOnceScheduler(() => this.dispose(), 300));
        this.enableDropIntoEditor = isDropIntoEditorEnabledGlobally(this.configurationService) && this.isDropIntoActiveEditorEnabled();
        this.create();
    }
    create() {
        const overlayOffsetHeight = this.getOverlayOffsetHeight();
        // Container
        const container = this.container = document.createElement('div');
        container.id = DropOverlay_1.OVERLAY_ID;
        container.style.top = `${overlayOffsetHeight}px`;
        // Parent
        this.groupView.element.appendChild(container);
        this.groupView.element.classList.add('dragged-over');
        this._register(toDisposable(() => {
            container.remove();
            this.groupView.element.classList.remove('dragged-over');
        }));
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.classList.add('editor-group-overlay-indicator');
        container.appendChild(this.overlay);
        if (this.enableDropIntoEditor) {
            this.dropIntoPromptElement = renderFormattedText(localize('dropIntoEditorPrompt', "Hold __{0}__ to drop into editor", isMacintosh ? '⇧' : 'Shift'), {});
            this.dropIntoPromptElement.classList.add('editor-group-overlay-drop-into-prompt');
            this.overlay.appendChild(this.dropIntoPromptElement);
        }
        // Overlay Event Handling
        this.registerListeners(container);
        // Styles
        this.updateStyles();
    }
    updateStyles() {
        const overlay = assertIsDefined(this.overlay);
        // Overlay drop background
        overlay.style.backgroundColor = this.getColor(EDITOR_DRAG_AND_DROP_BACKGROUND) || '';
        // Overlay contrast border (if any)
        const activeContrastBorderColor = this.getColor(activeContrastBorder);
        overlay.style.outlineColor = activeContrastBorderColor || '';
        overlay.style.outlineOffset = activeContrastBorderColor ? '-2px' : '';
        overlay.style.outlineStyle = activeContrastBorderColor ? 'dashed' : '';
        overlay.style.outlineWidth = activeContrastBorderColor ? '2px' : '';
        if (this.dropIntoPromptElement) {
            this.dropIntoPromptElement.style.backgroundColor = this.getColor(EDITOR_DROP_INTO_PROMPT_BACKGROUND) ?? '';
            this.dropIntoPromptElement.style.color = this.getColor(EDITOR_DROP_INTO_PROMPT_FOREGROUND) ?? '';
            const borderColor = this.getColor(EDITOR_DROP_INTO_PROMPT_BORDER);
            if (borderColor) {
                this.dropIntoPromptElement.style.borderWidth = '1px';
                this.dropIntoPromptElement.style.borderStyle = 'solid';
                this.dropIntoPromptElement.style.borderColor = borderColor;
            }
            else {
                this.dropIntoPromptElement.style.borderWidth = '0';
            }
        }
    }
    registerListeners(container) {
        this._register(new DragAndDropObserver(container, {
            onDragOver: e => {
                if (this.enableDropIntoEditor && isDragIntoEditorEvent(e)) {
                    this.dispose();
                    return;
                }
                const isDraggingGroup = this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype);
                const isDraggingEditor = this.editorTransfer.hasData(DraggedEditorIdentifier.prototype);
                // Update the dropEffect to "copy" if there is no local data to be dragged because
                // in that case we can only copy the data into and not move it from its source
                if (!isDraggingEditor && !isDraggingGroup && e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'copy';
                }
                // Find out if operation is valid
                let isCopy = true;
                if (isDraggingGroup) {
                    isCopy = this.isCopyOperation(e);
                }
                else if (isDraggingEditor) {
                    const data = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
                    if (Array.isArray(data) && data.length > 0) {
                        isCopy = this.isCopyOperation(e, data[0].identifier);
                    }
                }
                if (!isCopy) {
                    const sourceGroupView = this.findSourceGroupView();
                    if (sourceGroupView === this.groupView) {
                        if (isDraggingGroup || (isDraggingEditor && sourceGroupView.count < 2)) {
                            this.hideOverlay();
                            return; // do not allow to drop group/editor on itself if this results in an empty group
                        }
                    }
                }
                // Position overlay and conditionally enable or disable
                // editor group splitting support based on setting and
                // keymodifiers used.
                let splitOnDragAndDrop = !!this.editorGroupService.partOptions.splitOnDragAndDrop;
                if (this.isToggleSplitOperation(e)) {
                    splitOnDragAndDrop = !splitOnDragAndDrop;
                }
                this.positionOverlay(e.offsetX, e.offsetY, isDraggingGroup, splitOnDragAndDrop);
                // Make sure to stop any running cleanup scheduler to remove the overlay
                if (this.cleanupOverlayScheduler.isScheduled()) {
                    this.cleanupOverlayScheduler.cancel();
                }
            },
            onDragLeave: e => this.dispose(),
            onDragEnd: e => this.dispose(),
            onDrop: e => {
                EventHelper.stop(e, true);
                // Dispose overlay
                this.dispose();
                // Handle drop if we have a valid operation
                if (this.currentDropOperation) {
                    this.handleDrop(e, this.currentDropOperation.splitDirection);
                }
            }
        }));
        this._register(addDisposableListener(container, EventType.MOUSE_OVER, () => {
            // Under some circumstances we have seen reports where the drop overlay is not being
            // cleaned up and as such the editor area remains under the overlay so that you cannot
            // type into the editor anymore. This seems related to using VMs and DND via host and
            // guest OS, though some users also saw it without VMs.
            // To protect against this issue we always destroy the overlay as soon as we detect a
            // mouse event over it. The delay is used to guarantee we are not interfering with the
            // actual DROP event that can also trigger a mouse over event.
            if (!this.cleanupOverlayScheduler.isScheduled()) {
                this.cleanupOverlayScheduler.schedule();
            }
        }));
    }
    isDropIntoActiveEditorEnabled() {
        return !!this.groupView.activeEditor?.hasCapability(128 /* EditorInputCapabilities.CanDropIntoEditor */);
    }
    findSourceGroupView() {
        // Check for group transfer
        if (this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype)) {
            const data = this.groupTransfer.getData(DraggedEditorGroupIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                return this.editorGroupService.getGroup(data[0].identifier);
            }
        }
        // Check for editor transfer
        else if (this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
            const data = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                return this.editorGroupService.getGroup(data[0].identifier.groupId);
            }
        }
        return undefined;
    }
    async handleDrop(event, splitDirection) {
        // Determine target group
        const ensureTargetGroup = () => {
            let targetGroup;
            if (typeof splitDirection === 'number') {
                targetGroup = this.editorGroupService.addGroup(this.groupView, splitDirection);
            }
            else {
                targetGroup = this.groupView;
            }
            return targetGroup;
        };
        // Check for group transfer
        if (this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype)) {
            const data = this.groupTransfer.getData(DraggedEditorGroupIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                const sourceGroup = this.editorGroupService.getGroup(data[0].identifier);
                if (sourceGroup) {
                    if (typeof splitDirection !== 'number' && sourceGroup === this.groupView) {
                        return;
                    }
                    // Split to new group
                    let targetGroup;
                    if (typeof splitDirection === 'number') {
                        if (this.isCopyOperation(event)) {
                            targetGroup = this.editorGroupService.copyGroup(sourceGroup, this.groupView, splitDirection);
                        }
                        else {
                            targetGroup = this.editorGroupService.moveGroup(sourceGroup, this.groupView, splitDirection);
                        }
                    }
                    // Merge into existing group
                    else {
                        let mergeGroupOptions = undefined;
                        if (this.isCopyOperation(event)) {
                            mergeGroupOptions = { mode: 0 /* MergeGroupMode.COPY_EDITORS */ };
                        }
                        this.editorGroupService.mergeGroup(sourceGroup, this.groupView, mergeGroupOptions);
                    }
                    if (targetGroup) {
                        this.editorGroupService.activateGroup(targetGroup);
                    }
                }
                this.groupTransfer.clearData(DraggedEditorGroupIdentifier.prototype);
            }
        }
        // Check for editor transfer
        else if (this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
            const data = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                const draggedEditors = data;
                const firstDraggedEditor = data[0].identifier;
                const sourceGroup = this.editorGroupService.getGroup(firstDraggedEditor.groupId);
                if (sourceGroup) {
                    const copyEditor = this.isCopyOperation(event, firstDraggedEditor);
                    let targetGroup = undefined;
                    // Optimization: if we move the last editor of an editor group
                    // and we are configured to close empty editor groups, we can
                    // rather move the entire editor group according to the direction
                    if (this.editorGroupService.partOptions.closeEmptyGroups && sourceGroup.count === 1 && typeof splitDirection === 'number' && !copyEditor) {
                        targetGroup = this.editorGroupService.moveGroup(sourceGroup, this.groupView, splitDirection);
                    }
                    // In any other case do a normal move/copy operation
                    else {
                        targetGroup = ensureTargetGroup();
                        if (sourceGroup === targetGroup) {
                            return;
                        }
                        const editors = draggedEditors.map(draggedEditor => ({
                            editor: draggedEditor.identifier.editor,
                            options: fillActiveEditorViewState(sourceGroup, draggedEditor.identifier.editor, {
                                pinned: true, // always pin dropped editor
                                sticky: sourceGroup.isSticky(draggedEditor.identifier.editor) // preserve sticky state
                            })
                        }));
                        if (!copyEditor) {
                            sourceGroup.moveEditors(editors, targetGroup);
                        }
                        else {
                            sourceGroup.copyEditors(editors, targetGroup);
                        }
                    }
                    // Ensure target has focus
                    targetGroup.focus();
                }
                this.editorTransfer.clearData(DraggedEditorIdentifier.prototype);
            }
        }
        // Check for tree items
        else if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
            const data = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype);
            if (Array.isArray(data) && data.length > 0) {
                const editors = [];
                for (const id of data) {
                    const dataTransferItem = await this.treeViewsDragAndDropService.removeDragOperationTransfer(id.identifier);
                    if (dataTransferItem) {
                        const treeDropData = await extractTreeDropData(dataTransferItem);
                        editors.push(...treeDropData.map(editor => ({ ...editor, options: { ...editor.options, pinned: true } })));
                    }
                }
                if (editors.length) {
                    this.editorService.openEditors(editors, ensureTargetGroup(), { validateTrust: true });
                }
            }
            this.treeItemsTransfer.clearData(DraggedTreeItemsIdentifier.prototype);
        }
        // Check for URI transfer
        else {
            const dropHandler = this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: !isWeb || isTemporaryWorkspace(this.contextService.getWorkspace()) });
            dropHandler.handleDrop(event, getWindow(this.groupView.element), () => ensureTargetGroup(), targetGroup => targetGroup?.focus());
        }
    }
    isCopyOperation(e, draggedEditor) {
        if (draggedEditor?.editor.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
            return false; // Singleton editors cannot be split
        }
        return (e.ctrlKey && !isMacintosh) || (e.altKey && isMacintosh);
    }
    isToggleSplitOperation(e) {
        return (e.altKey && !isMacintosh) || (e.shiftKey && isMacintosh);
    }
    positionOverlay(mousePosX, mousePosY, isDraggingGroup, enableSplitting) {
        const preferSplitVertically = this.editorGroupService.partOptions.openSideBySideDirection === 'right';
        const editorControlWidth = this.groupView.element.clientWidth;
        const editorControlHeight = this.groupView.element.clientHeight - this.getOverlayOffsetHeight();
        let edgeWidthThresholdFactor;
        let edgeHeightThresholdFactor;
        if (enableSplitting) {
            if (isDraggingGroup) {
                edgeWidthThresholdFactor = preferSplitVertically ? 0.3 : 0.1; // give larger threshold when dragging group depending on preferred split direction
            }
            else {
                edgeWidthThresholdFactor = 0.1; // 10% threshold to split if dragging editors
            }
            if (isDraggingGroup) {
                edgeHeightThresholdFactor = preferSplitVertically ? 0.1 : 0.3; // give larger threshold when dragging group depending on preferred split direction
            }
            else {
                edgeHeightThresholdFactor = 0.1; // 10% threshold to split if dragging editors
            }
        }
        else {
            edgeWidthThresholdFactor = 0;
            edgeHeightThresholdFactor = 0;
        }
        const edgeWidthThreshold = editorControlWidth * edgeWidthThresholdFactor;
        const edgeHeightThreshold = editorControlHeight * edgeHeightThresholdFactor;
        const splitWidthThreshold = editorControlWidth / 3; // offer to split left/right at 33%
        const splitHeightThreshold = editorControlHeight / 3; // offer to split up/down at 33%
        // No split if mouse is above certain threshold in the center of the view
        let splitDirection;
        if (mousePosX > edgeWidthThreshold && mousePosX < editorControlWidth - edgeWidthThreshold &&
            mousePosY > edgeHeightThreshold && mousePosY < editorControlHeight - edgeHeightThreshold) {
            splitDirection = undefined;
        }
        // Offer to split otherwise
        else {
            // User prefers to split vertically: offer a larger hitzone
            // for this direction like so:
            // ----------------------------------------------
            // |		|		SPLIT UP		|			|
            // | SPLIT 	|-----------------------|	SPLIT	|
            // |		|		  MERGE			|			|
            // | LEFT	|-----------------------|	RIGHT	|
            // |		|		SPLIT DOWN		|			|
            // ----------------------------------------------
            if (preferSplitVertically) {
                if (mousePosX < splitWidthThreshold) {
                    splitDirection = 2 /* GroupDirection.LEFT */;
                }
                else if (mousePosX > splitWidthThreshold * 2) {
                    splitDirection = 3 /* GroupDirection.RIGHT */;
                }
                else if (mousePosY < editorControlHeight / 2) {
                    splitDirection = 0 /* GroupDirection.UP */;
                }
                else {
                    splitDirection = 1 /* GroupDirection.DOWN */;
                }
            }
            // User prefers to split horizontally: offer a larger hitzone
            // for this direction like so:
            // ----------------------------------------------
            // |				SPLIT UP					|
            // |--------------------------------------------|
            // |  SPLIT LEFT  |	   MERGE	|  SPLIT RIGHT  |
            // |--------------------------------------------|
            // |				SPLIT DOWN					|
            // ----------------------------------------------
            else {
                if (mousePosY < splitHeightThreshold) {
                    splitDirection = 0 /* GroupDirection.UP */;
                }
                else if (mousePosY > splitHeightThreshold * 2) {
                    splitDirection = 1 /* GroupDirection.DOWN */;
                }
                else if (mousePosX < editorControlWidth / 2) {
                    splitDirection = 2 /* GroupDirection.LEFT */;
                }
                else {
                    splitDirection = 3 /* GroupDirection.RIGHT */;
                }
            }
        }
        // Draw overlay based on split direction
        switch (splitDirection) {
            case 0 /* GroupDirection.UP */:
                this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '50%' });
                this.toggleDropIntoPrompt(false);
                break;
            case 1 /* GroupDirection.DOWN */:
                this.doPositionOverlay({ top: '50%', left: '0', width: '100%', height: '50%' });
                this.toggleDropIntoPrompt(false);
                break;
            case 2 /* GroupDirection.LEFT */:
                this.doPositionOverlay({ top: '0', left: '0', width: '50%', height: '100%' });
                this.toggleDropIntoPrompt(false);
                break;
            case 3 /* GroupDirection.RIGHT */:
                this.doPositionOverlay({ top: '0', left: '50%', width: '50%', height: '100%' });
                this.toggleDropIntoPrompt(false);
                break;
            default:
                this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '100%' });
                this.toggleDropIntoPrompt(true);
        }
        // Make sure the overlay is visible now
        const overlay = assertIsDefined(this.overlay);
        overlay.style.opacity = '1';
        // Enable transition after a timeout to prevent initial animation
        setTimeout(() => overlay.classList.add('overlay-move-transition'), 0);
        // Remember as current split direction
        this.currentDropOperation = { splitDirection };
    }
    doPositionOverlay(options) {
        const [container, overlay] = assertAllDefined(this.container, this.overlay);
        // Container
        const offsetHeight = this.getOverlayOffsetHeight();
        if (offsetHeight) {
            container.style.height = `calc(100% - ${offsetHeight}px)`;
        }
        else {
            container.style.height = '100%';
        }
        // Overlay
        overlay.style.top = options.top;
        overlay.style.left = options.left;
        overlay.style.width = options.width;
        overlay.style.height = options.height;
    }
    getOverlayOffsetHeight() {
        // With tabs and opened editors: use the area below tabs as drop target
        if (!this.groupView.isEmpty && this.editorGroupService.partOptions.showTabs === 'multiple') {
            return this.groupView.titleHeight.offset;
        }
        // Without tabs or empty group: use entire editor area as drop target
        return 0;
    }
    hideOverlay() {
        const overlay = assertIsDefined(this.overlay);
        // Reset overlay
        this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '100%' });
        overlay.style.opacity = '0';
        overlay.classList.remove('overlay-move-transition');
        // Reset current operation
        this.currentDropOperation = undefined;
    }
    toggleDropIntoPrompt(showing) {
        if (!this.dropIntoPromptElement) {
            return;
        }
        this.dropIntoPromptElement.style.opacity = showing ? '1' : '0';
    }
    contains(element) {
        return element === this.container || element === this.overlay;
    }
    dispose() {
        super.dispose();
        this._disposed = true;
    }
};
DropOverlay = DropOverlay_1 = __decorate([
    __param(1, IThemeService),
    __param(2, IConfigurationService),
    __param(3, IInstantiationService),
    __param(4, IEditorService),
    __param(5, IEditorGroupsService),
    __param(6, ITreeViewsDnDService),
    __param(7, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], DropOverlay);
let EditorDropTarget = class EditorDropTarget extends Themable {
    constructor(container, delegate, editorGroupService, themeService, configurationService, instantiationService) {
        super(themeService);
        this.container = container;
        this.delegate = delegate;
        this.editorGroupService = editorGroupService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.counter = 0;
        this.editorTransfer = LocalSelectionTransfer.getInstance();
        this.groupTransfer = LocalSelectionTransfer.getInstance();
        this.registerListeners();
    }
    get overlay() {
        if (this._overlay && !this._overlay.disposed) {
            return this._overlay;
        }
        return undefined;
    }
    registerListeners() {
        this._register(addDisposableListener(this.container, EventType.DRAG_ENTER, e => this.onDragEnter(e)));
        this._register(addDisposableListener(this.container, EventType.DRAG_LEAVE, () => this.onDragLeave()));
        for (const target of [this.container, getWindow(this.container)]) {
            this._register(addDisposableListener(target, EventType.DRAG_END, () => this.onDragEnd()));
        }
    }
    onDragEnter(event) {
        if (isDropIntoEditorEnabledGlobally(this.configurationService) && isDragIntoEditorEvent(event)) {
            return;
        }
        this.counter++;
        // Validate transfer
        if (!this.editorTransfer.hasData(DraggedEditorIdentifier.prototype) &&
            !this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype) &&
            event.dataTransfer) {
            const dndContributions = Registry.as(DragAndDropExtensions.DragAndDropContribution).getAll();
            const dndContributionKeys = Array.from(dndContributions).map(e => e.dataFormatKey);
            if (!containsDragType(event, DataTransfers.FILES, CodeDataTransfers.FILES, DataTransfers.RESOURCES, CodeDataTransfers.EDITORS, ...dndContributionKeys)) { // see https://github.com/microsoft/vscode/issues/25789
                event.dataTransfer.dropEffect = 'none';
                return; // unsupported transfer
            }
        }
        // Signal DND start
        this.updateContainer(true);
        const target = event.target;
        if (target) {
            // Somehow we managed to move the mouse quickly out of the current overlay, so destroy it
            if (this.overlay && !this.overlay.contains(target)) {
                this.disposeOverlay();
            }
            // Create overlay over target
            if (!this.overlay) {
                const targetGroupView = this.findTargetGroupView(target);
                if (targetGroupView) {
                    this._overlay = this.instantiationService.createInstance(DropOverlay, targetGroupView);
                }
            }
        }
    }
    onDragLeave() {
        this.counter--;
        if (this.counter === 0) {
            this.updateContainer(false);
        }
    }
    onDragEnd() {
        this.counter = 0;
        this.updateContainer(false);
        this.disposeOverlay();
    }
    findTargetGroupView(child) {
        const groups = this.editorGroupService.groups;
        return groups.find(groupView => isAncestor(child, groupView.element) || this.delegate.containsGroup?.(groupView));
    }
    updateContainer(isDraggedOver) {
        this.container.classList.toggle('dragged-over', isDraggedOver);
    }
    dispose() {
        super.dispose();
        this.disposeOverlay();
    }
    disposeOverlay() {
        if (this.overlay) {
            this.overlay.dispose();
            this._overlay = undefined;
        }
    }
};
EditorDropTarget = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IThemeService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object])
], EditorDropTarget);
export { EditorDropTarget };
