import { Disposable } from '../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { MainThreadWebviews } from './mainThreadWebviews.js';
import * as extHostProtocol from '../common/extHost.protocol.js';
import { WebviewInput } from '../../contrib/webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../contrib/webviewPanel/browser/webviewWorkbenchService.js';
import { IEditorGroupsService } from '../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadWebviewPanels extends Disposable implements extHostProtocol.MainThreadWebviewPanelsShape {
    private readonly _mainThreadWebviews;
    private readonly _configurationService;
    private readonly _editorGroupService;
    private readonly _editorService;
    private readonly _telemetryService;
    private readonly _webviewWorkbenchService;
    private readonly webviewPanelViewType;
    private readonly _proxy;
    private readonly _webviewInputs;
    private readonly _revivers;
    private readonly webviewOriginStore;
    constructor(context: IExtHostContext, _mainThreadWebviews: MainThreadWebviews, _configurationService: IConfigurationService, _editorGroupService: IEditorGroupsService, _editorService: IEditorService, extensionService: IExtensionService, storageService: IStorageService, _telemetryService: ITelemetryService, _webviewWorkbenchService: IWebviewWorkbenchService);
    get webviewInputs(): Iterable<WebviewInput>;
    addWebviewInput(handle: extHostProtocol.WebviewHandle, input: WebviewInput, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $createWebviewPanel(extensionData: extHostProtocol.WebviewExtensionDescription, handle: extHostProtocol.WebviewHandle, viewType: string, initData: extHostProtocol.IWebviewInitData, showOptions: extHostProtocol.WebviewPanelShowOptions): void;
    $disposeWebview(handle: extHostProtocol.WebviewHandle): void;
    $setTitle(handle: extHostProtocol.WebviewHandle, value: string): void;
    $setIconPath(handle: extHostProtocol.WebviewHandle, value: extHostProtocol.IWebviewIconPath | undefined): void;
    $reveal(handle: extHostProtocol.WebviewHandle, showOptions: extHostProtocol.WebviewPanelShowOptions): void;
    private getTargetGroupFromShowOptions;
    $registerSerializer(viewType: string, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $unregisterSerializer(viewType: string): void;
    private updateWebviewViewStates;
    private tryGetWebviewInput;
}
