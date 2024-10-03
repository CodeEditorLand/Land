import { Emitter } from '../../../../base/common/event.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
class ExplorerFileContributionRegistry {
    constructor() {
        this._onDidRegisterDescriptor = new Emitter();
        this.onDidRegisterDescriptor = this._onDidRegisterDescriptor.event;
        this.descriptors = [];
    }
    register(descriptor) {
        this.descriptors.push(descriptor);
        this._onDidRegisterDescriptor.fire(descriptor);
    }
    create(insta, container, store) {
        return this.descriptors.map(d => {
            const i = d.create(insta, container);
            store.add(i);
            return i;
        });
    }
}
export const explorerFileContribRegistry = new ExplorerFileContributionRegistry();
Registry.add("workbench.registry.explorer.fileContributions", explorerFileContribRegistry);
