import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import type { IPromptInputModel, ISerializedPromptInputModel } from './commandDetection/promptInputModel.js';
import { ICurrentPartialCommand } from './commandDetection/terminalCommand.js';
import { ITerminalOutputMatch, ITerminalOutputMatcher } from '../terminal.js';
import { ReplayEntry } from '../terminalProcess.js';
interface IEvent<T, U = void> {
    (listener: (arg1: T, arg2: U) => any): IDisposable;
}
export interface IMarker extends IDisposable {
    readonly id: number;
    readonly isDisposed: boolean;
    readonly line: number;
    onDispose: IEvent<void>;
}
export declare const enum TerminalCapability {
    CwdDetection = 0,
    NaiveCwdDetection = 1,
    CommandDetection = 2,
    PartialCommandDetection = 3,
    BufferMarkDetection = 4
}
export interface ITerminalCapabilityStore {
    readonly items: IterableIterator<TerminalCapability>;
    readonly onDidAddCapabilityType: Event<TerminalCapability>;
    readonly onDidRemoveCapabilityType: Event<TerminalCapability>;
    readonly onDidAddCapability: Event<TerminalCapabilityChangeEvent<any>>;
    readonly onDidRemoveCapability: Event<TerminalCapabilityChangeEvent<any>>;
    has(capability: TerminalCapability): boolean;
    get<T extends TerminalCapability>(capability: T): ITerminalCapabilityImplMap[T] | undefined;
}
export interface TerminalCapabilityChangeEvent<T extends TerminalCapability> {
    id: T;
    capability: ITerminalCapabilityImplMap[T];
}
export interface ITerminalCapabilityImplMap {
    [TerminalCapability.CwdDetection]: ICwdDetectionCapability;
    [TerminalCapability.CommandDetection]: ICommandDetectionCapability;
    [TerminalCapability.NaiveCwdDetection]: INaiveCwdDetectionCapability;
    [TerminalCapability.PartialCommandDetection]: IPartialCommandDetectionCapability;
    [TerminalCapability.BufferMarkDetection]: IBufferMarkCapability;
}
export interface ICwdDetectionCapability {
    readonly type: TerminalCapability.CwdDetection;
    readonly onDidChangeCwd: Event<string>;
    readonly cwds: string[];
    getCwd(): string;
    updateCwd(cwd: string): void;
}
export declare const enum CommandInvalidationReason {
    Windows = "windows",
    NoProblemsReported = "noProblemsReported"
}
export interface ICommandInvalidationRequest {
    reason: CommandInvalidationReason;
}
export interface IBufferMarkCapability {
    type: TerminalCapability.BufferMarkDetection;
    markers(): IterableIterator<IMarker>;
    onMarkAdded: Event<IMarkProperties>;
    addMark(properties?: IMarkProperties): void;
    getMark(id: string): IMarker | undefined;
}
export interface ICommandDetectionCapability {
    readonly type: TerminalCapability.CommandDetection;
    readonly promptInputModel: IPromptInputModel;
    readonly commands: readonly ITerminalCommand[];
    readonly executingCommand: string | undefined;
    readonly executingCommandObject: ITerminalCommand | undefined;
    readonly cwd: string | undefined;
    readonly currentCommand: ICurrentPartialCommand | undefined;
    readonly onCommandStarted: Event<ITerminalCommand>;
    readonly onCommandFinished: Event<ITerminalCommand>;
    readonly onCommandExecuted: Event<ITerminalCommand>;
    readonly onCommandInvalidated: Event<ITerminalCommand[]>;
    readonly onCurrentCommandInvalidated: Event<ICommandInvalidationRequest>;
    setContinuationPrompt(value: string): void;
    setPromptTerminator(value: string, lastPromptLine: string): void;
    setCwd(value: string): void;
    setIsWindowsPty(value: boolean): void;
    setIsCommandStorageDisabled(): void;
    getCwdForLine(line: number): string | undefined;
    getCommandForLine(line: number): ITerminalCommand | ICurrentPartialCommand | undefined;
    handlePromptStart(options?: IHandleCommandOptions): void;
    handleContinuationStart(): void;
    handleContinuationEnd(): void;
    handleRightPromptStart(): void;
    handleRightPromptEnd(): void;
    handleCommandStart(options?: IHandleCommandOptions): void;
    handleCommandExecuted(options?: IHandleCommandOptions): void;
    handleCommandFinished(exitCode?: number, options?: IHandleCommandOptions): void;
    setCommandLine(commandLine: string, isTrusted: boolean): void;
    serialize(): ISerializedCommandDetectionCapability;
    deserialize(serialized: ISerializedCommandDetectionCapability): void;
}
export interface IHandleCommandOptions {
    ignoreCommandLine?: boolean;
    marker?: IMarker;
    markProperties?: IMarkProperties;
}
export interface INaiveCwdDetectionCapability {
    readonly type: TerminalCapability.NaiveCwdDetection;
    readonly onDidChangeCwd: Event<string>;
    getCwd(): Promise<string>;
}
export interface IPartialCommandDetectionCapability {
    readonly type: TerminalCapability.PartialCommandDetection;
    readonly commands: readonly IXtermMarker[];
    readonly onCommandFinished: Event<IXtermMarker>;
}
interface IBaseTerminalCommand {
    command: string;
    commandLineConfidence: 'low' | 'medium' | 'high';
    isTrusted: boolean;
    timestamp: number;
    duration: number;
    cwd: string | undefined;
    exitCode: number | undefined;
    commandStartLineContent: string | undefined;
    markProperties: IMarkProperties | undefined;
    executedX: number | undefined;
    startX: number | undefined;
}
export interface ITerminalCommand extends IBaseTerminalCommand {
    readonly promptStartMarker?: IMarker;
    readonly marker?: IXtermMarker;
    endMarker?: IXtermMarker;
    readonly executedMarker?: IXtermMarker;
    readonly aliases?: string[][];
    readonly wasReplayed?: boolean;
    extractCommandLine(): string;
    getOutput(): string | undefined;
    getOutputMatch(outputMatcher: ITerminalOutputMatcher): ITerminalOutputMatch | undefined;
    hasOutput(): boolean;
    getPromptRowCount(): number;
    getCommandRowCount(): number;
}
export interface ISerializedTerminalCommand extends IBaseTerminalCommand {
    startLine: number | undefined;
    promptStartLine: number | undefined;
    endLine: number | undefined;
    executedLine: number | undefined;
}
export interface IXtermMarker {
    readonly id: number;
    readonly isDisposed: boolean;
    readonly line: number;
    dispose(): void;
    onDispose: {
        (listener: () => any): {
            dispose(): void;
        };
    };
}
export interface IMarkProperties {
    hoverMessage?: string;
    disableCommandStorage?: boolean;
    hidden?: boolean;
    marker?: IMarker;
    id?: string;
}
export interface ISerializedCommandDetectionCapability {
    isWindowsPty: boolean;
    commands: ISerializedTerminalCommand[];
    promptInputModel: ISerializedPromptInputModel | undefined;
}
export interface IPtyHostProcessReplayEvent {
    events: ReplayEntry[];
    commands: ISerializedCommandDetectionCapability;
}
export {};
