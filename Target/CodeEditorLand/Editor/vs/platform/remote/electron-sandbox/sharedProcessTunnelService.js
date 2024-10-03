import { registerSharedProcessRemoteService } from '../../ipc/electron-sandbox/services.js';
import { ISharedProcessTunnelService, ipcSharedProcessTunnelChannelName } from '../common/sharedProcessTunnelService.js';
registerSharedProcessRemoteService(ISharedProcessTunnelService, ipcSharedProcessTunnelChannelName);
