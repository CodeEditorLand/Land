import { CodeWindow } from '../../../../base/browser/window.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWebview } from './webview.js';
export declare class WebviewWindowDragMonitor extends Disposable {
    constructor(targetWindow: CodeWindow, getWebview: () => IWebview | undefined);
}
