import { registerSharedProcessRemoteService } from '../../ipc/electron-sandbox/services.js';
import { ICustomEndpointTelemetryService } from '../common/telemetry.js';
registerSharedProcessRemoteService(ICustomEndpointTelemetryService, 'customEndpointTelemetry');
