import { CachedFunction } from '../../../../base/common/cache.js';
import { createBracketOrRegExp } from './richEditBrackets.js';
export class LanguageBracketsConfiguration {
    constructor(languageId, config) {
        this.languageId = languageId;
        const bracketPairs = config.brackets ? filterValidBrackets(config.brackets) : [];
        const openingBracketInfos = new CachedFunction((bracket) => {
            const closing = new Set();
            return {
                info: new OpeningBracketKind(this, bracket, closing),
                closing,
            };
        });
        const closingBracketInfos = new CachedFunction((bracket) => {
            const opening = new Set();
            const openingColorized = new Set();
            return {
                info: new ClosingBracketKind(this, bracket, opening, openingColorized),
                opening,
                openingColorized,
            };
        });
        for (const [open, close] of bracketPairs) {
            const opening = openingBracketInfos.get(open);
            const closing = closingBracketInfos.get(close);
            opening.closing.add(closing.info);
            closing.opening.add(opening.info);
        }
        const colorizedBracketPairs = config.colorizedBracketPairs
            ? filterValidBrackets(config.colorizedBracketPairs)
            : bracketPairs.filter((p) => !(p[0] === '<' && p[1] === '>'));
        for (const [open, close] of colorizedBracketPairs) {
            const opening = openingBracketInfos.get(open);
            const closing = closingBracketInfos.get(close);
            opening.closing.add(closing.info);
            closing.openingColorized.add(opening.info);
            closing.opening.add(opening.info);
        }
        this._openingBrackets = new Map([...openingBracketInfos.cachedValues].map(([k, v]) => [k, v.info]));
        this._closingBrackets = new Map([...closingBracketInfos.cachedValues].map(([k, v]) => [k, v.info]));
    }
    get openingBrackets() {
        return [...this._openingBrackets.values()];
    }
    get closingBrackets() {
        return [...this._closingBrackets.values()];
    }
    getOpeningBracketInfo(bracketText) {
        return this._openingBrackets.get(bracketText);
    }
    getClosingBracketInfo(bracketText) {
        return this._closingBrackets.get(bracketText);
    }
    getBracketInfo(bracketText) {
        return this.getOpeningBracketInfo(bracketText) || this.getClosingBracketInfo(bracketText);
    }
    getBracketRegExp(options) {
        const brackets = Array.from([...this._openingBrackets.keys(), ...this._closingBrackets.keys()]);
        return createBracketOrRegExp(brackets, options);
    }
}
function filterValidBrackets(bracketPairs) {
    return bracketPairs.filter(([open, close]) => open !== '' && close !== '');
}
export class BracketKindBase {
    constructor(config, bracketText) {
        this.config = config;
        this.bracketText = bracketText;
    }
    get languageId() {
        return this.config.languageId;
    }
}
export class OpeningBracketKind extends BracketKindBase {
    constructor(config, bracketText, openedBrackets) {
        super(config, bracketText);
        this.openedBrackets = openedBrackets;
        this.isOpeningBracket = true;
    }
}
export class ClosingBracketKind extends BracketKindBase {
    constructor(config, bracketText, openingBrackets, openingColorizedBrackets) {
        super(config, bracketText);
        this.openingBrackets = openingBrackets;
        this.openingColorizedBrackets = openingColorizedBrackets;
        this.isOpeningBracket = false;
    }
    closes(other) {
        if (other['config'] !== this.config) {
            return false;
        }
        return this.openingBrackets.has(other);
    }
    closesColorized(other) {
        if (other['config'] !== this.config) {
            return false;
        }
        return this.openingColorizedBrackets.has(other);
    }
    getOpeningBrackets() {
        return [...this.openingBrackets];
    }
}
