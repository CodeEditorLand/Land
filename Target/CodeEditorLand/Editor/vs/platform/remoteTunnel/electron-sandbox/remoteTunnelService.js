import { registerSharedProcessRemoteService } from '../../ipc/electron-sandbox/services.js';
import { IRemoteTunnelService } from '../common/remoteTunnel.js';
registerSharedProcessRemoteService(IRemoteTunnelService, 'remoteTunnel');
