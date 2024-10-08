import { WorkbenchCompressibleAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { RenderableMatch, SearchResult } from './searchModel.js';
/**
 * Recursively expand all nodes in the search results tree that are a child of `element`
 * If `element` is not provided, it is the root node.
 */
export declare function forcedExpandRecursively(viewer: WorkbenchCompressibleAsyncDataTree<SearchResult, RenderableMatch, void>, element: RenderableMatch | undefined): Promise<void>;
