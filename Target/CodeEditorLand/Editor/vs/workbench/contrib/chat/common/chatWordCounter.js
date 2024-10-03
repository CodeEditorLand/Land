const r = String.raw;
const linkPattern = r `(?<!\\)` +
    r `(!?\[` +
    r `(?:` +
    r `[^\[\]\\]|` +
    r `\\.|` +
    r `\[[^\[\]]*\]` +
    r `)*` +
    r `\])` +
    r `(\(\s*)` +
    r `(` +
    r `[^\s\(\)<](?:[^\s\(\)]|\([^\s\(\)]*?\))*|` +
    r `<(?:\\[<>]|[^<>])+>` +
    r `)` +
    r `\s*(?:"[^"]*"|'[^']*'|\([^\(\)]*\))?\s*` +
    r `\)`;
export function getNWords(str, numWordsToCount) {
    const allWordMatches = Array.from(str.matchAll(new RegExp(linkPattern + r `|\p{sc=Han}|=+|\++|-+|[^\s\|\p{sc=Han}|=|\+|\-]+`, 'gu')));
    const targetWords = allWordMatches.slice(0, numWordsToCount);
    const endIndex = numWordsToCount > allWordMatches.length
        ? str.length
        : targetWords.length ? targetWords.at(-1).index + targetWords.at(-1)[0].length : 0;
    const value = str.substring(0, endIndex);
    return {
        value,
        returnedWordCount: targetWords.length === 0 ? (value.length ? 1 : 0) : targetWords.length,
        isFullString: endIndex >= str.length,
        totalWordCount: allWordMatches.length
    };
}
export function countWords(str) {
    const result = getNWords(str, Number.MAX_SAFE_INTEGER);
    return result.returnedWordCount;
}
