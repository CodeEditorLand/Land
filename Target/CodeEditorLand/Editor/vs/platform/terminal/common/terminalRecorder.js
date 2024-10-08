/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class TerminalRecorder {
    constructor(cols, rows) {
        this._totalDataLength = 0;
        this._entries = [{ cols, rows, data: [] }];
    }
    handleResize(cols, rows) {
        if (this._entries.length > 0) {
            const lastEntry = this._entries[this._entries.length - 1];
            if (lastEntry.data.length === 0) {
                // last entry is just a resize, so just remove it
                this._entries.pop();
            }
        }
        if (this._entries.length > 0) {
            const lastEntry = this._entries[this._entries.length - 1];
            if (lastEntry.cols === cols && lastEntry.rows === rows) {
                // nothing changed
                return;
            }
            if (lastEntry.cols === 0 && lastEntry.rows === 0) {
                // we finally received a good size!
                lastEntry.cols = cols;
                lastEntry.rows = rows;
                return;
            }
        }
        this._entries.push({ cols, rows, data: [] });
    }
    handleData(data) {
        const lastEntry = this._entries[this._entries.length - 1];
        lastEntry.data.push(data);
        this._totalDataLength += data.length;
        while (this._totalDataLength > 10485760 /* Constants.MaxRecorderDataSize */) {
            const firstEntry = this._entries[0];
            const remainingToDelete = this._totalDataLength - 10485760 /* Constants.MaxRecorderDataSize */;
            if (remainingToDelete >= firstEntry.data[0].length) {
                // the first data piece must be deleted
                this._totalDataLength -= firstEntry.data[0].length;
                firstEntry.data.shift();
                if (firstEntry.data.length === 0) {
                    // the first entry must be deleted
                    this._entries.shift();
                }
            }
            else {
                // the first data piece must be partially deleted
                firstEntry.data[0] = firstEntry.data[0].substr(remainingToDelete);
                this._totalDataLength -= remainingToDelete;
            }
        }
    }
    generateReplayEventSync() {
        // normalize entries to one element per data array
        this._entries.forEach((entry) => {
            if (entry.data.length > 0) {
                entry.data = [entry.data.join('')];
            }
        });
        return {
            events: this._entries.map(entry => ({ cols: entry.cols, rows: entry.rows, data: entry.data[0] ?? '' })),
            // No command restoration is needed when relaunching terminals
            commands: {
                isWindowsPty: false,
                commands: [],
                promptInputModel: undefined,
            }
        };
    }
    async generateReplayEvent() {
        return this.generateReplayEventSync();
    }
}
