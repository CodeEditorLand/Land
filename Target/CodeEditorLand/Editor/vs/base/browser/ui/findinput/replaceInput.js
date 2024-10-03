import * as dom from '../../dom.js';
import { Toggle } from '../toggle/toggle.js';
import { HistoryInputBox } from '../inputbox/inputBox.js';
import { Widget } from '../widget.js';
import { Codicon } from '../../../common/codicons.js';
import { Emitter } from '../../../common/event.js';
import './findInput.css';
import * as nls from '../../../../nls.js';
import { getDefaultHoverDelegate } from '../hover/hoverDelegateFactory.js';
const NLS_DEFAULT_LABEL = nls.localize('defaultLabel', "input");
const NLS_PRESERVE_CASE_LABEL = nls.localize('label.preserveCaseToggle', "Preserve Case");
class PreserveCaseToggle extends Toggle {
    constructor(opts) {
        super({
            icon: Codicon.preserveCase,
            title: NLS_PRESERVE_CASE_LABEL + opts.appendTitle,
            isChecked: opts.isChecked,
            hoverDelegate: opts.hoverDelegate ?? getDefaultHoverDelegate('element'),
            inputActiveOptionBorder: opts.inputActiveOptionBorder,
            inputActiveOptionForeground: opts.inputActiveOptionForeground,
            inputActiveOptionBackground: opts.inputActiveOptionBackground,
        });
    }
}
export class ReplaceInput extends Widget {
    static { this.OPTION_CHANGE = 'optionChange'; }
    constructor(parent, contextViewProvider, _showOptionButtons, options) {
        super();
        this._showOptionButtons = _showOptionButtons;
        this.fixFocusOnOptionClickEnabled = true;
        this.cachedOptionsWidth = 0;
        this._onDidOptionChange = this._register(new Emitter());
        this.onDidOptionChange = this._onDidOptionChange.event;
        this._onKeyDown = this._register(new Emitter());
        this.onKeyDown = this._onKeyDown.event;
        this._onMouseDown = this._register(new Emitter());
        this.onMouseDown = this._onMouseDown.event;
        this._onInput = this._register(new Emitter());
        this.onInput = this._onInput.event;
        this._onKeyUp = this._register(new Emitter());
        this.onKeyUp = this._onKeyUp.event;
        this._onPreserveCaseKeyDown = this._register(new Emitter());
        this.onPreserveCaseKeyDown = this._onPreserveCaseKeyDown.event;
        this._lastHighlightFindOptions = 0;
        this.contextViewProvider = contextViewProvider;
        this.placeholder = options.placeholder || '';
        this.validation = options.validation;
        this.label = options.label || NLS_DEFAULT_LABEL;
        const appendPreserveCaseLabel = options.appendPreserveCaseLabel || '';
        const history = options.history || [];
        const flexibleHeight = !!options.flexibleHeight;
        const flexibleWidth = !!options.flexibleWidth;
        const flexibleMaxHeight = options.flexibleMaxHeight;
        this.domNode = document.createElement('div');
        this.domNode.classList.add('monaco-findInput');
        this.inputBox = this._register(new HistoryInputBox(this.domNode, this.contextViewProvider, {
            ariaLabel: this.label || '',
            placeholder: this.placeholder || '',
            validationOptions: {
                validation: this.validation
            },
            history,
            showHistoryHint: options.showHistoryHint,
            flexibleHeight,
            flexibleWidth,
            flexibleMaxHeight,
            inputBoxStyles: options.inputBoxStyles
        }));
        this.preserveCase = this._register(new PreserveCaseToggle({
            appendTitle: appendPreserveCaseLabel,
            isChecked: false,
            ...options.toggleStyles
        }));
        this._register(this.preserveCase.onChange(viaKeyboard => {
            this._onDidOptionChange.fire(viaKeyboard);
            if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                this.inputBox.focus();
            }
            this.validate();
        }));
        this._register(this.preserveCase.onKeyDown(e => {
            this._onPreserveCaseKeyDown.fire(e);
        }));
        if (this._showOptionButtons) {
            this.cachedOptionsWidth = this.preserveCase.width();
        }
        else {
            this.cachedOptionsWidth = 0;
        }
        const indexes = [this.preserveCase.domNode];
        this.onkeydown(this.domNode, (event) => {
            if (event.equals(15) || event.equals(17) || event.equals(9)) {
                const index = indexes.indexOf(this.domNode.ownerDocument.activeElement);
                if (index >= 0) {
                    let newIndex = -1;
                    if (event.equals(17)) {
                        newIndex = (index + 1) % indexes.length;
                    }
                    else if (event.equals(15)) {
                        if (index === 0) {
                            newIndex = indexes.length - 1;
                        }
                        else {
                            newIndex = index - 1;
                        }
                    }
                    if (event.equals(9)) {
                        indexes[index].blur();
                        this.inputBox.focus();
                    }
                    else if (newIndex >= 0) {
                        indexes[newIndex].focus();
                    }
                    dom.EventHelper.stop(event, true);
                }
            }
        });
        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.style.display = this._showOptionButtons ? 'block' : 'none';
        controls.appendChild(this.preserveCase.domNode);
        this.domNode.appendChild(controls);
        parent?.appendChild(this.domNode);
        this.onkeydown(this.inputBox.inputElement, (e) => this._onKeyDown.fire(e));
        this.onkeyup(this.inputBox.inputElement, (e) => this._onKeyUp.fire(e));
        this.oninput(this.inputBox.inputElement, (e) => this._onInput.fire());
        this.onmousedown(this.inputBox.inputElement, (e) => this._onMouseDown.fire(e));
    }
    enable() {
        this.domNode.classList.remove('disabled');
        this.inputBox.enable();
        this.preserveCase.enable();
    }
    disable() {
        this.domNode.classList.add('disabled');
        this.inputBox.disable();
        this.preserveCase.disable();
    }
    setFocusInputOnOptionClick(value) {
        this.fixFocusOnOptionClickEnabled = value;
    }
    setEnabled(enabled) {
        if (enabled) {
            this.enable();
        }
        else {
            this.disable();
        }
    }
    clear() {
        this.clearValidation();
        this.setValue('');
        this.focus();
    }
    getValue() {
        return this.inputBox.value;
    }
    setValue(value) {
        if (this.inputBox.value !== value) {
            this.inputBox.value = value;
        }
    }
    onSearchSubmit() {
        this.inputBox.addToHistory();
    }
    applyStyles() {
    }
    select() {
        this.inputBox.select();
    }
    focus() {
        this.inputBox.focus();
    }
    getPreserveCase() {
        return this.preserveCase.checked;
    }
    setPreserveCase(value) {
        this.preserveCase.checked = value;
    }
    focusOnPreserve() {
        this.preserveCase.focus();
    }
    highlightFindOptions() {
        this.domNode.classList.remove('highlight-' + (this._lastHighlightFindOptions));
        this._lastHighlightFindOptions = 1 - this._lastHighlightFindOptions;
        this.domNode.classList.add('highlight-' + (this._lastHighlightFindOptions));
    }
    validate() {
        this.inputBox?.validate();
    }
    showMessage(message) {
        this.inputBox?.showMessage(message);
    }
    clearMessage() {
        this.inputBox?.hideMessage();
    }
    clearValidation() {
        this.inputBox?.hideMessage();
    }
    set width(newWidth) {
        this.inputBox.paddingRight = this.cachedOptionsWidth;
        this.domNode.style.width = newWidth + 'px';
    }
    dispose() {
        super.dispose();
    }
}
