import { IFilter } from '../../../../base/common/filters.js';
export declare class FilterOptions {
    readonly filter: string;
    static readonly _filter: IFilter;
    static readonly _messageFilter: IFilter;
    readonly showResolved: boolean;
    readonly showUnresolved: boolean;
    readonly textFilter: {
        readonly text: string;
        readonly negate: boolean;
    };
    constructor(filter: string, showResolved: boolean, showUnresolved: boolean);
}
