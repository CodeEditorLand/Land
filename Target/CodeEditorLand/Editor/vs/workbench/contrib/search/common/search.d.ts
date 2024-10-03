import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ISearchConfiguration, ISearchConfigurationProperties } from '../../../services/search/common/search.js';
import { SymbolKind, Location, ProviderResult, SymbolTag } from '../../../../editor/common/languages.js';
import { URI } from '../../../../base/common/uri.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export interface IWorkspaceSymbol {
    name: string;
    containerName?: string;
    kind: SymbolKind;
    tags?: SymbolTag[];
    location: Location;
}
export interface IWorkspaceSymbolProvider {
    provideWorkspaceSymbols(search: string, token: CancellationToken): ProviderResult<IWorkspaceSymbol[]>;
    resolveWorkspaceSymbol?(item: IWorkspaceSymbol, token: CancellationToken): ProviderResult<IWorkspaceSymbol>;
}
export declare namespace WorkspaceSymbolProviderRegistry {
    function register(provider: IWorkspaceSymbolProvider): IDisposable;
    function all(): IWorkspaceSymbolProvider[];
}
export declare class WorkspaceSymbolItem {
    readonly symbol: IWorkspaceSymbol;
    readonly provider: IWorkspaceSymbolProvider;
    constructor(symbol: IWorkspaceSymbol, provider: IWorkspaceSymbolProvider);
}
export declare function getWorkspaceSymbols(query: string, token?: CancellationToken): Promise<WorkspaceSymbolItem[]>;
export interface IWorkbenchSearchConfigurationProperties extends ISearchConfigurationProperties {
    quickOpen: {
        includeSymbols: boolean;
        includeHistory: boolean;
        history: {
            filterSortOrder: 'default' | 'recency';
        };
    };
}
export interface IWorkbenchSearchConfiguration extends ISearchConfiguration {
    search: IWorkbenchSearchConfigurationProperties;
}
export declare function getOutOfWorkspaceEditorResources(accessor: ServicesAccessor): URI[];
export interface IFilterAndRange {
    filter: string;
    range: IRange;
}
export declare function extractRangeFromFilter(filter: string, unless?: string[]): IFilterAndRange | undefined;
export declare enum SearchUIState {
    Idle = 0,
    Searching = 1,
    SlowSearch = 2
}
export declare const SearchStateKey: RawContextKey<SearchUIState>;
export interface NotebookPriorityInfo {
    isFromSettings: boolean;
    filenamePatterns: string[];
}
