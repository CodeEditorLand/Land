import { ICodeEditor, IContentWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { CommentThreadState } from '../../../../editor/common/languages.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare const overviewRulerCommentingRangeForeground: string;
export declare class CommentGlyphWidget extends Disposable {
    static description: string;
    private _lineNumber;
    private _editor;
    private _threadState;
    private readonly _commentsDecorations;
    private _commentsOptions;
    private readonly _onDidChangeLineNumber;
    readonly onDidChangeLineNumber: import("../../../workbench.web.main.internal.js").Event<number>;
    constructor(editor: ICodeEditor, lineNumber: number);
    private createDecorationOptions;
    setThreadState(state: CommentThreadState | undefined): void;
    private _updateDecorations;
    setLineNumber(lineNumber: number): void;
    getPosition(): IContentWidgetPosition;
}
