import { Dimension } from '../../../../base/browser/dom.js';
import { IMouseWheelEvent } from '../../../../base/browser/mouseEvent.js';
import { CodeWindow } from '../../../../base/browser/window.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWebviewPortMapping } from '../../../../platform/webview/common/webviewPortMapping.js';
export declare const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE: RawContextKey<boolean>;
export declare const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED: RawContextKey<boolean>;
export declare const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED: RawContextKey<boolean>;
export declare const IWebviewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWebviewService>;
export interface IWebviewService {
    readonly _serviceBrand: undefined;
    readonly activeWebview: IWebview | undefined;
    readonly webviews: Iterable<IWebview>;
    readonly onDidChangeActiveWebview: Event<IWebview | undefined>;
    createWebviewElement(initInfo: WebviewInitInfo): IWebviewElement;
    createWebviewOverlay(initInfo: WebviewInitInfo): IOverlayWebview;
}
export interface WebviewInitInfo {
    readonly providedViewType?: string;
    readonly origin?: string;
    readonly title: string | undefined;
    readonly options: WebviewOptions;
    readonly contentOptions: WebviewContentOptions;
    readonly extension: WebviewExtensionDescription | undefined;
}
export declare const enum WebviewContentPurpose {
    NotebookRenderer = "notebookRenderer",
    CustomEditor = "customEditor",
    WebviewView = "webviewView"
}
export type WebviewStyles = {
    readonly [key: string]: string | number;
};
export interface WebviewOptions {
    readonly purpose?: WebviewContentPurpose;
    readonly customClasses?: string;
    readonly enableFindWidget?: boolean;
    readonly disableServiceWorker?: boolean;
    readonly tryRestoreScrollPosition?: boolean;
    readonly retainContextWhenHidden?: boolean;
    transformCssVariables?(styles: WebviewStyles): WebviewStyles;
}
export interface WebviewContentOptions {
    readonly allowMultipleAPIAcquire?: boolean;
    readonly allowScripts?: boolean;
    readonly allowForms?: boolean;
    readonly localResourceRoots?: readonly URI[];
    readonly portMapping?: readonly IWebviewPortMapping[];
    readonly enableCommandUris?: boolean | readonly string[];
}
export declare function areWebviewContentOptionsEqual(a: WebviewContentOptions, b: WebviewContentOptions): boolean;
export interface WebviewExtensionDescription {
    readonly location?: URI;
    readonly id: ExtensionIdentifier;
}
export interface WebviewMessageReceivedEvent {
    readonly message: any;
    readonly transfer?: readonly ArrayBuffer[];
}
export interface IWebview extends IDisposable {
    readonly providedViewType?: string;
    readonly origin: string;
    setHtml(html: string): void;
    setTitle(title: string): void;
    contentOptions: WebviewContentOptions;
    localResourcesRoot: readonly URI[];
    extension: WebviewExtensionDescription | undefined;
    initialScrollProgress: number;
    state: string | undefined;
    readonly isFocused: boolean;
    readonly onDidFocus: Event<void>;
    readonly onDidBlur: Event<void>;
    readonly onDidDispose: Event<void>;
    readonly onDidClickLink: Event<string>;
    readonly onDidScroll: Event<{
        readonly scrollYPercentage: number;
    }>;
    readonly onDidWheel: Event<IMouseWheelEvent>;
    readonly onDidUpdateState: Event<string | undefined>;
    readonly onDidReload: Event<void>;
    readonly onFatalError: Event<{
        readonly message: string;
    }>;
    readonly onMissingCsp: Event<ExtensionIdentifier>;
    readonly onMessage: Event<WebviewMessageReceivedEvent>;
    postMessage(message: any, transfer?: readonly ArrayBuffer[]): Promise<boolean>;
    focus(): void;
    reload(): void;
    showFind(animated?: boolean): void;
    hideFind(animated?: boolean): void;
    runFindAction(previous: boolean): void;
    selectAll(): void;
    copy(): void;
    paste(): void;
    cut(): void;
    undo(): void;
    redo(): void;
    windowDidDragStart(): void;
    windowDidDragEnd(): void;
    setContextKeyService(scopedContextKeyService: IContextKeyService): void;
}
export interface IWebviewElement extends IWebview {
    mountTo(parent: HTMLElement, targetWindow: CodeWindow): void;
}
export interface IOverlayWebview extends IWebview {
    readonly container: HTMLElement;
    origin: string;
    options: WebviewOptions;
    claim(claimant: any, targetWindow: CodeWindow, scopedContextKeyService: IContextKeyService | undefined): void;
    release(claimant: any): void;
    layoutWebviewOverElement(element: HTMLElement, dimension?: Dimension, clippingContainer?: HTMLElement): void;
}
export declare class WebviewOriginStore {
    private readonly _memento;
    private readonly _state;
    constructor(rootStorageKey: string, storageService: IStorageService);
    getOrigin(viewType: string, additionalKey: string | undefined): string;
    private _getKey;
}
export declare class ExtensionKeyedWebviewOriginStore {
    private readonly _store;
    constructor(rootStorageKey: string, storageService: IStorageService);
    getOrigin(viewType: string, extId: ExtensionIdentifier): string;
}
