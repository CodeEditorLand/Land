var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { localize, localize2 } from '../../../../nls.js';
import { Action } from '../../../../base/common/actions.js';
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor } from '../../../common/editor.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { CLOSE_EDITOR_COMMAND_ID, MOVE_ACTIVE_EDITOR_COMMAND_ID, SPLIT_EDITOR_LEFT, SPLIT_EDITOR_RIGHT, SPLIT_EDITOR_UP, SPLIT_EDITOR_DOWN, splitEditor, LAYOUT_EDITOR_GROUPS_COMMAND_ID, UNPIN_EDITOR_COMMAND_ID, COPY_ACTIVE_EDITOR_COMMAND_ID, SPLIT_EDITOR, TOGGLE_MAXIMIZE_EDITOR_GROUP, MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID as NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID } from './editorCommands.js';
import { IEditorGroupsService, preferredSideBySideGroupDirection } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.js';
import { IFileDialogService, IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ItemActivation, IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { AllEditorsByMostRecentlyUsedQuickAccess, ActiveGroupEditorsByMostRecentlyUsedQuickAccess, AllEditorsByAppearanceQuickAccess } from './editorQuickAccess.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { isLinux, isNative, isWindows } from '../../../../base/common/platform.js';
import { Action2, MenuId } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { KeyChord } from '../../../../base/common/keyCodes.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ActiveEditorAvailableEditorIdsContext, ActiveEditorContext, ActiveEditorGroupEmptyContext, AuxiliaryBarVisibleContext, EditorPartMaximizedEditorGroupContext, EditorPartMultipleEditorGroupsContext, IsAuxiliaryWindowFocusedContext, MultipleEditorGroupsContext, SideBarVisibleContext } from '../../../common/contextkeys.js';
import { getActiveDocument } from '../../../../base/browser/dom.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { resolveCommandsContext } from './editorCommandsContext.js';
import { IListService } from '../../../../platform/list/browser/listService.js';
class ExecuteCommandAction extends Action2 {
    constructor(desc, commandId, commandArgs) {
        super(desc);
        this.commandId = commandId;
        this.commandArgs = commandArgs;
    }
    run(accessor) {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(this.commandId, this.commandArgs);
    }
}
class AbstractSplitEditorAction extends Action2 {
    getDirection(configurationService) {
        return preferredSideBySideGroupDirection(configurationService);
    }
    async run(accessor, ...args) {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        const direction = this.getDirection(configurationService);
        const commandContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
        splitEditor(editorGroupsService, direction, commandContext);
    }
}
export class SplitEditorAction extends AbstractSplitEditorAction {
    static { this.ID = SPLIT_EDITOR; }
    constructor() {
        super({
            id: SplitEditorAction.ID,
            title: localize2('splitEditor', 'Split Editor'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 93
            },
            category: Categories.View
        });
    }
}
export class SplitEditorOrthogonalAction extends AbstractSplitEditorAction {
    constructor() {
        super({
            id: 'workbench.action.splitEditorOrthogonal',
            title: localize2('splitEditorOrthogonal', 'Split Editor Orthogonal'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 93)
            },
            category: Categories.View
        });
    }
    getDirection(configurationService) {
        const direction = preferredSideBySideGroupDirection(configurationService);
        return direction === 3 ? 1 : 3;
    }
}
export class SplitEditorLeftAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: SPLIT_EDITOR_LEFT,
            title: localize2('splitEditorGroupLeft', 'Split Editor Left'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 93)
            },
            category: Categories.View
        }, SPLIT_EDITOR_LEFT);
    }
}
export class SplitEditorRightAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: SPLIT_EDITOR_RIGHT,
            title: localize2('splitEditorGroupRight', 'Split Editor Right'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 93)
            },
            category: Categories.View
        }, SPLIT_EDITOR_RIGHT);
    }
}
export class SplitEditorUpAction extends ExecuteCommandAction {
    static { this.LABEL = localize('splitEditorGroupUp', "Split Editor Up"); }
    constructor() {
        super({
            id: SPLIT_EDITOR_UP,
            title: localize2('splitEditorGroupUp', "Split Editor Up"),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 93)
            },
            category: Categories.View
        }, SPLIT_EDITOR_UP);
    }
}
export class SplitEditorDownAction extends ExecuteCommandAction {
    static { this.LABEL = localize('splitEditorGroupDown', "Split Editor Down"); }
    constructor() {
        super({
            id: SPLIT_EDITOR_DOWN,
            title: localize2('splitEditorGroupDown', "Split Editor Down"),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 93)
            },
            category: Categories.View
        }, SPLIT_EDITOR_DOWN);
    }
}
export class JoinTwoGroupsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.joinTwoGroups',
            title: localize2('joinTwoGroups', 'Join Editor Group with Next Group'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor, context) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        let sourceGroup;
        if (context && typeof context.groupId === 'number') {
            sourceGroup = editorGroupService.getGroup(context.groupId);
        }
        else {
            sourceGroup = editorGroupService.activeGroup;
        }
        if (sourceGroup) {
            const targetGroupDirections = [3, 1, 2, 0];
            for (const targetGroupDirection of targetGroupDirections) {
                const targetGroup = editorGroupService.findGroup({ direction: targetGroupDirection }, sourceGroup);
                if (targetGroup && sourceGroup !== targetGroup) {
                    editorGroupService.mergeGroup(sourceGroup, targetGroup);
                    break;
                }
            }
        }
    }
}
export class JoinAllGroupsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.joinAllGroups',
            title: localize2('joinAllGroups', 'Join All Editor Groups'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        editorGroupService.mergeAllGroups(editorGroupService.activeGroup);
    }
}
export class NavigateBetweenGroupsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigateEditorGroups',
            title: localize2('navigateEditorGroups', 'Navigate Between Editor Groups'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const nextGroup = editorGroupService.findGroup({ location: 2 }, editorGroupService.activeGroup, true);
        nextGroup?.focus();
    }
}
export class FocusActiveGroupAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.focusActiveEditorGroup',
            title: localize2('focusActiveEditorGroup', 'Focus Active Editor Group'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        editorGroupService.activeGroup.focus();
    }
}
class AbstractFocusGroupAction extends Action2 {
    constructor(desc, scope) {
        super(desc);
        this.scope = scope;
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const group = editorGroupService.findGroup(this.scope, editorGroupService.activeGroup, true);
        group?.focus();
    }
}
export class FocusFirstGroupAction extends AbstractFocusGroupAction {
    constructor() {
        super({
            id: 'workbench.action.focusFirstEditorGroup',
            title: localize2('focusFirstEditorGroup', 'Focus First Editor Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 22
            },
            category: Categories.View
        }, { location: 0 });
    }
}
export class FocusLastGroupAction extends AbstractFocusGroupAction {
    constructor() {
        super({
            id: 'workbench.action.focusLastEditorGroup',
            title: localize2('focusLastEditorGroup', 'Focus Last Editor Group'),
            f1: true,
            category: Categories.View
        }, { location: 1 });
    }
}
export class FocusNextGroup extends AbstractFocusGroupAction {
    constructor() {
        super({
            id: 'workbench.action.focusNextGroup',
            title: localize2('focusNextGroup', 'Focus Next Editor Group'),
            f1: true,
            category: Categories.View
        }, { location: 2 });
    }
}
export class FocusPreviousGroup extends AbstractFocusGroupAction {
    constructor() {
        super({
            id: 'workbench.action.focusPreviousGroup',
            title: localize2('focusPreviousGroup', 'Focus Previous Editor Group'),
            f1: true,
            category: Categories.View
        }, { location: 3 });
    }
}
export class FocusLeftGroup extends AbstractFocusGroupAction {
    constructor() {
        super({
            id: 'workbench.action.focusLeftGroup',
            title: localize2('focusLeftGroup', 'Focus Left Editor Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 15)
            },
            category: Categories.View
        }, { direction: 2 });
    }
}
export class FocusRightGroup extends AbstractFocusGroupAction {
    constructor() {
        super({
            id: 'workbench.action.focusRightGroup',
            title: localize2('focusRightGroup', 'Focus Right Editor Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 17)
            },
            category: Categories.View
        }, { direction: 3 });
    }
}
export class FocusAboveGroup extends AbstractFocusGroupAction {
    constructor() {
        super({
            id: 'workbench.action.focusAboveGroup',
            title: localize2('focusAboveGroup', 'Focus Editor Group Above'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 16)
            },
            category: Categories.View
        }, { direction: 0 });
    }
}
export class FocusBelowGroup extends AbstractFocusGroupAction {
    constructor() {
        super({
            id: 'workbench.action.focusBelowGroup',
            title: localize2('focusBelowGroup', 'Focus Editor Group Below'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 18)
            },
            category: Categories.View
        }, { direction: 1 });
    }
}
let CloseEditorAction = class CloseEditorAction extends Action {
    static { this.ID = 'workbench.action.closeActiveEditor'; }
    static { this.LABEL = localize('closeEditor', "Close Editor"); }
    constructor(id, label, commandService) {
        super(id, label, ThemeIcon.asClassName(Codicon.close));
        this.commandService = commandService;
    }
    run(context) {
        return this.commandService.executeCommand(CLOSE_EDITOR_COMMAND_ID, undefined, context);
    }
};
CloseEditorAction = __decorate([
    __param(2, ICommandService),
    __metadata("design:paramtypes", [String, String, Object])
], CloseEditorAction);
export { CloseEditorAction };
let UnpinEditorAction = class UnpinEditorAction extends Action {
    static { this.ID = 'workbench.action.unpinActiveEditor'; }
    static { this.LABEL = localize('unpinEditor', "Unpin Editor"); }
    constructor(id, label, commandService) {
        super(id, label, ThemeIcon.asClassName(Codicon.pinned));
        this.commandService = commandService;
    }
    run(context) {
        return this.commandService.executeCommand(UNPIN_EDITOR_COMMAND_ID, undefined, context);
    }
};
UnpinEditorAction = __decorate([
    __param(2, ICommandService),
    __metadata("design:paramtypes", [String, String, Object])
], UnpinEditorAction);
export { UnpinEditorAction };
let CloseEditorTabAction = class CloseEditorTabAction extends Action {
    static { this.ID = 'workbench.action.closeActiveEditor'; }
    static { this.LABEL = localize('closeOneEditor', "Close"); }
    constructor(id, label, editorGroupService) {
        super(id, label, ThemeIcon.asClassName(Codicon.close));
        this.editorGroupService = editorGroupService;
    }
    async run(context) {
        const group = context ? this.editorGroupService.getGroup(context.groupId) : this.editorGroupService.activeGroup;
        if (!group) {
            return;
        }
        const targetEditor = context?.editorIndex !== undefined ? group.getEditorByIndex(context.editorIndex) : group.activeEditor;
        if (!targetEditor) {
            return;
        }
        const editors = [];
        if (group.isSelected(targetEditor)) {
            editors.push(...group.selectedEditors);
        }
        else {
            editors.push(targetEditor);
        }
        for (const editor of editors) {
            await group.closeEditor(editor, { preserveFocus: context?.preserveFocus });
        }
    }
};
CloseEditorTabAction = __decorate([
    __param(2, IEditorGroupsService),
    __metadata("design:paramtypes", [String, String, Object])
], CloseEditorTabAction);
export { CloseEditorTabAction };
export class RevertAndCloseEditorAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.revertAndCloseActiveEditor',
            title: localize2('revertAndCloseActiveEditor', 'Revert and Close Editor'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const logService = accessor.get(ILogService);
        const activeEditorPane = editorService.activeEditorPane;
        if (activeEditorPane) {
            const editor = activeEditorPane.input;
            const group = activeEditorPane.group;
            try {
                await editorService.revert({ editor, groupId: group.id });
            }
            catch (error) {
                logService.error(error);
                await editorService.revert({ editor, groupId: group.id }, { soft: true });
            }
            await group.closeEditor(editor);
        }
    }
}
export class CloseLeftEditorsInGroupAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.closeEditorsToTheLeft',
            title: localize2('closeEditorsToTheLeft', 'Close Editors to the Left in Group'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor, context) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const { group, editor } = this.getTarget(editorGroupService, context);
        if (group && editor) {
            await group.closeEditors({ direction: 0, except: editor, excludeSticky: true });
        }
    }
    getTarget(editorGroupService, context) {
        if (context) {
            return { editor: context.editor, group: editorGroupService.getGroup(context.groupId) };
        }
        return { group: editorGroupService.activeGroup, editor: editorGroupService.activeGroup.activeEditor };
    }
}
class AbstractCloseAllAction extends Action2 {
    groupsToClose(editorGroupService) {
        const groupsToClose = [];
        const groups = editorGroupService.getGroups(2);
        for (let i = groups.length - 1; i >= 0; i--) {
            groupsToClose.push(groups[i]);
        }
        return groupsToClose;
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const logService = accessor.get(ILogService);
        const progressService = accessor.get(IProgressService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const filesConfigurationService = accessor.get(IFilesConfigurationService);
        const fileDialogService = accessor.get(IFileDialogService);
        const dirtyEditorsWithDefaultConfirm = new Set();
        const dirtyAutoSaveOnFocusChangeEditors = new Set();
        const dirtyAutoSaveOnWindowChangeEditors = new Set();
        const editorsWithCustomConfirm = new Map();
        for (const { editor, groupId } of editorService.getEditors(1, { excludeSticky: this.excludeSticky })) {
            let confirmClose = false;
            if (editor.closeHandler) {
                confirmClose = editor.closeHandler.showConfirm();
            }
            else {
                confirmClose = editor.isDirty() && !editor.isSaving();
            }
            if (!confirmClose) {
                continue;
            }
            if (typeof editor.closeHandler?.confirm === 'function') {
                let customEditorsToConfirm = editorsWithCustomConfirm.get(editor.typeId);
                if (!customEditorsToConfirm) {
                    customEditorsToConfirm = new Set();
                    editorsWithCustomConfirm.set(editor.typeId, customEditorsToConfirm);
                }
                customEditorsToConfirm.add({ editor, groupId });
            }
            else if (!editor.hasCapability(4) && filesConfigurationService.getAutoSaveMode(editor).mode === 3) {
                dirtyAutoSaveOnFocusChangeEditors.add({ editor, groupId });
            }
            else if ((isNative && (isWindows || isLinux)) && !editor.hasCapability(4) && filesConfigurationService.getAutoSaveMode(editor).mode === 4) {
                dirtyAutoSaveOnWindowChangeEditors.add({ editor, groupId });
            }
            else {
                dirtyEditorsWithDefaultConfirm.add({ editor, groupId });
            }
        }
        if (dirtyEditorsWithDefaultConfirm.size > 0) {
            const editors = Array.from(dirtyEditorsWithDefaultConfirm.values());
            await this.revealEditorsToConfirm(editors, editorGroupService);
            const confirmation = await fileDialogService.showSaveConfirm(editors.map(({ editor }) => {
                if (editor instanceof SideBySideEditorInput) {
                    return editor.primary.getName();
                }
                return editor.getName();
            }));
            switch (confirmation) {
                case 2:
                    return;
                case 1:
                    await this.revertEditors(editorService, logService, progressService, editors);
                    break;
                case 0:
                    await editorService.save(editors, { reason: 1 });
                    break;
            }
        }
        for (const [, editorIdentifiers] of editorsWithCustomConfirm) {
            const editors = Array.from(editorIdentifiers.values());
            await this.revealEditorsToConfirm(editors, editorGroupService);
            const confirmation = await editors.at(0)?.editor.closeHandler?.confirm?.(editors);
            if (typeof confirmation === 'number') {
                switch (confirmation) {
                    case 2:
                        return;
                    case 1:
                        await this.revertEditors(editorService, logService, progressService, editors);
                        break;
                    case 0:
                        await editorService.save(editors, { reason: 1 });
                        break;
                }
            }
        }
        if (dirtyAutoSaveOnFocusChangeEditors.size > 0) {
            const editors = Array.from(dirtyAutoSaveOnFocusChangeEditors.values());
            await editorService.save(editors, { reason: 3 });
        }
        if (dirtyAutoSaveOnWindowChangeEditors.size > 0) {
            const editors = Array.from(dirtyAutoSaveOnWindowChangeEditors.values());
            await editorService.save(editors, { reason: 4 });
        }
        return this.doCloseAll(editorGroupService);
    }
    revertEditors(editorService, logService, progressService, editors) {
        return progressService.withProgress({
            location: 10,
            delay: 800,
            title: localize('reverting', "Reverting Editors..."),
        }, () => this.doRevertEditors(editorService, logService, editors));
    }
    async doRevertEditors(editorService, logService, editors) {
        try {
            await editorService.revert(editors);
        }
        catch (error) {
            logService.error(error);
            await editorService.revert(editors, { soft: true });
        }
    }
    async revealEditorsToConfirm(editors, editorGroupService) {
        try {
            const handledGroups = new Set();
            for (const { editor, groupId } of editors) {
                if (handledGroups.has(groupId)) {
                    continue;
                }
                handledGroups.add(groupId);
                const group = editorGroupService.getGroup(groupId);
                await group?.openEditor(editor);
            }
        }
        catch (error) {
        }
    }
    async doCloseAll(editorGroupService) {
        await Promise.all(this.groupsToClose(editorGroupService).map(group => group.closeAllEditors({ excludeSticky: this.excludeSticky })));
    }
}
export class CloseAllEditorsAction extends AbstractCloseAllAction {
    static { this.ID = 'workbench.action.closeAllEditors'; }
    static { this.LABEL = localize2('closeAllEditors', 'Close All Editors'); }
    constructor() {
        super({
            id: CloseAllEditorsAction.ID,
            title: CloseAllEditorsAction.LABEL,
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 53)
            },
            icon: Codicon.closeAll,
            category: Categories.View
        });
    }
    get excludeSticky() {
        return true;
    }
}
export class CloseAllEditorGroupsAction extends AbstractCloseAllAction {
    constructor() {
        super({
            id: 'workbench.action.closeAllGroups',
            title: localize2('closeAllGroups', 'Close All Editor Groups'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 1024 | 53)
            },
            category: Categories.View
        });
    }
    get excludeSticky() {
        return false;
    }
    async doCloseAll(editorGroupService) {
        await super.doCloseAll(editorGroupService);
        for (const groupToClose of this.groupsToClose(editorGroupService)) {
            editorGroupService.removeGroup(groupToClose);
        }
    }
}
export class CloseEditorsInOtherGroupsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.closeEditorsInOtherGroups',
            title: localize2('closeEditorsInOtherGroups', 'Close Editors in Other Groups'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor, context) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const groupToSkip = context ? editorGroupService.getGroup(context.groupId) : editorGroupService.activeGroup;
        await Promise.all(editorGroupService.getGroups(1).map(async (group) => {
            if (groupToSkip && group.id === groupToSkip.id) {
                return;
            }
            return group.closeAllEditors({ excludeSticky: true });
        }));
    }
}
export class CloseEditorInAllGroupsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.closeEditorInAllGroups',
            title: localize2('closeEditorInAllGroups', 'Close Editor in All Groups'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const activeEditor = editorService.activeEditor;
        if (activeEditor) {
            await Promise.all(editorGroupService.getGroups(1).map(group => group.closeEditor(activeEditor)));
        }
    }
}
class AbstractMoveCopyGroupAction extends Action2 {
    constructor(desc, direction, isMove) {
        super(desc);
        this.direction = direction;
        this.isMove = isMove;
    }
    async run(accessor, context) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        let sourceGroup;
        if (context && typeof context.groupId === 'number') {
            sourceGroup = editorGroupService.getGroup(context.groupId);
        }
        else {
            sourceGroup = editorGroupService.activeGroup;
        }
        if (sourceGroup) {
            let resultGroup = undefined;
            if (this.isMove) {
                const targetGroup = this.findTargetGroup(editorGroupService, sourceGroup);
                if (targetGroup) {
                    resultGroup = editorGroupService.moveGroup(sourceGroup, targetGroup, this.direction);
                }
            }
            else {
                resultGroup = editorGroupService.copyGroup(sourceGroup, sourceGroup, this.direction);
            }
            if (resultGroup) {
                editorGroupService.activateGroup(resultGroup);
            }
        }
    }
    findTargetGroup(editorGroupService, sourceGroup) {
        const targetNeighbours = [this.direction];
        switch (this.direction) {
            case 2:
            case 3:
                targetNeighbours.push(0, 1);
                break;
            case 0:
            case 1:
                targetNeighbours.push(2, 3);
                break;
        }
        for (const targetNeighbour of targetNeighbours) {
            const targetNeighbourGroup = editorGroupService.findGroup({ direction: targetNeighbour }, sourceGroup);
            if (targetNeighbourGroup) {
                return targetNeighbourGroup;
            }
        }
        return undefined;
    }
}
class AbstractMoveGroupAction extends AbstractMoveCopyGroupAction {
    constructor(desc, direction) {
        super(desc, direction, true);
    }
}
export class MoveGroupLeftAction extends AbstractMoveGroupAction {
    constructor() {
        super({
            id: 'workbench.action.moveActiveEditorGroupLeft',
            title: localize2('moveActiveGroupLeft', 'Move Editor Group Left'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 15)
            },
            category: Categories.View
        }, 2);
    }
}
export class MoveGroupRightAction extends AbstractMoveGroupAction {
    constructor() {
        super({
            id: 'workbench.action.moveActiveEditorGroupRight',
            title: localize2('moveActiveGroupRight', 'Move Editor Group Right'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 17)
            },
            category: Categories.View
        }, 3);
    }
}
export class MoveGroupUpAction extends AbstractMoveGroupAction {
    constructor() {
        super({
            id: 'workbench.action.moveActiveEditorGroupUp',
            title: localize2('moveActiveGroupUp', 'Move Editor Group Up'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 16)
            },
            category: Categories.View
        }, 0);
    }
}
export class MoveGroupDownAction extends AbstractMoveGroupAction {
    constructor() {
        super({
            id: 'workbench.action.moveActiveEditorGroupDown',
            title: localize2('moveActiveGroupDown', 'Move Editor Group Down'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 18)
            },
            category: Categories.View
        }, 1);
    }
}
class AbstractDuplicateGroupAction extends AbstractMoveCopyGroupAction {
    constructor(desc, direction) {
        super(desc, direction, false);
    }
}
export class DuplicateGroupLeftAction extends AbstractDuplicateGroupAction {
    constructor() {
        super({
            id: 'workbench.action.duplicateActiveEditorGroupLeft',
            title: localize2('duplicateActiveGroupLeft', 'Duplicate Editor Group Left'),
            f1: true,
            category: Categories.View
        }, 2);
    }
}
export class DuplicateGroupRightAction extends AbstractDuplicateGroupAction {
    constructor() {
        super({
            id: 'workbench.action.duplicateActiveEditorGroupRight',
            title: localize2('duplicateActiveGroupRight', 'Duplicate Editor Group Right'),
            f1: true,
            category: Categories.View
        }, 3);
    }
}
export class DuplicateGroupUpAction extends AbstractDuplicateGroupAction {
    constructor() {
        super({
            id: 'workbench.action.duplicateActiveEditorGroupUp',
            title: localize2('duplicateActiveGroupUp', 'Duplicate Editor Group Up'),
            f1: true,
            category: Categories.View
        }, 0);
    }
}
export class DuplicateGroupDownAction extends AbstractDuplicateGroupAction {
    constructor() {
        super({
            id: 'workbench.action.duplicateActiveEditorGroupDown',
            title: localize2('duplicateActiveGroupDown', 'Duplicate Editor Group Down'),
            f1: true,
            category: Categories.View
        }, 1);
    }
}
export class MinimizeOtherGroupsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.minimizeOtherEditors',
            title: localize2('minimizeOtherEditorGroups', 'Expand Editor Group'),
            f1: true,
            category: Categories.View,
            precondition: MultipleEditorGroupsContext
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        editorGroupService.arrangeGroups(1);
    }
}
export class MinimizeOtherGroupsHideSidebarAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.minimizeOtherEditorsHideSidebar',
            title: localize2('minimizeOtherEditorGroupsHideSidebar', 'Expand Editor Group and Hide Side Bars'),
            f1: true,
            category: Categories.View,
            precondition: ContextKeyExpr.or(MultipleEditorGroupsContext, SideBarVisibleContext, AuxiliaryBarVisibleContext)
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        layoutService.setPartHidden(true, "workbench.parts.sidebar");
        layoutService.setPartHidden(true, "workbench.parts.auxiliarybar");
        editorGroupService.arrangeGroups(1);
    }
}
export class ResetGroupSizesAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.evenEditorWidths',
            title: localize2('evenEditorGroups', 'Reset Editor Group Sizes'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        editorGroupService.arrangeGroups(2);
    }
}
export class ToggleGroupSizesAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleEditorWidths',
            title: localize2('toggleEditorWidths', 'Toggle Editor Group Sizes'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        editorGroupService.toggleExpandGroup();
    }
}
export class MaximizeGroupHideSidebarAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.maximizeEditorHideSidebar',
            title: localize2('maximizeEditorHideSidebar', 'Maximize Editor Group and Hide Side Bars'),
            f1: true,
            category: Categories.View,
            precondition: ContextKeyExpr.or(ContextKeyExpr.and(EditorPartMaximizedEditorGroupContext.negate(), EditorPartMultipleEditorGroupsContext), SideBarVisibleContext, AuxiliaryBarVisibleContext)
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const editorService = accessor.get(IEditorService);
        if (editorService.activeEditor) {
            layoutService.setPartHidden(true, "workbench.parts.sidebar");
            layoutService.setPartHidden(true, "workbench.parts.auxiliarybar");
            editorGroupService.arrangeGroups(0);
        }
    }
}
export class ToggleMaximizeEditorGroupAction extends Action2 {
    constructor() {
        super({
            id: TOGGLE_MAXIMIZE_EDITOR_GROUP,
            title: localize2('toggleMaximizeEditorGroup', 'Toggle Maximize Editor Group'),
            f1: true,
            category: Categories.View,
            precondition: ContextKeyExpr.or(EditorPartMultipleEditorGroupsContext, EditorPartMaximizedEditorGroupContext),
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 43),
            },
            menu: [{
                    id: MenuId.EditorTitle,
                    order: -10000,
                    group: 'navigation',
                    when: EditorPartMaximizedEditorGroupContext
                },
                {
                    id: MenuId.EmptyEditorGroup,
                    order: -10000,
                    group: 'navigation',
                    when: EditorPartMaximizedEditorGroupContext
                }],
            icon: Codicon.screenFull,
            toggled: EditorPartMaximizedEditorGroupContext,
        });
    }
    async run(accessor, ...args) {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
        if (resolvedContext.groupedEditors.length) {
            editorGroupsService.toggleMaximizeGroup(resolvedContext.groupedEditors[0].group);
        }
    }
}
class AbstractNavigateEditorAction extends Action2 {
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const result = this.navigate(editorGroupService);
        if (!result) {
            return;
        }
        const { groupId, editor } = result;
        if (!editor) {
            return;
        }
        const group = editorGroupService.getGroup(groupId);
        if (group) {
            await group.openEditor(editor);
        }
    }
}
export class OpenNextEditor extends AbstractNavigateEditorAction {
    constructor() {
        super({
            id: 'workbench.action.nextEditor',
            title: localize2('openNextEditor', 'Open Next Editor'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 12,
                mac: {
                    primary: 2048 | 512 | 17,
                    secondary: [2048 | 1024 | 94]
                }
            },
            category: Categories.View
        });
    }
    navigate(editorGroupService) {
        const activeGroup = editorGroupService.activeGroup;
        const activeGroupEditors = activeGroup.getEditors(1);
        const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
        if (activeEditorIndex + 1 < activeGroupEditors.length) {
            return { editor: activeGroupEditors[activeEditorIndex + 1], groupId: activeGroup.id };
        }
        const handledGroups = new Set();
        let currentGroup = editorGroupService.activeGroup;
        while (currentGroup && !handledGroups.has(currentGroup.id)) {
            currentGroup = editorGroupService.findGroup({ location: 2 }, currentGroup, true);
            if (currentGroup) {
                handledGroups.add(currentGroup.id);
                const groupEditors = currentGroup.getEditors(1);
                if (groupEditors.length > 0) {
                    return { editor: groupEditors[0], groupId: currentGroup.id };
                }
            }
        }
        return undefined;
    }
}
export class OpenPreviousEditor extends AbstractNavigateEditorAction {
    constructor() {
        super({
            id: 'workbench.action.previousEditor',
            title: localize2('openPreviousEditor', 'Open Previous Editor'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 11,
                mac: {
                    primary: 2048 | 512 | 15,
                    secondary: [2048 | 1024 | 92]
                }
            },
            category: Categories.View
        });
    }
    navigate(editorGroupService) {
        const activeGroup = editorGroupService.activeGroup;
        const activeGroupEditors = activeGroup.getEditors(1);
        const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
        if (activeEditorIndex > 0) {
            return { editor: activeGroupEditors[activeEditorIndex - 1], groupId: activeGroup.id };
        }
        const handledGroups = new Set();
        let currentGroup = editorGroupService.activeGroup;
        while (currentGroup && !handledGroups.has(currentGroup.id)) {
            currentGroup = editorGroupService.findGroup({ location: 3 }, currentGroup, true);
            if (currentGroup) {
                handledGroups.add(currentGroup.id);
                const groupEditors = currentGroup.getEditors(1);
                if (groupEditors.length > 0) {
                    return { editor: groupEditors[groupEditors.length - 1], groupId: currentGroup.id };
                }
            }
        }
        return undefined;
    }
}
export class OpenNextEditorInGroup extends AbstractNavigateEditorAction {
    constructor() {
        super({
            id: 'workbench.action.nextEditorInGroup',
            title: localize2('nextEditorInGroup', 'Open Next Editor in Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 12),
                mac: {
                    primary: KeyChord(2048 | 41, 2048 | 512 | 17)
                }
            },
            category: Categories.View
        });
    }
    navigate(editorGroupService) {
        const group = editorGroupService.activeGroup;
        const editors = group.getEditors(1);
        const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
        return { editor: index + 1 < editors.length ? editors[index + 1] : editors[0], groupId: group.id };
    }
}
export class OpenPreviousEditorInGroup extends AbstractNavigateEditorAction {
    constructor() {
        super({
            id: 'workbench.action.previousEditorInGroup',
            title: localize2('openPreviousEditorInGroup', 'Open Previous Editor in Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 11),
                mac: {
                    primary: KeyChord(2048 | 41, 2048 | 512 | 15)
                }
            },
            category: Categories.View
        });
    }
    navigate(editorGroupService) {
        const group = editorGroupService.activeGroup;
        const editors = group.getEditors(1);
        const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
        return { editor: index > 0 ? editors[index - 1] : editors[editors.length - 1], groupId: group.id };
    }
}
export class OpenFirstEditorInGroup extends AbstractNavigateEditorAction {
    constructor() {
        super({
            id: 'workbench.action.firstEditorInGroup',
            title: localize2('firstEditorInGroup', 'Open First Editor in Group'),
            f1: true,
            category: Categories.View
        });
    }
    navigate(editorGroupService) {
        const group = editorGroupService.activeGroup;
        const editors = group.getEditors(1);
        return { editor: editors[0], groupId: group.id };
    }
}
export class OpenLastEditorInGroup extends AbstractNavigateEditorAction {
    constructor() {
        super({
            id: 'workbench.action.lastEditorInGroup',
            title: localize2('lastEditorInGroup', 'Open Last Editor in Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 512 | 21,
                secondary: [2048 | 30],
                mac: {
                    primary: 256 | 21,
                    secondary: [2048 | 30]
                }
            },
            category: Categories.View
        });
    }
    navigate(editorGroupService) {
        const group = editorGroupService.activeGroup;
        const editors = group.getEditors(1);
        return { editor: editors[editors.length - 1], groupId: group.id };
    }
}
export class NavigateForwardAction extends Action2 {
    static { this.ID = 'workbench.action.navigateForward'; }
    static { this.LABEL = localize('navigateForward', "Go Forward"); }
    constructor() {
        super({
            id: NavigateForwardAction.ID,
            title: {
                ...localize2('navigateForward', "Go Forward"),
                mnemonicTitle: localize({ key: 'miForward', comment: ['&& denotes a mnemonic'] }, "&&Forward")
            },
            f1: true,
            icon: Codicon.arrowRight,
            precondition: ContextKeyExpr.has('canNavigateForward'),
            keybinding: {
                weight: 200,
                win: { primary: 512 | 17 },
                mac: { primary: 256 | 1024 | 88 },
                linux: { primary: 2048 | 1024 | 88 }
            },
            menu: [
                { id: MenuId.MenubarGoMenu, group: '1_history_nav', order: 2 },
                { id: MenuId.CommandCenter, order: 2 }
            ]
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goForward(0);
    }
}
export class NavigateBackwardsAction extends Action2 {
    static { this.ID = 'workbench.action.navigateBack'; }
    static { this.LABEL = localize('navigateBack', "Go Back"); }
    constructor() {
        super({
            id: NavigateBackwardsAction.ID,
            title: {
                ...localize2('navigateBack', "Go Back"),
                mnemonicTitle: localize({ key: 'miBack', comment: ['&& denotes a mnemonic'] }, "&&Back")
            },
            f1: true,
            precondition: ContextKeyExpr.has('canNavigateBack'),
            icon: Codicon.arrowLeft,
            keybinding: {
                weight: 200,
                win: { primary: 512 | 15 },
                mac: { primary: 256 | 88 },
                linux: { primary: 2048 | 512 | 88 }
            },
            menu: [
                { id: MenuId.MenubarGoMenu, group: '1_history_nav', order: 1 },
                { id: MenuId.CommandCenter, order: 1 }
            ]
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goBack(0);
    }
}
export class NavigatePreviousAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigateLast',
            title: localize2('navigatePrevious', 'Go Previous'),
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goPrevious(0);
    }
}
export class NavigateForwardInEditsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigateForwardInEditLocations',
            title: localize2('navigateForwardInEdits', 'Go Forward in Edit Locations'),
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goForward(1);
    }
}
export class NavigateBackwardsInEditsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigateBackInEditLocations',
            title: localize2('navigateBackInEdits', 'Go Back in Edit Locations'),
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goBack(1);
    }
}
export class NavigatePreviousInEditsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigatePreviousInEditLocations',
            title: localize2('navigatePreviousInEdits', 'Go Previous in Edit Locations'),
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goPrevious(1);
    }
}
export class NavigateToLastEditLocationAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigateToLastEditLocation',
            title: localize2('navigateToLastEditLocation', 'Go to Last Edit Location'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 47)
            }
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goLast(1);
    }
}
export class NavigateForwardInNavigationsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigateForwardInNavigationLocations',
            title: localize2('navigateForwardInNavigations', 'Go Forward in Navigation Locations'),
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goForward(2);
    }
}
export class NavigateBackwardsInNavigationsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigateBackInNavigationLocations',
            title: localize2('navigateBackInNavigations', 'Go Back in Navigation Locations'),
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goBack(2);
    }
}
export class NavigatePreviousInNavigationsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigatePreviousInNavigationLocations',
            title: localize2('navigatePreviousInNavigationLocations', 'Go Previous in Navigation Locations'),
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goPrevious(2);
    }
}
export class NavigateToLastNavigationLocationAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.navigateToLastNavigationLocation',
            title: localize2('navigateToLastNavigationLocation', 'Go to Last Navigation Location'),
            f1: true
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goLast(2);
    }
}
export class ReopenClosedEditorAction extends Action2 {
    static { this.ID = 'workbench.action.reopenClosedEditor'; }
    constructor() {
        super({
            id: ReopenClosedEditorAction.ID,
            title: localize2('reopenClosedEditor', 'Reopen Closed Editor'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 1024 | 50
            },
            category: Categories.View
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.reopenLastClosedEditor();
    }
}
export class ClearRecentFilesAction extends Action2 {
    static { this.ID = 'workbench.action.clearRecentFiles'; }
    constructor() {
        super({
            id: ClearRecentFilesAction.ID,
            title: localize2('clearRecentFiles', 'Clear Recently Opened...'),
            f1: true,
            category: Categories.File
        });
    }
    async run(accessor) {
        const dialogService = accessor.get(IDialogService);
        const workspacesService = accessor.get(IWorkspacesService);
        const historyService = accessor.get(IHistoryService);
        const { confirmed } = await dialogService.confirm({
            type: 'warning',
            message: localize('confirmClearRecentsMessage', "Do you want to clear all recently opened files and workspaces?"),
            detail: localize('confirmClearDetail', "This action is irreversible!"),
            primaryButton: localize({ key: 'clearButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Clear")
        });
        if (!confirmed) {
            return;
        }
        workspacesService.clearRecentlyOpened();
        historyService.clearRecentlyOpened();
    }
}
export class ShowEditorsInActiveGroupByMostRecentlyUsedAction extends Action2 {
    static { this.ID = 'workbench.action.showEditorsInActiveGroup'; }
    constructor() {
        super({
            id: ShowEditorsInActiveGroupByMostRecentlyUsedAction.ID,
            title: localize2('showEditorsInActiveGroup', 'Show Editors in Active Group By Most Recently Used'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        quickInputService.quickAccess.show(ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
    }
}
export class ShowAllEditorsByAppearanceAction extends Action2 {
    static { this.ID = 'workbench.action.showAllEditors'; }
    constructor() {
        super({
            id: ShowAllEditorsByAppearanceAction.ID,
            title: localize2('showAllEditors', 'Show All Editors By Appearance'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 2048 | 46),
                mac: {
                    primary: 2048 | 512 | 2
                }
            },
            category: Categories.File
        });
    }
    async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        quickInputService.quickAccess.show(AllEditorsByAppearanceQuickAccess.PREFIX);
    }
}
export class ShowAllEditorsByMostRecentlyUsedAction extends Action2 {
    static { this.ID = 'workbench.action.showAllEditorsByMostRecentlyUsed'; }
    constructor() {
        super({
            id: ShowAllEditorsByMostRecentlyUsedAction.ID,
            title: localize2('showAllEditorsByMostRecentlyUsed', 'Show All Editors By Most Recently Used'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        quickInputService.quickAccess.show(AllEditorsByMostRecentlyUsedQuickAccess.PREFIX);
    }
}
class AbstractQuickAccessEditorAction extends Action2 {
    constructor(desc, prefix, itemActivation) {
        super(desc);
        this.prefix = prefix;
        this.itemActivation = itemActivation;
    }
    async run(accessor) {
        const keybindingService = accessor.get(IKeybindingService);
        const quickInputService = accessor.get(IQuickInputService);
        const keybindings = keybindingService.lookupKeybindings(this.desc.id);
        quickInputService.quickAccess.show(this.prefix, {
            quickNavigateConfiguration: { keybindings },
            itemActivation: this.itemActivation
        });
    }
}
export class QuickAccessPreviousRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
    constructor() {
        super({
            id: 'workbench.action.quickOpenPreviousRecentlyUsedEditor',
            title: localize2('quickOpenPreviousRecentlyUsedEditor', 'Quick Open Previous Recently Used Editor'),
            f1: true,
            category: Categories.View
        }, AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined);
    }
}
export class QuickAccessLeastRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
    constructor() {
        super({
            id: 'workbench.action.quickOpenLeastRecentlyUsedEditor',
            title: localize2('quickOpenLeastRecentlyUsedEditor', 'Quick Open Least Recently Used Editor'),
            f1: true,
            category: Categories.View
        }, AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined);
    }
}
export class QuickAccessPreviousRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
    constructor() {
        super({
            id: 'workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup',
            title: localize2('quickOpenPreviousRecentlyUsedEditorInGroup', 'Quick Open Previous Recently Used Editor in Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 2,
                mac: {
                    primary: 256 | 2
                }
            },
            precondition: ActiveEditorGroupEmptyContext.toNegated(),
            category: Categories.View
        }, ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined);
    }
}
export class QuickAccessLeastRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
    constructor() {
        super({
            id: 'workbench.action.quickOpenLeastRecentlyUsedEditorInGroup',
            title: localize2('quickOpenLeastRecentlyUsedEditorInGroup', 'Quick Open Least Recently Used Editor in Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 1024 | 2,
                mac: {
                    primary: 256 | 1024 | 2
                }
            },
            precondition: ActiveEditorGroupEmptyContext.toNegated(),
            category: Categories.View
        }, ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, ItemActivation.LAST);
    }
}
export class QuickAccessPreviousEditorFromHistoryAction extends Action2 {
    static { this.ID = 'workbench.action.openPreviousEditorFromHistory'; }
    constructor() {
        super({
            id: QuickAccessPreviousEditorFromHistoryAction.ID,
            title: localize2('navigateEditorHistoryByInput', 'Quick Open Previous Editor from History'),
            f1: true
        });
    }
    async run(accessor) {
        const keybindingService = accessor.get(IKeybindingService);
        const quickInputService = accessor.get(IQuickInputService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const keybindings = keybindingService.lookupKeybindings(QuickAccessPreviousEditorFromHistoryAction.ID);
        let itemActivation = undefined;
        if (editorGroupService.activeGroup.count === 0) {
            itemActivation = ItemActivation.FIRST;
        }
        quickInputService.quickAccess.show('', { quickNavigateConfiguration: { keybindings }, itemActivation });
    }
}
export class OpenNextRecentlyUsedEditorAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.openNextRecentlyUsedEditor',
            title: localize2('openNextRecentlyUsedEditor', 'Open Next Recently Used Editor'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        historyService.openNextRecentlyUsedEditor();
    }
}
export class OpenPreviousRecentlyUsedEditorAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.openPreviousRecentlyUsedEditor',
            title: localize2('openPreviousRecentlyUsedEditor', 'Open Previous Recently Used Editor'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        historyService.openPreviouslyUsedEditor();
    }
}
export class OpenNextRecentlyUsedEditorInGroupAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.openNextRecentlyUsedEditorInGroup',
            title: localize2('openNextRecentlyUsedEditorInGroup', 'Open Next Recently Used Editor In Group'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        const editorGroupsService = accessor.get(IEditorGroupsService);
        historyService.openNextRecentlyUsedEditor(editorGroupsService.activeGroup.id);
    }
}
export class OpenPreviousRecentlyUsedEditorInGroupAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.openPreviousRecentlyUsedEditorInGroup',
            title: localize2('openPreviousRecentlyUsedEditorInGroup', 'Open Previous Recently Used Editor In Group'),
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        const editorGroupsService = accessor.get(IEditorGroupsService);
        historyService.openPreviouslyUsedEditor(editorGroupsService.activeGroup.id);
    }
}
export class ClearEditorHistoryAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.clearEditorHistory',
            title: localize2('clearEditorHistory', 'Clear Editor History'),
            f1: true
        });
    }
    async run(accessor) {
        const dialogService = accessor.get(IDialogService);
        const historyService = accessor.get(IHistoryService);
        const { confirmed } = await dialogService.confirm({
            type: 'warning',
            message: localize('confirmClearEditorHistoryMessage', "Do you want to clear the history of recently opened editors?"),
            detail: localize('confirmClearDetail', "This action is irreversible!"),
            primaryButton: localize({ key: 'clearButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Clear")
        });
        if (!confirmed) {
            return;
        }
        historyService.clear();
    }
}
export class MoveEditorLeftInGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorLeftInGroup',
            title: localize2('moveEditorLeft', 'Move Editor Left'),
            keybinding: {
                weight: 200,
                primary: 2048 | 1024 | 11,
                mac: {
                    primary: KeyChord(2048 | 41, 2048 | 1024 | 15)
                }
            },
            f1: true,
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'left' });
    }
}
export class MoveEditorRightInGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorRightInGroup',
            title: localize2('moveEditorRight', 'Move Editor Right'),
            keybinding: {
                weight: 200,
                primary: 2048 | 1024 | 12,
                mac: {
                    primary: KeyChord(2048 | 41, 2048 | 1024 | 17)
                }
            },
            f1: true,
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'right' });
    }
}
export class MoveEditorToPreviousGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorToPreviousGroup',
            title: localize2('moveEditorToPreviousGroup', 'Move Editor into Previous Group'),
            keybinding: {
                weight: 200,
                primary: 2048 | 512 | 15,
                mac: {
                    primary: 2048 | 256 | 15
                }
            },
            f1: true,
            category: Categories.View,
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'previous', by: 'group' });
    }
}
export class MoveEditorToNextGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorToNextGroup',
            title: localize2('moveEditorToNextGroup', 'Move Editor into Next Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 2048 | 512 | 17,
                mac: {
                    primary: 2048 | 256 | 17
                }
            },
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'next', by: 'group' });
    }
}
export class MoveEditorToAboveGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorToAboveGroup',
            title: localize2('moveEditorToAboveGroup', 'Move Editor into Group Above'),
            f1: true,
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'up', by: 'group' });
    }
}
export class MoveEditorToBelowGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorToBelowGroup',
            title: localize2('moveEditorToBelowGroup', 'Move Editor into Group Below'),
            f1: true,
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'down', by: 'group' });
    }
}
export class MoveEditorToLeftGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorToLeftGroup',
            title: localize2('moveEditorToLeftGroup', 'Move Editor into Left Group'),
            f1: true,
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'left', by: 'group' });
    }
}
export class MoveEditorToRightGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorToRightGroup',
            title: localize2('moveEditorToRightGroup', 'Move Editor into Right Group'),
            f1: true,
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'right', by: 'group' });
    }
}
export class MoveEditorToFirstGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorToFirstGroup',
            title: localize2('moveEditorToFirstGroup', 'Move Editor into First Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 1024 | 512 | 22,
                mac: {
                    primary: 2048 | 256 | 22
                }
            },
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'first', by: 'group' });
    }
}
export class MoveEditorToLastGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.moveEditorToLastGroup',
            title: localize2('moveEditorToLastGroup', 'Move Editor into Last Group'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: 1024 | 512 | 30,
                mac: {
                    primary: 2048 | 256 | 30
                }
            },
            category: Categories.View
        }, MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'last', by: 'group' });
    }
}
export class SplitEditorToPreviousGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.splitEditorToPreviousGroup',
            title: localize2('splitEditorToPreviousGroup', 'Split Editor into Previous Group'),
            f1: true,
            category: Categories.View
        }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'previous', by: 'group' });
    }
}
export class SplitEditorToNextGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.splitEditorToNextGroup',
            title: localize2('splitEditorToNextGroup', 'Split Editor into Next Group'),
            f1: true,
            category: Categories.View
        }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'next', by: 'group' });
    }
}
export class SplitEditorToAboveGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.splitEditorToAboveGroup',
            title: localize2('splitEditorToAboveGroup', 'Split Editor into Group Above'),
            f1: true,
            category: Categories.View
        }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'up', by: 'group' });
    }
}
export class SplitEditorToBelowGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.splitEditorToBelowGroup',
            title: localize2('splitEditorToBelowGroup', 'Split Editor into Group Below'),
            f1: true,
            category: Categories.View
        }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'down', by: 'group' });
    }
}
export class SplitEditorToLeftGroupAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.splitEditorToLeftGroup'; }
    static { this.LABEL = localize('splitEditorToLeftGroup', "Split Editor into Left Group"); }
    constructor() {
        super({
            id: 'workbench.action.splitEditorToLeftGroup',
            title: localize2('splitEditorToLeftGroup', "Split Editor into Left Group"),
            f1: true,
            category: Categories.View
        }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'left', by: 'group' });
    }
}
export class SplitEditorToRightGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.splitEditorToRightGroup',
            title: localize2('splitEditorToRightGroup', 'Split Editor into Right Group'),
            f1: true,
            category: Categories.View
        }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'right', by: 'group' });
    }
}
export class SplitEditorToFirstGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.splitEditorToFirstGroup',
            title: localize2('splitEditorToFirstGroup', 'Split Editor into First Group'),
            f1: true,
            category: Categories.View
        }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'first', by: 'group' });
    }
}
export class SplitEditorToLastGroupAction extends ExecuteCommandAction {
    constructor() {
        super({
            id: 'workbench.action.splitEditorToLastGroup',
            title: localize2('splitEditorToLastGroup', 'Split Editor into Last Group'),
            f1: true,
            category: Categories.View
        }, COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'last', by: 'group' });
    }
}
export class EditorLayoutSingleAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.editorLayoutSingle'; }
    constructor() {
        super({
            id: EditorLayoutSingleAction.ID,
            title: localize2('editorLayoutSingle', 'Single Column Editor Layout'),
            f1: true,
            category: Categories.View
        }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}], orientation: 0 });
    }
}
export class EditorLayoutTwoColumnsAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.editorLayoutTwoColumns'; }
    constructor() {
        super({
            id: EditorLayoutTwoColumnsAction.ID,
            title: localize2('editorLayoutTwoColumns', 'Two Columns Editor Layout'),
            f1: true,
            category: Categories.View
        }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}], orientation: 0 });
    }
}
export class EditorLayoutThreeColumnsAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.editorLayoutThreeColumns'; }
    constructor() {
        super({
            id: EditorLayoutThreeColumnsAction.ID,
            title: localize2('editorLayoutThreeColumns', 'Three Columns Editor Layout'),
            f1: true,
            category: Categories.View
        }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}, {}], orientation: 0 });
    }
}
export class EditorLayoutTwoRowsAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.editorLayoutTwoRows'; }
    constructor() {
        super({
            id: EditorLayoutTwoRowsAction.ID,
            title: localize2('editorLayoutTwoRows', 'Two Rows Editor Layout'),
            f1: true,
            category: Categories.View
        }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}], orientation: 1 });
    }
}
export class EditorLayoutThreeRowsAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.editorLayoutThreeRows'; }
    constructor() {
        super({
            id: EditorLayoutThreeRowsAction.ID,
            title: localize2('editorLayoutThreeRows', 'Three Rows Editor Layout'),
            f1: true,
            category: Categories.View
        }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}, {}], orientation: 1 });
    }
}
export class EditorLayoutTwoByTwoGridAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.editorLayoutTwoByTwoGrid'; }
    constructor() {
        super({
            id: EditorLayoutTwoByTwoGridAction.ID,
            title: localize2('editorLayoutTwoByTwoGrid', 'Grid Editor Layout (2x2)'),
            f1: true,
            category: Categories.View
        }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }], orientation: 0 });
    }
}
export class EditorLayoutTwoColumnsBottomAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.editorLayoutTwoColumnsBottom'; }
    constructor() {
        super({
            id: EditorLayoutTwoColumnsBottomAction.ID,
            title: localize2('editorLayoutTwoColumnsBottom', 'Two Columns Bottom Editor Layout'),
            f1: true,
            category: Categories.View
        }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, { groups: [{}, {}] }], orientation: 1 });
    }
}
export class EditorLayoutTwoRowsRightAction extends ExecuteCommandAction {
    static { this.ID = 'workbench.action.editorLayoutTwoRowsRight'; }
    constructor() {
        super({
            id: EditorLayoutTwoRowsRightAction.ID,
            title: localize2('editorLayoutTwoRowsRight', 'Two Rows Right Editor Layout'),
            f1: true,
            category: Categories.View
        }, LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, { groups: [{}, {}] }], orientation: 0 });
    }
}
class AbstractCreateEditorGroupAction extends Action2 {
    constructor(desc, direction) {
        super(desc);
        this.direction = direction;
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const activeDocument = getActiveDocument();
        const focusNewGroup = layoutService.hasFocus("workbench.parts.editor") || activeDocument.activeElement === activeDocument.body;
        const group = editorGroupService.addGroup(editorGroupService.activeGroup, this.direction);
        editorGroupService.activateGroup(group);
        if (focusNewGroup) {
            group.focus();
        }
    }
}
export class NewEditorGroupLeftAction extends AbstractCreateEditorGroupAction {
    constructor() {
        super({
            id: 'workbench.action.newGroupLeft',
            title: localize2('newGroupLeft', 'New Editor Group to the Left'),
            f1: true,
            category: Categories.View
        }, 2);
    }
}
export class NewEditorGroupRightAction extends AbstractCreateEditorGroupAction {
    constructor() {
        super({
            id: 'workbench.action.newGroupRight',
            title: localize2('newGroupRight', 'New Editor Group to the Right'),
            f1: true,
            category: Categories.View
        }, 3);
    }
}
export class NewEditorGroupAboveAction extends AbstractCreateEditorGroupAction {
    constructor() {
        super({
            id: 'workbench.action.newGroupAbove',
            title: localize2('newGroupAbove', 'New Editor Group Above'),
            f1: true,
            category: Categories.View
        }, 0);
    }
}
export class NewEditorGroupBelowAction extends AbstractCreateEditorGroupAction {
    constructor() {
        super({
            id: 'workbench.action.newGroupBelow',
            title: localize2('newGroupBelow', 'New Editor Group Below'),
            f1: true,
            category: Categories.View
        }, 1);
    }
}
export class ToggleEditorTypeAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleEditorType',
            title: localize2('toggleEditorType', 'Toggle Editor Type'),
            f1: true,
            category: Categories.View,
            precondition: ActiveEditorAvailableEditorIdsContext
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorResolverService = accessor.get(IEditorResolverService);
        const activeEditorPane = editorService.activeEditorPane;
        if (!activeEditorPane) {
            return;
        }
        const activeEditorResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
        if (!activeEditorResource) {
            return;
        }
        const editorIds = editorResolverService.getEditors(activeEditorResource).map(editor => editor.id).filter(id => id !== activeEditorPane.input.editorId);
        if (editorIds.length === 0) {
            return;
        }
        await editorService.replaceEditors([
            {
                editor: activeEditorPane.input,
                replacement: {
                    resource: activeEditorResource,
                    options: {
                        override: editorIds[0]
                    }
                }
            }
        ], activeEditorPane.group);
    }
}
export class ReOpenInTextEditorAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.reopenTextEditor',
            title: localize2('reopenTextEditor', 'Reopen Editor With Text Editor'),
            f1: true,
            category: Categories.View,
            precondition: ActiveEditorAvailableEditorIdsContext
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (!activeEditorPane) {
            return;
        }
        const activeEditorResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
        if (!activeEditorResource) {
            return;
        }
        await editorService.replaceEditors([
            {
                editor: activeEditorPane.input,
                replacement: {
                    resource: activeEditorResource,
                    options: {
                        override: DEFAULT_EDITOR_ASSOCIATION.id
                    }
                }
            }
        ], activeEditorPane.group);
    }
}
class BaseMoveCopyEditorToNewWindowAction extends Action2 {
    constructor(id, title, keybinding, move) {
        super({
            id,
            title,
            category: Categories.View,
            precondition: ActiveEditorContext,
            keybinding,
            f1: true
        });
        this.move = move;
    }
    async run(accessor, ...args) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupService, accessor.get(IListService));
        if (!resolvedContext.groupedEditors.length) {
            return;
        }
        const auxiliaryEditorPart = await editorGroupService.createAuxiliaryEditorPart();
        const { group, editors } = resolvedContext.groupedEditors[0];
        const options = { preserveFocus: resolvedContext.preserveFocus };
        const editorsWithOptions = editors.map(editor => ({ editor, options }));
        if (this.move) {
            group.moveEditors(editorsWithOptions, auxiliaryEditorPart.activeGroup);
        }
        else {
            group.copyEditors(editorsWithOptions, auxiliaryEditorPart.activeGroup);
        }
        auxiliaryEditorPart.activeGroup.focus();
    }
}
export class MoveEditorToNewWindowAction extends BaseMoveCopyEditorToNewWindowAction {
    constructor() {
        super(MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, {
            ...localize2('moveEditorToNewWindow', "Move Editor into New Window"),
            mnemonicTitle: localize({ key: 'miMoveEditorToNewWindow', comment: ['&& denotes a mnemonic'] }, "&&Move Editor into New Window"),
        }, undefined, true);
    }
}
export class CopyEditorToNewindowAction extends BaseMoveCopyEditorToNewWindowAction {
    constructor() {
        super(COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, {
            ...localize2('copyEditorToNewWindow', "Copy Editor into New Window"),
            mnemonicTitle: localize({ key: 'miCopyEditorToNewWindow', comment: ['&& denotes a mnemonic'] }, "&&Copy Editor into New Window"),
        }, { primary: KeyChord(2048 | 41, 45), weight: 200 }, false);
    }
}
class BaseMoveCopyEditorGroupToNewWindowAction extends Action2 {
    constructor(id, title, move) {
        super({
            id,
            title,
            category: Categories.View,
            f1: true
        });
        this.move = move;
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const activeGroup = editorGroupService.activeGroup;
        const auxiliaryEditorPart = await editorGroupService.createAuxiliaryEditorPart();
        editorGroupService.mergeGroup(activeGroup, auxiliaryEditorPart.activeGroup, {
            mode: this.move ? 1 : 0
        });
        auxiliaryEditorPart.activeGroup.focus();
    }
}
export class MoveEditorGroupToNewWindowAction extends BaseMoveCopyEditorGroupToNewWindowAction {
    constructor() {
        super(MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, {
            ...localize2('moveEditorGroupToNewWindow', "Move Editor Group into New Window"),
            mnemonicTitle: localize({ key: 'miMoveEditorGroupToNewWindow', comment: ['&& denotes a mnemonic'] }, "&&Move Editor Group into New Window"),
        }, true);
    }
}
export class CopyEditorGroupToNewWindowAction extends BaseMoveCopyEditorGroupToNewWindowAction {
    constructor() {
        super(COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, {
            ...localize2('copyEditorGroupToNewWindow', "Copy Editor Group into New Window"),
            mnemonicTitle: localize({ key: 'miCopyEditorGroupToNewWindow', comment: ['&& denotes a mnemonic'] }, "&&Copy Editor Group into New Window"),
        }, false);
    }
}
export class RestoreEditorsToMainWindowAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.restoreEditorsToMainWindow',
            title: {
                ...localize2('restoreEditorsToMainWindow', "Restore Editors into Main Window"),
                mnemonicTitle: localize({ key: 'miRestoreEditorsToMainWindow', comment: ['&& denotes a mnemonic'] }, "&&Restore Editors into Main Window"),
            },
            f1: true,
            precondition: IsAuxiliaryWindowFocusedContext,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        editorGroupService.mergeAllGroups(editorGroupService.mainPart.activeGroup);
    }
}
export class NewEmptyEditorWindowAction extends Action2 {
    constructor() {
        super({
            id: NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID,
            title: {
                ...localize2('newEmptyEditorWindow', "New Empty Editor Window"),
                mnemonicTitle: localize({ key: 'miNewEmptyEditorWindow', comment: ['&& denotes a mnemonic'] }, "&&New Empty Editor Window"),
            },
            f1: true,
            category: Categories.View
        });
    }
    async run(accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const auxiliaryEditorPart = await editorGroupService.createAuxiliaryEditorPart();
        auxiliaryEditorPart.activeGroup.focus();
    }
}
