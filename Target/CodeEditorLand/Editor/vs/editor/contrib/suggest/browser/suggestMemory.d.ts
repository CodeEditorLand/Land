import { IPosition } from '../../../common/core/position.js';
import { ITextModel } from '../../../common/model.js';
import { CompletionItemKind } from '../../../common/languages.js';
import { CompletionItem } from './suggest.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare abstract class Memory {
    readonly name: MemMode;
    constructor(name: MemMode);
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
    abstract memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    abstract toJSON(): object | undefined;
    abstract fromJSON(data: object): void;
}
export declare class NoMemory extends Memory {
    constructor();
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    toJSON(): undefined;
    fromJSON(): void;
}
export interface MemItem {
    type: string | CompletionItemKind;
    insertText: string;
    touch: number;
}
export declare class LRUMemory extends Memory {
    constructor();
    private _cache;
    private _seq;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
    toJSON(): object;
    fromJSON(data: [string, MemItem][]): void;
}
export declare class PrefixMemory extends Memory {
    constructor();
    private _trie;
    private _seq;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
    toJSON(): object;
    fromJSON(data: [string, MemItem][]): void;
}
export type MemMode = 'first' | 'recentlyUsed' | 'recentlyUsedByPrefix';
export declare class SuggestMemoryService implements ISuggestMemoryService {
    private readonly _storageService;
    private readonly _configService;
    private static readonly _strategyCtors;
    private static readonly _storagePrefix;
    readonly _serviceBrand: undefined;
    private readonly _persistSoon;
    private readonly _disposables;
    private _strategy?;
    constructor(_storageService: IStorageService, _configService: IConfigurationService);
    dispose(): void;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
    private _withStrategy;
    private _saveState;
}
export declare const ISuggestMemoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISuggestMemoryService>;
export interface ISuggestMemoryService {
    readonly _serviceBrand: undefined;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
}
