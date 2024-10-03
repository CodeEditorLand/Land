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
var NotebookKernelHistoryService_1;
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { LinkedMap } from '../../../../../base/common/map.js';
import { localize2 } from '../../../../../nls.js';
import { Categories } from '../../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { INotebookKernelHistoryService, INotebookKernelService } from '../../common/notebookKernelService.js';
import { INotebookLoggingService } from '../../common/notebookLoggingService.js';
const MAX_KERNELS_IN_HISTORY = 5;
let NotebookKernelHistoryService = class NotebookKernelHistoryService extends Disposable {
    static { NotebookKernelHistoryService_1 = this; }
    static { this.STORAGE_KEY = 'notebook.kernelHistory'; }
    constructor(_storageService, _notebookKernelService, _notebookLoggingService) {
        super();
        this._storageService = _storageService;
        this._notebookKernelService = _notebookKernelService;
        this._notebookLoggingService = _notebookLoggingService;
        this._mostRecentKernelsMap = {};
        this._loadState();
        this._register(this._storageService.onWillSaveState(() => this._saveState()));
        this._register(this._storageService.onDidChangeValue(1, NotebookKernelHistoryService_1.STORAGE_KEY, this._register(new DisposableStore()))(() => {
            this._loadState();
        }));
    }
    getKernels(notebook) {
        const allAvailableKernels = this._notebookKernelService.getMatchingKernel(notebook);
        const allKernels = allAvailableKernels.all;
        const selectedKernel = allAvailableKernels.selected;
        const suggested = allAvailableKernels.all.length === 1 ? allAvailableKernels.all[0] : undefined;
        this._notebookLoggingService.debug('History', `getMatchingKernels: ${allAvailableKernels.all.length} kernels available for ${notebook.uri.path}. Selected: ${allAvailableKernels.selected?.label}. Suggested: ${suggested?.label}`);
        const mostRecentKernelIds = this._mostRecentKernelsMap[notebook.notebookType] ? [...this._mostRecentKernelsMap[notebook.notebookType].values()] : [];
        const all = mostRecentKernelIds.map(kernelId => allKernels.find(kernel => kernel.id === kernelId)).filter(kernel => !!kernel);
        this._notebookLoggingService.debug('History', `mru: ${mostRecentKernelIds.length} kernels in history, ${all.length} registered already.`);
        return {
            selected: selectedKernel ?? suggested,
            all
        };
    }
    addMostRecentKernel(kernel) {
        const key = kernel.id;
        const viewType = kernel.viewType;
        const recentKeynels = this._mostRecentKernelsMap[viewType] ?? new LinkedMap();
        recentKeynels.set(key, key, 1);
        if (recentKeynels.size > MAX_KERNELS_IN_HISTORY) {
            const reserved = [...recentKeynels.entries()].slice(0, MAX_KERNELS_IN_HISTORY);
            recentKeynels.fromJSON(reserved);
        }
        this._mostRecentKernelsMap[viewType] = recentKeynels;
    }
    _saveState() {
        let notEmpty = false;
        for (const [_, kernels] of Object.entries(this._mostRecentKernelsMap)) {
            notEmpty = notEmpty || kernels.size > 0;
        }
        if (notEmpty) {
            const serialized = this._serialize();
            this._storageService.store(NotebookKernelHistoryService_1.STORAGE_KEY, JSON.stringify(serialized), 1, 0);
        }
        else {
            this._storageService.remove(NotebookKernelHistoryService_1.STORAGE_KEY, 1);
        }
    }
    _loadState() {
        const serialized = this._storageService.get(NotebookKernelHistoryService_1.STORAGE_KEY, 1);
        if (serialized) {
            try {
                this._deserialize(JSON.parse(serialized));
            }
            catch (e) {
                this._mostRecentKernelsMap = {};
            }
        }
        else {
            this._mostRecentKernelsMap = {};
        }
    }
    _serialize() {
        const result = Object.create(null);
        for (const [viewType, kernels] of Object.entries(this._mostRecentKernelsMap)) {
            result[viewType] = {
                entries: [...kernels.values()]
            };
        }
        return result;
    }
    _deserialize(serialized) {
        this._mostRecentKernelsMap = {};
        for (const [viewType, kernels] of Object.entries(serialized)) {
            const linkedMap = new LinkedMap();
            const mapValues = [];
            for (const entry of kernels.entries) {
                mapValues.push([entry, entry]);
            }
            linkedMap.fromJSON(mapValues);
            this._mostRecentKernelsMap[viewType] = linkedMap;
        }
    }
    _clear() {
        this._mostRecentKernelsMap = {};
        this._saveState();
    }
};
NotebookKernelHistoryService = NotebookKernelHistoryService_1 = __decorate([
    __param(0, IStorageService),
    __param(1, INotebookKernelService),
    __param(2, INotebookLoggingService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NotebookKernelHistoryService);
export { NotebookKernelHistoryService };
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.clearNotebookKernelsMRUCache',
            title: localize2('workbench.notebook.clearNotebookKernelsMRUCache', "Clear Notebook Kernels MRU Cache"),
            category: Categories.Developer,
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(INotebookKernelHistoryService);
        historyService._clear();
    }
});
