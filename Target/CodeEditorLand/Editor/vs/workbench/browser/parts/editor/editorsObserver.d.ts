import { IEditorIdentifier } from '../../../common/editor.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Event } from '../../../../base/common/event.js';
import { IEditorGroupsService, IEditorGroupsContainer } from '../../../services/editor/common/editorGroupsService.js';
import { IResourceEditorInputIdentifier } from '../../../../platform/editor/common/editor.js';
import { URI } from '../../../../base/common/uri.js';
/**
 * A observer of opened editors across all editor groups by most recently used.
 * Rules:
 * - the last editor in the list is the one most recently activated
 * - the first editor in the list is the one that was activated the longest time ago
 * - an editor that opens inactive will be placed behind the currently active editor
 *
 * The observer may start to close editors based on the workbench.editor.limit setting.
 */
export declare class EditorsObserver extends Disposable {
    private editorGroupService;
    private readonly storageService;
    private static readonly STORAGE_KEY;
    private readonly keyMap;
    private readonly mostRecentEditorsMap;
    private readonly editorsPerResourceCounter;
    private readonly _onDidMostRecentlyActiveEditorsChange;
    readonly onDidMostRecentlyActiveEditorsChange: Event<void>;
    get count(): number;
    get editors(): IEditorIdentifier[];
    hasEditor(editor: IResourceEditorInputIdentifier): boolean;
    hasEditors(resource: URI): boolean;
    private toIdentifier;
    private readonly editorGroupsContainer;
    private readonly isScoped;
    constructor(editorGroupsContainer: IEditorGroupsContainer | undefined, editorGroupService: IEditorGroupsService, storageService: IStorageService);
    private registerListeners;
    private onGroupAdded;
    private registerGroupListeners;
    private onDidChangeEditorPartOptions;
    private addMostRecentEditor;
    private updateEditorResourcesMap;
    private removeMostRecentEditor;
    private findKey;
    private ensureKey;
    private ensureOpenedEditorsLimit;
    private doEnsureOpenedEditorsLimit;
    private saveState;
    private serialize;
    private loadState;
    private deserialize;
}
