import { Disposable } from '../../../../base/common/lifecycle.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { TerminalCapabilityStore } from '../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js';
import { IMergedEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariable.js';
import { ITerminalBackend } from '../../../../platform/terminal/common/terminal.js';
import { IDetachedTerminalInstance, IDetachedXTermOptions, IDetachedXtermTerminal, ITerminalContribution, IXtermAttachToElementOptions } from './terminal.js';
import { XtermTerminal } from './xterm/xtermTerminal.js';
import { IEnvironmentVariableInfo } from '../common/environmentVariable.js';
import { ITerminalProcessInfo, ProcessState } from '../common/terminal.js';
export declare class DetachedTerminal extends Disposable implements IDetachedTerminalInstance {
    private readonly _xterm;
    private readonly _widgets;
    readonly capabilities: TerminalCapabilityStore;
    private readonly _contributions;
    domElement?: HTMLElement;
    get xterm(): IDetachedXtermTerminal;
    constructor(_xterm: XtermTerminal, options: IDetachedXTermOptions, instantiationService: IInstantiationService);
    get selection(): string | undefined;
    hasSelection(): boolean;
    clearSelection(): void;
    focus(force?: boolean): void;
    attachToElement(container: HTMLElement, options?: Partial<IXtermAttachToElementOptions> | undefined): void;
    forceScrollbarVisibility(): void;
    resetScrollbarVisibility(): void;
    getContribution<T extends ITerminalContribution>(id: string): T | null;
}
export declare class DetachedProcessInfo implements ITerminalProcessInfo {
    processState: ProcessState;
    ptyProcessReady: Promise<void>;
    shellProcessId: number | undefined;
    remoteAuthority: string | undefined;
    os: OperatingSystem | undefined;
    userHome: string | undefined;
    initialCwd: string;
    environmentVariableInfo: IEnvironmentVariableInfo | undefined;
    persistentProcessId: number | undefined;
    shouldPersist: boolean;
    hasWrittenData: boolean;
    hasChildProcesses: boolean;
    backend: ITerminalBackend | undefined;
    capabilities: TerminalCapabilityStore;
    shellIntegrationNonce: string;
    extEnvironmentVariableCollection: IMergedEnvironmentVariableCollection | undefined;
    constructor(initialValues: Partial<ITerminalProcessInfo>);
}
