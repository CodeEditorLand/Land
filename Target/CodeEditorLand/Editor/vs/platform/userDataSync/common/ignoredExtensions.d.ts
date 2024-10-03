import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ILocalExtension } from '../../extensionManagement/common/extensionManagement.js';
export declare const IIgnoredExtensionsManagementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IIgnoredExtensionsManagementService>;
export interface IIgnoredExtensionsManagementService {
    readonly _serviceBrand: any;
    getIgnoredExtensions(installed: ILocalExtension[]): string[];
    hasToNeverSyncExtension(extensionId: string): boolean;
    hasToAlwaysSyncExtension(extensionId: string): boolean;
    updateIgnoredExtensions(ignoredExtensionId: string, ignore: boolean): Promise<void>;
    updateSynchronizedExtensions(ignoredExtensionId: string, sync: boolean): Promise<void>;
}
export declare class IgnoredExtensionsManagementService implements IIgnoredExtensionsManagementService {
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(configurationService: IConfigurationService);
    hasToNeverSyncExtension(extensionId: string): boolean;
    hasToAlwaysSyncExtension(extensionId: string): boolean;
    updateIgnoredExtensions(ignoredExtensionId: string, ignore: boolean): Promise<void>;
    updateSynchronizedExtensions(extensionId: string, sync: boolean): Promise<void>;
    getIgnoredExtensions(installed: ILocalExtension[]): string[];
    private getConfiguredIgnoredExtensions;
}
