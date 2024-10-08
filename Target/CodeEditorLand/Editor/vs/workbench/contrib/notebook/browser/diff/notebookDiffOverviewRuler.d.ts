import { IThemeService, Themable } from '../../../../../platform/theme/common/themeService.js';
import { IDiffElementViewModelBase } from './diffElementViewModel.js';
import { NotebookDiffEditorEventDispatcher } from './eventDispatcher.js';
import { INotebookTextDiffEditor } from './notebookDiffEditorBrowser.js';
export declare class NotebookDiffOverviewRuler extends Themable {
    readonly notebookEditor: INotebookTextDiffEditor;
    readonly width: number;
    private readonly _domNode;
    private readonly _overviewViewportDomElement;
    private _diffElementViewModels;
    private _lanes;
    private _insertColor;
    private _insertColorHex;
    private _removeColor;
    private _removeColorHex;
    private readonly _disposables;
    private _renderAnimationFrame;
    constructor(notebookEditor: INotebookTextDiffEditor, width: number, container: HTMLElement, themeService: IThemeService);
    private applyColors;
    layout(): void;
    updateViewModels(elements: readonly IDiffElementViewModelBase[], eventDispatcher: NotebookDiffEditorEventDispatcher | undefined): void;
    private _scheduleRender;
    private _onRenderScheduled;
    private _layoutNow;
    private _renderOverviewViewport;
    private _computeOverviewViewport;
    private _renderCanvas;
    dispose(): void;
}
