import { URI } from '../../../../base/common/uri.js';
import { IWorkingCopyHistoryEntry, IWorkingCopyHistoryService } from '../../../services/workingCopy/common/workingCopyHistory.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
export interface ITimelineCommandArgument {
    uri: URI;
    handle: string;
}
export declare const COMPARE_WITH_FILE_LABEL: import("../../../../nls.js").ILocalizedString;
export declare function toDiffEditorArguments(entry: IWorkingCopyHistoryEntry, resource: URI, options?: IEditorOptions): unknown[];
export declare function toDiffEditorArguments(previousEntry: IWorkingCopyHistoryEntry, entry: IWorkingCopyHistoryEntry, options?: IEditorOptions): unknown[];
export declare function findLocalHistoryEntry(workingCopyHistoryService: IWorkingCopyHistoryService, descriptor: ITimelineCommandArgument): Promise<{
    entry: IWorkingCopyHistoryEntry | undefined;
    previous: IWorkingCopyHistoryEntry | undefined;
}>;
