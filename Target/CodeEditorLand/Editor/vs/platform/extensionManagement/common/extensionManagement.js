/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
        case "win32-x64" /* TargetPlatform.WIN32_X64 */: return 'Windows 64 bit';
        case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return 'Windows ARM';
        case "linux-x64" /* TargetPlatform.LINUX_X64 */: return 'Linux 64 bit';
        case "linux-arm64" /* TargetPlatform.LINUX_ARM64 */: return 'Linux ARM 64';
        case "linux-armhf" /* TargetPlatform.LINUX_ARMHF */: return 'Linux ARM';
        case "alpine-x64" /* TargetPlatform.ALPINE_X64 */: return 'Alpine Linux 64 bit';
        case "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */: return 'Alpine ARM 64';
        case "darwin-x64" /* TargetPlatform.DARWIN_X64 */: return 'Mac';
        case "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */: return 'Mac Silicon';
        case "web" /* TargetPlatform.WEB */: return 'Web';
        case "universal" /* TargetPlatform.UNIVERSAL */: return "universal" /* TargetPlatform.UNIVERSAL */;
        case "unknown" /* TargetPlatform.UNKNOWN */: return "unknown" /* TargetPlatform.UNKNOWN */;
        case "undefined" /* TargetPlatform.UNDEFINED */: return "undefined" /* TargetPlatform.UNDEFINED */;
    }
}
export function toTargetPlatform(targetPlatform) {
    switch (targetPlatform) {
        case "win32-x64" /* TargetPlatform.WIN32_X64 */: return "win32-x64" /* TargetPlatform.WIN32_X64 */;
        case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return "win32-arm64" /* TargetPlatform.WIN32_ARM64 */;
        case "linux-x64" /* TargetPlatform.LINUX_X64 */: return "linux-x64" /* TargetPlatform.LINUX_X64 */;
        case "linux-arm64" /* TargetPlatform.LINUX_ARM64 */: return "linux-arm64" /* TargetPlatform.LINUX_ARM64 */;
        case "linux-armhf" /* TargetPlatform.LINUX_ARMHF */: return "linux-armhf" /* TargetPlatform.LINUX_ARMHF */;
        case "alpine-x64" /* TargetPlatform.ALPINE_X64 */: return "alpine-x64" /* TargetPlatform.ALPINE_X64 */;
        case "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */: return "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */;
        case "darwin-x64" /* TargetPlatform.DARWIN_X64 */: return "darwin-x64" /* TargetPlatform.DARWIN_X64 */;
        case "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */: return "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */;
        case "web" /* TargetPlatform.WEB */: return "web" /* TargetPlatform.WEB */;
        case "universal" /* TargetPlatform.UNIVERSAL */: return "universal" /* TargetPlatform.UNIVERSAL */;
        default: return "unknown" /* TargetPlatform.UNKNOWN */;
    }
}
export function getTargetPlatform(platform, arch) {
    switch (platform) {
        case 3 /* Platform.Windows */:
            if (arch === 'x64') {
                return "win32-x64" /* TargetPlatform.WIN32_X64 */;
            }
            if (arch === 'arm64') {
                return "win32-arm64" /* TargetPlatform.WIN32_ARM64 */;
            }
            return "unknown" /* TargetPlatform.UNKNOWN */;
        case 2 /* Platform.Linux */:
            if (arch === 'x64') {
                return "linux-x64" /* TargetPlatform.LINUX_X64 */;
            }
            if (arch === 'arm64') {
                return "linux-arm64" /* TargetPlatform.LINUX_ARM64 */;
            }
            if (arch === 'arm') {
                return "linux-armhf" /* TargetPlatform.LINUX_ARMHF */;
            }
            return "unknown" /* TargetPlatform.UNKNOWN */;
        case 'alpine':
            if (arch === 'x64') {
                return "alpine-x64" /* TargetPlatform.ALPINE_X64 */;
            }
            if (arch === 'arm64') {
                return "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */;
            }
            return "unknown" /* TargetPlatform.UNKNOWN */;
        case 1 /* Platform.Mac */:
            if (arch === 'x64') {
                return "darwin-x64" /* TargetPlatform.DARWIN_X64 */;
            }
            if (arch === 'arm64') {
                return "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */;
            }
            return "unknown" /* TargetPlatform.UNKNOWN */;
        case 0 /* Platform.Web */: return "web" /* TargetPlatform.WEB */;
    }
}
export function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform) {
    // Not a web extension in web target platform
    return productTargetPlatform === "web" /* TargetPlatform.WEB */ && !allTargetPlatforms.includes("web" /* TargetPlatform.WEB */);
}
export function isTargetPlatformCompatible(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
    // Not compatible when extension is not a web extension in web target platform
    if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform)) {
        return false;
    }
    // Compatible when extension target platform is not defined
    if (extensionTargetPlatform === "undefined" /* TargetPlatform.UNDEFINED */) {
        return true;
    }
    // Compatible when extension target platform is universal
    if (extensionTargetPlatform === "universal" /* TargetPlatform.UNIVERSAL */) {
        return true;
    }
    // Not compatible when extension target platform is unknown
    if (extensionTargetPlatform === "unknown" /* TargetPlatform.UNKNOWN */) {
        return false;
    }
    // Compatible when extension and product target platforms matches
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
