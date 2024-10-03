import { IProcessPropertyMap, IPtyService, ITerminalChildProcess, ITerminalLaunchError, ProcessPropertyType } from '../../../../platform/terminal/common/terminal.js';
import { BasePty } from '../common/basePty.js';
export declare class LocalPty extends BasePty implements ITerminalChildProcess {
    private readonly _proxy;
    constructor(id: number, shouldPersist: boolean, _proxy: IPtyService);
    start(): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    detach(forcePersist?: boolean): Promise<void>;
    shutdown(immediate: boolean): void;
    processBinary(data: string): Promise<void>;
    input(data: string): void;
    resize(cols: number, rows: number): void;
    clearBuffer(): Promise<void>;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    refreshProperty<T extends ProcessPropertyType>(type: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(type: T, value: IProcessPropertyMap[T]): Promise<void>;
    acknowledgeDataEvent(charCount: number): void;
    setUnicodeVersion(version: '6' | '11'): Promise<void>;
    handleOrphanQuestion(): void;
}
