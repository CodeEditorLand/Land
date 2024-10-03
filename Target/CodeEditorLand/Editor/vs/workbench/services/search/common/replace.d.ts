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
    getReplaceString(text: string, preserveCase?: boolean): string | null;
    private replaceWithCaseOperations;
    buildReplaceString(matches: string[] | null, preserveCase?: boolean): string;
    private parseReplaceString;
    private between;
}
