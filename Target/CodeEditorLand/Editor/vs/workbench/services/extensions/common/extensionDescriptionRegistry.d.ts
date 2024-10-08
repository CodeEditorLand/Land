import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
export declare class DeltaExtensionsResult {
    readonly versionId: number;
    readonly removedDueToLooping: IExtensionDescription[];
    constructor(versionId: number, removedDueToLooping: IExtensionDescription[]);
}
export interface IReadOnlyExtensionDescriptionRegistry {
    containsActivationEvent(activationEvent: string): boolean;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    getExtensionDescriptionsForActivationEvent(activationEvent: string): IExtensionDescription[];
    getAllExtensionDescriptions(): IExtensionDescription[];
    getExtensionDescription(extensionId: ExtensionIdentifier | string): IExtensionDescription | undefined;
    getExtensionDescriptionByUUID(uuid: string): IExtensionDescription | undefined;
    getExtensionDescriptionByIdOrUUID(extensionId: ExtensionIdentifier | string, uuid: string | undefined): IExtensionDescription | undefined;
}
export declare class ExtensionDescriptionRegistry implements IReadOnlyExtensionDescriptionRegistry {
    private readonly _activationEventsReader;
    static isHostExtension(extensionId: ExtensionIdentifier | string, myRegistry: ExtensionDescriptionRegistry, globalRegistry: ExtensionDescriptionRegistry): boolean;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../workbench.web.main.internal.js").Event<void>;
    private _versionId;
    private _extensionDescriptions;
    private _extensionsMap;
    private _extensionsArr;
    private _activationMap;
    constructor(_activationEventsReader: IActivationEventsReader, extensionDescriptions: IExtensionDescription[]);
    private _initialize;
    set(extensionDescriptions: IExtensionDescription[]): {
        versionId: number;
    };
    deltaExtensions(toAdd: IExtensionDescription[], toRemove: ExtensionIdentifier[]): DeltaExtensionsResult;
    private static _findLoopingExtensions;
    containsActivationEvent(activationEvent: string): boolean;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    getExtensionDescriptionsForActivationEvent(activationEvent: string): IExtensionDescription[];
    getAllExtensionDescriptions(): IExtensionDescription[];
    getSnapshot(): ExtensionDescriptionRegistrySnapshot;
    getExtensionDescription(extensionId: ExtensionIdentifier | string): IExtensionDescription | undefined;
    getExtensionDescriptionByUUID(uuid: string): IExtensionDescription | undefined;
    getExtensionDescriptionByIdOrUUID(extensionId: ExtensionIdentifier | string, uuid: string | undefined): IExtensionDescription | undefined;
}
export declare class ExtensionDescriptionRegistrySnapshot {
    readonly versionId: number;
    readonly extensions: readonly IExtensionDescription[];
    constructor(versionId: number, extensions: readonly IExtensionDescription[]);
}
export interface IActivationEventsReader {
    readActivationEvents(extensionDescription: IExtensionDescription): string[];
}
export declare class LockableExtensionDescriptionRegistry implements IReadOnlyExtensionDescriptionRegistry {
    private readonly _actual;
    private readonly _lock;
    constructor(activationEventsReader: IActivationEventsReader);
    acquireLock(customerName: string): Promise<ExtensionDescriptionRegistryLock>;
    deltaExtensions(acquiredLock: ExtensionDescriptionRegistryLock, toAdd: IExtensionDescription[], toRemove: ExtensionIdentifier[]): DeltaExtensionsResult;
    containsActivationEvent(activationEvent: string): boolean;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    getExtensionDescriptionsForActivationEvent(activationEvent: string): IExtensionDescription[];
    getAllExtensionDescriptions(): IExtensionDescription[];
    getSnapshot(): ExtensionDescriptionRegistrySnapshot;
    getExtensionDescription(extensionId: ExtensionIdentifier | string): IExtensionDescription | undefined;
    getExtensionDescriptionByUUID(uuid: string): IExtensionDescription | undefined;
    getExtensionDescriptionByIdOrUUID(extensionId: ExtensionIdentifier | string, uuid: string | undefined): IExtensionDescription | undefined;
}
export declare class ExtensionDescriptionRegistryLock extends Disposable {
    private readonly _registry;
    private _isDisposed;
    constructor(_registry: LockableExtensionDescriptionRegistry, lock: IDisposable);
    isAcquiredFor(registry: LockableExtensionDescriptionRegistry): boolean;
}
