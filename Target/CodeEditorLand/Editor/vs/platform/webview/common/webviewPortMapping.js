import { Schemas } from '../../../base/common/network.js';
import { URI } from '../../../base/common/uri.js';
import { extractLocalHostUriMetaDataForPortMapping } from '../../tunnel/common/tunnel.js';
export class WebviewPortMappingManager {
    constructor(_getExtensionLocation, _getMappings, tunnelService) {
        this._getExtensionLocation = _getExtensionLocation;
        this._getMappings = _getMappings;
        this.tunnelService = tunnelService;
        this._tunnels = new Map();
    }
    async getRedirect(resolveAuthority, url) {
        const uri = URI.parse(url);
        const requestLocalHostInfo = extractLocalHostUriMetaDataForPortMapping(uri);
        if (!requestLocalHostInfo) {
            return undefined;
        }
        for (const mapping of this._getMappings()) {
            if (mapping.webviewPort === requestLocalHostInfo.port) {
                const extensionLocation = this._getExtensionLocation();
                if (extensionLocation && extensionLocation.scheme === Schemas.vscodeRemote) {
                    const tunnel = resolveAuthority && await this.getOrCreateTunnel(resolveAuthority, mapping.extensionHostPort);
                    if (tunnel) {
                        if (tunnel.tunnelLocalPort === mapping.webviewPort) {
                            return undefined;
                        }
                        return encodeURI(uri.with({
                            authority: `127.0.0.1:${tunnel.tunnelLocalPort}`,
                        }).toString(true));
                    }
                }
                if (mapping.webviewPort !== mapping.extensionHostPort) {
                    return encodeURI(uri.with({
                        authority: `${requestLocalHostInfo.address}:${mapping.extensionHostPort}`
                    }).toString(true));
                }
            }
        }
        return undefined;
    }
    async dispose() {
        for (const tunnel of this._tunnels.values()) {
            await tunnel.dispose();
        }
        this._tunnels.clear();
    }
    async getOrCreateTunnel(remoteAuthority, remotePort) {
        const existing = this._tunnels.get(remotePort);
        if (existing) {
            return existing;
        }
        const tunnelOrError = await this.tunnelService.openTunnel({ getAddress: async () => remoteAuthority }, undefined, remotePort);
        let tunnel;
        if (typeof tunnelOrError === 'string') {
            tunnel = undefined;
        }
        if (tunnel) {
            this._tunnels.set(remotePort, tunnel);
        }
        return tunnel;
    }
}
