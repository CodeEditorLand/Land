import { localize2 } from '../../../nls.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const EXTENSION_IDENTIFIER_PATTERN = '^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$';
export const EXTENSION_IDENTIFIER_REGEX = new RegExp(EXTENSION_IDENTIFIER_PATTERN);
export const WEB_EXTENSION_TAG = '__web_extension';
export const EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = 'skipWalkthrough';
export const EXTENSION_INSTALL_SOURCE_CONTEXT = 'extensionInstallSource';
export const EXTENSION_INSTALL_DEP_PACK_CONTEXT = 'dependecyOrPackExtensionInstall';
export const EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT = 'clientTargetPlatform';
export function TargetPlatformToString(targetPlatform) {
    switch (targetPlatform) {
        case "win32-x64": return 'Windows 64 bit';
        case "win32-arm64": return 'Windows ARM';
        case "linux-x64": return 'Linux 64 bit';
        case "linux-arm64": return 'Linux ARM 64';
        case "linux-armhf": return 'Linux ARM';
        case "alpine-x64": return 'Alpine Linux 64 bit';
        case "alpine-arm64": return 'Alpine ARM 64';
        case "darwin-x64": return 'Mac';
        case "darwin-arm64": return 'Mac Silicon';
        case "web": return 'Web';
        case "universal": return "universal";
        case "unknown": return "unknown";
        case "undefined": return "undefined";
    }
}
export function toTargetPlatform(targetPlatform) {
    switch (targetPlatform) {
        case "win32-x64": return "win32-x64";
        case "win32-arm64": return "win32-arm64";
        case "linux-x64": return "linux-x64";
        case "linux-arm64": return "linux-arm64";
        case "linux-armhf": return "linux-armhf";
        case "alpine-x64": return "alpine-x64";
        case "alpine-arm64": return "alpine-arm64";
        case "darwin-x64": return "darwin-x64";
        case "darwin-arm64": return "darwin-arm64";
        case "web": return "web";
        case "universal": return "universal";
        default: return "unknown";
    }
}
export function getTargetPlatform(platform, arch) {
    switch (platform) {
        case 3:
            if (arch === 'x64') {
                return "win32-x64";
            }
            if (arch === 'arm64') {
                return "win32-arm64";
            }
            return "unknown";
        case 2:
            if (arch === 'x64') {
                return "linux-x64";
            }
            if (arch === 'arm64') {
                return "linux-arm64";
            }
            if (arch === 'arm') {
                return "linux-armhf";
            }
            return "unknown";
        case 'alpine':
            if (arch === 'x64') {
                return "alpine-x64";
            }
            if (arch === 'arm64') {
                return "alpine-arm64";
            }
            return "unknown";
        case 1:
            if (arch === 'x64') {
                return "darwin-x64";
            }
            if (arch === 'arm64') {
                return "darwin-arm64";
            }
            return "unknown";
        case 0: return "web";
    }
}
export function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform) {
    return productTargetPlatform === "web" && !allTargetPlatforms.includes("web");
}
export function isTargetPlatformCompatible(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
    if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform)) {
        return false;
    }
    if (extensionTargetPlatform === "undefined") {
        return true;
    }
    if (extensionTargetPlatform === "universal") {
        return true;
    }
    if (extensionTargetPlatform === "unknown") {
        return false;
    }
    if (extensionTargetPlatform === productTargetPlatform) {
        return true;
    }
    return false;
}
export function isIExtensionIdentifier(thing) {
    return thing
        && typeof thing === 'object'
        && typeof thing.id === 'string'
        && (!thing.uuid || typeof thing.uuid === 'string');
}
export const IExtensionGalleryService = createDecorator('extensionGalleryService');
export class ExtensionGalleryError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = code;
    }
}
export var ExtensionSignatureVerificationCode;
(function (ExtensionSignatureVerificationCode) {
    ExtensionSignatureVerificationCode["Success"] = "Success";
    ExtensionSignatureVerificationCode["RequiredArgumentMissing"] = "RequiredArgumentMissing";
    ExtensionSignatureVerificationCode["InvalidArgument"] = "InvalidArgument";
    ExtensionSignatureVerificationCode["PackageIsUnreadable"] = "PackageIsUnreadable";
    ExtensionSignatureVerificationCode["UnhandledException"] = "UnhandledException";
    ExtensionSignatureVerificationCode["SignatureManifestIsMissing"] = "SignatureManifestIsMissing";
    ExtensionSignatureVerificationCode["SignatureManifestIsUnreadable"] = "SignatureManifestIsUnreadable";
    ExtensionSignatureVerificationCode["SignatureIsMissing"] = "SignatureIsMissing";
    ExtensionSignatureVerificationCode["SignatureIsUnreadable"] = "SignatureIsUnreadable";
    ExtensionSignatureVerificationCode["CertificateIsUnreadable"] = "CertificateIsUnreadable";
    ExtensionSignatureVerificationCode["SignatureArchiveIsUnreadable"] = "SignatureArchiveIsUnreadable";
    ExtensionSignatureVerificationCode["FileAlreadyExists"] = "FileAlreadyExists";
    ExtensionSignatureVerificationCode["SignatureArchiveIsInvalidZip"] = "SignatureArchiveIsInvalidZip";
    ExtensionSignatureVerificationCode["SignatureArchiveHasSameSignatureFile"] = "SignatureArchiveHasSameSignatureFile";
    ExtensionSignatureVerificationCode["PackageIntegrityCheckFailed"] = "PackageIntegrityCheckFailed";
    ExtensionSignatureVerificationCode["SignatureIsInvalid"] = "SignatureIsInvalid";
    ExtensionSignatureVerificationCode["SignatureManifestIsInvalid"] = "SignatureManifestIsInvalid";
    ExtensionSignatureVerificationCode["SignatureIntegrityCheckFailed"] = "SignatureIntegrityCheckFailed";
    ExtensionSignatureVerificationCode["EntryIsMissing"] = "EntryIsMissing";
    ExtensionSignatureVerificationCode["EntryIsTampered"] = "EntryIsTampered";
    ExtensionSignatureVerificationCode["Untrusted"] = "Untrusted";
    ExtensionSignatureVerificationCode["CertificateRevoked"] = "CertificateRevoked";
    ExtensionSignatureVerificationCode["SignatureIsNotValid"] = "SignatureIsNotValid";
    ExtensionSignatureVerificationCode["UnknownError"] = "UnknownError";
    ExtensionSignatureVerificationCode["PackageIsInvalidZip"] = "PackageIsInvalidZip";
    ExtensionSignatureVerificationCode["SignatureArchiveHasTooManyEntries"] = "SignatureArchiveHasTooManyEntries";
})(ExtensionSignatureVerificationCode || (ExtensionSignatureVerificationCode = {}));
export class ExtensionManagementError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = code;
    }
}
export const IExtensionManagementService = createDecorator('extensionManagementService');
export const DISABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/disabled';
export const ENABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/enabled';
export const IGlobalExtensionEnablementService = createDecorator('IGlobalExtensionEnablementService');
export const IExtensionTipsService = createDecorator('IExtensionTipsService');
export const ExtensionsLocalizedLabel = localize2('extensions', "Extensions");
export const PreferencesLocalizedLabel = localize2('preferences', 'Preferences');
