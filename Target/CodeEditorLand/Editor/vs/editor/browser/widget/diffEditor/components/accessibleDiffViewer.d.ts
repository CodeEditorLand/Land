import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, ITransaction } from '../../../../../base/common/observable.js';
import { IComputedEditorOptions } from '../../../../common/config/editorOptions.js';
import { Position } from '../../../../common/core/position.js';
import { Range } from '../../../../common/core/range.js';
import { DetailedLineRangeMapping } from '../../../../common/diff/rangeMapping.js';
import { ITextModel } from '../../../../common/model.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import './accessibleDiffViewer.css';
import { DiffEditorEditors } from './diffEditorEditors.js';
export interface IAccessibleDiffViewerModel {
    getOriginalModel(): ITextModel;
    getOriginalOptions(): IComputedEditorOptions;
    originalReveal(range: Range): void;
    getModifiedModel(): ITextModel;
    getModifiedOptions(): IComputedEditorOptions;
    modifiedReveal(range?: Range): void;
    modifiedSetSelection(range: Range): void;
    modifiedFocus(): void;
    getModifiedPosition(): Position | undefined;
}
export declare class AccessibleDiffViewer extends Disposable {
    private readonly _parentNode;
    private readonly _visible;
    private readonly _setVisible;
    private readonly _canClose;
    private readonly _width;
    private readonly _height;
    private readonly _diffs;
    private readonly _models;
    private readonly _instantiationService;
    static _ttPolicy: Pick<TrustedTypePolicy<Options>, "name" | "createHTML"> | undefined;
    constructor(_parentNode: HTMLElement, _visible: IObservable<boolean>, _setVisible: (visible: boolean, tx: ITransaction | undefined) => void, _canClose: IObservable<boolean>, _width: IObservable<number>, _height: IObservable<number>, _diffs: IObservable<DetailedLineRangeMapping[] | undefined>, _models: IAccessibleDiffViewerModel, _instantiationService: IInstantiationService);
    private readonly _state;
    next(): void;
    prev(): void;
    close(): void;
}
export declare class AccessibleDiffViewerModelFromEditors implements IAccessibleDiffViewerModel {
    private readonly editors;
    constructor(editors: DiffEditorEditors);
    getOriginalModel(): ITextModel;
    getOriginalOptions(): IComputedEditorOptions;
    originalReveal(range: Range): void;
    getModifiedModel(): ITextModel;
    getModifiedOptions(): IComputedEditorOptions;
    modifiedReveal(range?: Range | undefined): void;
    modifiedSetSelection(range: Range): void;
    modifiedFocus(): void;
    getModifiedPosition(): Position | undefined;
}
