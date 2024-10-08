import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService, WorkbenchState, IWorkspace } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkspaceTagsService, Tags } from '../common/workspaceTags.js';
export declare class WorkspaceTagsService implements IWorkspaceTagsService {
    private readonly fileService;
    private readonly contextService;
    private readonly environmentService;
    private readonly textFileService;
    readonly _serviceBrand: undefined;
    private _tags;
    constructor(fileService: IFileService, contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, textFileService: ITextFileService);
    getTags(): Promise<Tags>;
    getTelemetryWorkspaceId(workspace: IWorkspace, state: WorkbenchState): Promise<string | undefined>;
    getHashedRemotesFromUri(workspaceUri: URI, stripEndingDotGit?: boolean): Promise<string[]>;
    private resolveWorkspaceTags;
    private processGradleDependencies;
    private tagJavaDependency;
    private searchArray;
}
