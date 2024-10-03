import { isWeb } from '../../../base/common/platform.js';
import { format2 } from '../../../base/common/strings.js';
import { URI } from '../../../base/common/uri.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { getServiceMachineId } from '../../externalServices/common/serviceMachineId.js';
import { getTelemetryLevel, supportsTelemetry } from '../../telemetry/common/telemetryUtils.js';
import { RemoteAuthorities } from '../../../base/common/network.js';
const WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT = '/web-extension-resource/';
export const IExtensionResourceLoaderService = createDecorator('extensionResourceLoaderService');
export function migratePlatformSpecificExtensionGalleryResourceURL(resource, targetPlatform) {
    if (resource.query !== `target=${targetPlatform}`) {
        return undefined;
    }
    const paths = resource.path.split('/');
    if (!paths[3]) {
        return undefined;
    }
    paths[3] = `${paths[3]}+${targetPlatform}`;
    return resource.with({ query: null, path: paths.join('/') });
}
export class AbstractExtensionResourceLoaderService {
    constructor(_fileService, _storageService, _productService, _environmentService, _configurationService) {
        this._fileService = _fileService;
        this._storageService = _storageService;
        this._productService = _productService;
        this._environmentService = _environmentService;
        this._configurationService = _configurationService;
        if (_productService.extensionsGallery) {
            this._extensionGalleryResourceUrlTemplate = _productService.extensionsGallery.resourceUrlTemplate;
            this._extensionGalleryAuthority = this._extensionGalleryResourceUrlTemplate ? this._getExtensionGalleryAuthority(URI.parse(this._extensionGalleryResourceUrlTemplate)) : undefined;
        }
    }
    get supportsExtensionGalleryResources() {
        return this._extensionGalleryResourceUrlTemplate !== undefined;
    }
    getExtensionGalleryResourceURL({ publisher, name, version, targetPlatform }, path) {
        if (this._extensionGalleryResourceUrlTemplate) {
            const uri = URI.parse(format2(this._extensionGalleryResourceUrlTemplate, {
                publisher,
                name,
                version: targetPlatform !== undefined
                    && targetPlatform !== "undefined"
                    && targetPlatform !== "unknown"
                    && targetPlatform !== "universal"
                    ? `${version}+${targetPlatform}`
                    : version,
                path: 'extension'
            }));
            return this._isWebExtensionResourceEndPoint(uri) ? uri.with({ scheme: RemoteAuthorities.getPreferredWebSchema() }) : uri;
        }
        return undefined;
    }
    isExtensionGalleryResource(uri) {
        return !!this._extensionGalleryAuthority && this._extensionGalleryAuthority === this._getExtensionGalleryAuthority(uri);
    }
    async getExtensionGalleryRequestHeaders() {
        const headers = {
            'X-Client-Name': `${this._productService.applicationName}${isWeb ? '-web' : ''}`,
            'X-Client-Version': this._productService.version
        };
        if (supportsTelemetry(this._productService, this._environmentService) && getTelemetryLevel(this._configurationService) === 3) {
            headers['X-Machine-Id'] = await this._getServiceMachineId();
        }
        if (this._productService.commit) {
            headers['X-Client-Commit'] = this._productService.commit;
        }
        return headers;
    }
    _getServiceMachineId() {
        if (!this._serviceMachineIdPromise) {
            this._serviceMachineIdPromise = getServiceMachineId(this._environmentService, this._fileService, this._storageService);
        }
        return this._serviceMachineIdPromise;
    }
    _getExtensionGalleryAuthority(uri) {
        if (this._isWebExtensionResourceEndPoint(uri)) {
            return uri.authority;
        }
        const index = uri.authority.indexOf('.');
        return index !== -1 ? uri.authority.substring(index + 1) : undefined;
    }
    _isWebExtensionResourceEndPoint(uri) {
        const uriPath = uri.path, serverRootPath = RemoteAuthorities.getServerRootPath();
        return uriPath.startsWith(serverRootPath) && uriPath.startsWith(WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT, serverRootPath.length);
    }
}
