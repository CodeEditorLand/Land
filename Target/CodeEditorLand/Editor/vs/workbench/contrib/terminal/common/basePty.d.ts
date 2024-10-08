import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import type { IPtyHostProcessReplayEvent, ISerializedCommandDetectionCapability } from '../../../../platform/terminal/common/capabilities/capabilities.js';
import { type IProcessDataEvent, type IProcessProperty, type IProcessPropertyMap, type IProcessReadyEvent, type ITerminalChildProcess } from '../../../../platform/terminal/common/terminal.js';
/**
 * Responsible for establishing and maintaining a connection with an existing terminal process
 * created on the local pty host.
 */
export declare abstract class BasePty extends Disposable implements Partial<ITerminalChildProcess> {
    readonly id: number;
    readonly shouldPersist: boolean;
    protected readonly _properties: IProcessPropertyMap;
    protected readonly _lastDimensions: {
        cols: number;
        rows: number;
    };
    protected _inReplay: boolean;
    protected readonly _onProcessData: Emitter<string | IProcessDataEvent>;
    readonly onProcessData: import("../../../workbench.web.main.internal.js").Event<string | IProcessDataEvent>;
    protected readonly _onProcessReplayComplete: Emitter<void>;
    readonly onProcessReplayComplete: import("../../../workbench.web.main.internal.js").Event<void>;
    protected readonly _onProcessReady: Emitter<IProcessReadyEvent>;
    readonly onProcessReady: import("../../../workbench.web.main.internal.js").Event<IProcessReadyEvent>;
    protected readonly _onDidChangeProperty: Emitter<IProcessProperty<any>>;
    readonly onDidChangeProperty: import("../../../workbench.web.main.internal.js").Event<IProcessProperty<any>>;
    protected readonly _onProcessExit: Emitter<number | undefined>;
    readonly onProcessExit: import("../../../workbench.web.main.internal.js").Event<number | undefined>;
    protected readonly _onRestoreCommands: Emitter<ISerializedCommandDetectionCapability>;
    readonly onRestoreCommands: import("../../../workbench.web.main.internal.js").Event<ISerializedCommandDetectionCapability>;
    constructor(id: number, shouldPersist: boolean);
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    handleData(e: string | IProcessDataEvent): void;
    handleExit(e: number | undefined): void;
    handleReady(e: IProcessReadyEvent): void;
    handleDidChangeProperty({ type, value }: IProcessProperty<any>): void;
    handleReplay(e: IPtyHostProcessReplayEvent): Promise<void>;
}
