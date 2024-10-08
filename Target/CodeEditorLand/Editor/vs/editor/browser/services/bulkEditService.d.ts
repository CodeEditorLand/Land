import { ICodeEditor } from '../editorBrowser.js';
import { TextEdit, WorkspaceEdit, WorkspaceEditMetadata, IWorkspaceFileEdit, WorkspaceFileEditOptions, IWorkspaceTextEdit } from '../../common/languages.js';
import { IProgress, IProgressStep } from '../../../platform/progress/common/progress.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { UndoRedoSource } from '../../../platform/undoRedo/common/undoRedo.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
export declare const IBulkEditService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBulkEditService>;
export declare class ResourceEdit {
    readonly metadata?: WorkspaceEditMetadata | undefined;
    protected constructor(metadata?: WorkspaceEditMetadata | undefined);
    static convert(edit: WorkspaceEdit): ResourceEdit[];
}
export declare class ResourceTextEdit extends ResourceEdit implements IWorkspaceTextEdit {
    readonly resource: URI;
    readonly textEdit: TextEdit & {
        insertAsSnippet?: boolean;
    };
    readonly versionId: number | undefined;
    static is(candidate: any): candidate is IWorkspaceTextEdit;
    static lift(edit: IWorkspaceTextEdit): ResourceTextEdit;
    constructor(resource: URI, textEdit: TextEdit & {
        insertAsSnippet?: boolean;
    }, versionId?: number | undefined, metadata?: WorkspaceEditMetadata);
}
export declare class ResourceFileEdit extends ResourceEdit implements IWorkspaceFileEdit {
    readonly oldResource: URI | undefined;
    readonly newResource: URI | undefined;
    readonly options: WorkspaceFileEditOptions;
    static is(candidate: any): candidate is IWorkspaceFileEdit;
    static lift(edit: IWorkspaceFileEdit): ResourceFileEdit;
    constructor(oldResource: URI | undefined, newResource: URI | undefined, options?: WorkspaceFileEditOptions, metadata?: WorkspaceEditMetadata);
}
export interface IBulkEditOptions {
    editor?: ICodeEditor;
    progress?: IProgress<IProgressStep>;
    token?: CancellationToken;
    showPreview?: boolean;
    label?: string;
    code?: string;
    quotableLabel?: string;
    undoRedoSource?: UndoRedoSource;
    undoRedoGroupId?: number;
    confirmBeforeUndo?: boolean;
    respectAutoSaveConfig?: boolean;
}
export interface IBulkEditResult {
    ariaSummary: string;
    isApplied: boolean;
}
export type IBulkEditPreviewHandler = (edits: ResourceEdit[], options?: IBulkEditOptions) => Promise<ResourceEdit[]>;
export interface IBulkEditService {
    readonly _serviceBrand: undefined;
    hasPreviewHandler(): boolean;
    setPreviewHandler(handler: IBulkEditPreviewHandler): IDisposable;
    apply(edit: ResourceEdit[] | WorkspaceEdit, options?: IBulkEditOptions): Promise<IBulkEditResult>;
}
