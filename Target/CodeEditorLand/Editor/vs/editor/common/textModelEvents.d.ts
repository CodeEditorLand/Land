import { IRange } from './core/range.js';
import { Selection } from './core/selection.js';
import { IModelDecoration, InjectedTextOptions } from './model.js';
export interface IModelLanguageChangedEvent {
    readonly oldLanguage: string;
    readonly newLanguage: string;
    readonly source: string;
}
export interface IModelLanguageConfigurationChangedEvent {
}
export interface IModelContentChange {
    readonly range: IRange;
    readonly rangeOffset: number;
    readonly rangeLength: number;
    readonly text: string;
}
export interface IModelContentChangedEvent {
    readonly changes: IModelContentChange[];
    readonly eol: string;
    readonly versionId: number;
    readonly isUndoing: boolean;
    readonly isRedoing: boolean;
    readonly isFlush: boolean;
    readonly isEolChange: boolean;
}
export interface IModelDecorationsChangedEvent {
    readonly affectsMinimap: boolean;
    readonly affectsOverviewRuler: boolean;
    readonly affectsGlyphMargin: boolean;
    readonly affectsLineNumber: boolean;
}
export interface IModelTokensChangedEvent {
    readonly semanticTokensApplied: boolean;
    readonly ranges: {
        readonly fromLineNumber: number;
        readonly toLineNumber: number;
    }[];
}
export interface IModelOptionsChangedEvent {
    readonly tabSize: boolean;
    readonly indentSize: boolean;
    readonly insertSpaces: boolean;
    readonly trimAutoWhitespace: boolean;
}
export declare const enum RawContentChangedType {
    Flush = 1,
    LineChanged = 2,
    LinesDeleted = 3,
    LinesInserted = 4,
    EOLChanged = 5
}
export declare class ModelRawFlush {
    readonly changeType = RawContentChangedType.Flush;
}
export declare class LineInjectedText {
    readonly ownerId: number;
    readonly lineNumber: number;
    readonly column: number;
    readonly options: InjectedTextOptions;
    readonly order: number;
    static applyInjectedText(lineText: string, injectedTexts: LineInjectedText[] | null): string;
    static fromDecorations(decorations: IModelDecoration[]): LineInjectedText[];
    constructor(ownerId: number, lineNumber: number, column: number, options: InjectedTextOptions, order: number);
    withText(text: string): LineInjectedText;
}
export declare class ModelRawLineChanged {
    readonly changeType = RawContentChangedType.LineChanged;
    readonly lineNumber: number;
    readonly detail: string;
    readonly injectedText: LineInjectedText[] | null;
    constructor(lineNumber: number, detail: string, injectedText: LineInjectedText[] | null);
}
export declare class ModelRawLinesDeleted {
    readonly changeType = RawContentChangedType.LinesDeleted;
    readonly fromLineNumber: number;
    readonly toLineNumber: number;
    constructor(fromLineNumber: number, toLineNumber: number);
}
export declare class ModelRawLinesInserted {
    readonly changeType = RawContentChangedType.LinesInserted;
    readonly fromLineNumber: number;
    readonly toLineNumber: number;
    readonly detail: string[];
    readonly injectedTexts: (LineInjectedText[] | null)[];
    constructor(fromLineNumber: number, toLineNumber: number, detail: string[], injectedTexts: (LineInjectedText[] | null)[]);
}
export declare class ModelRawEOLChanged {
    readonly changeType = RawContentChangedType.EOLChanged;
}
export type ModelRawChange = ModelRawFlush | ModelRawLineChanged | ModelRawLinesDeleted | ModelRawLinesInserted | ModelRawEOLChanged;
export declare class ModelRawContentChangedEvent {
    readonly changes: ModelRawChange[];
    readonly versionId: number;
    readonly isUndoing: boolean;
    readonly isRedoing: boolean;
    resultingSelection: Selection[] | null;
    constructor(changes: ModelRawChange[], versionId: number, isUndoing: boolean, isRedoing: boolean);
    containsEvent(type: RawContentChangedType): boolean;
    static merge(a: ModelRawContentChangedEvent, b: ModelRawContentChangedEvent): ModelRawContentChangedEvent;
}
export declare class ModelInjectedTextChangedEvent {
    readonly changes: ModelRawLineChanged[];
    constructor(changes: ModelRawLineChanged[]);
}
export declare class InternalModelContentChangeEvent {
    readonly rawContentChangedEvent: ModelRawContentChangedEvent;
    readonly contentChangedEvent: IModelContentChangedEvent;
    constructor(rawContentChangedEvent: ModelRawContentChangedEvent, contentChangedEvent: IModelContentChangedEvent);
    merge(other: InternalModelContentChangeEvent): InternalModelContentChangeEvent;
    private static _mergeChangeEvents;
}
