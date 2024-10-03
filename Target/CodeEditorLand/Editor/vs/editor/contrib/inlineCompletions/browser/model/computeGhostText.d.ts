import { Position } from '../../../../common/core/position.js';
import { SingleTextEdit } from '../../../../common/core/textEdit.js';
import { ITextModel } from '../../../../common/model.js';
import { GhostText } from './ghostText.js';
export declare function computeGhostText(edit: SingleTextEdit, model: ITextModel, mode: 'prefix' | 'subword' | 'subwordSmart', cursorPosition?: Position, previewSuffixLength?: number): GhostText | undefined;
