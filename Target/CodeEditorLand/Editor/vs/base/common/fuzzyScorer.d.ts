import { IMatch } from './filters.js';
export type FuzzyScore = [number, number[]];
export type FuzzyScorerCache = {
    [key: string]: IItemScore;
};
export declare function scoreFuzzy(target: string, query: string, queryLower: string, allowNonContiguousMatches: boolean): FuzzyScore;
export type FuzzyScore2 = [number | undefined, IMatch[]];
export declare function scoreFuzzy2(target: string, query: IPreparedQuery | IPreparedQueryPiece, patternStart?: number, wordStart?: number): FuzzyScore2;
export interface IItemScore {
    score: number;
    labelMatch?: IMatch[];
    descriptionMatch?: IMatch[];
}
export interface IItemAccessor<T> {
    getItemLabel(item: T): string | undefined;
    getItemDescription(item: T): string | undefined;
    getItemPath(file: T): string | undefined;
}
export declare function scoreItemFuzzy<T>(item: T, query: IPreparedQuery, allowNonContiguousMatches: boolean, accessor: IItemAccessor<T>, cache: FuzzyScorerCache): IItemScore;
export declare function compareItemsByFuzzyScore<T>(itemA: T, itemB: T, query: IPreparedQuery, allowNonContiguousMatches: boolean, accessor: IItemAccessor<T>, cache: FuzzyScorerCache): number;
export interface IPreparedQueryPiece {
    original: string;
    originalLowercase: string;
    pathNormalized: string;
    normalized: string;
    normalizedLowercase: string;
    expectContiguousMatch: boolean;
}
export interface IPreparedQuery extends IPreparedQueryPiece {
    values: IPreparedQueryPiece[] | undefined;
    containsPathSeparator: boolean;
}
export declare function prepareQuery(original: string): IPreparedQuery;
export declare function pieceToQuery(piece: IPreparedQueryPiece): IPreparedQuery;
export declare function pieceToQuery(pieces: IPreparedQueryPiece[]): IPreparedQuery;
