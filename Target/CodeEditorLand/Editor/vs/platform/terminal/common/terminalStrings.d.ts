export interface ITerminalFormatMessageOptions {
    excludeLeadingNewLine?: boolean;
    loudFormatting?: boolean;
}
export declare function formatMessageForTerminal(message: string, options?: ITerminalFormatMessageOptions): string;
