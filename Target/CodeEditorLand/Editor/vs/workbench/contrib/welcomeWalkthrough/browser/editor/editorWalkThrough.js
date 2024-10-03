import content from './vs_code_editor_walkthrough.js';
import { localize, localize2 } from '../../../../../nls.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { WalkThroughInput } from '../walkThroughInput.js';
import { FileAccess, Schemas } from '../../../../../base/common/network.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../../platform/action/common/actionCommonCategories.js';
import { walkThroughContentRegistry } from '../../common/walkThroughContentProvider.js';
walkThroughContentRegistry.registerProvider('vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough', content);
const typeId = 'workbench.editors.walkThroughInput';
const inputOptions = {
    typeId,
    name: localize('editorWalkThrough.title', "Editor Playground"),
    resource: FileAccess.asBrowserUri('vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough.md')
        .with({
        scheme: Schemas.walkThrough,
        query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough' })
    }),
    telemetryFrom: 'walkThrough'
};
export class EditorWalkThroughAction extends Action2 {
    static { this.ID = 'workbench.action.showInteractivePlayground'; }
    static { this.LABEL = localize2('editorWalkThrough', 'Interactive Editor Playground'); }
    constructor() {
        super({
            id: EditorWalkThroughAction.ID,
            title: EditorWalkThroughAction.LABEL,
            category: Categories.Help,
            f1: true,
            metadata: {
                description: localize2('editorWalkThroughMetadata', "Opens an interactive playground for learning about the editor.")
            }
        });
    }
    run(serviceAccessor) {
        const editorService = serviceAccessor.get(IEditorService);
        const instantiationService = serviceAccessor.get(IInstantiationService);
        const input = instantiationService.createInstance(WalkThroughInput, inputOptions);
        return editorService.openEditor(input, { pinned: true })
            .then(() => void (0));
    }
}
export class EditorWalkThroughInputSerializer {
    static { this.ID = typeId; }
    canSerialize(editorInput) {
        return true;
    }
    serialize(editorInput) {
        return '';
    }
    deserialize(instantiationService) {
        return instantiationService.createInstance(WalkThroughInput, inputOptions);
    }
}
