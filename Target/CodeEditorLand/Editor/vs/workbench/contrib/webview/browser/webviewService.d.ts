import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { WebviewThemeDataProvider } from './themeing.js';
import { IOverlayWebview, IWebview, IWebviewElement, IWebviewService, WebviewInitInfo } from './webview.js';
export declare class WebviewService extends Disposable implements IWebviewService {
    protected readonly _instantiationService: IInstantiationService;
    readonly _serviceBrand: undefined;
    protected readonly _webviewThemeDataProvider: WebviewThemeDataProvider;
    constructor(_instantiationService: IInstantiationService);
    private _activeWebview?;
    get activeWebview(): IWebview | undefined;
    private _updateActiveWebview;
    private _webviews;
    get webviews(): Iterable<IWebview>;
    private readonly _onDidChangeActiveWebview;
    readonly onDidChangeActiveWebview: import("../../../workbench.web.main.internal.js").Event<IWebview | undefined>;
    createWebviewElement(initInfo: WebviewInitInfo): IWebviewElement;
    createWebviewOverlay(initInfo: WebviewInitInfo): IOverlayWebview;
    protected registerNewWebview(webview: IWebview): void;
}
