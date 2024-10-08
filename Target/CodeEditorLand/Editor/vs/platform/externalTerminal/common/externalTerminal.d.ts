import { ITerminalEnvironment } from '../../terminal/common/terminal.js';
export declare const IExternalTerminalService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExternalTerminalService>;
export interface IExternalTerminalSettings {
    linuxExec?: string;
    osxExec?: string;
    windowsExec?: string;
}
export interface ITerminalForPlatform {
    windows: string;
    linux: string;
    osx: string;
}
export interface IExternalTerminalService {
    readonly _serviceBrand: undefined;
    openTerminal(configuration: IExternalTerminalSettings, cwd: string | undefined): Promise<void>;
    runInTerminal(title: string, cwd: string, args: string[], env: ITerminalEnvironment, settings: IExternalTerminalSettings): Promise<number | undefined>;
    getDefaultTerminalForPlatforms(): Promise<ITerminalForPlatform>;
}
export interface IExternalTerminalConfiguration {
    terminal: {
        explorerKind: 'integrated' | 'external' | 'both';
        external: IExternalTerminalSettings;
    };
}
export declare const DEFAULT_TERMINAL_OSX = "Terminal.app";
