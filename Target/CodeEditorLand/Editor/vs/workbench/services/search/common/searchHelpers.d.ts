import { FindMatch, ITextModel } from '../../../../editor/common/model.js';
import { ITextSearchPreviewOptions, TextSearchMatch, ITextSearchResult, ITextSearchMatch, ITextQuery } from './search.js';
export declare function editorMatchesToTextSearchResults(matches: FindMatch[], model: ITextModel, previewOptions?: ITextSearchPreviewOptions): TextSearchMatch[];
export declare function getTextSearchMatchWithModelContext(matches: ITextSearchMatch[], model: ITextModel, query: ITextQuery): ITextSearchResult[];
