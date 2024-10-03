import { IMenubarService } from '../../../../platform/menubar/electron-sandbox/menubar.js';
import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-sandbox/services.js';
registerMainProcessRemoteService(IMenubarService, 'menubar');
