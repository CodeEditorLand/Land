/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { FileOperationError } from '../../../../platform/files/common/files.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { areFunctions, isUndefinedOrNull } from '../../../../base/common/types.js';
export const ITextFileService = createDecorator('textFileService');
export class TextFileOperationError extends FileOperationError {
    static isTextFileOperationError(obj) {
        return obj instanceof Error && !isUndefinedOrNull(obj.textFileOperationResult);
    }
    constructor(message, textFileOperationResult, options) {
        super(message, 10 /* FileOperationResult.FILE_OTHER_ERROR */);
        this.textFileOperationResult = textFileOperationResult;
        this.options = options;
    }
}
export function isTextFileEditorModel(model) {
    const candidate = model;
    return areFunctions(candidate.setEncoding, candidate.getEncoding, candidate.save, candidate.revert, candidate.isDirty, candidate.getLanguageId);
}
export function snapshotToString(snapshot) {
    const chunks = [];
    let chunk;
    while (typeof (chunk = snapshot.read()) === 'string') {
        chunks.push(chunk);
    }
    return chunks.join('');
}
export function stringToSnapshot(value) {
    let done = false;
    return {
        read() {
            if (!done) {
                done = true;
                return value;
            }
            return null;
        }
    };
}
export function toBufferOrReadable(value) {
    if (typeof value === 'undefined') {
        return undefined;
    }
    if (typeof value === 'string') {
        return VSBuffer.fromString(value);
    }
    return {
        read: () => {
            const chunk = value.read();
            if (typeof chunk === 'string') {
                return VSBuffer.fromString(chunk);
            }
            return null;
        }
    };
}
