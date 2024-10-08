import { IDataSource } from '../../../../../../base/browser/ui/tree/tree.js';
import { Event } from '../../../../../../base/common/event.js';
import { IDisposable, type IReference } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IEditorOptions } from '../../../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.js';
import { IEditorPane } from '../../../../../common/editor.js';
import { CellFoldingState, INotebookEditorPane } from '../../notebookBrowser.js';
import { NotebookEditor } from '../../notebookEditor.js';
import { INotebookCellOutlineDataSource } from '../../viewModel/notebookOutlineDataSource.js';
import { CellKind } from '../../../common/notebookCommon.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IBreadcrumbsDataSource, IOutline, IOutlineCreator, IOutlineListConfig, IOutlineService, IQuickPickDataSource, IQuickPickOutlineElement, OutlineChangeEvent, OutlineTarget } from '../../../../../services/outline/browser/outline.js';
import { OutlineEntry } from '../../viewModel/OutlineEntry.js';
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { RawContextKey } from '../../../../../../platform/contextkey/common/contextkey.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { ILanguageFeaturesService } from '../../../../../../editor/common/services/languageFeatures.js';
export declare class NotebookQuickPickProvider implements IQuickPickDataSource<OutlineEntry> {
    private readonly notebookCellOutlineDataSourceRef;
    private readonly _configurationService;
    private readonly _themeService;
    private readonly _disposables;
    private gotoShowCodeCellSymbols;
    constructor(notebookCellOutlineDataSourceRef: IReference<INotebookCellOutlineDataSource> | undefined, _configurationService: IConfigurationService, _themeService: IThemeService);
    getQuickPickElements(): IQuickPickOutlineElement<OutlineEntry>[];
    dispose(): void;
}
export declare class NotebookOutlinePaneProvider implements IDataSource<NotebookCellOutline, OutlineEntry> {
    private readonly outlineDataSourceRef;
    private readonly _configurationService;
    private readonly _disposables;
    private showCodeCells;
    private showCodeCellSymbols;
    private showMarkdownHeadersOnly;
    constructor(outlineDataSourceRef: IReference<INotebookCellOutlineDataSource> | undefined, _configurationService: IConfigurationService);
    getActiveEntry(): OutlineEntry | undefined;
    /**
     * Checks if the given outline entry should be filtered out of the outlinePane
     *
     * @param entry the OutlineEntry to check
     * @returns true if the entry should be filtered out of the outlinePane
     */
    private filterEntry;
    getChildren(element: NotebookCellOutline | OutlineEntry): Iterable<OutlineEntry>;
    dispose(): void;
}
export declare class NotebookBreadcrumbsProvider implements IBreadcrumbsDataSource<OutlineEntry> {
    private readonly outlineDataSourceRef;
    private readonly _configurationService;
    private readonly _disposables;
    private showCodeCells;
    constructor(outlineDataSourceRef: IReference<INotebookCellOutlineDataSource> | undefined, _configurationService: IConfigurationService);
    getBreadcrumbElements(): readonly OutlineEntry[];
    dispose(): void;
}
export declare class NotebookCellOutline implements IOutline<OutlineEntry> {
    private readonly _editor;
    private readonly _target;
    private readonly _themeService;
    private readonly _editorService;
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _languageFeaturesService;
    private readonly _notebookExecutionStateService;
    readonly outlineKind = "notebookCells";
    private readonly _disposables;
    private readonly _modelDisposables;
    private readonly _dataSourceDisposables;
    private readonly _onDidChange;
    readonly onDidChange: Event<OutlineChangeEvent>;
    private readonly delayerRecomputeState;
    private readonly delayerRecomputeActive;
    private readonly delayerRecomputeSymbols;
    readonly config: IOutlineListConfig<OutlineEntry>;
    private _outlineDataSourceReference;
    private _treeDataSource;
    private _quickPickDataSource;
    private _breadcrumbsDataSource;
    private outlineShowCodeCellSymbols;
    get activeElement(): OutlineEntry | undefined;
    get entries(): OutlineEntry[];
    get uri(): URI | undefined;
    get isEmpty(): boolean;
    private checkDelayer;
    constructor(_editor: INotebookEditorPane, _target: OutlineTarget, _themeService: IThemeService, _editorService: IEditorService, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _notebookExecutionStateService: INotebookExecutionStateService);
    private initializeOutline;
    /**
     * set up the primary data source + three viewing sources for the various outline views
     */
    private setDataSources;
    /**
     * set up the listeners for the outline content, these respond to model changes in the notebook
     */
    private setModelListeners;
    private computeSymbols;
    doComputeSymbols(cancelToken: CancellationToken): Promise<void>;
    private delayedComputeSymbols;
    private recomputeState;
    private delayedRecomputeState;
    private recomputeActive;
    private delayedRecomputeActive;
    reveal(entry: OutlineEntry, options: IEditorOptions, sideBySide: boolean): Promise<void>;
    preview(entry: OutlineEntry): IDisposable;
    captureViewState(): IDisposable;
    dispose(): void;
}
export declare class NotebookOutlineCreator implements IOutlineCreator<NotebookEditor, OutlineEntry> {
    private readonly _instantiationService;
    readonly dispose: () => void;
    constructor(outlineService: IOutlineService, _instantiationService: IInstantiationService);
    matches(candidate: IEditorPane): candidate is NotebookEditor;
    createOutline(editor: INotebookEditorPane, target: OutlineTarget, cancelToken: CancellationToken): Promise<IOutline<OutlineEntry> | undefined>;
}
export declare const NotebookOutlineContext: {
    CellKind: RawContextKey<CellKind>;
    CellHasChildren: RawContextKey<boolean>;
    CellHasHeader: RawContextKey<boolean>;
    CellFoldingState: RawContextKey<CellFoldingState>;
    OutlineElementTarget: RawContextKey<OutlineTarget>;
};
