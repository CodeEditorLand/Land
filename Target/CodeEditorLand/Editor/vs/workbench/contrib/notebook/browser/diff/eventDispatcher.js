/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
export var NotebookDiffViewEventType;
(function (NotebookDiffViewEventType) {
    NotebookDiffViewEventType[NotebookDiffViewEventType["LayoutChanged"] = 1] = "LayoutChanged";
    NotebookDiffViewEventType[NotebookDiffViewEventType["CellLayoutChanged"] = 2] = "CellLayoutChanged";
    // MetadataChanged = 2,
    // CellStateChanged = 3
})(NotebookDiffViewEventType || (NotebookDiffViewEventType = {}));
export class NotebookDiffLayoutChangedEvent {
    constructor(source, value) {
        this.source = source;
        this.value = value;
        this.type = NotebookDiffViewEventType.LayoutChanged;
    }
}
export class NotebookCellLayoutChangedEvent {
    constructor(source) {
        this.source = source;
        this.type = NotebookDiffViewEventType.CellLayoutChanged;
    }
}
export class NotebookDiffEditorEventDispatcher extends Disposable {
    constructor() {
        super(...arguments);
        this._onDidChangeLayout = this._register(new Emitter());
        this.onDidChangeLayout = this._onDidChangeLayout.event;
        this._onDidChangeCellLayout = this._register(new Emitter());
        this.onDidChangeCellLayout = this._onDidChangeCellLayout.event;
    }
    emit(events) {
        for (let i = 0, len = events.length; i < len; i++) {
            const e = events[i];
            switch (e.type) {
                case NotebookDiffViewEventType.LayoutChanged:
                    this._onDidChangeLayout.fire(e);
                    break;
                case NotebookDiffViewEventType.CellLayoutChanged:
                    this._onDidChangeCellLayout.fire(e);
                    break;
            }
        }
    }
}
