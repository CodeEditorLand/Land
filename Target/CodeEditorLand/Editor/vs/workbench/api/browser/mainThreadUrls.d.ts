import { MainThreadUrlsShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IURLService } from '../../../platform/url/common/url.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IExtensionUrlHandler } from '../../services/extensions/browser/extensionUrlHandler.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
export declare class MainThreadUrls implements MainThreadUrlsShape {
    private readonly urlService;
    private readonly extensionUrlHandler;
    private readonly proxy;
    private handlers;
    constructor(context: IExtHostContext, urlService: IURLService, extensionUrlHandler: IExtensionUrlHandler);
    $registerUriHandler(handle: number, extensionId: ExtensionIdentifier, extensionDisplayName: string): Promise<void>;
    $unregisterUriHandler(handle: number): Promise<void>;
    $createAppUri(uri: UriComponents): Promise<URI>;
    dispose(): void;
}
