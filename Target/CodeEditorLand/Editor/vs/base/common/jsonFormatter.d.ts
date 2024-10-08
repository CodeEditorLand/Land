export interface FormattingOptions {
    /**
     * If indentation is based on spaces (`insertSpaces` = true), then what is the number of spaces that make an indent?
     */
    tabSize?: number;
    /**
     * Is indentation based on spaces?
     */
    insertSpaces?: boolean;
    /**
     * The default 'end of line' character. If not set, '\n' is used as default.
     */
    eol?: string;
}
/**
 * Represents a text modification
 */
export interface Edit {
    /**
     * The start offset of the modification.
     */
    offset: number;
    /**
     * The length of the modification. Must not be negative. Empty length represents an *insert*.
     */
    length: number;
    /**
     * The new content. Empty content represents a *remove*.
     */
    content: string;
}
/**
 * A text range in the document
*/
export interface Range {
    /**
     * The start offset of the range.
     */
    offset: number;
    /**
     * The length of the range. Must not be negative.
     */
    length: number;
}
export declare function format(documentText: string, range: Range | undefined, options: FormattingOptions): Edit[];
/**
 * Creates a formatted string out of the object passed as argument, using the given formatting options
 * @param any The object to stringify and format
 * @param options The formatting options to use
 */
export declare function toFormattedString(obj: any, options: FormattingOptions): string;
export declare function getEOL(options: FormattingOptions, text: string): string;
export declare function isEOL(text: string, offset: number): boolean;
