import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { GroupIdentifier } from '../../../common/editor.js';
import { IOverlayWebview, IWebviewService, WebviewInitInfo } from '../../webview/browser/webview.js';
import { WebviewIconManager, WebviewIcons } from './webviewIconManager.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { ACTIVE_GROUP_TYPE, IEditorService, SIDE_GROUP_TYPE } from '../../../services/editor/common/editorService.js';
import { WebviewInput, WebviewInputInitInfo } from './webviewEditorInput.js';
export interface IWebViewShowOptions {
    readonly group?: IEditorGroup | GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE;
    readonly preserveFocus?: boolean;
}
export declare const IWebviewWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWebviewWorkbenchService>;
/**
 * Service responsible for showing and managing webview editors in the workbench.
 */
export interface IWebviewWorkbenchService {
    readonly _serviceBrand: undefined;
    /**
     * Manages setting the icons show for a given webview.
     */
    readonly iconManager: WebviewIconManager;
    /**
     * Event fired when focus switches to a different webview editor.
     *
     * Fires `undefined` if focus switches to a non-webview editor.
     */
    readonly onDidChangeActiveWebviewEditor: Event<WebviewInput | undefined>;
    /**
     * Create a new webview editor and open it in the workbench.
     */
    openWebview(webviewInitInfo: WebviewInitInfo, viewType: string, title: string, showOptions: IWebViewShowOptions): WebviewInput;
    /**
     * Open a webview that is being restored from serialization.
     */
    openRevivedWebview(options: {
        webviewInitInfo: WebviewInitInfo;
        viewType: string;
        title: string;
        iconPath: WebviewIcons | undefined;
        state: any;
        group: number | undefined;
    }): WebviewInput;
    /**
     * Reveal an already opened webview editor in the workbench.
     */
    revealWebview(webview: WebviewInput, group: IEditorGroup | GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE, preserveFocus: boolean): void;
    /**
     * Register a new {@link WebviewResolver}.
     *
     * If there are any webviews awaiting revival that this resolver can handle, they will be resolved by it.
     */
    registerResolver(resolver: WebviewResolver): IDisposable;
    /**
     * Check if a webview should be serialized across window reloads.
     */
    shouldPersist(input: WebviewInput): boolean;
    /**
     * Try to resolve a webview. This will block until a resolver is registered for the webview.
     */
    resolveWebview(webview: WebviewInput, token: CancellationToken): Promise<void>;
}
/**
 * Handles filling in the content of webview before it can be shown to the user.
 */
interface WebviewResolver {
    /**
     * Returns true if the resolver can resolve the given webview.
     */
    canResolve(webview: WebviewInput): boolean;
    /**
     * Resolves the webview.
     */
    resolveWebview(webview: WebviewInput, token: CancellationToken): Promise<void>;
}
export declare class LazilyResolvedWebviewEditorInput extends WebviewInput {
    private readonly _webviewWorkbenchService;
    private _resolved;
    private _resolvePromise?;
    constructor(init: WebviewInputInitInfo, webview: IOverlayWebview, _webviewWorkbenchService: IWebviewWorkbenchService);
    dispose(): void;
    resolve(): Promise<IDisposable | null>;
    protected transfer(other: LazilyResolvedWebviewEditorInput): WebviewInput | undefined;
}
export declare class WebviewEditorService extends Disposable implements IWebviewWorkbenchService {
    private readonly _editorService;
    private readonly _instantiationService;
    private readonly _webviewService;
    readonly _serviceBrand: undefined;
    private readonly _revivers;
    private readonly _revivalPool;
    private readonly _iconManager;
    constructor(editorGroupsService: IEditorGroupsService, _editorService: IEditorService, _instantiationService: IInstantiationService, _webviewService: IWebviewService);
    get iconManager(): WebviewIconManager;
    private _activeWebview;
    private readonly _onDidChangeActiveWebviewEditor;
    readonly onDidChangeActiveWebviewEditor: Event<WebviewInput | undefined>;
    private getWebviewId;
    private updateActiveWebview;
    openWebview(webviewInitInfo: WebviewInitInfo, viewType: string, title: string, showOptions: IWebViewShowOptions): WebviewInput;
    revealWebview(webview: WebviewInput, group: IEditorGroup | GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE, preserveFocus: boolean): void;
    private findTopLevelEditorForWebview;
    openRevivedWebview(options: {
        webviewInitInfo: WebviewInitInfo;
        viewType: string;
        title: string;
        iconPath: WebviewIcons | undefined;
        state: any;
        group: number | undefined;
    }): WebviewInput;
    registerResolver(reviver: WebviewResolver): IDisposable;
    shouldPersist(webview: WebviewInput): boolean;
    private tryRevive;
    resolveWebview(webview: WebviewInput, token: CancellationToken): Promise<void>;
    setIcons(id: string, iconPath: WebviewIcons | undefined): void;
}
export {};
