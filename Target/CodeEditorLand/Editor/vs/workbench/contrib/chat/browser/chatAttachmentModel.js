/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { basename } from '../../../../base/common/resources.js';
export class ChatAttachmentModel extends Disposable {
    constructor() {
        super(...arguments);
        this._attachments = new Map();
        this._onDidChangeContext = this._register(new Emitter());
        this.onDidChangeContext = this._onDidChangeContext.event;
    }
    get attachments() {
        return Array.from(this._attachments.values());
    }
    get size() {
        return this._attachments.size;
    }
    getAttachmentIDs() {
        return new Set(this._attachments.keys());
    }
    clear() {
        this._attachments.clear();
        this._onDidChangeContext.fire();
    }
    delete(variableEntryId) {
        this._attachments.delete(variableEntryId);
        this._onDidChangeContext.fire();
    }
    addFile(uri, range) {
        this.addContext({
            value: uri,
            id: uri.toString() + (range?.toString() ?? ''),
            name: basename(uri),
            isFile: true,
            isDynamic: true
        });
    }
    addContext(...attachments) {
        for (const attachment of attachments) {
            if (!this._attachments.has(attachment.id)) {
                this._attachments.set(attachment.id, attachment);
            }
        }
        this._onDidChangeContext.fire();
    }
    clearAndSetContext(...attachments) {
        this.clear();
        this.addContext(...attachments);
    }
}
