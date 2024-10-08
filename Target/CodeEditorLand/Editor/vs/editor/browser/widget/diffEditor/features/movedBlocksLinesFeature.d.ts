import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { DiffEditorEditors } from '../components/diffEditorEditors.js';
import { DiffEditorViewModel } from '../diffEditorViewModel.js';
import { EditorLayoutInfo } from '../../../../common/config/editorOptions.js';
export declare class MovedBlocksLinesFeature extends Disposable {
    private readonly _rootElement;
    private readonly _diffModel;
    private readonly _originalEditorLayoutInfo;
    private readonly _modifiedEditorLayoutInfo;
    private readonly _editors;
    static readonly movedCodeBlockPadding = 4;
    private readonly _element;
    private readonly _originalScrollTop;
    private readonly _modifiedScrollTop;
    private readonly _viewZonesChanged;
    readonly width: import("../../../../../base/common/observable.js").ISettableObservable<number, void>;
    constructor(_rootElement: HTMLElement, _diffModel: IObservable<DiffEditorViewModel | undefined>, _originalEditorLayoutInfo: IObservable<EditorLayoutInfo | null>, _modifiedEditorLayoutInfo: IObservable<EditorLayoutInfo | null>, _editors: DiffEditorEditors);
    private readonly _modifiedViewZonesChangedSignal;
    private readonly _originalViewZonesChangedSignal;
    private readonly _state;
}
