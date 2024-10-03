import { $, addDisposableListener, clearNode, EventHelper, EventType, getWindow, hide, isActiveElement, isAncestor, show } from '../../dom.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
import { ActionBar } from '../actionbar/actionbar.js';
import { ButtonBar, ButtonWithDescription } from '../button/button.js';
import { Checkbox } from '../toggle/toggle.js';
import { InputBox } from '../inputbox/inputBox.js';
import { Action } from '../../../common/actions.js';
import { Codicon } from '../../../common/codicons.js';
import { ThemeIcon } from '../../../common/themables.js';
import { mnemonicButtonLabel } from '../../../common/labels.js';
import { Disposable } from '../../../common/lifecycle.js';
import { isLinux, isMacintosh, isWindows } from '../../../common/platform.js';
import './dialog.css';
import * as nls from '../../../../nls.js';
export class Dialog extends Disposable {
    constructor(container, message, buttons, options) {
        super();
        this.container = container;
        this.message = message;
        this.options = options;
        this.modalElement = this.container.appendChild($(`.monaco-dialog-modal-block.dimmed`));
        this.shadowElement = this.modalElement.appendChild($('.dialog-shadow'));
        this.element = this.shadowElement.appendChild($('.monaco-dialog-box'));
        this.element.setAttribute('role', 'dialog');
        this.element.tabIndex = -1;
        hide(this.element);
        this.buttonStyles = options.buttonStyles;
        if (Array.isArray(buttons) && buttons.length > 0) {
            this.buttons = buttons;
        }
        else if (!this.options.disableDefaultAction) {
            this.buttons = [nls.localize('ok', "OK")];
        }
        else {
            this.buttons = [];
        }
        const buttonsRowElement = this.element.appendChild($('.dialog-buttons-row'));
        this.buttonsContainer = buttonsRowElement.appendChild($('.dialog-buttons'));
        const messageRowElement = this.element.appendChild($('.dialog-message-row'));
        this.iconElement = messageRowElement.appendChild($('#monaco-dialog-icon.dialog-icon'));
        this.iconElement.setAttribute('aria-label', this.getIconAriaLabel());
        this.messageContainer = messageRowElement.appendChild($('.dialog-message-container'));
        if (this.options.detail || this.options.renderBody) {
            const messageElement = this.messageContainer.appendChild($('.dialog-message'));
            const messageTextElement = messageElement.appendChild($('#monaco-dialog-message-text.dialog-message-text'));
            messageTextElement.innerText = this.message;
        }
        this.messageDetailElement = this.messageContainer.appendChild($('#monaco-dialog-message-detail.dialog-message-detail'));
        if (this.options.detail || !this.options.renderBody) {
            this.messageDetailElement.innerText = this.options.detail ? this.options.detail : message;
        }
        else {
            this.messageDetailElement.style.display = 'none';
        }
        if (this.options.renderBody) {
            const customBody = this.messageContainer.appendChild($('#monaco-dialog-message-body.dialog-message-body'));
            this.options.renderBody(customBody);
            for (const el of this.messageContainer.querySelectorAll('a')) {
                el.tabIndex = 0;
            }
        }
        if (this.options.inputs) {
            this.inputs = this.options.inputs.map(input => {
                const inputRowElement = this.messageContainer.appendChild($('.dialog-message-input'));
                const inputBox = this._register(new InputBox(inputRowElement, undefined, {
                    placeholder: input.placeholder,
                    type: input.type ?? 'text',
                    inputBoxStyles: options.inputBoxStyles
                }));
                if (input.value) {
                    inputBox.value = input.value;
                }
                return inputBox;
            });
        }
        else {
            this.inputs = [];
        }
        if (this.options.checkboxLabel) {
            const checkboxRowElement = this.messageContainer.appendChild($('.dialog-checkbox-row'));
            const checkbox = this.checkbox = this._register(new Checkbox(this.options.checkboxLabel, !!this.options.checkboxChecked, options.checkboxStyles));
            checkboxRowElement.appendChild(checkbox.domNode);
            const checkboxMessageElement = checkboxRowElement.appendChild($('.dialog-checkbox-message'));
            checkboxMessageElement.innerText = this.options.checkboxLabel;
            this._register(addDisposableListener(checkboxMessageElement, EventType.CLICK, () => checkbox.checked = !checkbox.checked));
        }
        const toolbarRowElement = this.element.appendChild($('.dialog-toolbar-row'));
        this.toolbarContainer = toolbarRowElement.appendChild($('.dialog-toolbar'));
        this.applyStyles();
    }
    getIconAriaLabel() {
        let typeLabel = nls.localize('dialogInfoMessage', 'Info');
        switch (this.options.type) {
            case 'error':
                typeLabel = nls.localize('dialogErrorMessage', 'Error');
                break;
            case 'warning':
                typeLabel = nls.localize('dialogWarningMessage', 'Warning');
                break;
            case 'pending':
                typeLabel = nls.localize('dialogPendingMessage', 'In Progress');
                break;
            case 'none':
            case 'info':
            case 'question':
            default:
                break;
        }
        return typeLabel;
    }
    updateMessage(message) {
        this.messageDetailElement.innerText = message;
    }
    async show() {
        this.focusToReturn = this.container.ownerDocument.activeElement;
        return new Promise((resolve) => {
            clearNode(this.buttonsContainer);
            const buttonBar = this.buttonBar = this._register(new ButtonBar(this.buttonsContainer));
            const buttonMap = this.rearrangeButtons(this.buttons, this.options.cancelId);
            buttonMap.forEach((entry, index) => {
                const primary = buttonMap[index].index === 0;
                const button = this.options.buttonDetails ? this._register(buttonBar.addButtonWithDescription({ secondary: !primary, ...this.buttonStyles })) : this._register(buttonBar.addButton({ secondary: !primary, ...this.buttonStyles }));
                button.label = mnemonicButtonLabel(buttonMap[index].label, true);
                if (button instanceof ButtonWithDescription) {
                    button.description = this.options.buttonDetails[buttonMap[index].index];
                }
                this._register(button.onDidClick(e => {
                    if (e) {
                        EventHelper.stop(e);
                    }
                    resolve({
                        button: buttonMap[index].index,
                        checkboxChecked: this.checkbox ? this.checkbox.checked : undefined,
                        values: this.inputs.length > 0 ? this.inputs.map(input => input.value) : undefined
                    });
                }));
            });
            const window = getWindow(this.container);
            this._register(addDisposableListener(window, 'keydown', e => {
                const evt = new StandardKeyboardEvent(e);
                if (evt.equals(512)) {
                    evt.preventDefault();
                }
                if (evt.equals(3)) {
                    if (this.inputs.some(input => input.hasFocus())) {
                        EventHelper.stop(e);
                        resolve({
                            button: buttonMap.find(button => button.index !== this.options.cancelId)?.index ?? 0,
                            checkboxChecked: this.checkbox ? this.checkbox.checked : undefined,
                            values: this.inputs.length > 0 ? this.inputs.map(input => input.value) : undefined
                        });
                    }
                    return;
                }
                if (evt.equals(10)) {
                    return;
                }
                let eventHandled = false;
                if (evt.equals(2) || evt.equals(17) || evt.equals(1024 | 2) || evt.equals(15)) {
                    const focusableElements = [];
                    let focusedIndex = -1;
                    if (this.messageContainer) {
                        const links = this.messageContainer.querySelectorAll('a');
                        for (const link of links) {
                            focusableElements.push(link);
                            if (isActiveElement(link)) {
                                focusedIndex = focusableElements.length - 1;
                            }
                        }
                    }
                    for (const input of this.inputs) {
                        focusableElements.push(input);
                        if (input.hasFocus()) {
                            focusedIndex = focusableElements.length - 1;
                        }
                    }
                    if (this.checkbox) {
                        focusableElements.push(this.checkbox);
                        if (this.checkbox.hasFocus()) {
                            focusedIndex = focusableElements.length - 1;
                        }
                    }
                    if (this.buttonBar) {
                        for (const button of this.buttonBar.buttons) {
                            focusableElements.push(button);
                            if (button.hasFocus()) {
                                focusedIndex = focusableElements.length - 1;
                            }
                        }
                    }
                    if (evt.equals(2) || evt.equals(17)) {
                        if (focusedIndex === -1) {
                            focusedIndex = 0;
                        }
                        const newFocusedIndex = (focusedIndex + 1) % focusableElements.length;
                        focusableElements[newFocusedIndex].focus();
                    }
                    else {
                        if (focusedIndex === -1) {
                            focusedIndex = focusableElements.length;
                        }
                        let newFocusedIndex = focusedIndex - 1;
                        if (newFocusedIndex === -1) {
                            newFocusedIndex = focusableElements.length - 1;
                        }
                        focusableElements[newFocusedIndex].focus();
                    }
                    eventHandled = true;
                }
                if (eventHandled) {
                    EventHelper.stop(e, true);
                }
                else if (this.options.keyEventProcessor) {
                    this.options.keyEventProcessor(evt);
                }
            }, true));
            this._register(addDisposableListener(window, 'keyup', e => {
                EventHelper.stop(e, true);
                const evt = new StandardKeyboardEvent(e);
                if (!this.options.disableCloseAction && evt.equals(9)) {
                    resolve({
                        button: this.options.cancelId || 0,
                        checkboxChecked: this.checkbox ? this.checkbox.checked : undefined
                    });
                }
            }, true));
            this._register(addDisposableListener(this.element, 'focusout', e => {
                if (!!e.relatedTarget && !!this.element) {
                    if (!isAncestor(e.relatedTarget, this.element)) {
                        this.focusToReturn = e.relatedTarget;
                        if (e.target) {
                            e.target.focus();
                            EventHelper.stop(e, true);
                        }
                    }
                }
            }, false));
            const spinModifierClassName = 'codicon-modifier-spin';
            this.iconElement.classList.remove(...ThemeIcon.asClassNameArray(Codicon.dialogError), ...ThemeIcon.asClassNameArray(Codicon.dialogWarning), ...ThemeIcon.asClassNameArray(Codicon.dialogInfo), ...ThemeIcon.asClassNameArray(Codicon.loading), spinModifierClassName);
            if (this.options.icon) {
                this.iconElement.classList.add(...ThemeIcon.asClassNameArray(this.options.icon));
            }
            else {
                switch (this.options.type) {
                    case 'error':
                        this.iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.dialogError));
                        break;
                    case 'warning':
                        this.iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.dialogWarning));
                        break;
                    case 'pending':
                        this.iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.loading), spinModifierClassName);
                        break;
                    case 'none':
                        this.iconElement.classList.add('no-codicon');
                        break;
                    case 'info':
                    case 'question':
                    default:
                        this.iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.dialogInfo));
                        break;
                }
            }
            if (!this.options.disableCloseAction) {
                const actionBar = this._register(new ActionBar(this.toolbarContainer, {}));
                const action = this._register(new Action('dialog.close', nls.localize('dialogClose', "Close Dialog"), ThemeIcon.asClassName(Codicon.dialogClose), true, async () => {
                    resolve({
                        button: this.options.cancelId || 0,
                        checkboxChecked: this.checkbox ? this.checkbox.checked : undefined
                    });
                }));
                actionBar.push(action, { icon: true, label: false });
            }
            this.applyStyles();
            this.element.setAttribute('aria-modal', 'true');
            this.element.setAttribute('aria-labelledby', 'monaco-dialog-icon monaco-dialog-message-text');
            this.element.setAttribute('aria-describedby', 'monaco-dialog-icon monaco-dialog-message-text monaco-dialog-message-detail monaco-dialog-message-body');
            show(this.element);
            if (this.inputs.length > 0) {
                this.inputs[0].focus();
                this.inputs[0].select();
            }
            else {
                buttonMap.forEach((value, index) => {
                    if (value.index === 0) {
                        buttonBar.buttons[index].focus();
                    }
                });
            }
        });
    }
    applyStyles() {
        const style = this.options.dialogStyles;
        const fgColor = style.dialogForeground;
        const bgColor = style.dialogBackground;
        const shadowColor = style.dialogShadow ? `0 0px 8px ${style.dialogShadow}` : '';
        const border = style.dialogBorder ? `1px solid ${style.dialogBorder}` : '';
        const linkFgColor = style.textLinkForeground;
        this.shadowElement.style.boxShadow = shadowColor;
        this.element.style.color = fgColor ?? '';
        this.element.style.backgroundColor = bgColor ?? '';
        this.element.style.border = border;
        if (linkFgColor) {
            for (const el of this.messageContainer.getElementsByTagName('a')) {
                el.style.color = linkFgColor;
            }
        }
        let color;
        switch (this.options.type) {
            case 'error':
                color = style.errorIconForeground;
                break;
            case 'warning':
                color = style.warningIconForeground;
                break;
            default:
                color = style.infoIconForeground;
                break;
        }
        if (color) {
            this.iconElement.style.color = color;
        }
    }
    dispose() {
        super.dispose();
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = undefined;
        }
        if (this.focusToReturn && isAncestor(this.focusToReturn, this.container.ownerDocument.body)) {
            this.focusToReturn.focus();
            this.focusToReturn = undefined;
        }
    }
    rearrangeButtons(buttons, cancelId) {
        const buttonMap = buttons.map((label, index) => ({ label, index }));
        if (buttons.length < 2) {
            return buttonMap;
        }
        if (isMacintosh || isLinux) {
            if (typeof cancelId === 'number' && buttonMap[cancelId]) {
                const cancelButton = buttonMap.splice(cancelId, 1)[0];
                buttonMap.splice(1, 0, cancelButton);
            }
            buttonMap.reverse();
        }
        else if (isWindows) {
            if (typeof cancelId === 'number' && buttonMap[cancelId]) {
                const cancelButton = buttonMap.splice(cancelId, 1)[0];
                buttonMap.push(cancelButton);
            }
        }
        return buttonMap;
    }
}
