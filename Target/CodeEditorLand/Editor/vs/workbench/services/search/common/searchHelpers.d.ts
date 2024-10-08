import { FindMatch, ITextModel } from '../../../../editor/common/model.js';
import { ITextSearchPreviewOptions, TextSearchMatch, ITextSearchResult, ITextSearchMatch, ITextQuery } from './search.js';
/**
 * Combine a set of FindMatches into a set of TextSearchResults. They should be grouped by matches that start on the same line that the previous match ends on.
 */
export declare function editorMatchesToTextSearchResults(matches: FindMatch[], model: ITextModel, previewOptions?: ITextSearchPreviewOptions): TextSearchMatch[];
export declare function getTextSearchMatchWithModelContext(matches: ITextSearchMatch[], model: ITextModel, query: ITextQuery): ITextSearchResult[];
