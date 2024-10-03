import * as dom from '../../dom.js';
import { DomEmitter } from '../../event.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
import { renderMarkdown } from '../../markdownRenderer.js';
import { getBaseLayerHoverDelegate } from '../hover/hoverDelegate2.js';
import { getDefaultHoverDelegate } from '../hover/hoverDelegateFactory.js';
import { List } from '../list/listWidget.js';
import * as arrays from '../../../common/arrays.js';
import { Emitter, Event } from '../../../common/event.js';
import { KeyCodeUtils } from '../../../common/keyCodes.js';
import { Disposable } from '../../../common/lifecycle.js';
import { isMacintosh } from '../../../common/platform.js';
import './selectBoxCustom.css';
import { localize } from '../../../../nls.js';
const $ = dom.$;
const SELECT_OPTION_ENTRY_TEMPLATE_ID = 'selectOption.entry.template';
class SelectListRenderer {
    get templateId() { return SELECT_OPTION_ENTRY_TEMPLATE_ID; }
    renderTemplate(container) {
        const data = Object.create(null);
        data.root = container;
        data.text = dom.append(container, $('.option-text'));
        data.detail = dom.append(container, $('.option-detail'));
        data.decoratorRight = dom.append(container, $('.option-decorator-right'));
        return data;
    }
    renderElement(element, index, templateData) {
        const data = templateData;
        const text = element.text;
        const detail = element.detail;
        const decoratorRight = element.decoratorRight;
        const isDisabled = element.isDisabled;
        data.text.textContent = text;
        data.detail.textContent = !!detail ? detail : '';
        data.decoratorRight.innerText = !!decoratorRight ? decoratorRight : '';
        if (isDisabled) {
            data.root.classList.add('option-disabled');
        }
        else {
            data.root.classList.remove('option-disabled');
        }
    }
    disposeTemplate(_templateData) {
    }
}
export class SelectBoxList extends Disposable {
    static { this.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN = 32; }
    static { this.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN = 2; }
    static { this.DEFAULT_MINIMUM_VISIBLE_OPTIONS = 3; }
    constructor(options, selected, contextViewProvider, styles, selectBoxOptions) {
        super();
        this.options = [];
        this._currentSelection = 0;
        this._hasDetails = false;
        this._skipLayout = false;
        this._sticky = false;
        this._isVisible = false;
        this.styles = styles;
        this.selectBoxOptions = selectBoxOptions || Object.create(null);
        if (typeof this.selectBoxOptions.minBottomMargin !== 'number') {
            this.selectBoxOptions.minBottomMargin = SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN;
        }
        else if (this.selectBoxOptions.minBottomMargin < 0) {
            this.selectBoxOptions.minBottomMargin = 0;
        }
        this.selectElement = document.createElement('select');
        this.selectElement.className = 'monaco-select-box monaco-select-box-dropdown-padding';
        if (typeof this.selectBoxOptions.ariaLabel === 'string') {
            this.selectElement.setAttribute('aria-label', this.selectBoxOptions.ariaLabel);
        }
        if (typeof this.selectBoxOptions.ariaDescription === 'string') {
            this.selectElement.setAttribute('aria-description', this.selectBoxOptions.ariaDescription);
        }
        this._onDidSelect = new Emitter();
        this._register(this._onDidSelect);
        this.registerListeners();
        this.constructSelectDropDown(contextViewProvider);
        this.selected = selected || 0;
        if (options) {
            this.setOptions(options, selected);
        }
        this.initStyleSheet();
    }
    setTitle(title) {
        if (!this._hover && title) {
            this._hover = this._register(getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate('mouse'), this.selectElement, title));
        }
        else if (this._hover) {
            this._hover.update(title);
        }
    }
    getHeight() {
        return 22;
    }
    getTemplateId() {
        return SELECT_OPTION_ENTRY_TEMPLATE_ID;
    }
    constructSelectDropDown(contextViewProvider) {
        this.contextViewProvider = contextViewProvider;
        this.selectDropDownContainer = dom.$('.monaco-select-box-dropdown-container');
        this.selectDropDownContainer.classList.add('monaco-select-box-dropdown-padding');
        this.selectionDetailsPane = dom.append(this.selectDropDownContainer, $('.select-box-details-pane'));
        const widthControlOuterDiv = dom.append(this.selectDropDownContainer, $('.select-box-dropdown-container-width-control'));
        const widthControlInnerDiv = dom.append(widthControlOuterDiv, $('.width-control-div'));
        this.widthControlElement = document.createElement('span');
        this.widthControlElement.className = 'option-text-width-control';
        dom.append(widthControlInnerDiv, this.widthControlElement);
        this._dropDownPosition = 0;
        this.styleElement = dom.createStyleSheet(this.selectDropDownContainer);
        this.selectDropDownContainer.setAttribute('draggable', 'true');
        this._register(dom.addDisposableListener(this.selectDropDownContainer, dom.EventType.DRAG_START, (e) => {
            dom.EventHelper.stop(e, true);
        }));
    }
    registerListeners() {
        this._register(dom.addStandardDisposableListener(this.selectElement, 'change', (e) => {
            this.selected = e.target.selectedIndex;
            this._onDidSelect.fire({
                index: e.target.selectedIndex,
                selected: e.target.value
            });
            if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                this.setTitle(this.options[this.selected].text);
            }
        }));
        this._register(dom.addDisposableListener(this.selectElement, dom.EventType.CLICK, (e) => {
            dom.EventHelper.stop(e);
            if (this._isVisible) {
                this.hideSelectDropDown(true);
            }
            else {
                this.showSelectDropDown();
            }
        }));
        this._register(dom.addDisposableListener(this.selectElement, dom.EventType.MOUSE_DOWN, (e) => {
            dom.EventHelper.stop(e);
        }));
        let listIsVisibleOnTouchStart;
        this._register(dom.addDisposableListener(this.selectElement, 'touchstart', (e) => {
            listIsVisibleOnTouchStart = this._isVisible;
        }));
        this._register(dom.addDisposableListener(this.selectElement, 'touchend', (e) => {
            dom.EventHelper.stop(e);
            if (listIsVisibleOnTouchStart) {
                this.hideSelectDropDown(true);
            }
            else {
                this.showSelectDropDown();
            }
        }));
        this._register(dom.addDisposableListener(this.selectElement, dom.EventType.KEY_DOWN, (e) => {
            const event = new StandardKeyboardEvent(e);
            let showDropDown = false;
            if (isMacintosh) {
                if (event.keyCode === 18 || event.keyCode === 16 || event.keyCode === 10 || event.keyCode === 3) {
                    showDropDown = true;
                }
            }
            else {
                if (event.keyCode === 18 && event.altKey || event.keyCode === 16 && event.altKey || event.keyCode === 10 || event.keyCode === 3) {
                    showDropDown = true;
                }
            }
            if (showDropDown) {
                this.showSelectDropDown();
                dom.EventHelper.stop(e, true);
            }
        }));
    }
    get onDidSelect() {
        return this._onDidSelect.event;
    }
    setOptions(options, selected) {
        if (!arrays.equals(this.options, options)) {
            this.options = options;
            this.selectElement.options.length = 0;
            this._hasDetails = false;
            this._cachedMaxDetailsHeight = undefined;
            this.options.forEach((option, index) => {
                this.selectElement.add(this.createOption(option.text, index, option.isDisabled));
                if (typeof option.description === 'string') {
                    this._hasDetails = true;
                }
            });
        }
        if (selected !== undefined) {
            this.select(selected);
            this._currentSelection = this.selected;
        }
    }
    setEnabled(enable) {
        this.selectElement.disabled = !enable;
    }
    setOptionsList() {
        this.selectList?.splice(0, this.selectList.length, this.options);
    }
    select(index) {
        if (index >= 0 && index < this.options.length) {
            this.selected = index;
        }
        else if (index > this.options.length - 1) {
            this.select(this.options.length - 1);
        }
        else if (this.selected < 0) {
            this.selected = 0;
        }
        this.selectElement.selectedIndex = this.selected;
        if (!!this.options[this.selected] && !!this.options[this.selected].text) {
            this.setTitle(this.options[this.selected].text);
        }
    }
    setAriaLabel(label) {
        this.selectBoxOptions.ariaLabel = label;
        this.selectElement.setAttribute('aria-label', this.selectBoxOptions.ariaLabel);
    }
    focus() {
        if (this.selectElement) {
            this.selectElement.tabIndex = 0;
            this.selectElement.focus();
        }
    }
    blur() {
        if (this.selectElement) {
            this.selectElement.tabIndex = -1;
            this.selectElement.blur();
        }
    }
    setFocusable(focusable) {
        this.selectElement.tabIndex = focusable ? 0 : -1;
    }
    render(container) {
        this.container = container;
        container.classList.add('select-container');
        container.appendChild(this.selectElement);
        this.styleSelectElement();
    }
    initStyleSheet() {
        const content = [];
        if (this.styles.listFocusBackground) {
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { background-color: ${this.styles.listFocusBackground} !important; }`);
        }
        if (this.styles.listFocusForeground) {
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { color: ${this.styles.listFocusForeground} !important; }`);
        }
        if (this.styles.decoratorRightForeground) {
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.focused) .option-decorator-right { color: ${this.styles.decoratorRightForeground}; }`);
        }
        if (this.styles.selectBackground && this.styles.selectBorder && this.styles.selectBorder !== this.styles.selectBackground) {
            content.push(`.monaco-select-box-dropdown-container { border: 1px solid ${this.styles.selectBorder} } `);
            content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectBorder} } `);
            content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectBorder} } `);
        }
        else if (this.styles.selectListBorder) {
            content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectListBorder} } `);
            content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectListBorder} } `);
        }
        if (this.styles.listHoverForeground) {
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { color: ${this.styles.listHoverForeground} !important; }`);
        }
        if (this.styles.listHoverBackground) {
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { background-color: ${this.styles.listHoverBackground} !important; }`);
        }
        if (this.styles.listFocusOutline) {
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { outline: 1.6px dotted ${this.styles.listFocusOutline} !important; outline-offset: -1.6px !important; }`);
        }
        if (this.styles.listHoverOutline) {
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { outline: 1.6px dashed ${this.styles.listHoverOutline} !important; outline-offset: -1.6px !important; }`);
        }
        content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled.focused { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
        content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled:hover { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
        this.styleElement.textContent = content.join('\n');
    }
    styleSelectElement() {
        const background = this.styles.selectBackground ?? '';
        const foreground = this.styles.selectForeground ?? '';
        const border = this.styles.selectBorder ?? '';
        this.selectElement.style.backgroundColor = background;
        this.selectElement.style.color = foreground;
        this.selectElement.style.borderColor = border;
    }
    styleList() {
        const background = this.styles.selectBackground ?? '';
        const listBackground = dom.asCssValueWithDefault(this.styles.selectListBackground, background);
        this.selectDropDownListContainer.style.backgroundColor = listBackground;
        this.selectionDetailsPane.style.backgroundColor = listBackground;
        const optionsBorder = this.styles.focusBorder ?? '';
        this.selectDropDownContainer.style.outlineColor = optionsBorder;
        this.selectDropDownContainer.style.outlineOffset = '-1px';
        this.selectList.style(this.styles);
    }
    createOption(value, index, disabled) {
        const option = document.createElement('option');
        option.value = value;
        option.text = value;
        option.disabled = !!disabled;
        return option;
    }
    showSelectDropDown() {
        this.selectionDetailsPane.innerText = '';
        if (!this.contextViewProvider || this._isVisible) {
            return;
        }
        this.createSelectList(this.selectDropDownContainer);
        this.setOptionsList();
        this.contextViewProvider.showContextView({
            getAnchor: () => this.selectElement,
            render: (container) => this.renderSelectDropDown(container, true),
            layout: () => {
                this.layoutSelectDropDown();
            },
            onHide: () => {
                this.selectDropDownContainer.classList.remove('visible');
                this.selectElement.classList.remove('synthetic-focus');
            },
            anchorPosition: this._dropDownPosition
        }, this.selectBoxOptions.optionsAsChildren ? this.container : undefined);
        this._isVisible = true;
        this.hideSelectDropDown(false);
        this.contextViewProvider.showContextView({
            getAnchor: () => this.selectElement,
            render: (container) => this.renderSelectDropDown(container),
            layout: () => this.layoutSelectDropDown(),
            onHide: () => {
                this.selectDropDownContainer.classList.remove('visible');
                this.selectElement.classList.remove('synthetic-focus');
            },
            anchorPosition: this._dropDownPosition
        }, this.selectBoxOptions.optionsAsChildren ? this.container : undefined);
        this._currentSelection = this.selected;
        this._isVisible = true;
        this.selectElement.setAttribute('aria-expanded', 'true');
    }
    hideSelectDropDown(focusSelect) {
        if (!this.contextViewProvider || !this._isVisible) {
            return;
        }
        this._isVisible = false;
        this.selectElement.setAttribute('aria-expanded', 'false');
        if (focusSelect) {
            this.selectElement.focus();
        }
        this.contextViewProvider.hideContextView();
    }
    renderSelectDropDown(container, preLayoutPosition) {
        container.appendChild(this.selectDropDownContainer);
        this.layoutSelectDropDown(preLayoutPosition);
        return {
            dispose: () => {
                this.selectDropDownContainer.remove();
            }
        };
    }
    measureMaxDetailsHeight() {
        let maxDetailsPaneHeight = 0;
        this.options.forEach((_option, index) => {
            this.updateDetail(index);
            if (this.selectionDetailsPane.offsetHeight > maxDetailsPaneHeight) {
                maxDetailsPaneHeight = this.selectionDetailsPane.offsetHeight;
            }
        });
        return maxDetailsPaneHeight;
    }
    layoutSelectDropDown(preLayoutPosition) {
        if (this._skipLayout) {
            return false;
        }
        if (this.selectList) {
            this.selectDropDownContainer.classList.add('visible');
            const window = dom.getWindow(this.selectElement);
            const selectPosition = dom.getDomNodePagePosition(this.selectElement);
            const styles = dom.getWindow(this.selectElement).getComputedStyle(this.selectElement);
            const verticalPadding = parseFloat(styles.getPropertyValue('--dropdown-padding-top')) + parseFloat(styles.getPropertyValue('--dropdown-padding-bottom'));
            const maxSelectDropDownHeightBelow = (window.innerHeight - selectPosition.top - selectPosition.height - (this.selectBoxOptions.minBottomMargin || 0));
            const maxSelectDropDownHeightAbove = (selectPosition.top - SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN);
            const selectWidth = this.selectElement.offsetWidth;
            const selectMinWidth = this.setWidthControlElement(this.widthControlElement);
            const selectOptimalWidth = Math.max(selectMinWidth, Math.round(selectWidth)).toString() + 'px';
            this.selectDropDownContainer.style.width = selectOptimalWidth;
            this.selectList.getHTMLElement().style.height = '';
            this.selectList.layout();
            let listHeight = this.selectList.contentHeight;
            if (this._hasDetails && this._cachedMaxDetailsHeight === undefined) {
                this._cachedMaxDetailsHeight = this.measureMaxDetailsHeight();
            }
            const maxDetailsPaneHeight = this._hasDetails ? this._cachedMaxDetailsHeight : 0;
            const minRequiredDropDownHeight = listHeight + verticalPadding + maxDetailsPaneHeight;
            const maxVisibleOptionsBelow = ((Math.floor((maxSelectDropDownHeightBelow - verticalPadding - maxDetailsPaneHeight) / this.getHeight())));
            const maxVisibleOptionsAbove = ((Math.floor((maxSelectDropDownHeightAbove - verticalPadding - maxDetailsPaneHeight) / this.getHeight())));
            if (preLayoutPosition) {
                if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22)
                    || selectPosition.top < SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN
                    || ((maxVisibleOptionsBelow < 1) && (maxVisibleOptionsAbove < 1))) {
                    return false;
                }
                if (maxVisibleOptionsBelow < SelectBoxList.DEFAULT_MINIMUM_VISIBLE_OPTIONS
                    && maxVisibleOptionsAbove > maxVisibleOptionsBelow
                    && this.options.length > maxVisibleOptionsBelow) {
                    this._dropDownPosition = 1;
                    this.selectDropDownListContainer.remove();
                    this.selectionDetailsPane.remove();
                    this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
                    this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
                    this.selectionDetailsPane.classList.remove('border-top');
                    this.selectionDetailsPane.classList.add('border-bottom');
                }
                else {
                    this._dropDownPosition = 0;
                    this.selectDropDownListContainer.remove();
                    this.selectionDetailsPane.remove();
                    this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
                    this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
                    this.selectionDetailsPane.classList.remove('border-bottom');
                    this.selectionDetailsPane.classList.add('border-top');
                }
                return true;
            }
            if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22)
                || selectPosition.top < SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN
                || (this._dropDownPosition === 0 && maxVisibleOptionsBelow < 1)
                || (this._dropDownPosition === 1 && maxVisibleOptionsAbove < 1)) {
                this.hideSelectDropDown(true);
                return false;
            }
            if (this._dropDownPosition === 0) {
                if (this._isVisible && maxVisibleOptionsBelow + maxVisibleOptionsAbove < 1) {
                    this.hideSelectDropDown(true);
                    return false;
                }
                if (minRequiredDropDownHeight > maxSelectDropDownHeightBelow) {
                    listHeight = (maxVisibleOptionsBelow * this.getHeight());
                }
            }
            else {
                if (minRequiredDropDownHeight > maxSelectDropDownHeightAbove) {
                    listHeight = (maxVisibleOptionsAbove * this.getHeight());
                }
            }
            this.selectList.layout(listHeight);
            this.selectList.domFocus();
            if (this.selectList.length > 0) {
                this.selectList.setFocus([this.selected || 0]);
                this.selectList.reveal(this.selectList.getFocus()[0] || 0);
            }
            if (this._hasDetails) {
                this.selectList.getHTMLElement().style.height = (listHeight + verticalPadding) + 'px';
                this.selectDropDownContainer.style.height = '';
            }
            else {
                this.selectDropDownContainer.style.height = (listHeight + verticalPadding) + 'px';
            }
            this.updateDetail(this.selected);
            this.selectDropDownContainer.style.width = selectOptimalWidth;
            this.selectDropDownListContainer.setAttribute('tabindex', '0');
            this.selectElement.classList.add('synthetic-focus');
            this.selectDropDownContainer.classList.add('synthetic-focus');
            return true;
        }
        else {
            return false;
        }
    }
    setWidthControlElement(container) {
        let elementWidth = 0;
        if (container) {
            let longest = 0;
            let longestLength = 0;
            this.options.forEach((option, index) => {
                const detailLength = !!option.detail ? option.detail.length : 0;
                const rightDecoratorLength = !!option.decoratorRight ? option.decoratorRight.length : 0;
                const len = option.text.length + detailLength + rightDecoratorLength;
                if (len > longestLength) {
                    longest = index;
                    longestLength = len;
                }
            });
            container.textContent = this.options[longest].text + (!!this.options[longest].decoratorRight ? (this.options[longest].decoratorRight + ' ') : '');
            elementWidth = dom.getTotalWidth(container);
        }
        return elementWidth;
    }
    createSelectList(parent) {
        if (this.selectList) {
            return;
        }
        this.selectDropDownListContainer = dom.append(parent, $('.select-box-dropdown-list-container'));
        this.listRenderer = new SelectListRenderer();
        this.selectList = this._register(new List('SelectBoxCustom', this.selectDropDownListContainer, this, [this.listRenderer], {
            useShadows: false,
            verticalScrollMode: 3,
            keyboardSupport: false,
            mouseSupport: false,
            accessibilityProvider: {
                getAriaLabel: element => {
                    let label = element.text;
                    if (element.detail) {
                        label += `. ${element.detail}`;
                    }
                    if (element.decoratorRight) {
                        label += `. ${element.decoratorRight}`;
                    }
                    if (element.description) {
                        label += `. ${element.description}`;
                    }
                    return label;
                },
                getWidgetAriaLabel: () => localize({ key: 'selectBox', comment: ['Behave like native select dropdown element.'] }, "Select Box"),
                getRole: () => isMacintosh ? '' : 'option',
                getWidgetRole: () => 'listbox'
            }
        }));
        if (this.selectBoxOptions.ariaLabel) {
            this.selectList.ariaLabel = this.selectBoxOptions.ariaLabel;
        }
        const onKeyDown = this._register(new DomEmitter(this.selectDropDownListContainer, 'keydown'));
        const onSelectDropDownKeyDown = Event.chain(onKeyDown.event, $ => $.filter(() => this.selectList.length > 0)
            .map(e => new StandardKeyboardEvent(e)));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 3))(this.onEnter, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 2))(this.onEnter, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 9))(this.onEscape, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 16))(this.onUpArrow, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 18))(this.onDownArrow, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 12))(this.onPageDown, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 11))(this.onPageUp, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 14))(this.onHome, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 13))(this.onEnd, this));
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => (e.keyCode >= 21 && e.keyCode <= 56) || (e.keyCode >= 85 && e.keyCode <= 113)))(this.onCharacter, this));
        this._register(dom.addDisposableListener(this.selectList.getHTMLElement(), dom.EventType.POINTER_UP, e => this.onPointerUp(e)));
        this._register(this.selectList.onMouseOver(e => typeof e.index !== 'undefined' && this.selectList.setFocus([e.index])));
        this._register(this.selectList.onDidChangeFocus(e => this.onListFocus(e)));
        this._register(dom.addDisposableListener(this.selectDropDownContainer, dom.EventType.FOCUS_OUT, e => {
            if (!this._isVisible || dom.isAncestor(e.relatedTarget, this.selectDropDownContainer)) {
                return;
            }
            this.onListBlur();
        }));
        this.selectList.getHTMLElement().setAttribute('aria-label', this.selectBoxOptions.ariaLabel || '');
        this.selectList.getHTMLElement().setAttribute('aria-expanded', 'true');
        this.styleList();
    }
    onPointerUp(e) {
        if (!this.selectList.length) {
            return;
        }
        dom.EventHelper.stop(e);
        const target = e.target;
        if (!target) {
            return;
        }
        if (target.classList.contains('slider')) {
            return;
        }
        const listRowElement = target.closest('.monaco-list-row');
        if (!listRowElement) {
            return;
        }
        const index = Number(listRowElement.getAttribute('data-index'));
        const disabled = listRowElement.classList.contains('option-disabled');
        if (index >= 0 && index < this.options.length && !disabled) {
            this.selected = index;
            this.select(this.selected);
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selectList.getFocus()[0]);
            if (this.selected !== this._currentSelection) {
                this._currentSelection = this.selected;
                this._onDidSelect.fire({
                    index: this.selectElement.selectedIndex,
                    selected: this.options[this.selected].text
                });
                if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                    this.setTitle(this.options[this.selected].text);
                }
            }
            this.hideSelectDropDown(true);
        }
    }
    onListBlur() {
        if (this._sticky) {
            return;
        }
        if (this.selected !== this._currentSelection) {
            this.select(this._currentSelection);
        }
        this.hideSelectDropDown(false);
    }
    renderDescriptionMarkdown(text, actionHandler) {
        const cleanRenderedMarkdown = (element) => {
            for (let i = 0; i < element.childNodes.length; i++) {
                const child = element.childNodes.item(i);
                const tagName = child.tagName && child.tagName.toLowerCase();
                if (tagName === 'img') {
                    child.remove();
                }
                else {
                    cleanRenderedMarkdown(child);
                }
            }
        };
        const rendered = renderMarkdown({ value: text, supportThemeIcons: true }, { actionHandler });
        rendered.element.classList.add('select-box-description-markdown');
        cleanRenderedMarkdown(rendered.element);
        return rendered.element;
    }
    onListFocus(e) {
        if (!this._isVisible || !this._hasDetails) {
            return;
        }
        this.updateDetail(e.indexes[0]);
    }
    updateDetail(selectedIndex) {
        this.selectionDetailsPane.innerText = '';
        const option = this.options[selectedIndex];
        const description = option?.description ?? '';
        const descriptionIsMarkdown = option?.descriptionIsMarkdown ?? false;
        if (description) {
            if (descriptionIsMarkdown) {
                const actionHandler = option.descriptionMarkdownActionHandler;
                this.selectionDetailsPane.appendChild(this.renderDescriptionMarkdown(description, actionHandler));
            }
            else {
                this.selectionDetailsPane.innerText = description;
            }
            this.selectionDetailsPane.style.display = 'block';
        }
        else {
            this.selectionDetailsPane.style.display = 'none';
        }
        this._skipLayout = true;
        this.contextViewProvider.layout();
        this._skipLayout = false;
    }
    onEscape(e) {
        dom.EventHelper.stop(e);
        this.select(this._currentSelection);
        this.hideSelectDropDown(true);
    }
    onEnter(e) {
        dom.EventHelper.stop(e);
        if (this.selected !== this._currentSelection) {
            this._currentSelection = this.selected;
            this._onDidSelect.fire({
                index: this.selectElement.selectedIndex,
                selected: this.options[this.selected].text
            });
            if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                this.setTitle(this.options[this.selected].text);
            }
        }
        this.hideSelectDropDown(true);
    }
    onDownArrow(e) {
        if (this.selected < this.options.length - 1) {
            dom.EventHelper.stop(e, true);
            const nextOptionDisabled = this.options[this.selected + 1].isDisabled;
            if (nextOptionDisabled && this.options.length > this.selected + 2) {
                this.selected += 2;
            }
            else if (nextOptionDisabled) {
                return;
            }
            else {
                this.selected++;
            }
            this.select(this.selected);
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selectList.getFocus()[0]);
        }
    }
    onUpArrow(e) {
        if (this.selected > 0) {
            dom.EventHelper.stop(e, true);
            const previousOptionDisabled = this.options[this.selected - 1].isDisabled;
            if (previousOptionDisabled && this.selected > 1) {
                this.selected -= 2;
            }
            else {
                this.selected--;
            }
            this.select(this.selected);
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selectList.getFocus()[0]);
        }
    }
    onPageUp(e) {
        dom.EventHelper.stop(e);
        this.selectList.focusPreviousPage();
        setTimeout(() => {
            this.selected = this.selectList.getFocus()[0];
            if (this.options[this.selected].isDisabled && this.selected < this.options.length - 1) {
                this.selected++;
                this.selectList.setFocus([this.selected]);
            }
            this.selectList.reveal(this.selected);
            this.select(this.selected);
        }, 1);
    }
    onPageDown(e) {
        dom.EventHelper.stop(e);
        this.selectList.focusNextPage();
        setTimeout(() => {
            this.selected = this.selectList.getFocus()[0];
            if (this.options[this.selected].isDisabled && this.selected > 0) {
                this.selected--;
                this.selectList.setFocus([this.selected]);
            }
            this.selectList.reveal(this.selected);
            this.select(this.selected);
        }, 1);
    }
    onHome(e) {
        dom.EventHelper.stop(e);
        if (this.options.length < 2) {
            return;
        }
        this.selected = 0;
        if (this.options[this.selected].isDisabled && this.selected > 1) {
            this.selected++;
        }
        this.selectList.setFocus([this.selected]);
        this.selectList.reveal(this.selected);
        this.select(this.selected);
    }
    onEnd(e) {
        dom.EventHelper.stop(e);
        if (this.options.length < 2) {
            return;
        }
        this.selected = this.options.length - 1;
        if (this.options[this.selected].isDisabled && this.selected > 1) {
            this.selected--;
        }
        this.selectList.setFocus([this.selected]);
        this.selectList.reveal(this.selected);
        this.select(this.selected);
    }
    onCharacter(e) {
        const ch = KeyCodeUtils.toString(e.keyCode);
        let optionIndex = -1;
        for (let i = 0; i < this.options.length - 1; i++) {
            optionIndex = (i + this.selected + 1) % this.options.length;
            if (this.options[optionIndex].text.charAt(0).toUpperCase() === ch && !this.options[optionIndex].isDisabled) {
                this.select(optionIndex);
                this.selectList.setFocus([optionIndex]);
                this.selectList.reveal(this.selectList.getFocus()[0]);
                dom.EventHelper.stop(e);
                break;
            }
        }
    }
    dispose() {
        this.hideSelectDropDown(false);
        super.dispose();
    }
}
