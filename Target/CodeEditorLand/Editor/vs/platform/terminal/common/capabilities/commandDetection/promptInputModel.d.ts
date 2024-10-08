import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../log/common/log.js';
import type { ITerminalCommand } from '../capabilities.js';
import type { Terminal } from '@xterm/headless';
/**
 * A model of the prompt input state using shell integration and analyzing the terminal buffer. This
 * may not be 100% accurate but provides a best guess.
 */
export interface IPromptInputModel extends IPromptInputModelState {
    readonly onDidStartInput: Event<IPromptInputModelState>;
    readonly onDidChangeInput: Event<IPromptInputModelState>;
    readonly onDidFinishInput: Event<IPromptInputModelState>;
    /**
     * Fires immediately before {@link onDidFinishInput} when a SIGINT/Ctrl+C/^C is detected.
     */
    readonly onDidInterrupt: Event<IPromptInputModelState>;
    /**
     * Gets the prompt input as a user-friendly string where `|` is the cursor position and `[` and
     * `]` wrap any ghost text.
     */
    getCombinedString(): string;
}
export interface IPromptInputModelState {
    /**
     * The full prompt input include ghost text.
     */
    readonly value: string;
    /**
     * The prompt input up to the cursor index, this will always exclude the ghost text.
     */
    readonly prefix: string;
    /**
     * The prompt input from the cursor to the end, this _does not_ include ghost text.
     */
    readonly suffix: string;
    /**
     * The index of the cursor in {@link value}.
     */
    readonly cursorIndex: number;
    /**
     * The index of the start of ghost text in {@link value}. This is -1 when there is no ghost
     * text.
     */
    readonly ghostTextIndex: number;
}
export interface ISerializedPromptInputModel {
    readonly modelState: IPromptInputModelState;
    readonly commandStartX: number;
    readonly lastPromptLine: string | undefined;
    readonly continuationPrompt: string | undefined;
    readonly lastUserInput: string;
}
export declare class PromptInputModel extends Disposable implements IPromptInputModel {
    private readonly _xterm;
    private readonly _logService;
    private _state;
    private _commandStartMarker;
    private _commandStartX;
    private _lastPromptLine;
    private _continuationPrompt;
    private _lastUserInput;
    private _value;
    get value(): string;
    get prefix(): string;
    get suffix(): string;
    private _cursorIndex;
    get cursorIndex(): number;
    private _ghostTextIndex;
    get ghostTextIndex(): number;
    private readonly _onDidStartInput;
    readonly onDidStartInput: Event<IPromptInputModelState>;
    private readonly _onDidChangeInput;
    readonly onDidChangeInput: Event<IPromptInputModelState>;
    private readonly _onDidFinishInput;
    readonly onDidFinishInput: Event<IPromptInputModelState>;
    private readonly _onDidInterrupt;
    readonly onDidInterrupt: Event<IPromptInputModelState>;
    constructor(_xterm: Terminal, onCommandStart: Event<ITerminalCommand>, onCommandExecuted: Event<ITerminalCommand>, _logService: ILogService);
    private _logCombinedStringIfTrace;
    setContinuationPrompt(value: string): void;
    setLastPromptLine(value: string): void;
    setConfidentCommandLine(value: string): void;
    getCombinedString(): string;
    serialize(): ISerializedPromptInputModel;
    deserialize(serialized: ISerializedPromptInputModel): void;
    private _handleCommandStart;
    private _handleCommandExecuted;
    private _sync;
    private _doSync;
    private _handleUserInput;
    /**
     * Detect ghost text by looking for italic or dim text in or after the cursor and
     * non-italic/dim text in the cell closest non-whitespace cell before the cursor.
     */
    private _scanForGhostText;
    private _trimContinuationPrompt;
    private _lineContainsContinuationPrompt;
    private _getContinuationPromptCellWidth;
    private _getRelativeCursorIndex;
    private _isCellStyledLikeGhostText;
    private _createStateObject;
}
