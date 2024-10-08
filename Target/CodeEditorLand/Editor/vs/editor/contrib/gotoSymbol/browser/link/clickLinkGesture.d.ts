import { IKeyboardEvent } from '../../../../../base/browser/keyboardEvent.js';
import { Event } from '../../../../../base/common/event.js';
import { KeyCode } from '../../../../../base/common/keyCodes.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor, IEditorMouseEvent, IMouseTarget } from '../../../../browser/editorBrowser.js';
/**
 * An event that encapsulates the various trigger modifiers logic needed for go to definition.
 */
export declare class ClickLinkMouseEvent {
    readonly target: IMouseTarget;
    readonly hasTriggerModifier: boolean;
    readonly hasSideBySideModifier: boolean;
    readonly isNoneOrSingleMouseDown: boolean;
    readonly isLeftClick: boolean;
    readonly isMiddleClick: boolean;
    readonly isRightClick: boolean;
    constructor(source: IEditorMouseEvent, opts: ClickLinkOptions);
}
/**
 * An event that encapsulates the various trigger modifiers logic needed for go to definition.
 */
export declare class ClickLinkKeyboardEvent {
    readonly keyCodeIsTriggerKey: boolean;
    readonly keyCodeIsSideBySideKey: boolean;
    readonly hasTriggerModifier: boolean;
    constructor(source: IKeyboardEvent, opts: ClickLinkOptions);
}
export type TriggerModifier = 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey';
export declare class ClickLinkOptions {
    readonly triggerKey: KeyCode;
    readonly triggerModifier: TriggerModifier;
    readonly triggerSideBySideKey: KeyCode;
    readonly triggerSideBySideModifier: TriggerModifier;
    constructor(triggerKey: KeyCode, triggerModifier: TriggerModifier, triggerSideBySideKey: KeyCode, triggerSideBySideModifier: TriggerModifier);
    equals(other: ClickLinkOptions): boolean;
}
export interface IClickLinkGestureOptions {
    /**
     * Return 0 if the mouse event should not be considered.
     */
    extractLineNumberFromMouseEvent?: (e: ClickLinkMouseEvent) => number;
}
export declare class ClickLinkGesture extends Disposable {
    private readonly _onMouseMoveOrRelevantKeyDown;
    readonly onMouseMoveOrRelevantKeyDown: Event<[ClickLinkMouseEvent, ClickLinkKeyboardEvent | null]>;
    private readonly _onExecute;
    readonly onExecute: Event<ClickLinkMouseEvent>;
    private readonly _onCancel;
    readonly onCancel: Event<void>;
    private readonly _editor;
    private readonly _extractLineNumberFromMouseEvent;
    private _opts;
    private _lastMouseMoveEvent;
    private _hasTriggerKeyOnMouseDown;
    private _lineNumberOnMouseDown;
    constructor(editor: ICodeEditor, opts?: IClickLinkGestureOptions);
    private _onDidChangeCursorSelection;
    private _onEditorMouseMove;
    private _onEditorMouseDown;
    private _onEditorMouseUp;
    private _onEditorKeyDown;
    private _onEditorKeyUp;
    private _resetHandler;
}
