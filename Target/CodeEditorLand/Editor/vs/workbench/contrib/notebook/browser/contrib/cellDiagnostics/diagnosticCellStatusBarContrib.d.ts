import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
export declare class DiagnosticCellStatusBarContrib extends Disposable implements INotebookEditorContribution {
    static id: string;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
}
