import * as nls from '../../../../nls.js';
import { Action } from '../../../../base/common/actions.js';
import { ILoggerService } from '../../../../platform/log/common/log.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IOutputChannelDescriptor, IOutputService } from '../../../services/output/common/output.js';
import { IDefaultLogLevelsService } from './defaultLogLevels.js';
export declare class SetLogLevelAction extends Action {
    private readonly quickInputService;
    private readonly loggerService;
    private readonly outputService;
    private readonly defaultLogLevelsService;
    static readonly ID = "workbench.action.setLogLevel";
    static readonly TITLE: nls.ILocalizedString;
    constructor(id: string, label: string, quickInputService: IQuickInputService, loggerService: ILoggerService, outputService: IOutputService, defaultLogLevelsService: IDefaultLogLevelsService);
    run(): Promise<void>;
    private selectLogLevelOrChannel;
    static isLevelSettable(channel: IOutputChannelDescriptor): boolean;
    private setLogLevelForChannel;
    private getLogLevelEntries;
    private getLabel;
    private getDescription;
}
export declare class OpenWindowSessionLogFileAction extends Action {
    private readonly environmentService;
    private readonly fileService;
    private readonly quickInputService;
    private readonly editorService;
    static readonly ID = "workbench.action.openSessionLogFile";
    static readonly TITLE: nls.ILocalizedString;
    constructor(id: string, label: string, environmentService: IWorkbenchEnvironmentService, fileService: IFileService, quickInputService: IQuickInputService, editorService: IEditorService);
    run(): Promise<void>;
    private getSessions;
    private getLogFiles;
}
