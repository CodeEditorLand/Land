import { IExtensionIdentifier, IGalleryExtension, ILocalExtension } from './extensionManagement.js';
import { ExtensionIdentifier, IExtension, TargetPlatform } from '../../extensions/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
export declare function areSameExtensions(a: IExtensionIdentifier, b: IExtensionIdentifier): boolean;
export declare class ExtensionKey {
    readonly identifier: IExtensionIdentifier;
    readonly version: string;
    readonly targetPlatform: TargetPlatform;
    static create(extension: IExtension | IGalleryExtension): ExtensionKey;
    static parse(key: string): ExtensionKey | null;
    readonly id: string;
    constructor(identifier: IExtensionIdentifier, version: string, targetPlatform?: TargetPlatform);
    toString(): string;
    equals(o: any): boolean;
}
export declare function getIdAndVersion(id: string): [string, string | undefined];
export declare function getExtensionId(publisher: string, name: string): string;
export declare function adoptToGalleryExtensionId(id: string): string;
export declare function getGalleryExtensionId(publisher: string | undefined, name: string): string;
export declare function groupByExtension<T>(extensions: T[], getExtensionIdentifier: (t: T) => IExtensionIdentifier): T[][];
export declare function getLocalExtensionTelemetryData(extension: ILocalExtension): {
    id: string;
    name: string;
    galleryId: null;
    publisherId: string | null;
    publisherName: string;
    publisherDisplayName: string | undefined;
    dependencies: boolean | undefined;
};
export declare function getGalleryExtensionTelemetryData(extension: IGalleryExtension): any;
export declare const BetterMergeId: ExtensionIdentifier;
export declare function getExtensionDependencies(installedExtensions: ReadonlyArray<IExtension>, extension: IExtension): IExtension[];
export declare function computeTargetPlatform(fileService: IFileService, logService: ILogService): Promise<TargetPlatform>;
