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
var ExplorerService_1;
import { Event } from '../../../../base/common/event.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ExplorerItem, ExplorerModel } from '../common/explorerModel.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { dirname, basename } from '../../../../base/common/resources.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IBulkEditService } from '../../../../editor/browser/services/bulkEditService.js';
import { UndoRedoSource } from '../../../../platform/undoRedo/common/undoRedo.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ResourceGlobMatcher } from '../../../common/resources.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
export const UNDO_REDO_SOURCE = new UndoRedoSource();
let ExplorerService = class ExplorerService {
    static { ExplorerService_1 = this; }
    static { this.EXPLORER_FILE_CHANGES_REACT_DELAY = 500; } // delay in ms to react to file changes to give our internal events a chance to react first
    constructor(fileService, configurationService, contextService, clipboardService, editorService, uriIdentityService, bulkEditService, progressService, hostService, filesConfigurationService, telemetryService) {
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.contextService = contextService;
        this.clipboardService = clipboardService;
        this.editorService = editorService;
        this.uriIdentityService = uriIdentityService;
        this.bulkEditService = bulkEditService;
        this.progressService = progressService;
        this.filesConfigurationService = filesConfigurationService;
        this.telemetryService = telemetryService;
        this.disposables = new DisposableStore();
        this.fileChangeEvents = [];
        this.config = this.configurationService.getValue('explorer');
        this.model = new ExplorerModel(this.contextService, this.uriIdentityService, this.fileService, this.configurationService, this.filesConfigurationService);
        this.disposables.add(this.model);
        this.disposables.add(this.fileService.onDidRunOperation(e => this.onDidRunOperation(e)));
        this.onFileChangesScheduler = new RunOnceScheduler(async () => {
            const events = this.fileChangeEvents;
            this.fileChangeEvents = [];
            // Filter to the ones we care
            const types = [2 /* FileChangeType.DELETED */];
            if (this.config.sortOrder === "modified" /* SortOrder.Modified */) {
                types.push(0 /* FileChangeType.UPDATED */);
            }
            let shouldRefresh = false;
            // For DELETED and UPDATED events go through the explorer model and check if any of the items got affected
            this.roots.forEach(r => {
                if (this.view && !shouldRefresh) {
                    shouldRefresh = doesFileEventAffect(r, this.view, events, types);
                }
            });
            // For ADDED events we need to go through all the events and check if the explorer is already aware of some of them
            // Or if they affect not yet resolved parts of the explorer. If that is the case we will not refresh.
            events.forEach(e => {
                if (!shouldRefresh) {
                    for (const resource of e.rawAdded) {
                        const parent = this.model.findClosest(dirname(resource));
                        // Parent of the added resource is resolved and the explorer model is not aware of the added resource - we need to refresh
                        if (parent && !parent.getChild(basename(resource))) {
                            shouldRefresh = true;
                            break;
                        }
                    }
                }
            });
            if (shouldRefresh) {
                await this.refresh(false);
            }
        }, ExplorerService_1.EXPLORER_FILE_CHANGES_REACT_DELAY);
        this.disposables.add(this.fileService.onDidFilesChange(e => {
            this.fileChangeEvents.push(e);
            // Don't mess with the file tree while in the process of editing. #112293
            if (this.editable) {
                return;
            }
            if (!this.onFileChangesScheduler.isScheduled()) {
                this.onFileChangesScheduler.schedule();
            }
        }));
        this.disposables.add(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        this.disposables.add(Event.any(this.fileService.onDidChangeFileSystemProviderRegistrations, this.fileService.onDidChangeFileSystemProviderCapabilities)(async (e) => {
            let affected = false;
            this.model.roots.forEach(r => {
                if (r.resource.scheme === e.scheme) {
                    affected = true;
                    r.forgetChildren();
                }
            });
            if (affected) {
                if (this.view) {
                    await this.view.setTreeInput();
                }
            }
        }));
        this.disposables.add(this.model.onDidChangeRoots(() => {
            this.view?.setTreeInput();
        }));
        // Refresh explorer when window gets focus to compensate for missing file events #126817
        this.disposables.add(hostService.onDidChangeFocus(hasFocus => {
            if (hasFocus) {
                this.refresh(false);
            }
        }));
        this.revealExcludeMatcher = new ResourceGlobMatcher((uri) => getRevealExcludes(configurationService.getValue({ resource: uri })), (event) => event.affectsConfiguration('explorer.autoRevealExclude'), contextService, configurationService);
        this.disposables.add(this.revealExcludeMatcher);
    }
    get roots() {
        return this.model.roots;
    }
    get sortOrderConfiguration() {
        return {
            sortOrder: this.config.sortOrder,
            lexicographicOptions: this.config.sortOrderLexicographicOptions,
            reverse: this.config.sortOrderReverse,
        };
    }
    registerView(contextProvider) {
        this.view = contextProvider;
    }
    getContext(respectMultiSelection, ignoreNestedChildren = false) {
        if (!this.view) {
            return [];
        }
        const items = new Set(this.view.getContext(respectMultiSelection));
        items.forEach(item => {
            try {
                if (respectMultiSelection && !ignoreNestedChildren && this.view?.isItemCollapsed(item) && item.nestedChildren) {
                    for (const child of item.nestedChildren) {
                        items.add(child);
                    }
                }
            }
            catch {
                // We will error out trying to resolve collapsed nodes that have not yet been resolved.
                // So we catch and ignore them in the multiSelect context
                return;
            }
        });
        return [...items];
    }
    async applyBulkEdit(edit, options) {
        const cancellationTokenSource = new CancellationTokenSource();
        const location = options.progressLocation ?? 10 /* ProgressLocation.Window */;
        let progressOptions;
        if (location === 10 /* ProgressLocation.Window */) {
            progressOptions = {
                location: location,
                title: options.progressLabel,
                cancellable: edit.length > 1,
            };
        }
        else {
            progressOptions = {
                location: location,
                title: options.progressLabel,
                cancellable: edit.length > 1,
                delay: 500,
            };
        }
        const promise = this.progressService.withProgress(progressOptions, async (progress) => {
            await this.bulkEditService.apply(edit, {
                undoRedoSource: UNDO_REDO_SOURCE,
                label: options.undoLabel,
                code: 'undoredo.explorerOperation',
                progress,
                token: cancellationTokenSource.token,
                confirmBeforeUndo: options.confirmBeforeUndo
            });
        }, () => cancellationTokenSource.cancel());
        await this.progressService.withProgress({ location: 1 /* ProgressLocation.Explorer */, delay: 500 }, () => promise);
        cancellationTokenSource.dispose();
    }
    hasViewFocus() {
        return !!this.view && this.view.hasFocus();
    }
    // IExplorerService methods
    findClosest(resource) {
        return this.model.findClosest(resource);
    }
    findClosestRoot(resource) {
        const parentRoots = this.model.roots.filter(r => this.uriIdentityService.extUri.isEqualOrParent(resource, r.resource))
            .sort((first, second) => second.resource.path.length - first.resource.path.length);
        return parentRoots.length ? parentRoots[0] : null;
    }
    async setEditable(stat, data) {
        if (!this.view) {
            return;
        }
        if (!data) {
            this.editable = undefined;
        }
        else {
            this.editable = { stat, data };
        }
        const isEditing = this.isEditable(stat);
        try {
            await this.view.setEditable(stat, isEditing);
        }
        catch {
            const parent = stat.parent;
            const errorData = {
                parentIsDirectory: parent?.isDirectory,
                isDirectory: stat.isDirectory,
                isReadonly: !!stat.isReadonly,
                parentIsReadonly: !!parent?.isReadonly,
                parentIsExcluded: parent?.isExcluded,
                isExcluded: stat.isExcluded,
                parentIsRoot: parent?.isRoot,
                isRoot: stat.isRoot,
                parentHasNests: parent?.hasNests,
                hasNests: stat.hasNests,
            };
            this.telemetryService.publicLogError2('explorerView.setEditableError', errorData);
            return;
        }
        if (!this.editable && this.fileChangeEvents.length && !this.onFileChangesScheduler.isScheduled()) {
            this.onFileChangesScheduler.schedule();
        }
    }
    async setToCopy(items, cut) {
        const previouslyCutItems = this.cutItems;
        this.cutItems = cut ? items : undefined;
        await this.clipboardService.writeResources(items.map(s => s.resource));
        this.view?.itemsCopied(items, cut, previouslyCutItems);
    }
    isCut(item) {
        return !!this.cutItems && this.cutItems.some(i => this.uriIdentityService.extUri.isEqual(i.resource, item.resource));
    }
    getEditable() {
        return this.editable;
    }
    getEditableData(stat) {
        return this.editable && this.editable.stat === stat ? this.editable.data : undefined;
    }
    isEditable(stat) {
        return !!this.editable && (this.editable.stat === stat || !stat);
    }
    async select(resource, reveal) {
        if (!this.view) {
            return;
        }
        // If file or parent matches exclude patterns, do not reveal unless reveal argument is 'force'
        const ignoreRevealExcludes = reveal === 'force';
        const fileStat = this.findClosest(resource);
        if (fileStat) {
            if (!this.shouldAutoRevealItem(fileStat, ignoreRevealExcludes)) {
                return;
            }
            await this.view.selectResource(fileStat.resource, reveal);
            return Promise.resolve(undefined);
        }
        // Stat needs to be resolved first and then revealed
        const options = { resolveTo: [resource], resolveMetadata: this.config.sortOrder === "modified" /* SortOrder.Modified */ };
        const root = this.findClosestRoot(resource);
        if (!root) {
            return undefined;
        }
        try {
            const stat = await this.fileService.resolve(root.resource, options);
            // Convert to model
            const modelStat = ExplorerItem.create(this.fileService, this.configurationService, this.filesConfigurationService, stat, undefined, options.resolveTo);
            // Update Input with disk Stat
            ExplorerItem.mergeLocalWithDisk(modelStat, root);
            const item = root.find(resource);
            await this.view.refresh(true, root);
            // Once item is resolved, check again if folder should be expanded
            if (item && !this.shouldAutoRevealItem(item, ignoreRevealExcludes)) {
                return;
            }
            await this.view.selectResource(item ? item.resource : undefined, reveal);
        }
        catch (error) {
            root.error = error;
            await this.view.refresh(false, root);
        }
    }
    async refresh(reveal = true) {
        this.model.roots.forEach(r => r.forgetChildren());
        if (this.view) {
            await this.view.refresh(true);
            const resource = this.editorService.activeEditor?.resource;
            const autoReveal = this.configurationService.getValue().explorer.autoReveal;
            if (reveal && resource && autoReveal) {
                // We did a top level refresh, reveal the active file #67118
                this.select(resource, autoReveal);
            }
        }
    }
    // File events
    async onDidRunOperation(e) {
        // When nesting, changes to one file in a folder may impact the rendered structure
        // of all the folder's immediate children, thus a recursive refresh is needed.
        // Ideally the tree would be able to recusively refresh just one level but that does not yet exist.
        const shouldDeepRefresh = this.config.fileNesting.enabled;
        // Add
        if (e.isOperation(0 /* FileOperation.CREATE */) || e.isOperation(3 /* FileOperation.COPY */)) {
            const addedElement = e.target;
            const parentResource = dirname(addedElement.resource);
            const parents = this.model.findAll(parentResource);
            if (parents.length) {
                // Add the new file to its parent (Model)
                await Promise.all(parents.map(async (p) => {
                    // We have to check if the parent is resolved #29177
                    const resolveMetadata = this.config.sortOrder === `modified`;
                    if (!p.isDirectoryResolved) {
                        const stat = await this.fileService.resolve(p.resource, { resolveMetadata });
                        if (stat) {
                            const modelStat = ExplorerItem.create(this.fileService, this.configurationService, this.filesConfigurationService, stat, p.parent);
                            ExplorerItem.mergeLocalWithDisk(modelStat, p);
                        }
                    }
                    const childElement = ExplorerItem.create(this.fileService, this.configurationService, this.filesConfigurationService, addedElement, p.parent);
                    // Make sure to remove any previous version of the file if any
                    p.removeChild(childElement);
                    p.addChild(childElement);
                    // Refresh the Parent (View)
                    await this.view?.refresh(shouldDeepRefresh, p);
                }));
            }
        }
        // Move (including Rename)
        else if (e.isOperation(2 /* FileOperation.MOVE */)) {
            const oldResource = e.resource;
            const newElement = e.target;
            const oldParentResource = dirname(oldResource);
            const newParentResource = dirname(newElement.resource);
            const modelElements = this.model.findAll(oldResource);
            const sameParentMove = modelElements.every(e => !e.nestedParent) && this.uriIdentityService.extUri.isEqual(oldParentResource, newParentResource);
            // Handle Rename
            if (sameParentMove) {
                await Promise.all(modelElements.map(async (modelElement) => {
                    // Rename File (Model)
                    modelElement.rename(newElement);
                    await this.view?.refresh(shouldDeepRefresh, modelElement.parent);
                }));
            }
            // Handle Move
            else {
                const newParents = this.model.findAll(newParentResource);
                if (newParents.length && modelElements.length) {
                    // Move in Model
                    await Promise.all(modelElements.map(async (modelElement, index) => {
                        const oldParent = modelElement.parent;
                        const oldNestedParent = modelElement.nestedParent;
                        modelElement.move(newParents[index]);
                        if (oldNestedParent) {
                            await this.view?.refresh(false, oldNestedParent);
                        }
                        await this.view?.refresh(false, oldParent);
                        await this.view?.refresh(shouldDeepRefresh, newParents[index]);
                    }));
                }
            }
        }
        // Delete
        else if (e.isOperation(1 /* FileOperation.DELETE */)) {
            const modelElements = this.model.findAll(e.resource);
            await Promise.all(modelElements.map(async (modelElement) => {
                if (modelElement.parent) {
                    // Remove Element from Parent (Model)
                    const parent = modelElement.parent;
                    parent.removeChild(modelElement);
                    this.view?.focusNext();
                    const oldNestedParent = modelElement.nestedParent;
                    if (oldNestedParent) {
                        oldNestedParent.removeChild(modelElement);
                        await this.view?.refresh(false, oldNestedParent);
                    }
                    // Refresh Parent (View)
                    await this.view?.refresh(shouldDeepRefresh, parent);
                    if (this.view?.getFocus().length === 0) {
                        this.view?.focusLast();
                    }
                }
            }));
        }
    }
    // Check if an item matches a explorer.autoRevealExclude pattern
    shouldAutoRevealItem(item, ignore) {
        if (item === undefined || ignore) {
            return true;
        }
        if (this.revealExcludeMatcher.matches(item.resource, name => !!(item.parent && item.parent.getChild(name)))) {
            return false;
        }
        const root = item.root;
        let currentItem = item.parent;
        while (currentItem !== root) {
            if (currentItem === undefined) {
                return true;
            }
            if (this.revealExcludeMatcher.matches(currentItem.resource)) {
                return false;
            }
            currentItem = currentItem.parent;
        }
        return true;
    }
    async onConfigurationUpdated(event) {
        if (!event.affectsConfiguration('explorer')) {
            return;
        }
        let shouldRefresh = false;
        if (event.affectsConfiguration('explorer.fileNesting')) {
            shouldRefresh = true;
        }
        const configuration = this.configurationService.getValue();
        const configSortOrder = configuration?.explorer?.sortOrder || "default" /* SortOrder.Default */;
        if (this.config.sortOrder !== configSortOrder) {
            shouldRefresh = this.config.sortOrder !== undefined;
        }
        const configLexicographicOptions = configuration?.explorer?.sortOrderLexicographicOptions || "default" /* LexicographicOptions.Default */;
        if (this.config.sortOrderLexicographicOptions !== configLexicographicOptions) {
            shouldRefresh = shouldRefresh || this.config.sortOrderLexicographicOptions !== undefined;
        }
        const sortOrderReverse = configuration?.explorer?.sortOrderReverse || false;
        if (this.config.sortOrderReverse !== sortOrderReverse) {
            shouldRefresh = shouldRefresh || this.config.sortOrderReverse !== undefined;
        }
        this.config = configuration.explorer;
        if (shouldRefresh) {
            await this.refresh();
        }
    }
    dispose() {
        this.disposables.dispose();
    }
};
ExplorerService = ExplorerService_1 = __decorate([
    __param(0, IFileService),
    __param(1, IConfigurationService),
    __param(2, IWorkspaceContextService),
    __param(3, IClipboardService),
    __param(4, IEditorService),
    __param(5, IUriIdentityService),
    __param(6, IBulkEditService),
    __param(7, IProgressService),
    __param(8, IHostService),
    __param(9, IFilesConfigurationService),
    __param(10, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ExplorerService);
export { ExplorerService };
function doesFileEventAffect(item, view, events, types) {
    for (const [_name, child] of item.children) {
        if (view.isItemVisible(child)) {
            if (events.some(e => e.contains(child.resource, ...types))) {
                return true;
            }
            if (child.isDirectory && child.isDirectoryResolved) {
                if (doesFileEventAffect(child, view, events, types)) {
                    return true;
                }
            }
        }
    }
    return false;
}
function getRevealExcludes(configuration) {
    const revealExcludes = configuration && configuration.explorer && configuration.explorer.autoRevealExclude;
    if (!revealExcludes) {
        return {};
    }
    return revealExcludes;
}
