import { assertNever } from '../../base/common/assert.js';
import { Position } from './core/position.js';
import { InjectedTextCursorStops } from './model.js';
export class ModelLineProjectionData {
    constructor(injectionOffsets, injectionOptions, breakOffsets, breakOffsetsVisibleColumn, wrappedTextIndentLength) {
        this.injectionOffsets = injectionOffsets;
        this.injectionOptions = injectionOptions;
        this.breakOffsets = breakOffsets;
        this.breakOffsetsVisibleColumn = breakOffsetsVisibleColumn;
        this.wrappedTextIndentLength = wrappedTextIndentLength;
    }
    getOutputLineCount() {
        return this.breakOffsets.length;
    }
    getMinOutputOffset(outputLineIndex) {
        if (outputLineIndex > 0) {
            return this.wrappedTextIndentLength;
        }
        return 0;
    }
    getLineLength(outputLineIndex) {
        const startOffset = outputLineIndex > 0 ? this.breakOffsets[outputLineIndex - 1] : 0;
        const endOffset = this.breakOffsets[outputLineIndex];
        let lineLength = endOffset - startOffset;
        if (outputLineIndex > 0) {
            lineLength += this.wrappedTextIndentLength;
        }
        return lineLength;
    }
    getMaxOutputOffset(outputLineIndex) {
        return this.getLineLength(outputLineIndex);
    }
    translateToInputOffset(outputLineIndex, outputOffset) {
        if (outputLineIndex > 0) {
            outputOffset = Math.max(0, outputOffset - this.wrappedTextIndentLength);
        }
        const offsetInInputWithInjection = outputLineIndex === 0 ? outputOffset : this.breakOffsets[outputLineIndex - 1] + outputOffset;
        let offsetInInput = offsetInInputWithInjection;
        if (this.injectionOffsets !== null) {
            for (let i = 0; i < this.injectionOffsets.length; i++) {
                if (offsetInInput > this.injectionOffsets[i]) {
                    if (offsetInInput < this.injectionOffsets[i] + this.injectionOptions[i].content.length) {
                        offsetInInput = this.injectionOffsets[i];
                    }
                    else {
                        offsetInInput -= this.injectionOptions[i].content.length;
                    }
                }
                else {
                    break;
                }
            }
        }
        return offsetInInput;
    }
    translateToOutputPosition(inputOffset, affinity = 2) {
        let inputOffsetInInputWithInjection = inputOffset;
        if (this.injectionOffsets !== null) {
            for (let i = 0; i < this.injectionOffsets.length; i++) {
                if (inputOffset < this.injectionOffsets[i]) {
                    break;
                }
                if (affinity !== 1 && inputOffset === this.injectionOffsets[i]) {
                    break;
                }
                inputOffsetInInputWithInjection += this.injectionOptions[i].content.length;
            }
        }
        return this.offsetInInputWithInjectionsToOutputPosition(inputOffsetInInputWithInjection, affinity);
    }
    offsetInInputWithInjectionsToOutputPosition(offsetInInputWithInjections, affinity = 2) {
        let low = 0;
        let high = this.breakOffsets.length - 1;
        let mid = 0;
        let midStart = 0;
        while (low <= high) {
            mid = low + ((high - low) / 2) | 0;
            const midStop = this.breakOffsets[mid];
            midStart = mid > 0 ? this.breakOffsets[mid - 1] : 0;
            if (affinity === 0) {
                if (offsetInInputWithInjections <= midStart) {
                    high = mid - 1;
                }
                else if (offsetInInputWithInjections > midStop) {
                    low = mid + 1;
                }
                else {
                    break;
                }
            }
            else {
                if (offsetInInputWithInjections < midStart) {
                    high = mid - 1;
                }
                else if (offsetInInputWithInjections >= midStop) {
                    low = mid + 1;
                }
                else {
                    break;
                }
            }
        }
        let outputOffset = offsetInInputWithInjections - midStart;
        if (mid > 0) {
            outputOffset += this.wrappedTextIndentLength;
        }
        return new OutputPosition(mid, outputOffset);
    }
    normalizeOutputPosition(outputLineIndex, outputOffset, affinity) {
        if (this.injectionOffsets !== null) {
            const offsetInInputWithInjections = this.outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset);
            const normalizedOffsetInUnwrappedLine = this.normalizeOffsetInInputWithInjectionsAroundInjections(offsetInInputWithInjections, affinity);
            if (normalizedOffsetInUnwrappedLine !== offsetInInputWithInjections) {
                return this.offsetInInputWithInjectionsToOutputPosition(normalizedOffsetInUnwrappedLine, affinity);
            }
        }
        if (affinity === 0) {
            if (outputLineIndex > 0 && outputOffset === this.getMinOutputOffset(outputLineIndex)) {
                return new OutputPosition(outputLineIndex - 1, this.getMaxOutputOffset(outputLineIndex - 1));
            }
        }
        else if (affinity === 1) {
            const maxOutputLineIndex = this.getOutputLineCount() - 1;
            if (outputLineIndex < maxOutputLineIndex && outputOffset === this.getMaxOutputOffset(outputLineIndex)) {
                return new OutputPosition(outputLineIndex + 1, this.getMinOutputOffset(outputLineIndex + 1));
            }
        }
        return new OutputPosition(outputLineIndex, outputOffset);
    }
    outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset) {
        if (outputLineIndex > 0) {
            outputOffset = Math.max(0, outputOffset - this.wrappedTextIndentLength);
        }
        const result = (outputLineIndex > 0 ? this.breakOffsets[outputLineIndex - 1] : 0) + outputOffset;
        return result;
    }
    normalizeOffsetInInputWithInjectionsAroundInjections(offsetInInputWithInjections, affinity) {
        const injectedText = this.getInjectedTextAtOffset(offsetInInputWithInjections);
        if (!injectedText) {
            return offsetInInputWithInjections;
        }
        if (affinity === 2) {
            if (offsetInInputWithInjections === injectedText.offsetInInputWithInjections + injectedText.length
                && hasRightCursorStop(this.injectionOptions[injectedText.injectedTextIndex].cursorStops)) {
                return injectedText.offsetInInputWithInjections + injectedText.length;
            }
            else {
                let result = injectedText.offsetInInputWithInjections;
                if (hasLeftCursorStop(this.injectionOptions[injectedText.injectedTextIndex].cursorStops)) {
                    return result;
                }
                let index = injectedText.injectedTextIndex - 1;
                while (index >= 0 && this.injectionOffsets[index] === this.injectionOffsets[injectedText.injectedTextIndex]) {
                    if (hasRightCursorStop(this.injectionOptions[index].cursorStops)) {
                        break;
                    }
                    result -= this.injectionOptions[index].content.length;
                    if (hasLeftCursorStop(this.injectionOptions[index].cursorStops)) {
                        break;
                    }
                    index--;
                }
                return result;
            }
        }
        else if (affinity === 1 || affinity === 4) {
            let result = injectedText.offsetInInputWithInjections + injectedText.length;
            let index = injectedText.injectedTextIndex;
            while (index + 1 < this.injectionOffsets.length && this.injectionOffsets[index + 1] === this.injectionOffsets[index]) {
                result += this.injectionOptions[index + 1].content.length;
                index++;
            }
            return result;
        }
        else if (affinity === 0 || affinity === 3) {
            let result = injectedText.offsetInInputWithInjections;
            let index = injectedText.injectedTextIndex;
            while (index - 1 >= 0 && this.injectionOffsets[index - 1] === this.injectionOffsets[index]) {
                result -= this.injectionOptions[index - 1].content.length;
                index--;
            }
            return result;
        }
        assertNever(affinity);
    }
    getInjectedText(outputLineIndex, outputOffset) {
        const offset = this.outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset);
        const injectedText = this.getInjectedTextAtOffset(offset);
        if (!injectedText) {
            return null;
        }
        return {
            options: this.injectionOptions[injectedText.injectedTextIndex]
        };
    }
    getInjectedTextAtOffset(offsetInInputWithInjections) {
        const injectionOffsets = this.injectionOffsets;
        const injectionOptions = this.injectionOptions;
        if (injectionOffsets !== null) {
            let totalInjectedTextLengthBefore = 0;
            for (let i = 0; i < injectionOffsets.length; i++) {
                const length = injectionOptions[i].content.length;
                const injectedTextStartOffsetInInputWithInjections = injectionOffsets[i] + totalInjectedTextLengthBefore;
                const injectedTextEndOffsetInInputWithInjections = injectionOffsets[i] + totalInjectedTextLengthBefore + length;
                if (injectedTextStartOffsetInInputWithInjections > offsetInInputWithInjections) {
                    break;
                }
                if (offsetInInputWithInjections <= injectedTextEndOffsetInInputWithInjections) {
                    return {
                        injectedTextIndex: i,
                        offsetInInputWithInjections: injectedTextStartOffsetInInputWithInjections,
                        length
                    };
                }
                totalInjectedTextLengthBefore += length;
            }
        }
        return undefined;
    }
}
function hasRightCursorStop(cursorStop) {
    if (cursorStop === null || cursorStop === undefined) {
        return true;
    }
    return cursorStop === InjectedTextCursorStops.Right || cursorStop === InjectedTextCursorStops.Both;
}
function hasLeftCursorStop(cursorStop) {
    if (cursorStop === null || cursorStop === undefined) {
        return true;
    }
    return cursorStop === InjectedTextCursorStops.Left || cursorStop === InjectedTextCursorStops.Both;
}
export class InjectedText {
    constructor(options) {
        this.options = options;
    }
}
export class OutputPosition {
    constructor(outputLineIndex, outputOffset) {
        this.outputLineIndex = outputLineIndex;
        this.outputOffset = outputOffset;
    }
    toString() {
        return `${this.outputLineIndex}:${this.outputOffset}`;
    }
    toPosition(baseLineNumber) {
        return new Position(baseLineNumber + this.outputLineIndex, this.outputOffset + 1);
    }
}
