export interface ITerminalFormatMessageOptions {
    /**
     * Whether to exclude the new line at the start of the message. Defaults to false.
     */
    excludeLeadingNewLine?: boolean;
    /**
     * Whether to use "loud" formatting, this is for more important messages where the it's
     * desirable to visually break the buffer up. Defaults to false.
     */
    loudFormatting?: boolean;
}
/**
 * Formats a message from the product to be written to the terminal.
 */
export declare function formatMessageForTerminal(message: string, options?: ITerminalFormatMessageOptions): string;
