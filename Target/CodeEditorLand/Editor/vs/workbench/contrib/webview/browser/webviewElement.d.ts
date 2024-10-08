import { IMouseWheelEvent } from '../../../../base/browser/mouseEvent.js';
import { VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ITunnelService } from '../../../../platform/tunnel/common/tunnel.js';
import { WebviewThemeDataProvider } from './themeing.js';
import { IWebview, WebviewContentOptions, WebviewExtensionDescription, WebviewInitInfo, WebviewMessageReceivedEvent } from './webview.js';
import { WebviewFindDelegate, WebviewFindWidget } from './webviewFindWidget.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { CodeWindow } from '../../../../base/browser/window.js';
export declare class WebviewElement extends Disposable implements IWebview, WebviewFindDelegate {
    protected readonly webviewThemeDataProvider: WebviewThemeDataProvider;
    private readonly _environmentService;
    private readonly _fileService;
    private readonly _logService;
    private readonly _remoteAuthorityResolverService;
    private readonly _telemetryService;
    private readonly _tunnelService;
    private readonly _accessibilityService;
    protected readonly id: string;
    /**
     * The provided identifier of this webview.
     */
    readonly providedViewType?: string;
    /**
     * The origin this webview itself is loaded from. May not be unique
     */
    readonly origin: string;
    private _windowId;
    private get window();
    private _encodedWebviewOriginPromise?;
    private _encodedWebviewOrigin;
    protected get platform(): string;
    private readonly _expectedServiceWorkerVersion;
    private _element;
    protected get element(): HTMLIFrameElement | undefined;
    private _focused;
    get isFocused(): boolean;
    private _state;
    private _content;
    private readonly _portMappingManager;
    private readonly _resourceLoadingCts;
    private _contextKeyService;
    private _confirmBeforeClose;
    private readonly _focusDelayer;
    private readonly _onDidHtmlChange;
    protected readonly onDidHtmlChange: Event<string>;
    private _messagePort?;
    private readonly _messageHandlers;
    protected readonly _webviewFindWidget: WebviewFindWidget | undefined;
    readonly checkImeCompletionState = true;
    private _disposed;
    extension: WebviewExtensionDescription | undefined;
    private readonly _options;
    constructor(initInfo: WebviewInitInfo, webviewThemeDataProvider: WebviewThemeDataProvider, configurationService: IConfigurationService, contextMenuService: IContextMenuService, notificationService: INotificationService, _environmentService: IWorkbenchEnvironmentService, _fileService: IFileService, _logService: ILogService, _remoteAuthorityResolverService: IRemoteAuthorityResolverService, _telemetryService: ITelemetryService, _tunnelService: ITunnelService, instantiationService: IInstantiationService, _accessibilityService: IAccessibilityService);
    dispose(): void;
    setContextKeyService(contextKeyService: IContextKeyService): void;
    private readonly _onMissingCsp;
    readonly onMissingCsp: Event<ExtensionIdentifier>;
    private readonly _onDidClickLink;
    readonly onDidClickLink: Event<string>;
    private readonly _onDidReload;
    readonly onDidReload: Event<void>;
    private readonly _onMessage;
    readonly onMessage: Event<WebviewMessageReceivedEvent>;
    private readonly _onDidScroll;
    readonly onDidScroll: Event<{
        readonly scrollYPercentage: number;
    }>;
    private readonly _onDidWheel;
    readonly onDidWheel: Event<IMouseWheelEvent>;
    private readonly _onDidUpdateState;
    readonly onDidUpdateState: Event<string | undefined>;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<void>;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<void>;
    private readonly _onFatalError;
    readonly onFatalError: Event<{
        readonly message: string;
    }>;
    private readonly _onDidDispose;
    readonly onDidDispose: Event<void>;
    postMessage(message: any, transfer?: ArrayBuffer[]): Promise<boolean>;
    private _send;
    private _createElement;
    private _initElement;
    mountTo(element: HTMLElement, targetWindow: CodeWindow): void;
    private _registerMessageHandler;
    private _startBlockingIframeDragEvents;
    private _stopBlockingIframeDragEvents;
    protected webviewContentEndpoint(encodedWebviewOrigin: string): string;
    private _webviewContentOrigin;
    private doPostMessage;
    private on;
    private _hasAlertedAboutMissingCsp;
    private handleNoCspFound;
    reload(): void;
    setHtml(html: string): void;
    setTitle(title: string): void;
    set contentOptions(options: WebviewContentOptions);
    set localResourcesRoot(resources: readonly URI[]);
    set state(state: string | undefined);
    set initialScrollProgress(value: number);
    private doUpdateContent;
    protected style(): void;
    protected handleFocusChange(isFocused: boolean): void;
    private handleKeyEvent;
    private handleDragEvent;
    windowDidDragStart(): void;
    windowDidDragEnd(): void;
    selectAll(): void;
    copy(): void;
    paste(): void;
    cut(): void;
    undo(): void;
    redo(): void;
    private execCommand;
    private loadResource;
    protected streamToBuffer(stream: VSBufferReadableStream): Promise<ArrayBufferLike>;
    private localLocalhost;
    focus(): void;
    private _doFocus;
    protected readonly _hasFindResult: Emitter<boolean>;
    readonly hasFindResult: Event<boolean>;
    protected readonly _onDidStopFind: Emitter<void>;
    readonly onDidStopFind: Event<void>;
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
    showFind(animated?: boolean): void;
    hideFind(animated?: boolean): void;
    runFindAction(previous: boolean): void;
}
