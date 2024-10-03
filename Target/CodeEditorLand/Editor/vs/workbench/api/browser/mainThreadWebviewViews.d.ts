import { Disposable } from '../../../base/common/lifecycle.js';
import { MainThreadWebviews } from './mainThreadWebviews.js';
import * as extHostProtocol from '../common/extHost.protocol.js';
import { IViewBadge } from '../../common/views.js';
import { IWebviewViewService } from '../../contrib/webviewView/browser/webviewViewService.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadWebviewsViews extends Disposable implements extHostProtocol.MainThreadWebviewViewsShape {
    private readonly mainThreadWebviews;
    private readonly _telemetryService;
    private readonly _webviewViewService;
    private readonly _proxy;
    private readonly _webviewViews;
    private readonly _webviewViewProviders;
    constructor(context: IExtHostContext, mainThreadWebviews: MainThreadWebviews, _telemetryService: ITelemetryService, _webviewViewService: IWebviewViewService);
    $setWebviewViewTitle(handle: extHostProtocol.WebviewHandle, value: string | undefined): void;
    $setWebviewViewDescription(handle: extHostProtocol.WebviewHandle, value: string | undefined): void;
    $setWebviewViewBadge(handle: string, badge: IViewBadge | undefined): void;
    $show(handle: extHostProtocol.WebviewHandle, preserveFocus: boolean): void;
    $registerWebviewViewProvider(extensionData: extHostProtocol.WebviewExtensionDescription, viewType: string, options: {
        retainContextWhenHidden?: boolean;
        serializeBuffersForPostMessage: boolean;
    }): void;
    $unregisterWebviewViewProvider(viewType: string): void;
    private getWebviewView;
}
