import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IMarkerService } from '../../../../../../platform/markers/common/markers.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
import { IChatAgentService } from '../../../../chat/common/chatAgents.js';
export declare class CellDiagnostics extends Disposable implements INotebookEditorContribution {
    private readonly notebookEditor;
    private readonly notebookExecutionStateService;
    private readonly markerService;
    private readonly chatAgentService;
    private readonly configurationService;
    static ID: string;
    private enabled;
    private listening;
    private diagnosticsByHandle;
    constructor(notebookEditor: INotebookEditor, notebookExecutionStateService: INotebookExecutionStateService, markerService: IMarkerService, chatAgentService: IChatAgentService, configurationService: IConfigurationService);
    private updateEnabled;
    private handleChangeExecutionState;
    private clearAll;
    clear(cellHandle: number): void;
    private setDiagnostics;
    private createMarkerData;
    dispose(): void;
}
