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
    readonly total: number;
    readonly offset: number;
}
export interface IEditorGroupViewOptions {
    readonly preserveFocus?: boolean;
}
export interface IEditorGroupView extends IDisposable, ISerializableView, IEditorGroup {
    readonly onDidFocus: Event<void>;
    readonly onWillOpenEditor: Event<IEditorWillOpenEvent>;
    readonly onDidOpenEditorFail: Event<EditorInput>;
    readonly onDidCloseEditor: Event<IEditorCloseEvent>;
    readonly groupsView: IEditorGroupsView;
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
export interface EditorServiceImpl extends IEditorService {
    readonly onDidOpenEditorFail: Event<IEditorIdentifier>;
    readonly onDidMostRecentlyActiveEditorsChange: Event<void>;
}
export interface IInternalEditorTitleControlOptions {
    readonly skipTitleUpdate?: boolean;
}
export interface IInternalEditorOpenOptions extends IInternalEditorTitleControlOptions {
    readonly supportSideBySide?: SideBySideEditor.ANY | SideBySideEditor.BOTH;
    readonly focusTabControl?: boolean;
    readonly preserveWindowOrder?: boolean;
    readonly inactiveSelection?: EditorInput[];
}
export interface IInternalEditorCloseOptions extends IInternalEditorTitleControlOptions {
    readonly fromError?: boolean;
    readonly context?: EditorCloseContext;
}
export interface IInternalMoveCopyOptions extends IInternalEditorOpenOptions {
    readonly keepCopy?: boolean;
}
