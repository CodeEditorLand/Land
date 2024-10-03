import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IViewBadge } from '../../../common/views.js';
import { IOverlayWebview } from '../../webview/browser/webview.js';
export interface WebviewView {
    title?: string;
    description?: string;
    badge?: IViewBadge;
    readonly webview: IOverlayWebview;
    readonly onDidChangeVisibility: Event<boolean>;
    readonly onDispose: Event<void>;
    dispose(): void;
    show(preserveFocus: boolean): void;
}
interface IWebviewViewResolver {
    resolve(webviewView: WebviewView, cancellation: CancellationToken): Promise<void>;
}
export declare const IWebviewViewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWebviewViewService>;
export interface IWebviewViewService {
    readonly _serviceBrand: undefined;
    readonly onNewResolverRegistered: Event<{
        readonly viewType: string;
    }>;
    register(viewType: string, resolver: IWebviewViewResolver): IDisposable;
    resolve(viewType: string, webview: WebviewView, cancellation: CancellationToken): Promise<void>;
}
export declare class WebviewViewService extends Disposable implements IWebviewViewService {
    readonly _serviceBrand: undefined;
    private readonly _resolvers;
    private readonly _awaitingRevival;
    private readonly _onNewResolverRegistered;
    readonly onNewResolverRegistered: Event<{
        readonly viewType: string;
    }>;
    register(viewType: string, resolver: IWebviewViewResolver): IDisposable;
    resolve(viewType: string, webview: WebviewView, cancellation: CancellationToken): Promise<void>;
}
export {};
