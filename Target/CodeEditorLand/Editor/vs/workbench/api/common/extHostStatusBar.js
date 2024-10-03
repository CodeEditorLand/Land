import { StatusBarAlignment as ExtHostStatusBarAlignment, Disposable, ThemeColor, asStatusBarItemIdentifier } from './extHostTypes.js';
import { MainContext } from './extHost.protocol.js';
import { localize } from '../../../nls.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { MarkdownString } from './extHostTypeConverters.js';
import { isNumber } from '../../../base/common/types.js';
export class ExtHostStatusBarEntry {
    static { this.ID_GEN = 0; }
    static { this.ALLOWED_BACKGROUND_COLORS = new Map([
        ['statusBarItem.errorBackground', new ThemeColor('statusBarItem.errorForeground')],
        ['statusBarItem.warningBackground', new ThemeColor('statusBarItem.warningForeground')]
    ]); }
    #proxy;
    #commands;
    constructor(proxy, commands, staticItems, extension, id, alignment = ExtHostStatusBarAlignment.Left, priority) {
        this._disposed = false;
        this._text = '';
        this._staleCommandRegistrations = new DisposableStore();
        this.#proxy = proxy;
        this.#commands = commands;
        if (id && extension) {
            this._entryId = asStatusBarItemIdentifier(extension.identifier, id);
            const item = staticItems.get(this._entryId);
            if (item) {
                alignment = item.alignLeft ? ExtHostStatusBarAlignment.Left : ExtHostStatusBarAlignment.Right;
                priority = item.priority;
                this._visible = true;
                this.name = item.name;
                this.text = item.text;
                this.tooltip = item.tooltip;
                this.command = item.command;
                this.accessibilityInformation = item.accessibilityInformation;
            }
        }
        else {
            this._entryId = String(ExtHostStatusBarEntry.ID_GEN++);
        }
        this._extension = extension;
        this._id = id;
        this._alignment = alignment;
        this._priority = this.validatePriority(priority);
    }
    validatePriority(priority) {
        if (!isNumber(priority)) {
            return undefined;
        }
        if (priority === Number.POSITIVE_INFINITY) {
            return Number.MAX_VALUE;
        }
        if (priority === Number.NEGATIVE_INFINITY) {
            return -Number.MAX_VALUE;
        }
        return priority;
    }
    get id() {
        return this._id ?? this._extension.identifier.value;
    }
    get alignment() {
        return this._alignment;
    }
    get priority() {
        return this._priority;
    }
    get text() {
        return this._text;
    }
    get name() {
        return this._name;
    }
    get tooltip() {
        return this._tooltip;
    }
    get color() {
        return this._color;
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    get command() {
        return this._command?.fromApi;
    }
    get accessibilityInformation() {
        return this._accessibilityInformation;
    }
    set text(text) {
        this._text = text;
        this.update();
    }
    set name(name) {
        this._name = name;
        this.update();
    }
    set tooltip(tooltip) {
        this._tooltip = tooltip;
        this.update();
    }
    set color(color) {
        this._color = color;
        this.update();
    }
    set backgroundColor(color) {
        if (color && !ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.has(color.id)) {
            color = undefined;
        }
        this._backgroundColor = color;
        this.update();
    }
    set command(command) {
        if (this._command?.fromApi === command) {
            return;
        }
        if (this._latestCommandRegistration) {
            this._staleCommandRegistrations.add(this._latestCommandRegistration);
        }
        this._latestCommandRegistration = new DisposableStore();
        if (typeof command === 'string') {
            this._command = {
                fromApi: command,
                internal: this.#commands.toInternal({ title: '', command }, this._latestCommandRegistration),
            };
        }
        else if (command) {
            this._command = {
                fromApi: command,
                internal: this.#commands.toInternal(command, this._latestCommandRegistration),
            };
        }
        else {
            this._command = undefined;
        }
        this.update();
    }
    set accessibilityInformation(accessibilityInformation) {
        this._accessibilityInformation = accessibilityInformation;
        this.update();
    }
    show() {
        this._visible = true;
        this.update();
    }
    hide() {
        clearTimeout(this._timeoutHandle);
        this._visible = false;
        this.#proxy.$disposeEntry(this._entryId);
    }
    update() {
        if (this._disposed || !this._visible) {
            return;
        }
        clearTimeout(this._timeoutHandle);
        this._timeoutHandle = setTimeout(() => {
            this._timeoutHandle = undefined;
            let id;
            if (this._extension) {
                if (this._id) {
                    id = `${this._extension.identifier.value}.${this._id}`;
                }
                else {
                    id = this._extension.identifier.value;
                }
            }
            else {
                id = this._id;
            }
            let name;
            if (this._name) {
                name = this._name;
            }
            else {
                name = localize('extensionLabel', "{0} (Extension)", this._extension.displayName || this._extension.name);
            }
            let color = this._color;
            if (this._backgroundColor) {
                color = ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.get(this._backgroundColor.id);
            }
            const tooltip = MarkdownString.fromStrict(this._tooltip);
            this.#proxy.$setEntry(this._entryId, id, this._extension?.identifier.value, name, this._text, tooltip, this._command?.internal, color, this._backgroundColor, this._alignment === ExtHostStatusBarAlignment.Left, this._priority, this._accessibilityInformation);
            this._staleCommandRegistrations.clear();
        }, 0);
    }
    dispose() {
        this.hide();
        this._disposed = true;
    }
}
class StatusBarMessage {
    constructor(statusBar) {
        this._messages = [];
        this._item = statusBar.createStatusBarEntry(undefined, 'status.extensionMessage', ExtHostStatusBarAlignment.Left, Number.MIN_VALUE);
        this._item.name = localize('status.extensionMessage', "Extension Status");
    }
    dispose() {
        this._messages.length = 0;
        this._item.dispose();
    }
    setMessage(message) {
        const data = { message };
        this._messages.unshift(data);
        this._update();
        return new Disposable(() => {
            const idx = this._messages.indexOf(data);
            if (idx >= 0) {
                this._messages.splice(idx, 1);
                this._update();
            }
        });
    }
    _update() {
        if (this._messages.length > 0) {
            this._item.text = this._messages[0].message;
            this._item.show();
        }
        else {
            this._item.hide();
        }
    }
}
export class ExtHostStatusBar {
    constructor(mainContext, commands) {
        this._existingItems = new Map();
        this._proxy = mainContext.getProxy(MainContext.MainThreadStatusBar);
        this._commands = commands;
        this._statusMessage = new StatusBarMessage(this);
    }
    $acceptStaticEntries(added) {
        for (const item of added) {
            this._existingItems.set(item.entryId, item);
        }
    }
    createStatusBarEntry(extension, id, alignment, priority) {
        return new ExtHostStatusBarEntry(this._proxy, this._commands, this._existingItems, extension, id, alignment, priority);
    }
    setStatusBarMessage(text, timeoutOrThenable) {
        const d = this._statusMessage.setMessage(text);
        let handle;
        if (typeof timeoutOrThenable === 'number') {
            handle = setTimeout(() => d.dispose(), timeoutOrThenable);
        }
        else if (typeof timeoutOrThenable !== 'undefined') {
            timeoutOrThenable.then(() => d.dispose(), () => d.dispose());
        }
        return new Disposable(() => {
            d.dispose();
            clearTimeout(handle);
        });
    }
}
