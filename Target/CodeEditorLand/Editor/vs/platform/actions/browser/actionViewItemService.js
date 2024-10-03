import { Emitter, Event } from '../../../base/common/event.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { registerSingleton } from '../../instantiation/common/extensions.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const IActionViewItemService = createDecorator('IActionViewItemService');
export class NullActionViewItemService {
    constructor() {
        this.onDidChange = Event.None;
    }
    register(menu, commandId, provider, event) {
        return toDisposable(() => { });
    }
    lookUp(menu, commandId) {
        return undefined;
    }
}
class ActionViewItemService {
    constructor() {
        this._providers = new Map();
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
    }
    dispose() {
        this._onDidChange.dispose();
    }
    register(menu, commandId, provider, event) {
        const id = this._makeKey(menu, commandId);
        if (this._providers.has(id)) {
            throw new Error(`A provider for the command ${commandId} and menu ${menu} is already registered.`);
        }
        this._providers.set(id, provider);
        const listener = event?.(() => {
            this._onDidChange.fire(menu);
        });
        return toDisposable(() => {
            listener?.dispose();
            this._providers.delete(id);
        });
    }
    lookUp(menu, commandId) {
        return this._providers.get(this._makeKey(menu, commandId));
    }
    _makeKey(menu, commandId) {
        return menu.id + commandId;
    }
}
registerSingleton(IActionViewItemService, ActionViewItemService, 1);
