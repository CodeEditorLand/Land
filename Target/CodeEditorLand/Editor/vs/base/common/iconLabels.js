import { matchesFuzzy } from './filters.js';
import { ltrim } from './strings.js';
import { ThemeIcon } from './themables.js';
const iconStartMarker = '$(';
const iconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameExpression}(?:${ThemeIcon.iconModifierExpression})?\\)`, 'g');
const escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, 'g');
export function escapeIcons(text) {
    return text.replace(escapeIconsRegex, (match, escaped) => escaped ? match : `\\${match}`);
}
const markdownEscapedIconsRegex = new RegExp(`\\\\${iconsRegex.source}`, 'g');
export function markdownEscapeEscapedIcons(text) {
    return text.replace(markdownEscapedIconsRegex, match => `\\${match}`);
}
const stripIconsRegex = new RegExp(`(\\s)?(\\\\)?${iconsRegex.source}(\\s)?`, 'g');
export function stripIcons(text) {
    if (text.indexOf(iconStartMarker) === -1) {
        return text;
    }
    return text.replace(stripIconsRegex, (match, preWhitespace, escaped, postWhitespace) => escaped ? match : preWhitespace || postWhitespace || '');
}
export function getCodiconAriaLabel(text) {
    if (!text) {
        return '';
    }
    return text.replace(/\$\((.*?)\)/g, (_match, codiconName) => ` ${codiconName} `).trim();
}
const _parseIconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameCharacter}+\\)`, 'g');
export function parseLabelWithIcons(input) {
    _parseIconsRegex.lastIndex = 0;
    let text = '';
    const iconOffsets = [];
    let iconsOffset = 0;
    while (true) {
        const pos = _parseIconsRegex.lastIndex;
        const match = _parseIconsRegex.exec(input);
        const chars = input.substring(pos, match?.index);
        if (chars.length > 0) {
            text += chars;
            for (let i = 0; i < chars.length; i++) {
                iconOffsets.push(iconsOffset);
            }
        }
        if (!match) {
            break;
        }
        iconsOffset += match[0].length;
    }
    return { text, iconOffsets };
}
export function matchesFuzzyIconAware(query, target, enableSeparateSubstringMatching = false) {
    const { text, iconOffsets } = target;
    if (!iconOffsets || iconOffsets.length === 0) {
        return matchesFuzzy(query, text, enableSeparateSubstringMatching);
    }
    const wordToMatchAgainstWithoutIconsTrimmed = ltrim(text, ' ');
    const leadingWhitespaceOffset = text.length - wordToMatchAgainstWithoutIconsTrimmed.length;
    const matches = matchesFuzzy(query, wordToMatchAgainstWithoutIconsTrimmed, enableSeparateSubstringMatching);
    if (matches) {
        for (const match of matches) {
            const iconOffset = iconOffsets[match.start + leadingWhitespaceOffset] + leadingWhitespaceOffset;
            match.start += iconOffset;
            match.end += iconOffset;
        }
    }
    return matches;
}
