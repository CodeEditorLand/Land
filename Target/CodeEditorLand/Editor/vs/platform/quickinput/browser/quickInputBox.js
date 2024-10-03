import * as dom from '../../../base/browser/dom.js';
import { FindInput } from '../../../base/browser/ui/findinput/findInput.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import Severity from '../../../base/common/severity.js';
import './media/quickInput.css';
const $ = dom.$;
export class QuickInputBox extends Disposable {
    constructor(parent, inputBoxStyles, toggleStyles) {
        super();
        this.parent = parent;
        this.onKeyDown = (handler) => {
            return dom.addStandardDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.KEY_DOWN, handler);
        };
        this.onMouseDown = (handler) => {
            return dom.addStandardDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.MOUSE_DOWN, handler);
        };
        this.onDidChange = (handler) => {
            return this.findInput.onDidChange(handler);
        };
        this.container = dom.append(this.parent, $('.quick-input-box'));
        this.findInput = this._register(new FindInput(this.container, undefined, { label: '', inputBoxStyles, toggleStyles }));
        const input = this.findInput.inputBox.inputElement;
        input.role = 'combobox';
        input.ariaHasPopup = 'menu';
        input.ariaAutoComplete = 'list';
        input.ariaExpanded = 'true';
    }
    get value() {
        return this.findInput.getValue();
    }
    set value(value) {
        this.findInput.setValue(value);
    }
    select(range = null) {
        this.findInput.inputBox.select(range);
    }
    getSelection() {
        return this.findInput.inputBox.getSelection();
    }
    isSelectionAtEnd() {
        return this.findInput.inputBox.isSelectionAtEnd();
    }
    setPlaceholder(placeholder) {
        this.findInput.inputBox.setPlaceHolder(placeholder);
    }
    get placeholder() {
        return this.findInput.inputBox.inputElement.getAttribute('placeholder') || '';
    }
    set placeholder(placeholder) {
        this.findInput.inputBox.setPlaceHolder(placeholder);
    }
    get password() {
        return this.findInput.inputBox.inputElement.type === 'password';
    }
    set password(password) {
        this.findInput.inputBox.inputElement.type = password ? 'password' : 'text';
    }
    set enabled(enabled) {
        this.findInput.inputBox.inputElement.toggleAttribute('readonly', !enabled);
    }
    set toggles(toggles) {
        this.findInput.setAdditionalToggles(toggles);
    }
    hasFocus() {
        return this.findInput.inputBox.hasFocus();
    }
    setAttribute(name, value) {
        this.findInput.inputBox.inputElement.setAttribute(name, value);
    }
    removeAttribute(name) {
        this.findInput.inputBox.inputElement.removeAttribute(name);
    }
    showDecoration(decoration) {
        if (decoration === Severity.Ignore) {
            this.findInput.clearMessage();
        }
        else {
            this.findInput.showMessage({ type: decoration === Severity.Info ? 1 : decoration === Severity.Warning ? 2 : 3, content: '' });
        }
    }
    stylesForType(decoration) {
        return this.findInput.inputBox.stylesForType(decoration === Severity.Info ? 1 : decoration === Severity.Warning ? 2 : 3);
    }
    setFocus() {
        this.findInput.focus();
    }
    layout() {
        this.findInput.inputBox.layout();
    }
}
