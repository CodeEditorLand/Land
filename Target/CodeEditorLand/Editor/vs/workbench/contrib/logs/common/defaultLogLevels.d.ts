import { LogLevel } from '../../../../platform/log/common/log.js';
import { Event } from '../../../../base/common/event.js';
interface ParsedArgvLogLevels {
    default?: LogLevel;
    extensions?: [string, LogLevel][];
}
export type DefaultLogLevels = Required<Readonly<ParsedArgvLogLevels>>;
export declare const IDefaultLogLevelsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDefaultLogLevelsService>;
export interface IDefaultLogLevelsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeDefaultLogLevels: Event<void>;
    getDefaultLogLevels(): Promise<DefaultLogLevels>;
    getDefaultLogLevel(extensionId?: string): Promise<LogLevel>;
    setDefaultLogLevel(logLevel: LogLevel, extensionId?: string): Promise<void>;
    migrateLogLevels(): void;
}
export {};
