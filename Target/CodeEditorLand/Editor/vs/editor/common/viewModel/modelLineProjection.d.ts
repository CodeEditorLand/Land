import { LineTokens } from '../tokens/lineTokens.js';
import { Position } from '../core/position.js';
import { IRange } from '../core/range.js';
import { EndOfLinePreference, PositionAffinity } from '../model.js';
import { InjectedText, ModelLineProjectionData } from '../modelLineProjectionData.js';
import { ViewLineData } from '../viewModel.js';
export interface IModelLineProjection {
    isVisible(): boolean;
    /**
     * This invalidates the current instance (potentially reuses and returns it again).
    */
    setVisible(isVisible: boolean): IModelLineProjection;
    getProjectionData(): ModelLineProjectionData | null;
    getViewLineCount(): number;
    getViewLineContent(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): string;
    getViewLineLength(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): number;
    getViewLineMinColumn(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): number;
    getViewLineMaxColumn(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): number;
    getViewLineData(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): ViewLineData;
    getViewLinesData(model: ISimpleModel, modelLineNumber: number, outputLineIdx: number, lineCount: number, globalStartIndex: number, needed: boolean[], result: Array<ViewLineData | null>): void;
    getModelColumnOfViewPosition(outputLineIndex: number, outputColumn: number): number;
    getViewPositionOfModelPosition(deltaLineNumber: number, inputColumn: number, affinity?: PositionAffinity): Position;
    getViewLineNumberOfModelPosition(deltaLineNumber: number, inputColumn: number): number;
    normalizePosition(outputLineIndex: number, outputPosition: Position, affinity: PositionAffinity): Position;
    getInjectedTextAt(outputLineIndex: number, column: number): InjectedText | null;
}
export interface ISimpleModel {
    tokenization: {
        getLineTokens(lineNumber: number): LineTokens;
    };
    getLineContent(lineNumber: number): string;
    getLineLength(lineNumber: number): number;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getValueInRange(range: IRange, eol?: EndOfLinePreference): string;
}
export declare function createModelLineProjection(lineBreakData: ModelLineProjectionData | null, isVisible: boolean): IModelLineProjection;
