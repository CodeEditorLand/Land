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
var EditorPart_1;
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { Part } from '../../part.js';
import { Dimension, $, EventHelper, addDisposableGenericMouseDownListener, getWindow, isAncestorOfActiveElement, getActiveElement, isHTMLElement } from '../../../../base/browser/dom.js';
import { Event, Emitter, Relay, PauseableEmitter } from '../../../../base/common/event.js';
import { contrastBorder, editorBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { orthogonal, SerializableGrid, Sizing, isGridBranchNode, createSerializedGrid } from '../../../../base/browser/ui/grid/grid.js';
import { EDITOR_GROUP_BORDER, EDITOR_PANE_BACKGROUND } from '../../../common/theme.js';
import { distinct, coalesce } from '../../../../base/common/arrays.js';
import { getEditorPartOptions, impactsEditorPartOptions } from './editor.js';
import { EditorGroupView } from './editorGroupView.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { dispose, toDisposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { isSerializedEditorGroupModel } from '../../../common/editor/editorGroupModel.js';
import { EditorDropTarget } from './editorDropTarget.js';
import { Color } from '../../../../base/common/color.js';
import { CenteredViewLayout } from '../../../../base/browser/ui/centered/centeredViewLayout.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { assertIsDefined, assertType } from '../../../../base/common/types.js';
import { CompositeDragAndDropObserver } from '../../dnd.js';
import { DeferredPromise, Promises } from '../../../../base/common/async.js';
import { findGroup } from '../../../services/editor/common/editorGroupFinder.js';
import { SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { EditorPartMaximizedEditorGroupContext, EditorPartMultipleEditorGroupsContext, IsAuxiliaryEditorPartContext } from '../../../common/contextkeys.js';
import { mainWindow } from '../../../../base/browser/window.js';
class GridWidgetView {
    constructor() {
        this.element = $('.grid-view-container');
        this._onDidChange = new Relay();
        this.onDidChange = this._onDidChange.event;
    }
    get minimumWidth() { return this.gridWidget ? this.gridWidget.minimumWidth : 0; }
    get maximumWidth() { return this.gridWidget ? this.gridWidget.maximumWidth : Number.POSITIVE_INFINITY; }
    get minimumHeight() { return this.gridWidget ? this.gridWidget.minimumHeight : 0; }
    get maximumHeight() { return this.gridWidget ? this.gridWidget.maximumHeight : Number.POSITIVE_INFINITY; }
    get gridWidget() {
        return this._gridWidget;
    }
    set gridWidget(grid) {
        this.element.innerText = '';
        if (grid) {
            this.element.appendChild(grid.element);
            this._onDidChange.input = grid.onDidChange;
        }
        else {
            this._onDidChange.input = Event.None;
        }
        this._gridWidget = grid;
    }
    layout(width, height, top, left) {
        this.gridWidget?.layout(width, height, top, left);
    }
    dispose() {
        this._onDidChange.dispose();
    }
}
let EditorPart = class EditorPart extends Part {
    static { EditorPart_1 = this; }
    static { this.EDITOR_PART_UI_STATE_STORAGE_KEY = 'editorpart.state'; }
    static { this.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY = 'editorpart.centeredview'; }
    constructor(editorPartsView, id, groupsLabel, windowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
        super(id, { hasTitle: false }, themeService, storageService, layoutService);
        this.editorPartsView = editorPartsView;
        this.groupsLabel = groupsLabel;
        this.windowId = windowId;
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this.hostService = hostService;
        this.contextKeyService = contextKeyService;
        //#region Events
        this._onDidFocus = this._register(new Emitter());
        this.onDidFocus = this._onDidFocus.event;
        this._onDidLayout = this._register(new Emitter());
        this.onDidLayout = this._onDidLayout.event;
        this._onDidChangeActiveGroup = this._register(new Emitter());
        this.onDidChangeActiveGroup = this._onDidChangeActiveGroup.event;
        this._onDidChangeGroupIndex = this._register(new Emitter());
        this.onDidChangeGroupIndex = this._onDidChangeGroupIndex.event;
        this._onDidChangeGroupLabel = this._register(new Emitter());
        this.onDidChangeGroupLabel = this._onDidChangeGroupLabel.event;
        this._onDidChangeGroupLocked = this._register(new Emitter());
        this.onDidChangeGroupLocked = this._onDidChangeGroupLocked.event;
        this._onDidChangeGroupMaximized = this._register(new Emitter());
        this.onDidChangeGroupMaximized = this._onDidChangeGroupMaximized.event;
        this._onDidActivateGroup = this._register(new Emitter());
        this.onDidActivateGroup = this._onDidActivateGroup.event;
        this._onDidAddGroup = this._register(new PauseableEmitter());
        this.onDidAddGroup = this._onDidAddGroup.event;
        this._onDidRemoveGroup = this._register(new PauseableEmitter());
        this.onDidRemoveGroup = this._onDidRemoveGroup.event;
        this._onDidMoveGroup = this._register(new Emitter());
        this.onDidMoveGroup = this._onDidMoveGroup.event;
        this.onDidSetGridWidget = this._register(new Emitter());
        this._onDidChangeSizeConstraints = this._register(new Relay());
        this.onDidChangeSizeConstraints = Event.any(this.onDidSetGridWidget.event, this._onDidChangeSizeConstraints.event);
        this._onDidScroll = this._register(new Relay());
        this.onDidScroll = Event.any(this.onDidSetGridWidget.event, this._onDidScroll.event);
        this._onDidChangeEditorPartOptions = this._register(new Emitter());
        this.onDidChangeEditorPartOptions = this._onDidChangeEditorPartOptions.event;
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        //#endregion
        this.workspaceMemento = this.getMemento(1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        this.profileMemento = this.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        this.groupViews = new Map();
        this.mostRecentActiveGroups = [];
        this.gridWidgetDisposables = this._register(new DisposableStore());
        this.gridWidgetView = this._register(new GridWidgetView());
        this.enforcedPartOptions = [];
        this._partOptions = getEditorPartOptions(this.configurationService, this.themeService);
        this.top = 0;
        this.left = 0;
        this.sideGroup = {
            openEditor: (editor, options) => {
                const [group] = this.scopedInstantiationService.invokeFunction(accessor => findGroup(accessor, { editor, options }, SIDE_GROUP));
                return group.openEditor(editor, options);
            }
        };
        this._isReady = false;
        this.whenReadyPromise = new DeferredPromise();
        this.whenReady = this.whenReadyPromise.p;
        this.whenRestoredPromise = new DeferredPromise();
        this.whenRestored = this.whenRestoredPromise.p;
        this._willRestoreState = false;
        this.priority = 2 /* LayoutPriority.High */;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        this._register(this.themeService.onDidFileIconThemeChange(() => this.handleChangedPartOptions()));
        this._register(this.onDidChangeMementoValue(1 /* StorageScope.WORKSPACE */, this._store)(e => this.onDidChangeMementoState(e)));
    }
    onConfigurationUpdated(event) {
        if (impactsEditorPartOptions(event)) {
            this.handleChangedPartOptions();
        }
    }
    handleChangedPartOptions() {
        const oldPartOptions = this._partOptions;
        const newPartOptions = getEditorPartOptions(this.configurationService, this.themeService);
        for (const enforcedPartOptions of this.enforcedPartOptions) {
            Object.assign(newPartOptions, enforcedPartOptions); // check for overrides
        }
        this._partOptions = newPartOptions;
        this._onDidChangeEditorPartOptions.fire({ oldPartOptions, newPartOptions });
    }
    get partOptions() { return this._partOptions; }
    enforcePartOptions(options) {
        this.enforcedPartOptions.push(options);
        this.handleChangedPartOptions();
        return toDisposable(() => {
            this.enforcedPartOptions.splice(this.enforcedPartOptions.indexOf(options), 1);
            this.handleChangedPartOptions();
        });
    }
    get contentDimension() { return this._contentDimension; }
    get activeGroup() {
        return this._activeGroup;
    }
    get groups() {
        return Array.from(this.groupViews.values());
    }
    get count() {
        return this.groupViews.size;
    }
    get orientation() {
        return (this.gridWidget && this.gridWidget.orientation === 0 /* Orientation.VERTICAL */) ? 1 /* GroupOrientation.VERTICAL */ : 0 /* GroupOrientation.HORIZONTAL */;
    }
    get isReady() { return this._isReady; }
    get hasRestorableState() {
        return !!this.workspaceMemento[EditorPart_1.EDITOR_PART_UI_STATE_STORAGE_KEY];
    }
    get willRestoreState() { return this._willRestoreState; }
    getGroups(order = 0 /* GroupsOrder.CREATION_TIME */) {
        switch (order) {
            case 0 /* GroupsOrder.CREATION_TIME */:
                return this.groups;
            case 1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */: {
                const mostRecentActive = coalesce(this.mostRecentActiveGroups.map(groupId => this.getGroup(groupId)));
                // there can be groups that got never active, even though they exist. in this case
                // make sure to just append them at the end so that all groups are returned properly
                return distinct([...mostRecentActive, ...this.groups]);
            }
            case 2 /* GroupsOrder.GRID_APPEARANCE */: {
                const views = [];
                if (this.gridWidget) {
                    this.fillGridNodes(views, this.gridWidget.getViews());
                }
                return views;
            }
        }
    }
    fillGridNodes(target, node) {
        if (isGridBranchNode(node)) {
            node.children.forEach(child => this.fillGridNodes(target, child));
        }
        else {
            target.push(node.view);
        }
    }
    hasGroup(identifier) {
        return this.groupViews.has(identifier);
    }
    getGroup(identifier) {
        return this.groupViews.get(identifier);
    }
    findGroup(scope, source = this.activeGroup, wrap) {
        // by direction
        if (typeof scope.direction === 'number') {
            return this.doFindGroupByDirection(scope.direction, source, wrap);
        }
        // by location
        if (typeof scope.location === 'number') {
            return this.doFindGroupByLocation(scope.location, source, wrap);
        }
        throw new Error('invalid arguments');
    }
    doFindGroupByDirection(direction, source, wrap) {
        const sourceGroupView = this.assertGroupView(source);
        // Find neighbours and sort by our MRU list
        const neighbours = this.gridWidget.getNeighborViews(sourceGroupView, this.toGridViewDirection(direction), wrap);
        neighbours.sort(((n1, n2) => this.mostRecentActiveGroups.indexOf(n1.id) - this.mostRecentActiveGroups.indexOf(n2.id)));
        return neighbours[0];
    }
    doFindGroupByLocation(location, source, wrap) {
        const sourceGroupView = this.assertGroupView(source);
        const groups = this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
        const index = groups.indexOf(sourceGroupView);
        switch (location) {
            case 0 /* GroupLocation.FIRST */:
                return groups[0];
            case 1 /* GroupLocation.LAST */:
                return groups[groups.length - 1];
            case 2 /* GroupLocation.NEXT */: {
                let nextGroup = groups[index + 1];
                if (!nextGroup && wrap) {
                    nextGroup = this.doFindGroupByLocation(0 /* GroupLocation.FIRST */, source);
                }
                return nextGroup;
            }
            case 3 /* GroupLocation.PREVIOUS */: {
                let previousGroup = groups[index - 1];
                if (!previousGroup && wrap) {
                    previousGroup = this.doFindGroupByLocation(1 /* GroupLocation.LAST */, source);
                }
                return previousGroup;
            }
        }
    }
    activateGroup(group, preserveWindowOrder) {
        const groupView = this.assertGroupView(group);
        this.doSetGroupActive(groupView);
        // Ensure window on top unless disabled
        if (!preserveWindowOrder) {
            this.hostService.moveTop(getWindow(this.element));
        }
        return groupView;
    }
    restoreGroup(group) {
        const groupView = this.assertGroupView(group);
        this.doRestoreGroup(groupView);
        return groupView;
    }
    getSize(group) {
        const groupView = this.assertGroupView(group);
        return this.gridWidget.getViewSize(groupView);
    }
    setSize(group, size) {
        const groupView = this.assertGroupView(group);
        this.gridWidget.resizeView(groupView, size);
    }
    arrangeGroups(arrangement, target = this.activeGroup) {
        if (this.count < 2) {
            return; // require at least 2 groups to show
        }
        if (!this.gridWidget) {
            return; // we have not been created yet
        }
        const groupView = this.assertGroupView(target);
        switch (arrangement) {
            case 2 /* GroupsArrangement.EVEN */:
                this.gridWidget.distributeViewSizes();
                break;
            case 0 /* GroupsArrangement.MAXIMIZE */:
                if (this.groups.length < 2) {
                    return; // need at least 2 groups to be maximized
                }
                this.gridWidget.maximizeView(groupView);
                groupView.focus();
                break;
            case 1 /* GroupsArrangement.EXPAND */:
                this.gridWidget.expandView(groupView);
                break;
        }
    }
    toggleMaximizeGroup(target = this.activeGroup) {
        if (this.hasMaximizedGroup()) {
            this.unmaximizeGroup();
        }
        else {
            this.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */, target);
        }
    }
    toggleExpandGroup(target = this.activeGroup) {
        if (this.isGroupExpanded(this.activeGroup)) {
            this.arrangeGroups(2 /* GroupsArrangement.EVEN */);
        }
        else {
            this.arrangeGroups(1 /* GroupsArrangement.EXPAND */, target);
        }
    }
    unmaximizeGroup() {
        this.gridWidget.exitMaximizedView();
        this._activeGroup.focus(); // When making views visible the focus can be affected, so restore it
    }
    hasMaximizedGroup() {
        return this.gridWidget.hasMaximizedView();
    }
    isGroupMaximized(targetGroup) {
        return this.gridWidget.isViewMaximized(targetGroup);
    }
    isGroupExpanded(targetGroup) {
        return this.gridWidget.isViewExpanded(targetGroup);
    }
    setGroupOrientation(orientation) {
        if (!this.gridWidget) {
            return; // we have not been created yet
        }
        const newOrientation = (orientation === 0 /* GroupOrientation.HORIZONTAL */) ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
        if (this.gridWidget.orientation !== newOrientation) {
            this.gridWidget.orientation = newOrientation;
        }
    }
    applyLayout(layout) {
        const restoreFocus = this.shouldRestoreFocus(this.container);
        // Determine how many groups we need overall
        let layoutGroupsCount = 0;
        function countGroups(groups) {
            for (const group of groups) {
                if (Array.isArray(group.groups)) {
                    countGroups(group.groups);
                }
                else {
                    layoutGroupsCount++;
                }
            }
        }
        countGroups(layout.groups);
        // If we currently have too many groups, merge them into the last one
        let currentGroupViews = this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
        if (layoutGroupsCount < currentGroupViews.length) {
            const lastGroupInLayout = currentGroupViews[layoutGroupsCount - 1];
            currentGroupViews.forEach((group, index) => {
                if (index >= layoutGroupsCount) {
                    this.mergeGroup(group, lastGroupInLayout);
                }
            });
            currentGroupViews = this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
        }
        const activeGroup = this.activeGroup;
        // Prepare grid descriptor to create new grid from
        const gridDescriptor = createSerializedGrid({
            orientation: this.toGridViewOrientation(layout.orientation, this.isTwoDimensionalGrid() ?
                this.gridWidget.orientation : // preserve original orientation for 2-dimensional grids
                orthogonal(this.gridWidget.orientation) // otherwise flip (fix https://github.com/microsoft/vscode/issues/52975)
            ),
            groups: layout.groups
        });
        // Recreate gridwidget with descriptor
        this.doApplyGridState(gridDescriptor, activeGroup.id, currentGroupViews);
        // Restore focus as needed
        if (restoreFocus) {
            this._activeGroup.focus();
        }
    }
    getLayout() {
        // Example return value:
        // { orientation: 0, groups: [ { groups: [ { size: 0.4 }, { size: 0.6 } ], size: 0.5 }, { groups: [ {}, {} ], size: 0.5 } ] }
        const serializedGrid = this.gridWidget.serialize();
        const orientation = serializedGrid.orientation === 1 /* Orientation.HORIZONTAL */ ? 0 /* GroupOrientation.HORIZONTAL */ : 1 /* GroupOrientation.VERTICAL */;
        const root = this.serializedNodeToGroupLayoutArgument(serializedGrid.root);
        return {
            orientation,
            groups: root.groups
        };
    }
    serializedNodeToGroupLayoutArgument(serializedNode) {
        if (serializedNode.type === 'branch') {
            return {
                size: serializedNode.size,
                groups: serializedNode.data.map(node => this.serializedNodeToGroupLayoutArgument(node))
            };
        }
        return { size: serializedNode.size };
    }
    shouldRestoreFocus(target) {
        if (!target) {
            return false;
        }
        const activeElement = getActiveElement();
        if (activeElement === target.ownerDocument.body) {
            return true; // always restore focus if nothing is focused currently
        }
        // otherwise check for the active element being an ancestor of the target
        return isAncestorOfActiveElement(target);
    }
    isTwoDimensionalGrid() {
        const views = this.gridWidget.getViews();
        if (isGridBranchNode(views)) {
            // the grid is 2-dimensional if any children
            // of the grid is a branch node
            return views.children.some(child => isGridBranchNode(child));
        }
        return false;
    }
    addGroup(location, direction, groupToCopy) {
        const locationView = this.assertGroupView(location);
        let newGroupView;
        // Same groups view: add to grid widget directly
        if (locationView.groupsView === this) {
            const restoreFocus = this.shouldRestoreFocus(locationView.element);
            const shouldExpand = this.groupViews.size > 1 && this.isGroupExpanded(locationView);
            newGroupView = this.doCreateGroupView(groupToCopy);
            // Add to grid widget
            this.gridWidget.addView(newGroupView, this.getSplitSizingStyle(), locationView, this.toGridViewDirection(direction));
            // Update container
            this.updateContainer();
            // Event
            this._onDidAddGroup.fire(newGroupView);
            // Notify group index change given a new group was added
            this.notifyGroupIndexChange();
            // Expand new group, if the reference view was previously expanded
            if (shouldExpand) {
                this.arrangeGroups(1 /* GroupsArrangement.EXPAND */, newGroupView);
            }
            // Restore focus if we had it previously after completing the grid
            // operation. That operation might cause reparenting of grid views
            // which moves focus to the <body> element otherwise.
            if (restoreFocus) {
                locationView.focus();
            }
        }
        // Different group view: add to grid widget of that group
        else {
            newGroupView = locationView.groupsView.addGroup(locationView, direction, groupToCopy);
        }
        return newGroupView;
    }
    getSplitSizingStyle() {
        switch (this._partOptions.splitSizing) {
            case 'distribute':
                return Sizing.Distribute;
            case 'split':
                return Sizing.Split;
            default:
                return Sizing.Auto;
        }
    }
    doCreateGroupView(from, options) {
        // Create group view
        let groupView;
        if (from instanceof EditorGroupView) {
            groupView = EditorGroupView.createCopy(from, this.editorPartsView, this, this.groupsLabel, this.count, this.scopedInstantiationService, options);
        }
        else if (isSerializedEditorGroupModel(from)) {
            groupView = EditorGroupView.createFromSerialized(from, this.editorPartsView, this, this.groupsLabel, this.count, this.scopedInstantiationService, options);
        }
        else {
            groupView = EditorGroupView.createNew(this.editorPartsView, this, this.groupsLabel, this.count, this.scopedInstantiationService, options);
        }
        // Keep in map
        this.groupViews.set(groupView.id, groupView);
        // Track focus
        const groupDisposables = new DisposableStore();
        groupDisposables.add(groupView.onDidFocus(() => {
            this.doSetGroupActive(groupView);
            this._onDidFocus.fire();
        }));
        // Track group changes
        groupDisposables.add(groupView.onDidModelChange(e => {
            switch (e.kind) {
                case 3 /* GroupModelChangeKind.GROUP_LOCKED */:
                    this._onDidChangeGroupLocked.fire(groupView);
                    break;
                case 1 /* GroupModelChangeKind.GROUP_INDEX */:
                    this._onDidChangeGroupIndex.fire(groupView);
                    break;
                case 2 /* GroupModelChangeKind.GROUP_LABEL */:
                    this._onDidChangeGroupLabel.fire(groupView);
                    break;
            }
        }));
        // Track active editor change after it occurred
        groupDisposables.add(groupView.onDidActiveEditorChange(() => {
            this.updateContainer();
        }));
        // Track dispose
        Event.once(groupView.onWillDispose)(() => {
            dispose(groupDisposables);
            this.groupViews.delete(groupView.id);
            this.doUpdateMostRecentActive(groupView);
        });
        return groupView;
    }
    doSetGroupActive(group) {
        if (this._activeGroup !== group) {
            const previousActiveGroup = this._activeGroup;
            this._activeGroup = group;
            // Update list of most recently active groups
            this.doUpdateMostRecentActive(group, true);
            // Mark previous one as inactive
            if (previousActiveGroup && !previousActiveGroup.disposed) {
                previousActiveGroup.setActive(false);
            }
            // Mark group as new active
            group.setActive(true);
            // Expand the group if it is currently minimized
            this.doRestoreGroup(group);
            // Event
            this._onDidChangeActiveGroup.fire(group);
        }
        // Always fire the event that a group has been activated
        // even if its the same group that is already active to
        // signal the intent even when nothing has changed.
        this._onDidActivateGroup.fire(group);
    }
    doRestoreGroup(group) {
        if (!this.gridWidget) {
            return; // method is called as part of state restore very early
        }
        if (this.hasMaximizedGroup() && !this.isGroupMaximized(group)) {
            this.unmaximizeGroup();
        }
        try {
            const viewSize = this.gridWidget.getViewSize(group);
            if (viewSize.width === group.minimumWidth || viewSize.height === group.minimumHeight) {
                this.arrangeGroups(1 /* GroupsArrangement.EXPAND */, group);
            }
        }
        catch (error) {
            // ignore: method might be called too early before view is known to grid
        }
    }
    doUpdateMostRecentActive(group, makeMostRecentlyActive) {
        const index = this.mostRecentActiveGroups.indexOf(group.id);
        // Remove from MRU list
        if (index !== -1) {
            this.mostRecentActiveGroups.splice(index, 1);
        }
        // Add to front as needed
        if (makeMostRecentlyActive) {
            this.mostRecentActiveGroups.unshift(group.id);
        }
    }
    toGridViewDirection(direction) {
        switch (direction) {
            case 0 /* GroupDirection.UP */: return 0 /* Direction.Up */;
            case 1 /* GroupDirection.DOWN */: return 1 /* Direction.Down */;
            case 2 /* GroupDirection.LEFT */: return 2 /* Direction.Left */;
            case 3 /* GroupDirection.RIGHT */: return 3 /* Direction.Right */;
        }
    }
    toGridViewOrientation(orientation, fallback) {
        if (typeof orientation === 'number') {
            return orientation === 0 /* GroupOrientation.HORIZONTAL */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
        }
        return fallback;
    }
    removeGroup(group, preserveFocus) {
        const groupView = this.assertGroupView(group);
        if (this.count === 1) {
            return; // Cannot remove the last root group
        }
        // Remove empty group
        if (groupView.isEmpty) {
            this.doRemoveEmptyGroup(groupView, preserveFocus);
        }
        // Remove group with editors
        else {
            this.doRemoveGroupWithEditors(groupView);
        }
    }
    doRemoveGroupWithEditors(groupView) {
        const mostRecentlyActiveGroups = this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
        let lastActiveGroup;
        if (this._activeGroup === groupView) {
            lastActiveGroup = mostRecentlyActiveGroups[1];
        }
        else {
            lastActiveGroup = mostRecentlyActiveGroups[0];
        }
        // Removing a group with editors should merge these editors into the
        // last active group and then remove this group.
        this.mergeGroup(groupView, lastActiveGroup);
    }
    doRemoveEmptyGroup(groupView, preserveFocus) {
        const restoreFocus = !preserveFocus && this.shouldRestoreFocus(this.container);
        // Activate next group if the removed one was active
        if (this._activeGroup === groupView) {
            const mostRecentlyActiveGroups = this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            const nextActiveGroup = mostRecentlyActiveGroups[1]; // [0] will be the current group we are about to dispose
            this.doSetGroupActive(nextActiveGroup);
        }
        // Remove from grid widget & dispose
        this.gridWidget.removeView(groupView, this.getSplitSizingStyle());
        groupView.dispose();
        // Restore focus if we had it previously after completing the grid
        // operation. That operation might cause reparenting of grid views
        // which moves focus to the <body> element otherwise.
        if (restoreFocus) {
            this._activeGroup.focus();
        }
        // Notify group index change given a group was removed
        this.notifyGroupIndexChange();
        // Update container
        this.updateContainer();
        // Event
        this._onDidRemoveGroup.fire(groupView);
    }
    moveGroup(group, location, direction) {
        const sourceView = this.assertGroupView(group);
        const targetView = this.assertGroupView(location);
        if (sourceView.id === targetView.id) {
            throw new Error('Cannot move group into its own');
        }
        const restoreFocus = this.shouldRestoreFocus(sourceView.element);
        let movedView;
        // Same groups view: move via grid widget API
        if (sourceView.groupsView === targetView.groupsView) {
            this.gridWidget.moveView(sourceView, this.getSplitSizingStyle(), targetView, this.toGridViewDirection(direction));
            movedView = sourceView;
        }
        // Different groups view: move via groups view API
        else {
            movedView = targetView.groupsView.addGroup(targetView, direction, sourceView);
            sourceView.closeAllEditors();
            this.removeGroup(sourceView, restoreFocus);
        }
        // Restore focus if we had it previously after completing the grid
        // operation. That operation might cause reparenting of grid views
        // which moves focus to the <body> element otherwise.
        if (restoreFocus) {
            movedView.focus();
        }
        // Event
        this._onDidMoveGroup.fire(movedView);
        // Notify group index change given a group was moved
        this.notifyGroupIndexChange();
        return movedView;
    }
    copyGroup(group, location, direction) {
        const groupView = this.assertGroupView(group);
        const locationView = this.assertGroupView(location);
        const restoreFocus = this.shouldRestoreFocus(groupView.element);
        // Copy the group view
        const copiedGroupView = this.addGroup(locationView, direction, groupView);
        // Restore focus if we had it
        if (restoreFocus) {
            copiedGroupView.focus();
        }
        return copiedGroupView;
    }
    mergeGroup(group, target, options) {
        const sourceView = this.assertGroupView(group);
        const targetView = this.assertGroupView(target);
        // Collect editors to move/copy
        const editors = [];
        let index = (options && typeof options.index === 'number') ? options.index : targetView.count;
        for (const editor of sourceView.editors) {
            const inactive = !sourceView.isActive(editor) || this._activeGroup !== sourceView;
            const sticky = sourceView.isSticky(editor);
            const options = { index: !sticky ? index : undefined /* do not set index to preserve sticky flag */, inactive, preserveFocus: inactive };
            editors.push({ editor, options });
            index++;
        }
        // Move/Copy editors over into target
        let result = true;
        if (options?.mode === 0 /* MergeGroupMode.COPY_EDITORS */) {
            sourceView.copyEditors(editors, targetView);
        }
        else {
            result = sourceView.moveEditors(editors, targetView);
        }
        // Remove source if the view is now empty and not already removed
        if (sourceView.isEmpty && !sourceView.disposed /* could have been disposed already via workbench.editor.closeEmptyGroups setting */) {
            this.removeGroup(sourceView, true);
        }
        return result;
    }
    mergeAllGroups(target) {
        const targetView = this.assertGroupView(target);
        let result = true;
        for (const group of this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
            if (group === targetView) {
                continue; // keep target
            }
            const merged = this.mergeGroup(group, targetView);
            if (!merged) {
                result = false;
            }
        }
        return result;
    }
    assertGroupView(group) {
        let groupView;
        if (typeof group === 'number') {
            groupView = this.editorPartsView.getGroup(group);
        }
        else {
            groupView = group;
        }
        if (!groupView) {
            throw new Error('Invalid editor group provided!');
        }
        return groupView;
    }
    createEditorDropTarget(container, delegate) {
        assertType(isHTMLElement(container));
        return this.scopedInstantiationService.createInstance(EditorDropTarget, container, delegate);
    }
    //#region Part
    // TODO @sbatten @joao find something better to prevent editor taking over #79897
    get minimumWidth() { return Math.min(this.centeredLayoutWidget.minimumWidth, this.layoutService.getMaximumEditorDimensions(this.layoutService.getContainer(getWindow(this.container))).width); }
    get maximumWidth() { return this.centeredLayoutWidget.maximumWidth; }
    get minimumHeight() { return Math.min(this.centeredLayoutWidget.minimumHeight, this.layoutService.getMaximumEditorDimensions(this.layoutService.getContainer(getWindow(this.container))).height); }
    get maximumHeight() { return this.centeredLayoutWidget.maximumHeight; }
    get snap() { return this.layoutService.getPanelAlignment() === 'center'; }
    get onDidChange() { return Event.any(this.centeredLayoutWidget.onDidChange, this.onDidSetGridWidget.event); }
    get gridSeparatorBorder() {
        return this.theme.getColor(EDITOR_GROUP_BORDER) || this.theme.getColor(contrastBorder) || Color.transparent;
    }
    updateStyles() {
        const container = assertIsDefined(this.container);
        container.style.backgroundColor = this.getColor(editorBackground) || '';
        const separatorBorderStyle = { separatorBorder: this.gridSeparatorBorder, background: this.theme.getColor(EDITOR_PANE_BACKGROUND) || Color.transparent };
        this.gridWidget.style(separatorBorderStyle);
        this.centeredLayoutWidget.styles(separatorBorderStyle);
    }
    createContentArea(parent, options) {
        // Container
        this.element = parent;
        this.container = document.createElement('div');
        this.container.classList.add('content');
        if (this.windowId !== mainWindow.vscodeWindowId) {
            this.container.classList.add('auxiliary');
        }
        parent.appendChild(this.container);
        // Scoped instantiation service
        const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.container));
        this.scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
        // Grid control
        this._willRestoreState = !options || options.restorePreviousState;
        this.doCreateGridControl();
        // Centered layout widget
        this.centeredLayoutWidget = this._register(new CenteredViewLayout(this.container, this.gridWidgetView, this.profileMemento[EditorPart_1.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY], this._partOptions.centeredLayoutFixedWidth));
        this._register(this.onDidChangeEditorPartOptions(e => this.centeredLayoutWidget.setFixedWidth(e.newPartOptions.centeredLayoutFixedWidth ?? false)));
        // Drag & Drop support
        this.setupDragAndDropSupport(parent, this.container);
        // Context keys
        this.handleContextKeys(scopedContextKeyService);
        // Signal ready
        this.whenReadyPromise.complete();
        this._isReady = true;
        // Signal restored
        Promises.settled(this.groups.map(group => group.whenRestored)).finally(() => {
            this.whenRestoredPromise.complete();
        });
        return this.container;
    }
    handleContextKeys(contextKeyService) {
        const isAuxiliaryEditorPartContext = IsAuxiliaryEditorPartContext.bindTo(contextKeyService);
        isAuxiliaryEditorPartContext.set(this.windowId !== mainWindow.vscodeWindowId);
        const multipleEditorGroupsContext = EditorPartMultipleEditorGroupsContext.bindTo(contextKeyService);
        const maximizedEditorGroupContext = EditorPartMaximizedEditorGroupContext.bindTo(contextKeyService);
        const updateContextKeys = () => {
            const groupCount = this.count;
            if (groupCount > 1) {
                multipleEditorGroupsContext.set(true);
            }
            else {
                multipleEditorGroupsContext.reset();
            }
            if (this.hasMaximizedGroup()) {
                maximizedEditorGroupContext.set(true);
            }
            else {
                maximizedEditorGroupContext.reset();
            }
        };
        updateContextKeys();
        this._register(this.onDidAddGroup(() => updateContextKeys()));
        this._register(this.onDidRemoveGroup(() => updateContextKeys()));
        this._register(this.onDidChangeGroupMaximized(() => updateContextKeys()));
    }
    setupDragAndDropSupport(parent, container) {
        // Editor drop target
        this._register(this.createEditorDropTarget(container, Object.create(null)));
        // No drop in the editor
        const overlay = document.createElement('div');
        overlay.classList.add('drop-block-overlay');
        parent.appendChild(overlay);
        // Hide the block if a mouse down event occurs #99065
        this._register(addDisposableGenericMouseDownListener(overlay, () => overlay.classList.remove('visible')));
        this._register(CompositeDragAndDropObserver.INSTANCE.registerTarget(this.element, {
            onDragStart: e => overlay.classList.add('visible'),
            onDragEnd: e => overlay.classList.remove('visible')
        }));
        let horizontalOpenerTimeout;
        let verticalOpenerTimeout;
        let lastOpenHorizontalPosition;
        let lastOpenVerticalPosition;
        const openPartAtPosition = (position) => {
            if (!this.layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && position === this.layoutService.getPanelPosition()) {
                this.layoutService.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
            }
            else if (!this.layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) && position === (this.layoutService.getSideBarPosition() === 1 /* Position.RIGHT */ ? 0 /* Position.LEFT */ : 1 /* Position.RIGHT */)) {
                this.layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            }
        };
        const clearAllTimeouts = () => {
            if (horizontalOpenerTimeout) {
                clearTimeout(horizontalOpenerTimeout);
                horizontalOpenerTimeout = undefined;
            }
            if (verticalOpenerTimeout) {
                clearTimeout(verticalOpenerTimeout);
                verticalOpenerTimeout = undefined;
            }
        };
        this._register(CompositeDragAndDropObserver.INSTANCE.registerTarget(overlay, {
            onDragOver: e => {
                EventHelper.stop(e.eventData, true);
                if (e.eventData.dataTransfer) {
                    e.eventData.dataTransfer.dropEffect = 'none';
                }
                const boundingRect = overlay.getBoundingClientRect();
                let openHorizontalPosition = undefined;
                let openVerticalPosition = undefined;
                const proximity = 100;
                if (e.eventData.clientX < boundingRect.left + proximity) {
                    openHorizontalPosition = 0 /* Position.LEFT */;
                }
                if (e.eventData.clientX > boundingRect.right - proximity) {
                    openHorizontalPosition = 1 /* Position.RIGHT */;
                }
                if (e.eventData.clientY > boundingRect.bottom - proximity) {
                    openVerticalPosition = 2 /* Position.BOTTOM */;
                }
                if (e.eventData.clientY < boundingRect.top + proximity) {
                    openVerticalPosition = 3 /* Position.TOP */;
                }
                if (horizontalOpenerTimeout && openHorizontalPosition !== lastOpenHorizontalPosition) {
                    clearTimeout(horizontalOpenerTimeout);
                    horizontalOpenerTimeout = undefined;
                }
                if (verticalOpenerTimeout && openVerticalPosition !== lastOpenVerticalPosition) {
                    clearTimeout(verticalOpenerTimeout);
                    verticalOpenerTimeout = undefined;
                }
                if (!horizontalOpenerTimeout && openHorizontalPosition !== undefined) {
                    lastOpenHorizontalPosition = openHorizontalPosition;
                    horizontalOpenerTimeout = setTimeout(() => openPartAtPosition(openHorizontalPosition), 200);
                }
                if (!verticalOpenerTimeout && openVerticalPosition !== undefined) {
                    lastOpenVerticalPosition = openVerticalPosition;
                    verticalOpenerTimeout = setTimeout(() => openPartAtPosition(openVerticalPosition), 200);
                }
            },
            onDragLeave: () => clearAllTimeouts(),
            onDragEnd: () => clearAllTimeouts(),
            onDrop: () => clearAllTimeouts()
        }));
    }
    centerLayout(active) {
        this.centeredLayoutWidget.activate(active);
        this._activeGroup.focus();
    }
    isLayoutCentered() {
        if (this.centeredLayoutWidget) {
            return this.centeredLayoutWidget.isActive();
        }
        return false;
    }
    doCreateGridControl() {
        // Grid Widget (with previous UI state)
        let restoreError = false;
        if (this._willRestoreState) {
            restoreError = !this.doCreateGridControlWithPreviousState();
        }
        // Grid Widget (no previous UI state or failed to restore)
        if (!this.gridWidget || restoreError) {
            const initialGroup = this.doCreateGroupView();
            this.doSetGridWidget(new SerializableGrid(initialGroup));
            // Ensure a group is active
            this.doSetGroupActive(initialGroup);
        }
        // Update container
        this.updateContainer();
        // Notify group index change we created the entire grid
        this.notifyGroupIndexChange();
    }
    doCreateGridControlWithPreviousState() {
        const state = this.loadState();
        if (state?.serializedGrid) {
            try {
                // MRU
                this.mostRecentActiveGroups = state.mostRecentActiveGroups;
                // Grid Widget
                this.doCreateGridControlWithState(state.serializedGrid, state.activeGroup);
            }
            catch (error) {
                // Log error
                onUnexpectedError(new Error(`Error restoring editor grid widget: ${error} (with state: ${JSON.stringify(state)})`));
                // Clear any state we have from the failing restore
                this.disposeGroups();
                return false; // failure
            }
        }
        return true; // success
    }
    doCreateGridControlWithState(serializedGrid, activeGroupId, editorGroupViewsToReuse, options) {
        // Determine group views to reuse if any
        let reuseGroupViews;
        if (editorGroupViewsToReuse) {
            reuseGroupViews = editorGroupViewsToReuse.slice(0); // do not modify original array
        }
        else {
            reuseGroupViews = [];
        }
        // Create new
        const groupViews = [];
        const gridWidget = SerializableGrid.deserialize(serializedGrid, {
            fromJSON: (serializedEditorGroup) => {
                let groupView;
                if (reuseGroupViews.length > 0) {
                    groupView = reuseGroupViews.shift();
                }
                else {
                    groupView = this.doCreateGroupView(serializedEditorGroup, options);
                }
                groupViews.push(groupView);
                if (groupView.id === activeGroupId) {
                    this.doSetGroupActive(groupView);
                }
                return groupView;
            }
        }, { styles: { separatorBorder: this.gridSeparatorBorder } });
        // If the active group was not found when restoring the grid
        // make sure to make at least one group active. We always need
        // an active group.
        if (!this._activeGroup) {
            this.doSetGroupActive(groupViews[0]);
        }
        // Validate MRU group views matches grid widget state
        if (this.mostRecentActiveGroups.some(groupId => !this.getGroup(groupId))) {
            this.mostRecentActiveGroups = groupViews.map(group => group.id);
        }
        // Set it
        this.doSetGridWidget(gridWidget);
    }
    doSetGridWidget(gridWidget) {
        let boundarySashes = {};
        if (this.gridWidget) {
            boundarySashes = this.gridWidget.boundarySashes;
            this.gridWidget.dispose();
        }
        this.gridWidget = gridWidget;
        this.gridWidget.boundarySashes = boundarySashes;
        this.gridWidgetView.gridWidget = gridWidget;
        this._onDidChangeSizeConstraints.input = gridWidget.onDidChange;
        this._onDidScroll.input = gridWidget.onDidScroll;
        this.gridWidgetDisposables.clear();
        this.gridWidgetDisposables.add(gridWidget.onDidChangeViewMaximized(maximized => this._onDidChangeGroupMaximized.fire(maximized)));
        this._onDidChangeGroupMaximized.fire(this.hasMaximizedGroup());
        this.onDidSetGridWidget.fire(undefined);
    }
    updateContainer() {
        const container = assertIsDefined(this.container);
        container.classList.toggle('empty', this.isEmpty);
    }
    notifyGroupIndexChange() {
        this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).forEach((group, index) => group.notifyIndexChanged(index));
    }
    notifyGroupsLabelChange(newLabel) {
        for (const group of this.groups) {
            group.notifyLabelChanged(newLabel);
        }
    }
    get isEmpty() {
        return this.count === 1 && this._activeGroup.isEmpty;
    }
    setBoundarySashes(sashes) {
        this.gridWidget.boundarySashes = sashes;
        this.centeredLayoutWidget.boundarySashes = sashes;
    }
    layout(width, height, top, left) {
        this.top = top;
        this.left = left;
        // Layout contents
        const contentAreaSize = super.layoutContents(width, height).contentSize;
        // Layout editor container
        this.doLayout(Dimension.lift(contentAreaSize), top, left);
    }
    doLayout(dimension, top = this.top, left = this.left) {
        this._contentDimension = dimension;
        // Layout Grid
        this.centeredLayoutWidget.layout(this._contentDimension.width, this._contentDimension.height, top, left);
        // Event
        this._onDidLayout.fire(dimension);
    }
    saveState() {
        // Persist grid UI state
        if (this.gridWidget) {
            if (this.isEmpty) {
                delete this.workspaceMemento[EditorPart_1.EDITOR_PART_UI_STATE_STORAGE_KEY];
            }
            else {
                this.workspaceMemento[EditorPart_1.EDITOR_PART_UI_STATE_STORAGE_KEY] = this.createState();
            }
        }
        // Persist centered view state
        if (this.centeredLayoutWidget) {
            const centeredLayoutState = this.centeredLayoutWidget.state;
            if (this.centeredLayoutWidget.isDefault(centeredLayoutState)) {
                delete this.profileMemento[EditorPart_1.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY];
            }
            else {
                this.profileMemento[EditorPart_1.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY] = centeredLayoutState;
            }
        }
        super.saveState();
    }
    loadState() {
        return this.workspaceMemento[EditorPart_1.EDITOR_PART_UI_STATE_STORAGE_KEY];
    }
    createState() {
        return {
            serializedGrid: this.gridWidget.serialize(),
            activeGroup: this._activeGroup.id,
            mostRecentActiveGroups: this.mostRecentActiveGroups
        };
    }
    applyState(state, options) {
        if (state === 'empty') {
            return this.doApplyEmptyState();
        }
        else {
            return this.doApplyState(state, options);
        }
    }
    async doApplyState(state, options) {
        const groups = await this.doPrepareApplyState();
        // Pause add/remove events for groups during the duration of applying the state
        // This ensures that we can do this transition atomically with the new state
        // being ready when the events are fired. This is important because usually there
        // is never the state where no groups are present, but for this transition we
        // need to temporarily dispose all groups to restore the new set.
        this._onDidAddGroup.pause();
        this._onDidRemoveGroup.pause();
        this.disposeGroups();
        // MRU
        this.mostRecentActiveGroups = state.mostRecentActiveGroups;
        // Grid Widget
        try {
            this.doApplyGridState(state.serializedGrid, state.activeGroup, undefined, options);
        }
        finally {
            // It is very important to keep this order: first resume the events for
            // removed groups and then for added groups. Many listeners may store
            // groups in sets by their identifier and groups can have the same
            // identifier before and after.
            this._onDidRemoveGroup.resume();
            this._onDidAddGroup.resume();
        }
        // Restore editors that were not closed before and are now opened now
        await this.activeGroup.openEditors(groups
            .flatMap(group => group.editors)
            .filter(editor => this.editorPartsView.groups.every(groupView => !groupView.contains(editor)))
            .map(editor => ({
            editor, options: { pinned: true, preserveFocus: true, inactive: true }
        })));
    }
    async doApplyEmptyState() {
        await this.doPrepareApplyState();
        this.mergeAllGroups(this.activeGroup);
    }
    async doPrepareApplyState() {
        // Before disposing groups, try to close as many editors as
        // possible, but skip over those that would trigger a dialog
        // (for example when being dirty). This is to be able to later
        // restore these editors after state has been applied.
        const groups = this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
        for (const group of groups) {
            await group.closeAllEditors({ excludeConfirming: true });
        }
        return groups;
    }
    doApplyGridState(gridState, activeGroupId, editorGroupViewsToReuse, options) {
        // Recreate grid widget from state
        this.doCreateGridControlWithState(gridState, activeGroupId, editorGroupViewsToReuse, options);
        // Layout
        this.doLayout(this._contentDimension);
        // Update container
        this.updateContainer();
        // Events for groups that got added
        for (const groupView of this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
            if (!editorGroupViewsToReuse?.includes(groupView)) {
                this._onDidAddGroup.fire(groupView);
            }
        }
        // Notify group index change given layout has changed
        this.notifyGroupIndexChange();
    }
    onDidChangeMementoState(e) {
        if (e.external && e.scope === 1 /* StorageScope.WORKSPACE */) {
            this.reloadMemento(e.scope);
            const state = this.loadState();
            if (state) {
                this.applyState(state);
            }
        }
    }
    toJSON() {
        return {
            type: "workbench.parts.editor" /* Parts.EDITOR_PART */
        };
    }
    disposeGroups() {
        for (const group of this.groups) {
            group.dispose();
            this._onDidRemoveGroup.fire(group);
        }
        this.groupViews.clear();
        this.mostRecentActiveGroups = [];
    }
    dispose() {
        // Event
        this._onWillDispose.fire();
        // Forward to all groups
        this.disposeGroups();
        // Grid widget
        this.gridWidget?.dispose();
        super.dispose();
    }
};
EditorPart = EditorPart_1 = __decorate([
    __param(4, IInstantiationService),
    __param(5, IThemeService),
    __param(6, IConfigurationService),
    __param(7, IStorageService),
    __param(8, IWorkbenchLayoutService),
    __param(9, IHostService),
    __param(10, IContextKeyService),
    __metadata("design:paramtypes", [Object, String, String, Number, Object, Object, Object, Object, Object, Object, Object])
], EditorPart);
export { EditorPart };
let MainEditorPart = class MainEditorPart extends EditorPart {
    constructor(editorPartsView, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
        super(editorPartsView, "workbench.parts.editor" /* Parts.EDITOR_PART */, '', mainWindow.vscodeWindowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService);
    }
};
MainEditorPart = __decorate([
    __param(1, IInstantiationService),
    __param(2, IThemeService),
    __param(3, IConfigurationService),
    __param(4, IStorageService),
    __param(5, IWorkbenchLayoutService),
    __param(6, IHostService),
    __param(7, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], MainEditorPart);
export { MainEditorPart };
