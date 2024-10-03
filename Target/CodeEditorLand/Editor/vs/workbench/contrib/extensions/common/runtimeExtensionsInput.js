import * as nls from '../../../../nls.js';
import { URI } from '../../../../base/common/uri.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
const RuntimeExtensionsEditorIcon = registerIcon('runtime-extensions-editor-label-icon', Codicon.extensions, nls.localize('runtimeExtensionEditorLabelIcon', 'Icon of the runtime extensions editor label.'));
export class RuntimeExtensionsInput extends EditorInput {
    constructor() {
        super(...arguments);
        this.resource = URI.from({
            scheme: 'runtime-extensions',
            path: 'default'
        });
    }
    static { this.ID = 'workbench.runtimeExtensions.input'; }
    get typeId() {
        return RuntimeExtensionsInput.ID;
    }
    get capabilities() {
        return 2 | 8;
    }
    static get instance() {
        if (!RuntimeExtensionsInput._instance || RuntimeExtensionsInput._instance.isDisposed()) {
            RuntimeExtensionsInput._instance = new RuntimeExtensionsInput();
        }
        return RuntimeExtensionsInput._instance;
    }
    getName() {
        return nls.localize('extensionsInputName', "Running Extensions");
    }
    getIcon() {
        return RuntimeExtensionsEditorIcon;
    }
    matches(other) {
        if (super.matches(other)) {
            return true;
        }
        return other instanceof RuntimeExtensionsInput;
    }
}
