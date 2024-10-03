import { IDiffEditorModel } from '../../../editor/common/editorCommon.js';
import { BaseTextEditorModel } from './textEditorModel.js';
import { DiffEditorModel } from './diffEditorModel.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
export declare class TextDiffEditorModel extends DiffEditorModel {
    protected readonly _originalModel: BaseTextEditorModel | undefined;
    get originalModel(): BaseTextEditorModel | undefined;
    protected readonly _modifiedModel: BaseTextEditorModel | undefined;
    get modifiedModel(): BaseTextEditorModel | undefined;
    private _textDiffEditorModel;
    get textDiffEditorModel(): IDiffEditorModel | undefined;
    constructor(originalModel: BaseTextEditorModel, modifiedModel: BaseTextEditorModel);
    resolve(): Promise<void>;
    private updateTextDiffEditorModel;
    isResolved(): boolean;
    isReadonly(): boolean | IMarkdownString;
    dispose(): void;
}
