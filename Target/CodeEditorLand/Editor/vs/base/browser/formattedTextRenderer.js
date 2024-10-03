import * as DOM from './dom.js';
export function renderText(text, options = {}) {
    const element = createElement(options);
    element.textContent = text;
    return element;
}
export function renderFormattedText(formattedText, options = {}) {
    const element = createElement(options);
    _renderFormattedText(element, parseFormattedText(formattedText, !!options.renderCodeSegments), options.actionHandler, options.renderCodeSegments);
    return element;
}
export function createElement(options) {
    const tagName = options.inline ? 'span' : 'div';
    const element = document.createElement(tagName);
    if (options.className) {
        element.className = options.className;
    }
    return element;
}
class StringStream {
    constructor(source) {
        this.source = source;
        this.index = 0;
    }
    eos() {
        return this.index >= this.source.length;
    }
    next() {
        const next = this.peek();
        this.advance();
        return next;
    }
    peek() {
        return this.source[this.index];
    }
    advance() {
        this.index++;
    }
}
function _renderFormattedText(element, treeNode, actionHandler, renderCodeSegments) {
    let child;
    if (treeNode.type === 2) {
        child = document.createTextNode(treeNode.content || '');
    }
    else if (treeNode.type === 3) {
        child = document.createElement('b');
    }
    else if (treeNode.type === 4) {
        child = document.createElement('i');
    }
    else if (treeNode.type === 7 && renderCodeSegments) {
        child = document.createElement('code');
    }
    else if (treeNode.type === 5 && actionHandler) {
        const a = document.createElement('a');
        actionHandler.disposables.add(DOM.addStandardDisposableListener(a, 'click', (event) => {
            actionHandler.callback(String(treeNode.index), event);
        }));
        child = a;
    }
    else if (treeNode.type === 8) {
        child = document.createElement('br');
    }
    else if (treeNode.type === 1) {
        child = element;
    }
    if (child && element !== child) {
        element.appendChild(child);
    }
    if (child && Array.isArray(treeNode.children)) {
        treeNode.children.forEach((nodeChild) => {
            _renderFormattedText(child, nodeChild, actionHandler, renderCodeSegments);
        });
    }
}
function parseFormattedText(content, parseCodeSegments) {
    const root = {
        type: 1,
        children: []
    };
    let actionViewItemIndex = 0;
    let current = root;
    const stack = [];
    const stream = new StringStream(content);
    while (!stream.eos()) {
        let next = stream.next();
        const isEscapedFormatType = (next === '\\' && formatTagType(stream.peek(), parseCodeSegments) !== 0);
        if (isEscapedFormatType) {
            next = stream.next();
        }
        if (!isEscapedFormatType && isFormatTag(next, parseCodeSegments) && next === stream.peek()) {
            stream.advance();
            if (current.type === 2) {
                current = stack.pop();
            }
            const type = formatTagType(next, parseCodeSegments);
            if (current.type === type || (current.type === 5 && type === 6)) {
                current = stack.pop();
            }
            else {
                const newCurrent = {
                    type: type,
                    children: []
                };
                if (type === 5) {
                    newCurrent.index = actionViewItemIndex;
                    actionViewItemIndex++;
                }
                current.children.push(newCurrent);
                stack.push(current);
                current = newCurrent;
            }
        }
        else if (next === '\n') {
            if (current.type === 2) {
                current = stack.pop();
            }
            current.children.push({
                type: 8
            });
        }
        else {
            if (current.type !== 2) {
                const textCurrent = {
                    type: 2,
                    content: next
                };
                current.children.push(textCurrent);
                stack.push(current);
                current = textCurrent;
            }
            else {
                current.content += next;
            }
        }
    }
    if (current.type === 2) {
        current = stack.pop();
    }
    if (stack.length) {
    }
    return root;
}
function isFormatTag(char, supportCodeSegments) {
    return formatTagType(char, supportCodeSegments) !== 0;
}
function formatTagType(char, supportCodeSegments) {
    switch (char) {
        case '*':
            return 3;
        case '_':
            return 4;
        case '[':
            return 5;
        case ']':
            return 6;
        case '`':
            return supportCodeSegments ? 7 : 0;
        default:
            return 0;
    }
}
