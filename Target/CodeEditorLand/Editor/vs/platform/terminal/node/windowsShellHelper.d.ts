import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { TerminalShellType } from '../common/terminal.js';
export interface IWindowsShellHelper extends IDisposable {
    readonly onShellNameChanged: Event<string>;
    readonly onShellTypeChanged: Event<TerminalShellType | undefined>;
    getShellType(title: string): TerminalShellType | undefined;
    getShellName(): Promise<string>;
}
export declare class WindowsShellHelper extends Disposable implements IWindowsShellHelper {
    private _rootProcessId;
    private _currentRequest;
    private _shellType;
    get shellType(): TerminalShellType | undefined;
    private _shellTitle;
    get shellTitle(): string;
    private readonly _onShellNameChanged;
    get onShellNameChanged(): Event<string>;
    private readonly _onShellTypeChanged;
    get onShellTypeChanged(): Event<TerminalShellType | undefined>;
    constructor(_rootProcessId: number);
    private _startMonitoringShell;
    checkShell(): Promise<void>;
    private traverseTree;
    getShellName(): Promise<string>;
    getShellType(executable: string): TerminalShellType | undefined;
}
