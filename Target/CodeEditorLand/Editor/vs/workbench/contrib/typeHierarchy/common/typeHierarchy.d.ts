import { IRange } from '../../../../editor/common/core/range.js';
import { SymbolKind, ProviderResult, SymbolTag } from '../../../../editor/common/languages.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { LanguageFeatureRegistry } from '../../../../editor/common/languageFeatureRegistry.js';
import { URI } from '../../../../base/common/uri.js';
import { IPosition } from '../../../../editor/common/core/position.js';
import { RefCountedDisposable } from '../../../../base/common/lifecycle.js';
export declare const enum TypeHierarchyDirection {
    Subtypes = "subtypes",
    Supertypes = "supertypes"
}
export interface TypeHierarchyItem {
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
export interface TypeHierarchySession {
    roots: TypeHierarchyItem[];
    dispose(): void;
}
export interface TypeHierarchyProvider {
    prepareTypeHierarchy(document: ITextModel, position: IPosition, token: CancellationToken): ProviderResult<TypeHierarchySession>;
    provideSupertypes(item: TypeHierarchyItem, token: CancellationToken): ProviderResult<TypeHierarchyItem[]>;
    provideSubtypes(item: TypeHierarchyItem, token: CancellationToken): ProviderResult<TypeHierarchyItem[]>;
}
export declare const TypeHierarchyProviderRegistry: LanguageFeatureRegistry<TypeHierarchyProvider>;
export declare class TypeHierarchyModel {
    readonly id: string;
    readonly provider: TypeHierarchyProvider;
    readonly roots: TypeHierarchyItem[];
    readonly ref: RefCountedDisposable;
    static create(model: ITextModel, position: IPosition, token: CancellationToken): Promise<TypeHierarchyModel | undefined>;
    readonly root: TypeHierarchyItem;
    private constructor();
    dispose(): void;
    fork(item: TypeHierarchyItem): TypeHierarchyModel;
    provideSupertypes(item: TypeHierarchyItem, token: CancellationToken): Promise<TypeHierarchyItem[]>;
    provideSubtypes(item: TypeHierarchyItem, token: CancellationToken): Promise<TypeHierarchyItem[]>;
}
