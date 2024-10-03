import { Action } from '../../../../base/common/actions.js';
import * as nls from '../../../../nls.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
export declare class OpenLogsFolderAction extends Action {
    private readonly environmentService;
    private readonly nativeHostService;
    static readonly ID = "workbench.action.openLogsFolder";
    static readonly TITLE: nls.ILocalizedString;
    constructor(id: string, label: string, environmentService: INativeWorkbenchEnvironmentService, nativeHostService: INativeHostService);
    run(): Promise<void>;
}
export declare class OpenExtensionLogsFolderAction extends Action {
    private readonly environmentSerice;
    private readonly fileService;
    private readonly nativeHostService;
    static readonly ID = "workbench.action.openExtensionLogsFolder";
    static readonly TITLE: nls.ILocalizedString;
    constructor(id: string, label: string, environmentSerice: INativeWorkbenchEnvironmentService, fileService: IFileService, nativeHostService: INativeHostService);
    run(): Promise<void>;
}
