import { ExtensionKind } from '../../../../platform/environment/common/environment.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
export declare const enum ExtensionHostKind {
    LocalProcess = 1,
    LocalWebWorker = 2,
    Remote = 3
}
export declare function extensionHostKindToString(kind: ExtensionHostKind | null): string;
export declare const enum ExtensionRunningPreference {
    None = 0,
    Local = 1,
    Remote = 2
}
export declare function extensionRunningPreferenceToString(preference: ExtensionRunningPreference): "None" | "Local" | "Remote";
export interface IExtensionHostKindPicker {
    pickExtensionHostKind(extensionId: ExtensionIdentifier, extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
}
export declare function determineExtensionHostKinds(_localExtensions: IExtensionDescription[], _remoteExtensions: IExtensionDescription[], getExtensionKind: (extensionDescription: IExtensionDescription) => ExtensionKind[], pickExtensionHostKind: (extensionId: ExtensionIdentifier, extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference) => ExtensionHostKind | null): Map<string, ExtensionHostKind | null>;
