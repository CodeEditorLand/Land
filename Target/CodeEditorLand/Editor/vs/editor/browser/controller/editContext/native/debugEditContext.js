const COLOR_FOR_CONTROL_BOUNDS = 'blue';
const COLOR_FOR_SELECTION_BOUNDS = 'red';
const COLOR_FOR_CHARACTER_BOUNDS = 'green';
export class DebugEditContext extends EditContext {
    constructor(options) {
        super(options);
        this._isDebugging = true;
        this._controlBounds = null;
        this._selectionBounds = null;
        this._characterBounds = null;
        this._ontextupdateWrapper = new EventListenerWrapper('textupdate', this);
        this._ontextformatupdateWrapper = new EventListenerWrapper('textformatupdate', this);
        this._oncharacterboundsupdateWrapper = new EventListenerWrapper('characterboundsupdate', this);
        this._oncompositionstartWrapper = new EventListenerWrapper('compositionstart', this);
        this._oncompositionendWrapper = new EventListenerWrapper('compositionend', this);
        this._listenerMap = new Map();
        this._disposables = [];
    }
    updateText(rangeStart, rangeEnd, text) {
        super.updateText(rangeStart, rangeEnd, text);
        this.renderDebug();
    }
    updateSelection(start, end) {
        super.updateSelection(start, end);
        this.renderDebug();
    }
    updateControlBounds(controlBounds) {
        super.updateControlBounds(controlBounds);
        this._controlBounds = controlBounds;
        this.renderDebug();
    }
    updateSelectionBounds(selectionBounds) {
        super.updateSelectionBounds(selectionBounds);
        this._selectionBounds = selectionBounds;
        this.renderDebug();
    }
    updateCharacterBounds(rangeStart, characterBounds) {
        super.updateCharacterBounds(rangeStart, characterBounds);
        this._characterBounds = { rangeStart, characterBounds };
        this.renderDebug();
    }
    attachedElements() {
        return super.attachedElements();
    }
    characterBounds() {
        return super.characterBounds();
    }
    get ontextupdate() { return this._ontextupdateWrapper.eventHandler; }
    set ontextupdate(value) { this._ontextupdateWrapper.eventHandler = value; }
    get ontextformatupdate() { return this._ontextformatupdateWrapper.eventHandler; }
    set ontextformatupdate(value) { this._ontextformatupdateWrapper.eventHandler = value; }
    get oncharacterboundsupdate() { return this._oncharacterboundsupdateWrapper.eventHandler; }
    set oncharacterboundsupdate(value) { this._oncharacterboundsupdateWrapper.eventHandler = value; }
    get oncompositionstart() { return this._oncompositionstartWrapper.eventHandler; }
    set oncompositionstart(value) { this._oncompositionstartWrapper.eventHandler = value; }
    get oncompositionend() { return this._oncompositionendWrapper.eventHandler; }
    set oncompositionend(value) { this._oncompositionendWrapper.eventHandler = value; }
    addEventListener(type, listener, options) {
        if (!listener) {
            return;
        }
        const debugListener = (event) => {
            if (this._isDebugging) {
                this.renderDebug();
                console.log(`DebugEditContex.on_${type}`, event);
            }
            if (typeof listener === 'function') {
                listener.call(this, event);
            }
            else if (typeof listener === 'object' && 'handleEvent' in listener) {
                listener.handleEvent(event);
            }
        };
        this._listenerMap.set(listener, debugListener);
        super.addEventListener(type, debugListener, options);
        this.renderDebug();
    }
    removeEventListener(type, listener, options) {
        if (!listener) {
            return;
        }
        const debugListener = this._listenerMap.get(listener);
        if (debugListener) {
            super.removeEventListener(type, debugListener, options);
            this._listenerMap.delete(listener);
        }
        this.renderDebug();
    }
    dispatchEvent(event) {
        return super.dispatchEvent(event);
    }
    startDebugging() {
        this._isDebugging = true;
        this.renderDebug();
    }
    endDebugging() {
        this._isDebugging = false;
        this.renderDebug();
    }
    renderDebug() {
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
        if (!this._isDebugging || this._listenerMap.size === 0) {
            return;
        }
        if (this._controlBounds) {
            this._disposables.push(createRect(this._controlBounds, COLOR_FOR_CONTROL_BOUNDS));
        }
        if (this._selectionBounds) {
            this._disposables.push(createRect(this._selectionBounds, COLOR_FOR_SELECTION_BOUNDS));
        }
        if (this._characterBounds) {
            for (const rect of this._characterBounds.characterBounds) {
                this._disposables.push(createRect(rect, COLOR_FOR_CHARACTER_BOUNDS));
            }
        }
        this._disposables.push(createDiv(this.text, this.selectionStart, this.selectionEnd));
    }
}
function createDiv(text, selectionStart, selectionEnd) {
    const ret = document.createElement('div');
    ret.className = 'debug-rect-marker';
    ret.style.position = 'absolute';
    ret.style.zIndex = '999999999';
    ret.style.bottom = '50px';
    ret.style.left = '60px';
    ret.style.backgroundColor = 'white';
    ret.style.border = '1px solid black';
    ret.style.padding = '5px';
    ret.style.whiteSpace = 'pre';
    ret.style.font = '12px monospace';
    ret.style.pointerEvents = 'none';
    const before = text.substring(0, selectionStart);
    const selected = text.substring(selectionStart, selectionEnd) || '|';
    const after = text.substring(selectionEnd) + ' ';
    const beforeNode = document.createTextNode(before);
    ret.appendChild(beforeNode);
    const selectedNode = document.createElement('span');
    selectedNode.style.backgroundColor = 'yellow';
    selectedNode.appendChild(document.createTextNode(selected));
    selectedNode.style.minWidth = '2px';
    selectedNode.style.minHeight = '16px';
    ret.appendChild(selectedNode);
    const afterNode = document.createTextNode(after);
    ret.appendChild(afterNode);
    document.body.appendChild(ret);
    return {
        dispose: () => {
            ret.remove();
        }
    };
}
function createRect(rect, color) {
    const ret = document.createElement('div');
    ret.className = 'debug-rect-marker';
    ret.style.position = 'absolute';
    ret.style.zIndex = '999999999';
    ret.style.outline = `2px solid ${color}`;
    ret.style.pointerEvents = 'none';
    ret.style.top = rect.top + 'px';
    ret.style.left = rect.left + 'px';
    ret.style.width = rect.width + 'px';
    ret.style.height = rect.height + 'px';
    document.body.appendChild(ret);
    return {
        dispose: () => {
            ret.remove();
        }
    };
}
class EventListenerWrapper {
    constructor(_eventType, _target) {
        this._eventType = _eventType;
        this._target = _target;
        this._eventHandler = null;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    set eventHandler(value) {
        if (this._eventHandler) {
            this._target.removeEventListener(this._eventType, this._eventHandler);
        }
        this._eventHandler = value;
        if (value) {
            this._target.addEventListener(this._eventType, value);
        }
    }
}
