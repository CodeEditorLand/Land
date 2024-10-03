import { ICodeEditor } from './editorBrowser.js';
import { EditorCommand } from './editorExtensions.js';
import { CursorMove as CursorMove_ } from '../common/cursor/cursorMoveCommands.js';
import { IPosition } from '../common/core/position.js';
import { ICommandMetadata } from '../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../platform/instantiation/common/instantiation.js';
import { IViewModel } from '../common/viewModel.js';
import { ISelection } from '../common/core/selection.js';
export declare abstract class CoreEditorCommand<T> extends EditorCommand {
    runEditorCommand(accessor: ServicesAccessor | null, editor: ICodeEditor, args?: Partial<T> | null): void;
    abstract runCoreEditorCommand(viewModel: IViewModel, args: Partial<T>): void;
}
export declare namespace EditorScroll_ {
    const metadata: ICommandMetadata;
    const RawDirection: {
        Up: string;
        Right: string;
        Down: string;
        Left: string;
    };
    const RawUnit: {
        Line: string;
        WrappedLine: string;
        Page: string;
        HalfPage: string;
        Editor: string;
        Column: string;
    };
    interface RawArguments {
        to: string;
        by?: string;
        value?: number;
        revealCursor?: boolean;
        select?: boolean;
    }
    function parse(args: Partial<RawArguments>): ParsedArguments | null;
    interface ParsedArguments {
        direction: Direction;
        unit: Unit;
        value: number;
        revealCursor: boolean;
        select: boolean;
    }
    const enum Direction {
        Up = 1,
        Right = 2,
        Down = 3,
        Left = 4
    }
    const enum Unit {
        Line = 1,
        WrappedLine = 2,
        Page = 3,
        HalfPage = 4,
        Editor = 5,
        Column = 6
    }
}
export declare namespace RevealLine_ {
    const metadata: ICommandMetadata;
    interface RawArguments {
        lineNumber?: number | string;
        at?: string;
    }
    const RawAtArgument: {
        Top: string;
        Center: string;
        Bottom: string;
    };
}
export declare const enum NavigationCommandRevealType {
    Regular = 0,
    Minimal = 1,
    None = 2
}
export declare namespace CoreNavigationCommands {
    interface BaseCommandOptions {
        source?: 'mouse' | 'keyboard' | string;
    }
    interface MoveCommandOptions extends BaseCommandOptions {
        position: IPosition;
        viewPosition?: IPosition;
        revealType: NavigationCommandRevealType;
    }
    const MoveTo: CoreEditorCommand<MoveCommandOptions>;
    const MoveToSelect: CoreEditorCommand<MoveCommandOptions>;
    interface ColumnSelectCommandOptions extends BaseCommandOptions {
        position: IPosition;
        viewPosition: IPosition;
        mouseColumn: number;
        doColumnSelect: boolean;
    }
    const ColumnSelect: CoreEditorCommand<ColumnSelectCommandOptions>;
    const CursorColumnSelectLeft: CoreEditorCommand<BaseCommandOptions>;
    const CursorColumnSelectRight: CoreEditorCommand<BaseCommandOptions>;
    const CursorColumnSelectUp: CoreEditorCommand<BaseCommandOptions>;
    const CursorColumnSelectPageUp: CoreEditorCommand<BaseCommandOptions>;
    const CursorColumnSelectDown: CoreEditorCommand<BaseCommandOptions>;
    const CursorColumnSelectPageDown: CoreEditorCommand<BaseCommandOptions>;
    class CursorMoveImpl extends CoreEditorCommand<CursorMove_.RawArguments> {
        constructor();
        runCoreEditorCommand(viewModel: IViewModel, args: Partial<BaseCommandOptions & CursorMove_.RawArguments>): void;
        private _runCursorMove;
        private static _move;
    }
    const CursorMove: CursorMoveImpl;
    interface CursorMoveCommandOptions extends BaseCommandOptions {
        pageSize?: number;
    }
    const CursorLeft: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorLeftSelect: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorRight: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorRightSelect: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorUp: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorUpSelect: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorPageUp: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorPageUpSelect: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorDown: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorDownSelect: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorPageDown: CoreEditorCommand<CursorMoveCommandOptions>;
    const CursorPageDownSelect: CoreEditorCommand<CursorMoveCommandOptions>;
    interface CreateCursorCommandOptions extends MoveCommandOptions {
        wholeLine?: boolean;
    }
    const CreateCursor: CoreEditorCommand<CreateCursorCommandOptions>;
    const LastCursorMoveToSelect: CoreEditorCommand<MoveCommandOptions>;
    const CursorHome: CoreEditorCommand<BaseCommandOptions>;
    const CursorHomeSelect: CoreEditorCommand<BaseCommandOptions>;
    const CursorLineStart: CoreEditorCommand<BaseCommandOptions>;
    const CursorLineStartSelect: CoreEditorCommand<BaseCommandOptions>;
    interface EndCommandOptions extends BaseCommandOptions {
        sticky?: boolean;
    }
    const CursorEnd: CoreEditorCommand<EndCommandOptions>;
    const CursorEndSelect: CoreEditorCommand<EndCommandOptions>;
    const CursorLineEnd: CoreEditorCommand<BaseCommandOptions>;
    const CursorLineEndSelect: CoreEditorCommand<BaseCommandOptions>;
    const CursorTop: CoreEditorCommand<BaseCommandOptions>;
    const CursorTopSelect: CoreEditorCommand<BaseCommandOptions>;
    const CursorBottom: CoreEditorCommand<BaseCommandOptions>;
    const CursorBottomSelect: CoreEditorCommand<BaseCommandOptions>;
    type EditorScrollCommandOptions = EditorScroll_.RawArguments & BaseCommandOptions;
    class EditorScrollImpl extends CoreEditorCommand<EditorScrollCommandOptions> {
        constructor();
        determineScrollMethod(args: EditorScroll_.ParsedArguments): ((viewModel: IViewModel, source: string | null | undefined, args: EditorScroll_.ParsedArguments) => void) | null;
        runCoreEditorCommand(viewModel: IViewModel, args: Partial<EditorScrollCommandOptions>): void;
        _runVerticalEditorScroll(viewModel: IViewModel, source: string | null | undefined, args: EditorScroll_.ParsedArguments): void;
        private _computeDesiredScrollTop;
        _runHorizontalEditorScroll(viewModel: IViewModel, source: string | null | undefined, args: EditorScroll_.ParsedArguments): void;
        _computeDesiredScrollLeft(viewModel: IViewModel, args: EditorScroll_.ParsedArguments): number;
    }
    const EditorScroll: EditorScrollImpl;
    const ScrollLineUp: CoreEditorCommand<BaseCommandOptions>;
    const ScrollPageUp: CoreEditorCommand<BaseCommandOptions>;
    const ScrollEditorTop: CoreEditorCommand<BaseCommandOptions>;
    const ScrollLineDown: CoreEditorCommand<BaseCommandOptions>;
    const ScrollPageDown: CoreEditorCommand<BaseCommandOptions>;
    const ScrollEditorBottom: CoreEditorCommand<BaseCommandOptions>;
    const ScrollLeft: CoreEditorCommand<BaseCommandOptions>;
    const ScrollRight: CoreEditorCommand<BaseCommandOptions>;
    const WordSelect: CoreEditorCommand<MoveCommandOptions>;
    const WordSelectDrag: CoreEditorCommand<MoveCommandOptions>;
    const LastCursorWordSelect: CoreEditorCommand<MoveCommandOptions>;
    const LineSelect: CoreEditorCommand<MoveCommandOptions>;
    const LineSelectDrag: CoreEditorCommand<MoveCommandOptions>;
    const LastCursorLineSelect: CoreEditorCommand<MoveCommandOptions>;
    const LastCursorLineSelectDrag: CoreEditorCommand<MoveCommandOptions>;
    const CancelSelection: CoreEditorCommand<BaseCommandOptions>;
    const RemoveSecondaryCursors: CoreEditorCommand<BaseCommandOptions>;
    type RevealLineCommandOptions = RevealLine_.RawArguments & BaseCommandOptions;
    const RevealLine: CoreEditorCommand<RevealLineCommandOptions>;
    const SelectAll: {
        runDOMCommand(activeElement: Element): void;
        runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, args: unknown): void;
        runCoreEditorCommand(viewModel: IViewModel, args: unknown): void;
        _runEditorCommand(accessor: ServicesAccessor | null, editor: ICodeEditor, args: unknown): boolean | Promise<void>;
    };
    interface SetSelectionCommandOptions extends BaseCommandOptions {
        selection: ISelection;
    }
    const SetSelection: CoreEditorCommand<SetSelectionCommandOptions>;
}
export declare namespace CoreEditingCommands {
    abstract class CoreEditingCommand extends EditorCommand {
        runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, args: unknown): void;
        abstract runCoreEditingCommand(editor: ICodeEditor, viewModel: IViewModel, args: unknown): void;
    }
    const LineBreakInsert: EditorCommand;
    const Outdent: EditorCommand;
    const Tab: EditorCommand;
    const DeleteLeft: EditorCommand;
    const DeleteRight: EditorCommand;
    const Undo: {
        runDOMCommand(activeElement: Element): void;
        runEditorCommand(accessor: ServicesAccessor | null, editor: ICodeEditor, args: unknown): void | Promise<void>;
        _runEditorCommand(accessor: ServicesAccessor | null, editor: ICodeEditor, args: unknown): boolean | Promise<void>;
    };
    const Redo: {
        runDOMCommand(activeElement: Element): void;
        runEditorCommand(accessor: ServicesAccessor | null, editor: ICodeEditor, args: unknown): void | Promise<void>;
        _runEditorCommand(accessor: ServicesAccessor | null, editor: ICodeEditor, args: unknown): boolean | Promise<void>;
    };
}
