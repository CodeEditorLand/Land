import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { compressOutputItemStreams, isTextStreamMime } from '../notebookCommon.js';
export class NotebookCellOutputTextModel extends Disposable {
    get outputs() {
        return this._rawOutput.outputs || [];
    }
    get metadata() {
        return this._rawOutput.metadata;
    }
    get outputId() {
        return this._rawOutput.outputId;
    }
    get alternativeOutputId() {
        return this._alternativeOutputId;
    }
    get versionId() {
        return this._versionId;
    }
    constructor(_rawOutput) {
        super();
        this._rawOutput = _rawOutput;
        this._onDidChangeData = this._register(new Emitter());
        this.onDidChangeData = this._onDidChangeData.event;
        this._versionId = 0;
        this.versionedBufferLengths = {};
        this._alternativeOutputId = this._rawOutput.outputId;
    }
    replaceData(rawData) {
        this.versionedBufferLengths = {};
        this._rawOutput = rawData;
        this.optimizeOutputItems();
        this._versionId = this._versionId + 1;
        this._onDidChangeData.fire();
    }
    appendData(items) {
        this.trackBufferLengths();
        this._rawOutput.outputs.push(...items);
        this.optimizeOutputItems();
        this._versionId = this._versionId + 1;
        this._onDidChangeData.fire();
    }
    trackBufferLengths() {
        this.outputs.forEach(output => {
            if (isTextStreamMime(output.mime)) {
                if (!this.versionedBufferLengths[output.mime]) {
                    this.versionedBufferLengths[output.mime] = {};
                }
                this.versionedBufferLengths[output.mime][this.versionId] = output.data.byteLength;
            }
        });
    }
    appendedSinceVersion(versionId, mime) {
        const bufferLength = this.versionedBufferLengths[mime]?.[versionId];
        const output = this.outputs.find(output => output.mime === mime);
        if (bufferLength && output) {
            return output.data.slice(bufferLength);
        }
        return undefined;
    }
    optimizeOutputItems() {
        if (this.outputs.length > 1 && this.outputs.every(item => isTextStreamMime(item.mime))) {
            const mimeOutputs = new Map();
            const mimeTypes = [];
            this.outputs.forEach(item => {
                let items;
                if (mimeOutputs.has(item.mime)) {
                    items = mimeOutputs.get(item.mime);
                }
                else {
                    items = [];
                    mimeOutputs.set(item.mime, items);
                    mimeTypes.push(item.mime);
                }
                items.push(item.data.buffer);
            });
            this.outputs.length = 0;
            mimeTypes.forEach(mime => {
                const compressionResult = compressOutputItemStreams(mimeOutputs.get(mime));
                this.outputs.push({
                    mime,
                    data: compressionResult.data
                });
                if (compressionResult.didCompression) {
                    this.versionedBufferLengths = {};
                }
            });
        }
    }
    asDto() {
        return {
            metadata: this._rawOutput.metadata,
            outputs: this._rawOutput.outputs,
            outputId: this._rawOutput.outputId
        };
    }
    bumpVersion() {
        this._versionId = this._versionId + 1;
    }
}
