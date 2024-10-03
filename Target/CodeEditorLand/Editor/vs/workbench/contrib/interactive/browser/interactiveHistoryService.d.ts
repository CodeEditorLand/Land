import { HistoryNavigator2 } from '../../../../base/common/history.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { URI } from '../../../../base/common/uri.js';
export declare const IInteractiveHistoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInteractiveHistoryService>;
export interface IInteractiveHistoryService {
    readonly _serviceBrand: undefined;
    matchesCurrent(uri: URI, value: string): boolean;
    addToHistory(uri: URI, value: string): void;
    getPreviousValue(uri: URI): string | null;
    getNextValue(uri: URI): string | null;
    replaceLast(uri: URI, value: string): void;
    clearHistory(uri: URI): void;
    has(uri: URI): boolean;
}
export declare class InteractiveHistoryService extends Disposable implements IInteractiveHistoryService {
    readonly _serviceBrand: undefined;
    _history: ResourceMap<HistoryNavigator2<string>>;
    constructor();
    matchesCurrent(uri: URI, value: string): boolean;
    addToHistory(uri: URI, value: string): void;
    getPreviousValue(uri: URI): string | null;
    getNextValue(uri: URI): string | null;
    replaceLast(uri: URI, value: string): void;
    clearHistory(uri: URI): void;
    has(uri: URI): boolean;
}
