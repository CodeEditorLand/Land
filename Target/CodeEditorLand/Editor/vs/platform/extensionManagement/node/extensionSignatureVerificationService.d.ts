import { TargetPlatform } from '../../extensions/common/extensions.js';
import { ILogService } from '../../log/common/log.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { ExtensionSignatureVerificationCode } from '../common/extensionManagement.js';
export declare const IExtensionSignatureVerificationService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionSignatureVerificationService>;
export interface IExtensionSignatureVerificationResult {
    readonly code: ExtensionSignatureVerificationCode;
}
/**
 * A service for verifying signed extensions.
 */
export interface IExtensionSignatureVerificationService {
    readonly _serviceBrand: undefined;
    /**
     * Verifies an extension file (.vsix) against a signature archive file.
     * @param extensionId The extension identifier.
     * @param version The extension version.
     * @param vsixFilePath The extension file path.
     * @param signatureArchiveFilePath The signature archive file path.
     * @returns returns the verification result or undefined if the verification was not executed.
     */
    verify(extensionId: string, version: string, vsixFilePath: string, signatureArchiveFilePath: string, clientTargetPlatform?: TargetPlatform): Promise<IExtensionSignatureVerificationResult | undefined>;
}
/**
 * Extension signature verification result
 */
export interface ExtensionSignatureVerificationResult {
    readonly code: ExtensionSignatureVerificationCode;
    readonly didExecute: boolean;
    readonly internalCode?: number;
    readonly output?: string;
}
export declare class ExtensionSignatureVerificationService implements IExtensionSignatureVerificationService {
    private readonly logService;
    private readonly telemetryService;
    readonly _serviceBrand: undefined;
    private moduleLoadingPromise;
    constructor(logService: ILogService, telemetryService: ITelemetryService);
    private vsceSign;
    private resolveVsceSign;
    verify(extensionId: string, version: string, vsixFilePath: string, signatureArchiveFilePath: string, clientTargetPlatform?: TargetPlatform): Promise<IExtensionSignatureVerificationResult | undefined>;
}
