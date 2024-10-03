import { FindMatch, IReadonlyTextBuffer } from '../../../../editor/common/model.js';
import { TextSearchMatch, IFileMatch, ITextSearchMatch } from '../../../services/search/common/search.js';
import { URI, UriComponents } from '../../../../base/common/uri.js';
export type IRawClosedNotebookFileMatch = INotebookFileMatchNoModel<UriComponents>;
export interface INotebookFileMatchNoModel<U extends UriComponents = URI> extends IFileMatch<U> {
    cellResults: INotebookCellMatchNoModel<U>[];
}
export interface INotebookCellMatchNoModel<U extends UriComponents = URI> {
    index: number;
    contentResults: ITextSearchMatch<U>[];
    webviewResults: ITextSearchMatch<U>[];
}
export declare function isINotebookFileMatchNoModel(object: IFileMatch): object is INotebookFileMatchNoModel;
export declare const rawCellPrefix = "rawCell#";
export declare function genericCellMatchesToTextSearchMatches(contentMatches: FindMatch[], buffer: IReadonlyTextBuffer): TextSearchMatch[];
