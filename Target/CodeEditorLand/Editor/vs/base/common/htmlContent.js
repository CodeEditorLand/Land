import { illegalArgument } from './errors.js';
import { escapeIcons } from './iconLabels.js';
import { isEqual } from './resources.js';
import { escapeRegExpCharacters } from './strings.js';
import { URI } from './uri.js';
export class MarkdownString {
    constructor(value = '', isTrustedOrOptions = false) {
        this.value = value;
        if (typeof this.value !== 'string') {
            throw illegalArgument('value');
        }
        if (typeof isTrustedOrOptions === 'boolean') {
            this.isTrusted = isTrustedOrOptions;
            this.supportThemeIcons = false;
            this.supportHtml = false;
        }
        else {
            this.isTrusted = isTrustedOrOptions.isTrusted ?? undefined;
            this.supportThemeIcons = isTrustedOrOptions.supportThemeIcons ?? false;
            this.supportHtml = isTrustedOrOptions.supportHtml ?? false;
        }
    }
    appendText(value, newlineStyle = 0) {
        this.value += escapeMarkdownSyntaxTokens(this.supportThemeIcons ? escapeIcons(value) : value)
            .replace(/([ \t]+)/g, (_match, g1) => '&nbsp;'.repeat(g1.length))
            .replace(/\>/gm, '\\>')
            .replace(/\n/g, newlineStyle === 1 ? '\\\n' : '\n\n');
        return this;
    }
    appendMarkdown(value) {
        this.value += value;
        return this;
    }
    appendCodeblock(langId, code) {
        this.value += `\n${appendEscapedMarkdownCodeBlockFence(code, langId)}\n`;
        return this;
    }
    appendLink(target, label, title) {
        this.value += '[';
        this.value += this._escape(label, ']');
        this.value += '](';
        this.value += this._escape(String(target), ')');
        if (title) {
            this.value += ` "${this._escape(this._escape(title, '"'), ')')}"`;
        }
        this.value += ')';
        return this;
    }
    _escape(value, ch) {
        const r = new RegExp(escapeRegExpCharacters(ch), 'g');
        return value.replace(r, (match, offset) => {
            if (value.charAt(offset - 1) !== '\\') {
                return `\\${match}`;
            }
            else {
                return match;
            }
        });
    }
}
export function isEmptyMarkdownString(oneOrMany) {
    if (isMarkdownString(oneOrMany)) {
        return !oneOrMany.value;
    }
    else if (Array.isArray(oneOrMany)) {
        return oneOrMany.every(isEmptyMarkdownString);
    }
    else {
        return true;
    }
}
export function isMarkdownString(thing) {
    if (thing instanceof MarkdownString) {
        return true;
    }
    else if (thing && typeof thing === 'object') {
        return typeof thing.value === 'string'
            && (typeof thing.isTrusted === 'boolean' || typeof thing.isTrusted === 'object' || thing.isTrusted === undefined)
            && (typeof thing.supportThemeIcons === 'boolean' || thing.supportThemeIcons === undefined);
    }
    return false;
}
export function markdownStringEqual(a, b) {
    if (a === b) {
        return true;
    }
    else if (!a || !b) {
        return false;
    }
    else {
        return a.value === b.value
            && a.isTrusted === b.isTrusted
            && a.supportThemeIcons === b.supportThemeIcons
            && a.supportHtml === b.supportHtml
            && (a.baseUri === b.baseUri || !!a.baseUri && !!b.baseUri && isEqual(URI.from(a.baseUri), URI.from(b.baseUri)));
    }
}
export function escapeMarkdownSyntaxTokens(text) {
    return text.replace(/[\\`*_{}[\]()#+\-!~]/g, '\\$&');
}
export function appendEscapedMarkdownCodeBlockFence(code, langId) {
    const longestFenceLength = code.match(/^`+/gm)?.reduce((a, b) => (a.length > b.length ? a : b)).length ??
        0;
    const desiredFenceLength = longestFenceLength >= 3 ? longestFenceLength + 1 : 3;
    return [
        `${'`'.repeat(desiredFenceLength)}${langId}`,
        code,
        `${'`'.repeat(desiredFenceLength)}`,
    ].join('\n');
}
export function escapeDoubleQuotes(input) {
    return input.replace(/"/g, '&quot;');
}
export function removeMarkdownEscapes(text) {
    if (!text) {
        return text;
    }
    return text.replace(/\\([\\`*_{}[\]()#+\-.!~])/g, '$1');
}
export function parseHrefAndDimensions(href) {
    const dimensions = [];
    const splitted = href.split('|').map(s => s.trim());
    href = splitted[0];
    const parameters = splitted[1];
    if (parameters) {
        const heightFromParams = /height=(\d+)/.exec(parameters);
        const widthFromParams = /width=(\d+)/.exec(parameters);
        const height = heightFromParams ? heightFromParams[1] : '';
        const width = widthFromParams ? widthFromParams[1] : '';
        const widthIsFinite = isFinite(parseInt(width));
        const heightIsFinite = isFinite(parseInt(height));
        if (widthIsFinite) {
            dimensions.push(`width="${width}"`);
        }
        if (heightIsFinite) {
            dimensions.push(`height="${height}"`);
        }
    }
    return { href, dimensions };
}
