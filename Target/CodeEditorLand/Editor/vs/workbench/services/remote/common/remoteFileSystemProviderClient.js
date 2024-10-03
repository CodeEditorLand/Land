import { getErrorMessage } from '../../../../base/common/errors.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { DiskFileSystemProviderClient } from '../../../../platform/files/common/diskFileSystemProviderClient.js';
export const REMOTE_FILE_SYSTEM_CHANNEL_NAME = 'remoteFilesystem';
export class RemoteFileSystemProviderClient extends DiskFileSystemProviderClient {
    static register(remoteAgentService, fileService, logService) {
        const connection = remoteAgentService.getConnection();
        if (!connection) {
            return Disposable.None;
        }
        const disposables = new DisposableStore();
        const environmentPromise = (async () => {
            try {
                const environment = await remoteAgentService.getRawEnvironment();
                if (environment) {
                    fileService.registerProvider(Schemas.vscodeRemote, disposables.add(new RemoteFileSystemProviderClient(environment, connection)));
                }
                else {
                    logService.error('Cannot register remote filesystem provider. Remote environment doesnot exist.');
                }
            }
            catch (error) {
                logService.error('Cannot register remote filesystem provider. Error while fetching remote environment.', getErrorMessage(error));
            }
        })();
        disposables.add(fileService.onWillActivateFileSystemProvider(e => {
            if (e.scheme === Schemas.vscodeRemote) {
                e.join(environmentPromise);
            }
        }));
        return disposables;
    }
    constructor(remoteAgentEnvironment, connection) {
        super(connection.getChannel(REMOTE_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: remoteAgentEnvironment.os === 3 });
    }
}
