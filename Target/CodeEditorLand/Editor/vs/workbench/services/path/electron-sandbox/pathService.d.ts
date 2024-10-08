import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { AbstractPathService } from '../common/pathService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
export declare class NativePathService extends AbstractPathService {
    constructor(remoteAgentService: IRemoteAgentService, environmentService: INativeWorkbenchEnvironmentService, contextService: IWorkspaceContextService);
}
