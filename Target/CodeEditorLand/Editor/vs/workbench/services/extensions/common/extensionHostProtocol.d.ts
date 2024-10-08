import { VSBuffer } from '../../../../base/common/buffer.js';
import { URI, UriComponents, UriDto } from '../../../../base/common/uri.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { ILoggerResource, LogLevel } from '../../../../platform/log/common/log.js';
import { IRemoteConnectionData } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
export interface IExtensionDescriptionSnapshot {
    readonly versionId: number;
    readonly allExtensions: IExtensionDescription[];
    readonly activationEvents: {
        [extensionId: string]: string[];
    };
    readonly myExtensions: ExtensionIdentifier[];
}
export interface IExtensionDescriptionDelta {
    readonly versionId: number;
    readonly toRemove: ExtensionIdentifier[];
    readonly toAdd: IExtensionDescription[];
    readonly addActivationEvents: {
        [extensionId: string]: string[];
    };
    readonly myToRemove: ExtensionIdentifier[];
    readonly myToAdd: ExtensionIdentifier[];
}
export interface IExtensionHostInitData {
    version: string;
    quality: string | undefined;
    commit?: string;
    /**
     * When set to `0`, no polling for the parent process still running will happen.
     */
    parentPid: number | 0;
    environment: IEnvironment;
    workspace?: IStaticWorkspaceData | null;
    extensions: IExtensionDescriptionSnapshot;
    nlsBaseUrl?: URI;
    telemetryInfo: {
        readonly sessionId: string;
        readonly machineId: string;
        readonly sqmId: string;
        readonly devDeviceId: string;
        readonly firstSessionDate: string;
        readonly msftInternal?: boolean;
    };
    logLevel: LogLevel;
    loggers: UriDto<ILoggerResource>[];
    logsLocation: URI;
    autoStart: boolean;
    remote: {
        isRemote: boolean;
        authority: string | undefined;
        connectionData: IRemoteConnectionData | null;
    };
    consoleForward: {
        includeStack: boolean;
        logNative: boolean;
    };
    uiKind: UIKind;
    messagePorts?: ReadonlyMap<string, MessagePortLike>;
}
export interface IEnvironment {
    isExtensionDevelopmentDebug: boolean;
    appName: string;
    appHost: string;
    appRoot?: URI;
    appLanguage: string;
    extensionTelemetryLogResource: URI;
    isExtensionTelemetryLoggingOnly: boolean;
    appUriScheme: string;
    extensionDevelopmentLocationURI?: URI[];
    extensionTestsLocationURI?: URI;
    globalStorageHome: URI;
    workspaceStorageHome: URI;
    useHostProxy?: boolean;
    skipWorkspaceStorageLock?: boolean;
    extensionLogLevel?: [string, string][];
}
export interface IStaticWorkspaceData {
    id: string;
    name: string;
    transient?: boolean;
    configuration?: UriComponents | null;
    isUntitled?: boolean | null;
}
export interface MessagePortLike {
    postMessage(message: any, transfer?: any[]): void;
    addEventListener(type: 'message', listener: (e: any) => unknown): void;
    removeEventListener(type: 'message', listener: (e: any) => unknown): void;
    start(): void;
}
export declare enum UIKind {
    Desktop = 1,
    Web = 2
}
export declare const enum ExtensionHostExitCode {
    VersionMismatch = 55,
    UnexpectedError = 81
}
export interface IExtHostReadyMessage {
    type: 'VSCODE_EXTHOST_IPC_READY';
}
export interface IExtHostSocketMessage {
    type: 'VSCODE_EXTHOST_IPC_SOCKET';
    initialDataChunk: string;
    skipWebSocketFrames: boolean;
    permessageDeflate: boolean;
    inflateBytes: string;
}
export interface IExtHostReduceGraceTimeMessage {
    type: 'VSCODE_EXTHOST_IPC_REDUCE_GRACE_TIME';
}
export declare const enum MessageType {
    Initialized = 0,
    Ready = 1,
    Terminate = 2
}
export declare function createMessageOfType(type: MessageType): VSBuffer;
export declare function isMessageOfType(message: VSBuffer, type: MessageType): boolean;
export declare const enum NativeLogMarkers {
    Start = "START_NATIVE_LOG",
    End = "END_NATIVE_LOG"
}
