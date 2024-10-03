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
var BulkEditPane_1;
import { ButtonBar } from '../../../../../base/browser/ui/button/button.js';
import { CachedFunction, LRUCachedFunction } from '../../../../../base/common/cache.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import './bulkEdit.css';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../../nls.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { WorkbenchAsyncDataTree } from '../../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { defaultButtonStyles } from '../../../../../platform/theme/browser/defaultStyles.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { ResourceLabels } from '../../../../browser/labels.js';
import { ViewPane } from '../../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../../common/views.js';
import { BulkEditPreviewProvider, BulkFileOperations } from './bulkEditPreview.js';
import { BulkEditAccessibilityProvider, BulkEditDataSource, BulkEditDelegate, BulkEditIdentityProvider, BulkEditNaviLabelProvider, BulkEditSorter, CategoryElement, CategoryElementRenderer, compareBulkFileOperations, FileElement, FileElementRenderer, TextEditElement, TextEditElementRenderer } from './bulkEditTree.js';
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from '../../../../services/editor/common/editorService.js';
let BulkEditPane = class BulkEditPane extends ViewPane {
    static { BulkEditPane_1 = this; }
    static { this.ID = 'refactorPreview'; }
    static { this.Schema = 'vscode-bulkeditpreview-multieditor'; }
    static { this.ctxHasCategories = new RawContextKey('refactorPreview.hasCategories', false); }
    static { this.ctxGroupByFile = new RawContextKey('refactorPreview.groupByFile', true); }
    static { this.ctxHasCheckedChanges = new RawContextKey('refactorPreview.hasCheckedChanges', true); }
    static { this._memGroupByFile = `${this.ID}.groupByFile`; }
    constructor(options, _instaService, _editorService, _labelService, _textModelService, _dialogService, _contextMenuService, _storageService, contextKeyService, viewDescriptorService, keybindingService, contextMenuService, configurationService, openerService, themeService, telemetryService, hoverService) {
        super({ ...options, titleMenuId: MenuId.BulkEditTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, _instaService, openerService, themeService, telemetryService, hoverService);
        this._instaService = _instaService;
        this._editorService = _editorService;
        this._labelService = _labelService;
        this._textModelService = _textModelService;
        this._dialogService = _dialogService;
        this._contextMenuService = _contextMenuService;
        this._storageService = _storageService;
        this._treeViewStates = new Map();
        this._disposables = new DisposableStore();
        this._sessionDisposables = new DisposableStore();
        this._computeResourceDiffEditorInputs = new LRUCachedFunction(async (fileOperations) => {
            const computeDiffEditorInput = new CachedFunction(async (fileOperation) => {
                const fileOperationUri = fileOperation.uri;
                const previewUri = this._currentProvider.asPreviewUri(fileOperationUri);
                if (fileOperation.type & 4) {
                    return {
                        original: { resource: URI.revive(previewUri) },
                        modified: { resource: undefined },
                        goToFileResource: fileOperation.uri,
                    };
                }
                else {
                    let leftResource;
                    try {
                        (await this._textModelService.createModelReference(fileOperationUri)).dispose();
                        leftResource = fileOperationUri;
                    }
                    catch {
                        leftResource = BulkEditPreviewProvider.emptyPreview;
                    }
                    return {
                        original: { resource: URI.revive(leftResource) },
                        modified: { resource: URI.revive(previewUri) },
                        goToFileResource: leftResource,
                    };
                }
            });
            const sortedFileOperations = fileOperations.slice().sort(compareBulkFileOperations);
            const resources = [];
            for (const operation of sortedFileOperations) {
                resources.push(await computeDiffEditorInput.get(operation));
            }
            const getResourceDiffEditorInputIdOfOperation = async (operation) => {
                const resource = await computeDiffEditorInput.get(operation);
                return { original: resource.original.resource, modified: resource.modified.resource };
            };
            return {
                resources,
                getResourceDiffEditorInputIdOfOperation
            };
        });
        this.element.classList.add('bulk-edit-panel', 'show-file-icons');
        this._ctxHasCategories = BulkEditPane_1.ctxHasCategories.bindTo(contextKeyService);
        this._ctxGroupByFile = BulkEditPane_1.ctxGroupByFile.bindTo(contextKeyService);
        this._ctxHasCheckedChanges = BulkEditPane_1.ctxHasCheckedChanges.bindTo(contextKeyService);
        this.telemetryService.publicLog2('views.bulkEditPane');
    }
    dispose() {
        this._tree.dispose();
        this._disposables.dispose();
        super.dispose();
    }
    renderBody(parent) {
        super.renderBody(parent);
        const resourceLabels = this._instaService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
        this._disposables.add(resourceLabels);
        const contentContainer = document.createElement('div');
        contentContainer.className = 'content';
        parent.appendChild(contentContainer);
        const treeContainer = document.createElement('div');
        contentContainer.appendChild(treeContainer);
        this._treeDataSource = this._instaService.createInstance(BulkEditDataSource);
        this._treeDataSource.groupByFile = this._storageService.getBoolean(BulkEditPane_1._memGroupByFile, 0, true);
        this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
        this._tree = this._instaService.createInstance(WorkbenchAsyncDataTree, this.id, treeContainer, new BulkEditDelegate(), [this._instaService.createInstance(TextEditElementRenderer), this._instaService.createInstance(FileElementRenderer, resourceLabels), this._instaService.createInstance(CategoryElementRenderer)], this._treeDataSource, {
            accessibilityProvider: this._instaService.createInstance(BulkEditAccessibilityProvider),
            identityProvider: new BulkEditIdentityProvider(),
            expandOnlyOnTwistieClick: true,
            multipleSelectionSupport: false,
            keyboardNavigationLabelProvider: new BulkEditNaviLabelProvider(),
            sorter: new BulkEditSorter(),
            selectionNavigation: true
        });
        this._disposables.add(this._tree.onContextMenu(this._onContextMenu, this));
        this._disposables.add(this._tree.onDidOpen(e => this._openElementInMultiDiffEditor(e)));
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons';
        contentContainer.appendChild(buttonsContainer);
        const buttonBar = new ButtonBar(buttonsContainer);
        this._disposables.add(buttonBar);
        const btnConfirm = buttonBar.addButton({ supportIcons: true, ...defaultButtonStyles });
        btnConfirm.label = localize('ok', 'Apply');
        btnConfirm.onDidClick(() => this.accept(), this, this._disposables);
        const btnCancel = buttonBar.addButton({ ...defaultButtonStyles, secondary: true });
        btnCancel.label = localize('cancel', 'Discard');
        btnCancel.onDidClick(() => this.discard(), this, this._disposables);
        this._message = document.createElement('span');
        this._message.className = 'message';
        this._message.innerText = localize('empty.msg', "Invoke a code action, like rename, to see a preview of its changes here.");
        parent.appendChild(this._message);
        this._setState("message");
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        const treeHeight = height - 50;
        this._tree.getHTMLElement().parentElement.style.height = `${treeHeight}px`;
        this._tree.layout(treeHeight, width);
    }
    _setState(state) {
        this.element.dataset['state'] = state;
    }
    async setInput(edit, token) {
        this._setState("data");
        this._sessionDisposables.clear();
        this._treeViewStates.clear();
        if (this._currentResolve) {
            this._currentResolve(undefined);
            this._currentResolve = undefined;
        }
        const input = await this._instaService.invokeFunction(BulkFileOperations.create, edit);
        this._currentProvider = this._instaService.createInstance(BulkEditPreviewProvider, input);
        this._sessionDisposables.add(this._currentProvider);
        this._sessionDisposables.add(input);
        const hasCategories = input.categories.length > 1;
        this._ctxHasCategories.set(hasCategories);
        this._treeDataSource.groupByFile = !hasCategories || this._treeDataSource.groupByFile;
        this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
        this._currentInput = input;
        return new Promise(resolve => {
            token.onCancellationRequested(() => resolve(undefined));
            this._currentResolve = resolve;
            this._setTreeInput(input);
            this._sessionDisposables.add(input.checked.onDidChange(() => {
                this._tree.updateChildren();
                this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
            }));
        });
    }
    hasInput() {
        return Boolean(this._currentInput);
    }
    async _setTreeInput(input) {
        const viewState = this._treeViewStates.get(this._treeDataSource.groupByFile);
        await this._tree.setInput(input, viewState);
        this._tree.domFocus();
        if (viewState) {
            return;
        }
        const expand = [...this._tree.getNode(input).children].slice(0, 10);
        while (expand.length > 0) {
            const { element } = expand.shift();
            if (element instanceof FileElement) {
                await this._tree.expand(element, true);
            }
            if (element instanceof CategoryElement) {
                await this._tree.expand(element, true);
                expand.push(...this._tree.getNode(element).children);
            }
        }
    }
    accept() {
        const conflicts = this._currentInput?.conflicts.list();
        if (!conflicts || conflicts.length === 0) {
            this._done(true);
            return;
        }
        let message;
        if (conflicts.length === 1) {
            message = localize('conflict.1', "Cannot apply refactoring because '{0}' has changed in the meantime.", this._labelService.getUriLabel(conflicts[0], { relative: true }));
        }
        else {
            message = localize('conflict.N', "Cannot apply refactoring because {0} other files have changed in the meantime.", conflicts.length);
        }
        this._dialogService.warn(message).finally(() => this._done(false));
    }
    discard() {
        this._done(false);
    }
    _done(accept) {
        this._currentResolve?.(accept ? this._currentInput?.getWorkspaceEdit() : undefined);
        this._currentInput = undefined;
        this._setState("message");
        this._sessionDisposables.clear();
    }
    toggleChecked() {
        const [first] = this._tree.getFocus();
        if ((first instanceof FileElement || first instanceof TextEditElement) && !first.isDisabled()) {
            first.setChecked(!first.isChecked());
        }
        else if (first instanceof CategoryElement) {
            first.setChecked(!first.isChecked());
        }
    }
    groupByFile() {
        if (!this._treeDataSource.groupByFile) {
            this.toggleGrouping();
        }
    }
    groupByType() {
        if (this._treeDataSource.groupByFile) {
            this.toggleGrouping();
        }
    }
    toggleGrouping() {
        const input = this._tree.getInput();
        if (input) {
            const oldViewState = this._tree.getViewState();
            this._treeViewStates.set(this._treeDataSource.groupByFile, oldViewState);
            this._treeDataSource.groupByFile = !this._treeDataSource.groupByFile;
            this._setTreeInput(input);
            this._storageService.store(BulkEditPane_1._memGroupByFile, this._treeDataSource.groupByFile, 0, 0);
            this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
        }
    }
    async _openElementInMultiDiffEditor(e) {
        const fileOperations = this._currentInput?.fileOperations;
        if (!fileOperations) {
            return;
        }
        let selection = undefined;
        let fileElement;
        if (e.element instanceof TextEditElement) {
            fileElement = e.element.parent;
            selection = e.element.edit.textEdit.textEdit.range;
        }
        else if (e.element instanceof FileElement) {
            fileElement = e.element;
            selection = e.element.edit.textEdits[0]?.textEdit.textEdit.range;
        }
        else {
            return;
        }
        const result = await this._computeResourceDiffEditorInputs.get(fileOperations);
        const resourceId = await result.getResourceDiffEditorInputIdOfOperation(fileElement.edit);
        const options = {
            ...e.editorOptions,
            viewState: {
                revealData: {
                    resource: resourceId,
                    range: selection,
                }
            }
        };
        const multiDiffSource = URI.from({ scheme: BulkEditPane_1.Schema });
        const label = 'Refactor Preview';
        this._editorService.openEditor({
            multiDiffSource,
            label,
            options,
            isTransient: true,
            description: label,
            resources: result.resources
        }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
    }
    _onContextMenu(e) {
        this._contextMenuService.showContextMenu({
            menuId: MenuId.BulkEditContext,
            contextKeyService: this.contextKeyService,
            getAnchor: () => e.anchor
        });
    }
};
BulkEditPane = BulkEditPane_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IEditorService),
    __param(3, ILabelService),
    __param(4, ITextModelService),
    __param(5, IDialogService),
    __param(6, IContextMenuService),
    __param(7, IStorageService),
    __param(8, IContextKeyService),
    __param(9, IViewDescriptorService),
    __param(10, IKeybindingService),
    __param(11, IContextMenuService),
    __param(12, IConfigurationService),
    __param(13, IOpenerService),
    __param(14, IThemeService),
    __param(15, ITelemetryService),
    __param(16, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], BulkEditPane);
export { BulkEditPane };
