export interface IWordCountResult {
    value: string;
    returnedWordCount: number;
    totalWordCount: number;
    isFullString: boolean;
}
export declare function getNWords(str: string, numWordsToCount: number): IWordCountResult;
export declare function countWords(str: string): number;
