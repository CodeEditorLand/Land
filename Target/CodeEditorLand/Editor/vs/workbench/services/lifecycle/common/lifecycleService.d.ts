import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILifecycleService, WillShutdownEvent, StartupKind, LifecyclePhase, ShutdownReason, BeforeShutdownErrorEvent, InternalBeforeShutdownEvent } from './lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare abstract class AbstractLifecycleService extends Disposable implements ILifecycleService {
    protected readonly logService: ILogService;
    protected readonly storageService: IStorageService;
    private static readonly LAST_SHUTDOWN_REASON_KEY;
    readonly _serviceBrand: undefined;
    protected readonly _onBeforeShutdown: Emitter<InternalBeforeShutdownEvent>;
    readonly onBeforeShutdown: import("../../../workbench.web.main.internal.js").Event<InternalBeforeShutdownEvent>;
    protected readonly _onWillShutdown: Emitter<WillShutdownEvent>;
    readonly onWillShutdown: import("../../../workbench.web.main.internal.js").Event<WillShutdownEvent>;
    protected readonly _onDidShutdown: Emitter<void>;
    readonly onDidShutdown: import("../../../workbench.web.main.internal.js").Event<void>;
    protected readonly _onBeforeShutdownError: Emitter<BeforeShutdownErrorEvent>;
    readonly onBeforeShutdownError: import("../../../workbench.web.main.internal.js").Event<BeforeShutdownErrorEvent>;
    protected readonly _onShutdownVeto: Emitter<void>;
    readonly onShutdownVeto: import("../../../workbench.web.main.internal.js").Event<void>;
    private _startupKind;
    get startupKind(): StartupKind;
    private _phase;
    get phase(): LifecyclePhase;
    private readonly phaseWhen;
    protected shutdownReason: ShutdownReason | undefined;
    constructor(logService: ILogService, storageService: IStorageService);
    private resolveStartupKind;
    protected doResolveStartupKind(): StartupKind | undefined;
    set phase(value: LifecyclePhase);
    when(phase: LifecyclePhase): Promise<void>;
    /**
     * Subclasses to implement the explicit shutdown method.
     */
    abstract shutdown(): Promise<void>;
}
