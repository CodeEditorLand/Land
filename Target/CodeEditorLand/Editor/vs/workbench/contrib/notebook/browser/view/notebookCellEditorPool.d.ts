import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IScopedContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ICellViewModel, INotebookEditorDelegate } from '../notebookBrowser.js';
export declare class NotebookCellEditorPool extends Disposable {
    readonly notebookEditor: INotebookEditorDelegate;
    private readonly contextKeyServiceProvider;
    private readonly textModelService;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _focusedEditorDOM;
    private readonly _editorDisposable;
    private _editorContextKeyService;
    private _editor;
    private _focusEditorCancellablePromise;
    private _isInitialized;
    private _isDisposed;
    constructor(notebookEditor: INotebookEditorDelegate, contextKeyServiceProvider: (container: HTMLElement) => IScopedContextKeyService, textModelService: ITextModelService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService);
    private _initializeEditor;
    preserveFocusedEditor(cell: ICellViewModel): void;
    dispose(): void;
}
