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
    selectionStart: number;
    selectionEnd: number;
    selection: Range;
    newlineCountBeforeSelection: number;
}
export declare class PagedScreenReaderStrategy {
    private static _getPageOfLine;
    private static _getRangeForPage;
    static fromEditorSelection(model: ISimpleModel, selection: Range, linesPerPage: number, trimLongText: boolean): ScreenReaderContentState;
}
export declare function ariaLabelForScreenReaderContent(options: IComputedEditorOptions, keybindingService: IKeybindingService): string;
export declare function newlinecount(text: string): number;
