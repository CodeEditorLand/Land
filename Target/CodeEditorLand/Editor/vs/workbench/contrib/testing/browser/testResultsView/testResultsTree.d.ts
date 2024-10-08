import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IProgressService } from '../../../../../platform/progress/common/progress.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { InspectSubject } from './testResultsSubject.js';
import { ITestCoverageService } from '../../common/testCoverageService.js';
import { ITestExplorerFilterState } from '../../common/testExplorerFilterState.js';
import { ITestResultService } from '../../common/testResultService.js';
export declare class OutputPeekTree extends Disposable {
    private readonly contextMenuService;
    private disposed;
    private readonly tree;
    private readonly treeActions;
    private readonly requestReveal;
    readonly onDidRequestReview: Event<InspectSubject>;
    constructor(container: HTMLElement, onDidReveal: Event<{
        subject: InspectSubject;
        preserveFocus: boolean;
    }>, options: {
        showRevealLocationOnMessages: boolean;
        locationForProgress: string;
    }, contextMenuService: IContextMenuService, results: ITestResultService, instantiationService: IInstantiationService, explorerFilter: ITestExplorerFilterState, coverageService: ITestCoverageService, progressService: IProgressService, telemetryService: ITelemetryService);
    layout(height: number, width: number): void;
    private onContextMenu;
    dispose(): void;
}
