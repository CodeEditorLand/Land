import { IProductConfiguration } from '../../../../base/common/product.js';
import { IProcessMainService } from '../../../../platform/issue/common/issue.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { BaseIssueReporterService } from '../browser/baseIssueReporterService.js';
import { IIssueFormService, IssueReporterData } from '../common/issue.js';
export declare class IssueReporter2 extends BaseIssueReporterService {
    private readonly nativeHostService;
    private readonly processMainService;
    constructor(disableExtensions: boolean, data: IssueReporterData, os: {
        type: string;
        arch: string;
        release: string;
    }, product: IProductConfiguration, window: Window, nativeHostService: INativeHostService, issueFormService: IIssueFormService, processMainService: IProcessMainService, themeService: IThemeService);
    setEventHandlers(): void;
    submitToGitHub(issueTitle: string, issueBody: string, gitHubDetails: {
        owner: string;
        repositoryName: string;
    }): Promise<boolean>;
    createIssue(): Promise<boolean>;
    writeToClipboard(baseUrl: string, issueBody: string): Promise<string>;
    private updateSystemInfo;
    private updateRestrictedMode;
    private updateUnsupportedMode;
    private updateExperimentsInfo;
}
