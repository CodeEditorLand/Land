import { VSBuffer } from '../../../base/common/buffer.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IOpenerService } from '../../../platform/opener/common/opener.js';
import { IProductService } from '../../../platform/product/common/productService.js';
import * as extHostProtocol from '../common/extHost.protocol.js';
import { IOverlayWebview, WebviewContentOptions, WebviewExtensionDescription } from '../../contrib/webview/browser/webview.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadWebviews extends Disposable implements extHostProtocol.MainThreadWebviewsShape {
    private readonly _openerService;
    private readonly _productService;
    private static readonly standardSupportedLinkSchemes;
    private readonly _proxy;
    private readonly _webviews;
    constructor(context: IExtHostContext, _openerService: IOpenerService, _productService: IProductService);
    addWebview(handle: extHostProtocol.WebviewHandle, webview: IOverlayWebview, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $setHtml(handle: extHostProtocol.WebviewHandle, value: string): void;
    $setOptions(handle: extHostProtocol.WebviewHandle, options: extHostProtocol.IWebviewContentOptions): void;
    $postMessage(handle: extHostProtocol.WebviewHandle, jsonMessage: string, ...buffers: VSBuffer[]): Promise<boolean>;
    private hookupWebviewEventDelegate;
    private onDidClickLink;
    private isSupportedLink;
    private tryGetWebview;
    private getWebview;
    getWebviewResolvedFailedContent(viewType: string): string;
}
export declare function reviveWebviewExtension(extensionData: extHostProtocol.WebviewExtensionDescription): WebviewExtensionDescription;
export declare function reviveWebviewContentOptions(webviewOptions: extHostProtocol.IWebviewContentOptions): WebviewContentOptions;
