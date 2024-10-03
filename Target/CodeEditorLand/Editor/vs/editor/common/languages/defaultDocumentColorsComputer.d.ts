import { IPosition } from '../core/position.js';
import { IColorInformation } from '../languages.js';
export interface IDocumentColorComputerTarget {
    getValue(): string;
    positionAt(offset: number): IPosition;
    findMatches(regex: RegExp): RegExpMatchArray[];
}
export declare function computeDefaultDocumentColors(model: IDocumentColorComputerTarget): IColorInformation[];
