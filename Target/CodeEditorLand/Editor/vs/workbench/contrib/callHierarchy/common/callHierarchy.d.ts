import { IRange } from '../../../../editor/common/core/range.js';
import { SymbolKind, ProviderResult, SymbolTag } from '../../../../editor/common/languages.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { LanguageFeatureRegistry } from '../../../../editor/common/languageFeatureRegistry.js';
import { URI } from '../../../../base/common/uri.js';
import { IPosition } from '../../../../editor/common/core/position.js';
import { RefCountedDisposable } from '../../../../base/common/lifecycle.js';
export declare const enum CallHierarchyDirection {
    CallsTo = "incomingCalls",
    CallsFrom = "outgoingCalls"
}
export interface CallHierarchyItem {
    _sessionId: string;
    _itemId: string;
    kind: SymbolKind;
    name: string;
    detail?: string;
    uri: URI;
    range: IRange;
    selectionRange: IRange;
    tags?: SymbolTag[];
}
export interface IncomingCall {
    from: CallHierarchyItem;
    fromRanges: IRange[];
}
export interface OutgoingCall {
    fromRanges: IRange[];
    to: CallHierarchyItem;
}
export interface CallHierarchySession {
    roots: CallHierarchyItem[];
    dispose(): void;
}
export interface CallHierarchyProvider {
    prepareCallHierarchy(document: ITextModel, position: IPosition, token: CancellationToken): ProviderResult<CallHierarchySession>;
    provideIncomingCalls(item: CallHierarchyItem, token: CancellationToken): ProviderResult<IncomingCall[]>;
    provideOutgoingCalls(item: CallHierarchyItem, token: CancellationToken): ProviderResult<OutgoingCall[]>;
}
export declare const CallHierarchyProviderRegistry: LanguageFeatureRegistry<CallHierarchyProvider>;
export declare class CallHierarchyModel {
    readonly id: string;
    readonly provider: CallHierarchyProvider;
    readonly roots: CallHierarchyItem[];
    readonly ref: RefCountedDisposable;
    static create(model: ITextModel, position: IPosition, token: CancellationToken): Promise<CallHierarchyModel | undefined>;
    readonly root: CallHierarchyItem;
    private constructor();
    dispose(): void;
    fork(item: CallHierarchyItem): CallHierarchyModel;
    resolveIncomingCalls(item: CallHierarchyItem, token: CancellationToken): Promise<IncomingCall[]>;
    resolveOutgoingCalls(item: CallHierarchyItem, token: CancellationToken): Promise<OutgoingCall[]>;
}
