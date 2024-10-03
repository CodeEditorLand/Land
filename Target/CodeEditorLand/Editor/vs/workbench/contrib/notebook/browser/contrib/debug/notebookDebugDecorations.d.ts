import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IDebugService } from '../../../../debug/common/debug.js';
import { INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
export declare class PausedCellDecorationContribution extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _debugService;
    private readonly _notebookExecutionStateService;
    static id: string;
    private _currentTopDecorations;
    private _currentOtherDecorations;
    private _executingCellDecorations;
    constructor(_notebookEditor: INotebookEditor, _debugService: IDebugService, _notebookExecutionStateService: INotebookExecutionStateService);
    private updateExecutionDecorations;
    private setTopFrameDecoration;
    private setFocusedFrameDecoration;
    private setExecutingCellDecorations;
}
export declare class NotebookBreakpointDecorations extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _debugService;
    private readonly _configService;
    static id: string;
    private _currentDecorations;
    constructor(_notebookEditor: INotebookEditor, _debugService: IDebugService, _configService: IConfigurationService);
    private updateDecorations;
}
