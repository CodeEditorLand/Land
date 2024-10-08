/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from '../../../../base/common/lifecycle.js';
import { $ } from '../../../../base/browser/dom.js';
import { DomScrollableElement } from '../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { Emitter } from '../../../../base/common/event.js';
import { equals } from '../../../../base/common/arrays.js';
export class GettingStartedIndexList extends Disposable {
    constructor(options) {
        super();
        this.options = options;
        this._onDidChangeEntries = new Emitter();
        this.onDidChangeEntries = this._onDidChangeEntries.event;
        this.isDisposed = false;
        this.contextKeysToWatch = new Set();
        this.contextService = options.contextService;
        this.entries = undefined;
        this.itemCount = 0;
        this.list = $('ul');
        this.scrollbar = this._register(new DomScrollableElement(this.list, {}));
        this._register(this.onDidChangeEntries(() => this.scrollbar.scanDomNode()));
        this.domElement = $('.index-list.' + options.klass, {}, $('h2', {}, options.title), this.scrollbar.getDomNode());
        this._register(this.contextService.onDidChangeContext(e => {
            if (e.affectsSome(this.contextKeysToWatch)) {
                this.rerender();
            }
        }));
    }
    getDomElement() {
        return this.domElement;
    }
    layout(size) {
        this.scrollbar.scanDomNode();
    }
    onDidChange(listener) {
        this._register(this.onDidChangeEntries(listener));
    }
    register(d) { if (this.isDisposed) {
        d.dispose();
    }
    else {
        this._register(d);
    } }
    dispose() {
        this.isDisposed = true;
        super.dispose();
    }
    setLimit(limit) {
        this.options.limit = limit;
        this.setEntries(this.entries);
    }
    rerender() {
        this.setEntries(this.entries);
    }
    setEntries(entries) {
        let entryList = entries ?? [];
        this.itemCount = 0;
        const ranker = this.options.rankElement;
        if (ranker) {
            entryList = entryList.filter(e => ranker(e) !== null);
            entryList.sort((a, b) => ranker(b) - ranker(a));
        }
        const activeEntries = entryList.filter(e => !e.when || this.contextService.contextMatchesRules(e.when));
        const limitedEntries = activeEntries.slice(0, this.options.limit);
        const toRender = limitedEntries.map(e => e.id);
        if (this.entries === entries && equals(toRender, this.lastRendered)) {
            return;
        }
        this.entries = entries;
        this.contextKeysToWatch.clear();
        entryList.forEach(e => {
            const keys = e.when?.keys();
            keys?.forEach(key => this.contextKeysToWatch.add(key));
        });
        this.lastRendered = toRender;
        this.itemCount = limitedEntries.length;
        while (this.list.firstChild) {
            this.list.firstChild.remove();
        }
        this.itemCount = limitedEntries.length;
        for (const entry of limitedEntries) {
            const rendered = this.options.renderElement(entry);
            this.list.appendChild(rendered);
        }
        if (activeEntries.length > limitedEntries.length && this.options.more) {
            this.list.appendChild(this.options.more);
        }
        else if (entries !== undefined && this.itemCount === 0 && this.options.empty) {
            this.list.appendChild(this.options.empty);
        }
        else if (this.options.footer) {
            this.list.appendChild(this.options.footer);
        }
        this._onDidChangeEntries.fire();
    }
}
