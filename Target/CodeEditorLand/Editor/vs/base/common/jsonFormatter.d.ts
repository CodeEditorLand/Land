export interface FormattingOptions {
    tabSize?: number;
    insertSpaces?: boolean;
    eol?: string;
}
export interface Edit {
    offset: number;
    length: number;
    content: string;
}
export interface Range {
    offset: number;
    length: number;
}
export declare function format(documentText: string, range: Range | undefined, options: FormattingOptions): Edit[];
export declare function toFormattedString(obj: any, options: FormattingOptions): string;
export declare function getEOL(options: FormattingOptions, text: string): string;
export declare function isEOL(text: string, offset: number): boolean;
