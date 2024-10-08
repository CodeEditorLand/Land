import { IWebviewElement, WebviewInitInfo } from '../browser/webview.js';
import { WebviewService } from '../browser/webviewService.js';
export declare class ElectronWebviewService extends WebviewService {
    createWebviewElement(initInfo: WebviewInitInfo): IWebviewElement;
}
