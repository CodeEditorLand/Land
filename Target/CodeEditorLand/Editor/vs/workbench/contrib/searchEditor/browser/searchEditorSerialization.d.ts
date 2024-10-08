import { URI } from '../../../../base/common/uri.js';
import './media/searchEditor.css';
import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { Range } from '../../../../editor/common/core/range.js';
import type { ITextModel } from '../../../../editor/common/model.js';
import { SearchResult } from '../../search/browser/searchModel.js';
import type { SearchConfiguration } from './searchEditorInput.js';
import { SearchSortOrder } from '../../../services/search/common/search.js';
export declare const serializeSearchConfiguration: (config: Partial<SearchConfiguration>) => string;
export declare const extractSearchQueryFromModel: (model: ITextModel) => SearchConfiguration;
export declare const defaultSearchConfig: () => SearchConfiguration;
export declare const extractSearchQueryFromLines: (lines: string[]) => SearchConfiguration;
export declare const serializeSearchResultForEditor: (searchResult: SearchResult, rawIncludePattern: string, rawExcludePattern: string, contextLines: number, labelFormatter: (x: URI) => string, sortOrder: SearchSortOrder, limitHit?: boolean) => {
    matchRanges: Range[];
    text: string;
    config: Partial<SearchConfiguration>;
};
export declare const parseSavedSearchEditor: (accessor: ServicesAccessor, resource: URI) => Promise<{
    config: SearchConfiguration;
    text: string;
}>;
export declare const parseSerializedSearchEditor: (text: string) => {
    config: SearchConfiguration;
    text: string;
};
