import { Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { IPartialViewLinesViewportData, IViewModel, IViewWhitespaceViewportData, ViewLineRenderingData, ViewModelDecoration } from '../viewModel.js';
export declare class ViewportData {
    readonly selections: Selection[];
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    readonly relativeVerticalOffset: number[];
    readonly visibleRange: Range;
    readonly bigNumbersDelta: number;
    readonly whitespaceViewportData: IViewWhitespaceViewportData[];
    private readonly _model;
    readonly lineHeight: number;
    constructor(selections: Selection[], partialData: IPartialViewLinesViewportData, whitespaceViewportData: IViewWhitespaceViewportData[], model: IViewModel);
    getViewLineRenderingData(lineNumber: number): ViewLineRenderingData;
    getDecorationsInViewport(): ViewModelDecoration[];
}
