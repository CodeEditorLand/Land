import { URI } from '../../../../base/common/uri.js';
import { DocumentDropEdit, DocumentPasteEdit, DropYieldTo, WorkspaceEdit } from '../../../common/languages.js';
import { Range } from '../../../common/core/range.js';
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
/**
 * Given a {@link DropOrPasteEdit} and set of ranges, creates a {@link WorkspaceEdit} that applies the insert text from
 * the {@link DropOrPasteEdit} at each range plus any additional edits.
 */
export declare function createCombinedWorkspaceEdit(uri: URI, ranges: readonly Range[], edit: DocumentPasteEdit | DocumentDropEdit): WorkspaceEdit;
export declare function sortEditsByYieldTo<T extends {
    readonly kind: HierarchicalKind | undefined;
    readonly handledMimeType?: string;
    readonly yieldTo?: readonly DropYieldTo[];
}>(edits: readonly T[]): T[];
