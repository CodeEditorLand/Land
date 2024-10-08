import { CodeWindow } from '../../../../base/browser/window.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWebview } from './webview.js';
/**
 * Allows webviews to monitor when an element in the VS Code editor is being dragged/dropped.
 *
 * This is required since webview end up eating the drag event. VS Code needs to see this
 * event so it can handle editor element drag drop.
 */
export declare class WebviewWindowDragMonitor extends Disposable {
    constructor(targetWindow: CodeWindow, getWebview: () => IWebview | undefined);
}
