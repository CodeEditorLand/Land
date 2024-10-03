import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { DiskFileSystemProviderClient } from '../../../../platform/files/common/diskFileSystemProviderClient.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRemoteAgentService } from './remoteAgentService.js';
export declare const REMOTE_FILE_SYSTEM_CHANNEL_NAME = "remoteFilesystem";
export declare class RemoteFileSystemProviderClient extends DiskFileSystemProviderClient {
    static register(remoteAgentService: IRemoteAgentService, fileService: IFileService, logService: ILogService): IDisposable;
    private constructor();
}
