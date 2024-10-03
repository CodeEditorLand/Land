import { TextSearchMatch } from '../../../../services/search/common/search.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { genericCellMatchesToTextSearchMatches, rawCellPrefix } from '../../common/searchNotebookHelpers.js';
export function getIDFromINotebookCellMatch(match) {
    if (isINotebookCellMatchWithModel(match)) {
        return match.cell.id;
    }
    else {
        return `${rawCellPrefix}${match.index}`;
    }
}
export function isINotebookFileMatchWithModel(object) {
    return 'cellResults' in object && object.cellResults instanceof Array && object.cellResults.every(isINotebookCellMatchWithModel);
}
export function isINotebookCellMatchWithModel(object) {
    return 'cell' in object;
}
export function contentMatchesToTextSearchMatches(contentMatches, cell) {
    return genericCellMatchesToTextSearchMatches(contentMatches, cell.textBuffer);
}
export function webviewMatchesToTextSearchMatches(webviewMatches) {
    return webviewMatches
        .map(rawMatch => (rawMatch.searchPreviewInfo) ?
        new TextSearchMatch(rawMatch.searchPreviewInfo.line, new Range(0, rawMatch.searchPreviewInfo.range.start, 0, rawMatch.searchPreviewInfo.range.end), undefined, rawMatch.index) : undefined).filter((e) => !!e);
}
