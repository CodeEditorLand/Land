import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../log/common/log.js';
import type { ITerminalCommand } from '../capabilities.js';
import type { Terminal } from '@xterm/headless';
export interface IPromptInputModel extends IPromptInputModelState {
    readonly onDidStartInput: Event<IPromptInputModelState>;
    readonly onDidChangeInput: Event<IPromptInputModelState>;
    readonly onDidFinishInput: Event<IPromptInputModelState>;
    readonly onDidInterrupt: Event<IPromptInputModelState>;
    getCombinedString(): string;
}
export interface IPromptInputModelState {
    readonly value: string;
    readonly prefix: string;
    readonly suffix: string;
    readonly cursorIndex: number;
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
    private _scanForGhostText;
    private _trimContinuationPrompt;
    private _lineContainsContinuationPrompt;
    private _getContinuationPromptCellWidth;
    private _getRelativeCursorIndex;
    private _isCellStyledLikeGhostText;
    private _createStateObject;
}
