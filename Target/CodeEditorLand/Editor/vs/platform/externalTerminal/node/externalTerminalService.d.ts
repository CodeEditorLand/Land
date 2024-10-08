import * as cp from 'child_process';
import { IExternalTerminalService, IExternalTerminalSettings, ITerminalForPlatform } from '../common/externalTerminal.js';
import { ITerminalEnvironment } from '../../terminal/common/terminal.js';
declare abstract class ExternalTerminalService {
    _serviceBrand: undefined;
    getDefaultTerminalForPlatforms(): Promise<ITerminalForPlatform>;
}
export declare class WindowsExternalTerminalService extends ExternalTerminalService implements IExternalTerminalService {
    private static readonly CMD;
    private static _DEFAULT_TERMINAL_WINDOWS;
    openTerminal(configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
    spawnTerminal(spawner: typeof cp, configuration: IExternalTerminalSettings, command: string, cwd?: string): Promise<void>;
    runInTerminal(title: string, dir: string, args: string[], envVars: ITerminalEnvironment, settings: IExternalTerminalSettings): Promise<number | undefined>;
    static getDefaultTerminalWindows(): string;
    private static getWtExePath;
}
export declare class MacExternalTerminalService extends ExternalTerminalService implements IExternalTerminalService {
    private static readonly OSASCRIPT;
    openTerminal(configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
    runInTerminal(title: string, dir: string, args: string[], envVars: ITerminalEnvironment, settings: IExternalTerminalSettings): Promise<number | undefined>;
    spawnTerminal(spawner: typeof cp, configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
}
export declare class LinuxExternalTerminalService extends ExternalTerminalService implements IExternalTerminalService {
    private static readonly WAIT_MESSAGE;
    openTerminal(configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
    runInTerminal(title: string, dir: string, args: string[], envVars: ITerminalEnvironment, settings: IExternalTerminalSettings): Promise<number | undefined>;
    private static _DEFAULT_TERMINAL_LINUX_READY;
    static getDefaultTerminalLinuxReady(): Promise<string>;
    spawnTerminal(spawner: typeof cp, configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
}
export {};
