import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IDebugService } from './debug.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
export declare class DebugLifecycle implements IWorkbenchContribution {
    private readonly debugService;
    private readonly configurationService;
    private readonly dialogService;
    private disposable;
    constructor(lifecycleService: ILifecycleService, debugService: IDebugService, configurationService: IConfigurationService, dialogService: IDialogService);
    private shouldVetoShutdown;
    dispose(): void;
    private showWindowCloseConfirmation;
}
