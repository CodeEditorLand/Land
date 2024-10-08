import { ITextModel } from '../model.js';
import { ICoordinatesConverter } from '../viewModel.js';
import { CursorConfiguration, ICursorSimpleModel } from '../cursorCommon.js';
export declare class CursorContext {
    _cursorContextBrand: void;
    readonly model: ITextModel;
    readonly viewModel: ICursorSimpleModel;
    readonly coordinatesConverter: ICoordinatesConverter;
    readonly cursorConfig: CursorConfiguration;
    constructor(model: ITextModel, viewModel: ICursorSimpleModel, coordinatesConverter: ICoordinatesConverter, cursorConfig: CursorConfiguration);
}
