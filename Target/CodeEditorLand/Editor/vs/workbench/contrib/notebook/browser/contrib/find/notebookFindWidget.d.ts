import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ICellViewModel, INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
import { INotebookFindScope } from '../../../common/notebookCommon.js';
export interface IShowNotebookFindWidgetOptions {
    isRegex?: boolean;
    wholeWord?: boolean;
    matchCase?: boolean;
    matchIndex?: number;
    focus?: boolean;
    searchStringSeededFrom?: {
        cell: ICellViewModel;
        range: Range;
    };
    findScope?: INotebookFindScope;
}
export declare class NotebookFindContrib extends Disposable implements INotebookEditorContribution {
    private readonly notebookEditor;
    private readonly instantiationService;
    static readonly id: string;
    private readonly widget;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
    show(initialInput?: string, options?: IShowNotebookFindWidgetOptions): Promise<void>;
    hide(): void;
    replace(searchString: string | undefined): void;
}
