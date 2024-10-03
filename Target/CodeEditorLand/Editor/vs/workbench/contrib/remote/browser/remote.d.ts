import './media/remoteViewlet.css';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITimerService } from '../../../services/timer/browser/timerService.js';
export declare class RemoteMarkers implements IWorkbenchContribution {
    constructor(remoteAgentService: IRemoteAgentService, timerService: ITimerService);
}
export declare class RemoteAgentConnectionStatusListener extends Disposable implements IWorkbenchContribution {
    private _reloadWindowShown;
    constructor(remoteAgentService: IRemoteAgentService, progressService: IProgressService, dialogService: IDialogService, commandService: ICommandService, quickInputService: IQuickInputService, logService: ILogService, environmentService: IWorkbenchEnvironmentService, telemetryService: ITelemetryService);
}
