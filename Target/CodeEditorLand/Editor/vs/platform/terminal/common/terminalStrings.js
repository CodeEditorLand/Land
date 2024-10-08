/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Formats a message from the product to be written to the terminal.
 */
export function formatMessageForTerminal(message, options = {}) {
    let result = '';
    if (!options.excludeLeadingNewLine) {
        result += '\r\n';
    }
    result += '\x1b[0m\x1b[7m * ';
    if (options.loudFormatting) {
        result += '\x1b[0;104m';
    }
    else {
        result += '\x1b[0m';
    }
    result += ` ${message} \x1b[0m\n\r`;
    return result;
}
