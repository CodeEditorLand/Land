import { Event } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ChatAgentLocation } from './chatAgents.js';
export interface IChatHistoryEntry {
    text: string;
    state?: any;
}
export declare const IChatWidgetHistoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatWidgetHistoryService>;
export interface IChatWidgetHistoryService {
    _serviceBrand: undefined;
    readonly onDidClearHistory: Event<void>;
    clearHistory(): void;
    getHistory(location: ChatAgentLocation): IChatHistoryEntry[];
    saveHistory(location: ChatAgentLocation, history: IChatHistoryEntry[]): void;
}
export declare class ChatWidgetHistoryService implements IChatWidgetHistoryService {
    _serviceBrand: undefined;
    private memento;
    private viewState;
    private readonly _onDidClearHistory;
    readonly onDidClearHistory: Event<void>;
    constructor(storageService: IStorageService);
    getHistory(location: ChatAgentLocation): IChatHistoryEntry[];
    private getKey;
    saveHistory(location: ChatAgentLocation, history: IChatHistoryEntry[]): void;
    clearHistory(): void;
}
