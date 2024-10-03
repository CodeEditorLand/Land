import { Event } from '../../../base/common/event.js';
import { GroupIdentifier, EditorsOrder, IUntypedEditorInput, SideBySideEditor, EditorCloseContext, IMatchEditorOptions, GroupModelChangeKind } from '../editor.js';
import { EditorInput } from './editorInput.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export interface IEditorOpenOptions {
    readonly pinned?: boolean;
    readonly sticky?: boolean;
    readonly transient?: boolean;
    active?: boolean;
    readonly inactiveSelection?: EditorInput[];
    readonly index?: number;
    readonly supportSideBySide?: SideBySideEditor.ANY | SideBySideEditor.BOTH;
}
export interface IEditorOpenResult {
    readonly editor: EditorInput;
    readonly isNew: boolean;
}
export interface ISerializedEditorInput {
    readonly id: string;
    readonly value: string;
}
export interface ISerializedEditorGroupModel {
    readonly id: number;
    readonly locked?: boolean;
    readonly editors: ISerializedEditorInput[];
    readonly mru: number[];
    readonly preview?: number;
    sticky?: number;
}
export declare function isSerializedEditorGroupModel(group?: unknown): group is ISerializedEditorGroupModel;
export interface IMatchOptions {
    readonly supportSideBySide?: SideBySideEditor.ANY | SideBySideEditor.BOTH;
    readonly strictEquals?: boolean;
}
export interface IGroupModelChangeEvent {
    readonly kind: GroupModelChangeKind;
    readonly editor?: EditorInput;
    readonly editorIndex?: number;
}
export interface IGroupEditorChangeEvent extends IGroupModelChangeEvent {
    readonly editor: EditorInput;
    readonly editorIndex: number;
}
export declare function isGroupEditorChangeEvent(e: IGroupModelChangeEvent): e is IGroupEditorChangeEvent;
export interface IGroupEditorOpenEvent extends IGroupEditorChangeEvent {
    readonly kind: GroupModelChangeKind.EDITOR_OPEN;
}
export declare function isGroupEditorOpenEvent(e: IGroupModelChangeEvent): e is IGroupEditorOpenEvent;
export interface IGroupEditorMoveEvent extends IGroupEditorChangeEvent {
    readonly kind: GroupModelChangeKind.EDITOR_MOVE;
    readonly oldEditorIndex: number;
}
export declare function isGroupEditorMoveEvent(e: IGroupModelChangeEvent): e is IGroupEditorMoveEvent;
export interface IGroupEditorCloseEvent extends IGroupEditorChangeEvent {
    readonly kind: GroupModelChangeKind.EDITOR_CLOSE;
    readonly context: EditorCloseContext;
    readonly sticky: boolean;
}
export declare function isGroupEditorCloseEvent(e: IGroupModelChangeEvent): e is IGroupEditorCloseEvent;
interface IEditorCloseResult {
    readonly editor: EditorInput;
    readonly context: EditorCloseContext;
    readonly editorIndex: number;
    readonly sticky: boolean;
}
export interface IReadonlyEditorGroupModel {
    readonly onDidModelChange: Event<IGroupModelChangeEvent>;
    readonly id: GroupIdentifier;
    readonly count: number;
    readonly stickyCount: number;
    readonly isLocked: boolean;
    readonly activeEditor: EditorInput | null;
    readonly previewEditor: EditorInput | null;
    readonly selectedEditors: EditorInput[];
    getEditors(order: EditorsOrder, options?: {
        excludeSticky?: boolean;
    }): EditorInput[];
    getEditorByIndex(index: number): EditorInput | undefined;
    indexOf(editor: EditorInput | IUntypedEditorInput | null, editors?: EditorInput[], options?: IMatchEditorOptions): number;
    isActive(editor: EditorInput | IUntypedEditorInput): boolean;
    isPinned(editorOrIndex: EditorInput | number): boolean;
    isSticky(editorOrIndex: EditorInput | number): boolean;
    isSelected(editorOrIndex: EditorInput | number): boolean;
    isTransient(editorOrIndex: EditorInput | number): boolean;
    isFirst(editor: EditorInput, editors?: EditorInput[]): boolean;
    isLast(editor: EditorInput, editors?: EditorInput[]): boolean;
    findEditor(editor: EditorInput | null, options?: IMatchEditorOptions): [EditorInput, number] | undefined;
    contains(editor: EditorInput | IUntypedEditorInput, options?: IMatchEditorOptions): boolean;
}
interface IEditorGroupModel extends IReadonlyEditorGroupModel {
    openEditor(editor: EditorInput, options?: IEditorOpenOptions): IEditorOpenResult;
    closeEditor(editor: EditorInput, context?: EditorCloseContext, openNext?: boolean): IEditorCloseResult | undefined;
    moveEditor(editor: EditorInput, toIndex: number): EditorInput | undefined;
    setActive(editor: EditorInput | undefined): EditorInput | undefined;
    setSelection(activeSelectedEditor: EditorInput, inactiveSelectedEditors: EditorInput[]): void;
}
export declare class EditorGroupModel extends Disposable implements IEditorGroupModel {
    private readonly instantiationService;
    private readonly configurationService;
    private static IDS;
    private readonly _onDidModelChange;
    readonly onDidModelChange: Event<IGroupModelChangeEvent>;
    private _id;
    get id(): GroupIdentifier;
    private editors;
    private mru;
    private readonly editorListeners;
    private locked;
    private selection;
    private get active();
    private preview;
    private sticky;
    private readonly transient;
    private editorOpenPositioning;
    private focusRecentEditorAfterClose;
    constructor(labelOrSerializedGroup: ISerializedEditorGroupModel | undefined, instantiationService: IInstantiationService, configurationService: IConfigurationService);
    private registerListeners;
    private onConfigurationUpdated;
    get count(): number;
    get stickyCount(): number;
    getEditors(order: EditorsOrder, options?: {
        excludeSticky?: boolean;
    }): EditorInput[];
    getEditorByIndex(index: number): EditorInput | undefined;
    get activeEditor(): EditorInput | null;
    isActive(candidate: EditorInput | IUntypedEditorInput): boolean;
    get previewEditor(): EditorInput | null;
    openEditor(candidate: EditorInput, options?: IEditorOpenOptions): IEditorOpenResult;
    private registerEditorListeners;
    private replaceEditor;
    closeEditor(candidate: EditorInput, context?: EditorCloseContext, openNext?: boolean): IEditorCloseResult | undefined;
    private doCloseEditor;
    moveEditor(candidate: EditorInput, toIndex: number): EditorInput | undefined;
    setActive(candidate: EditorInput | undefined): EditorInput | undefined;
    private setGroupActive;
    private setEditorActive;
    get selectedEditors(): EditorInput[];
    isSelected(editorCandidateOrIndex: EditorInput | number): boolean;
    private doIsSelected;
    setSelection(activeSelectedEditorCandidate: EditorInput, inactiveSelectedEditorCandidates: EditorInput[]): void;
    private doSetSelection;
    setIndex(index: number): void;
    setLabel(label: string): void;
    pin(candidate: EditorInput): EditorInput | undefined;
    private doPin;
    unpin(candidate: EditorInput): EditorInput | undefined;
    private doUnpin;
    isPinned(editorCandidateOrIndex: EditorInput | number): boolean;
    stick(candidate: EditorInput): EditorInput | undefined;
    private doStick;
    unstick(candidate: EditorInput): EditorInput | undefined;
    private doUnstick;
    isSticky(candidateOrIndex: EditorInput | number): boolean;
    setTransient(candidate: EditorInput, transient: boolean): EditorInput | undefined;
    private doSetTransient;
    isTransient(editorCandidateOrIndex: EditorInput | number): boolean;
    private splice;
    indexOf(candidate: EditorInput | IUntypedEditorInput | null, editors?: EditorInput[], options?: IMatchEditorOptions): number;
    findEditor(candidate: EditorInput | null, options?: IMatchEditorOptions): [EditorInput, number] | undefined;
    isFirst(candidate: EditorInput | null, editors?: EditorInput[]): boolean;
    isLast(candidate: EditorInput | null, editors?: EditorInput[]): boolean;
    contains(candidate: EditorInput | IUntypedEditorInput, options?: IMatchEditorOptions): boolean;
    private matches;
    get isLocked(): boolean;
    lock(locked: boolean): void;
    clone(): EditorGroupModel;
    serialize(): ISerializedEditorGroupModel;
    private deserialize;
    dispose(): void;
}
export {};
