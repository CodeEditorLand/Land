import { IExtensionHostDebugService } from '../../../../platform/debug/common/extensionHostDebug.js';
import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { ExtensionHostDebugChannelClient, ExtensionHostDebugBroadcastChannel } from '../../../../platform/debug/common/extensionHostDebugIpc.js';
registerMainProcessRemoteService(IExtensionHostDebugService, ExtensionHostDebugBroadcastChannel.ChannelName, { channelClientCtor: ExtensionHostDebugChannelClient });
