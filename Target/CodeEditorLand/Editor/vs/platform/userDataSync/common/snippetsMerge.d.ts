import { IStringDictionary } from '../../../base/common/collections.js';
export interface IMergeResult {
    local: {
        added: IStringDictionary<string>;
        updated: IStringDictionary<string>;
        removed: string[];
    };
    remote: {
        added: IStringDictionary<string>;
        updated: IStringDictionary<string>;
        removed: string[];
    };
    conflicts: string[];
}
export declare function merge(local: IStringDictionary<string>, remote: IStringDictionary<string> | null, base: IStringDictionary<string> | null): IMergeResult;
export declare function areSame(a: IStringDictionary<string>, b: IStringDictionary<string>): boolean;
