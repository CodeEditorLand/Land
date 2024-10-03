export class Scanner {
    constructor() {
        this.value = '';
        this.pos = 0;
    }
    static { this._table = {
        [36]: 0,
        [58]: 1,
        [44]: 2,
        [123]: 3,
        [125]: 4,
        [92]: 5,
        [47]: 6,
        [124]: 7,
        [43]: 11,
        [45]: 12,
        [63]: 13,
    }; }
    static isDigitCharacter(ch) {
        return ch >= 48 && ch <= 57;
    }
    static isVariableCharacter(ch) {
        return ch === 95
            || (ch >= 97 && ch <= 122)
            || (ch >= 65 && ch <= 90);
    }
    text(value) {
        this.value = value;
        this.pos = 0;
    }
    tokenText(token) {
        return this.value.substr(token.pos, token.len);
    }
    next() {
        if (this.pos >= this.value.length) {
            return { type: 14, pos: this.pos, len: 0 };
        }
        const pos = this.pos;
        let len = 0;
        let ch = this.value.charCodeAt(pos);
        let type;
        type = Scanner._table[ch];
        if (typeof type === 'number') {
            this.pos += 1;
            return { type, pos, len: 1 };
        }
        if (Scanner.isDigitCharacter(ch)) {
            type = 8;
            do {
                len += 1;
                ch = this.value.charCodeAt(pos + len);
            } while (Scanner.isDigitCharacter(ch));
            this.pos += len;
            return { type, pos, len };
        }
        if (Scanner.isVariableCharacter(ch)) {
            type = 9;
            do {
                ch = this.value.charCodeAt(pos + (++len));
            } while (Scanner.isVariableCharacter(ch) || Scanner.isDigitCharacter(ch));
            this.pos += len;
            return { type, pos, len };
        }
        type = 10;
        do {
            len += 1;
            ch = this.value.charCodeAt(pos + len);
        } while (!isNaN(ch)
            && typeof Scanner._table[ch] === 'undefined'
            && !Scanner.isDigitCharacter(ch)
            && !Scanner.isVariableCharacter(ch));
        this.pos += len;
        return { type, pos, len };
    }
}
export class Marker {
    constructor() {
        this._children = [];
    }
    appendChild(child) {
        if (child instanceof Text && this._children[this._children.length - 1] instanceof Text) {
            this._children[this._children.length - 1].value += child.value;
        }
        else {
            child.parent = this;
            this._children.push(child);
        }
        return this;
    }
    replace(child, others) {
        const { parent } = child;
        const idx = parent.children.indexOf(child);
        const newChildren = parent.children.slice(0);
        newChildren.splice(idx, 1, ...others);
        parent._children = newChildren;
        (function _fixParent(children, parent) {
            for (const child of children) {
                child.parent = parent;
                _fixParent(child.children, child);
            }
        })(others, parent);
    }
    get children() {
        return this._children;
    }
    get rightMostDescendant() {
        if (this._children.length > 0) {
            return this._children[this._children.length - 1].rightMostDescendant;
        }
        return this;
    }
    get snippet() {
        let candidate = this;
        while (true) {
            if (!candidate) {
                return undefined;
            }
            if (candidate instanceof TextmateSnippet) {
                return candidate;
            }
            candidate = candidate.parent;
        }
    }
    toString() {
        return this.children.reduce((prev, cur) => prev + cur.toString(), '');
    }
    len() {
        return 0;
    }
}
export class Text extends Marker {
    static escape(value) {
        return value.replace(/\$|}|\\/g, '\\$&');
    }
    constructor(value) {
        super();
        this.value = value;
    }
    toString() {
        return this.value;
    }
    toTextmateString() {
        return Text.escape(this.value);
    }
    len() {
        return this.value.length;
    }
    clone() {
        return new Text(this.value);
    }
}
export class TransformableMarker extends Marker {
}
export class Placeholder extends TransformableMarker {
    static compareByIndex(a, b) {
        if (a.index === b.index) {
            return 0;
        }
        else if (a.isFinalTabstop) {
            return 1;
        }
        else if (b.isFinalTabstop) {
            return -1;
        }
        else if (a.index < b.index) {
            return -1;
        }
        else if (a.index > b.index) {
            return 1;
        }
        else {
            return 0;
        }
    }
    constructor(index) {
        super();
        this.index = index;
    }
    get isFinalTabstop() {
        return this.index === 0;
    }
    get choice() {
        return this._children.length === 1 && this._children[0] instanceof Choice
            ? this._children[0]
            : undefined;
    }
    toTextmateString() {
        let transformString = '';
        if (this.transform) {
            transformString = this.transform.toTextmateString();
        }
        if (this.children.length === 0 && !this.transform) {
            return `\$${this.index}`;
        }
        else if (this.children.length === 0) {
            return `\${${this.index}${transformString}}`;
        }
        else if (this.choice) {
            return `\${${this.index}|${this.choice.toTextmateString()}|${transformString}}`;
        }
        else {
            return `\${${this.index}:${this.children.map(child => child.toTextmateString()).join('')}${transformString}}`;
        }
    }
    clone() {
        const ret = new Placeholder(this.index);
        if (this.transform) {
            ret.transform = this.transform.clone();
        }
        ret._children = this.children.map(child => child.clone());
        return ret;
    }
}
export class Choice extends Marker {
    constructor() {
        super(...arguments);
        this.options = [];
    }
    appendChild(marker) {
        if (marker instanceof Text) {
            marker.parent = this;
            this.options.push(marker);
        }
        return this;
    }
    toString() {
        return this.options[0].value;
    }
    toTextmateString() {
        return this.options
            .map(option => option.value.replace(/\||,|\\/g, '\\$&'))
            .join(',');
    }
    len() {
        return this.options[0].len();
    }
    clone() {
        const ret = new Choice();
        this.options.forEach(ret.appendChild, ret);
        return ret;
    }
}
export class Transform extends Marker {
    constructor() {
        super(...arguments);
        this.regexp = new RegExp('');
    }
    resolve(value) {
        const _this = this;
        let didMatch = false;
        let ret = value.replace(this.regexp, function () {
            didMatch = true;
            return _this._replace(Array.prototype.slice.call(arguments, 0, -2));
        });
        if (!didMatch && this._children.some(child => child instanceof FormatString && Boolean(child.elseValue))) {
            ret = this._replace([]);
        }
        return ret;
    }
    _replace(groups) {
        let ret = '';
        for (const marker of this._children) {
            if (marker instanceof FormatString) {
                let value = groups[marker.index] || '';
                value = marker.resolve(value);
                ret += value;
            }
            else {
                ret += marker.toString();
            }
        }
        return ret;
    }
    toString() {
        return '';
    }
    toTextmateString() {
        return `/${this.regexp.source}/${this.children.map(c => c.toTextmateString())}/${(this.regexp.ignoreCase ? 'i' : '') + (this.regexp.global ? 'g' : '')}`;
    }
    clone() {
        const ret = new Transform();
        ret.regexp = new RegExp(this.regexp.source, '' + (this.regexp.ignoreCase ? 'i' : '') + (this.regexp.global ? 'g' : ''));
        ret._children = this.children.map(child => child.clone());
        return ret;
    }
}
export class FormatString extends Marker {
    constructor(index, shorthandName, ifValue, elseValue) {
        super();
        this.index = index;
        this.shorthandName = shorthandName;
        this.ifValue = ifValue;
        this.elseValue = elseValue;
    }
    resolve(value) {
        if (this.shorthandName === 'upcase') {
            return !value ? '' : value.toLocaleUpperCase();
        }
        else if (this.shorthandName === 'downcase') {
            return !value ? '' : value.toLocaleLowerCase();
        }
        else if (this.shorthandName === 'capitalize') {
            return !value ? '' : (value[0].toLocaleUpperCase() + value.substr(1));
        }
        else if (this.shorthandName === 'pascalcase') {
            return !value ? '' : this._toPascalCase(value);
        }
        else if (this.shorthandName === 'camelcase') {
            return !value ? '' : this._toCamelCase(value);
        }
        else if (Boolean(value) && typeof this.ifValue === 'string') {
            return this.ifValue;
        }
        else if (!Boolean(value) && typeof this.elseValue === 'string') {
            return this.elseValue;
        }
        else {
            return value || '';
        }
    }
    _toPascalCase(value) {
        const match = value.match(/[a-z0-9]+/gi);
        if (!match) {
            return value;
        }
        return match.map(word => {
            return word.charAt(0).toUpperCase() + word.substr(1);
        })
            .join('');
    }
    _toCamelCase(value) {
        const match = value.match(/[a-z0-9]+/gi);
        if (!match) {
            return value;
        }
        return match.map((word, index) => {
            if (index === 0) {
                return word.charAt(0).toLowerCase() + word.substr(1);
            }
            return word.charAt(0).toUpperCase() + word.substr(1);
        })
            .join('');
    }
    toTextmateString() {
        let value = '${';
        value += this.index;
        if (this.shorthandName) {
            value += `:/${this.shorthandName}`;
        }
        else if (this.ifValue && this.elseValue) {
            value += `:?${this.ifValue}:${this.elseValue}`;
        }
        else if (this.ifValue) {
            value += `:+${this.ifValue}`;
        }
        else if (this.elseValue) {
            value += `:-${this.elseValue}`;
        }
        value += '}';
        return value;
    }
    clone() {
        const ret = new FormatString(this.index, this.shorthandName, this.ifValue, this.elseValue);
        return ret;
    }
}
export class Variable extends TransformableMarker {
    constructor(name) {
        super();
        this.name = name;
    }
    resolve(resolver) {
        let value = resolver.resolve(this);
        if (this.transform) {
            value = this.transform.resolve(value || '');
        }
        if (value !== undefined) {
            this._children = [new Text(value)];
            return true;
        }
        return false;
    }
    toTextmateString() {
        let transformString = '';
        if (this.transform) {
            transformString = this.transform.toTextmateString();
        }
        if (this.children.length === 0) {
            return `\${${this.name}${transformString}}`;
        }
        else {
            return `\${${this.name}:${this.children.map(child => child.toTextmateString()).join('')}${transformString}}`;
        }
    }
    clone() {
        const ret = new Variable(this.name);
        if (this.transform) {
            ret.transform = this.transform.clone();
        }
        ret._children = this.children.map(child => child.clone());
        return ret;
    }
}
function walk(marker, visitor) {
    const stack = [...marker];
    while (stack.length > 0) {
        const marker = stack.shift();
        const recurse = visitor(marker);
        if (!recurse) {
            break;
        }
        stack.unshift(...marker.children);
    }
}
export class TextmateSnippet extends Marker {
    get placeholderInfo() {
        if (!this._placeholders) {
            const all = [];
            let last;
            this.walk(function (candidate) {
                if (candidate instanceof Placeholder) {
                    all.push(candidate);
                    last = !last || last.index < candidate.index ? candidate : last;
                }
                return true;
            });
            this._placeholders = { all, last };
        }
        return this._placeholders;
    }
    get placeholders() {
        const { all } = this.placeholderInfo;
        return all;
    }
    offset(marker) {
        let pos = 0;
        let found = false;
        this.walk(candidate => {
            if (candidate === marker) {
                found = true;
                return false;
            }
            pos += candidate.len();
            return true;
        });
        if (!found) {
            return -1;
        }
        return pos;
    }
    fullLen(marker) {
        let ret = 0;
        walk([marker], marker => {
            ret += marker.len();
            return true;
        });
        return ret;
    }
    enclosingPlaceholders(placeholder) {
        const ret = [];
        let { parent } = placeholder;
        while (parent) {
            if (parent instanceof Placeholder) {
                ret.push(parent);
            }
            parent = parent.parent;
        }
        return ret;
    }
    resolveVariables(resolver) {
        this.walk(candidate => {
            if (candidate instanceof Variable) {
                if (candidate.resolve(resolver)) {
                    this._placeholders = undefined;
                }
            }
            return true;
        });
        return this;
    }
    appendChild(child) {
        this._placeholders = undefined;
        return super.appendChild(child);
    }
    replace(child, others) {
        this._placeholders = undefined;
        return super.replace(child, others);
    }
    toTextmateString() {
        return this.children.reduce((prev, cur) => prev + cur.toTextmateString(), '');
    }
    clone() {
        const ret = new TextmateSnippet();
        this._children = this.children.map(child => child.clone());
        return ret;
    }
    walk(visitor) {
        walk(this.children, visitor);
    }
}
export class SnippetParser {
    constructor() {
        this._scanner = new Scanner();
        this._token = { type: 14, pos: 0, len: 0 };
    }
    static escape(value) {
        return value.replace(/\$|}|\\/g, '\\$&');
    }
    static asInsertText(value) {
        return new SnippetParser().parse(value).toString();
    }
    static guessNeedsClipboard(template) {
        return /\${?CLIPBOARD/.test(template);
    }
    parse(value, insertFinalTabstop, enforceFinalTabstop) {
        const snippet = new TextmateSnippet();
        this.parseFragment(value, snippet);
        this.ensureFinalTabstop(snippet, enforceFinalTabstop ?? false, insertFinalTabstop ?? false);
        return snippet;
    }
    parseFragment(value, snippet) {
        const offset = snippet.children.length;
        this._scanner.text(value);
        this._token = this._scanner.next();
        while (this._parse(snippet)) {
        }
        const placeholderDefaultValues = new Map();
        const incompletePlaceholders = [];
        snippet.walk(marker => {
            if (marker instanceof Placeholder) {
                if (marker.isFinalTabstop) {
                    placeholderDefaultValues.set(0, undefined);
                }
                else if (!placeholderDefaultValues.has(marker.index) && marker.children.length > 0) {
                    placeholderDefaultValues.set(marker.index, marker.children);
                }
                else {
                    incompletePlaceholders.push(marker);
                }
            }
            return true;
        });
        const fillInIncompletePlaceholder = (placeholder, stack) => {
            const defaultValues = placeholderDefaultValues.get(placeholder.index);
            if (!defaultValues) {
                return;
            }
            const clone = new Placeholder(placeholder.index);
            clone.transform = placeholder.transform;
            for (const child of defaultValues) {
                const newChild = child.clone();
                clone.appendChild(newChild);
                if (newChild instanceof Placeholder && placeholderDefaultValues.has(newChild.index) && !stack.has(newChild.index)) {
                    stack.add(newChild.index);
                    fillInIncompletePlaceholder(newChild, stack);
                    stack.delete(newChild.index);
                }
            }
            snippet.replace(placeholder, [clone]);
        };
        const stack = new Set();
        for (const placeholder of incompletePlaceholders) {
            fillInIncompletePlaceholder(placeholder, stack);
        }
        return snippet.children.slice(offset);
    }
    ensureFinalTabstop(snippet, enforceFinalTabstop, insertFinalTabstop) {
        if (enforceFinalTabstop || insertFinalTabstop && snippet.placeholders.length > 0) {
            const finalTabstop = snippet.placeholders.find(p => p.index === 0);
            if (!finalTabstop) {
                snippet.appendChild(new Placeholder(0));
            }
        }
    }
    _accept(type, value) {
        if (type === undefined || this._token.type === type) {
            const ret = !value ? true : this._scanner.tokenText(this._token);
            this._token = this._scanner.next();
            return ret;
        }
        return false;
    }
    _backTo(token) {
        this._scanner.pos = token.pos + token.len;
        this._token = token;
        return false;
    }
    _until(type) {
        const start = this._token;
        while (this._token.type !== type) {
            if (this._token.type === 14) {
                return false;
            }
            else if (this._token.type === 5) {
                const nextToken = this._scanner.next();
                if (nextToken.type !== 0
                    && nextToken.type !== 4
                    && nextToken.type !== 5) {
                    return false;
                }
            }
            this._token = this._scanner.next();
        }
        const value = this._scanner.value.substring(start.pos, this._token.pos).replace(/\\(\$|}|\\)/g, '$1');
        this._token = this._scanner.next();
        return value;
    }
    _parse(marker) {
        return this._parseEscaped(marker)
            || this._parseTabstopOrVariableName(marker)
            || this._parseComplexPlaceholder(marker)
            || this._parseComplexVariable(marker)
            || this._parseAnything(marker);
    }
    _parseEscaped(marker) {
        let value;
        if (value = this._accept(5, true)) {
            value = this._accept(0, true)
                || this._accept(4, true)
                || this._accept(5, true)
                || value;
            marker.appendChild(new Text(value));
            return true;
        }
        return false;
    }
    _parseTabstopOrVariableName(parent) {
        let value;
        const token = this._token;
        const match = this._accept(0)
            && (value = this._accept(9, true) || this._accept(8, true));
        if (!match) {
            return this._backTo(token);
        }
        parent.appendChild(/^\d+$/.test(value)
            ? new Placeholder(Number(value))
            : new Variable(value));
        return true;
    }
    _parseComplexPlaceholder(parent) {
        let index;
        const token = this._token;
        const match = this._accept(0)
            && this._accept(3)
            && (index = this._accept(8, true));
        if (!match) {
            return this._backTo(token);
        }
        const placeholder = new Placeholder(Number(index));
        if (this._accept(1)) {
            while (true) {
                if (this._accept(4)) {
                    parent.appendChild(placeholder);
                    return true;
                }
                if (this._parse(placeholder)) {
                    continue;
                }
                parent.appendChild(new Text('${' + index + ':'));
                placeholder.children.forEach(parent.appendChild, parent);
                return true;
            }
        }
        else if (placeholder.index > 0 && this._accept(7)) {
            const choice = new Choice();
            while (true) {
                if (this._parseChoiceElement(choice)) {
                    if (this._accept(2)) {
                        continue;
                    }
                    if (this._accept(7)) {
                        placeholder.appendChild(choice);
                        if (this._accept(4)) {
                            parent.appendChild(placeholder);
                            return true;
                        }
                    }
                }
                this._backTo(token);
                return false;
            }
        }
        else if (this._accept(6)) {
            if (this._parseTransform(placeholder)) {
                parent.appendChild(placeholder);
                return true;
            }
            this._backTo(token);
            return false;
        }
        else if (this._accept(4)) {
            parent.appendChild(placeholder);
            return true;
        }
        else {
            return this._backTo(token);
        }
    }
    _parseChoiceElement(parent) {
        const token = this._token;
        const values = [];
        while (true) {
            if (this._token.type === 2 || this._token.type === 7) {
                break;
            }
            let value;
            if (value = this._accept(5, true)) {
                value = this._accept(2, true)
                    || this._accept(7, true)
                    || this._accept(5, true)
                    || value;
            }
            else {
                value = this._accept(undefined, true);
            }
            if (!value) {
                this._backTo(token);
                return false;
            }
            values.push(value);
        }
        if (values.length === 0) {
            this._backTo(token);
            return false;
        }
        parent.appendChild(new Text(values.join('')));
        return true;
    }
    _parseComplexVariable(parent) {
        let name;
        const token = this._token;
        const match = this._accept(0)
            && this._accept(3)
            && (name = this._accept(9, true));
        if (!match) {
            return this._backTo(token);
        }
        const variable = new Variable(name);
        if (this._accept(1)) {
            while (true) {
                if (this._accept(4)) {
                    parent.appendChild(variable);
                    return true;
                }
                if (this._parse(variable)) {
                    continue;
                }
                parent.appendChild(new Text('${' + name + ':'));
                variable.children.forEach(parent.appendChild, parent);
                return true;
            }
        }
        else if (this._accept(6)) {
            if (this._parseTransform(variable)) {
                parent.appendChild(variable);
                return true;
            }
            this._backTo(token);
            return false;
        }
        else if (this._accept(4)) {
            parent.appendChild(variable);
            return true;
        }
        else {
            return this._backTo(token);
        }
    }
    _parseTransform(parent) {
        const transform = new Transform();
        let regexValue = '';
        let regexOptions = '';
        while (true) {
            if (this._accept(6)) {
                break;
            }
            let escaped;
            if (escaped = this._accept(5, true)) {
                escaped = this._accept(6, true) || escaped;
                regexValue += escaped;
                continue;
            }
            if (this._token.type !== 14) {
                regexValue += this._accept(undefined, true);
                continue;
            }
            return false;
        }
        while (true) {
            if (this._accept(6)) {
                break;
            }
            let escaped;
            if (escaped = this._accept(5, true)) {
                escaped = this._accept(5, true) || this._accept(6, true) || escaped;
                transform.appendChild(new Text(escaped));
                continue;
            }
            if (this._parseFormatString(transform) || this._parseAnything(transform)) {
                continue;
            }
            return false;
        }
        while (true) {
            if (this._accept(4)) {
                break;
            }
            if (this._token.type !== 14) {
                regexOptions += this._accept(undefined, true);
                continue;
            }
            return false;
        }
        try {
            transform.regexp = new RegExp(regexValue, regexOptions);
        }
        catch (e) {
            return false;
        }
        parent.transform = transform;
        return true;
    }
    _parseFormatString(parent) {
        const token = this._token;
        if (!this._accept(0)) {
            return false;
        }
        let complex = false;
        if (this._accept(3)) {
            complex = true;
        }
        const index = this._accept(8, true);
        if (!index) {
            this._backTo(token);
            return false;
        }
        else if (!complex) {
            parent.appendChild(new FormatString(Number(index)));
            return true;
        }
        else if (this._accept(4)) {
            parent.appendChild(new FormatString(Number(index)));
            return true;
        }
        else if (!this._accept(1)) {
            this._backTo(token);
            return false;
        }
        if (this._accept(6)) {
            const shorthand = this._accept(9, true);
            if (!shorthand || !this._accept(4)) {
                this._backTo(token);
                return false;
            }
            else {
                parent.appendChild(new FormatString(Number(index), shorthand));
                return true;
            }
        }
        else if (this._accept(11)) {
            const ifValue = this._until(4);
            if (ifValue) {
                parent.appendChild(new FormatString(Number(index), undefined, ifValue, undefined));
                return true;
            }
        }
        else if (this._accept(12)) {
            const elseValue = this._until(4);
            if (elseValue) {
                parent.appendChild(new FormatString(Number(index), undefined, undefined, elseValue));
                return true;
            }
        }
        else if (this._accept(13)) {
            const ifValue = this._until(1);
            if (ifValue) {
                const elseValue = this._until(4);
                if (elseValue) {
                    parent.appendChild(new FormatString(Number(index), undefined, ifValue, elseValue));
                    return true;
                }
            }
        }
        else {
            const elseValue = this._until(4);
            if (elseValue) {
                parent.appendChild(new FormatString(Number(index), undefined, undefined, elseValue));
                return true;
            }
        }
        this._backTo(token);
        return false;
    }
    _parseAnything(marker) {
        if (this._token.type !== 14) {
            marker.appendChild(new Text(this._scanner.tokenText(this._token)));
            this._accept(undefined);
            return true;
        }
        return false;
    }
}
