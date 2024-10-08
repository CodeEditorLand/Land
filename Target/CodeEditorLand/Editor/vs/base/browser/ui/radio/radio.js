/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Widget } from '../widget.js';
import { Emitter } from '../../../common/event.js';
import './radio.css';
import { $ } from '../../dom.js';
import { Button } from '../button/button.js';
import { DisposableMap, DisposableStore } from '../../../common/lifecycle.js';
import { createInstantHoverDelegate } from '../hover/hoverDelegateFactory.js';
export class Radio extends Widget {
    constructor(opts) {
        super();
        this._onDidSelect = this._register(new Emitter());
        this.onDidSelect = this._onDidSelect.event;
        this.items = [];
        this.buttons = this._register(new DisposableMap());
        this.hoverDelegate = opts.hoverDelegate ?? this._register(createInstantHoverDelegate());
        this.domNode = $('.monaco-custom-radio');
        this.domNode.setAttribute('role', 'radio');
        this.setItems(opts.items);
    }
    setItems(items) {
        this.buttons.clearAndDisposeAll();
        this.items = items;
        this.activeItem = this.items.find(item => item.isActive) ?? this.items[0];
        for (let index = 0; index < this.items.length; index++) {
            const item = this.items[index];
            const disposables = new DisposableStore();
            const button = disposables.add(new Button(this.domNode, {
                hoverDelegate: this.hoverDelegate,
                title: item.tooltip,
                supportIcons: true,
            }));
            button.enabled = !item.disabled;
            disposables.add(button.onDidClick(() => {
                if (this.activeItem !== item) {
                    this.activeItem = item;
                    this.updateButtons();
                    this._onDidSelect.fire(index);
                }
            }));
            this.buttons.set(button, { item, dispose: () => disposables.dispose() });
        }
        this.updateButtons();
    }
    setActiveItem(index) {
        if (index < 0 || index >= this.items.length) {
            throw new Error('Invalid Index');
        }
        this.activeItem = this.items[index];
        this.updateButtons();
    }
    setEnabled(enabled) {
        for (const [button] of this.buttons) {
            button.enabled = enabled;
        }
    }
    updateButtons() {
        let isActive = false;
        for (const [button, { item }] of this.buttons) {
            const isPreviousActive = isActive;
            isActive = item === this.activeItem;
            button.element.classList.toggle('active', isActive);
            button.element.classList.toggle('previous-active', isPreviousActive);
            button.label = item.text;
        }
    }
}
