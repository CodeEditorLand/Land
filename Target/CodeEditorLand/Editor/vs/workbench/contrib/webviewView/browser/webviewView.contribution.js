import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWebviewViewService, WebviewViewService } from './webviewViewService.js';
registerSingleton(IWebviewViewService, WebviewViewService, 1);
