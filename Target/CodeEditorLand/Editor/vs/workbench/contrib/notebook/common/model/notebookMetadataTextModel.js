import { toFormattedString } from '../../../../../base/common/jsonFormatter.js';
import { NotebookCellsChangeType, NotebookMetadataUri } from '../notebookCommon.js';
import { StringSHA1 } from '../../../../../base/common/hash.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { createTextBuffer } from '../../../../../editor/common/model/textModel.js';
export function getFormattedNotebookMetadataJSON(transientMetadata, metadata) {
    let filteredMetadata = {};
    if (transientMetadata) {
        const keys = new Set([...Object.keys(metadata)]);
        for (const key of keys) {
            if (!(transientMetadata[key])) {
                filteredMetadata[key] = metadata[key];
            }
        }
    }
    else {
        filteredMetadata = metadata;
    }
    const metadataSource = toFormattedString(filteredMetadata, {});
    return metadataSource;
}
export class NotebookDocumentMetadataTextModel extends Disposable {
    get metadata() {
        return this.notebookModel.metadata;
    }
    get textBuffer() {
        if (this._textBuffer) {
            return this._textBuffer;
        }
        const source = getFormattedNotebookMetadataJSON(this.notebookModel.transientOptions.transientDocumentMetadata, this.metadata);
        this._textBuffer = this._register(createTextBuffer(source, 1).textBuffer);
        this._register(this._textBuffer.onDidChangeContent(() => {
            this._onDidChange.fire();
        }));
        return this._textBuffer;
    }
    constructor(notebookModel) {
        super();
        this.notebookModel = notebookModel;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._textBufferHash = null;
        this.uri = NotebookMetadataUri.generate(this.notebookModel.uri);
        this._register(this.notebookModel.onDidChangeContent((e) => {
            if (e.rawEvents.some(event => event.kind === NotebookCellsChangeType.ChangeDocumentMetadata || event.kind === NotebookCellsChangeType.ModelChange)) {
                this._textBuffer?.dispose();
                this._textBuffer = undefined;
                this._textBufferHash = null;
                this._onDidChange.fire();
            }
        }));
    }
    getHash() {
        if (this._textBufferHash !== null) {
            return this._textBufferHash;
        }
        const shaComputer = new StringSHA1();
        const snapshot = this.textBuffer.createSnapshot(false);
        let text;
        while ((text = snapshot.read())) {
            shaComputer.update(text);
        }
        this._textBufferHash = shaComputer.digest();
        return this._textBufferHash;
    }
    getValue() {
        const fullRange = this.getFullModelRange();
        const eol = this.textBuffer.getEOL();
        if (eol === '\n') {
            return this.textBuffer.getValueInRange(fullRange, 1);
        }
        else {
            return this.textBuffer.getValueInRange(fullRange, 2);
        }
    }
    getFullModelRange() {
        const lineCount = this.textBuffer.getLineCount();
        return new Range(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
    }
}
