import { createDecorator } from '../../instantiation/common/instantiation.js';
import { registerMainProcessRemoteService } from '../../ipc/electron-sandbox/services.js';
export const IExternalTerminalService = createDecorator('externalTerminal');
registerMainProcessRemoteService(IExternalTerminalService, 'externalTerminal');
