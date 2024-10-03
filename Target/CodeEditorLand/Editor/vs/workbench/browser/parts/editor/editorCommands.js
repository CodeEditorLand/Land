import { KeyChord } from '../../../../base/common/keyCodes.js';
import { Schemas, matchesScheme } from '../../../../base/common/network.js';
import { extname } from '../../../../base/common/resources.js';
import { isNumber, isObject, isString, isUndefined } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { isDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { EditorResolution } from '../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { IListService } from '../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ActiveGroupEditorsByMostRecentlyUsedQuickAccess } from './editorQuickAccess.js';
import { SideBySideEditor } from './sideBySideEditor.js';
import { TextDiffEditor } from './textDiffEditor.js';
import { ActiveEditorCanSplitInGroupContext, ActiveEditorGroupEmptyContext, ActiveEditorGroupLockedContext, ActiveEditorStickyContext, MultipleEditorGroupsContext, SideBySideEditorActiveContext, TextCompareEditorActiveContext } from '../../../common/contextkeys.js';
import { isEditorInputWithOptionsAndGroup } from '../../../common/editor.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { columnToEditorGroup } from '../../../services/editor/common/editorGroupColumn.js';
import { IEditorGroupsService, preferredSideBySideGroupDirection } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IUntitledTextEditorService } from '../../../services/untitled/common/untitledTextEditorService.js';
import { DIFF_FOCUS_OTHER_SIDE, DIFF_FOCUS_PRIMARY_SIDE, DIFF_FOCUS_SECONDARY_SIDE, DIFF_OPEN_SIDE, registerDiffEditorCommands } from './diffEditorCommands.js';
import { resolveCommandsContext } from './editorCommandsContext.js';
export const CLOSE_SAVED_EDITORS_COMMAND_ID = 'workbench.action.closeUnmodifiedEditors';
export const CLOSE_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeEditorsInGroup';
export const CLOSE_EDITORS_AND_GROUP_COMMAND_ID = 'workbench.action.closeEditorsAndGroup';
export const CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = 'workbench.action.closeEditorsToTheRight';
export const CLOSE_EDITOR_COMMAND_ID = 'workbench.action.closeActiveEditor';
export const CLOSE_PINNED_EDITOR_COMMAND_ID = 'workbench.action.closeActivePinnedEditor';
export const CLOSE_EDITOR_GROUP_COMMAND_ID = 'workbench.action.closeGroup';
export const CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeOtherEditors';
export const MOVE_ACTIVE_EDITOR_COMMAND_ID = 'moveActiveEditor';
export const COPY_ACTIVE_EDITOR_COMMAND_ID = 'copyActiveEditor';
export const LAYOUT_EDITOR_GROUPS_COMMAND_ID = 'layoutEditorGroups';
export const KEEP_EDITOR_COMMAND_ID = 'workbench.action.keepEditor';
export const TOGGLE_KEEP_EDITORS_COMMAND_ID = 'workbench.action.toggleKeepEditors';
export const TOGGLE_LOCK_GROUP_COMMAND_ID = 'workbench.action.toggleEditorGroupLock';
export const LOCK_GROUP_COMMAND_ID = 'workbench.action.lockEditorGroup';
export const UNLOCK_GROUP_COMMAND_ID = 'workbench.action.unlockEditorGroup';
export const SHOW_EDITORS_IN_GROUP = 'workbench.action.showEditorsInGroup';
export const REOPEN_WITH_COMMAND_ID = 'workbench.action.reopenWithEditor';
export const PIN_EDITOR_COMMAND_ID = 'workbench.action.pinEditor';
export const UNPIN_EDITOR_COMMAND_ID = 'workbench.action.unpinEditor';
export const SPLIT_EDITOR = 'workbench.action.splitEditor';
export const SPLIT_EDITOR_UP = 'workbench.action.splitEditorUp';
export const SPLIT_EDITOR_DOWN = 'workbench.action.splitEditorDown';
export const SPLIT_EDITOR_LEFT = 'workbench.action.splitEditorLeft';
export const SPLIT_EDITOR_RIGHT = 'workbench.action.splitEditorRight';
export const TOGGLE_MAXIMIZE_EDITOR_GROUP = 'workbench.action.toggleMaximizeEditorGroup';
export const SPLIT_EDITOR_IN_GROUP = 'workbench.action.splitEditorInGroup';
export const TOGGLE_SPLIT_EDITOR_IN_GROUP = 'workbench.action.toggleSplitEditorInGroup';
export const JOIN_EDITOR_IN_GROUP = 'workbench.action.joinEditorInGroup';
export const TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT = 'workbench.action.toggleSplitEditorInGroupLayout';
export const FOCUS_FIRST_SIDE_EDITOR = 'workbench.action.focusFirstSideEditor';
export const FOCUS_SECOND_SIDE_EDITOR = 'workbench.action.focusSecondSideEditor';
export const FOCUS_OTHER_SIDE_EDITOR = 'workbench.action.focusOtherSideEditor';
export const FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusLeftGroupWithoutWrap';
export const FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusRightGroupWithoutWrap';
export const FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusAboveGroupWithoutWrap';
export const FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusBelowGroupWithoutWrap';
export const OPEN_EDITOR_AT_INDEX_COMMAND_ID = 'workbench.action.openEditorAtIndex';
export const MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID = 'workbench.action.moveEditorToNewWindow';
export const COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID = 'workbench.action.copyEditorToNewWindow';
export const MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID = 'workbench.action.moveEditorGroupToNewWindow';
export const COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID = 'workbench.action.copyEditorGroupToNewWindow';
export const NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID = 'workbench.action.newEmptyEditorWindow';
export const API_OPEN_EDITOR_COMMAND_ID = '_workbench.open';
export const API_OPEN_DIFF_EDITOR_COMMAND_ID = '_workbench.diff';
export const API_OPEN_WITH_EDITOR_COMMAND_ID = '_workbench.openWith';
export const EDITOR_CORE_NAVIGATION_COMMANDS = [
    SPLIT_EDITOR,
    CLOSE_EDITOR_COMMAND_ID,
    UNPIN_EDITOR_COMMAND_ID,
    UNLOCK_GROUP_COMMAND_ID,
    TOGGLE_MAXIMIZE_EDITOR_GROUP
];
const isActiveEditorMoveCopyArg = function (arg) {
    if (!isObject(arg)) {
        return false;
    }
    if (!isString(arg.to)) {
        return false;
    }
    if (!isUndefined(arg.by) && !isString(arg.by)) {
        return false;
    }
    if (!isUndefined(arg.value) && !isNumber(arg.value)) {
        return false;
    }
    return true;
};
function registerActiveEditorMoveCopyCommand() {
    const moveCopyJSONSchema = {
        'type': 'object',
        'required': ['to'],
        'properties': {
            'to': {
                'type': 'string',
                'enum': ['left', 'right']
            },
            'by': {
                'type': 'string',
                'enum': ['tab', 'group']
            },
            'value': {
                'type': 'number'
            }
        }
    };
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: MOVE_ACTIVE_EDITOR_COMMAND_ID,
        weight: 200,
        when: EditorContextKeys.editorTextFocus,
        primary: 0,
        handler: (accessor, args) => moveCopyActiveEditor(true, args, accessor),
        metadata: {
            description: localize('editorCommand.activeEditorMove.description', "Move the active editor by tabs or groups"),
            args: [
                {
                    name: localize('editorCommand.activeEditorMove.arg.name', "Active editor move argument"),
                    description: localize('editorCommand.activeEditorMove.arg.description', "Argument Properties:\n\t* 'to': String value providing where to move.\n\t* 'by': String value providing the unit for move (by tab or by group).\n\t* 'value': Number value providing how many positions or an absolute position to move."),
                    constraint: isActiveEditorMoveCopyArg,
                    schema: moveCopyJSONSchema
                }
            ]
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: COPY_ACTIVE_EDITOR_COMMAND_ID,
        weight: 200,
        when: EditorContextKeys.editorTextFocus,
        primary: 0,
        handler: (accessor, args) => moveCopyActiveEditor(false, args, accessor),
        metadata: {
            description: localize('editorCommand.activeEditorCopy.description', "Copy the active editor by groups"),
            args: [
                {
                    name: localize('editorCommand.activeEditorCopy.arg.name', "Active editor copy argument"),
                    description: localize('editorCommand.activeEditorCopy.arg.description', "Argument Properties:\n\t* 'to': String value providing where to copy.\n\t* 'value': Number value providing how many positions or an absolute position to copy."),
                    constraint: isActiveEditorMoveCopyArg,
                    schema: moveCopyJSONSchema
                }
            ]
        }
    });
    function moveCopyActiveEditor(isMove, args = Object.create(null), accessor) {
        args.to = args.to || 'right';
        args.by = args.by || 'tab';
        args.value = typeof args.value === 'number' ? args.value : 1;
        const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
        if (activeEditorPane) {
            switch (args.by) {
                case 'tab':
                    if (isMove) {
                        return moveActiveTab(args, activeEditorPane);
                    }
                    break;
                case 'group':
                    return moveCopyActiveEditorToGroup(isMove, args, activeEditorPane, accessor);
            }
        }
    }
    function moveActiveTab(args, control) {
        const group = control.group;
        let index = group.getIndexOfEditor(control.input);
        switch (args.to) {
            case 'first':
                index = 0;
                break;
            case 'last':
                index = group.count - 1;
                break;
            case 'left':
                index = index - (args.value ?? 1);
                break;
            case 'right':
                index = index + (args.value ?? 1);
                break;
            case 'center':
                index = Math.round(group.count / 2) - 1;
                break;
            case 'position':
                index = (args.value ?? 1) - 1;
                break;
        }
        index = index < 0 ? 0 : index >= group.count ? group.count - 1 : index;
        group.moveEditor(control.input, group, { index });
    }
    function moveCopyActiveEditorToGroup(isMove, args, control, accessor) {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        const sourceGroup = control.group;
        let targetGroup;
        switch (args.to) {
            case 'left':
                targetGroup = editorGroupsService.findGroup({ direction: 2 }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupsService.addGroup(sourceGroup, 2);
                }
                break;
            case 'right':
                targetGroup = editorGroupsService.findGroup({ direction: 3 }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupsService.addGroup(sourceGroup, 3);
                }
                break;
            case 'up':
                targetGroup = editorGroupsService.findGroup({ direction: 0 }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupsService.addGroup(sourceGroup, 0);
                }
                break;
            case 'down':
                targetGroup = editorGroupsService.findGroup({ direction: 1 }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupsService.addGroup(sourceGroup, 1);
                }
                break;
            case 'first':
                targetGroup = editorGroupsService.findGroup({ location: 0 }, sourceGroup);
                break;
            case 'last':
                targetGroup = editorGroupsService.findGroup({ location: 1 }, sourceGroup);
                break;
            case 'previous':
                targetGroup = editorGroupsService.findGroup({ location: 3 }, sourceGroup);
                break;
            case 'next':
                targetGroup = editorGroupsService.findGroup({ location: 2 }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupsService.addGroup(sourceGroup, preferredSideBySideGroupDirection(configurationService));
                }
                break;
            case 'center':
                targetGroup = editorGroupsService.getGroups(2)[(editorGroupsService.count / 2) - 1];
                break;
            case 'position':
                targetGroup = editorGroupsService.getGroups(2)[(args.value ?? 1) - 1];
                break;
        }
        if (targetGroup) {
            if (isMove) {
                sourceGroup.moveEditor(control.input, targetGroup);
            }
            else if (sourceGroup.id !== targetGroup.id) {
                sourceGroup.copyEditor(control.input, targetGroup);
            }
            targetGroup.focus();
        }
    }
}
function registerEditorGroupsLayoutCommands() {
    function applyEditorLayout(accessor, layout) {
        if (!layout || typeof layout !== 'object') {
            return;
        }
        const editorGroupsService = accessor.get(IEditorGroupsService);
        editorGroupsService.applyLayout(layout);
    }
    CommandsRegistry.registerCommand(LAYOUT_EDITOR_GROUPS_COMMAND_ID, (accessor, args) => {
        applyEditorLayout(accessor, args);
    });
    CommandsRegistry.registerCommand({
        id: 'vscode.setEditorLayout',
        handler: (accessor, args) => applyEditorLayout(accessor, args),
        metadata: {
            description: 'Set Editor Layout',
            args: [{
                    name: 'args',
                    schema: {
                        'type': 'object',
                        'required': ['groups'],
                        'properties': {
                            'orientation': {
                                'type': 'number',
                                'default': 0,
                                'enum': [0, 1]
                            },
                            'groups': {
                                '$ref': '#/definitions/editorGroupsSchema',
                                'default': [{}, {}]
                            }
                        }
                    }
                }]
        }
    });
    CommandsRegistry.registerCommand({
        id: 'vscode.getEditorLayout',
        handler: (accessor) => {
            const editorGroupsService = accessor.get(IEditorGroupsService);
            return editorGroupsService.getLayout();
        },
        metadata: {
            description: 'Get Editor Layout',
            args: [],
            returns: 'An editor layout object, in the same format as vscode.setEditorLayout'
        }
    });
}
function registerOpenEditorAPICommands() {
    function mixinContext(context, options, column) {
        if (!context) {
            return [options, column];
        }
        return [
            { ...context.editorOptions, ...(options ?? Object.create(null)) },
            context.sideBySide ? SIDE_GROUP : column
        ];
    }
    CommandsRegistry.registerCommand({
        id: 'vscode.open',
        handler: (accessor, arg) => {
            accessor.get(ICommandService).executeCommand(API_OPEN_EDITOR_COMMAND_ID, arg);
        },
        metadata: {
            description: 'Opens the provided resource in the editor.',
            args: [{ name: 'Uri' }]
        }
    });
    CommandsRegistry.registerCommand(API_OPEN_EDITOR_COMMAND_ID, async function (accessor, resourceArg, columnAndOptions, label, context) {
        const editorService = accessor.get(IEditorService);
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const openerService = accessor.get(IOpenerService);
        const pathService = accessor.get(IPathService);
        const configurationService = accessor.get(IConfigurationService);
        const untitledTextEditorService = accessor.get(IUntitledTextEditorService);
        const resourceOrString = typeof resourceArg === 'string' ? resourceArg : URI.from(resourceArg, true);
        const [columnArg, optionsArg] = columnAndOptions ?? [];
        if (optionsArg || typeof columnArg === 'number' || matchesScheme(resourceOrString, Schemas.untitled)) {
            const [options, column] = mixinContext(context, optionsArg, columnArg);
            const resource = URI.isUri(resourceOrString) ? resourceOrString : URI.parse(resourceOrString);
            let input;
            if (untitledTextEditorService.isUntitledWithAssociatedResource(resource)) {
                input = { resource: resource.with({ scheme: pathService.defaultUriScheme }), forceUntitled: true, options, label };
            }
            else {
                input = { resource, options, label };
            }
            await editorService.openEditor(input, columnToEditorGroup(editorGroupsService, configurationService, column));
        }
        else if (matchesScheme(resourceOrString, Schemas.command)) {
            return;
        }
        else {
            await openerService.open(resourceOrString, { openToSide: context?.sideBySide, editorOptions: context?.editorOptions });
        }
    });
    CommandsRegistry.registerCommand({
        id: 'vscode.diff',
        handler: (accessor, left, right, label) => {
            accessor.get(ICommandService).executeCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, left, right, label);
        },
        metadata: {
            description: 'Opens the provided resources in the diff editor to compare their contents.',
            args: [
                { name: 'left', description: 'Left-hand side resource of the diff editor' },
                { name: 'right', description: 'Right-hand side resource of the diff editor' },
                { name: 'title', description: 'Human readable title for the diff editor' },
            ]
        }
    });
    CommandsRegistry.registerCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, async function (accessor, originalResource, modifiedResource, labelAndOrDescription, columnAndOptions, context) {
        const editorService = accessor.get(IEditorService);
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        const [columnArg, optionsArg] = columnAndOptions ?? [];
        const [options, column] = mixinContext(context, optionsArg, columnArg);
        let label = undefined;
        let description = undefined;
        if (typeof labelAndOrDescription === 'string') {
            label = labelAndOrDescription;
        }
        else if (labelAndOrDescription) {
            label = labelAndOrDescription.label;
            description = labelAndOrDescription.description;
        }
        await editorService.openEditor({
            original: { resource: URI.from(originalResource, true) },
            modified: { resource: URI.from(modifiedResource, true) },
            label,
            description,
            options
        }, columnToEditorGroup(editorGroupsService, configurationService, column));
    });
    CommandsRegistry.registerCommand(API_OPEN_WITH_EDITOR_COMMAND_ID, async (accessor, resource, id, columnAndOptions) => {
        const editorService = accessor.get(IEditorService);
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        const [columnArg, optionsArg] = columnAndOptions ?? [];
        await editorService.openEditor({ resource: URI.from(resource, true), options: { ...optionsArg, pinned: true, override: id } }, columnToEditorGroup(editorGroupsService, configurationService, columnArg));
    });
    CommandsRegistry.registerCommand({
        id: 'vscode.changes',
        handler: (accessor, title, resources) => {
            accessor.get(ICommandService).executeCommand('_workbench.changes', title, resources);
        },
        metadata: {
            description: 'Opens a list of resources in the changes editor to compare their contents.',
            args: [
                { name: 'title', description: 'Human readable title for the diff editor' },
                { name: 'resources', description: 'List of resources to open in the changes editor' }
            ]
        }
    });
    CommandsRegistry.registerCommand('_workbench.changes', async (accessor, title, resources) => {
        const editorService = accessor.get(IEditorService);
        const editor = [];
        for (const [label, original, modified] of resources) {
            editor.push({
                resource: URI.revive(label),
                original: { resource: URI.revive(original) },
                modified: { resource: URI.revive(modified) },
            });
        }
        await editorService.openEditor({ resources: editor, label: title });
    });
    CommandsRegistry.registerCommand('_workbench.openMultiDiffEditor', async (accessor, options) => {
        const editorService = accessor.get(IEditorService);
        await editorService.openEditor({
            multiDiffSource: options.multiDiffSourceUri ? URI.revive(options.multiDiffSourceUri) : undefined,
            resources: options.resources?.map(r => ({ original: { resource: URI.revive(r.originalUri) }, modified: { resource: URI.revive(r.modifiedUri) } })),
            label: options.title,
        });
    });
}
function registerOpenEditorAtIndexCommands() {
    const openEditorAtIndex = (accessor, editorIndex) => {
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (activeEditorPane) {
            const editor = activeEditorPane.group.getEditorByIndex(editorIndex);
            if (editor) {
                editorService.openEditor(editor);
            }
        }
    };
    CommandsRegistry.registerCommand({
        id: OPEN_EDITOR_AT_INDEX_COMMAND_ID,
        handler: openEditorAtIndex
    });
    for (let i = 0; i < 9; i++) {
        const editorIndex = i;
        const visibleIndex = i + 1;
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: OPEN_EDITOR_AT_INDEX_COMMAND_ID + visibleIndex,
            weight: 200,
            when: undefined,
            primary: 512 | toKeyCode(visibleIndex),
            mac: { primary: 256 | toKeyCode(visibleIndex) },
            handler: accessor => openEditorAtIndex(accessor, editorIndex)
        });
    }
    function toKeyCode(index) {
        switch (index) {
            case 0: return 21;
            case 1: return 22;
            case 2: return 23;
            case 3: return 24;
            case 4: return 25;
            case 5: return 26;
            case 6: return 27;
            case 7: return 28;
            case 8: return 29;
            case 9: return 30;
        }
        throw new Error('invalid index');
    }
}
function registerFocusEditorGroupAtIndexCommands() {
    for (let groupIndex = 1; groupIndex < 8; groupIndex++) {
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: toCommandId(groupIndex),
            weight: 200,
            when: undefined,
            primary: 2048 | toKeyCode(groupIndex),
            handler: accessor => {
                const editorGroupsService = accessor.get(IEditorGroupsService);
                const configurationService = accessor.get(IConfigurationService);
                if (groupIndex > editorGroupsService.count) {
                    return;
                }
                const groups = editorGroupsService.getGroups(2);
                if (groups[groupIndex]) {
                    return groups[groupIndex].focus();
                }
                const direction = preferredSideBySideGroupDirection(configurationService);
                const lastGroup = editorGroupsService.findGroup({ location: 1 });
                if (!lastGroup) {
                    return;
                }
                const newGroup = editorGroupsService.addGroup(lastGroup, direction);
                newGroup.focus();
            }
        });
    }
    function toCommandId(index) {
        switch (index) {
            case 1: return 'workbench.action.focusSecondEditorGroup';
            case 2: return 'workbench.action.focusThirdEditorGroup';
            case 3: return 'workbench.action.focusFourthEditorGroup';
            case 4: return 'workbench.action.focusFifthEditorGroup';
            case 5: return 'workbench.action.focusSixthEditorGroup';
            case 6: return 'workbench.action.focusSeventhEditorGroup';
            case 7: return 'workbench.action.focusEighthEditorGroup';
        }
        throw new Error('Invalid index');
    }
    function toKeyCode(index) {
        switch (index) {
            case 1: return 23;
            case 2: return 24;
            case 3: return 25;
            case 4: return 26;
            case 5: return 27;
            case 6: return 28;
            case 7: return 29;
        }
        throw new Error('Invalid index');
    }
}
export function splitEditor(editorGroupsService, direction, resolvedContext) {
    if (!resolvedContext.groupedEditors.length) {
        return;
    }
    const { group, editors } = resolvedContext.groupedEditors[0];
    const preserveFocus = resolvedContext.preserveFocus;
    const newGroup = editorGroupsService.addGroup(group, direction);
    for (const editorToCopy of editors) {
        if (editorToCopy && !editorToCopy.hasCapability(8)) {
            group.copyEditor(editorToCopy, newGroup, { preserveFocus });
        }
    }
    newGroup.focus();
}
function registerSplitEditorCommands() {
    [
        { id: SPLIT_EDITOR_UP, direction: 0 },
        { id: SPLIT_EDITOR_DOWN, direction: 1 },
        { id: SPLIT_EDITOR_LEFT, direction: 2 },
        { id: SPLIT_EDITOR_RIGHT, direction: 3 }
    ].forEach(({ id, direction }) => {
        CommandsRegistry.registerCommand(id, function (accessor, ...args) {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            splitEditor(accessor.get(IEditorGroupsService), direction, resolvedContext);
        });
    });
}
function registerCloseEditorCommands() {
    function closeEditorHandler(accessor, forceCloseStickyEditors, ...args) {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const editorService = accessor.get(IEditorService);
        let keepStickyEditors = undefined;
        if (forceCloseStickyEditors) {
            keepStickyEditors = false;
        }
        else if (args.length) {
            keepStickyEditors = false;
        }
        else {
            keepStickyEditors = editorGroupsService.partOptions.preventPinnedEditorClose === 'keyboard' || editorGroupsService.partOptions.preventPinnedEditorClose === 'keyboardAndMouse';
        }
        if (keepStickyEditors) {
            const activeGroup = editorGroupsService.activeGroup;
            const activeEditor = activeGroup.activeEditor;
            if (activeEditor && activeGroup.isSticky(activeEditor)) {
                const nextNonStickyEditorInGroup = activeGroup.getEditors(0, { excludeSticky: true })[0];
                if (nextNonStickyEditorInGroup) {
                    return activeGroup.openEditor(nextNonStickyEditorInGroup);
                }
                const nextNonStickyEditorInAllGroups = editorService.getEditors(0, { excludeSticky: true })[0];
                if (nextNonStickyEditorInAllGroups) {
                    return Promise.resolve(editorGroupsService.getGroup(nextNonStickyEditorInAllGroups.groupId)?.openEditor(nextNonStickyEditorInAllGroups.editor));
                }
            }
        }
        const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
        const preserveFocus = resolvedContext.preserveFocus;
        return Promise.all(resolvedContext.groupedEditors.map(async ({ group, editors }) => {
            const editorsToClose = editors.filter(editor => !keepStickyEditors || !group.isSticky(editor));
            await group.closeEditors(editorsToClose, { preserveFocus });
        }));
    }
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_EDITOR_COMMAND_ID,
        weight: 200,
        when: undefined,
        primary: 2048 | 53,
        win: { primary: 2048 | 62, secondary: [2048 | 53] },
        handler: (accessor, ...args) => {
            return closeEditorHandler(accessor, false, ...args);
        }
    });
    CommandsRegistry.registerCommand(CLOSE_PINNED_EDITOR_COMMAND_ID, (accessor, ...args) => {
        return closeEditorHandler(accessor, true, ...args);
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
        weight: 200,
        when: undefined,
        primary: KeyChord(2048 | 41, 53),
        handler: (accessor, ...args) => {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            return Promise.all(resolvedContext.groupedEditors.map(async ({ group }) => {
                await group.closeAllEditors({ excludeSticky: true });
            }));
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_EDITOR_GROUP_COMMAND_ID,
        weight: 200,
        when: ContextKeyExpr.and(ActiveEditorGroupEmptyContext, MultipleEditorGroupsContext),
        primary: 2048 | 53,
        win: { primary: 2048 | 62, secondary: [2048 | 53] },
        handler: (accessor, ...args) => {
            const editorGroupsService = accessor.get(IEditorGroupsService);
            const commandsContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
            if (commandsContext.groupedEditors.length) {
                editorGroupsService.removeGroup(commandsContext.groupedEditors[0].group);
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_SAVED_EDITORS_COMMAND_ID,
        weight: 200,
        when: undefined,
        primary: KeyChord(2048 | 41, 51),
        handler: (accessor, ...args) => {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            return Promise.all(resolvedContext.groupedEditors.map(async ({ group }) => {
                await group.closeEditors({ savedOnly: true, excludeSticky: true }, { preserveFocus: resolvedContext.preserveFocus });
            }));
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
        weight: 200,
        when: undefined,
        primary: undefined,
        mac: { primary: 2048 | 512 | 50 },
        handler: (accessor, ...args) => {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            return Promise.all(resolvedContext.groupedEditors.map(async ({ group, editors }) => {
                const editorsToClose = group.getEditors(1, { excludeSticky: true }).filter(editor => !editors.includes(editor));
                for (const editorToKeep of editors) {
                    if (editorToKeep) {
                        group.pinEditor(editorToKeep);
                    }
                }
                await group.closeEditors(editorsToClose, { preserveFocus: resolvedContext.preserveFocus });
            }));
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,
        weight: 200,
        when: undefined,
        primary: undefined,
        handler: async (accessor, ...args) => {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            if (resolvedContext.groupedEditors.length) {
                const { group, editors } = resolvedContext.groupedEditors[0];
                if (group.activeEditor) {
                    group.pinEditor(group.activeEditor);
                }
                await group.closeEditors({ direction: 1, except: editors[0], excludeSticky: true }, { preserveFocus: resolvedContext.preserveFocus });
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: REOPEN_WITH_COMMAND_ID,
        weight: 200,
        when: undefined,
        primary: undefined,
        handler: async (accessor, ...args) => {
            const editorService = accessor.get(IEditorService);
            const editorResolverService = accessor.get(IEditorResolverService);
            const telemetryService = accessor.get(ITelemetryService);
            const resolvedContext = resolveCommandsContext(args, editorService, accessor.get(IEditorGroupsService), accessor.get(IListService));
            const editorReplacements = new Map();
            for (const { group, editors } of resolvedContext.groupedEditors) {
                for (const editor of editors) {
                    const untypedEditor = editor.toUntyped();
                    if (!untypedEditor) {
                        return;
                    }
                    untypedEditor.options = { ...editorService.activeEditorPane?.options, override: EditorResolution.PICK };
                    const resolvedEditor = await editorResolverService.resolveEditor(untypedEditor, group);
                    if (!isEditorInputWithOptionsAndGroup(resolvedEditor)) {
                        return;
                    }
                    let editorReplacementsInGroup = editorReplacements.get(group);
                    if (!editorReplacementsInGroup) {
                        editorReplacementsInGroup = [];
                        editorReplacements.set(group, editorReplacementsInGroup);
                    }
                    editorReplacementsInGroup.push({
                        editor: editor,
                        replacement: resolvedEditor.editor,
                        forceReplaceDirty: editor.resource?.scheme === Schemas.untitled,
                        options: resolvedEditor.options
                    });
                    telemetryService.publicLog2('workbenchEditorReopen', {
                        scheme: editor.resource?.scheme ?? '',
                        ext: editor.resource ? extname(editor.resource) : '',
                        from: editor.editorId ?? '',
                        to: resolvedEditor.editor.editorId ?? ''
                    });
                }
            }
            for (const [group, replacements] of editorReplacements) {
                await group.replaceEditors(replacements);
                await group.openEditor(replacements[0].replacement);
            }
        }
    });
    CommandsRegistry.registerCommand(CLOSE_EDITORS_AND_GROUP_COMMAND_ID, async (accessor, ...args) => {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
        if (resolvedContext.groupedEditors.length) {
            const { group } = resolvedContext.groupedEditors[0];
            await group.closeAllEditors();
            if (group.count === 0 && editorGroupsService.getGroup(group.id)) {
                editorGroupsService.removeGroup(group);
            }
        }
    });
}
function registerFocusEditorGroupWihoutWrapCommands() {
    const commands = [
        {
            id: FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID,
            direction: 2
        },
        {
            id: FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID,
            direction: 3
        },
        {
            id: FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID,
            direction: 0,
        },
        {
            id: FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID,
            direction: 1
        }
    ];
    for (const command of commands) {
        CommandsRegistry.registerCommand(command.id, async (accessor) => {
            const editorGroupsService = accessor.get(IEditorGroupsService);
            const group = editorGroupsService.findGroup({ direction: command.direction }, editorGroupsService.activeGroup, false);
            group?.focus();
        });
    }
}
function registerSplitEditorInGroupCommands() {
    async function splitEditorInGroup(accessor, resolvedContext) {
        const instantiationService = accessor.get(IInstantiationService);
        if (!resolvedContext.groupedEditors.length) {
            return;
        }
        const { group, editors } = resolvedContext.groupedEditors[0];
        const editor = editors[0];
        if (!editor) {
            return;
        }
        await group.replaceEditors([{
                editor,
                replacement: instantiationService.createInstance(SideBySideEditorInput, undefined, undefined, editor, editor),
                forceReplaceDirty: true
            }]);
    }
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: SPLIT_EDITOR_IN_GROUP,
                title: localize2('splitEditorInGroup', 'Split Editor in Group'),
                category: Categories.View,
                precondition: ActiveEditorCanSplitInGroupContext,
                f1: true,
                keybinding: {
                    weight: 200,
                    when: ActiveEditorCanSplitInGroupContext,
                    primary: KeyChord(2048 | 41, 2048 | 1024 | 93)
                }
            });
        }
        run(accessor, ...args) {
            return splitEditorInGroup(accessor, resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService)));
        }
    });
    async function joinEditorInGroup(resolvedContext) {
        if (!resolvedContext.groupedEditors.length) {
            return;
        }
        const { group, editors } = resolvedContext.groupedEditors[0];
        const editor = editors[0];
        if (!editor) {
            return;
        }
        if (!(editor instanceof SideBySideEditorInput)) {
            return;
        }
        let options = undefined;
        const activeEditorPane = group.activeEditorPane;
        if (activeEditorPane instanceof SideBySideEditor && group.activeEditor === editor) {
            for (const pane of [activeEditorPane.getPrimaryEditorPane(), activeEditorPane.getSecondaryEditorPane()]) {
                if (pane?.hasFocus()) {
                    options = { viewState: pane.getViewState() };
                    break;
                }
            }
        }
        await group.replaceEditors([{
                editor,
                replacement: editor.primary,
                options
            }]);
    }
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: JOIN_EDITOR_IN_GROUP,
                title: localize2('joinEditorInGroup', 'Join Editor in Group'),
                category: Categories.View,
                precondition: SideBySideEditorActiveContext,
                f1: true,
                keybinding: {
                    weight: 200,
                    when: SideBySideEditorActiveContext,
                    primary: KeyChord(2048 | 41, 2048 | 1024 | 93)
                }
            });
        }
        run(accessor, ...args) {
            return joinEditorInGroup(resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService)));
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: TOGGLE_SPLIT_EDITOR_IN_GROUP,
                title: localize2('toggleJoinEditorInGroup', 'Toggle Split Editor in Group'),
                category: Categories.View,
                precondition: ContextKeyExpr.or(ActiveEditorCanSplitInGroupContext, SideBySideEditorActiveContext),
                f1: true
            });
        }
        async run(accessor, ...args) {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            if (!resolvedContext.groupedEditors.length) {
                return;
            }
            const { editors } = resolvedContext.groupedEditors[0];
            if (editors[0] instanceof SideBySideEditorInput) {
                await joinEditorInGroup(resolvedContext);
            }
            else if (editors[0]) {
                await splitEditorInGroup(accessor, resolvedContext);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
                title: localize2('toggleSplitEditorInGroupLayout', 'Toggle Layout of Split Editor in Group'),
                category: Categories.View,
                precondition: SideBySideEditorActiveContext,
                f1: true
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(IConfigurationService);
            const currentSetting = configurationService.getValue(SideBySideEditor.SIDE_BY_SIDE_LAYOUT_SETTING);
            let newSetting;
            if (currentSetting !== 'horizontal') {
                newSetting = 'horizontal';
            }
            else {
                newSetting = 'vertical';
            }
            return configurationService.updateValue(SideBySideEditor.SIDE_BY_SIDE_LAYOUT_SETTING, newSetting);
        }
    });
}
function registerFocusSideEditorsCommands() {
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: FOCUS_FIRST_SIDE_EDITOR,
                title: localize2('focusLeftSideEditor', 'Focus First Side in Active Editor'),
                category: Categories.View,
                precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(IEditorService);
            const commandService = accessor.get(ICommandService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof SideBySideEditor) {
                activeEditorPane.getSecondaryEditorPane()?.focus();
            }
            else if (activeEditorPane instanceof TextDiffEditor) {
                await commandService.executeCommand(DIFF_FOCUS_SECONDARY_SIDE);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: FOCUS_SECOND_SIDE_EDITOR,
                title: localize2('focusRightSideEditor', 'Focus Second Side in Active Editor'),
                category: Categories.View,
                precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(IEditorService);
            const commandService = accessor.get(ICommandService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof SideBySideEditor) {
                activeEditorPane.getPrimaryEditorPane()?.focus();
            }
            else if (activeEditorPane instanceof TextDiffEditor) {
                await commandService.executeCommand(DIFF_FOCUS_PRIMARY_SIDE);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: FOCUS_OTHER_SIDE_EDITOR,
                title: localize2('focusOtherSideEditor', 'Focus Other Side in Active Editor'),
                category: Categories.View,
                precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(IEditorService);
            const commandService = accessor.get(ICommandService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof SideBySideEditor) {
                if (activeEditorPane.getPrimaryEditorPane()?.hasFocus()) {
                    activeEditorPane.getSecondaryEditorPane()?.focus();
                }
                else {
                    activeEditorPane.getPrimaryEditorPane()?.focus();
                }
            }
            else if (activeEditorPane instanceof TextDiffEditor) {
                await commandService.executeCommand(DIFF_FOCUS_OTHER_SIDE);
            }
        }
    });
}
function registerOtherEditorCommands() {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: KEEP_EDITOR_COMMAND_ID,
        weight: 200,
        when: undefined,
        primary: KeyChord(2048 | 41, 3),
        handler: async (accessor, ...args) => {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            for (const { group, editors } of resolvedContext.groupedEditors) {
                for (const editor of editors) {
                    group.pinEditor(editor);
                }
            }
        }
    });
    CommandsRegistry.registerCommand({
        id: TOGGLE_KEEP_EDITORS_COMMAND_ID,
        handler: accessor => {
            const configurationService = accessor.get(IConfigurationService);
            const currentSetting = configurationService.getValue('workbench.editor.enablePreview');
            const newSetting = currentSetting === true ? false : true;
            configurationService.updateValue('workbench.editor.enablePreview', newSetting);
        }
    });
    function setEditorGroupLock(accessor, locked, ...args) {
        const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
        const group = resolvedContext.groupedEditors[0]?.group;
        group?.lock(locked ?? !group.isLocked);
    }
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: TOGGLE_LOCK_GROUP_COMMAND_ID,
                title: localize2('toggleEditorGroupLock', 'Toggle Editor Group Lock'),
                category: Categories.View,
                f1: true
            });
        }
        async run(accessor, ...args) {
            setEditorGroupLock(accessor, undefined, ...args);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: LOCK_GROUP_COMMAND_ID,
                title: localize2('lockEditorGroup', 'Lock Editor Group'),
                category: Categories.View,
                precondition: ActiveEditorGroupLockedContext.toNegated(),
                f1: true
            });
        }
        async run(accessor, ...args) {
            setEditorGroupLock(accessor, true, ...args);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: UNLOCK_GROUP_COMMAND_ID,
                title: localize2('unlockEditorGroup', 'Unlock Editor Group'),
                precondition: ActiveEditorGroupLockedContext,
                category: Categories.View,
                f1: true
            });
        }
        async run(accessor, ...args) {
            setEditorGroupLock(accessor, false, ...args);
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: PIN_EDITOR_COMMAND_ID,
        weight: 200,
        when: ActiveEditorStickyContext.toNegated(),
        primary: KeyChord(2048 | 41, 1024 | 3),
        handler: async (accessor, ...args) => {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            for (const { group, editors } of resolvedContext.groupedEditors) {
                for (const editor of editors) {
                    group.stickEditor(editor);
                }
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DIFF_OPEN_SIDE,
        weight: 200,
        when: EditorContextKeys.inDiffEditor,
        primary: KeyChord(2048 | 41, 1024 | 45),
        handler: async (accessor) => {
            const editorService = accessor.get(IEditorService);
            const editorGroupsService = accessor.get(IEditorGroupsService);
            const activeEditor = editorService.activeEditor;
            const activeTextEditorControl = editorService.activeTextEditorControl;
            if (!isDiffEditor(activeTextEditorControl) || !(activeEditor instanceof DiffEditorInput)) {
                return;
            }
            let editor;
            const originalEditor = activeTextEditorControl.getOriginalEditor();
            if (originalEditor.hasTextFocus()) {
                editor = activeEditor.original;
            }
            else {
                editor = activeEditor.modified;
            }
            return editorGroupsService.activeGroup.openEditor(editor);
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: UNPIN_EDITOR_COMMAND_ID,
        weight: 200,
        when: ActiveEditorStickyContext,
        primary: KeyChord(2048 | 41, 1024 | 3),
        handler: async (accessor, ...args) => {
            const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
            for (const { group, editors } of resolvedContext.groupedEditors) {
                for (const editor of editors) {
                    group.unstickEditor(editor);
                }
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: SHOW_EDITORS_IN_GROUP,
        weight: 200,
        when: undefined,
        primary: undefined,
        handler: (accessor, ...args) => {
            const editorGroupsService = accessor.get(IEditorGroupsService);
            const quickInputService = accessor.get(IQuickInputService);
            const commandsContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
            const group = commandsContext.groupedEditors[0]?.group;
            if (group) {
                editorGroupsService.activateGroup(group);
            }
            return quickInputService.quickAccess.show(ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
        }
    });
}
export function setup() {
    registerActiveEditorMoveCopyCommand();
    registerEditorGroupsLayoutCommands();
    registerDiffEditorCommands();
    registerOpenEditorAPICommands();
    registerOpenEditorAtIndexCommands();
    registerCloseEditorCommands();
    registerOtherEditorCommands();
    registerSplitEditorInGroupCommands();
    registerFocusSideEditorsCommands();
    registerFocusEditorGroupAtIndexCommands();
    registerSplitEditorCommands();
    registerFocusEditorGroupWihoutWrapCommands();
}
