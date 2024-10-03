import { Disposable } from '../../../../base/common/lifecycle.js';
import './bracketMatching.css';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
export declare class BracketMatchingController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.bracketMatchingController";
    static get(editor: ICodeEditor): BracketMatchingController | null;
    private readonly _editor;
    private _lastBracketsData;
    private _lastVersionId;
    private readonly _decorations;
    private readonly _updateBracketsSoon;
    private _matchBrackets;
    constructor(editor: ICodeEditor);
    jumpToBracket(): void;
    selectToBracket(selectBrackets: boolean): void;
    removeBrackets(editSource?: string): void;
    private static readonly _DECORATION_OPTIONS_WITH_OVERVIEW_RULER;
    private static readonly _DECORATION_OPTIONS_WITHOUT_OVERVIEW_RULER;
    private _updateBrackets;
    private _recomputeBrackets;
}
