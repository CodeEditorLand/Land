import { IMarkProperties, IMarker, ISerializedTerminalCommand, ITerminalCommand, IXtermMarker } from '../capabilities.js';
import { ITerminalOutputMatcher, ITerminalOutputMatch } from '../../terminal.js';
import type { Terminal } from '@xterm/headless';
export interface ITerminalCommandProperties {
    command: string;
    commandLineConfidence: 'low' | 'medium' | 'high';
    isTrusted: boolean;
    timestamp: number;
    duration: number;
    marker: IXtermMarker | undefined;
    cwd: string | undefined;
    exitCode: number | undefined;
    commandStartLineContent: string | undefined;
    markProperties: IMarkProperties | undefined;
    executedX: number | undefined;
    startX: number | undefined;
    promptStartMarker?: IMarker | undefined;
    endMarker?: IXtermMarker | undefined;
    executedMarker?: IXtermMarker | undefined;
    aliases?: string[][] | undefined;
    wasReplayed?: boolean | undefined;
}
export declare class TerminalCommand implements ITerminalCommand {
    private readonly _xterm;
    private readonly _properties;
    get command(): string;
    get commandLineConfidence(): "low" | "medium" | "high";
    get isTrusted(): boolean;
    get timestamp(): number;
    get duration(): number;
    get promptStartMarker(): IMarker | undefined;
    get marker(): IXtermMarker | undefined;
    get endMarker(): IXtermMarker | undefined;
    set endMarker(value: IXtermMarker | undefined);
    get executedMarker(): IXtermMarker | undefined;
    get aliases(): string[][] | undefined;
    get wasReplayed(): boolean | undefined;
    get cwd(): string | undefined;
    get exitCode(): number | undefined;
    get commandStartLineContent(): string | undefined;
    get markProperties(): IMarkProperties | undefined;
    get executedX(): number | undefined;
    get startX(): number | undefined;
    constructor(_xterm: Terminal, _properties: ITerminalCommandProperties);
    static deserialize(xterm: Terminal, serialized: ISerializedTerminalCommand & Required<Pick<ISerializedTerminalCommand, 'endLine'>>, isCommandStorageDisabled: boolean): TerminalCommand | undefined;
    serialize(isCommandStorageDisabled: boolean): ISerializedTerminalCommand;
    extractCommandLine(): string;
    getOutput(): string | undefined;
    getOutputMatch(outputMatcher: ITerminalOutputMatcher): ITerminalOutputMatch | undefined;
    hasOutput(): boolean;
    getPromptRowCount(): number;
    getCommandRowCount(): number;
}
export interface ICurrentPartialCommand {
    promptStartMarker?: IMarker;
    commandStartMarker?: IMarker;
    commandStartX?: number;
    commandStartLineContent?: string;
    commandRightPromptStartX?: number;
    commandRightPromptEndX?: number;
    commandLines?: IMarker;
    commandExecutedMarker?: IMarker;
    commandExecutedX?: number;
    commandFinishedMarker?: IMarker;
    currentContinuationMarker?: IMarker;
    continuations?: {
        marker: IMarker;
        end: number;
    }[];
    command?: string;
    isTrusted?: boolean;
    isInvalid?: boolean;
    getPromptRowCount(): number;
    getCommandRowCount(): number;
}
export declare class PartialTerminalCommand implements ICurrentPartialCommand {
    private readonly _xterm;
    promptStartMarker?: IMarker;
    commandStartMarker?: IMarker;
    commandStartX?: number;
    commandStartLineContent?: string;
    commandRightPromptStartX?: number;
    commandRightPromptEndX?: number;
    commandLines?: IMarker;
    commandExecutedMarker?: IMarker;
    commandExecutedX?: number;
    private commandExecutedTimestamp?;
    private commandDuration?;
    commandFinishedMarker?: IMarker;
    currentContinuationMarker?: IMarker;
    continuations?: {
        marker: IMarker;
        end: number;
    }[];
    cwd?: string;
    command?: string;
    commandLineConfidence?: 'low' | 'medium' | 'high';
    isTrusted?: boolean;
    isInvalid?: boolean;
    constructor(_xterm: Terminal);
    serialize(cwd: string | undefined): ISerializedTerminalCommand | undefined;
    promoteToFullCommand(cwd: string | undefined, exitCode: number | undefined, ignoreCommandLine: boolean, markProperties: IMarkProperties | undefined): TerminalCommand | undefined;
    markExecutedTime(): void;
    markFinishedTime(): void;
    extractCommandLine(): string;
    getPromptRowCount(): number;
    getCommandRowCount(): number;
}
