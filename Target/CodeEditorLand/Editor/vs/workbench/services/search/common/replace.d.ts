import { IPatternInfo } from './search.js';
export declare class ReplacePattern {
    private _replacePattern;
    private _hasParameters;
    private _regExp;
    private _caseOpsRegExp;
    constructor(replaceString: string, searchPatternInfo: IPatternInfo);
    constructor(replaceString: string, parseParameters: boolean, regEx: RegExp);
    get hasParameters(): boolean;
    get pattern(): string;
    get regExp(): RegExp;
    /**
    * Returns the replace string for the first match in the given text.
    * If text has no matches then returns null.
    */
    getReplaceString(text: string, preserveCase?: boolean): string | null;
    /**
     * replaceWithCaseOperations applies case operations to relevant replacement strings and applies
     * the affected $N arguments. It then passes unaffected $N arguments through to string.replace().
     *
     * \u			=> upper-cases one character in a match.
     * \U			=> upper-cases ALL remaining characters in a match.
     * \l			=> lower-cases one character in a match.
     * \L			=> lower-cases ALL remaining characters in a match.
     */
    private replaceWithCaseOperations;
    buildReplaceString(matches: string[] | null, preserveCase?: boolean): string;
    /**
     * \n => LF
     * \t => TAB
     * \\ => \
     * $0 => $& (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter)
     * everything else stays untouched
     */
    private parseReplaceString;
    private between;
}
