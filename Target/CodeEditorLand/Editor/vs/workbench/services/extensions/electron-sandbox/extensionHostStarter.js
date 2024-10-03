import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { IExtensionHostStarter, ipcExtensionHostStarterChannelName } from '../../../../platform/extensions/common/extensionHostStarter.js';
registerMainProcessRemoteService(IExtensionHostStarter, ipcExtensionHostStarterChannelName);
