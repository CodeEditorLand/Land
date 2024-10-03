import { WrappingIndent } from './config/editorOptions.js';
import { FontInfo } from './config/fontInfo.js';
import { Position } from './core/position.js';
import { InjectedTextOptions, PositionAffinity } from './model.js';
import { LineInjectedText } from './textModelEvents.js';
export declare class ModelLineProjectionData {
    injectionOffsets: number[] | null;
    injectionOptions: InjectedTextOptions[] | null;
    breakOffsets: number[];
    breakOffsetsVisibleColumn: number[];
    wrappedTextIndentLength: number;
    constructor(injectionOffsets: number[] | null, injectionOptions: InjectedTextOptions[] | null, breakOffsets: number[], breakOffsetsVisibleColumn: number[], wrappedTextIndentLength: number);
    getOutputLineCount(): number;
    getMinOutputOffset(outputLineIndex: number): number;
    getLineLength(outputLineIndex: number): number;
    getMaxOutputOffset(outputLineIndex: number): number;
    translateToInputOffset(outputLineIndex: number, outputOffset: number): number;
    translateToOutputPosition(inputOffset: number, affinity?: PositionAffinity): OutputPosition;
    private offsetInInputWithInjectionsToOutputPosition;
    normalizeOutputPosition(outputLineIndex: number, outputOffset: number, affinity: PositionAffinity): OutputPosition;
    private outputPositionToOffsetInInputWithInjections;
    private normalizeOffsetInInputWithInjectionsAroundInjections;
    getInjectedText(outputLineIndex: number, outputOffset: number): InjectedText | null;
    private getInjectedTextAtOffset;
}
export declare class InjectedText {
    readonly options: InjectedTextOptions;
    constructor(options: InjectedTextOptions);
}
export declare class OutputPosition {
    outputLineIndex: number;
    outputOffset: number;
    constructor(outputLineIndex: number, outputOffset: number);
    toString(): string;
    toPosition(baseLineNumber: number): Position;
}
export interface ILineBreaksComputerFactory {
    createLineBreaksComputer(fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: 'normal' | 'keepAll'): ILineBreaksComputer;
}
export interface ILineBreaksComputer {
    addRequest(lineText: string, injectedText: LineInjectedText[] | null, previousLineBreakData: ModelLineProjectionData | null): void;
    finalize(): (ModelLineProjectionData | null)[];
}
