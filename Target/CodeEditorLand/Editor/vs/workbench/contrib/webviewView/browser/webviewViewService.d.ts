import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IViewBadge } from '../../../common/views.js';
import { IOverlayWebview } from '../../webview/browser/webview.js';
/**
 * A webview shown in a view pane.
 */
export interface WebviewView {
    /**
     * The text displayed in the view's title.
     */
    title?: string;
    /**
     * Additional text shown for this view.
     */
    description?: string;
    /**
     * The badge shown for this view.
     */
    badge?: IViewBadge;
    /**
     * The webview associated with this webview view.
     */
    readonly webview: IOverlayWebview;
    /**
     * Fired when the visibility of the webview view changes.
     *
     * This can happen when the view itself is hidden, when the view is collapsed, or when the user switches away from
     * the view.
     */
    readonly onDidChangeVisibility: Event<boolean>;
    /**
     * Fired when the webview view has been disposed of.
     */
    readonly onDispose: Event<void>;
    /**
     * Dispose of the webview view and clean up any associated resources.
     */
    dispose(): void;
    /**
     * Force the webview view to show.
     */
    show(preserveFocus: boolean): void;
}
/**
 * Fill in the contents of a newly created webview view.
 */
interface IWebviewViewResolver {
    /**
     * Fill in the contents of a webview view.
     */
    resolve(webviewView: WebviewView, cancellation: CancellationToken): Promise<void>;
}
export declare const IWebviewViewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWebviewViewService>;
export interface IWebviewViewService {
    readonly _serviceBrand: undefined;
    /**
     * Fired when a resolver has been registered
     */
    readonly onNewResolverRegistered: Event<{
        readonly viewType: string;
    }>;
    /**
     * Register a new {@link IWebviewViewResolver webview view resolver}.
     */
    register(viewType: string, resolver: IWebviewViewResolver): IDisposable;
    /**
     * Try to resolve a webview view. The promise will not resolve until a resolver for the webview has been registered
     * and run
     */
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
