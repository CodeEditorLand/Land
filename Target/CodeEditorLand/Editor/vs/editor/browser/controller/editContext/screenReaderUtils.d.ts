import { EndOfLinePreference } from '../../../common/model.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { IComputedEditorOptions } from '../../../common/config/editorOptions.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export interface ISimpleModel {
    getLineCount(): number;
    getLineMaxColumn(lineNumber: number): number;
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    modifyPosition(position: Position, offset: number): Position;
}
export interface ScreenReaderContentState {
    value: string;
    /** the offset where selection starts inside `value` */
    selectionStart: number;
    /** the offset where selection ends inside `value` */
    selectionEnd: number;
    /** the editor range in the view coordinate system that matches the selection inside `value` */
    selection: Range;
    /** the position of the start of the `value` in the editor */
    startPositionWithinEditor: Position;
    /** the visible line count (wrapped, not necessarily matching \n characters) for the text in `value` before `selectionStart` */
    newlineCountBeforeSelection: number;
}
export declare class PagedScreenReaderStrategy {
    private static _getPageOfLine;
    private static _getRangeForPage;
    static fromEditorSelection(model: ISimpleModel, selection: Range, linesPerPage: number, trimLongText: boolean): ScreenReaderContentState;
}
export declare function ariaLabelForScreenReaderContent(options: IComputedEditorOptions, keybindingService: IKeybindingService): string;
export declare function newlinecount(text: string): number;
