import { EditorInput } from '../../../common/editor/editorInput.js';
import { localize } from '../../../../nls.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
const DisassemblyEditorIcon = registerIcon('disassembly-editor-label-icon', Codicon.debug, localize('disassemblyEditorLabelIcon', 'Icon of the disassembly editor label.'));
export class DisassemblyViewInput extends EditorInput {
    constructor() {
        super(...arguments);
        this.resource = undefined;
    }
    static { this.ID = 'debug.disassemblyView.input'; }
    get typeId() {
        return DisassemblyViewInput.ID;
    }
    static get instance() {
        if (!DisassemblyViewInput._instance || DisassemblyViewInput._instance.isDisposed()) {
            DisassemblyViewInput._instance = new DisassemblyViewInput();
        }
        return DisassemblyViewInput._instance;
    }
    getName() {
        return localize('disassemblyInputName', "Disassembly");
    }
    getIcon() {
        return DisassemblyEditorIcon;
    }
    matches(other) {
        return other instanceof DisassemblyViewInput;
    }
}
