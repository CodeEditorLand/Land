import * as strings from '../../../../base/common/strings.js';
import { buildReplaceStringWithCasePreserved } from '../../../../base/common/search.js';
export class ReplacePattern {
    constructor(replaceString, arg2, arg3) {
        this._hasParameters = false;
        this._replacePattern = replaceString;
        let searchPatternInfo;
        let parseParameters;
        if (typeof arg2 === 'boolean') {
            parseParameters = arg2;
            this._regExp = arg3;
        }
        else {
            searchPatternInfo = arg2;
            parseParameters = !!searchPatternInfo.isRegExp;
            this._regExp = strings.createRegExp(searchPatternInfo.pattern, !!searchPatternInfo.isRegExp, { matchCase: searchPatternInfo.isCaseSensitive, wholeWord: searchPatternInfo.isWordMatch, multiline: searchPatternInfo.isMultiline, global: false, unicode: true });
        }
        if (parseParameters) {
            this.parseReplaceString(replaceString);
        }
        if (this._regExp.global) {
            this._regExp = strings.createRegExp(this._regExp.source, true, { matchCase: !this._regExp.ignoreCase, wholeWord: false, multiline: this._regExp.multiline, global: false });
        }
        this._caseOpsRegExp = new RegExp(/([\s\S]*?)((?:\\[uUlL])+?|)(\$[0-9]+)([\s\S]*?)/g);
    }
    get hasParameters() {
        return this._hasParameters;
    }
    get pattern() {
        return this._replacePattern;
    }
    get regExp() {
        return this._regExp;
    }
    getReplaceString(text, preserveCase) {
        this._regExp.lastIndex = 0;
        const match = this._regExp.exec(text);
        if (match) {
            if (this.hasParameters) {
                const replaceString = this.replaceWithCaseOperations(text, this._regExp, this.buildReplaceString(match, preserveCase));
                if (match[0] === text) {
                    return replaceString;
                }
                return replaceString.substr(match.index, match[0].length - (text.length - replaceString.length));
            }
            return this.buildReplaceString(match, preserveCase);
        }
        return null;
    }
    replaceWithCaseOperations(text, regex, replaceString) {
        if (!/\\[uUlL]/.test(replaceString)) {
            return text.replace(regex, replaceString);
        }
        const firstMatch = regex.exec(text);
        if (firstMatch === null) {
            return text.replace(regex, replaceString);
        }
        let patMatch;
        let newReplaceString = '';
        let lastIndex = 0;
        let lastMatch = '';
        while ((patMatch = this._caseOpsRegExp.exec(replaceString)) !== null) {
            lastIndex = patMatch.index;
            const fullMatch = patMatch[0];
            lastMatch = fullMatch;
            let caseOps = patMatch[2];
            const money = patMatch[3];
            if (!caseOps) {
                newReplaceString += fullMatch;
                continue;
            }
            const replacement = firstMatch[parseInt(money.slice(1))];
            if (!replacement) {
                newReplaceString += fullMatch;
                continue;
            }
            const replacementLen = replacement.length;
            newReplaceString += patMatch[1];
            caseOps = caseOps.replace(/\\/g, '');
            let i = 0;
            for (; i < caseOps.length; i++) {
                switch (caseOps[i]) {
                    case 'U':
                        newReplaceString += replacement.slice(i).toUpperCase();
                        i = replacementLen;
                        break;
                    case 'u':
                        newReplaceString += replacement[i].toUpperCase();
                        break;
                    case 'L':
                        newReplaceString += replacement.slice(i).toLowerCase();
                        i = replacementLen;
                        break;
                    case 'l':
                        newReplaceString += replacement[i].toLowerCase();
                        break;
                }
            }
            if (i < replacementLen) {
                newReplaceString += replacement.slice(i);
            }
            newReplaceString += patMatch[4];
        }
        newReplaceString += replaceString.slice(lastIndex + lastMatch.length);
        return text.replace(regex, newReplaceString);
    }
    buildReplaceString(matches, preserveCase) {
        if (preserveCase) {
            return buildReplaceStringWithCasePreserved(matches, this._replacePattern);
        }
        else {
            return this._replacePattern;
        }
    }
    parseReplaceString(replaceString) {
        if (!replaceString || replaceString.length === 0) {
            return;
        }
        let substrFrom = 0, result = '';
        for (let i = 0, len = replaceString.length; i < len; i++) {
            const chCode = replaceString.charCodeAt(i);
            if (chCode === 92) {
                i++;
                if (i >= len) {
                    break;
                }
                const nextChCode = replaceString.charCodeAt(i);
                let replaceWithCharacter = null;
                switch (nextChCode) {
                    case 92:
                        replaceWithCharacter = '\\';
                        break;
                    case 110:
                        replaceWithCharacter = '\n';
                        break;
                    case 116:
                        replaceWithCharacter = '\t';
                        break;
                }
                if (replaceWithCharacter) {
                    result += replaceString.substring(substrFrom, i - 1) + replaceWithCharacter;
                    substrFrom = i + 1;
                }
            }
            if (chCode === 36) {
                i++;
                if (i >= len) {
                    break;
                }
                const nextChCode = replaceString.charCodeAt(i);
                let replaceWithCharacter = null;
                switch (nextChCode) {
                    case 48:
                        replaceWithCharacter = '$&';
                        this._hasParameters = true;
                        break;
                    case 96:
                    case 39:
                        this._hasParameters = true;
                        break;
                    default: {
                        if (!this.between(nextChCode, 49, 57)) {
                            break;
                        }
                        if (i === replaceString.length - 1) {
                            this._hasParameters = true;
                            break;
                        }
                        let charCode = replaceString.charCodeAt(++i);
                        if (!this.between(charCode, 48, 57)) {
                            this._hasParameters = true;
                            --i;
                            break;
                        }
                        if (i === replaceString.length - 1) {
                            this._hasParameters = true;
                            break;
                        }
                        charCode = replaceString.charCodeAt(++i);
                        if (!this.between(charCode, 48, 57)) {
                            this._hasParameters = true;
                            --i;
                            break;
                        }
                        break;
                    }
                }
                if (replaceWithCharacter) {
                    result += replaceString.substring(substrFrom, i - 1) + replaceWithCharacter;
                    substrFrom = i + 1;
                }
            }
        }
        if (substrFrom === 0) {
            return;
        }
        this._replacePattern = result + replaceString.substring(substrFrom);
    }
    between(value, from, to) {
        return from <= value && value <= to;
    }
}
