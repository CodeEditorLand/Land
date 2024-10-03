import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, IActionOptions, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder, IEditorContribution } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
import { TextEdit } from '../../../common/languages.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
export declare class IndentationToSpacesAction extends EditorAction {
    static readonly ID = "editor.action.indentationToSpaces";
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class IndentationToTabsAction extends EditorAction {
    static readonly ID = "editor.action.indentationToTabs";
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ChangeIndentationSizeAction extends EditorAction {
    private readonly insertSpaces;
    private readonly displaySizeOnly;
    constructor(insertSpaces: boolean, displaySizeOnly: boolean, opts: IActionOptions);
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class IndentUsingTabs extends ChangeIndentationSizeAction {
    static readonly ID = "editor.action.indentUsingTabs";
    constructor();
}
export declare class IndentUsingSpaces extends ChangeIndentationSizeAction {
    static readonly ID = "editor.action.indentUsingSpaces";
    constructor();
}
export declare class ChangeTabDisplaySize extends ChangeIndentationSizeAction {
    static readonly ID = "editor.action.changeTabDisplaySize";
    constructor();
}
export declare class DetectIndentation extends EditorAction {
    static readonly ID = "editor.action.detectIndentation";
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ReindentLinesAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ReindentSelectedLinesAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class AutoIndentOnPasteCommand implements ICommand {
    private readonly _edits;
    private readonly _initialSelection;
    private _selectionId;
    constructor(edits: TextEdit[], initialSelection: Selection);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class AutoIndentOnPaste implements IEditorContribution {
    private readonly editor;
    private readonly _languageConfigurationService;
    static readonly ID = "editor.contrib.autoIndentOnPaste";
    private readonly callOnDispose;
    private readonly callOnModel;
    constructor(editor: ICodeEditor, _languageConfigurationService: ILanguageConfigurationService);
    private update;
    trigger(range: Range): void;
    private rangeContainsOnlyWhitespaceCharacters;
    private shouldIgnoreLine;
    dispose(): void;
}
export declare class IndentationToSpacesCommand implements ICommand {
    private readonly selection;
    private tabSize;
    private selectionId;
    constructor(selection: Selection, tabSize: number);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class IndentationToTabsCommand implements ICommand {
    private readonly selection;
    private tabSize;
    private selectionId;
    constructor(selection: Selection, tabSize: number);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
