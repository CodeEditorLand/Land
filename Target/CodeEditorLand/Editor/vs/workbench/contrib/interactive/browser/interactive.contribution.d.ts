import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IEditorSerializer } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { InteractiveEditorInput } from './interactiveEditorInput.js';
import { INotebookService } from '../../notebook/common/notebookService.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class InteractiveDocumentContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.interactiveDocument";
    constructor(notebookService: INotebookService, editorResolverService: IEditorResolverService, editorService: IEditorService, instantiationService: IInstantiationService);
}
export declare class InteractiveEditorSerializer implements IEditorSerializer {
    static readonly ID: string;
    canSerialize(editor: EditorInput): editor is InteractiveEditorInput;
    serialize(input: EditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, raw: string): InteractiveEditorInput | undefined;
}
