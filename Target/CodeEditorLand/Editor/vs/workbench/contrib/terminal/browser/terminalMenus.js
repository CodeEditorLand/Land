/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Action, Separator, SubmenuAction } from '../../../../base/common/actions.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Schemas } from '../../../../base/common/network.js';
import { localize, localize2 } from '../../../../nls.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { TerminalLocation } from '../../../../platform/terminal/common/terminal.js';
import { ResourceContextKey } from '../../../common/contextkeys.js';
import { TaskExecutionSupportedContext } from '../../tasks/common/taskService.js';
import { TERMINAL_VIEW_ID } from '../common/terminal.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
import { terminalStrings } from '../common/terminalStrings.js';
import { ACTIVE_GROUP, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
export function setupTerminalMenus() {
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.MenubarTerminalMenu,
            item: {
                group: "1_create" /* TerminalMenuBarGroup.Create */,
                command: {
                    id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                    title: localize({ key: 'miNewTerminal', comment: ['&& denotes a mnemonic'] }, "&&New Terminal")
                },
                order: 1
            }
        },
        {
            id: MenuId.MenubarTerminalMenu,
            item: {
                group: "1_create" /* TerminalMenuBarGroup.Create */,
                command: {
                    id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                    title: localize({ key: 'miSplitTerminal', comment: ['&& denotes a mnemonic'] }, "&&Split Terminal"),
                    precondition: ContextKeyExpr.has("terminalIsOpen" /* TerminalContextKeyStrings.IsOpen */)
                },
                order: 2,
                when: TerminalContextKeys.processSupported
            }
        },
        {
            id: MenuId.MenubarTerminalMenu,
            item: {
                group: "3_run" /* TerminalMenuBarGroup.Run */,
                command: {
                    id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
                    title: localize({ key: 'miRunActiveFile', comment: ['&& denotes a mnemonic'] }, "Run &&Active File")
                },
                order: 3,
                when: TerminalContextKeys.processSupported
            }
        },
        {
            id: MenuId.MenubarTerminalMenu,
            item: {
                group: "3_run" /* TerminalMenuBarGroup.Run */,
                command: {
                    id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
                    title: localize({ key: 'miRunSelectedText', comment: ['&& denotes a mnemonic'] }, "Run &&Selected Text")
                },
                order: 4,
                when: TerminalContextKeys.processSupported
            }
        }
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                group: "1_create" /* ContextMenuGroup.Create */,
                command: {
                    id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                    title: terminalStrings.split.value
                }
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                    title: terminalStrings.new
                },
                group: "1_create" /* ContextMenuGroup.Create */
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.killViewOrEditor" /* TerminalCommandId.KillViewOrEditor */,
                    title: terminalStrings.kill.value,
                },
                group: "7_kill" /* ContextMenuGroup.Kill */
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                    title: localize('workbench.action.terminal.copySelection.short', "Copy")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */,
                order: 1
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                    title: localize('workbench.action.terminal.copySelectionAsHtml', "Copy as HTML")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */,
                order: 2
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                    title: localize('workbench.action.terminal.paste.short', "Paste")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */,
                order: 3
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                    title: localize('workbench.action.terminal.clear', "Clear")
                },
                group: "5_clear" /* ContextMenuGroup.Clear */,
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                    title: terminalStrings.toggleSizeToContentWidth
                },
                group: "9_config" /* ContextMenuGroup.Config */
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
                    title: localize('workbench.action.terminal.selectAll', "Select All"),
                },
                group: "3_edit" /* ContextMenuGroup.Edit */,
                order: 3
            }
        },
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                group: "1_create" /* ContextMenuGroup.Create */,
                command: {
                    id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                    title: terminalStrings.split.value
                }
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                    title: terminalStrings.new
                },
                group: "1_create" /* ContextMenuGroup.Create */
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
                    title: terminalStrings.kill.value
                },
                group: "7_kill" /* ContextMenuGroup.Kill */
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                    title: localize('workbench.action.terminal.copySelection.short', "Copy")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */,
                order: 1
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                    title: localize('workbench.action.terminal.copySelectionAsHtml', "Copy as HTML")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */,
                order: 2
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                    title: localize('workbench.action.terminal.paste.short', "Paste")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */,
                order: 3
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                    title: localize('workbench.action.terminal.clear', "Clear")
                },
                group: "5_clear" /* ContextMenuGroup.Clear */,
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
                    title: localize('workbench.action.terminal.selectAll', "Select All"),
                },
                group: "3_edit" /* ContextMenuGroup.Edit */,
                order: 3
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                    title: terminalStrings.toggleSizeToContentWidth
                },
                group: "9_config" /* ContextMenuGroup.Config */
            }
        }
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.TerminalTabEmptyAreaContext,
            item: {
                command: {
                    id: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                    title: localize('workbench.action.terminal.newWithProfile.short', "New Terminal With Profile...")
                },
                group: "1_create" /* ContextMenuGroup.Create */
            }
        },
        {
            id: MenuId.TerminalTabEmptyAreaContext,
            item: {
                command: {
                    id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                    title: terminalStrings.new
                },
                group: "1_create" /* ContextMenuGroup.Create */
            }
        }
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.TerminalNewDropdownContext,
            item: {
                command: {
                    id: "workbench.action.terminal.selectDefaultShell" /* TerminalCommandId.SelectDefaultProfile */,
                    title: localize2('workbench.action.terminal.selectDefaultProfile', 'Select Default Profile'),
                },
                group: '3_configure'
            }
        },
        {
            id: MenuId.TerminalNewDropdownContext,
            item: {
                command: {
                    id: "workbench.action.terminal.openSettings" /* TerminalCommandId.ConfigureTerminalSettings */,
                    title: localize('workbench.action.terminal.openSettings', "Configure Terminal Settings")
                },
                group: '3_configure'
            }
        },
        {
            id: MenuId.TerminalNewDropdownContext,
            item: {
                command: {
                    id: 'workbench.action.tasks.runTask',
                    title: localize('workbench.action.tasks.runTask', "Run Task...")
                },
                when: TaskExecutionSupportedContext,
                group: '4_tasks',
                order: 1
            },
        },
        {
            id: MenuId.TerminalNewDropdownContext,
            item: {
                command: {
                    id: 'workbench.action.tasks.configureTaskRunner',
                    title: localize('workbench.action.tasks.configureTaskRunner', "Configure Tasks...")
                },
                when: TaskExecutionSupportedContext,
                group: '4_tasks',
                order: 2
            },
        }
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */,
                    title: localize2('workbench.action.terminal.switchTerminal', 'Switch Terminal')
                },
                group: 'navigation',
                order: 0,
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', TERMINAL_VIEW_ID), ContextKeyExpr.not(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`)),
            }
        },
        {
            // This is used to show instead of tabs when there is only a single terminal
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
                    title: terminalStrings.focus
                },
                alt: {
                    id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                    title: terminalStrings.split.value,
                    icon: Codicon.splitHorizontal
                },
                group: 'navigation',
                order: 0,
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', TERMINAL_VIEW_ID), ContextKeyExpr.has(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`), ContextKeyExpr.or(ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleTerminal'), ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleTerminalOrNarrow'), ContextKeyExpr.or(ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1), ContextKeyExpr.has("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */))), ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'singleGroup'), ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */}`, 'always'))),
            }
        },
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                    title: terminalStrings.split,
                    icon: Codicon.splitHorizontal
                },
                group: 'navigation',
                order: 2,
                when: TerminalContextKeys.shouldShowViewInlineActions
            }
        },
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
                    title: terminalStrings.kill,
                    icon: Codicon.trash
                },
                group: 'navigation',
                order: 3,
                when: TerminalContextKeys.shouldShowViewInlineActions
            }
        },
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                    title: terminalStrings.new,
                    icon: Codicon.plus
                },
                alt: {
                    id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                    title: terminalStrings.split.value,
                    icon: Codicon.splitHorizontal
                },
                group: 'navigation',
                order: 0,
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', TERMINAL_VIEW_ID), ContextKeyExpr.or(TerminalContextKeys.webExtensionContributedProfile, TerminalContextKeys.processSupported))
            }
        },
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                    title: localize('workbench.action.terminal.clearLong', "Clear Terminal"),
                    icon: Codicon.clearAll
                },
                group: 'navigation',
                order: 4,
                when: ContextKeyExpr.equals('view', TERMINAL_VIEW_ID),
                isHiddenByDefault: true
            }
        },
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
                    title: localize('workbench.action.terminal.runActiveFile', "Run Active File"),
                    icon: Codicon.run
                },
                group: 'navigation',
                order: 5,
                when: ContextKeyExpr.equals('view', TERMINAL_VIEW_ID),
                isHiddenByDefault: true
            }
        },
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
                    title: localize('workbench.action.terminal.runSelectedText', "Run Selected Text"),
                    icon: Codicon.selection
                },
                group: 'navigation',
                order: 6,
                when: ContextKeyExpr.equals('view', TERMINAL_VIEW_ID),
                isHiddenByDefault: true
            }
        },
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.splitActiveTab" /* TerminalCommandId.SplitActiveTab */,
                    title: terminalStrings.split.value,
                },
                group: "1_create" /* ContextMenuGroup.Create */,
                order: 1
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.moveToEditor" /* TerminalCommandId.MoveToEditor */,
                    title: terminalStrings.moveToEditor.value
                },
                group: "1_create" /* ContextMenuGroup.Create */,
                order: 2
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.moveIntoNewWindow" /* TerminalCommandId.MoveIntoNewWindow */,
                    title: terminalStrings.moveIntoNewWindow.value
                },
                group: "1_create" /* ContextMenuGroup.Create */,
                order: 2
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.renameActiveTab" /* TerminalCommandId.RenameActiveTab */,
                    title: localize('workbench.action.terminal.renameInstance', "Rename...")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.changeIconActiveTab" /* TerminalCommandId.ChangeIconActiveTab */,
                    title: localize('workbench.action.terminal.changeIcon', "Change Icon...")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.changeColorActiveTab" /* TerminalCommandId.ChangeColorActiveTab */,
                    title: localize('workbench.action.terminal.changeColor', "Change Color...")
                },
                group: "3_edit" /* ContextMenuGroup.Edit */
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                    title: terminalStrings.toggleSizeToContentWidth
                },
                group: "3_edit" /* ContextMenuGroup.Edit */
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.joinActiveTab" /* TerminalCommandId.JoinActiveTab */,
                    title: localize('workbench.action.terminal.joinInstance', "Join Terminals")
                },
                when: TerminalContextKeys.tabsSingularSelection.toNegated(),
                group: "9_config" /* ContextMenuGroup.Config */
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.unsplit" /* TerminalCommandId.Unsplit */,
                    title: terminalStrings.unsplit.value
                },
                when: ContextKeyExpr.and(TerminalContextKeys.tabsSingularSelection, TerminalContextKeys.splitTerminal),
                group: "9_config" /* ContextMenuGroup.Config */
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.killActiveTab" /* TerminalCommandId.KillActiveTab */,
                    title: terminalStrings.kill.value
                },
                group: "7_kill" /* ContextMenuGroup.Kill */,
            }
        }
    ]);
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
            title: terminalStrings.moveToTerminalPanel
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.rename" /* TerminalCommandId.Rename */,
            title: terminalStrings.rename
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.changeColor" /* TerminalCommandId.ChangeColor */,
            title: terminalStrings.changeColor
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.changeIcon" /* TerminalCommandId.ChangeIcon */,
            title: terminalStrings.changeIcon
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
            title: terminalStrings.toggleSizeToContentWidth
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
        command: {
            id: "workbench.action.createTerminalEditorSameGroup" /* TerminalCommandId.CreateTerminalEditorSameGroup */,
            title: terminalStrings.new,
            icon: Codicon.plus
        },
        alt: {
            id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
            title: terminalStrings.split.value,
            icon: Codicon.splitHorizontal
        },
        group: 'navigation',
        order: 0,
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal)
    });
}
export function getTerminalActionBarArgs(location, profiles, defaultProfileName, contributedProfiles, terminalService, dropdownMenu) {
    let dropdownActions = [];
    let submenuActions = [];
    profiles = profiles.filter(e => !e.isAutoDetected);
    const splitLocation = (location === TerminalLocation.Editor || (typeof location === 'object' && 'viewColumn' in location && location.viewColumn === ACTIVE_GROUP)) ? { viewColumn: SIDE_GROUP } : { splitActiveTerminal: true };
    for (const p of profiles) {
        const isDefault = p.profileName === defaultProfileName;
        const options = { config: p, location };
        const splitOptions = { config: p, location: splitLocation };
        const sanitizedProfileName = p.profileName.replace(/[\n\r\t]/g, '');
        dropdownActions.push(new Action("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */, isDefault ? localize('defaultTerminalProfile', "{0} (Default)", sanitizedProfileName) : sanitizedProfileName, undefined, true, async () => {
            const instance = await terminalService.createTerminal(options);
            terminalService.setActiveInstance(instance);
            await terminalService.focusActiveInstance();
        }));
        submenuActions.push(new Action("workbench.action.terminal.split" /* TerminalCommandId.Split */, isDefault ? localize('defaultTerminalProfile', "{0} (Default)", sanitizedProfileName) : sanitizedProfileName, undefined, true, async () => {
            const instance = await terminalService.createTerminal(splitOptions);
            terminalService.setActiveInstance(instance);
            await terminalService.focusActiveInstance();
        }));
    }
    for (const contributed of contributedProfiles) {
        const isDefault = contributed.title === defaultProfileName;
        const title = isDefault ? localize('defaultTerminalProfile', "{0} (Default)", contributed.title.replace(/[\n\r\t]/g, '')) : contributed.title.replace(/[\n\r\t]/g, '');
        dropdownActions.push(new Action('contributed', title, undefined, true, () => terminalService.createTerminal({
            config: {
                extensionIdentifier: contributed.extensionIdentifier,
                id: contributed.id,
                title
            },
            location
        })));
        submenuActions.push(new Action('contributed-split', title, undefined, true, () => terminalService.createTerminal({
            config: {
                extensionIdentifier: contributed.extensionIdentifier,
                id: contributed.id,
                title
            },
            location: splitLocation
        })));
    }
    const defaultProfileAction = dropdownActions.find(d => d.label.endsWith('(Default)'));
    if (defaultProfileAction) {
        dropdownActions = dropdownActions.filter(d => d !== defaultProfileAction).sort((a, b) => a.label.localeCompare(b.label));
        dropdownActions.unshift(defaultProfileAction);
    }
    if (dropdownActions.length > 0) {
        dropdownActions.push(new SubmenuAction('split.profile', localize('splitTerminal', 'Split Terminal'), submenuActions));
        dropdownActions.push(new Separator());
    }
    const actions = dropdownMenu.getActions();
    dropdownActions.push(...Separator.join(...actions.map(a => a[1])));
    const defaultSubmenuProfileAction = submenuActions.find(d => d.label.endsWith('(Default)'));
    if (defaultSubmenuProfileAction) {
        submenuActions = submenuActions.filter(d => d !== defaultSubmenuProfileAction).sort((a, b) => a.label.localeCompare(b.label));
        submenuActions.unshift(defaultSubmenuProfileAction);
    }
    const dropdownAction = new Action('refresh profiles', localize('launchProfile', 'Launch Profile...'), 'codicon-chevron-down', true);
    return { dropdownAction, dropdownMenuActions: dropdownActions, className: `terminal-tab-actions-${terminalService.resolveLocation(location)}` };
}
