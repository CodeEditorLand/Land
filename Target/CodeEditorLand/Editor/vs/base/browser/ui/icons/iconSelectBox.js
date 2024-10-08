/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './iconSelectBox.css';
import * as dom from '../../dom.js';
import { alert } from '../aria/aria.js';
import { InputBox } from '../inputbox/inputBox.js';
import { DomScrollableElement } from '../scrollbar/scrollableElement.js';
import { Emitter } from '../../../common/event.js';
import { DisposableStore, Disposable, MutableDisposable } from '../../../common/lifecycle.js';
import { ThemeIcon } from '../../../common/themables.js';
import { localize } from '../../../../nls.js';
import { HighlightedLabel } from '../highlightedlabel/highlightedLabel.js';
export class IconSelectBox extends Disposable {
    static { this.InstanceCount = 0; }
    constructor(options) {
        super();
        this.options = options;
        this.domId = `icon_select_box_id_${++IconSelectBox.InstanceCount}`;
        this._onDidSelect = this._register(new Emitter());
        this.onDidSelect = this._onDidSelect.event;
        this.renderedIcons = [];
        this.focusedItemIndex = 0;
        this.numberOfElementsPerRow = 1;
        this.iconContainerWidth = 36;
        this.iconContainerHeight = 36;
        this.domNode = dom.$('.icon-select-box');
        this._register(this.create());
    }
    create() {
        const disposables = new DisposableStore();
        const iconSelectBoxContainer = dom.append(this.domNode, dom.$('.icon-select-box-container'));
        iconSelectBoxContainer.style.margin = '10px 15px';
        const iconSelectInputContainer = dom.append(iconSelectBoxContainer, dom.$('.icon-select-input-container'));
        iconSelectInputContainer.style.paddingBottom = '10px';
        this.inputBox = disposables.add(new InputBox(iconSelectInputContainer, undefined, {
            placeholder: localize('iconSelect.placeholder', "Search icons"),
            inputBoxStyles: this.options.inputBoxStyles,
        }));
        const iconsContainer = this.iconsContainer = dom.$('.icon-select-icons-container', { id: `${this.domId}_icons` });
        iconsContainer.role = 'listbox';
        iconsContainer.tabIndex = 0;
        this.scrollableElement = disposables.add(new DomScrollableElement(iconsContainer, {
            useShadows: false,
            horizontal: 2 /* ScrollbarVisibility.Hidden */,
        }));
        dom.append(iconSelectBoxContainer, this.scrollableElement.getDomNode());
        if (this.options.showIconInfo) {
            this.iconIdElement = this._register(new HighlightedLabel(dom.append(dom.append(iconSelectBoxContainer, dom.$('.icon-select-id-container')), dom.$('.icon-select-id-label'))));
        }
        const iconsDisposables = disposables.add(new MutableDisposable());
        iconsDisposables.value = this.renderIcons(this.options.icons, [], iconsContainer);
        this.scrollableElement.scanDomNode();
        disposables.add(this.inputBox.onDidChange(value => {
            const icons = [], matches = [];
            for (const icon of this.options.icons) {
                const match = this.matchesContiguous(value, icon.id);
                if (match) {
                    icons.push(icon);
                    matches.push(match);
                }
            }
            if (icons.length) {
                iconsDisposables.value = this.renderIcons(icons, matches, iconsContainer);
                this.scrollableElement?.scanDomNode();
            }
        }));
        this.inputBox.inputElement.role = 'combobox';
        this.inputBox.inputElement.ariaHasPopup = 'menu';
        this.inputBox.inputElement.ariaAutoComplete = 'list';
        this.inputBox.inputElement.ariaExpanded = 'true';
        this.inputBox.inputElement.setAttribute('aria-controls', iconsContainer.id);
        return disposables;
    }
    renderIcons(icons, matches, container) {
        const disposables = new DisposableStore();
        dom.clearNode(container);
        const focusedIcon = this.renderedIcons[this.focusedItemIndex]?.icon;
        let focusedIconIndex = 0;
        const renderedIcons = [];
        if (icons.length) {
            for (let index = 0; index < icons.length; index++) {
                const icon = icons[index];
                const iconContainer = dom.append(container, dom.$('.icon-container', { id: `${this.domId}_icons_${index}` }));
                iconContainer.style.width = `${this.iconContainerWidth}px`;
                iconContainer.style.height = `${this.iconContainerHeight}px`;
                iconContainer.title = icon.id;
                iconContainer.role = 'button';
                iconContainer.setAttribute('aria-setsize', `${icons.length}`);
                iconContainer.setAttribute('aria-posinset', `${index + 1}`);
                dom.append(iconContainer, dom.$(ThemeIcon.asCSSSelector(icon)));
                renderedIcons.push({ icon, element: iconContainer, highlightMatches: matches[index] });
                disposables.add(dom.addDisposableListener(iconContainer, dom.EventType.CLICK, (e) => {
                    e.stopPropagation();
                    this.setSelection(index);
                }));
                if (icon === focusedIcon) {
                    focusedIconIndex = index;
                }
            }
        }
        else {
            const noResults = localize('iconSelect.noResults', "No results");
            dom.append(container, dom.$('.icon-no-results', undefined, noResults));
            alert(noResults);
        }
        this.renderedIcons.splice(0, this.renderedIcons.length, ...renderedIcons);
        this.focusIcon(focusedIconIndex);
        return disposables;
    }
    focusIcon(index) {
        const existing = this.renderedIcons[this.focusedItemIndex];
        if (existing) {
            existing.element.classList.remove('focused');
        }
        this.focusedItemIndex = index;
        const renderedItem = this.renderedIcons[index];
        if (renderedItem) {
            renderedItem.element.classList.add('focused');
        }
        if (this.inputBox) {
            if (renderedItem) {
                this.inputBox.inputElement.setAttribute('aria-activedescendant', renderedItem.element.id);
            }
            else {
                this.inputBox.inputElement.removeAttribute('aria-activedescendant');
            }
        }
        if (this.iconIdElement) {
            if (renderedItem) {
                this.iconIdElement.set(renderedItem.icon.id, renderedItem.highlightMatches);
            }
            else {
                this.iconIdElement.set('');
            }
        }
        this.reveal(index);
    }
    reveal(index) {
        if (!this.scrollableElement) {
            return;
        }
        if (index < 0 || index >= this.renderedIcons.length) {
            return;
        }
        const element = this.renderedIcons[index].element;
        if (!element) {
            return;
        }
        const { height } = this.scrollableElement.getScrollDimensions();
        const { scrollTop } = this.scrollableElement.getScrollPosition();
        if (element.offsetTop + this.iconContainerHeight > scrollTop + height) {
            this.scrollableElement.setScrollPosition({ scrollTop: element.offsetTop + this.iconContainerHeight - height });
        }
        else if (element.offsetTop < scrollTop) {
            this.scrollableElement.setScrollPosition({ scrollTop: element.offsetTop });
        }
    }
    matchesContiguous(word, wordToMatchAgainst) {
        const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
        if (matchIndex !== -1) {
            return [{ start: matchIndex, end: matchIndex + word.length }];
        }
        return null;
    }
    layout(dimension) {
        this.domNode.style.width = `${dimension.width}px`;
        this.domNode.style.height = `${dimension.height}px`;
        const iconsContainerWidth = dimension.width - 30;
        this.numberOfElementsPerRow = Math.floor(iconsContainerWidth / this.iconContainerWidth);
        if (this.numberOfElementsPerRow === 0) {
            throw new Error('Insufficient width');
        }
        const extraSpace = iconsContainerWidth % this.iconContainerWidth;
        const iconElementMargin = Math.floor(extraSpace / this.numberOfElementsPerRow);
        for (const { element } of this.renderedIcons) {
            element.style.marginRight = `${iconElementMargin}px`;
        }
        const containerPadding = extraSpace % this.numberOfElementsPerRow;
        if (this.iconsContainer) {
            this.iconsContainer.style.paddingLeft = `${Math.floor(containerPadding / 2)}px`;
            this.iconsContainer.style.paddingRight = `${Math.ceil(containerPadding / 2)}px`;
        }
        if (this.scrollableElement) {
            this.scrollableElement.getDomNode().style.height = `${this.iconIdElement ? dimension.height - 80 : dimension.height - 40}px`;
            this.scrollableElement.scanDomNode();
        }
    }
    getFocus() {
        return [this.focusedItemIndex];
    }
    setSelection(index) {
        if (index < 0 || index >= this.renderedIcons.length) {
            throw new Error(`Invalid index ${index}`);
        }
        this.focusIcon(index);
        this._onDidSelect.fire(this.renderedIcons[index].icon);
    }
    clearInput() {
        if (this.inputBox) {
            this.inputBox.value = '';
        }
    }
    focus() {
        this.inputBox?.focus();
        this.focusIcon(0);
    }
    focusNext() {
        this.focusIcon((this.focusedItemIndex + 1) % this.renderedIcons.length);
    }
    focusPrevious() {
        this.focusIcon((this.focusedItemIndex - 1 + this.renderedIcons.length) % this.renderedIcons.length);
    }
    focusNextRow() {
        let nextRowIndex = this.focusedItemIndex + this.numberOfElementsPerRow;
        if (nextRowIndex >= this.renderedIcons.length) {
            nextRowIndex = (nextRowIndex + 1) % this.numberOfElementsPerRow;
            nextRowIndex = nextRowIndex >= this.renderedIcons.length ? 0 : nextRowIndex;
        }
        this.focusIcon(nextRowIndex);
    }
    focusPreviousRow() {
        let previousRowIndex = this.focusedItemIndex - this.numberOfElementsPerRow;
        if (previousRowIndex < 0) {
            const numberOfRows = Math.floor(this.renderedIcons.length / this.numberOfElementsPerRow);
            previousRowIndex = this.focusedItemIndex + (this.numberOfElementsPerRow * numberOfRows) - 1;
            previousRowIndex = previousRowIndex < 0
                ? this.renderedIcons.length - 1
                : previousRowIndex >= this.renderedIcons.length
                    ? previousRowIndex - this.numberOfElementsPerRow
                    : previousRowIndex;
        }
        this.focusIcon(previousRowIndex);
    }
    getFocusedIcon() {
        return this.renderedIcons[this.focusedItemIndex].icon;
    }
}
