import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { Range } from '../../../../editor/common/core/range.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITestCoverageService } from '../common/testCoverageService.js';
import { CoverageDetails, DetailType, IStatementCoverage } from '../common/testTypes.js';
export declare class CodeCoverageDecorations extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly coverage;
    private readonly log;
    private loadingCancellation?;
    private readonly displayedStore;
    private readonly hoveredStore;
    private readonly summaryWidget;
    private decorationIds;
    private hoveredSubject?;
    private details?;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, coverage: ITestCoverageService, configurationService: IConfigurationService, log: ILogService);
    private updateEditorStyles;
    private hoverInlineDecoration;
    private hoverLineNumber;
    private apply;
    private clear;
    private loadDetails;
}
type CoverageDetailsWithBranch = CoverageDetails | {
    type: DetailType.Branch;
    branch: number;
    detail: IStatementCoverage;
};
type DetailRange = {
    range: Range;
    primary: boolean;
    metadata: {
        detail: CoverageDetailsWithBranch;
        description: IMarkdownString | undefined;
    };
};
export declare class CoverageDetailsModel {
    readonly details: CoverageDetails[];
    readonly ranges: DetailRange[];
    constructor(details: CoverageDetails[], textModel: ITextModel);
    /** Gets the markdown description for the given detail */
    describe(detail: CoverageDetailsWithBranch, model: ITextModel): IMarkdownString | undefined;
}
export {};
