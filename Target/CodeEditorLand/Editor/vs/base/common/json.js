export var ParseOptions;
(function (ParseOptions) {
    ParseOptions.DEFAULT = {
        allowTrailingComma: true
    };
})(ParseOptions || (ParseOptions = {}));
export function createScanner(text, ignoreTrivia = false) {
    let pos = 0;
    const len = text.length;
    let value = '';
    let tokenOffset = 0;
    let token = 16;
    let scanError = 0;
    function scanHexDigits(count) {
        let digits = 0;
        let hexValue = 0;
        while (digits < count) {
            const ch = text.charCodeAt(pos);
            if (ch >= 48 && ch <= 57) {
                hexValue = hexValue * 16 + ch - 48;
            }
            else if (ch >= 65 && ch <= 70) {
                hexValue = hexValue * 16 + ch - 65 + 10;
            }
            else if (ch >= 97 && ch <= 102) {
                hexValue = hexValue * 16 + ch - 97 + 10;
            }
            else {
                break;
            }
            pos++;
            digits++;
        }
        if (digits < count) {
            hexValue = -1;
        }
        return hexValue;
    }
    function setPosition(newPosition) {
        pos = newPosition;
        value = '';
        tokenOffset = 0;
        token = 16;
        scanError = 0;
    }
    function scanNumber() {
        const start = pos;
        if (text.charCodeAt(pos) === 48) {
            pos++;
        }
        else {
            pos++;
            while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
            }
        }
        if (pos < text.length && text.charCodeAt(pos) === 46) {
            pos++;
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            }
            else {
                scanError = 3;
                return text.substring(start, pos);
            }
        }
        let end = pos;
        if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
            pos++;
            if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
                pos++;
            }
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
                end = pos;
            }
            else {
                scanError = 3;
            }
        }
        return text.substring(start, end);
    }
    function scanString() {
        let result = '', start = pos;
        while (true) {
            if (pos >= len) {
                result += text.substring(start, pos);
                scanError = 2;
                break;
            }
            const ch = text.charCodeAt(pos);
            if (ch === 34) {
                result += text.substring(start, pos);
                pos++;
                break;
            }
            if (ch === 92) {
                result += text.substring(start, pos);
                pos++;
                if (pos >= len) {
                    scanError = 2;
                    break;
                }
                const ch2 = text.charCodeAt(pos++);
                switch (ch2) {
                    case 34:
                        result += '\"';
                        break;
                    case 92:
                        result += '\\';
                        break;
                    case 47:
                        result += '/';
                        break;
                    case 98:
                        result += '\b';
                        break;
                    case 102:
                        result += '\f';
                        break;
                    case 110:
                        result += '\n';
                        break;
                    case 114:
                        result += '\r';
                        break;
                    case 116:
                        result += '\t';
                        break;
                    case 117: {
                        const ch3 = scanHexDigits(4);
                        if (ch3 >= 0) {
                            result += String.fromCharCode(ch3);
                        }
                        else {
                            scanError = 4;
                        }
                        break;
                    }
                    default:
                        scanError = 5;
                }
                start = pos;
                continue;
            }
            if (ch >= 0 && ch <= 0x1F) {
                if (isLineBreak(ch)) {
                    result += text.substring(start, pos);
                    scanError = 2;
                    break;
                }
                else {
                    scanError = 6;
                }
            }
            pos++;
        }
        return result;
    }
    function scanNext() {
        value = '';
        scanError = 0;
        tokenOffset = pos;
        if (pos >= len) {
            tokenOffset = len;
            return token = 17;
        }
        let code = text.charCodeAt(pos);
        if (isWhitespace(code)) {
            do {
                pos++;
                value += String.fromCharCode(code);
                code = text.charCodeAt(pos);
            } while (isWhitespace(code));
            return token = 15;
        }
        if (isLineBreak(code)) {
            pos++;
            value += String.fromCharCode(code);
            if (code === 13 && text.charCodeAt(pos) === 10) {
                pos++;
                value += '\n';
            }
            return token = 14;
        }
        switch (code) {
            case 123:
                pos++;
                return token = 1;
            case 125:
                pos++;
                return token = 2;
            case 91:
                pos++;
                return token = 3;
            case 93:
                pos++;
                return token = 4;
            case 58:
                pos++;
                return token = 6;
            case 44:
                pos++;
                return token = 5;
            case 34:
                pos++;
                value = scanString();
                return token = 10;
            case 47: {
                const start = pos - 1;
                if (text.charCodeAt(pos + 1) === 47) {
                    pos += 2;
                    while (pos < len) {
                        if (isLineBreak(text.charCodeAt(pos))) {
                            break;
                        }
                        pos++;
                    }
                    value = text.substring(start, pos);
                    return token = 12;
                }
                if (text.charCodeAt(pos + 1) === 42) {
                    pos += 2;
                    const safeLength = len - 1;
                    let commentClosed = false;
                    while (pos < safeLength) {
                        const ch = text.charCodeAt(pos);
                        if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
                            pos += 2;
                            commentClosed = true;
                            break;
                        }
                        pos++;
                    }
                    if (!commentClosed) {
                        pos++;
                        scanError = 1;
                    }
                    value = text.substring(start, pos);
                    return token = 13;
                }
                value += String.fromCharCode(code);
                pos++;
                return token = 16;
            }
            case 45:
                value += String.fromCharCode(code);
                pos++;
                if (pos === len || !isDigit(text.charCodeAt(pos))) {
                    return token = 16;
                }
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                value += scanNumber();
                return token = 11;
            default:
                while (pos < len && isUnknownContentCharacter(code)) {
                    pos++;
                    code = text.charCodeAt(pos);
                }
                if (tokenOffset !== pos) {
                    value = text.substring(tokenOffset, pos);
                    switch (value) {
                        case 'true': return token = 8;
                        case 'false': return token = 9;
                        case 'null': return token = 7;
                    }
                    return token = 16;
                }
                value += String.fromCharCode(code);
                pos++;
                return token = 16;
        }
    }
    function isUnknownContentCharacter(code) {
        if (isWhitespace(code) || isLineBreak(code)) {
            return false;
        }
        switch (code) {
            case 125:
            case 93:
            case 123:
            case 91:
            case 34:
            case 58:
            case 44:
            case 47:
                return false;
        }
        return true;
    }
    function scanNextNonTrivia() {
        let result;
        do {
            result = scanNext();
        } while (result >= 12 && result <= 15);
        return result;
    }
    return {
        setPosition: setPosition,
        getPosition: () => pos,
        scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
        getToken: () => token,
        getTokenValue: () => value,
        getTokenOffset: () => tokenOffset,
        getTokenLength: () => pos - tokenOffset,
        getTokenError: () => scanError
    };
}
function isWhitespace(ch) {
    return ch === 32 || ch === 9 || ch === 11 || ch === 12 ||
        ch === 160 || ch === 5760 || ch >= 8192 && ch <= 8203 ||
        ch === 8239 || ch === 8287 || ch === 12288 || ch === 65279;
}
function isLineBreak(ch) {
    return ch === 10 || ch === 13 || ch === 8232 || ch === 8233;
}
function isDigit(ch) {
    return ch >= 48 && ch <= 57;
}
export function getLocation(text, position) {
    const segments = [];
    const earlyReturnException = new Object();
    let previousNode = undefined;
    const previousNodeInst = {
        value: {},
        offset: 0,
        length: 0,
        type: 'object',
        parent: undefined
    };
    let isAtPropertyKey = false;
    function setPreviousNode(value, offset, length, type) {
        previousNodeInst.value = value;
        previousNodeInst.offset = offset;
        previousNodeInst.length = length;
        previousNodeInst.type = type;
        previousNodeInst.colonOffset = undefined;
        previousNode = previousNodeInst;
    }
    try {
        visit(text, {
            onObjectBegin: (offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                isAtPropertyKey = position > offset;
                segments.push('');
            },
            onObjectProperty: (name, offset, length) => {
                if (position < offset) {
                    throw earlyReturnException;
                }
                setPreviousNode(name, offset, length, 'property');
                segments[segments.length - 1] = name;
                if (position <= offset + length) {
                    throw earlyReturnException;
                }
            },
            onObjectEnd: (offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.pop();
            },
            onArrayBegin: (offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.push(0);
            },
            onArrayEnd: (offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.pop();
            },
            onLiteralValue: (value, offset, length) => {
                if (position < offset) {
                    throw earlyReturnException;
                }
                setPreviousNode(value, offset, length, getNodeType(value));
                if (position <= offset + length) {
                    throw earlyReturnException;
                }
            },
            onSeparator: (sep, offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                if (sep === ':' && previousNode && previousNode.type === 'property') {
                    previousNode.colonOffset = offset;
                    isAtPropertyKey = false;
                    previousNode = undefined;
                }
                else if (sep === ',') {
                    const last = segments[segments.length - 1];
                    if (typeof last === 'number') {
                        segments[segments.length - 1] = last + 1;
                    }
                    else {
                        isAtPropertyKey = true;
                        segments[segments.length - 1] = '';
                    }
                    previousNode = undefined;
                }
            }
        });
    }
    catch (e) {
        if (e !== earlyReturnException) {
            throw e;
        }
    }
    return {
        path: segments,
        previousNode,
        isAtPropertyKey,
        matches: (pattern) => {
            let k = 0;
            for (let i = 0; k < pattern.length && i < segments.length; i++) {
                if (pattern[k] === segments[i] || pattern[k] === '*') {
                    k++;
                }
                else if (pattern[k] !== '**') {
                    return false;
                }
            }
            return k === pattern.length;
        }
    };
}
export function parse(text, errors = [], options = ParseOptions.DEFAULT) {
    let currentProperty = null;
    let currentParent = [];
    const previousParents = [];
    function onValue(value) {
        if (Array.isArray(currentParent)) {
            currentParent.push(value);
        }
        else if (currentProperty !== null) {
            currentParent[currentProperty] = value;
        }
    }
    const visitor = {
        onObjectBegin: () => {
            const object = {};
            onValue(object);
            previousParents.push(currentParent);
            currentParent = object;
            currentProperty = null;
        },
        onObjectProperty: (name) => {
            currentProperty = name;
        },
        onObjectEnd: () => {
            currentParent = previousParents.pop();
        },
        onArrayBegin: () => {
            const array = [];
            onValue(array);
            previousParents.push(currentParent);
            currentParent = array;
            currentProperty = null;
        },
        onArrayEnd: () => {
            currentParent = previousParents.pop();
        },
        onLiteralValue: onValue,
        onError: (error, offset, length) => {
            errors.push({ error, offset, length });
        }
    };
    visit(text, visitor, options);
    return currentParent[0];
}
export function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
    let currentParent = { type: 'array', offset: -1, length: -1, children: [], parent: undefined };
    function ensurePropertyComplete(endOffset) {
        if (currentParent.type === 'property') {
            currentParent.length = endOffset - currentParent.offset;
            currentParent = currentParent.parent;
        }
    }
    function onValue(valueNode) {
        currentParent.children.push(valueNode);
        return valueNode;
    }
    const visitor = {
        onObjectBegin: (offset) => {
            currentParent = onValue({ type: 'object', offset, length: -1, parent: currentParent, children: [] });
        },
        onObjectProperty: (name, offset, length) => {
            currentParent = onValue({ type: 'property', offset, length: -1, parent: currentParent, children: [] });
            currentParent.children.push({ type: 'string', value: name, offset, length, parent: currentParent });
        },
        onObjectEnd: (offset, length) => {
            currentParent.length = offset + length - currentParent.offset;
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
        },
        onArrayBegin: (offset, length) => {
            currentParent = onValue({ type: 'array', offset, length: -1, parent: currentParent, children: [] });
        },
        onArrayEnd: (offset, length) => {
            currentParent.length = offset + length - currentParent.offset;
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
        },
        onLiteralValue: (value, offset, length) => {
            onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
            ensurePropertyComplete(offset + length);
        },
        onSeparator: (sep, offset, length) => {
            if (currentParent.type === 'property') {
                if (sep === ':') {
                    currentParent.colonOffset = offset;
                }
                else if (sep === ',') {
                    ensurePropertyComplete(offset);
                }
            }
        },
        onError: (error, offset, length) => {
            errors.push({ error, offset, length });
        }
    };
    visit(text, visitor, options);
    const result = currentParent.children[0];
    if (result) {
        delete result.parent;
    }
    return result;
}
export function findNodeAtLocation(root, path) {
    if (!root) {
        return undefined;
    }
    let node = root;
    for (const segment of path) {
        if (typeof segment === 'string') {
            if (node.type !== 'object' || !Array.isArray(node.children)) {
                return undefined;
            }
            let found = false;
            for (const propertyNode of node.children) {
                if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
                    node = propertyNode.children[1];
                    found = true;
                    break;
                }
            }
            if (!found) {
                return undefined;
            }
        }
        else {
            const index = segment;
            if (node.type !== 'array' || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
                return undefined;
            }
            node = node.children[index];
        }
    }
    return node;
}
export function getNodePath(node) {
    if (!node.parent || !node.parent.children) {
        return [];
    }
    const path = getNodePath(node.parent);
    if (node.parent.type === 'property') {
        const key = node.parent.children[0].value;
        path.push(key);
    }
    else if (node.parent.type === 'array') {
        const index = node.parent.children.indexOf(node);
        if (index !== -1) {
            path.push(index);
        }
    }
    return path;
}
export function getNodeValue(node) {
    switch (node.type) {
        case 'array':
            return node.children.map(getNodeValue);
        case 'object': {
            const obj = Object.create(null);
            for (const prop of node.children) {
                const valueNode = prop.children[1];
                if (valueNode) {
                    obj[prop.children[0].value] = getNodeValue(valueNode);
                }
            }
            return obj;
        }
        case 'null':
        case 'string':
        case 'number':
        case 'boolean':
            return node.value;
        default:
            return undefined;
    }
}
export function contains(node, offset, includeRightBound = false) {
    return (offset >= node.offset && offset < (node.offset + node.length)) || includeRightBound && (offset === (node.offset + node.length));
}
export function findNodeAtOffset(node, offset, includeRightBound = false) {
    if (contains(node, offset, includeRightBound)) {
        const children = node.children;
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
                const item = findNodeAtOffset(children[i], offset, includeRightBound);
                if (item) {
                    return item;
                }
            }
        }
        return node;
    }
    return undefined;
}
export function visit(text, visitor, options = ParseOptions.DEFAULT) {
    const _scanner = createScanner(text, false);
    function toNoArgVisit(visitFunction) {
        return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
    }
    function toOneArgVisit(visitFunction) {
        return visitFunction ? (arg) => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
    }
    const onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
    const disallowComments = options && options.disallowComments;
    const allowTrailingComma = options && options.allowTrailingComma;
    function scanNext() {
        while (true) {
            const token = _scanner.scan();
            switch (_scanner.getTokenError()) {
                case 4:
                    handleError(14);
                    break;
                case 5:
                    handleError(15);
                    break;
                case 3:
                    handleError(13);
                    break;
                case 1:
                    if (!disallowComments) {
                        handleError(11);
                    }
                    break;
                case 2:
                    handleError(12);
                    break;
                case 6:
                    handleError(16);
                    break;
            }
            switch (token) {
                case 12:
                case 13:
                    if (disallowComments) {
                        handleError(10);
                    }
                    else {
                        onComment();
                    }
                    break;
                case 16:
                    handleError(1);
                    break;
                case 15:
                case 14:
                    break;
                default:
                    return token;
            }
        }
    }
    function handleError(error, skipUntilAfter = [], skipUntil = []) {
        onError(error);
        if (skipUntilAfter.length + skipUntil.length > 0) {
            let token = _scanner.getToken();
            while (token !== 17) {
                if (skipUntilAfter.indexOf(token) !== -1) {
                    scanNext();
                    break;
                }
                else if (skipUntil.indexOf(token) !== -1) {
                    break;
                }
                token = scanNext();
            }
        }
    }
    function parseString(isValue) {
        const value = _scanner.getTokenValue();
        if (isValue) {
            onLiteralValue(value);
        }
        else {
            onObjectProperty(value);
        }
        scanNext();
        return true;
    }
    function parseLiteral() {
        switch (_scanner.getToken()) {
            case 11: {
                let value = 0;
                try {
                    value = JSON.parse(_scanner.getTokenValue());
                    if (typeof value !== 'number') {
                        handleError(2);
                        value = 0;
                    }
                }
                catch (e) {
                    handleError(2);
                }
                onLiteralValue(value);
                break;
            }
            case 7:
                onLiteralValue(null);
                break;
            case 8:
                onLiteralValue(true);
                break;
            case 9:
                onLiteralValue(false);
                break;
            default:
                return false;
        }
        scanNext();
        return true;
    }
    function parseProperty() {
        if (_scanner.getToken() !== 10) {
            handleError(3, [], [2, 5]);
            return false;
        }
        parseString(false);
        if (_scanner.getToken() === 6) {
            onSeparator(':');
            scanNext();
            if (!parseValue()) {
                handleError(4, [], [2, 5]);
            }
        }
        else {
            handleError(5, [], [2, 5]);
        }
        return true;
    }
    function parseObject() {
        onObjectBegin();
        scanNext();
        let needsComma = false;
        while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
            if (_scanner.getToken() === 5) {
                if (!needsComma) {
                    handleError(4, [], []);
                }
                onSeparator(',');
                scanNext();
                if (_scanner.getToken() === 2 && allowTrailingComma) {
                    break;
                }
            }
            else if (needsComma) {
                handleError(6, [], []);
            }
            if (!parseProperty()) {
                handleError(4, [], [2, 5]);
            }
            needsComma = true;
        }
        onObjectEnd();
        if (_scanner.getToken() !== 2) {
            handleError(7, [2], []);
        }
        else {
            scanNext();
        }
        return true;
    }
    function parseArray() {
        onArrayBegin();
        scanNext();
        let needsComma = false;
        while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
            if (_scanner.getToken() === 5) {
                if (!needsComma) {
                    handleError(4, [], []);
                }
                onSeparator(',');
                scanNext();
                if (_scanner.getToken() === 4 && allowTrailingComma) {
                    break;
                }
            }
            else if (needsComma) {
                handleError(6, [], []);
            }
            if (!parseValue()) {
                handleError(4, [], [4, 5]);
            }
            needsComma = true;
        }
        onArrayEnd();
        if (_scanner.getToken() !== 4) {
            handleError(8, [4], []);
        }
        else {
            scanNext();
        }
        return true;
    }
    function parseValue() {
        switch (_scanner.getToken()) {
            case 3:
                return parseArray();
            case 1:
                return parseObject();
            case 10:
                return parseString(true);
            default:
                return parseLiteral();
        }
    }
    scanNext();
    if (_scanner.getToken() === 17) {
        if (options.allowEmptyContent) {
            return true;
        }
        handleError(4, [], []);
        return false;
    }
    if (!parseValue()) {
        handleError(4, [], []);
        return false;
    }
    if (_scanner.getToken() !== 17) {
        handleError(9, [], []);
    }
    return true;
}
export function getNodeType(value) {
    switch (typeof value) {
        case 'boolean': return 'boolean';
        case 'number': return 'number';
        case 'string': return 'string';
        case 'object': {
            if (!value) {
                return 'null';
            }
            else if (Array.isArray(value)) {
                return 'array';
            }
            return 'object';
        }
        default: return 'null';
    }
}
