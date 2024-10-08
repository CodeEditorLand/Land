import { IDisposable } from '../../../base/common/lifecycle.js';
import { Range } from '../core/range.js';
import { IEditorConfiguration } from '../config/editorConfiguration.js';
import { IModelDecoration, ITextModel } from '../model.js';
import { IViewModelLines } from './viewModelLines.js';
import { ICoordinatesConverter, InlineDecoration, ViewModelDecoration } from '../viewModel.js';
export interface IDecorationsViewportData {
    /**
     * decorations in the viewport.
     */
    readonly decorations: ViewModelDecoration[];
    /**
     * inline decorations grouped by each line in the viewport.
     */
    readonly inlineDecorations: InlineDecoration[][];
}
export declare class ViewModelDecorations implements IDisposable {
    private readonly editorId;
    private readonly model;
    private readonly configuration;
    private readonly _linesCollection;
    private readonly _coordinatesConverter;
    private _decorationsCache;
    private _cachedModelDecorationsResolver;
    private _cachedModelDecorationsResolverViewRange;
    constructor(editorId: number, model: ITextModel, configuration: IEditorConfiguration, linesCollection: IViewModelLines, coordinatesConverter: ICoordinatesConverter);
    private _clearCachedModelDecorationsResolver;
    dispose(): void;
    reset(): void;
    onModelDecorationsChanged(): void;
    onLineMappingChanged(): void;
    private _getOrCreateViewModelDecoration;
    getMinimapDecorationsInRange(range: Range): ViewModelDecoration[];
    getDecorationsViewportData(viewRange: Range): IDecorationsViewportData;
    getInlineDecorationsOnLine(lineNumber: number, onlyMinimapDecorations?: boolean, onlyMarginDecorations?: boolean): InlineDecoration[];
    private _getDecorationsInRange;
}
export declare function isModelDecorationVisible(model: ITextModel, decoration: IModelDecoration): boolean;
export declare function isModelDecorationInComment(model: ITextModel, decoration: IModelDecoration): boolean;
export declare function isModelDecorationInString(model: ITextModel, decoration: IModelDecoration): boolean;
