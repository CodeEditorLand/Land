import { IProcessPropertyMap, ITerminalChildProcess, ITerminalLaunchError, ITerminalLogService, ProcessPropertyType } from '../../../../platform/terminal/common/terminal.js';
import { BasePty } from '../common/basePty.js';
import { RemoteTerminalChannelClient } from '../common/remote/remoteTerminalChannel.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
export declare class RemotePty extends BasePty implements ITerminalChildProcess {
    private readonly _remoteTerminalChannel;
    private readonly _remoteAgentService;
    private readonly _logService;
    private readonly _startBarrier;
    constructor(id: number, shouldPersist: boolean, _remoteTerminalChannel: RemoteTerminalChannelClient, _remoteAgentService: IRemoteAgentService, _logService: ITerminalLogService);
    start(): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    detach(forcePersist?: boolean): Promise<void>;
    shutdown(immediate: boolean): void;
    input(data: string): void;
    processBinary(e: string): Promise<void>;
    resize(cols: number, rows: number): void;
    clearBuffer(): Promise<void>;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    acknowledgeDataEvent(charCount: number): void;
    setUnicodeVersion(version: '6' | '11'): Promise<void>;
    refreshProperty<T extends ProcessPropertyType>(type: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(type: T, value: IProcessPropertyMap[T]): Promise<void>;
    handleOrphanQuestion(): void;
}
