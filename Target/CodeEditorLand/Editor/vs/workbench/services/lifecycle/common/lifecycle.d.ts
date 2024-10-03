import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
export declare const ILifecycleService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILifecycleService>;
export interface BeforeShutdownEvent {
    readonly reason: ShutdownReason;
    veto(value: boolean | Promise<boolean>, id: string): void;
}
export interface InternalBeforeShutdownEvent extends BeforeShutdownEvent {
    finalVeto(vetoFn: () => boolean | Promise<boolean>, id: string): void;
}
export interface BeforeShutdownErrorEvent {
    readonly reason: ShutdownReason;
    readonly error: Error;
}
export declare enum WillShutdownJoinerOrder {
    Default = 1,
    Last = 2
}
export interface IWillShutdownEventJoiner {
    readonly id: string;
    readonly label: string;
    readonly order?: WillShutdownJoinerOrder;
}
export interface IWillShutdownEventDefaultJoiner extends IWillShutdownEventJoiner {
    readonly order?: WillShutdownJoinerOrder.Default;
}
export interface IWillShutdownEventLastJoiner extends IWillShutdownEventJoiner {
    readonly order: WillShutdownJoinerOrder.Last;
}
export interface WillShutdownEvent {
    readonly reason: ShutdownReason;
    readonly token: CancellationToken;
    join(promise: Promise<void>, joiner: IWillShutdownEventDefaultJoiner): void;
    join(promiseFn: (() => Promise<void>), joiner: IWillShutdownEventLastJoiner): void;
    joiners(): IWillShutdownEventJoiner[];
    force(): void;
}
export declare const enum ShutdownReason {
    CLOSE = 1,
    QUIT = 2,
    RELOAD = 3,
    LOAD = 4
}
export declare const enum StartupKind {
    NewWindow = 1,
    ReloadedWindow = 3,
    ReopenedWindow = 4
}
export declare function StartupKindToString(startupKind: StartupKind): string;
export declare const enum LifecyclePhase {
    Starting = 1,
    Ready = 2,
    Restored = 3,
    Eventually = 4
}
export declare function LifecyclePhaseToString(phase: LifecyclePhase): string;
export interface ILifecycleService {
    readonly _serviceBrand: undefined;
    readonly startupKind: StartupKind;
    phase: LifecyclePhase;
    readonly onBeforeShutdown: Event<BeforeShutdownEvent>;
    readonly onShutdownVeto: Event<void>;
    readonly onBeforeShutdownError: Event<BeforeShutdownErrorEvent>;
    readonly onWillShutdown: Event<WillShutdownEvent>;
    readonly onDidShutdown: Event<void>;
    when(phase: LifecyclePhase): Promise<void>;
    shutdown(): Promise<void>;
}
