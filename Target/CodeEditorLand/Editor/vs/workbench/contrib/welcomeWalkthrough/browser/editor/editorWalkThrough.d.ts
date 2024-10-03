import { IInstantiationService, ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { WalkThroughInput } from '../walkThroughInput.js';
import { IEditorSerializer } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
export declare class EditorWalkThroughAction extends Action2 {
    static readonly ID = "workbench.action.showInteractivePlayground";
    static readonly LABEL: import("../../../../../nls.js").ILocalizedString;
    constructor();
    run(serviceAccessor: ServicesAccessor): Promise<void>;
}
export declare class EditorWalkThroughInputSerializer implements IEditorSerializer {
    static readonly ID = "workbench.editors.walkThroughInput";
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string;
    deserialize(instantiationService: IInstantiationService): WalkThroughInput;
}
