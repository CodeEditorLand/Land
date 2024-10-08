import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { ITerminalProcessManager } from '../../../terminal/common/terminal.js';
import type { IBuffer, IBufferCell, IDisposable, ITerminalAddon, Terminal } from '@xterm/xterm';
import { type ITerminalTypeAheadConfiguration } from '../common/terminalTypeAheadConfiguration.js';
interface ICoordinate {
    x: number;
    y: number;
    baseY: number;
}
declare class Cursor implements ICoordinate {
    readonly rows: number;
    readonly cols: number;
    private readonly _buffer;
    private _x;
    private _y;
    private _baseY;
    get x(): number;
    get y(): number;
    get baseY(): number;
    get coordinate(): ICoordinate;
    constructor(rows: number, cols: number, _buffer: IBuffer);
    getLine(): any;
    getCell(loadInto?: IBufferCell): any;
    moveTo(coordinate: ICoordinate): string;
    clone(): Cursor;
    move(x: number, y: number): string;
    shift(x?: number, y?: number): string;
    moveInstruction(): string;
}
declare const enum MatchResult {
    /** matched successfully */
    Success = 0,
    /** failed to match */
    Failure = 1,
    /** buffer data, it might match in the future one more data comes in */
    Buffer = 2
}
export interface IPrediction {
    /**
     * Whether applying this prediction can modify the style attributes of the
     * terminal. If so it means we need to reset the cursor style if it's
     * rolled back.
     */
    readonly affectsStyle?: boolean;
    /**
     * If set to false, the prediction will not be cleared if no input is
     * received from the server.
     */
    readonly clearAfterTimeout?: boolean;
    /**
     * Returns a sequence to apply the prediction.
     * @param buffer to write to
     * @param cursor position to write the data. Should advance the cursor.
     * @returns a string to be written to the user terminal, or optionally a
     * string for the user terminal and real pty.
     */
    apply(buffer: IBuffer, cursor: Cursor): string;
    /**
     * Returns a sequence to roll back a previous `apply()` call. If
     * `rollForwards` is not given, then this is also called if a prediction
     * is correct before show the user's data.
     */
    rollback(cursor: Cursor): string;
    /**
     * If available, this will be called when the prediction is correct.
     */
    rollForwards(cursor: Cursor, withInput: string): string;
    /**
     * Returns whether the given input is one expected by this prediction.
     * @param input reader for the input the PTY is giving
     * @param lookBehind the last successfully-made prediction, if any
     */
    matches(input: StringReader, lookBehind?: IPrediction): MatchResult;
}
declare class StringReader {
    private readonly _input;
    index: number;
    get remaining(): number;
    get eof(): boolean;
    get rest(): string;
    constructor(_input: string);
    /**
     * Advances the reader and returns the character if it matches.
     */
    eatChar(char: string): string | undefined;
    /**
     * Advances the reader and returns the string if it matches.
     */
    eatStr(substr: string): string | undefined;
    /**
     * Matches and eats the substring character-by-character. If EOF is reached
     * before the substring is consumed, it will buffer. Index is not moved
     * if it's not a match.
     */
    eatGradually(substr: string): MatchResult;
    /**
     * Advances the reader and returns the regex if it matches.
     */
    eatRe(re: RegExp): RegExpExecArray | undefined;
    /**
     * Advances the reader and returns the character if the code matches.
     */
    eatCharCode(min?: number, max?: number): number | undefined;
}
export declare class PredictionStats extends Disposable {
    private readonly _stats;
    private _index;
    private readonly _addedAtTime;
    private readonly _changeEmitter;
    readonly onChange: import("../../../../workbench.web.main.internal.js").Event<void>;
    /**
     * Gets the percent (0-1) of predictions that were accurate.
     */
    get accuracy(): number;
    /**
     * Gets the number of recorded stats.
     */
    get sampleSize(): number;
    /**
     * Gets latency stats of successful predictions.
     */
    get latency(): {
        count: number;
        min: number | undefined;
        median: number | undefined;
        max: number | undefined;
    };
    /**
     * Gets the maximum observed latency.
     */
    get maxLatency(): number;
    constructor(timeline: PredictionTimeline);
    private _pushStat;
}
export declare class PredictionTimeline {
    readonly terminal: Terminal;
    private readonly _style;
    /**
     * Expected queue of events. Only predictions for the lowest are
     * written into the terminal.
     */
    private _expected;
    /**
     * Current prediction generation.
     */
    private _currentGen;
    /**
     * Current cursor position -- kept outside the buffer since it can be ahead
     * if typing swiftly. The position of the cursor that the user is currently
     * looking at on their screen (or will be looking at after all pending writes
     * are flushed.)
     */
    private _physicalCursor;
    /**
     * Cursor position taking into account all (possibly not-yet-applied)
     * predictions. A new prediction inserted, if applied, will be applied at
     * the position of the tentative cursor.
     */
    private _tenativeCursor;
    /**
     * Previously sent data that was buffered and should be prepended to the
     * next input.
     */
    private _inputBuffer?;
    /**
     * Whether predictions are echoed to the terminal. If false, predictions
     * will still be computed internally for latency metrics, but input will
     * never be adjusted.
     */
    private _showPredictions;
    /**
     * The last successfully-made prediction.
     */
    private _lookBehind?;
    private readonly _addedEmitter;
    readonly onPredictionAdded: import("../../../../workbench.web.main.internal.js").Event<IPrediction>;
    private readonly _failedEmitter;
    readonly onPredictionFailed: import("../../../../workbench.web.main.internal.js").Event<IPrediction>;
    private readonly _succeededEmitter;
    readonly onPredictionSucceeded: import("../../../../workbench.web.main.internal.js").Event<IPrediction>;
    private get _currentGenerationPredictions();
    get isShowingPredictions(): boolean;
    get length(): number;
    constructor(terminal: Terminal, _style: TypeAheadStyle);
    setShowPredictions(show: boolean): void;
    /**
     * Undoes any predictions written and resets expectations.
     */
    undoAllPredictions(): void;
    /**
     * Should be called when input is incoming to the temrinal.
     */
    beforeServerInput(input: string): string;
    /**
     * Clears any expected predictions and stored state. Should be called when
     * the pty gives us something we don't recognize.
     */
    private _clearPredictionState;
    /**
     * Appends a typeahead prediction.
     */
    addPrediction(buffer: IBuffer, prediction: IPrediction): boolean;
    /**
     * Appends a prediction followed by a boundary. The predictions applied
     * after this one will only be displayed after the give prediction matches
     * pty output/
     */
    addBoundary(): void;
    addBoundary(buffer: IBuffer, prediction: IPrediction): boolean;
    /**
     * Peeks the last prediction written.
     */
    peekEnd(): IPrediction | undefined;
    /**
     * Peeks the first pending prediction.
     */
    peekStart(): IPrediction | undefined;
    /**
     * Current position of the cursor in the terminal.
     */
    physicalCursor(buffer: IBuffer): Cursor;
    /**
     * Cursor position if all predictions and boundaries that have been inserted
     * so far turn out to be successfully predicted.
     */
    tentativeCursor(buffer: IBuffer): Cursor;
    clearCursor(): void;
    private _getActiveBuffer;
}
declare class TypeAheadStyle implements IDisposable {
    private readonly _terminal;
    private static _compileArgs;
    /**
     * Number of typeahead style arguments we expect to read. If this is 0 and
     * we see a style coming in, we know that the PTY actually wanted to update.
     */
    private _expectedIncomingStyles;
    private _applyArgs;
    private _originalUndoArgs;
    private _undoArgs;
    apply: string;
    undo: string;
    private _csiHandler?;
    constructor(value: ITerminalTypeAheadConfiguration['localEchoStyle'], _terminal: Terminal);
    /**
     * Signals that a style was written to the terminal and we should watch
     * for it coming in.
     */
    expectIncomingStyle(n?: number): void;
    /**
     * Starts tracking for CSI changes in the terminal.
     */
    startTracking(): void;
    /**
     * Stops tracking terminal CSI changes.
     */
    debounceStopTracking(): void;
    /**
     * @inheritdoc
     */
    dispose(): void;
    private _stopTracking;
    private _onDidWriteSGR;
    /**
     * Updates the current typeahead style.
     */
    onUpdate(style: ITerminalTypeAheadConfiguration['localEchoStyle']): void;
    private _getArgs;
}
export declare const enum CharPredictState {
    /** No characters typed on this line yet */
    Unknown = 0,
    /** Has a pending character prediction */
    HasPendingChar = 1,
    /** Character validated on this line */
    Validated = 2
}
export declare class TypeAheadAddon extends Disposable implements ITerminalAddon {
    private _processManager;
    private readonly _configurationService;
    private readonly _telemetryService;
    private _typeaheadStyle?;
    private _typeaheadThreshold;
    private _excludeProgramRe;
    protected _lastRow?: {
        y: number;
        startingX: number;
        endingX: number;
        charState: CharPredictState;
    };
    protected _timeline?: PredictionTimeline;
    private _terminalTitle;
    stats?: PredictionStats;
    /**
     * Debounce that clears predictions after a timeout if the PTY doesn't apply them.
     */
    private _clearPredictionDebounce?;
    constructor(_processManager: ITerminalProcessManager, _configurationService: IConfigurationService, _telemetryService: ITelemetryService);
    activate(terminal: Terminal): void;
    reset(): void;
    private _deferClearingPredictions;
    /**
     * Note on debounce:
     *
     * We want to toggle the state only when the user has a pause in their
     * typing. Otherwise, we could turn this on when the PTY sent data but the
     * terminal cursor is not updated, causes issues.
     */
    protected _reevaluatePredictorState(stats: PredictionStats, timeline: PredictionTimeline): void;
    protected _reevaluatePredictorStateNow(stats: PredictionStats, timeline: PredictionTimeline): void;
    private _sendLatencyStats;
    private _onUserData;
    private _onBeforeProcessData;
}
export {};
