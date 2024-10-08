/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { isChatRequestVariableEntry, } from "../../common/chatModel.js";
import { ChatWidget } from "../chatWidget.js";
export class ChatContextAttachments extends Disposable {
    static { this.ID = "chatContextAttachments"; }
    get id() {
        return ChatContextAttachments.ID;
    }
    constructor(widget) {
        super();
        this.widget = widget;
        this._attachedContext = new Map();
        this._register(this.widget.onDidChangeContext(({ removed, added }) => {
            removed?.forEach((attachment) => this._attachedContext.delete(attachment.id));
            added?.forEach((attachment) => {
                if (!this._attachedContext.has(attachment.id)) {
                    this._attachedContext.set(attachment.id, attachment);
                }
            });
        }));
        this._register(this.widget.onDidSubmitAgent(() => {
            this._clearAttachedContext();
        }));
    }
    getInputState() {
        return [...this._attachedContext.values()];
    }
    setInputState(s) {
        const attachments = Array.isArray(s)
            ? s.filter(isChatRequestVariableEntry)
            : [];
        this.setContext(true, ...attachments);
    }
    getContext() {
        return new Set(this._attachedContext.keys());
    }
    setContext(overwrite, ...attachments) {
        if (overwrite) {
            this._attachedContext.clear();
        }
        const newAttachments = [];
        for (const attachment of attachments) {
            if (!this._attachedContext.has(attachment.id)) {
                this._attachedContext.set(attachment.id, attachment);
                newAttachments.push(attachment);
            }
        }
        this.widget.setContext(overwrite, ...newAttachments);
    }
    _clearAttachedContext() {
        this._attachedContext.clear();
    }
}
ChatWidget.CONTRIBS.push(ChatContextAttachments);
