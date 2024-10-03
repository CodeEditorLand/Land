import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ILanguageConfigurationService } from '../../../../../../editor/common/languages/languageConfigurationRegistry.js';
import { ITextModelService } from '../../../../../../editor/common/services/resolverService.js';
import { IAccessibilityService } from '../../../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IUndoRedoService } from '../../../../../../platform/undoRedo/common/undoRedo.js';
import { ICellViewModel, INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
export declare enum NotebookMultiCursorState {
    Idle = 0,
    Selecting = 1,
    Editing = 2
}
export declare const NOTEBOOK_MULTI_CURSOR_CONTEXT: {
    IsNotebookMultiCursor: RawContextKey<boolean>;
    NotebookMultiSelectCursorState: RawContextKey<NotebookMultiCursorState>;
};
export declare class NotebookMultiCursorController extends Disposable implements INotebookEditorContribution {
    private readonly notebookEditor;
    private readonly contextKeyService;
    private readonly textModelService;
    private readonly languageConfigurationService;
    private readonly accessibilityService;
    private readonly configurationService;
    private readonly undoRedoService;
    static readonly id: string;
    private word;
    private trackedMatches;
    private readonly _onDidChangeAnchorCell;
    readonly onDidChangeAnchorCell: Event<void>;
    private anchorCell;
    private readonly anchorDisposables;
    private readonly cursorsDisposables;
    private cursorsControllers;
    private state;
    getState(): NotebookMultiCursorState;
    private _nbIsMultiSelectSession;
    private _nbMultiSelectState;
    constructor(notebookEditor: INotebookEditor, contextKeyService: IContextKeyService, textModelService: ITextModelService, languageConfigurationService: ILanguageConfigurationService, accessibilityService: IAccessibilityService, configurationService: IConfigurationService, undoRedoService: IUndoRedoService);
    private updateCursorsControllers;
    private constructCoordinatesConverter;
    private constructCursorSimpleModel;
    private updateAnchorListeners;
    private updateFinalUndoRedo;
    resetToIdleState(): void;
    findAndTrackNextSelection(cell: ICellViewModel): Promise<void>;
    deleteLeft(): Promise<void>;
    deleteRight(): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
    private constructCellEditorOptions;
    private initializeMultiSelectDecorations;
    private updateLazyDecorations;
    private clearDecorations;
    private getWord;
    private getClassName;
    dispose(): void;
}
