import { Color } from '../../../../base/common/color.js';
import { IActiveCodeEditor } from '../../../browser/editorBrowser.js';
import { DocumentColorProvider, IColorInformation } from '../../../common/languages.js';
import { ITextModel } from '../../../common/model.js';
import { ColorPickerModel } from './colorPickerModel.js';
import { Range } from '../../../common/core/range.js';
export interface BaseColor {
    readonly range: Range;
    readonly model: ColorPickerModel;
    readonly provider: DocumentColorProvider;
}
export declare function createColorHover(editorModel: ITextModel, colorInfo: IColorInformation, provider: DocumentColorProvider): Promise<BaseColor>;
export declare function updateEditorModel(editor: IActiveCodeEditor, range: Range, model: ColorPickerModel): Range;
export declare function updateColorPresentations(editorModel: ITextModel, colorPickerModel: ColorPickerModel, color: Color, range: Range, colorHover: BaseColor): Promise<void>;
