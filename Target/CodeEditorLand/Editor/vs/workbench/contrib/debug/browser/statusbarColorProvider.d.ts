import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IDebugService, State, IDebugSession } from '../common/debug.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
export declare const STATUS_BAR_DEBUGGING_BACKGROUND: string;
export declare const STATUS_BAR_DEBUGGING_FOREGROUND: string;
export declare const STATUS_BAR_DEBUGGING_BORDER: string;
export declare const COMMAND_CENTER_DEBUGGING_BACKGROUND: string;
export declare class StatusBarColorProvider implements IWorkbenchContribution {
    private readonly debugService;
    private readonly contextService;
    private readonly statusbarService;
    private readonly layoutService;
    private readonly configurationService;
    private readonly disposables;
    private disposable;
    private set enabled(value);
    constructor(debugService: IDebugService, contextService: IWorkspaceContextService, statusbarService: IStatusbarService, layoutService: ILayoutService, configurationService: IConfigurationService);
    protected update(): void;
    dispose(): void;
}
export declare function isStatusbarInDebugMode(state: State, sessions: IDebugSession[]): boolean;
