import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import * as nls from '../../../../nls.js';
import { Memento } from '../../../common/memento.js';
import { CustomEditorInfo } from './customEditor.js';
import { customEditorsExtensionPoint } from './extensionPoint.js';
import { RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
export class ContributedCustomEditors extends Disposable {
    static { this.CUSTOM_EDITORS_STORAGE_ID = 'customEditors'; }
    static { this.CUSTOM_EDITORS_ENTRY_ID = 'editors'; }
    constructor(storageService) {
        super();
        this._editors = new Map();
        this._onChange = this._register(new Emitter());
        this.onChange = this._onChange.event;
        this._memento = new Memento(ContributedCustomEditors.CUSTOM_EDITORS_STORAGE_ID, storageService);
        const mementoObject = this._memento.getMemento(0, 1);
        for (const info of (mementoObject[ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] || [])) {
            this.add(new CustomEditorInfo(info));
        }
        customEditorsExtensionPoint.setHandler(extensions => {
            this.update(extensions);
        });
    }
    update(extensions) {
        this._editors.clear();
        for (const extension of extensions) {
            for (const webviewEditorContribution of extension.value) {
                this.add(new CustomEditorInfo({
                    id: webviewEditorContribution.viewType,
                    displayName: webviewEditorContribution.displayName,
                    providerDisplayName: extension.description.isBuiltin ? nls.localize('builtinProviderDisplayName', "Built-in") : extension.description.displayName || extension.description.identifier.value,
                    selector: webviewEditorContribution.selector || [],
                    priority: getPriorityFromContribution(webviewEditorContribution, extension.description),
                }));
            }
        }
        const mementoObject = this._memento.getMemento(0, 1);
        mementoObject[ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._editors.values());
        this._memento.saveMemento();
        this._onChange.fire();
    }
    [Symbol.iterator]() {
        return this._editors.values();
    }
    get(viewType) {
        return this._editors.get(viewType);
    }
    getContributedEditors(resource) {
        return Array.from(this._editors.values())
            .filter(customEditor => customEditor.matches(resource));
    }
    add(info) {
        if (this._editors.has(info.id)) {
            console.error(`Custom editor with id '${info.id}' already registered`);
            return;
        }
        this._editors.set(info.id, info);
    }
}
function getPriorityFromContribution(contribution, extension) {
    switch (contribution.priority) {
        case RegisteredEditorPriority.default:
        case RegisteredEditorPriority.option:
            return contribution.priority;
        case RegisteredEditorPriority.builtin:
            return extension.isBuiltin ? RegisteredEditorPriority.builtin : RegisteredEditorPriority.default;
        default:
            return RegisteredEditorPriority.default;
    }
}
