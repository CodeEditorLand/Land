import './media/issueReporter.css';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ExtensionIdentifierSet } from '../../../../platform/extensions/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRectangle } from '../../../../platform/window/common/window.js';
import { IIssueFormService, IssueReporterData } from '../common/issue.js';
import { IAuxiliaryWindowService } from '../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js';
import { IHostService } from '../../../services/host/browser/host.js';
export interface IssuePassData {
    issueTitle: string;
    issueBody: string;
}
export declare class IssueFormService implements IIssueFormService {
    protected readonly instantiationService: IInstantiationService;
    protected readonly auxiliaryWindowService: IAuxiliaryWindowService;
    protected readonly menuService: IMenuService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly logService: ILogService;
    protected readonly dialogService: IDialogService;
    protected readonly hostService: IHostService;
    readonly _serviceBrand: undefined;
    protected currentData: IssueReporterData | undefined;
    protected issueReporterWindow: Window | null;
    protected extensionIdentifierSet: ExtensionIdentifierSet;
    protected arch: string;
    protected release: string;
    protected type: string;
    constructor(instantiationService: IInstantiationService, auxiliaryWindowService: IAuxiliaryWindowService, menuService: IMenuService, contextKeyService: IContextKeyService, logService: ILogService, dialogService: IDialogService, hostService: IHostService);
    openReporter(data: IssueReporterData): Promise<void>;
    openAuxIssueReporter(data: IssueReporterData, bounds?: IRectangle): Promise<void>;
    sendReporterMenu(extensionId: string): Promise<IssueReporterData | undefined>;
    closeReporter(): Promise<void>;
    reloadWithExtensionsDisabled(): Promise<void>;
    showConfirmCloseDialog(): Promise<void>;
    showClipboardDialog(): Promise<boolean>;
    hasToReload(data: IssueReporterData): boolean;
}
