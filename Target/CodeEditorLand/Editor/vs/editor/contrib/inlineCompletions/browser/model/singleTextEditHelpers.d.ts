import { Range } from '../../../../common/core/range.js';
import { SingleTextEdit } from '../../../../common/core/textEdit.js';
import { ITextModel } from '../../../../common/model.js';
export declare function singleTextRemoveCommonPrefix(edit: SingleTextEdit, model: ITextModel, validModelRange?: Range): SingleTextEdit;
export declare function singleTextEditAugments(edit: SingleTextEdit, base: SingleTextEdit): boolean;
