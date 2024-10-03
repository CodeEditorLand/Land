import { WorkbenchCompressibleAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { RenderableMatch, SearchResult } from './searchModel.js';
export interface ISearchActionContext {
    readonly viewer: WorkbenchCompressibleAsyncDataTree<SearchResult, RenderableMatch>;
    readonly element: RenderableMatch;
}
export interface IFindInFilesArgs {
    query?: string;
    replace?: string;
    preserveCase?: boolean;
    triggerSearch?: boolean;
    filesToInclude?: string;
    filesToExclude?: string;
    isRegex?: boolean;
    isCaseSensitive?: boolean;
    matchWholeWord?: boolean;
    useExcludeSettingsAndIgnoreFiles?: boolean;
    onlyOpenEditors?: boolean;
}
export declare function getElementToFocusAfterRemoved(viewer: WorkbenchCompressibleAsyncDataTree<SearchResult, RenderableMatch>, element: RenderableMatch, elementsToRemove: RenderableMatch[]): Promise<RenderableMatch | undefined>;
export declare function getLastNodeFromSameType(viewer: WorkbenchCompressibleAsyncDataTree<SearchResult, RenderableMatch>, element: RenderableMatch): Promise<RenderableMatch | undefined>;
