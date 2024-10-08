import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IAddress } from '../../remote/common/remoteAgentConnection.js';
import { ITunnelService } from '../../tunnel/common/tunnel.js';
export interface IWebviewPortMapping {
    readonly webviewPort: number;
    readonly extensionHostPort: number;
}
/**
 * Manages port mappings for a single webview.
 */
export declare class WebviewPortMappingManager implements IDisposable {
    private readonly _getExtensionLocation;
    private readonly _getMappings;
    private readonly tunnelService;
    private readonly _tunnels;
    constructor(_getExtensionLocation: () => URI | undefined, _getMappings: () => readonly IWebviewPortMapping[], tunnelService: ITunnelService);
    getRedirect(resolveAuthority: IAddress | null | undefined, url: string): Promise<string | undefined>;
    dispose(): Promise<void>;
    private getOrCreateTunnel;
}
