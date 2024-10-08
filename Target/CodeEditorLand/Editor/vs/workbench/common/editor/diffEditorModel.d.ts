import { EditorModel } from './editorModel.js';
import { IResolvableEditorModel } from '../../../platform/editor/common/editor.js';
/**
 * The base editor model for the diff editor. It is made up of two editor models, the original version
 * and the modified version.
 */
export declare class DiffEditorModel extends EditorModel {
    protected readonly _originalModel: IResolvableEditorModel | undefined;
    get originalModel(): IResolvableEditorModel | undefined;
    protected readonly _modifiedModel: IResolvableEditorModel | undefined;
    get modifiedModel(): IResolvableEditorModel | undefined;
    constructor(originalModel: IResolvableEditorModel | undefined, modifiedModel: IResolvableEditorModel | undefined);
    resolve(): Promise<void>;
    isResolved(): boolean;
    dispose(): void;
}
