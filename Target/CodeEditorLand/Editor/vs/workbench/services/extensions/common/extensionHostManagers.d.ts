import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { ExtensionHostKind } from './extensionHostKind.js';
import { IExtensionDescriptionDelta } from './extensionHostProtocol.js';
import { IResolveAuthorityResult } from './extensionHostProxy.js';
import { ExtensionRunningLocation } from './extensionRunningLocation.js';
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup } from './extensions.js';
import { ResponsiveState } from './rpcProtocol.js';
export interface IExtensionHostManager {
    readonly pid: number | null;
    readonly kind: ExtensionHostKind;
    readonly startup: ExtensionHostStartup;
    readonly friendyName: string;
    readonly onDidExit: Event<[number, string | null]>;
    readonly onDidChangeResponsiveState: Event<ResponsiveState>;
    disconnect(): Promise<void>;
    dispose(): void;
    ready(): Promise<void>;
    representsRunningLocation(runningLocation: ExtensionRunningLocation): boolean;
    deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    activate(extension: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    getInspectPort(tryEnableInspector: boolean): Promise<{
        port: number;
        host: string;
    } | undefined>;
    resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
    start(extensionRegistryVersionId: number, allExtensions: readonly IExtensionDescription[], myExtensions: ExtensionIdentifier[]): Promise<void>;
    extensionTestsExecute(): Promise<number>;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
