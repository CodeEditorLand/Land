import { IExtUri } from '../../../base/common/resources.js';
import { UriComponents } from '../../../base/common/uri.js';
import { ExtHostFileSystemInfoShape } from './extHost.protocol.js';
export declare class ExtHostFileSystemInfo implements ExtHostFileSystemInfoShape {
    readonly _serviceBrand: undefined;
    private readonly _systemSchemes;
    private readonly _providerInfo;
    readonly extUri: IExtUri;
    constructor();
    $acceptProviderInfos(uri: UriComponents, capabilities: number | null): void;
    isFreeScheme(scheme: string): boolean;
    getCapabilities(scheme: string): number | undefined;
}
export interface IExtHostFileSystemInfo extends ExtHostFileSystemInfo {
    readonly extUri: IExtUri;
}
export declare const IExtHostFileSystemInfo: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostFileSystemInfo>;
