import '../../../../base/browser/ui/codicons/codiconStyles.js';
import './media/issueReporter.css';
import { OldIssueReporterWindowConfiguration } from '../../../../platform/issue/common/issue.js';
export interface IIssueReporterMain {
    startup(configuration: OldIssueReporterWindowConfiguration): void;
}
export declare function startup(configuration: OldIssueReporterWindowConfiguration): void;
