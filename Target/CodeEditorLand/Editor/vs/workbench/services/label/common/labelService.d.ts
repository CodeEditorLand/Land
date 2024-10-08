import { URI } from '../../../../base/common/uri.js';
import { IDisposable, Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IWorkspaceContextService, IWorkspace, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { ILabelService, ResourceLabelFormatter, ResourceLabelFormatting, IFormatterChangeEvent, Verbosity } from '../../../../platform/label/common/label.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IPathService } from '../../path/common/pathService.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class LabelService extends Disposable implements ILabelService {
    private readonly environmentService;
    private readonly contextService;
    private readonly pathService;
    private readonly remoteAgentService;
    readonly _serviceBrand: undefined;
    private formatters;
    private readonly _onDidChangeFormatters;
    readonly onDidChangeFormatters: import("../../../workbench.web.main.internal.js").Event<IFormatterChangeEvent>;
    private readonly storedFormattersMemento;
    private readonly storedFormatters;
    private os;
    private userHome;
    constructor(environmentService: IWorkbenchEnvironmentService, contextService: IWorkspaceContextService, pathService: IPathService, remoteAgentService: IRemoteAgentService, storageService: IStorageService, lifecycleService: ILifecycleService);
    private resolveRemoteEnvironment;
    findFormatting(resource: URI): ResourceLabelFormatting | undefined;
    getUriLabel(resource: URI, options?: {
        relative?: boolean;
        noPrefix?: boolean;
        separator?: '/' | '\\';
    }): string;
    private doGetUriLabel;
    getUriBasenameLabel(resource: URI): string;
    getWorkspaceLabel(workspace: IWorkspace | IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI, options?: {
        verbose: Verbosity;
    }): string;
    private doGetWorkspaceLabel;
    private doGetSingleFolderWorkspaceLabel;
    getSeparator(scheme: string, authority?: string): '/' | '\\';
    getHostLabel(scheme: string, authority?: string): string;
    getHostTooltip(scheme: string, authority?: string): string | undefined;
    registerCachedFormatter(formatter: ResourceLabelFormatter): IDisposable;
    registerFormatter(formatter: ResourceLabelFormatter): IDisposable;
    private formatUri;
    private appendWorkspaceSuffix;
}
