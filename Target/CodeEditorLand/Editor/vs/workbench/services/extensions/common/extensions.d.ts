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
export interface IExtensionHostProfile {
    startTime: number;
    endTime: number;
    deltas: number[];
    ids: ProfileSegmentId[];
    data: IV8Profile;
    getAggregatedTimes(): Map<ProfileSegmentId, number>;
}
export declare const enum ExtensionHostStartup {
    EagerAutoStart = 1,
    EagerManualStart = 2,
    Lazy = 3
}
export interface IExtensionHost {
    readonly pid: number | null;
    readonly runningLocation: ExtensionRunningLocation;
    readonly remoteAuthority: string | null;
    readonly startup: ExtensionHostStartup;
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
    readonly reason: string;
    readonly auto: boolean;
    veto(value: boolean | Promise<boolean>, reason: string): void;
}
export interface IExtensionService {
    readonly _serviceBrand: undefined;
    onDidRegisterExtensions: Event<void>;
    onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]>;
    onDidChangeExtensions: Event<{
        readonly added: readonly IExtensionDescription[];
        readonly removed: readonly IExtensionDescription[];
    }>;
    readonly extensions: readonly IExtensionDescription[];
    onWillActivateByEvent: Event<IWillActivateEvent>;
    onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent>;
    onWillStop: Event<WillStopExtensionHostsEvent>;
    activateByEvent(activationEvent: string, activationKind?: ActivationKind): Promise<void>;
    activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    whenInstalledExtensionsRegistered(): Promise<boolean>;
    getExtension(id: string): Promise<IExtensionDescription | undefined>;
    canAddExtension(extension: IExtensionDescription): boolean;
    canRemoveExtension(extension: IExtensionDescription): boolean;
    readExtensionPointContributions<T extends IExtensionContributions[keyof IExtensionContributions]>(extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    getInspectPorts(extensionHostKind: ExtensionHostKind, tryEnableInspector: boolean): Promise<{
        port: number;
        host: string;
    }[]>;
    stopExtensionHosts(reason: string, auto?: boolean): Promise<boolean>;
    startExtensionHosts(updates?: {
        readonly toAdd: readonly IExtension[];
        readonly toRemove: readonly string[];
    }): Promise<void>;
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
