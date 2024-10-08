import { Event } from '../../../../base/common/event.js';
import Severity from '../../../../base/common/severity.js';
import { IMessagePassingProtocol } from '../../../../base/parts/ipc/common/ipc.js';
import { ExtensionIdentifier, IExtension, IExtensionContributions, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { ApiProposalName } from '../../../../platform/extensions/common/extensionsApiProposals.js';
import { IV8Profile } from '../../../../platform/profiling/common/profiling.js';
import { ExtensionHostKind } from './extensionHostKind.js';
import { IExtensionDescriptionDelta, IExtensionDescriptionSnapshot } from './extensionHostProtocol.js';
import { ExtensionRunningLocation } from './extensionRunningLocation.js';
import { IExtensionPoint } from './extensionsRegistry.js';
export declare const nullExtensionDescription: Readonly<Readonly<import("../../../../platform/extensions/common/extensions.js").IRelaxedExtensionDescription>>;
export type WebWorkerExtHostConfigValue = boolean | 'auto';
export declare const webWorkerExtHostConfig = "extensions.webWorker";
export declare const IExtensionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionService>;
export interface IMessage {
    type: Severity;
    message: string;
    extensionId: ExtensionIdentifier;
    extensionPointId: string;
}
export interface IExtensionsStatus {
    id: ExtensionIdentifier;
    messages: IMessage[];
    activationStarted: boolean;
    activationTimes: ActivationTimes | undefined;
    runtimeErrors: Error[];
    runningLocation: ExtensionRunningLocation | null;
}
export declare class MissingExtensionDependency {
    readonly dependency: string;
    constructor(dependency: string);
}
/**
 * e.g.
 * ```
 * {
 *    startTime: 1511954813493000,
 *    endTime: 1511954835590000,
 *    deltas: [ 100, 1500, 123456, 1500, 100000 ],
 *    ids: [ 'idle', 'self', 'extension1', 'self', 'idle' ]
 * }
 * ```
 */
export interface IExtensionHostProfile {
    /**
     * Profiling start timestamp in microseconds.
     */
    startTime: number;
    /**
     * Profiling end timestamp in microseconds.
     */
    endTime: number;
    /**
     * Duration of segment in microseconds.
     */
    deltas: number[];
    /**
     * Segment identifier: extension id or one of the four known strings.
     */
    ids: ProfileSegmentId[];
    /**
     * Get the information as a .cpuprofile.
     */
    data: IV8Profile;
    /**
     * Get the aggregated time per segmentId
     */
    getAggregatedTimes(): Map<ProfileSegmentId, number>;
}
export declare const enum ExtensionHostStartup {
    /**
     * The extension host should be launched immediately and doesn't require a `$startExtensionHost` call.
     */
    EagerAutoStart = 1,
    /**
     * The extension host should be launched immediately and needs a `$startExtensionHost` call.
     */
    EagerManualStart = 2,
    /**
     * The extension host should be launched lazily and only when it has extensions it needs to host. It needs a `$startExtensionHost` call.
     */
    Lazy = 3
}
export interface IExtensionHost {
    readonly pid: number | null;
    readonly runningLocation: ExtensionRunningLocation;
    readonly remoteAuthority: string | null;
    readonly startup: ExtensionHostStartup;
    /**
     * A collection of extensions which includes information about which
     * extension will execute or is executing on this extension host.
     * **NOTE**: this will reflect extensions correctly only after `start()` resolves.
     */
    readonly extensions: ExtensionHostExtensions | null;
    readonly onExit: Event<[number, string | null]>;
    start(): Promise<IMessagePassingProtocol>;
    getInspectPort(): {
        port: number;
        host: string;
    } | undefined;
    enableInspectPort(): Promise<boolean>;
    disconnect?(): Promise<void>;
    dispose(): void;
}
export declare class ExtensionHostExtensions {
    private _versionId;
    private _allExtensions;
    private _myExtensions;
    private _myActivationEvents;
    get versionId(): number;
    get allExtensions(): IExtensionDescription[];
    get myExtensions(): ExtensionIdentifier[];
    constructor(versionId: number, allExtensions: readonly IExtensionDescription[], myExtensions: ExtensionIdentifier[]);
    toSnapshot(): IExtensionDescriptionSnapshot;
    set(versionId: number, allExtensions: IExtensionDescription[], myExtensions: ExtensionIdentifier[]): IExtensionDescriptionDelta;
    delta(extensionsDelta: IExtensionDescriptionDelta): IExtensionDescriptionDelta | null;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    containsActivationEvent(activationEvent: string): boolean;
    private _readMyActivationEvents;
}
export declare function isProposedApiEnabled(extension: IExtensionDescription, proposal: ApiProposalName): boolean;
export declare function checkProposedApiEnabled(extension: IExtensionDescription, proposal: ApiProposalName): void;
/**
 * Extension id or one of the four known program states.
 */
export type ProfileSegmentId = string | 'idle' | 'program' | 'gc' | 'self';
export interface ExtensionActivationReason {
    readonly startup: boolean;
    readonly extensionId: ExtensionIdentifier;
    readonly activationEvent: string;
}
export declare class ActivationTimes {
    readonly codeLoadingTime: number;
    readonly activateCallTime: number;
    readonly activateResolvedTime: number;
    readonly activationReason: ExtensionActivationReason;
    constructor(codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number, activationReason: ExtensionActivationReason);
}
export declare class ExtensionPointContribution<T> {
    readonly description: IExtensionDescription;
    readonly value: T;
    constructor(description: IExtensionDescription, value: T);
}
export interface IWillActivateEvent {
    readonly event: string;
    readonly activation: Promise<void>;
}
export interface IResponsiveStateChangeEvent {
    extensionHostKind: ExtensionHostKind;
    isResponsive: boolean;
    /**
     * Return the inspect port or `0`. `0` means inspection is not possible.
     */
    getInspectListener(tryEnableInspector: boolean): Promise<{
        port: number;
        host: string;
    } | undefined>;
}
export declare const enum ActivationKind {
    Normal = 0,
    Immediate = 1
}
export interface WillStopExtensionHostsEvent {
    /**
     * A human readable reason for stopping the extension hosts
     * that e.g. can be shown in a confirmation dialog to the
     * user.
     */
    readonly reason: string;
    /**
     * A flag to indicate if the operation was triggered automatically
     */
    readonly auto: boolean;
    /**
     * Allows to veto the stopping of extension hosts. The veto can be a long running
     * operation.
     *
     * @param reason a human readable reason for vetoing the extension host stop in case
     * where the resolved `value: true`.
     */
    veto(value: boolean | Promise<boolean>, reason: string): void;
}
export interface IExtensionService {
    readonly _serviceBrand: undefined;
    /**
     * An event emitted when extensions are registered after their extension points got handled.
     *
     * This event will also fire on startup to signal the installed extensions.
     *
     * @returns the extensions that got registered
     */
    onDidRegisterExtensions: Event<void>;
    /**
     * @event
     * Fired when extensions status changes.
     * The event contains the ids of the extensions that have changed.
     */
    onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]>;
    /**
     * Fired when the available extensions change (i.e. when extensions are added or removed).
     */
    onDidChangeExtensions: Event<{
        readonly added: readonly IExtensionDescription[];
        readonly removed: readonly IExtensionDescription[];
    }>;
    /**
     * All registered extensions.
     * - List will be empty initially during workbench startup and will be filled with extensions as they are registered
     * - Listen to `onDidChangeExtensions` event for any changes to the extensions list. It will change as extensions get registered or de-reigstered.
     * - Listen to `onDidRegisterExtensions` event or wait for `whenInstalledExtensionsRegistered` promise to get the initial list of registered extensions.
     */
    readonly extensions: readonly IExtensionDescription[];
    /**
     * An event that is fired when activation happens.
     */
    onWillActivateByEvent: Event<IWillActivateEvent>;
    /**
     * An event that is fired when an extension host changes its
     * responsive-state.
     */
    onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent>;
    /**
     * Fired before stop of extension hosts happens. Allows listeners to veto against the
     * stop to prevent it from happening.
     */
    onWillStop: Event<WillStopExtensionHostsEvent>;
    /**
     * Send an activation event and activate interested extensions.
     *
     * This will wait for the normal startup of the extension host(s).
     *
     * In extraordinary circumstances, if the activation event needs to activate
     * one or more extensions before the normal startup is finished, then you can use
     * `ActivationKind.Immediate`. Please do not use this flag unless really necessary
     * and you understand all consequences.
     */
    activateByEvent(activationEvent: string, activationKind?: ActivationKind): Promise<void>;
    /**
     * Send an activation ID and activate interested extensions.
     *
     */
    activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    /**
     * Determine if `activateByEvent(activationEvent)` has resolved already.
     *
     * i.e. the activation event is finished and all interested extensions are already active.
     */
    activationEventIsDone(activationEvent: string): boolean;
    /**
     * An promise that resolves when the installed extensions are registered after
     * their extension points got handled.
     */
    whenInstalledExtensionsRegistered(): Promise<boolean>;
    /**
     * Return a specific extension
     * @param id An extension id
     */
    getExtension(id: string): Promise<IExtensionDescription | undefined>;
    /**
     * Returns `true` if the given extension can be added. Otherwise `false`.
     * @param extension An extension
     */
    canAddExtension(extension: IExtensionDescription): boolean;
    /**
     * Returns `true` if the given extension can be removed. Otherwise `false`.
     * @param extension An extension
     */
    canRemoveExtension(extension: IExtensionDescription): boolean;
    /**
     * Read all contributions to an extension point.
     */
    readExtensionPointContributions<T extends IExtensionContributions[keyof IExtensionContributions]>(extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;
    /**
     * Get information about extensions status.
     */
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    /**
     * Return the inspect ports (if inspection is possible) for extension hosts of kind `extensionHostKind`.
     */
    getInspectPorts(extensionHostKind: ExtensionHostKind, tryEnableInspector: boolean): Promise<{
        port: number;
        host: string;
    }[]>;
    /**
     * Stops the extension hosts.
     *
     * @param reason a human readable reason for stopping the extension hosts. This maybe
     * can be presented to the user when showing dialogs.
     *
     * @param auto indicates if the operation was triggered by an automatic action
     *
     * @returns a promise that resolves to `true` if the extension hosts were stopped, `false`
     * if the operation was vetoed by listeners of the `onWillStop` event.
     */
    stopExtensionHosts(reason: string, auto?: boolean): Promise<boolean>;
    /**
     * Starts the extension hosts. If updates are provided, the extension hosts are started with the given updates.
     */
    startExtensionHosts(updates?: {
        readonly toAdd: readonly IExtension[];
        readonly toRemove: readonly string[];
    }): Promise<void>;
    /**
     * Modify the environment of the remote extension host
     * @param env New properties for the remote extension host
     */
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
export interface IInternalExtensionService {
    _activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    _onWillActivateExtension(extensionId: ExtensionIdentifier): void;
    _onDidActivateExtension(extensionId: ExtensionIdentifier, codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number, activationReason: ExtensionActivationReason): void;
    _onDidActivateExtensionError(extensionId: ExtensionIdentifier, error: Error): void;
    _onExtensionRuntimeError(extensionId: ExtensionIdentifier, err: Error): void;
}
export interface ProfileSession {
    stop(): Promise<IExtensionHostProfile>;
}
export declare function toExtension(extensionDescription: IExtensionDescription): IExtension;
export declare function toExtensionDescription(extension: IExtension, isUnderDevelopment?: boolean): IExtensionDescription;
export declare class NullExtensionService implements IExtensionService {
    readonly _serviceBrand: undefined;
    onDidRegisterExtensions: Event<void>;
    onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]>;
    onDidChangeExtensions: Event<any>;
    onWillActivateByEvent: Event<IWillActivateEvent>;
    onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent>;
    onWillStop: Event<WillStopExtensionHostsEvent>;
    readonly extensions: never[];
    activateByEvent(_activationEvent: string): Promise<void>;
    activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    activationEventIsDone(_activationEvent: string): boolean;
    whenInstalledExtensionsRegistered(): Promise<boolean>;
    getExtension(): Promise<undefined>;
    readExtensionPointContributions<T>(_extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    getInspectPorts(_extensionHostKind: ExtensionHostKind, _tryEnableInspector: boolean): Promise<{
        port: number;
        host: string;
    }[]>;
    stopExtensionHosts(): Promise<boolean>;
    startExtensionHosts(): Promise<void>;
    setRemoteEnvironment(_env: {
        [key: string]: string | null;
    }): Promise<void>;
    canAddExtension(): boolean;
    canRemoveExtension(): boolean;
}
