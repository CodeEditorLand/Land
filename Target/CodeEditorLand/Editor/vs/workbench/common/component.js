/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Memento } from './memento.js';
import { Themable } from '../../platform/theme/common/themeService.js';
export class Component extends Themable {
    constructor(id, themeService, storageService) {
        super(themeService);
        this.id = id;
        this.memento = new Memento(this.id, storageService);
        this._register(storageService.onWillSaveState(() => {
            // Ask the component to persist state into the memento
            this.saveState();
            // Then save the memento into storage
            this.memento.saveMemento();
        }));
    }
    getId() {
        return this.id;
    }
    getMemento(scope, target) {
        return this.memento.getMemento(scope, target);
    }
    reloadMemento(scope) {
        return this.memento.reloadMemento(scope);
    }
    onDidChangeMementoValue(scope, disposables) {
        return this.memento.onDidChangeValue(scope, disposables);
    }
    saveState() {
        // Subclasses to implement for storing state
    }
}
