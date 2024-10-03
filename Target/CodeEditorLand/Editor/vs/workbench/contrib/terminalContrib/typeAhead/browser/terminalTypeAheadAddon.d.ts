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
    Success = 0,
    Failure = 1,
    Buffer = 2
}
export interface IPrediction {
    readonly affectsStyle?: boolean;
    readonly clearAfterTimeout?: boolean;
    apply(buffer: IBuffer, cursor: Cursor): string;
    rollback(cursor: Cursor): string;
    rollForwards(cursor: Cursor, withInput: string): string;
    matches(input: StringReader, lookBehind?: IPrediction): MatchResult;
}
declare class StringReader {
    private readonly _input;
    index: number;
    get remaining(): number;
    get eof(): boolean;
    get rest(): string;
    constructor(_input: string);
    eatChar(char: string): string | undefined;
    eatStr(substr: string): string | undefined;
    eatGradually(substr: string): MatchResult;
    eatRe(re: RegExp): RegExpExecArray | undefined;
    eatCharCode(min?: number, max?: number): number | undefined;
}
export declare class PredictionStats extends Disposable {
    private readonly _stats;
    private _index;
    private readonly _addedAtTime;
    private readonly _changeEmitter;
    readonly onChange: import("../../../../workbench.web.main.internal.js").Event<void>;
    get accuracy(): number;
    get sampleSize(): number;
    get latency(): {
        count: number;
        min: number | undefined;
        median: number | undefined;
        max: number | undefined;
    };
    get maxLatency(): number;
    constructor(timeline: PredictionTimeline);
    private _pushStat;
}
export declare class PredictionTimeline {
    readonly terminal: Terminal;
    private readonly _style;
    private _expected;
    private _currentGen;
    private _physicalCursor;
    private _tenativeCursor;
    private _inputBuffer?;
    private _showPredictions;
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
    undoAllPredictions(): void;
    beforeServerInput(input: string): string;
    private _clearPredictionState;
    addPrediction(buffer: IBuffer, prediction: IPrediction): boolean;
    addBoundary(): void;
    addBoundary(buffer: IBuffer, prediction: IPrediction): boolean;
    peekEnd(): IPrediction | undefined;
    peekStart(): IPrediction | undefined;
    physicalCursor(buffer: IBuffer): Cursor;
    tentativeCursor(buffer: IBuffer): Cursor;
    clearCursor(): void;
    private _getActiveBuffer;
}
declare class TypeAheadStyle implements IDisposable {
    private readonly _terminal;
    private static _compileArgs;
    private _expectedIncomingStyles;
    private _applyArgs;
    private _originalUndoArgs;
    private _undoArgs;
    apply: string;
    undo: string;
    private _csiHandler?;
    constructor(value: ITerminalTypeAheadConfiguration['localEchoStyle'], _terminal: Terminal);
    expectIncomingStyle(n?: number): void;
    startTracking(): void;
    debounceStopTracking(): void;
    dispose(): void;
    private _stopTracking;
    private _onDidWriteSGR;
    onUpdate(style: ITerminalTypeAheadConfiguration['localEchoStyle']): void;
    private _getArgs;
}
export declare const enum CharPredictState {
    Unknown = 0,
    HasPendingChar = 1,
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
    private _clearPredictionDebounce?;
    constructor(_processManager: ITerminalProcessManager, _configurationService: IConfigurationService, _telemetryService: ITelemetryService);
    activate(terminal: Terminal): void;
    reset(): void;
    private _deferClearingPredictions;
    protected _reevaluatePredictorState(stats: PredictionStats, timeline: PredictionTimeline): void;
    protected _reevaluatePredictorStateNow(stats: PredictionStats, timeline: PredictionTimeline): void;
    private _sendLatencyStats;
    private _onUserData;
    private _onBeforeProcessData;
}
export {};
