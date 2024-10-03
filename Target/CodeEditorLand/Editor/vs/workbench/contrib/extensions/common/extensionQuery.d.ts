export declare class Query {
    value: string;
    sortBy: string;
    constructor(value: string, sortBy: string);
    static suggestions(query: string): string[];
    static parse(value: string): Query;
    toString(): string;
    isValid(): boolean;
    equals(other: Query): boolean;
}
