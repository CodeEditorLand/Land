import { IResourceEditorInput, IEditorOptions, IResourceEditorInputIdentifier, ITextResourceEditorInput } from '../../../../platform/editor/common/editor.js';
import { IEditorPane, GroupIdentifier, IUntitledTextResourceEditorInput, IResourceDiffEditorInput, ITextDiffEditorPane, IEditorIdentifier, ISaveOptions, IRevertOptions, EditorsOrder, IVisibleEditorPane, IEditorCloseEvent, IUntypedEditorInput, IFindEditorOptions, IEditorWillOpenEvent } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { Event } from '../../../../base/common/event.js';
import { IEditor, IDiffEditor } from '../../../../editor/common/editorCommon.js';
import { ICloseEditorOptions, IEditorGroup, IEditorGroupsContainer } from './editorGroupsService.js';
import { URI } from '../../../../base/common/uri.js';
import { IGroupModelChangeEvent } from '../../../common/editor/editorGroupModel.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
export declare const IEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorService>;
export declare const ACTIVE_GROUP = -1;
export type ACTIVE_GROUP_TYPE = typeof ACTIVE_GROUP;
export declare const SIDE_GROUP = -2;
export type SIDE_GROUP_TYPE = typeof SIDE_GROUP;
export declare const AUX_WINDOW_GROUP = -3;
export type AUX_WINDOW_GROUP_TYPE = typeof AUX_WINDOW_GROUP;
export type PreferredGroup = IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE;
export declare function isPreferredGroup(obj: unknown): obj is PreferredGroup;
export interface ISaveEditorsOptions extends ISaveOptions {
    readonly saveAs?: boolean;
}
export interface ISaveEditorsResult {
    readonly success: boolean;
    readonly editors: Array<EditorInput | IUntypedEditorInput>;
}
export interface IUntypedEditorReplacement {
    readonly editor: EditorInput;
    readonly replacement: IUntypedEditorInput;
    forceReplaceDirty?: boolean;
}
export interface IBaseSaveRevertAllEditorOptions {
    readonly includeUntitled?: {
        readonly includeScratchpad: boolean;
    } | boolean;
    readonly excludeSticky?: boolean;
}
export interface ISaveAllEditorsOptions extends ISaveEditorsOptions, IBaseSaveRevertAllEditorOptions {
}
export interface IRevertAllEditorsOptions extends IRevertOptions, IBaseSaveRevertAllEditorOptions {
}
export interface IOpenEditorsOptions {
    readonly validateTrust?: boolean;
}
export interface IEditorsChangeEvent {
    groupId: GroupIdentifier;
    event: IGroupModelChangeEvent;
}
export interface IEditorService {
    readonly _serviceBrand: undefined;
    readonly onDidActiveEditorChange: Event<void>;
    readonly onDidVisibleEditorsChange: Event<void>;
    readonly onDidEditorsChange: Event<IEditorsChangeEvent>;
    readonly onWillOpenEditor: Event<IEditorWillOpenEvent>;
    readonly onDidCloseEditor: Event<IEditorCloseEvent>;
    readonly activeEditorPane: IVisibleEditorPane | undefined;
    readonly activeEditor: EditorInput | undefined;
    readonly activeTextEditorControl: IEditor | IDiffEditor | undefined;
    readonly activeTextEditorLanguageId: string | undefined;
    readonly visibleEditorPanes: readonly IVisibleEditorPane[];
    readonly visibleEditors: readonly EditorInput[];
    readonly visibleTextEditorControls: readonly (IEditor | IDiffEditor)[];
    readonly editors: readonly EditorInput[];
    readonly count: number;
    getEditors(order: EditorsOrder, options?: {
        excludeSticky?: boolean;
    }): readonly IEditorIdentifier[];
    openEditor(editor: IResourceEditorInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): Promise<IEditorPane | undefined>;
    openEditor(editor: ITextResourceEditorInput | IUntitledTextResourceEditorInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): Promise<IEditorPane | undefined>;
    openEditor(editor: IResourceDiffEditorInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): Promise<ITextDiffEditorPane | undefined>;
    openEditor(editor: IUntypedEditorInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): Promise<IEditorPane | undefined>;
    openEditor(editor: EditorInput, options?: IEditorOptions, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): Promise<IEditorPane | undefined>;
    openEditors(editors: IUntypedEditorInput[], group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE, options?: IOpenEditorsOptions): Promise<readonly IEditorPane[]>;
    replaceEditors(replacements: IUntypedEditorReplacement[], group: IEditorGroup | GroupIdentifier): Promise<void>;
    isOpened(editor: IResourceEditorInputIdentifier): boolean;
    isVisible(editor: EditorInput): boolean;
    closeEditor(editor: IEditorIdentifier, options?: ICloseEditorOptions): Promise<void>;
    closeEditors(editors: readonly IEditorIdentifier[], options?: ICloseEditorOptions): Promise<void>;
    findEditors(resource: URI, options?: IFindEditorOptions): readonly IEditorIdentifier[];
    findEditors(editor: IResourceEditorInputIdentifier, options?: IFindEditorOptions): readonly IEditorIdentifier[];
    save(editors: IEditorIdentifier | IEditorIdentifier[], options?: ISaveEditorsOptions): Promise<ISaveEditorsResult>;
    saveAll(options?: ISaveAllEditorsOptions): Promise<ISaveEditorsResult>;
    revert(editors: IEditorIdentifier | IEditorIdentifier[], options?: IRevertOptions): Promise<boolean>;
    revertAll(options?: IRevertAllEditorsOptions): Promise<boolean>;
    createScoped(editorGroupsContainer: IEditorGroupsContainer | 'main', disposables: DisposableStore): IEditorService;
}
