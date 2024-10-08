import { IExtensionDescription } from '../../extensions/common/extensions.js';
export declare const IRemoteExtensionsScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IRemoteExtensionsScannerService>;
export declare const RemoteExtensionsScannerChannelName = "remoteExtensionsScanner";
export interface IRemoteExtensionsScannerService {
    readonly _serviceBrand: undefined;
    whenExtensionsReady(): Promise<void>;
    scanExtensions(): Promise<IExtensionDescription[]>;
}
