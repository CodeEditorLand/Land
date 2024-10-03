import { Event } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorPane, GroupIdentifier, EditorInputWithOptions, CloseDirection, IEditorPartOptions, IEditorPartOptionsChangeEvent, EditorsOrder, IVisibleEditorPane, IEditorCloseEvent, IUntypedEditorInput, IEditorWillMoveEvent, IMatchEditorOptions, IActiveEditorChangeEvent, IFindEditorOptions, IToolbarActions } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDimension } from '../../../../editor/common/core/dimension.js';
import { DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { ContextKeyValue, IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { URI } from '../../../../base/common/uri.js';
import { IGroupModelChangeEvent } from '../../../common/editor/editorGroupModel.js';
import { IRectangle } from '../../../../platform/window/common/window.js';
import { IMenuChangeEvent } from '../../../../platform/actions/common/actions.js';
import { DeepPartial } from '../../../../base/common/types.js';
export declare const IEditorGroupsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorGroupsService>;
export declare const enum GroupDirection {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
}
export declare const enum GroupOrientation {
    HORIZONTAL = 0,
    VERTICAL = 1
}
export declare const enum GroupLocation {
    FIRST = 0,
    LAST = 1,
    NEXT = 2,
    PREVIOUS = 3
}
export interface IFindGroupScope {
    readonly direction?: GroupDirection;
    readonly location?: GroupLocation;
}
export declare const enum GroupsArrangement {
    MAXIMIZE = 0,
    EXPAND = 1,
    EVEN = 2
}
export interface GroupLayoutArgument {
    readonly size?: number;
    readonly groups?: GroupLayoutArgument[];
}
export interface EditorGroupLayout {
    readonly orientation: GroupOrientation;
    readonly groups: GroupLayoutArgument[];
}
export declare const enum MergeGroupMode {
    COPY_EDITORS = 0,
    MOVE_EDITORS = 1
}
export interface IMergeGroupOptions {
    mode?: MergeGroupMode;
    readonly index?: number;
}
export interface ICloseEditorOptions {
    readonly preserveFocus?: boolean;
}
export type ICloseEditorsFilter = {
    readonly except?: EditorInput;
    readonly direction?: CloseDirection;
    readonly savedOnly?: boolean;
    readonly excludeSticky?: boolean;
};
export interface ICloseAllEditorsOptions {
    readonly excludeSticky?: boolean;
    readonly excludeConfirming?: boolean;
}
export interface IEditorReplacement {
    readonly editor: EditorInput;
    readonly replacement: EditorInput;
    readonly options?: IEditorOptions;
    readonly forceReplaceDirty?: boolean;
}
export declare function isEditorReplacement(replacement: unknown): replacement is IEditorReplacement;
export declare const enum GroupsOrder {
    CREATION_TIME = 0,
    MOST_RECENTLY_ACTIVE = 1,
    GRID_APPEARANCE = 2
}
export interface IEditorSideGroup {
    openEditor(editor: EditorInput, options?: IEditorOptions): Promise<IEditorPane | undefined>;
}
export interface IEditorDropTargetDelegate {
    containsGroup?(groupView: IEditorGroup): boolean;
}
export interface IEditorGroupsContainer {
    readonly onDidChangeActiveGroup: Event<IEditorGroup>;
    readonly onDidAddGroup: Event<IEditorGroup>;
    readonly onDidRemoveGroup: Event<IEditorGroup>;
    readonly onDidMoveGroup: Event<IEditorGroup>;
    readonly onDidActivateGroup: Event<IEditorGroup>;
    readonly onDidChangeGroupIndex: Event<IEditorGroup>;
    readonly onDidChangeGroupLocked: Event<IEditorGroup>;
    readonly onDidChangeGroupMaximized: Event<boolean>;
    readonly isReady: boolean;
    readonly whenReady: Promise<void>;
    readonly whenRestored: Promise<void>;
    readonly hasRestorableState: boolean;
    readonly activeGroup: IEditorGroup;
    readonly sideGroup: IEditorSideGroup;
    readonly groups: readonly IEditorGroup[];
    readonly count: number;
    readonly orientation: GroupOrientation;
    getGroups(order: GroupsOrder): readonly IEditorGroup[];
    getGroup(identifier: GroupIdentifier): IEditorGroup | undefined;
    activateGroup(group: IEditorGroup | GroupIdentifier): IEditorGroup;
    getSize(group: IEditorGroup | GroupIdentifier): {
        width: number;
        height: number;
    };
    setSize(group: IEditorGroup | GroupIdentifier, size: {
        width: number;
        height: number;
    }): void;
    arrangeGroups(arrangement: GroupsArrangement, target?: IEditorGroup | GroupIdentifier): void;
    toggleMaximizeGroup(group?: IEditorGroup | GroupIdentifier): void;
    toggleExpandGroup(group?: IEditorGroup | GroupIdentifier): void;
    applyLayout(layout: EditorGroupLayout): void;
    getLayout(): EditorGroupLayout;
    setGroupOrientation(orientation: GroupOrientation): void;
    findGroup(scope: IFindGroupScope, source?: IEditorGroup | GroupIdentifier, wrap?: boolean): IEditorGroup | undefined;
    addGroup(location: IEditorGroup | GroupIdentifier, direction: GroupDirection): IEditorGroup;
    removeGroup(group: IEditorGroup | GroupIdentifier): void;
    moveGroup(group: IEditorGroup | GroupIdentifier, location: IEditorGroup | GroupIdentifier, direction: GroupDirection): IEditorGroup;
    mergeGroup(group: IEditorGroup | GroupIdentifier, target: IEditorGroup | GroupIdentifier, options?: IMergeGroupOptions): boolean;
    mergeAllGroups(target: IEditorGroup | GroupIdentifier): boolean;
    copyGroup(group: IEditorGroup | GroupIdentifier, location: IEditorGroup | GroupIdentifier, direction: GroupDirection): IEditorGroup;
    createEditorDropTarget(container: unknown, delegate: IEditorDropTargetDelegate): IDisposable;
}
export interface IEditorPart extends IEditorGroupsContainer {
    readonly onDidLayout: Event<IDimension>;
    readonly onDidScroll: Event<void>;
    readonly onWillDispose: Event<void>;
    readonly windowId: number;
    readonly contentDimension: IDimension;
    hasMaximizedGroup(): boolean;
    centerLayout(active: boolean): void;
    isLayoutCentered(): boolean;
    enforcePartOptions(options: DeepPartial<IEditorPartOptions>): IDisposable;
}
export interface IAuxiliaryEditorPart extends IEditorPart {
    close(): boolean;
}
export interface IEditorWorkingSet {
    readonly id: string;
    readonly name: string;
}
export interface IEditorWorkingSetOptions {
    readonly preserveFocus?: boolean;
}
export interface IEditorGroupContextKeyProvider<T extends ContextKeyValue> {
    readonly contextKey: RawContextKey<T>;
    readonly getGroupContextKeyValue: (group: IEditorGroup) => T;
    readonly onDidChange?: Event<void>;
}
export interface IEditorGroupsService extends IEditorGroupsContainer {
    readonly _serviceBrand: undefined;
    readonly onDidCreateAuxiliaryEditorPart: Event<IAuxiliaryEditorPart>;
    readonly mainPart: IEditorPart;
    readonly parts: ReadonlyArray<IEditorPart>;
    getPart(group: IEditorGroup | GroupIdentifier): IEditorPart;
    getPart(container: unknown): IEditorPart;
    readonly partOptions: IEditorPartOptions;
    readonly onDidChangeEditorPartOptions: Event<IEditorPartOptionsChangeEvent>;
    createAuxiliaryEditorPart(options?: {
        bounds?: Partial<IRectangle>;
    }): Promise<IAuxiliaryEditorPart>;
    getScopedInstantiationService(part: IEditorPart): IInstantiationService;
    saveWorkingSet(name: string): IEditorWorkingSet;
    getWorkingSets(): IEditorWorkingSet[];
    applyWorkingSet(workingSet: IEditorWorkingSet | 'empty', options?: IEditorWorkingSetOptions): Promise<boolean>;
    deleteWorkingSet(workingSet: IEditorWorkingSet): void;
    registerContextKeyProvider<T extends ContextKeyValue>(provider: IEditorGroupContextKeyProvider<T>): IDisposable;
}
export declare const enum OpenEditorContext {
    NEW_EDITOR = 1,
    MOVE_EDITOR = 2,
    COPY_EDITOR = 3
}
export interface IActiveEditorActions {
    readonly actions: IToolbarActions;
    readonly onDidChange: Event<IMenuChangeEvent | void>;
}
export interface IEditorGroup {
    readonly onDidModelChange: Event<IGroupModelChangeEvent>;
    readonly onWillDispose: Event<void>;
    readonly onDidActiveEditorChange: Event<IActiveEditorChangeEvent>;
    readonly onWillCloseEditor: Event<IEditorCloseEvent>;
    readonly onDidCloseEditor: Event<IEditorCloseEvent>;
    readonly onWillMoveEditor: Event<IEditorWillMoveEvent>;
    readonly id: GroupIdentifier;
    readonly windowId: number;
    readonly index: number;
    readonly label: string;
    readonly ariaLabel: string;
    readonly activeEditorPane: IVisibleEditorPane | undefined;
    readonly activeEditor: EditorInput | null;
    readonly selectedEditors: EditorInput[];
    readonly previewEditor: EditorInput | null;
    readonly count: number;
    readonly isEmpty: boolean;
    readonly isLocked: boolean;
    readonly stickyCount: number;
    readonly editors: readonly EditorInput[];
    readonly scopedContextKeyService: IContextKeyService;
    getEditors(order: EditorsOrder, options?: {
        excludeSticky?: boolean;
    }): readonly EditorInput[];
    findEditors(resource: URI, options?: IFindEditorOptions): readonly EditorInput[];
    getEditorByIndex(index: number): EditorInput | undefined;
    getIndexOfEditor(editor: EditorInput): number;
    isFirst(editor: EditorInput): boolean;
    isLast(editor: EditorInput): boolean;
    openEditor(editor: EditorInput, options?: IEditorOptions): Promise<IEditorPane | undefined>;
    openEditors(editors: EditorInputWithOptions[]): Promise<IEditorPane | undefined>;
    isPinned(editorOrIndex: EditorInput | number): boolean;
    isSticky(editorOrIndex: EditorInput | number): boolean;
    isTransient(editorOrIndex: EditorInput | number): boolean;
    isActive(editor: EditorInput | IUntypedEditorInput): boolean;
    isSelected(editor: EditorInput): boolean;
    setSelection(activeSelectedEditor: EditorInput, inactiveSelectedEditors: EditorInput[]): Promise<void>;
    contains(candidate: EditorInput | IUntypedEditorInput, options?: IMatchEditorOptions): boolean;
    moveEditor(editor: EditorInput, target: IEditorGroup, options?: IEditorOptions): boolean;
    moveEditors(editors: EditorInputWithOptions[], target: IEditorGroup): boolean;
    copyEditor(editor: EditorInput, target: IEditorGroup, options?: IEditorOptions): void;
    copyEditors(editors: EditorInputWithOptions[], target: IEditorGroup): void;
    closeEditor(editor?: EditorInput, options?: ICloseEditorOptions): Promise<boolean>;
    closeEditors(editors: EditorInput[] | ICloseEditorsFilter, options?: ICloseEditorOptions): Promise<boolean>;
    closeAllEditors(options?: ICloseAllEditorsOptions): Promise<boolean>;
    replaceEditors(editors: IEditorReplacement[]): Promise<void>;
    pinEditor(editor?: EditorInput): void;
    stickEditor(editor?: EditorInput): void;
    unstickEditor(editor?: EditorInput): void;
    lock(locked: boolean): void;
    focus(): void;
    createEditorActions(disposables: DisposableStore): IActiveEditorActions;
}
export declare function isEditorGroup(obj: unknown): obj is IEditorGroup;
export declare function preferredSideBySideGroupDirection(configurationService: IConfigurationService): GroupDirection.DOWN | GroupDirection.RIGHT;
