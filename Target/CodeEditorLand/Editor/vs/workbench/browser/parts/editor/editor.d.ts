import { GroupIdentifier, IEditorIdentifier, IEditorCloseEvent, IEditorPartOptions, IEditorPartOptionsChangeEvent, SideBySideEditor, EditorCloseContext, IEditorPane, IEditorWillOpenEvent } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IEditorGroup, GroupDirection, IMergeGroupOptions, GroupsOrder, GroupsArrangement, IAuxiliaryEditorPart, IEditorPart } from '../../../services/editor/common/editorGroupsService.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { Event } from '../../../../base/common/event.js';
import { IConfigurationChangeEvent, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ISerializableView } from '../../../../base/browser/ui/grid/grid.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IAuxiliaryWindowOpenOptions } from '../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js';
import { ContextKeyValue, IContextKey, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export interface IEditorPartCreationOptions {
    readonly restorePreviousState: boolean;
}
export declare const DEFAULT_EDITOR_MIN_DIMENSIONS: Dimension;
export declare const DEFAULT_EDITOR_MAX_DIMENSIONS: Dimension;
export declare const DEFAULT_EDITOR_PART_OPTIONS: IEditorPartOptions;
export declare function impactsEditorPartOptions(event: IConfigurationChangeEvent): boolean;
export declare function getEditorPartOptions(configurationService: IConfigurationService, themeService: IThemeService): IEditorPartOptions;
/**
 * A helper to access editor groups across all opened editor parts.
 */
export interface IEditorPartsView {
    readonly mainPart: IEditorGroupsView;
    registerPart(part: IEditorPart): IDisposable;
    readonly activeGroup: IEditorGroupView;
    readonly groups: IEditorGroupView[];
    getGroup(identifier: GroupIdentifier): IEditorGroupView | undefined;
    getGroups(order?: GroupsOrder): IEditorGroupView[];
    readonly count: number;
    createAuxiliaryEditorPart(options?: IAuxiliaryWindowOpenOptions): Promise<IAuxiliaryEditorPart>;
    bind<T extends ContextKeyValue>(contextKey: RawContextKey<T>, group: IEditorGroupView): IContextKey<T>;
}
/**
 * A helper to access and mutate editor groups within an editor part.
 */
export interface IEditorGroupsView {
    readonly windowId: number;
    readonly groups: IEditorGroupView[];
    readonly activeGroup: IEditorGroupView;
    readonly partOptions: IEditorPartOptions;
    readonly onDidChangeEditorPartOptions: Event<IEditorPartOptionsChangeEvent>;
    readonly onDidVisibilityChange: Event<boolean>;
    getGroup(identifier: GroupIdentifier): IEditorGroupView | undefined;
    getGroups(order: GroupsOrder): IEditorGroupView[];
    activateGroup(identifier: IEditorGroupView | GroupIdentifier, preserveWindowOrder?: boolean): IEditorGroupView;
    restoreGroup(identifier: IEditorGroupView | GroupIdentifier): IEditorGroupView;
    addGroup(location: IEditorGroupView | GroupIdentifier, direction: GroupDirection, groupToCopy?: IEditorGroupView): IEditorGroupView;
    mergeGroup(group: IEditorGroupView | GroupIdentifier, target: IEditorGroupView | GroupIdentifier, options?: IMergeGroupOptions): boolean;
    moveGroup(group: IEditorGroupView | GroupIdentifier, location: IEditorGroupView | GroupIdentifier, direction: GroupDirection): IEditorGroupView;
    copyGroup(group: IEditorGroupView | GroupIdentifier, location: IEditorGroupView | GroupIdentifier, direction: GroupDirection): IEditorGroupView;
    removeGroup(group: IEditorGroupView | GroupIdentifier, preserveFocus?: boolean): void;
    arrangeGroups(arrangement: GroupsArrangement, target?: IEditorGroupView | GroupIdentifier): void;
    toggleMaximizeGroup(group?: IEditorGroupView | GroupIdentifier): void;
    toggleExpandGroup(group?: IEditorGroupView | GroupIdentifier): void;
}
export interface IEditorGroupTitleHeight {
    /**
     * The overall height of the editor group title control.
     */
    readonly total: number;
    /**
     * The height offset to e.g. use when drawing drop overlays.
     * This number may be smaller than `height` if the title control
     * decides to have an `offset` that is within the title control
     * (e.g. when breadcrumbs are enabled).
     */
    readonly offset: number;
}
export interface IEditorGroupViewOptions {
    /**
     * Whether the editor group should receive keyboard focus
     * after creation or not.
     */
    readonly preserveFocus?: boolean;
}
/**
 * A helper to access and mutate an editor group within an editor part.
 */
export interface IEditorGroupView extends IDisposable, ISerializableView, IEditorGroup {
    readonly onDidFocus: Event<void>;
    readonly onWillOpenEditor: Event<IEditorWillOpenEvent>;
    readonly onDidOpenEditorFail: Event<EditorInput>;
    readonly onDidCloseEditor: Event<IEditorCloseEvent>;
    readonly groupsView: IEditorGroupsView;
    /**
     * A promise that resolves when the group has been restored.
     *
     * For a group with active editor, the promise will resolve
     * when the active editor has finished to resolve.
     */
    readonly whenRestored: Promise<void>;
    readonly titleHeight: IEditorGroupTitleHeight;
    readonly disposed: boolean;
    setActive(isActive: boolean): void;
    notifyIndexChanged(newIndex: number): void;
    notifyLabelChanged(newLabel: string): void;
    openEditor(editor: EditorInput, options?: IEditorOptions, internalOptions?: IInternalEditorOpenOptions): Promise<IEditorPane | undefined>;
    relayout(): void;
}
export declare function fillActiveEditorViewState(group: IEditorGroup, expectedActiveEditor?: EditorInput, presetOptions?: IEditorOptions): IEditorOptions;
/**
 * A sub-interface of IEditorService to hide some workbench-core specific
 * events from clients.
 */
export interface EditorServiceImpl extends IEditorService {
    /**
     * Emitted when an editor failed to open.
     */
    readonly onDidOpenEditorFail: Event<IEditorIdentifier>;
    /**
     * Emitted when the list of most recently active editors change.
     */
    readonly onDidMostRecentlyActiveEditorsChange: Event<void>;
}
export interface IInternalEditorTitleControlOptions {
    /**
     * A hint to defer updating the title control for perf reasons.
     * The caller must ensure to update the title control then.
     */
    readonly skipTitleUpdate?: boolean;
}
export interface IInternalEditorOpenOptions extends IInternalEditorTitleControlOptions {
    /**
     * Whether to consider a side by side editor as matching
     * when figuring out if the editor to open is already
     * opened or not. By default, side by side editors will
     * not be considered as matching, even if the editor is
     * opened in one of the sides.
     */
    readonly supportSideBySide?: SideBySideEditor.ANY | SideBySideEditor.BOTH;
    /**
     * When set to `true`, pass DOM focus into the tab control.
     */
    readonly focusTabControl?: boolean;
    /**
     * When set to `true`, will not attempt to move the window to
     * the top that the editor opens in.
     */
    readonly preserveWindowOrder?: boolean;
    /**
     * Inactive editors to select after opening the active selected editor.
     */
    readonly inactiveSelection?: EditorInput[];
}
export interface IInternalEditorCloseOptions extends IInternalEditorTitleControlOptions {
    /**
     * A hint that the editor is closed due to an error opening. This can be
     * used to optimize how error toasts are appearing if any.
     */
    readonly fromError?: boolean;
    /**
     * Additional context as to why an editor is closed.
     */
    readonly context?: EditorCloseContext;
}
export interface IInternalMoveCopyOptions extends IInternalEditorOpenOptions {
    /**
     * Whether to close the editor at the source or keep it.
     */
    readonly keepCopy?: boolean;
}
