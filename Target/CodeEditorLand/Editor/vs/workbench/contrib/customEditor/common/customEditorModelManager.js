import { createSingleCallFunction } from '../../../../base/common/functional.js';
export class CustomEditorModelManager {
    constructor() {
        this._references = new Map();
    }
    async getAllModels(resource) {
        const keyStart = `${resource.toString()}@@@`;
        const models = [];
        for (const [key, entry] of this._references) {
            if (key.startsWith(keyStart) && entry.model) {
                models.push(await entry.model);
            }
        }
        return models;
    }
    async get(resource, viewType) {
        const key = this.key(resource, viewType);
        const entry = this._references.get(key);
        return entry?.model;
    }
    tryRetain(resource, viewType) {
        const key = this.key(resource, viewType);
        const entry = this._references.get(key);
        if (!entry) {
            return undefined;
        }
        entry.counter++;
        return entry.model.then(model => {
            return {
                object: model,
                dispose: createSingleCallFunction(() => {
                    if (--entry.counter <= 0) {
                        entry.model.then(x => x.dispose());
                        this._references.delete(key);
                    }
                }),
            };
        });
    }
    add(resource, viewType, model) {
        const key = this.key(resource, viewType);
        const existing = this._references.get(key);
        if (existing) {
            throw new Error('Model already exists');
        }
        this._references.set(key, { viewType, model, counter: 0 });
        return this.tryRetain(resource, viewType);
    }
    disposeAllModelsForView(viewType) {
        for (const [key, value] of this._references) {
            if (value.viewType === viewType) {
                value.model.then(x => x.dispose());
                this._references.delete(key);
            }
        }
    }
    key(resource, viewType) {
        return `${resource.toString()}@@@${viewType}`;
    }
}
