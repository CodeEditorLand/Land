import { toDisposable } from '../../../../base/common/lifecycle.js';
import { LinkedList } from '../../../../base/common/linkedList.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IOutlineService } from './outline.js';
import { Emitter } from '../../../../base/common/event.js';
class OutlineService {
    constructor() {
        this._factories = new LinkedList();
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
    }
    canCreateOutline(pane) {
        for (const factory of this._factories) {
            if (factory.matches(pane)) {
                return true;
            }
        }
        return false;
    }
    async createOutline(pane, target, token) {
        for (const factory of this._factories) {
            if (factory.matches(pane)) {
                return await factory.createOutline(pane, target, token);
            }
        }
        return undefined;
    }
    registerOutlineCreator(creator) {
        const rm = this._factories.push(creator);
        this._onDidChange.fire();
        return toDisposable(() => {
            rm();
            this._onDidChange.fire();
        });
    }
}
registerSingleton(IOutlineService, OutlineService, 1);
