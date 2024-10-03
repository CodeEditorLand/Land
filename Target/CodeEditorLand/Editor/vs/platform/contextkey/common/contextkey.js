import { isChrome, isEdge, isFirefox, isLinux, isMacintosh, isSafari, isWeb, isWindows } from '../../../base/common/platform.js';
import { isFalsyOrWhitespace } from '../../../base/common/strings.js';
import { Scanner } from './scanner.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { localize } from '../../../nls.js';
import { illegalArgument } from '../../../base/common/errors.js';
const CONSTANT_VALUES = new Map();
CONSTANT_VALUES.set('false', false);
CONSTANT_VALUES.set('true', true);
CONSTANT_VALUES.set('isMac', isMacintosh);
CONSTANT_VALUES.set('isLinux', isLinux);
CONSTANT_VALUES.set('isWindows', isWindows);
CONSTANT_VALUES.set('isWeb', isWeb);
CONSTANT_VALUES.set('isMacNative', isMacintosh && !isWeb);
CONSTANT_VALUES.set('isEdge', isEdge);
CONSTANT_VALUES.set('isFirefox', isFirefox);
CONSTANT_VALUES.set('isChrome', isChrome);
CONSTANT_VALUES.set('isSafari', isSafari);
export function setConstant(key, value) {
    if (CONSTANT_VALUES.get(key) !== undefined) {
        throw illegalArgument('contextkey.setConstant(k, v) invoked with already set constant `k`');
    }
    CONSTANT_VALUES.set(key, value);
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
const defaultConfig = {
    regexParsingWithErrorRecovery: true
};
const errorEmptyString = localize('contextkey.parser.error.emptyString', "Empty context key expression");
const hintEmptyString = localize('contextkey.parser.error.emptyString.hint', "Did you forget to write an expression? You can also put 'false' or 'true' to always evaluate to false or true, respectively.");
const errorNoInAfterNot = localize('contextkey.parser.error.noInAfterNot', "'in' after 'not'.");
const errorClosingParenthesis = localize('contextkey.parser.error.closingParenthesis', "closing parenthesis ')'");
const errorUnexpectedToken = localize('contextkey.parser.error.unexpectedToken', "Unexpected token");
const hintUnexpectedToken = localize('contextkey.parser.error.unexpectedToken.hint', "Did you forget to put && or || before the token?");
const errorUnexpectedEOF = localize('contextkey.parser.error.unexpectedEOF', "Unexpected end of expression");
const hintUnexpectedEOF = localize('contextkey.parser.error.unexpectedEOF.hint', "Did you forget to put a context key?");
export class Parser {
    static { this._parseError = new Error(); }
    get lexingErrors() {
        return this._scanner.errors;
    }
    get parsingErrors() {
        return this._parsingErrors;
    }
    constructor(_config = defaultConfig) {
        this._config = _config;
        this._scanner = new Scanner();
        this._tokens = [];
        this._current = 0;
        this._parsingErrors = [];
        this._flagsGYRe = /g|y/g;
    }
    parse(input) {
        if (input === '') {
            this._parsingErrors.push({ message: errorEmptyString, offset: 0, lexeme: '', additionalInfo: hintEmptyString });
            return undefined;
        }
        this._tokens = this._scanner.reset(input).scan();
        this._current = 0;
        this._parsingErrors = [];
        try {
            const expr = this._expr();
            if (!this._isAtEnd()) {
                const peek = this._peek();
                const additionalInfo = peek.type === 17 ? hintUnexpectedToken : undefined;
                this._parsingErrors.push({ message: errorUnexpectedToken, offset: peek.offset, lexeme: Scanner.getLexeme(peek), additionalInfo });
                throw Parser._parseError;
            }
            return expr;
        }
        catch (e) {
            if (!(e === Parser._parseError)) {
                throw e;
            }
            return undefined;
        }
    }
    _expr() {
        return this._or();
    }
    _or() {
        const expr = [this._and()];
        while (this._matchOne(16)) {
            const right = this._and();
            expr.push(right);
        }
        return expr.length === 1 ? expr[0] : ContextKeyExpr.or(...expr);
    }
    _and() {
        const expr = [this._term()];
        while (this._matchOne(15)) {
            const right = this._term();
            expr.push(right);
        }
        return expr.length === 1 ? expr[0] : ContextKeyExpr.and(...expr);
    }
    _term() {
        if (this._matchOne(2)) {
            const peek = this._peek();
            switch (peek.type) {
                case 11:
                    this._advance();
                    return ContextKeyFalseExpr.INSTANCE;
                case 12:
                    this._advance();
                    return ContextKeyTrueExpr.INSTANCE;
                case 0: {
                    this._advance();
                    const expr = this._expr();
                    this._consume(1, errorClosingParenthesis);
                    return expr?.negate();
                }
                case 17:
                    this._advance();
                    return ContextKeyNotExpr.create(peek.lexeme);
                default:
                    throw this._errExpectedButGot(`KEY | true | false | '(' expression ')'`, peek);
            }
        }
        return this._primary();
    }
    _primary() {
        const peek = this._peek();
        switch (peek.type) {
            case 11:
                this._advance();
                return ContextKeyExpr.true();
            case 12:
                this._advance();
                return ContextKeyExpr.false();
            case 0: {
                this._advance();
                const expr = this._expr();
                this._consume(1, errorClosingParenthesis);
                return expr;
            }
            case 17: {
                const key = peek.lexeme;
                this._advance();
                if (this._matchOne(9)) {
                    const expr = this._peek();
                    if (!this._config.regexParsingWithErrorRecovery) {
                        this._advance();
                        if (expr.type !== 10) {
                            throw this._errExpectedButGot(`REGEX`, expr);
                        }
                        const regexLexeme = expr.lexeme;
                        const closingSlashIndex = regexLexeme.lastIndexOf('/');
                        const flags = closingSlashIndex === regexLexeme.length - 1 ? undefined : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
                        let regexp;
                        try {
                            regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
                        }
                        catch (e) {
                            throw this._errExpectedButGot(`REGEX`, expr);
                        }
                        return ContextKeyRegexExpr.create(key, regexp);
                    }
                    switch (expr.type) {
                        case 10:
                        case 19: {
                            const lexemeReconstruction = [expr.lexeme];
                            this._advance();
                            let followingToken = this._peek();
                            let parenBalance = 0;
                            for (let i = 0; i < expr.lexeme.length; i++) {
                                if (expr.lexeme.charCodeAt(i) === 40) {
                                    parenBalance++;
                                }
                                else if (expr.lexeme.charCodeAt(i) === 41) {
                                    parenBalance--;
                                }
                            }
                            while (!this._isAtEnd() && followingToken.type !== 15 && followingToken.type !== 16) {
                                switch (followingToken.type) {
                                    case 0:
                                        parenBalance++;
                                        break;
                                    case 1:
                                        parenBalance--;
                                        break;
                                    case 10:
                                    case 18:
                                        for (let i = 0; i < followingToken.lexeme.length; i++) {
                                            if (followingToken.lexeme.charCodeAt(i) === 40) {
                                                parenBalance++;
                                            }
                                            else if (expr.lexeme.charCodeAt(i) === 41) {
                                                parenBalance--;
                                            }
                                        }
                                }
                                if (parenBalance < 0) {
                                    break;
                                }
                                lexemeReconstruction.push(Scanner.getLexeme(followingToken));
                                this._advance();
                                followingToken = this._peek();
                            }
                            const regexLexeme = lexemeReconstruction.join('');
                            const closingSlashIndex = regexLexeme.lastIndexOf('/');
                            const flags = closingSlashIndex === regexLexeme.length - 1 ? undefined : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
                            let regexp;
                            try {
                                regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
                            }
                            catch (e) {
                                throw this._errExpectedButGot(`REGEX`, expr);
                            }
                            return ContextKeyExpr.regex(key, regexp);
                        }
                        case 18: {
                            const serializedValue = expr.lexeme;
                            this._advance();
                            let regex = null;
                            if (!isFalsyOrWhitespace(serializedValue)) {
                                const start = serializedValue.indexOf('/');
                                const end = serializedValue.lastIndexOf('/');
                                if (start !== end && start >= 0) {
                                    const value = serializedValue.slice(start + 1, end);
                                    const caseIgnoreFlag = serializedValue[end + 1] === 'i' ? 'i' : '';
                                    try {
                                        regex = new RegExp(value, caseIgnoreFlag);
                                    }
                                    catch (_e) {
                                        throw this._errExpectedButGot(`REGEX`, expr);
                                    }
                                }
                            }
                            if (regex === null) {
                                throw this._errExpectedButGot('REGEX', expr);
                            }
                            return ContextKeyRegexExpr.create(key, regex);
                        }
                        default:
                            throw this._errExpectedButGot('REGEX', this._peek());
                    }
                }
                if (this._matchOne(14)) {
                    this._consume(13, errorNoInAfterNot);
                    const right = this._value();
                    return ContextKeyExpr.notIn(key, right);
                }
                const maybeOp = this._peek().type;
                switch (maybeOp) {
                    case 3: {
                        this._advance();
                        const right = this._value();
                        if (this._previous().type === 18) {
                            return ContextKeyExpr.equals(key, right);
                        }
                        switch (right) {
                            case 'true':
                                return ContextKeyExpr.has(key);
                            case 'false':
                                return ContextKeyExpr.not(key);
                            default:
                                return ContextKeyExpr.equals(key, right);
                        }
                    }
                    case 4: {
                        this._advance();
                        const right = this._value();
                        if (this._previous().type === 18) {
                            return ContextKeyExpr.notEquals(key, right);
                        }
                        switch (right) {
                            case 'true':
                                return ContextKeyExpr.not(key);
                            case 'false':
                                return ContextKeyExpr.has(key);
                            default:
                                return ContextKeyExpr.notEquals(key, right);
                        }
                    }
                    case 5:
                        this._advance();
                        return ContextKeySmallerExpr.create(key, this._value());
                    case 6:
                        this._advance();
                        return ContextKeySmallerEqualsExpr.create(key, this._value());
                    case 7:
                        this._advance();
                        return ContextKeyGreaterExpr.create(key, this._value());
                    case 8:
                        this._advance();
                        return ContextKeyGreaterEqualsExpr.create(key, this._value());
                    case 13:
                        this._advance();
                        return ContextKeyExpr.in(key, this._value());
                    default:
                        return ContextKeyExpr.has(key);
                }
            }
            case 20:
                this._parsingErrors.push({ message: errorUnexpectedEOF, offset: peek.offset, lexeme: '', additionalInfo: hintUnexpectedEOF });
                throw Parser._parseError;
            default:
                throw this._errExpectedButGot(`true | false | KEY \n\t| KEY '=~' REGEX \n\t| KEY ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not' 'in') value`, this._peek());
        }
    }
    _value() {
        const token = this._peek();
        switch (token.type) {
            case 17:
            case 18:
                this._advance();
                return token.lexeme;
            case 11:
                this._advance();
                return 'true';
            case 12:
                this._advance();
                return 'false';
            case 13:
                this._advance();
                return 'in';
            default:
                return '';
        }
    }
    _removeFlagsGY(flags) {
        return flags.replaceAll(this._flagsGYRe, '');
    }
    _previous() {
        return this._tokens[this._current - 1];
    }
    _matchOne(token) {
        if (this._check(token)) {
            this._advance();
            return true;
        }
        return false;
    }
    _advance() {
        if (!this._isAtEnd()) {
            this._current++;
        }
        return this._previous();
    }
    _consume(type, message) {
        if (this._check(type)) {
            return this._advance();
        }
        throw this._errExpectedButGot(message, this._peek());
    }
    _errExpectedButGot(expected, got, additionalInfo) {
        const message = localize('contextkey.parser.error.expectedButGot', "Expected: {0}\nReceived: '{1}'.", expected, Scanner.getLexeme(got));
        const offset = got.offset;
        const lexeme = Scanner.getLexeme(got);
        this._parsingErrors.push({ message, offset, lexeme, additionalInfo });
        return Parser._parseError;
    }
    _check(type) {
        return this._peek().type === type;
    }
    _peek() {
        return this._tokens[this._current];
    }
    _isAtEnd() {
        return this._peek().type === 20;
    }
}
export class ContextKeyExpr {
    static false() {
        return ContextKeyFalseExpr.INSTANCE;
    }
    static true() {
        return ContextKeyTrueExpr.INSTANCE;
    }
    static has(key) {
        return ContextKeyDefinedExpr.create(key);
    }
    static equals(key, value) {
        return ContextKeyEqualsExpr.create(key, value);
    }
    static notEquals(key, value) {
        return ContextKeyNotEqualsExpr.create(key, value);
    }
    static regex(key, value) {
        return ContextKeyRegexExpr.create(key, value);
    }
    static in(key, value) {
        return ContextKeyInExpr.create(key, value);
    }
    static notIn(key, value) {
        return ContextKeyNotInExpr.create(key, value);
    }
    static not(key) {
        return ContextKeyNotExpr.create(key);
    }
    static and(...expr) {
        return ContextKeyAndExpr.create(expr, null, true);
    }
    static or(...expr) {
        return ContextKeyOrExpr.create(expr, null, true);
    }
    static greater(key, value) {
        return ContextKeyGreaterExpr.create(key, value);
    }
    static greaterEquals(key, value) {
        return ContextKeyGreaterEqualsExpr.create(key, value);
    }
    static smaller(key, value) {
        return ContextKeySmallerExpr.create(key, value);
    }
    static smallerEquals(key, value) {
        return ContextKeySmallerEqualsExpr.create(key, value);
    }
    static { this._parser = new Parser({ regexParsingWithErrorRecovery: false }); }
    static deserialize(serialized) {
        if (serialized === undefined || serialized === null) {
            return undefined;
        }
        const expr = this._parser.parse(serialized);
        return expr;
    }
}
export function validateWhenClauses(whenClauses) {
    const parser = new Parser({ regexParsingWithErrorRecovery: false });
    return whenClauses.map(whenClause => {
        parser.parse(whenClause);
        if (parser.lexingErrors.length > 0) {
            return parser.lexingErrors.map((se) => ({
                errorMessage: se.additionalInfo ?
                    localize('contextkey.scanner.errorForLinterWithHint', "Unexpected token. Hint: {0}", se.additionalInfo) :
                    localize('contextkey.scanner.errorForLinter', "Unexpected token."),
                offset: se.offset,
                length: se.lexeme.length,
            }));
        }
        else if (parser.parsingErrors.length > 0) {
            return parser.parsingErrors.map((pe) => ({
                errorMessage: pe.additionalInfo ? `${pe.message}. ${pe.additionalInfo}` : pe.message,
                offset: pe.offset,
                length: pe.lexeme.length,
            }));
        }
        else {
            return [];
        }
    });
}
export function expressionsAreEqualWithConstantSubstitution(a, b) {
    const aExpr = a ? a.substituteConstants() : undefined;
    const bExpr = b ? b.substituteConstants() : undefined;
    if (!aExpr && !bExpr) {
        return true;
    }
    if (!aExpr || !bExpr) {
        return false;
    }
    return aExpr.equals(bExpr);
}
function cmp(a, b) {
    return a.cmp(b);
}
export class ContextKeyFalseExpr {
    static { this.INSTANCE = new ContextKeyFalseExpr(); }
    constructor() {
        this.type = 0;
    }
    cmp(other) {
        return this.type - other.type;
    }
    equals(other) {
        return (other.type === this.type);
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        return false;
    }
    serialize() {
        return 'false';
    }
    keys() {
        return [];
    }
    map(mapFnc) {
        return this;
    }
    negate() {
        return ContextKeyTrueExpr.INSTANCE;
    }
}
export class ContextKeyTrueExpr {
    static { this.INSTANCE = new ContextKeyTrueExpr(); }
    constructor() {
        this.type = 1;
    }
    cmp(other) {
        return this.type - other.type;
    }
    equals(other) {
        return (other.type === this.type);
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        return true;
    }
    serialize() {
        return 'true';
    }
    keys() {
        return [];
    }
    map(mapFnc) {
        return this;
    }
    negate() {
        return ContextKeyFalseExpr.INSTANCE;
    }
}
export class ContextKeyDefinedExpr {
    static create(key, negated = null) {
        const constantValue = CONSTANT_VALUES.get(key);
        if (typeof constantValue === 'boolean') {
            return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
        }
        return new ContextKeyDefinedExpr(key, negated);
    }
    constructor(key, negated) {
        this.key = key;
        this.negated = negated;
        this.type = 2;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp1(this.key, other.key);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key);
        }
        return false;
    }
    substituteConstants() {
        const constantValue = CONSTANT_VALUES.get(this.key);
        if (typeof constantValue === 'boolean') {
            return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
        }
        return this;
    }
    evaluate(context) {
        return (!!context.getValue(this.key));
    }
    serialize() {
        return this.key;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapDefined(this.key);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeyNotExpr.create(this.key, this);
        }
        return this.negated;
    }
}
export class ContextKeyEqualsExpr {
    static create(key, value, negated = null) {
        if (typeof value === 'boolean') {
            return (value ? ContextKeyDefinedExpr.create(key, negated) : ContextKeyNotExpr.create(key, negated));
        }
        const constantValue = CONSTANT_VALUES.get(key);
        if (typeof constantValue === 'boolean') {
            const trueValue = constantValue ? 'true' : 'false';
            return (value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE);
        }
        return new ContextKeyEqualsExpr(key, value, negated);
    }
    constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 4;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key && this.value === other.value);
        }
        return false;
    }
    substituteConstants() {
        const constantValue = CONSTANT_VALUES.get(this.key);
        if (typeof constantValue === 'boolean') {
            const trueValue = constantValue ? 'true' : 'false';
            return (this.value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE);
        }
        return this;
    }
    evaluate(context) {
        return (context.getValue(this.key) == this.value);
    }
    serialize() {
        return `${this.key} == '${this.value}'`;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapEquals(this.key, this.value);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeyNotEqualsExpr.create(this.key, this.value, this);
        }
        return this.negated;
    }
}
export class ContextKeyInExpr {
    static create(key, valueKey) {
        return new ContextKeyInExpr(key, valueKey);
    }
    constructor(key, valueKey) {
        this.key = key;
        this.valueKey = valueKey;
        this.type = 10;
        this.negated = null;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp2(this.key, this.valueKey, other.key, other.valueKey);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key && this.valueKey === other.valueKey);
        }
        return false;
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        const source = context.getValue(this.valueKey);
        const item = context.getValue(this.key);
        if (Array.isArray(source)) {
            return source.includes(item);
        }
        if (typeof item === 'string' && typeof source === 'object' && source !== null) {
            return hasOwnProperty.call(source, item);
        }
        return false;
    }
    serialize() {
        return `${this.key} in '${this.valueKey}'`;
    }
    keys() {
        return [this.key, this.valueKey];
    }
    map(mapFnc) {
        return mapFnc.mapIn(this.key, this.valueKey);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeyNotInExpr.create(this.key, this.valueKey);
        }
        return this.negated;
    }
}
export class ContextKeyNotInExpr {
    static create(key, valueKey) {
        return new ContextKeyNotInExpr(key, valueKey);
    }
    constructor(key, valueKey) {
        this.key = key;
        this.valueKey = valueKey;
        this.type = 11;
        this._negated = ContextKeyInExpr.create(key, valueKey);
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return this._negated.cmp(other._negated);
    }
    equals(other) {
        if (other.type === this.type) {
            return this._negated.equals(other._negated);
        }
        return false;
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        return !this._negated.evaluate(context);
    }
    serialize() {
        return `${this.key} not in '${this.valueKey}'`;
    }
    keys() {
        return this._negated.keys();
    }
    map(mapFnc) {
        return mapFnc.mapNotIn(this.key, this.valueKey);
    }
    negate() {
        return this._negated;
    }
}
export class ContextKeyNotEqualsExpr {
    static create(key, value, negated = null) {
        if (typeof value === 'boolean') {
            if (value) {
                return ContextKeyNotExpr.create(key, negated);
            }
            return ContextKeyDefinedExpr.create(key, negated);
        }
        const constantValue = CONSTANT_VALUES.get(key);
        if (typeof constantValue === 'boolean') {
            const falseValue = constantValue ? 'true' : 'false';
            return (value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
        }
        return new ContextKeyNotEqualsExpr(key, value, negated);
    }
    constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 5;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key && this.value === other.value);
        }
        return false;
    }
    substituteConstants() {
        const constantValue = CONSTANT_VALUES.get(this.key);
        if (typeof constantValue === 'boolean') {
            const falseValue = constantValue ? 'true' : 'false';
            return (this.value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
        }
        return this;
    }
    evaluate(context) {
        return (context.getValue(this.key) != this.value);
    }
    serialize() {
        return `${this.key} != '${this.value}'`;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapNotEquals(this.key, this.value);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeyEqualsExpr.create(this.key, this.value, this);
        }
        return this.negated;
    }
}
export class ContextKeyNotExpr {
    static create(key, negated = null) {
        const constantValue = CONSTANT_VALUES.get(key);
        if (typeof constantValue === 'boolean') {
            return (constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
        }
        return new ContextKeyNotExpr(key, negated);
    }
    constructor(key, negated) {
        this.key = key;
        this.negated = negated;
        this.type = 3;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp1(this.key, other.key);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key);
        }
        return false;
    }
    substituteConstants() {
        const constantValue = CONSTANT_VALUES.get(this.key);
        if (typeof constantValue === 'boolean') {
            return (constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
        }
        return this;
    }
    evaluate(context) {
        return (!context.getValue(this.key));
    }
    serialize() {
        return `!${this.key}`;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapNot(this.key);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeyDefinedExpr.create(this.key, this);
        }
        return this.negated;
    }
}
function withFloatOrStr(value, callback) {
    if (typeof value === 'string') {
        const n = parseFloat(value);
        if (!isNaN(n)) {
            value = n;
        }
    }
    if (typeof value === 'string' || typeof value === 'number') {
        return callback(value);
    }
    return ContextKeyFalseExpr.INSTANCE;
}
export class ContextKeyGreaterExpr {
    static create(key, _value, negated = null) {
        return withFloatOrStr(_value, (value) => new ContextKeyGreaterExpr(key, value, negated));
    }
    constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 12;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key && this.value === other.value);
        }
        return false;
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        if (typeof this.value === 'string') {
            return false;
        }
        return (parseFloat(context.getValue(this.key)) > this.value);
    }
    serialize() {
        return `${this.key} > ${this.value}`;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapGreater(this.key, this.value);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeySmallerEqualsExpr.create(this.key, this.value, this);
        }
        return this.negated;
    }
}
export class ContextKeyGreaterEqualsExpr {
    static create(key, _value, negated = null) {
        return withFloatOrStr(_value, (value) => new ContextKeyGreaterEqualsExpr(key, value, negated));
    }
    constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 13;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key && this.value === other.value);
        }
        return false;
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        if (typeof this.value === 'string') {
            return false;
        }
        return (parseFloat(context.getValue(this.key)) >= this.value);
    }
    serialize() {
        return `${this.key} >= ${this.value}`;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapGreaterEquals(this.key, this.value);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeySmallerExpr.create(this.key, this.value, this);
        }
        return this.negated;
    }
}
export class ContextKeySmallerExpr {
    static create(key, _value, negated = null) {
        return withFloatOrStr(_value, (value) => new ContextKeySmallerExpr(key, value, negated));
    }
    constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 14;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key && this.value === other.value);
        }
        return false;
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        if (typeof this.value === 'string') {
            return false;
        }
        return (parseFloat(context.getValue(this.key)) < this.value);
    }
    serialize() {
        return `${this.key} < ${this.value}`;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapSmaller(this.key, this.value);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeyGreaterEqualsExpr.create(this.key, this.value, this);
        }
        return this.negated;
    }
}
export class ContextKeySmallerEqualsExpr {
    static create(key, _value, negated = null) {
        return withFloatOrStr(_value, (value) => new ContextKeySmallerEqualsExpr(key, value, negated));
    }
    constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 15;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
    }
    equals(other) {
        if (other.type === this.type) {
            return (this.key === other.key && this.value === other.value);
        }
        return false;
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        if (typeof this.value === 'string') {
            return false;
        }
        return (parseFloat(context.getValue(this.key)) <= this.value);
    }
    serialize() {
        return `${this.key} <= ${this.value}`;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapSmallerEquals(this.key, this.value);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeyGreaterExpr.create(this.key, this.value, this);
        }
        return this.negated;
    }
}
export class ContextKeyRegexExpr {
    static create(key, regexp) {
        return new ContextKeyRegexExpr(key, regexp);
    }
    constructor(key, regexp) {
        this.key = key;
        this.regexp = regexp;
        this.type = 7;
        this.negated = null;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        if (this.key < other.key) {
            return -1;
        }
        if (this.key > other.key) {
            return 1;
        }
        const thisSource = this.regexp ? this.regexp.source : '';
        const otherSource = other.regexp ? other.regexp.source : '';
        if (thisSource < otherSource) {
            return -1;
        }
        if (thisSource > otherSource) {
            return 1;
        }
        return 0;
    }
    equals(other) {
        if (other.type === this.type) {
            const thisSource = this.regexp ? this.regexp.source : '';
            const otherSource = other.regexp ? other.regexp.source : '';
            return (this.key === other.key && thisSource === otherSource);
        }
        return false;
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        const value = context.getValue(this.key);
        return this.regexp ? this.regexp.test(value) : false;
    }
    serialize() {
        const value = this.regexp
            ? `/${this.regexp.source}/${this.regexp.flags}`
            : '/invalid/';
        return `${this.key} =~ ${value}`;
    }
    keys() {
        return [this.key];
    }
    map(mapFnc) {
        return mapFnc.mapRegex(this.key, this.regexp);
    }
    negate() {
        if (!this.negated) {
            this.negated = ContextKeyNotRegexExpr.create(this);
        }
        return this.negated;
    }
}
export class ContextKeyNotRegexExpr {
    static create(actual) {
        return new ContextKeyNotRegexExpr(actual);
    }
    constructor(_actual) {
        this._actual = _actual;
        this.type = 8;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        return this._actual.cmp(other._actual);
    }
    equals(other) {
        if (other.type === this.type) {
            return this._actual.equals(other._actual);
        }
        return false;
    }
    substituteConstants() {
        return this;
    }
    evaluate(context) {
        return !this._actual.evaluate(context);
    }
    serialize() {
        return `!(${this._actual.serialize()})`;
    }
    keys() {
        return this._actual.keys();
    }
    map(mapFnc) {
        return new ContextKeyNotRegexExpr(this._actual.map(mapFnc));
    }
    negate() {
        return this._actual;
    }
}
function eliminateConstantsInArray(arr) {
    let newArr = null;
    for (let i = 0, len = arr.length; i < len; i++) {
        const newExpr = arr[i].substituteConstants();
        if (arr[i] !== newExpr) {
            if (newArr === null) {
                newArr = [];
                for (let j = 0; j < i; j++) {
                    newArr[j] = arr[j];
                }
            }
        }
        if (newArr !== null) {
            newArr[i] = newExpr;
        }
    }
    if (newArr === null) {
        return arr;
    }
    return newArr;
}
export class ContextKeyAndExpr {
    static create(_expr, negated, extraRedundantCheck) {
        return ContextKeyAndExpr._normalizeArr(_expr, negated, extraRedundantCheck);
    }
    constructor(expr, negated) {
        this.expr = expr;
        this.negated = negated;
        this.type = 6;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        if (this.expr.length < other.expr.length) {
            return -1;
        }
        if (this.expr.length > other.expr.length) {
            return 1;
        }
        for (let i = 0, len = this.expr.length; i < len; i++) {
            const r = cmp(this.expr[i], other.expr[i]);
            if (r !== 0) {
                return r;
            }
        }
        return 0;
    }
    equals(other) {
        if (other.type === this.type) {
            if (this.expr.length !== other.expr.length) {
                return false;
            }
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (!this.expr[i].equals(other.expr[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    substituteConstants() {
        const exprArr = eliminateConstantsInArray(this.expr);
        if (exprArr === this.expr) {
            return this;
        }
        return ContextKeyAndExpr.create(exprArr, this.negated, false);
    }
    evaluate(context) {
        for (let i = 0, len = this.expr.length; i < len; i++) {
            if (!this.expr[i].evaluate(context)) {
                return false;
            }
        }
        return true;
    }
    static _normalizeArr(arr, negated, extraRedundantCheck) {
        const expr = [];
        let hasTrue = false;
        for (const e of arr) {
            if (!e) {
                continue;
            }
            if (e.type === 1) {
                hasTrue = true;
                continue;
            }
            if (e.type === 0) {
                return ContextKeyFalseExpr.INSTANCE;
            }
            if (e.type === 6) {
                expr.push(...e.expr);
                continue;
            }
            expr.push(e);
        }
        if (expr.length === 0 && hasTrue) {
            return ContextKeyTrueExpr.INSTANCE;
        }
        if (expr.length === 0) {
            return undefined;
        }
        if (expr.length === 1) {
            return expr[0];
        }
        expr.sort(cmp);
        for (let i = 1; i < expr.length; i++) {
            if (expr[i - 1].equals(expr[i])) {
                expr.splice(i, 1);
                i--;
            }
        }
        if (expr.length === 1) {
            return expr[0];
        }
        while (expr.length > 1) {
            const lastElement = expr[expr.length - 1];
            if (lastElement.type !== 9) {
                break;
            }
            expr.pop();
            const secondToLastElement = expr.pop();
            const isFinished = (expr.length === 0);
            const resultElement = ContextKeyOrExpr.create(lastElement.expr.map(el => ContextKeyAndExpr.create([el, secondToLastElement], null, extraRedundantCheck)), null, isFinished);
            if (resultElement) {
                expr.push(resultElement);
                expr.sort(cmp);
            }
        }
        if (expr.length === 1) {
            return expr[0];
        }
        if (extraRedundantCheck) {
            for (let i = 0; i < expr.length; i++) {
                for (let j = i + 1; j < expr.length; j++) {
                    if (expr[i].negate().equals(expr[j])) {
                        return ContextKeyFalseExpr.INSTANCE;
                    }
                }
            }
            if (expr.length === 1) {
                return expr[0];
            }
        }
        return new ContextKeyAndExpr(expr, negated);
    }
    serialize() {
        return this.expr.map(e => e.serialize()).join(' && ');
    }
    keys() {
        const result = [];
        for (const expr of this.expr) {
            result.push(...expr.keys());
        }
        return result;
    }
    map(mapFnc) {
        return new ContextKeyAndExpr(this.expr.map(expr => expr.map(mapFnc)), null);
    }
    negate() {
        if (!this.negated) {
            const result = [];
            for (const expr of this.expr) {
                result.push(expr.negate());
            }
            this.negated = ContextKeyOrExpr.create(result, this, true);
        }
        return this.negated;
    }
}
export class ContextKeyOrExpr {
    static create(_expr, negated, extraRedundantCheck) {
        return ContextKeyOrExpr._normalizeArr(_expr, negated, extraRedundantCheck);
    }
    constructor(expr, negated) {
        this.expr = expr;
        this.negated = negated;
        this.type = 9;
    }
    cmp(other) {
        if (other.type !== this.type) {
            return this.type - other.type;
        }
        if (this.expr.length < other.expr.length) {
            return -1;
        }
        if (this.expr.length > other.expr.length) {
            return 1;
        }
        for (let i = 0, len = this.expr.length; i < len; i++) {
            const r = cmp(this.expr[i], other.expr[i]);
            if (r !== 0) {
                return r;
            }
        }
        return 0;
    }
    equals(other) {
        if (other.type === this.type) {
            if (this.expr.length !== other.expr.length) {
                return false;
            }
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (!this.expr[i].equals(other.expr[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    substituteConstants() {
        const exprArr = eliminateConstantsInArray(this.expr);
        if (exprArr === this.expr) {
            return this;
        }
        return ContextKeyOrExpr.create(exprArr, this.negated, false);
    }
    evaluate(context) {
        for (let i = 0, len = this.expr.length; i < len; i++) {
            if (this.expr[i].evaluate(context)) {
                return true;
            }
        }
        return false;
    }
    static _normalizeArr(arr, negated, extraRedundantCheck) {
        let expr = [];
        let hasFalse = false;
        if (arr) {
            for (let i = 0, len = arr.length; i < len; i++) {
                const e = arr[i];
                if (!e) {
                    continue;
                }
                if (e.type === 0) {
                    hasFalse = true;
                    continue;
                }
                if (e.type === 1) {
                    return ContextKeyTrueExpr.INSTANCE;
                }
                if (e.type === 9) {
                    expr = expr.concat(e.expr);
                    continue;
                }
                expr.push(e);
            }
            if (expr.length === 0 && hasFalse) {
                return ContextKeyFalseExpr.INSTANCE;
            }
            expr.sort(cmp);
        }
        if (expr.length === 0) {
            return undefined;
        }
        if (expr.length === 1) {
            return expr[0];
        }
        for (let i = 1; i < expr.length; i++) {
            if (expr[i - 1].equals(expr[i])) {
                expr.splice(i, 1);
                i--;
            }
        }
        if (expr.length === 1) {
            return expr[0];
        }
        if (extraRedundantCheck) {
            for (let i = 0; i < expr.length; i++) {
                for (let j = i + 1; j < expr.length; j++) {
                    if (expr[i].negate().equals(expr[j])) {
                        return ContextKeyTrueExpr.INSTANCE;
                    }
                }
            }
            if (expr.length === 1) {
                return expr[0];
            }
        }
        return new ContextKeyOrExpr(expr, negated);
    }
    serialize() {
        return this.expr.map(e => e.serialize()).join(' || ');
    }
    keys() {
        const result = [];
        for (const expr of this.expr) {
            result.push(...expr.keys());
        }
        return result;
    }
    map(mapFnc) {
        return new ContextKeyOrExpr(this.expr.map(expr => expr.map(mapFnc)), null);
    }
    negate() {
        if (!this.negated) {
            const result = [];
            for (const expr of this.expr) {
                result.push(expr.negate());
            }
            while (result.length > 1) {
                const LEFT = result.shift();
                const RIGHT = result.shift();
                const all = [];
                for (const left of getTerminals(LEFT)) {
                    for (const right of getTerminals(RIGHT)) {
                        all.push(ContextKeyAndExpr.create([left, right], null, false));
                    }
                }
                result.unshift(ContextKeyOrExpr.create(all, null, false));
            }
            this.negated = ContextKeyOrExpr.create(result, this, true);
        }
        return this.negated;
    }
}
export class RawContextKey extends ContextKeyDefinedExpr {
    static { this._info = []; }
    static all() {
        return RawContextKey._info.values();
    }
    constructor(key, defaultValue, metaOrHide) {
        super(key, null);
        this._defaultValue = defaultValue;
        if (typeof metaOrHide === 'object') {
            RawContextKey._info.push({ ...metaOrHide, key });
        }
        else if (metaOrHide !== true) {
            RawContextKey._info.push({ key, description: metaOrHide, type: defaultValue !== null && defaultValue !== undefined ? typeof defaultValue : undefined });
        }
    }
    bindTo(target) {
        return target.createKey(this.key, this._defaultValue);
    }
    getValue(target) {
        return target.getContextKeyValue(this.key);
    }
    toNegated() {
        return this.negate();
    }
    isEqualTo(value) {
        return ContextKeyEqualsExpr.create(this.key, value);
    }
    notEqualsTo(value) {
        return ContextKeyNotEqualsExpr.create(this.key, value);
    }
}
export const IContextKeyService = createDecorator('contextKeyService');
function cmp1(key1, key2) {
    if (key1 < key2) {
        return -1;
    }
    if (key1 > key2) {
        return 1;
    }
    return 0;
}
function cmp2(key1, value1, key2, value2) {
    if (key1 < key2) {
        return -1;
    }
    if (key1 > key2) {
        return 1;
    }
    if (value1 < value2) {
        return -1;
    }
    if (value1 > value2) {
        return 1;
    }
    return 0;
}
export function implies(p, q) {
    if (p.type === 0 || q.type === 1) {
        return true;
    }
    if (p.type === 9) {
        if (q.type === 9) {
            return allElementsIncluded(p.expr, q.expr);
        }
        return false;
    }
    if (q.type === 9) {
        for (const element of q.expr) {
            if (implies(p, element)) {
                return true;
            }
        }
        return false;
    }
    if (p.type === 6) {
        if (q.type === 6) {
            return allElementsIncluded(q.expr, p.expr);
        }
        for (const element of p.expr) {
            if (implies(element, q)) {
                return true;
            }
        }
        return false;
    }
    return p.equals(q);
}
function allElementsIncluded(p, q) {
    let pIndex = 0;
    let qIndex = 0;
    while (pIndex < p.length && qIndex < q.length) {
        const cmp = p[pIndex].cmp(q[qIndex]);
        if (cmp < 0) {
            return false;
        }
        else if (cmp === 0) {
            pIndex++;
            qIndex++;
        }
        else {
            qIndex++;
        }
    }
    return (pIndex === p.length);
}
function getTerminals(node) {
    if (node.type === 9) {
        return node.expr;
    }
    return [node];
}
