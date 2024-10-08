import { ExtensionHostKind } from './extensionHostKind.js';
export declare class LocalProcessRunningLocation {
    readonly affinity: number;
    readonly kind = ExtensionHostKind.LocalProcess;
    constructor(affinity: number);
    equals(other: ExtensionRunningLocation): boolean;
    asString(): string;
}
export declare class LocalWebWorkerRunningLocation {
    readonly affinity: number;
    readonly kind = ExtensionHostKind.LocalWebWorker;
    constructor(affinity: number);
    equals(other: ExtensionRunningLocation): boolean;
    asString(): string;
}
export declare class RemoteRunningLocation {
    readonly kind = ExtensionHostKind.Remote;
    readonly affinity = 0;
    equals(other: ExtensionRunningLocation): other is RemoteRunningLocation;
    asString(): string;
}
export type ExtensionRunningLocation = LocalProcessRunningLocation | LocalWebWorkerRunningLocation | RemoteRunningLocation;
