import { ITextBuffer } from '../model.js';
export interface IGuessedIndentation {
    tabSize: number;
    insertSpaces: boolean;
}
export declare function guessIndentation(source: ITextBuffer, defaultTabSize: number, defaultInsertSpaces: boolean): IGuessedIndentation;
