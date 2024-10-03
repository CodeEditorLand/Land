import { IResourceEditorInput } from '../../../../platform/editor/common/editor.js';
import { GroupIdentifier } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { URI } from '../../../../base/common/uri.js';
export declare const IHistoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IHistoryService>;
export declare const enum GoFilter {
    NONE = 0,
    EDITS = 1,
    NAVIGATION = 2
}
export declare const enum GoScope {
    DEFAULT = 0,
    EDITOR_GROUP = 1,
    EDITOR = 2
}
export interface IHistoryService {
    readonly _serviceBrand: undefined;
    goForward(filter?: GoFilter): Promise<void>;
    goBack(filter?: GoFilter): Promise<void>;
    goPrevious(filter?: GoFilter): Promise<void>;
    goLast(filter?: GoFilter): Promise<void>;
    reopenLastClosedEditor(): Promise<void>;
    getHistory(): readonly (EditorInput | IResourceEditorInput)[];
    removeFromHistory(input: EditorInput | IResourceEditorInput): void;
    getLastActiveWorkspaceRoot(schemeFilter?: string, authorityFilter?: string): URI | undefined;
    getLastActiveFile(schemeFilter: string, authorityFilter?: string): URI | undefined;
    openNextRecentlyUsedEditor(group?: GroupIdentifier): Promise<void>;
    openPreviouslyUsedEditor(group?: GroupIdentifier): Promise<void>;
    clear(): void;
    clearRecentlyOpened(): void;
}
