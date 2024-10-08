export declare const USUAL_WORD_SEPARATORS = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";
/**
 * Word inside a model.
 */
export interface IWordAtPosition {
    /**
     * The word.
     */
    readonly word: string;
    /**
     * The column where the word starts.
     */
    readonly startColumn: number;
    /**
     * The column where the word ends.
     */
    readonly endColumn: number;
}
export declare const DEFAULT_WORD_REGEXP: RegExp;
export declare function ensureValidWordDefinition(wordDefinition?: RegExp | null): RegExp;
export interface IGetWordAtTextConfig {
    maxLen: number;
    windowSize: number;
    timeBudget: number;
}
export declare function setDefaultGetWordAtTextConfig(value: IGetWordAtTextConfig): import("../../../base/common/lifecycle.js").IDisposable;
export declare function getWordAtText(column: number, wordDefinition: RegExp, text: string, textOffset: number, config?: IGetWordAtTextConfig): IWordAtPosition | null;
