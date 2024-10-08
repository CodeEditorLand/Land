import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ICellViewModel } from '../notebookBrowser.js';
import { INotebookExecutionStateService } from '../../common/notebookExecutionStateService.js';
import { Event } from '../../../../../base/common/event.js';
import { ScrollEvent } from '../../../../../base/common/scrollable.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IListView } from '../../../../../base/browser/ui/list/listView.js';
import { CellViewModel } from '../viewModel/notebookViewModelImpl.js';
export declare class NotebookCellAnchor implements IDisposable {
    private readonly notebookExecutionStateService;
    private readonly configurationService;
    private readonly scrollEvent;
    private stopAnchoring;
    private executionWatcher;
    private scrollWatcher;
    constructor(notebookExecutionStateService: INotebookExecutionStateService, configurationService: IConfigurationService, scrollEvent: Event<ScrollEvent>);
    shouldAnchor(cellListView: IListView<CellViewModel>, focusedIndex: number, heightDelta: number, executingCellUri: ICellViewModel): boolean;
    watchAchorDuringExecution(executingCell: ICellViewModel): void;
    dispose(): void;
}
