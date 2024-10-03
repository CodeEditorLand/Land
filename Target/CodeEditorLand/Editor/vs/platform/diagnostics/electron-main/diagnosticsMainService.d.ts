import { IMainProcessDiagnostics, IRemoteDiagnosticError, IRemoteDiagnosticInfo } from '../common/diagnostics.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { IWorkspacesManagementMainService } from '../../workspaces/electron-main/workspacesManagementMainService.js';
import { ILogService } from '../../log/common/log.js';
export declare const ID = "diagnosticsMainService";
export declare const IDiagnosticsMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDiagnosticsMainService>;
export interface IRemoteDiagnosticOptions {
    includeProcesses?: boolean;
    includeWorkspaceMetadata?: boolean;
}
export interface IDiagnosticsMainService {
    readonly _serviceBrand: undefined;
    getRemoteDiagnostics(options: IRemoteDiagnosticOptions): Promise<(IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]>;
    getMainDiagnostics(): Promise<IMainProcessDiagnostics>;
}
export declare class DiagnosticsMainService implements IDiagnosticsMainService {
    private readonly windowsMainService;
    private readonly workspacesManagementMainService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    constructor(windowsMainService: IWindowsMainService, workspacesManagementMainService: IWorkspacesManagementMainService, logService: ILogService);
    getRemoteDiagnostics(options: IRemoteDiagnosticOptions): Promise<(IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]>;
    getMainDiagnostics(): Promise<IMainProcessDiagnostics>;
    private codeWindowToInfo;
    private browserWindowToInfo;
    private getFolderURIs;
}
