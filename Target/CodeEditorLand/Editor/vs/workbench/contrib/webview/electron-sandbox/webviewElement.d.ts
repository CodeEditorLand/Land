import { VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ITunnelService } from '../../../../platform/tunnel/common/tunnel.js';
import { WebviewThemeDataProvider } from '../browser/themeing.js';
import { WebviewInitInfo } from '../browser/webview.js';
import { WebviewElement } from '../browser/webviewElement.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
/**
 * Webview backed by an iframe but that uses Electron APIs to power the webview.
 */
export declare class ElectronWebviewElement extends WebviewElement {
    private readonly _nativeHostService;
    private readonly _webviewKeyboardHandler;
    private _findStarted;
    private _cachedHtmlContent;
    private readonly _webviewMainService;
    private readonly _iframeDelayer;
    protected get platform(): string;
    constructor(initInfo: WebviewInitInfo, webviewThemeDataProvider: WebviewThemeDataProvider, contextMenuService: IContextMenuService, tunnelService: ITunnelService, fileService: IFileService, telemetryService: ITelemetryService, environmentService: IWorkbenchEnvironmentService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, logService: ILogService, configurationService: IConfigurationService, mainProcessService: IMainProcessService, notificationService: INotificationService, _nativeHostService: INativeHostService, instantiationService: IInstantiationService, accessibilityService: IAccessibilityService);
    dispose(): void;
    protected webviewContentEndpoint(iframeId: string): string;
    protected streamToBuffer(stream: VSBufferReadableStream): Promise<ArrayBufferLike>;
    /**
     * Webviews expose a stateful find API.
     * Successive calls to find will move forward or backward through onFindResults
     * depending on the supplied options.
     *
     * @param value The string to search for. Empty strings are ignored.
     */
    find(value: string, previous: boolean): void;
    updateFind(value: string): void;
    stopFind(keepSelection?: boolean): void;
    protected handleFocusChange(isFocused: boolean): void;
}
