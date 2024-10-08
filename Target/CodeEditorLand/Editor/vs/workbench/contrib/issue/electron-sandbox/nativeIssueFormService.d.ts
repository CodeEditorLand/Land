import './media/newIssueReporter.css';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IssueFormService } from '../browser/issueFormService.js';
import { IIssueFormService, IssueReporterData } from '../common/issue.js';
import { IAuxiliaryWindowService } from '../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js';
import { IHostService } from '../../../services/host/browser/host.js';
export declare class NativeIssueFormService extends IssueFormService implements IIssueFormService {
    private readonly nativeHostService;
    private readonly environmentService;
    constructor(instantiationService: IInstantiationService, auxiliaryWindowService: IAuxiliaryWindowService, logService: ILogService, dialogService: IDialogService, menuService: IMenuService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, environmentService: INativeEnvironmentService);
    openReporter(data: IssueReporterData): Promise<void>;
}
