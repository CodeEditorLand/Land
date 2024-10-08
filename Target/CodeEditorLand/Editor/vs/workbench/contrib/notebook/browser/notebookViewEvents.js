/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var NotebookViewEventType;
(function (NotebookViewEventType) {
    NotebookViewEventType[NotebookViewEventType["LayoutChanged"] = 1] = "LayoutChanged";
    NotebookViewEventType[NotebookViewEventType["MetadataChanged"] = 2] = "MetadataChanged";
    NotebookViewEventType[NotebookViewEventType["CellStateChanged"] = 3] = "CellStateChanged";
})(NotebookViewEventType || (NotebookViewEventType = {}));
export class NotebookLayoutChangedEvent {
    constructor(source, value) {
        this.source = source;
        this.value = value;
        this.type = NotebookViewEventType.LayoutChanged;
    }
}
export class NotebookMetadataChangedEvent {
    constructor(source) {
        this.source = source;
        this.type = NotebookViewEventType.MetadataChanged;
    }
}
export class NotebookCellStateChangedEvent {
    constructor(source, cell) {
        this.source = source;
        this.cell = cell;
        this.type = NotebookViewEventType.CellStateChanged;
    }
}
