import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { ExtensionSignatureVerificationCode, IExtensionGalleryService, IGalleryExtension, InstallOperation } from '../common/extensionManagement.js';
import { IExtensionSignatureVerificationService } from './extensionSignatureVerificationService.js';
import { TargetPlatform } from '../../extensions/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export declare class ExtensionsDownloader extends Disposable {
    private readonly fileService;
    private readonly extensionGalleryService;
    private readonly extensionSignatureVerificationService;
    private readonly telemetryService;
    private readonly logService;
    private static readonly SignatureArchiveExtension;
    readonly extensionsDownloadDir: URI;
    private readonly cache;
    private readonly cleanUpPromise;
    constructor(environmentService: INativeEnvironmentService, fileService: IFileService, extensionGalleryService: IExtensionGalleryService, extensionSignatureVerificationService: IExtensionSignatureVerificationService, telemetryService: ITelemetryService, logService: ILogService);
    download(extension: IGalleryExtension, operation: InstallOperation, verifySignature: boolean, clientTargetPlatform?: TargetPlatform): Promise<{
        readonly location: URI;
        readonly verificationStatus: ExtensionSignatureVerificationCode | undefined;
    }>;
    private downloadVSIX;
    private downloadSignatureArchive;
    private downloadFile;
    private doDownload;
    protected validate(zipPath: string, filePath: string): Promise<void>;
    delete(location: URI): Promise<void>;
    private cleanUp;
    private getName;
}
