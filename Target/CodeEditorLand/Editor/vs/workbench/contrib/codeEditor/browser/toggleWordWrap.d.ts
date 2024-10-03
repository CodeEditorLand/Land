import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { ITextModel } from '../../../../editor/common/model.js';
export interface IWordWrapTransientState {
    readonly wordWrapOverride: 'on' | 'off';
}
export declare function writeTransientState(model: ITextModel, state: IWordWrapTransientState | null, codeEditorService: ICodeEditorService): void;
export declare function readTransientState(model: ITextModel, codeEditorService: ICodeEditorService): IWordWrapTransientState | null;
