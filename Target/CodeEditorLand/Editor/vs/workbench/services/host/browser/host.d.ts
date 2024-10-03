import { Event } from '../../../../base/common/event.js';
import { IWindowOpenable, IOpenWindowOptions, IOpenEmptyWindowOptions, IPoint, IRectangle } from '../../../../platform/window/common/window.js';
export declare const IHostService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IHostService>;
export interface IHostService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeFocus: Event<boolean>;
    readonly hasFocus: boolean;
    hadLastFocus(): Promise<boolean>;
    focus(targetWindow: Window, options?: {
        force: boolean;
    }): Promise<void>;
    readonly onDidChangeActiveWindow: Event<number>;
    readonly onDidChangeFullScreen: Event<{
        windowId: number;
        fullscreen: boolean;
    }>;
    openWindow(options?: IOpenEmptyWindowOptions): Promise<void>;
    openWindow(toOpen: IWindowOpenable[], options?: IOpenWindowOptions): Promise<void>;
    toggleFullScreen(targetWindow: Window): Promise<void>;
    moveTop(targetWindow: Window): Promise<void>;
    getCursorScreenPoint(): Promise<{
        readonly point: IPoint;
        readonly display: IRectangle;
    } | undefined>;
    restart(): Promise<void>;
    reload(options?: {
        disableExtensions?: boolean;
    }): Promise<void>;
    close(): Promise<void>;
    withExpectedShutdown<T>(expectedShutdownTask: () => Promise<T>): Promise<T>;
    getPathForFile(file: File): string | undefined;
}
