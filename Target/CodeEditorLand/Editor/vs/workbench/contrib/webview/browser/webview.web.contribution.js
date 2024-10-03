import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWebviewService } from './webview.js';
import { WebviewService } from './webviewService.js';
registerSingleton(IWebviewService, WebviewService, 1);
