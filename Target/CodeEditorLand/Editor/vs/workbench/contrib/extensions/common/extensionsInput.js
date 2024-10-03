import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { join } from '../../../../base/common/path.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
const ExtensionEditorIcon = registerIcon('extensions-editor-label-icon', Codicon.extensions, localize('extensionsEditorLabelIcon', 'Icon of the extensions editor label.'));
export class ExtensionsInput extends EditorInput {
    static { this.ID = 'workbench.extensions.input2'; }
    get typeId() {
        return ExtensionsInput.ID;
    }
    get capabilities() {
        return 2 | 8;
    }
    get resource() {
        return URI.from({
            scheme: Schemas.extension,
            path: join(this._extension.identifier.id, 'extension')
        });
    }
    constructor(_extension) {
        super();
        this._extension = _extension;
    }
    get extension() { return this._extension; }
    getName() {
        return localize('extensionsInputName', "Extension: {0}", this._extension.displayName);
    }
    getIcon() {
        return ExtensionEditorIcon;
    }
    matches(other) {
        if (super.matches(other)) {
            return true;
        }
        return other instanceof ExtensionsInput && areSameExtensions(this._extension.identifier, other._extension.identifier);
    }
}
