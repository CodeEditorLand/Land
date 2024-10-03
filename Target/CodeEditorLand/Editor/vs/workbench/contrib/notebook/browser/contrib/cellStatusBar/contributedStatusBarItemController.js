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
import { Throttler } from '../../../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../../../base/common/cancellation.js';
import { Disposable, toDisposable } from '../../../../../../base/common/lifecycle.js';
import { NotebookVisibleCellObserver } from './notebookVisibleCellObserver.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { INotebookCellStatusBarService } from '../../../common/notebookCellStatusBarService.js';
let ContributedStatusBarItemController = class ContributedStatusBarItemController extends Disposable {
    static { this.id = 'workbench.notebook.statusBar.contributed'; }
    constructor(_notebookEditor, _notebookCellStatusBarService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._notebookCellStatusBarService = _notebookCellStatusBarService;
        this._visibleCells = new Map();
        this._observer = this._register(new NotebookVisibleCellObserver(this._notebookEditor));
        this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells, this));
        this._updateEverything();
        this._register(this._notebookCellStatusBarService.onDidChangeProviders(this._updateEverything, this));
        this._register(this._notebookCellStatusBarService.onDidChangeItems(this._updateEverything, this));
    }
    _updateEverything() {
        const newCells = this._observer.visibleCells.filter(cell => !this._visibleCells.has(cell.handle));
        const visibleCellHandles = new Set(this._observer.visibleCells.map(item => item.handle));
        const currentCellHandles = Array.from(this._visibleCells.keys());
        const removedCells = currentCellHandles.filter(handle => !visibleCellHandles.has(handle));
        const itemsToUpdate = currentCellHandles.filter(handle => visibleCellHandles.has(handle));
        this._updateVisibleCells({ added: newCells, removed: removedCells.map(handle => ({ handle })) });
        itemsToUpdate.forEach(handle => this._visibleCells.get(handle)?.update());
    }
    _updateVisibleCells(e) {
        const vm = this._notebookEditor.getViewModel();
        if (!vm) {
            return;
        }
        for (const newCell of e.added) {
            const helper = new CellStatusBarHelper(vm, newCell, this._notebookCellStatusBarService);
            this._visibleCells.set(newCell.handle, helper);
        }
        for (const oldCell of e.removed) {
            this._visibleCells.get(oldCell.handle)?.dispose();
            this._visibleCells.delete(oldCell.handle);
        }
    }
    dispose() {
        super.dispose();
        this._visibleCells.forEach(cell => cell.dispose());
        this._visibleCells.clear();
    }
};
ContributedStatusBarItemController = __decorate([
    __param(1, INotebookCellStatusBarService),
    __metadata("design:paramtypes", [Object, Object])
], ContributedStatusBarItemController);
export { ContributedStatusBarItemController };
class CellStatusBarHelper extends Disposable {
    constructor(_notebookViewModel, _cell, _notebookCellStatusBarService) {
        super();
        this._notebookViewModel = _notebookViewModel;
        this._cell = _cell;
        this._notebookCellStatusBarService = _notebookCellStatusBarService;
        this._currentItemIds = [];
        this._currentItemLists = [];
        this._isDisposed = false;
        this._updateThrottler = this._register(new Throttler());
        this._register(toDisposable(() => this._activeToken?.dispose(true)));
        this._updateSoon();
        this._register(this._cell.model.onDidChangeContent(() => this._updateSoon()));
        this._register(this._cell.model.onDidChangeLanguage(() => this._updateSoon()));
        this._register(this._cell.model.onDidChangeMetadata(() => this._updateSoon()));
        this._register(this._cell.model.onDidChangeInternalMetadata(() => this._updateSoon()));
        this._register(this._cell.model.onDidChangeOutputs(() => this._updateSoon()));
    }
    update() {
        this._updateSoon();
    }
    _updateSoon() {
        setTimeout(() => {
            if (!this._isDisposed) {
                this._updateThrottler.queue(() => this._update());
            }
        }, 0);
    }
    async _update() {
        const cellIndex = this._notebookViewModel.getCellIndex(this._cell);
        const docUri = this._notebookViewModel.notebookDocument.uri;
        const viewType = this._notebookViewModel.notebookDocument.viewType;
        this._activeToken?.dispose(true);
        const tokenSource = this._activeToken = new CancellationTokenSource();
        const itemLists = await this._notebookCellStatusBarService.getStatusBarItemsForCell(docUri, cellIndex, viewType, tokenSource.token);
        if (tokenSource.token.isCancellationRequested) {
            itemLists.forEach(itemList => itemList.dispose && itemList.dispose());
            return;
        }
        const items = itemLists.map(itemList => itemList.items).flat();
        const newIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
        this._currentItemLists.forEach(itemList => itemList.dispose && itemList.dispose());
        this._currentItemLists = itemLists;
        this._currentItemIds = newIds;
    }
    dispose() {
        super.dispose();
        this._isDisposed = true;
        this._activeToken?.dispose(true);
        this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
        this._currentItemLists.forEach(itemList => itemList.dispose && itemList.dispose());
    }
}
registerNotebookContribution(ContributedStatusBarItemController.id, ContributedStatusBarItemController);
