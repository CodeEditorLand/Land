/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Splits incoming pty data into chunks to try prevent data corruption that could occur when pasting
 * large amounts of data.
 */
export function chunkInput(data) {
    const chunks = [];
    let nextChunkStartIndex = 0;
    for (let i = 0; i < data.length - 1; i++) {
        if (
        // If the max chunk size is reached
        i - nextChunkStartIndex + 1 >= 50 /* Constants.WriteMaxChunkSize */ ||
            // If the next character is ESC, send the pending data to avoid splitting the escape
            // sequence.
            data[i + 1] === '\x1b') {
            chunks.push(data.substring(nextChunkStartIndex, i + 1));
            nextChunkStartIndex = i + 1;
            // Skip the next character as the chunk would be a single character
            i++;
        }
    }
    // Push final chunk
    if (nextChunkStartIndex !== data.length) {
        chunks.push(data.substring(nextChunkStartIndex));
    }
    return chunks;
}
