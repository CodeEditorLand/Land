/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Range } from '../../../../editor/common/core/range.js';
import { PieceTreeTextBufferBuilder } from '../../../../editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder.js';
import { SearchParams } from '../../../../editor/common/model/textModelSearch.js';
export class CellSearchModel extends Disposable {
    constructor(_source, _inputTextBuffer, _outputs) {
        super();
        this._source = _source;
        this._inputTextBuffer = _inputTextBuffer;
        this._outputs = _outputs;
        this._outputTextBuffers = undefined;
    }
    _getFullModelRange(buffer) {
        const lineCount = buffer.getLineCount();
        return new Range(1, 1, lineCount, this._getLineMaxColumn(buffer, lineCount));
    }
    _getLineMaxColumn(buffer, lineNumber) {
        if (lineNumber < 1 || lineNumber > buffer.getLineCount()) {
            throw new Error('Illegal value for lineNumber');
        }
        return buffer.getLineLength(lineNumber) + 1;
    }
    get inputTextBuffer() {
        if (!this._inputTextBuffer) {
            const builder = new PieceTreeTextBufferBuilder();
            builder.acceptChunk(this._source);
            const bufferFactory = builder.finish(true);
            const { textBuffer, disposable } = bufferFactory.create(1 /* DefaultEndOfLine.LF */);
            this._inputTextBuffer = textBuffer;
            this._register(disposable);
        }
        return this._inputTextBuffer;
    }
    get outputTextBuffers() {
        if (!this._outputTextBuffers) {
            this._outputTextBuffers = this._outputs.map((output) => {
                const builder = new PieceTreeTextBufferBuilder();
                builder.acceptChunk(output);
                const bufferFactory = builder.finish(true);
                const { textBuffer, disposable } = bufferFactory.create(1 /* DefaultEndOfLine.LF */);
                this._register(disposable);
                return textBuffer;
            });
        }
        return this._outputTextBuffers;
    }
    findInInputs(target) {
        const searchParams = new SearchParams(target, false, false, null);
        const searchData = searchParams.parseSearchRequest();
        if (!searchData) {
            return [];
        }
        const fullInputRange = this._getFullModelRange(this.inputTextBuffer);
        return this.inputTextBuffer.findMatchesLineByLine(fullInputRange, searchData, true, 5000);
    }
    findInOutputs(target) {
        const searchParams = new SearchParams(target, false, false, null);
        const searchData = searchParams.parseSearchRequest();
        if (!searchData) {
            return [];
        }
        return this.outputTextBuffers.map(buffer => {
            const matches = buffer.findMatchesLineByLine(this._getFullModelRange(buffer), searchData, true, 5000);
            if (matches.length === 0) {
                return undefined;
            }
            return {
                textBuffer: buffer,
                matches
            };
        }).filter((item) => !!item);
    }
}
