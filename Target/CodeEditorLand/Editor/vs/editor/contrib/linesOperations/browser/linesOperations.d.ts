import { IActiveCodeEditor, ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, IActionOptions, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
export declare class DuplicateSelectionAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare abstract class AbstractSortLinesAction extends EditorAction {
    private readonly descending;
    constructor(descending: boolean, opts: IActionOptions);
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class SortLinesAscendingAction extends AbstractSortLinesAction {
    constructor();
}
export declare class SortLinesDescendingAction extends AbstractSortLinesAction {
    constructor();
}
export declare class DeleteDuplicateLinesAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class TrimTrailingWhitespaceAction extends EditorAction {
    static readonly ID = "editor.action.trimTrailingWhitespace";
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class DeleteLinesAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
    private _getLinesToRemove;
}
export declare class IndentLinesAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class InsertLineBeforeAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class InsertLineAfterAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare abstract class AbstractDeleteAllToBoundaryAction extends EditorAction {
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
    /**
     * Compute the cursor state after the edit operations were applied.
     */
    protected abstract _getEndCursorState(primaryCursor: Range, rangesToDelete: Range[]): Selection[];
    protected abstract _getRangesToDelete(editor: IActiveCodeEditor): Range[];
}
export declare class DeleteAllLeftAction extends AbstractDeleteAllToBoundaryAction {
    constructor();
    protected _getEndCursorState(primaryCursor: Range, rangesToDelete: Range[]): Selection[];
    protected _getRangesToDelete(editor: IActiveCodeEditor): Range[];
}
export declare class DeleteAllRightAction extends AbstractDeleteAllToBoundaryAction {
    constructor();
    protected _getEndCursorState(primaryCursor: Range, rangesToDelete: Range[]): Selection[];
    protected _getRangesToDelete(editor: IActiveCodeEditor): Range[];
}
export declare class JoinLinesAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class TransposeAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare abstract class AbstractCaseAction extends EditorAction {
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
    protected abstract _modifyText(text: string, wordSeparators: string): string;
}
export declare class UpperCaseAction extends AbstractCaseAction {
    constructor();
    protected _modifyText(text: string, wordSeparators: string): string;
}
export declare class LowerCaseAction extends AbstractCaseAction {
    constructor();
    protected _modifyText(text: string, wordSeparators: string): string;
}
declare class BackwardsCompatibleRegExp {
    private readonly _pattern;
    private readonly _flags;
    private _actual;
    private _evaluated;
    constructor(_pattern: string, _flags: string);
    get(): RegExp | null;
    isSupported(): boolean;
}
export declare class TitleCaseAction extends AbstractCaseAction {
    static titleBoundary: BackwardsCompatibleRegExp;
    constructor();
    protected _modifyText(text: string, wordSeparators: string): string;
}
export declare class SnakeCaseAction extends AbstractCaseAction {
    static caseBoundary: BackwardsCompatibleRegExp;
    static singleLetters: BackwardsCompatibleRegExp;
    constructor();
    protected _modifyText(text: string, wordSeparators: string): string;
}
export declare class CamelCaseAction extends AbstractCaseAction {
    static wordBoundary: BackwardsCompatibleRegExp;
    constructor();
    protected _modifyText(text: string, wordSeparators: string): string;
}
export declare class PascalCaseAction extends AbstractCaseAction {
    static wordBoundary: BackwardsCompatibleRegExp;
    static wordBoundaryToMaintain: BackwardsCompatibleRegExp;
    constructor();
    protected _modifyText(text: string, wordSeparators: string): string;
}
export declare class KebabCaseAction extends AbstractCaseAction {
    static isSupported(): boolean;
    private static caseBoundary;
    private static singleLetters;
    private static underscoreBoundary;
    constructor();
    protected _modifyText(text: string, _: string): string;
}
export {};
