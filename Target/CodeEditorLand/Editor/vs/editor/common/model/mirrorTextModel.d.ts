import { URI } from '../../../base/common/uri.js';
import { IModelContentChange } from '../textModelEvents.js';
import { PrefixSumComputer } from './prefixSumComputer.js';
export interface IModelChangedEvent {
    readonly changes: IModelContentChange[];
    readonly eol: string;
    readonly versionId: number;
    readonly isUndoing: boolean;
    readonly isRedoing: boolean;
}
export interface IMirrorTextModel {
    readonly version: number;
}
export declare class MirrorTextModel implements IMirrorTextModel {
    protected _uri: URI;
    protected _lines: string[];
    protected _eol: string;
    protected _versionId: number;
    protected _lineStarts: PrefixSumComputer | null;
    private _cachedTextValue;
    constructor(uri: URI, lines: string[], eol: string, versionId: number);
    dispose(): void;
    get version(): number;
    getText(): string;
    onEvents(e: IModelChangedEvent): void;
    protected _ensureLineStarts(): void;
    private _setLineText;
    private _acceptDeleteRange;
    private _acceptInsertText;
}
