import { IKeyboardEvent } from '../../../base/browser/keyboardEvent.js';
import { NavigationCommandRevealType } from '../coreCommands.js';
import { IEditorMouseEvent, IPartialEditorMouseEvent } from '../editorBrowser.js';
import { ViewUserInputEvents } from './viewUserInputEvents.js';
import { Position } from '../../common/core/position.js';
import { Selection } from '../../common/core/selection.js';
import { IEditorConfiguration } from '../../common/config/editorConfiguration.js';
import { IViewModel } from '../../common/viewModel.js';
import { IMouseWheelEvent } from '../../../base/browser/mouseEvent.js';
export interface IMouseDispatchData {
    position: Position;
    /**
     * Desired mouse column (e.g. when position.column gets clamped to text length -- clicking after text on a line).
     */
    mouseColumn: number;
    revealType: NavigationCommandRevealType;
    startedOnLineNumbers: boolean;
    inSelectionMode: boolean;
    mouseDownCount: number;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    leftButton: boolean;
    middleButton: boolean;
    onInjectedText: boolean;
}
export interface ICommandDelegate {
    paste(text: string, pasteOnNewLine: boolean, multicursorText: string[] | null, mode: string | null): void;
    type(text: string): void;
    compositionType(text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): void;
    startComposition(): void;
    endComposition(): void;
    cut(): void;
}
export declare class ViewController {
    private readonly configuration;
    private readonly viewModel;
    private readonly userInputEvents;
    private readonly commandDelegate;
    constructor(configuration: IEditorConfiguration, viewModel: IViewModel, userInputEvents: ViewUserInputEvents, commandDelegate: ICommandDelegate);
    paste(text: string, pasteOnNewLine: boolean, multicursorText: string[] | null, mode: string | null): void;
    type(text: string): void;
    compositionType(text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): void;
    compositionStart(): void;
    compositionEnd(): void;
    cut(): void;
    setSelection(modelSelection: Selection): void;
    private _validateViewColumn;
    private _hasMulticursorModifier;
    private _hasNonMulticursorModifier;
    dispatchMouse(data: IMouseDispatchData): void;
    private _usualArgs;
    moveTo(viewPosition: Position, revealType: NavigationCommandRevealType): void;
    private _moveToSelect;
    private _columnSelect;
    private _createCursor;
    private _lastCursorMoveToSelect;
    private _wordSelect;
    private _wordSelectDrag;
    private _lastCursorWordSelect;
    private _lineSelect;
    private _lineSelectDrag;
    private _lastCursorLineSelect;
    private _lastCursorLineSelectDrag;
    private _selectAll;
    private _convertViewToModelPosition;
    emitKeyDown(e: IKeyboardEvent): void;
    emitKeyUp(e: IKeyboardEvent): void;
    emitContextMenu(e: IEditorMouseEvent): void;
    emitMouseMove(e: IEditorMouseEvent): void;
    emitMouseLeave(e: IPartialEditorMouseEvent): void;
    emitMouseUp(e: IEditorMouseEvent): void;
    emitMouseDown(e: IEditorMouseEvent): void;
    emitMouseDrag(e: IEditorMouseEvent): void;
    emitMouseDrop(e: IPartialEditorMouseEvent): void;
    emitMouseDropCanceled(): void;
    emitMouseWheel(e: IMouseWheelEvent): void;
}
