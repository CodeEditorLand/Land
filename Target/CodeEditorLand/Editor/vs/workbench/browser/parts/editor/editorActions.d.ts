import { Action } from '../../../../base/common/actions.js';
import { IEditorIdentifier, IEditorCommandsContext } from '../../../common/editor.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IEditorGroupsService, IEditorGroup, GroupDirection, IFindGroupScope } from '../../../services/editor/common/editorGroupsService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ItemActivation } from '../../../../platform/quickinput/common/quickInput.js';
import { Action2, IAction2Options } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingRule } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { ICommandActionTitle } from '../../../../platform/action/common/action.js';
declare class ExecuteCommandAction extends Action2 {
    private readonly commandId;
    private readonly commandArgs?;
    constructor(desc: Readonly<IAction2Options>, commandId: string, commandArgs?: unknown);
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class AbstractSplitEditorAction extends Action2 {
    protected getDirection(configurationService: IConfigurationService): GroupDirection;
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare class SplitEditorAction extends AbstractSplitEditorAction {
    static readonly ID = "workbench.action.splitEditor";
    constructor();
}
export declare class SplitEditorOrthogonalAction extends AbstractSplitEditorAction {
    constructor();
    protected getDirection(configurationService: IConfigurationService): GroupDirection;
}
export declare class SplitEditorLeftAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorRightAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorUpAction extends ExecuteCommandAction {
    static readonly LABEL: string;
    constructor();
}
export declare class SplitEditorDownAction extends ExecuteCommandAction {
    static readonly LABEL: string;
    constructor();
}
export declare class JoinTwoGroupsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, context?: IEditorIdentifier): Promise<void>;
}
export declare class JoinAllGroupsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateBetweenGroupsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class FocusActiveGroupAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class AbstractFocusGroupAction extends Action2 {
    private readonly scope;
    constructor(desc: Readonly<IAction2Options>, scope: IFindGroupScope);
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class FocusFirstGroupAction extends AbstractFocusGroupAction {
    constructor();
}
export declare class FocusLastGroupAction extends AbstractFocusGroupAction {
    constructor();
}
export declare class FocusNextGroup extends AbstractFocusGroupAction {
    constructor();
}
export declare class FocusPreviousGroup extends AbstractFocusGroupAction {
    constructor();
}
export declare class FocusLeftGroup extends AbstractFocusGroupAction {
    constructor();
}
export declare class FocusRightGroup extends AbstractFocusGroupAction {
    constructor();
}
export declare class FocusAboveGroup extends AbstractFocusGroupAction {
    constructor();
}
export declare class FocusBelowGroup extends AbstractFocusGroupAction {
    constructor();
}
export declare class CloseEditorAction extends Action {
    private readonly commandService;
    static readonly ID = "workbench.action.closeActiveEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(context?: IEditorCommandsContext): Promise<void>;
}
export declare class UnpinEditorAction extends Action {
    private readonly commandService;
    static readonly ID = "workbench.action.unpinActiveEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(context?: IEditorCommandsContext): Promise<void>;
}
export declare class CloseEditorTabAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.closeActiveEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(context?: IEditorCommandsContext): Promise<void>;
}
export declare class RevertAndCloseEditorAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class CloseLeftEditorsInGroupAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, context?: IEditorIdentifier): Promise<void>;
    private getTarget;
}
declare abstract class AbstractCloseAllAction extends Action2 {
    protected groupsToClose(editorGroupService: IEditorGroupsService): IEditorGroup[];
    run(accessor: ServicesAccessor): Promise<void>;
    private revertEditors;
    private doRevertEditors;
    private revealEditorsToConfirm;
    protected abstract get excludeSticky(): boolean;
    protected doCloseAll(editorGroupService: IEditorGroupsService): Promise<void>;
}
export declare class CloseAllEditorsAction extends AbstractCloseAllAction {
    static readonly ID = "workbench.action.closeAllEditors";
    static readonly LABEL: import("../../../../nls.js").ILocalizedString;
    constructor();
    protected get excludeSticky(): boolean;
}
export declare class CloseAllEditorGroupsAction extends AbstractCloseAllAction {
    constructor();
    protected get excludeSticky(): boolean;
    protected doCloseAll(editorGroupService: IEditorGroupsService): Promise<void>;
}
export declare class CloseEditorsInOtherGroupsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, context?: IEditorIdentifier): Promise<void>;
}
export declare class CloseEditorInAllGroupsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class AbstractMoveCopyGroupAction extends Action2 {
    private readonly direction;
    private readonly isMove;
    constructor(desc: Readonly<IAction2Options>, direction: GroupDirection, isMove: boolean);
    run(accessor: ServicesAccessor, context?: IEditorIdentifier): Promise<void>;
    private findTargetGroup;
}
declare abstract class AbstractMoveGroupAction extends AbstractMoveCopyGroupAction {
    constructor(desc: Readonly<IAction2Options>, direction: GroupDirection);
}
export declare class MoveGroupLeftAction extends AbstractMoveGroupAction {
    constructor();
}
export declare class MoveGroupRightAction extends AbstractMoveGroupAction {
    constructor();
}
export declare class MoveGroupUpAction extends AbstractMoveGroupAction {
    constructor();
}
export declare class MoveGroupDownAction extends AbstractMoveGroupAction {
    constructor();
}
declare abstract class AbstractDuplicateGroupAction extends AbstractMoveCopyGroupAction {
    constructor(desc: Readonly<IAction2Options>, direction: GroupDirection);
}
export declare class DuplicateGroupLeftAction extends AbstractDuplicateGroupAction {
    constructor();
}
export declare class DuplicateGroupRightAction extends AbstractDuplicateGroupAction {
    constructor();
}
export declare class DuplicateGroupUpAction extends AbstractDuplicateGroupAction {
    constructor();
}
export declare class DuplicateGroupDownAction extends AbstractDuplicateGroupAction {
    constructor();
}
export declare class MinimizeOtherGroupsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class MinimizeOtherGroupsHideSidebarAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ResetGroupSizesAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleGroupSizesAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class MaximizeGroupHideSidebarAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleMaximizeEditorGroupAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
declare abstract class AbstractNavigateEditorAction extends Action2 {
    run(accessor: ServicesAccessor): Promise<void>;
    protected abstract navigate(editorGroupService: IEditorGroupsService): IEditorIdentifier | undefined;
}
export declare class OpenNextEditor extends AbstractNavigateEditorAction {
    constructor();
    protected navigate(editorGroupService: IEditorGroupsService): IEditorIdentifier | undefined;
}
export declare class OpenPreviousEditor extends AbstractNavigateEditorAction {
    constructor();
    protected navigate(editorGroupService: IEditorGroupsService): IEditorIdentifier | undefined;
}
export declare class OpenNextEditorInGroup extends AbstractNavigateEditorAction {
    constructor();
    protected navigate(editorGroupService: IEditorGroupsService): IEditorIdentifier;
}
export declare class OpenPreviousEditorInGroup extends AbstractNavigateEditorAction {
    constructor();
    protected navigate(editorGroupService: IEditorGroupsService): IEditorIdentifier;
}
export declare class OpenFirstEditorInGroup extends AbstractNavigateEditorAction {
    constructor();
    protected navigate(editorGroupService: IEditorGroupsService): IEditorIdentifier;
}
export declare class OpenLastEditorInGroup extends AbstractNavigateEditorAction {
    constructor();
    protected navigate(editorGroupService: IEditorGroupsService): IEditorIdentifier;
}
export declare class NavigateForwardAction extends Action2 {
    static readonly ID = "workbench.action.navigateForward";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateBackwardsAction extends Action2 {
    static readonly ID = "workbench.action.navigateBack";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigatePreviousAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateForwardInEditsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateBackwardsInEditsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigatePreviousInEditsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateToLastEditLocationAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateForwardInNavigationsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateBackwardsInNavigationsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigatePreviousInNavigationsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateToLastNavigationLocationAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ReopenClosedEditorAction extends Action2 {
    static readonly ID = "workbench.action.reopenClosedEditor";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ClearRecentFilesAction extends Action2 {
    static readonly ID = "workbench.action.clearRecentFiles";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowEditorsInActiveGroupByMostRecentlyUsedAction extends Action2 {
    static readonly ID = "workbench.action.showEditorsInActiveGroup";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowAllEditorsByAppearanceAction extends Action2 {
    static readonly ID = "workbench.action.showAllEditors";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowAllEditorsByMostRecentlyUsedAction extends Action2 {
    static readonly ID = "workbench.action.showAllEditorsByMostRecentlyUsed";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class AbstractQuickAccessEditorAction extends Action2 {
    private readonly prefix;
    private readonly itemActivation;
    constructor(desc: Readonly<IAction2Options>, prefix: string, itemActivation: ItemActivation | undefined);
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class QuickAccessPreviousRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
    constructor();
}
export declare class QuickAccessLeastRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
    constructor();
}
export declare class QuickAccessPreviousRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
    constructor();
}
export declare class QuickAccessLeastRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
    constructor();
}
export declare class QuickAccessPreviousEditorFromHistoryAction extends Action2 {
    private static readonly ID;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenNextRecentlyUsedEditorAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenPreviousRecentlyUsedEditorAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenNextRecentlyUsedEditorInGroupAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenPreviousRecentlyUsedEditorInGroupAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ClearEditorHistoryAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class MoveEditorLeftInGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorRightInGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorToPreviousGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorToNextGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorToAboveGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorToBelowGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorToLeftGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorToRightGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorToFirstGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class MoveEditorToLastGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorToPreviousGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorToNextGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorToAboveGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorToBelowGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorToLeftGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToLeftGroup";
    static readonly LABEL: string;
    constructor();
}
export declare class SplitEditorToRightGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorToFirstGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class SplitEditorToLastGroupAction extends ExecuteCommandAction {
    constructor();
}
export declare class EditorLayoutSingleAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutSingle";
    constructor();
}
export declare class EditorLayoutTwoColumnsAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoColumns";
    constructor();
}
export declare class EditorLayoutThreeColumnsAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutThreeColumns";
    constructor();
}
export declare class EditorLayoutTwoRowsAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoRows";
    constructor();
}
export declare class EditorLayoutThreeRowsAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutThreeRows";
    constructor();
}
export declare class EditorLayoutTwoByTwoGridAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoByTwoGrid";
    constructor();
}
export declare class EditorLayoutTwoColumnsBottomAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoColumnsBottom";
    constructor();
}
export declare class EditorLayoutTwoRowsRightAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoRowsRight";
    constructor();
}
declare abstract class AbstractCreateEditorGroupAction extends Action2 {
    private readonly direction;
    constructor(desc: Readonly<IAction2Options>, direction: GroupDirection);
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NewEditorGroupLeftAction extends AbstractCreateEditorGroupAction {
    constructor();
}
export declare class NewEditorGroupRightAction extends AbstractCreateEditorGroupAction {
    constructor();
}
export declare class NewEditorGroupAboveAction extends AbstractCreateEditorGroupAction {
    constructor();
}
export declare class NewEditorGroupBelowAction extends AbstractCreateEditorGroupAction {
    constructor();
}
export declare class ToggleEditorTypeAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ReOpenInTextEditorAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class BaseMoveCopyEditorToNewWindowAction extends Action2 {
    private readonly move;
    constructor(id: string, title: ICommandActionTitle, keybinding: Omit<IKeybindingRule, 'id'> | undefined, move: boolean);
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare class MoveEditorToNewWindowAction extends BaseMoveCopyEditorToNewWindowAction {
    constructor();
}
export declare class CopyEditorToNewindowAction extends BaseMoveCopyEditorToNewWindowAction {
    constructor();
}
declare abstract class BaseMoveCopyEditorGroupToNewWindowAction extends Action2 {
    private readonly move;
    constructor(id: string, title: ICommandActionTitle, move: boolean);
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class MoveEditorGroupToNewWindowAction extends BaseMoveCopyEditorGroupToNewWindowAction {
    constructor();
}
export declare class CopyEditorGroupToNewWindowAction extends BaseMoveCopyEditorGroupToNewWindowAction {
    constructor();
}
export declare class RestoreEditorsToMainWindowAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NewEmptyEditorWindowAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export {};
