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
export interface IWebviewWorkbenchService {
    readonly _serviceBrand: undefined;
    readonly iconManager: WebviewIconManager;
    readonly onDidChangeActiveWebviewEditor: Event<WebviewInput | undefined>;
    openWebview(webviewInitInfo: WebviewInitInfo, viewType: string, title: string, showOptions: IWebViewShowOptions): WebviewInput;
    openRevivedWebview(options: {
        webviewInitInfo: WebviewInitInfo;
        viewType: string;
        title: string;
        iconPath: WebviewIcons | undefined;
        state: any;
        group: number | undefined;
    }): WebviewInput;
    revealWebview(webview: WebviewInput, group: IEditorGroup | GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE, preserveFocus: boolean): void;
    registerResolver(resolver: WebviewResolver): IDisposable;
    shouldPersist(input: WebviewInput): boolean;
    resolveWebview(webview: WebviewInput, token: CancellationToken): Promise<void>;
}
interface WebviewResolver {
    canResolve(webview: WebviewInput): boolean;
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
