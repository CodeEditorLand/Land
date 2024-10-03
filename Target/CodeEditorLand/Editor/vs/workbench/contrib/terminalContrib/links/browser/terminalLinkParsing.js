import { Lazy } from '../../../../../base/common/lazy.js';
const linkSuffixRegexEol = new Lazy(() => generateLinkSuffixRegex(true));
const linkSuffixRegex = new Lazy(() => generateLinkSuffixRegex(false));
function generateLinkSuffixRegex(eolOnly) {
    let ri = 0;
    let ci = 0;
    let rei = 0;
    let cei = 0;
    function r() {
        return `(?<row${ri++}>\\d+)`;
    }
    function c() {
        return `(?<col${ci++}>\\d+)`;
    }
    function re() {
        return `(?<rowEnd${rei++}>\\d+)`;
    }
    function ce() {
        return `(?<colEnd${cei++}>\\d+)`;
    }
    const eolSuffix = eolOnly ? '$' : '';
    const lineAndColumnRegexClauses = [
        `(?::|#| |['"],)${r()}([:.]${c()}(?:-(?:${re()}\\.)?${ce()})?)?` + eolSuffix,
        `['"]?(?:,? |: ?| on )lines? ${r()}(?:-${re()})?(?:,? (?:col(?:umn)?|characters?) ${c()}(?:-${ce()})?)?` + eolSuffix,
        `:? ?[\\[\\(]${r()}(?:(?:, ?|:)${c()})?[\\]\\)]` + eolSuffix,
    ];
    const suffixClause = lineAndColumnRegexClauses
        .join('|')
        .replace(/ /g, `[${'\u00A0'} ]`);
    return new RegExp(`(${suffixClause})`, eolOnly ? undefined : 'g');
}
export function removeLinkSuffix(link) {
    const suffix = getLinkSuffix(link)?.suffix;
    if (!suffix) {
        return link;
    }
    return link.substring(0, suffix.index);
}
export function removeLinkQueryString(link) {
    const start = link.startsWith('\\\\?\\') ? 4 : 0;
    const index = link.indexOf('?', start);
    if (index === -1) {
        return link;
    }
    return link.substring(0, index);
}
export function detectLinkSuffixes(line) {
    let match;
    const results = [];
    linkSuffixRegex.value.lastIndex = 0;
    while ((match = linkSuffixRegex.value.exec(line)) !== null) {
        const suffix = toLinkSuffix(match);
        if (suffix === null) {
            break;
        }
        results.push(suffix);
    }
    return results;
}
export function getLinkSuffix(link) {
    return toLinkSuffix(linkSuffixRegexEol.value.exec(link));
}
export function toLinkSuffix(match) {
    const groups = match?.groups;
    if (!groups || match.length < 1) {
        return null;
    }
    return {
        row: parseIntOptional(groups.row0 || groups.row1 || groups.row2),
        col: parseIntOptional(groups.col0 || groups.col1 || groups.col2),
        rowEnd: parseIntOptional(groups.rowEnd0 || groups.rowEnd1 || groups.rowEnd2),
        colEnd: parseIntOptional(groups.colEnd0 || groups.colEnd1 || groups.colEnd2),
        suffix: { index: match.index, text: match[0] }
    };
}
function parseIntOptional(value) {
    if (value === undefined) {
        return value;
    }
    return parseInt(value);
}
const linkWithSuffixPathCharacters = /(?<path>(?:file:\/\/\/)?[^\s\|<>\[\({][^\s\|<>]*)$/;
export function detectLinks(line, os) {
    const results = detectLinksViaSuffix(line);
    const noSuffixPaths = detectPathsNoSuffix(line, os);
    binaryInsertList(results, noSuffixPaths);
    return results;
}
function binaryInsertList(list, newItems) {
    if (list.length === 0) {
        list.push(...newItems);
    }
    for (const item of newItems) {
        binaryInsert(list, item, 0, list.length);
    }
}
function binaryInsert(list, newItem, low, high) {
    if (list.length === 0) {
        list.push(newItem);
        return;
    }
    if (low > high) {
        return;
    }
    const mid = Math.floor((low + high) / 2);
    if (mid >= list.length ||
        (newItem.path.index < list[mid].path.index && (mid === 0 || newItem.path.index > list[mid - 1].path.index))) {
        if (mid >= list.length ||
            (newItem.path.index + newItem.path.text.length < list[mid].path.index && (mid === 0 || newItem.path.index > list[mid - 1].path.index + list[mid - 1].path.text.length))) {
            list.splice(mid, 0, newItem);
        }
        return;
    }
    if (newItem.path.index > list[mid].path.index) {
        binaryInsert(list, newItem, mid + 1, high);
    }
    else {
        binaryInsert(list, newItem, low, mid - 1);
    }
}
function detectLinksViaSuffix(line) {
    const results = [];
    const suffixes = detectLinkSuffixes(line);
    for (const suffix of suffixes) {
        const beforeSuffix = line.substring(0, suffix.suffix.index);
        const possiblePathMatch = beforeSuffix.match(linkWithSuffixPathCharacters);
        if (possiblePathMatch && possiblePathMatch.index !== undefined && possiblePathMatch.groups?.path) {
            let linkStartIndex = possiblePathMatch.index;
            let path = possiblePathMatch.groups.path;
            let prefix = undefined;
            const prefixMatch = path.match(/^(?<prefix>['"]+)/);
            if (prefixMatch?.groups?.prefix) {
                prefix = {
                    index: linkStartIndex,
                    text: prefixMatch.groups.prefix
                };
                path = path.substring(prefix.text.length);
                if (path.trim().length === 0) {
                    continue;
                }
                if (prefixMatch.groups.prefix.length > 1) {
                    if (suffix.suffix.text[0].match(/['"]/) && prefixMatch.groups.prefix[prefixMatch.groups.prefix.length - 1] === suffix.suffix.text[0]) {
                        const trimPrefixAmount = prefixMatch.groups.prefix.length - 1;
                        prefix.index += trimPrefixAmount;
                        prefix.text = prefixMatch.groups.prefix[prefixMatch.groups.prefix.length - 1];
                        linkStartIndex += trimPrefixAmount;
                    }
                }
            }
            results.push({
                path: {
                    index: linkStartIndex + (prefix?.text.length || 0),
                    text: path
                },
                prefix,
                suffix
            });
        }
    }
    return results;
}
var RegexPathConstants;
(function (RegexPathConstants) {
    RegexPathConstants["PathPrefix"] = "(?:\\.\\.?|\\~|file://)";
    RegexPathConstants["PathSeparatorClause"] = "\\/";
    RegexPathConstants["ExcludedPathCharactersClause"] = "[^\\0<>\\?\\s!`&*()'\":;\\\\]";
    RegexPathConstants["ExcludedStartPathCharactersClause"] = "[^\\0<>\\?\\s!`&*()\\[\\]'\":;\\\\]";
    RegexPathConstants["WinOtherPathPrefix"] = "\\.\\.?|\\~";
    RegexPathConstants["WinPathSeparatorClause"] = "(?:\\\\|\\/)";
    RegexPathConstants["WinExcludedPathCharactersClause"] = "[^\\0<>\\?\\|\\/\\s!`&*()'\":;]";
    RegexPathConstants["WinExcludedStartPathCharactersClause"] = "[^\\0<>\\?\\|\\/\\s!`&*()\\[\\]'\":;]";
})(RegexPathConstants || (RegexPathConstants = {}));
const unixLocalLinkClause = '(?:(?:' + RegexPathConstants.PathPrefix + '|(?:' + RegexPathConstants.ExcludedStartPathCharactersClause + RegexPathConstants.ExcludedPathCharactersClause + '*))?(?:' + RegexPathConstants.PathSeparatorClause + '(?:' + RegexPathConstants.ExcludedPathCharactersClause + ')+)+)';
export const winDrivePrefix = '(?:\\\\\\\\\\?\\\\|file:\\/\\/\\/)?[a-zA-Z]:';
const winLocalLinkClause = '(?:(?:' + `(?:${winDrivePrefix}|${RegexPathConstants.WinOtherPathPrefix})` + '|(?:' + RegexPathConstants.WinExcludedStartPathCharactersClause + RegexPathConstants.WinExcludedPathCharactersClause + '*))?(?:' + RegexPathConstants.WinPathSeparatorClause + '(?:' + RegexPathConstants.WinExcludedPathCharactersClause + ')+)+)';
function detectPathsNoSuffix(line, os) {
    const results = [];
    const regex = new RegExp(os === 1 ? winLocalLinkClause : unixLocalLinkClause, 'g');
    let match;
    while ((match = regex.exec(line)) !== null) {
        let text = match[0];
        let index = match.index;
        if (!text) {
            break;
        }
        if (((line.startsWith('--- a/') || line.startsWith('+++ b/')) && index === 4) ||
            (line.startsWith('diff --git') && (text.startsWith('a/') || text.startsWith('b/')))) {
            text = text.substring(2);
            index += 2;
        }
        results.push({
            path: {
                index,
                text
            },
            prefix: undefined,
            suffix: undefined
        });
    }
    return results;
}
