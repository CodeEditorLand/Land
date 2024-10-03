import type * as vscode from 'vscode';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ExtensionDescriptionRegistry } from '../../services/extensions/common/extensionDescriptionRegistry.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { ExtensionActivationReason, MissingExtensionDependency } from '../../services/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
export interface IExtensionModule {
    activate?(ctx: vscode.ExtensionContext): Promise<IExtensionAPI>;
    deactivate?(): void;
}
export interface IExtensionAPI {
}
export type ExtensionActivationTimesFragment = {
    startup?: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        comment: 'Activation occurred during startup';
    };
    codeLoadingTime?: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        comment: 'Time it took to load the extension\'s code';
    };
    activateCallTime?: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        comment: 'Time it took to call activate';
    };
    activateResolvedTime?: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        comment: 'Time it took for async-activation to finish';
    };
};
export declare class ExtensionActivationTimes {
    static readonly NONE: ExtensionActivationTimes;
    readonly startup: boolean;
    readonly codeLoadingTime: number;
    readonly activateCallTime: number;
    readonly activateResolvedTime: number;
    constructor(startup: boolean, codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number);
}
export declare class ExtensionActivationTimesBuilder {
    private readonly _startup;
    private _codeLoadingStart;
    private _codeLoadingStop;
    private _activateCallStart;
    private _activateCallStop;
    private _activateResolveStart;
    private _activateResolveStop;
    constructor(startup: boolean);
    private _delta;
    build(): ExtensionActivationTimes;
    codeLoadingStart(): void;
    codeLoadingStop(): void;
    activateCallStart(): void;
    activateCallStop(): void;
    activateResolveStart(): void;
    activateResolveStop(): void;
}
export declare class ActivatedExtension {
    readonly activationFailed: boolean;
    readonly activationFailedError: Error | null;
    readonly activationTimes: ExtensionActivationTimes;
    readonly module: IExtensionModule;
    readonly exports: IExtensionAPI | undefined;
    readonly disposable: IDisposable;
    constructor(activationFailed: boolean, activationFailedError: Error | null, activationTimes: ExtensionActivationTimes, module: IExtensionModule, exports: IExtensionAPI | undefined, disposable: IDisposable);
}
export declare class EmptyExtension extends ActivatedExtension {
    constructor(activationTimes: ExtensionActivationTimes);
}
export declare class HostExtension extends ActivatedExtension {
    constructor();
}
export interface IExtensionsActivatorHost {
    onExtensionActivationError(extensionId: ExtensionIdentifier, error: Error | null, missingExtensionDependency: MissingExtensionDependency | null): void;
    actualActivateExtension(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<ActivatedExtension>;
}
export declare class ExtensionsActivator implements IDisposable {
    private readonly _logService;
    private readonly _registry;
    private readonly _globalRegistry;
    private readonly _host;
    private readonly _operations;
    private readonly _alreadyActivatedEvents;
    constructor(registry: ExtensionDescriptionRegistry, globalRegistry: ExtensionDescriptionRegistry, host: IExtensionsActivatorHost, _logService: ILogService);
    dispose(): void;
    waitForActivatingExtensions(): Promise<void>;
    isActivated(extensionId: ExtensionIdentifier): boolean;
    getActivatedExtension(extensionId: ExtensionIdentifier): ActivatedExtension;
    activateByEvent(activationEvent: string, startup: boolean): Promise<void>;
    activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    private _activateExtensions;
    private _handleActivationRequest;
    private _createAndSaveOperation;
    private _isHostExtension;
    private _isResolvedExtension;
}
