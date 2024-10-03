import { Event } from '../../../../base/common/event.js';
import { IShellLaunchConfig } from '../../../../platform/terminal/common/terminal.js';
export declare const IEmbedderTerminalService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEmbedderTerminalService>;
export interface IEmbedderTerminalService {
    readonly _serviceBrand: undefined;
    readonly onDidCreateTerminal: Event<IShellLaunchConfig>;
    createTerminal(options: IEmbedderTerminalOptions): void;
}
export type EmbedderTerminal = IShellLaunchConfig & Required<Pick<IShellLaunchConfig, 'customPtyImplementation'>>;
export interface IEmbedderTerminalOptions {
    name: string;
    pty: IEmbedderTerminalPty;
}
export interface IEmbedderTerminalPty {
    onDidWrite: Event<string>;
    onDidClose?: Event<void | number>;
    onDidChangeName?: Event<string>;
    open(): void;
    close(): void;
}
