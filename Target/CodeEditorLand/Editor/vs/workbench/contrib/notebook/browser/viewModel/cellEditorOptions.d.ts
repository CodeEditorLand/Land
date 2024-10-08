import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IEditorOptions } from '../../../../../editor/common/config/editorOptions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IBaseCellEditorOptions, INotebookEditorDelegate } from '../notebookBrowser.js';
import { NotebookOptions } from '../notebookOptions.js';
export declare class BaseCellEditorOptions extends Disposable implements IBaseCellEditorOptions {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly notebookOptions: NotebookOptions;
    readonly configurationService: IConfigurationService;
    readonly language: string;
    private static fixedEditorOptions;
    private readonly _localDisposableStore;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private _value;
    get value(): Readonly<IEditorOptions>;
    constructor(notebookEditor: INotebookEditorDelegate, notebookOptions: NotebookOptions, configurationService: IConfigurationService, language: string);
    private _recomputeOptions;
    private _computeEditorOptions;
}
