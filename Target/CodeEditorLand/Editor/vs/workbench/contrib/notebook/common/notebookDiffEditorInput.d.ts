import { IResourceDiffEditorInput, IResourceSideBySideEditorInput, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotebookDiffEditorModel, IResolvedNotebookEditorModel } from './notebookCommon.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { NotebookEditorInput } from './notebookEditorInput.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
declare class NotebookDiffEditorModel extends EditorModel implements INotebookDiffEditorModel {
    readonly original: IResolvedNotebookEditorModel;
    readonly modified: IResolvedNotebookEditorModel;
    constructor(original: IResolvedNotebookEditorModel, modified: IResolvedNotebookEditorModel);
}
export declare class NotebookDiffEditorInput extends DiffEditorInput {
    readonly original: NotebookEditorInput;
    readonly modified: NotebookEditorInput;
    readonly viewType: string;
    static create(instantiationService: IInstantiationService, resource: URI, name: string | undefined, description: string | undefined, originalResource: URI, viewType: string): NotebookDiffEditorInput;
    static readonly ID: string;
    private _modifiedTextModel;
    private _originalTextModel;
    get resource(): URI;
    get editorId(): string;
    private _cachedModel;
    constructor(name: string | undefined, description: string | undefined, original: NotebookEditorInput, modified: NotebookEditorInput, viewType: string, editorService: IEditorService);
    get typeId(): string;
    resolve(): Promise<NotebookDiffEditorModel>;
    toUntyped(): IResourceDiffEditorInput & IResourceSideBySideEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
export {};
