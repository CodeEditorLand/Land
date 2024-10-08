import { AbstractSideBySideEditorInputSerializer, SideBySideEditorInput } from './sideBySideEditorInput.js';
import { EditorInput, IUntypedEditorOptions } from './editorInput.js';
import { EditorModel } from './editorModel.js';
import { Verbosity, IEditorDescriptor, IEditorPane, IResourceDiffEditorInput, IUntypedEditorInput, IDiffEditorInput, IResourceSideBySideEditorInput, EditorInputCapabilities } from '../editor.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
/**
 * The base editor input for the diff editor. It is made up of two editor inputs, the original version
 * and the modified version.
 */
export declare class DiffEditorInput extends SideBySideEditorInput implements IDiffEditorInput {
    readonly original: EditorInput;
    readonly modified: EditorInput;
    private readonly forceOpenAsBinary;
    static readonly ID: string;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    private cachedModel;
    private readonly labels;
    constructor(preferredName: string | undefined, preferredDescription: string | undefined, original: EditorInput, modified: EditorInput, forceOpenAsBinary: boolean | undefined, editorService: IEditorService);
    private computeLabels;
    private computeLabel;
    getName(): string;
    getDescription(verbosity?: Verbosity): string | undefined;
    getTitle(verbosity?: Verbosity): string;
    resolve(): Promise<EditorModel>;
    prefersEditorPane<T extends IEditorDescriptor<IEditorPane>>(editorPanes: T[]): T | undefined;
    private createModel;
    toUntyped(options?: IUntypedEditorOptions): (IResourceDiffEditorInput & IResourceSideBySideEditorInput) | undefined;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
export declare class DiffEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
    protected createEditorInput(instantiationService: IInstantiationService, name: string | undefined, description: string | undefined, secondaryInput: EditorInput, primaryInput: EditorInput): EditorInput;
}
