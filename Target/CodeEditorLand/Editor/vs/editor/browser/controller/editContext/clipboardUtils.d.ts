import { IViewModel } from '../../../common/viewModel.js';
import { Range } from '../../../common/core/range.js';
export declare function getDataToCopy(viewModel: IViewModel, modelSelections: Range[], emptySelectionClipboard: boolean, copyWithSyntaxHighlighting: boolean): ClipboardDataToCopy;
/**
 * Every time we write to the clipboard, we record a bit of extra metadata here.
 * Every time we read from the cipboard, if the text matches our last written text,
 * we can fetch the previous metadata.
 */
export declare class InMemoryClipboardMetadataManager {
    static readonly INSTANCE: InMemoryClipboardMetadataManager;
    private _lastState;
    constructor();
    set(lastCopiedValue: string, data: ClipboardStoredMetadata): void;
    get(pastedText: string): ClipboardStoredMetadata | null;
}
export interface ClipboardDataToCopy {
    isFromEmptySelection: boolean;
    multicursorText: string[] | null | undefined;
    text: string;
    html: string | null | undefined;
    mode: string | null;
}
export interface ClipboardStoredMetadata {
    version: 1;
    isFromEmptySelection: boolean | undefined;
    multicursorText: string[] | null | undefined;
    mode: string | null;
}
export declare const CopyOptions: {
    forceCopyWithSyntaxHighlighting: boolean;
};
