import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export type MergeEditorLayoutKind = 'mixed' | 'columns';
export declare const ctxIsMergeEditor: RawContextKey<boolean>;
export declare const ctxIsMergeResultEditor: RawContextKey<boolean>;
export declare const ctxMergeEditorLayout: RawContextKey<MergeEditorLayoutKind>;
export declare const ctxMergeEditorShowBase: RawContextKey<boolean>;
export declare const ctxMergeEditorShowBaseAtTop: RawContextKey<boolean>;
export declare const ctxMergeEditorShowNonConflictingChanges: RawContextKey<boolean>;
export declare const ctxMergeBaseUri: RawContextKey<string>;
export declare const ctxMergeResultUri: RawContextKey<string>;
export interface MergeEditorContents {
    languageId: string;
    base: string;
    input1: string;
    input2: string;
    result: string;
    initialResult?: string;
}
export declare const StorageCloseWithConflicts = "mergeEditorCloseWithConflicts";
