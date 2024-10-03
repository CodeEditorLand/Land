import { ScopedLineTokens } from '../supports.js';
import { RichEditBrackets } from './richEditBrackets.js';
export interface IElectricAction {
    matchOpenBracket: string;
}
export declare class BracketElectricCharacterSupport {
    private readonly _richEditBrackets;
    constructor(richEditBrackets: RichEditBrackets | null);
    getElectricCharacters(): string[];
    onElectricCharacter(character: string, context: ScopedLineTokens, column: number): IElectricAction | null;
}
