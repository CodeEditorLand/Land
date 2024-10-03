import { IDiagnosticsService } from '../common/diagnostics.js';
import { registerSharedProcessRemoteService } from '../../ipc/electron-sandbox/services.js';
registerSharedProcessRemoteService(IDiagnosticsService, 'diagnostics');
