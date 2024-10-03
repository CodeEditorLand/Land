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
var SearchHistoryService_1;
import { Emitter } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { isEmptyObject } from '../../../../base/common/types.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const ISearchHistoryService = createDecorator('searchHistoryService');
let SearchHistoryService = class SearchHistoryService {
    static { SearchHistoryService_1 = this; }
    static { this.SEARCH_HISTORY_KEY = 'workbench.search.history'; }
    constructor(storageService) {
        this.storageService = storageService;
        this._onDidClearHistory = new Emitter();
        this.onDidClearHistory = this._onDidClearHistory.event;
    }
    clearHistory() {
        this.storageService.remove(SearchHistoryService_1.SEARCH_HISTORY_KEY, 1);
        this._onDidClearHistory.fire();
    }
    load() {
        let result;
        const raw = this.storageService.get(SearchHistoryService_1.SEARCH_HISTORY_KEY, 1);
        if (raw) {
            try {
                result = JSON.parse(raw);
            }
            catch (e) {
            }
        }
        return result || {};
    }
    save(history) {
        if (isEmptyObject(history)) {
            this.storageService.remove(SearchHistoryService_1.SEARCH_HISTORY_KEY, 1);
        }
        else {
            this.storageService.store(SearchHistoryService_1.SEARCH_HISTORY_KEY, JSON.stringify(history), 1, 0);
        }
    }
};
SearchHistoryService = SearchHistoryService_1 = __decorate([
    __param(0, IStorageService),
    __metadata("design:paramtypes", [Object])
], SearchHistoryService);
export { SearchHistoryService };
