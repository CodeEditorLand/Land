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
                group: "1_create",
                command: {
                    id: "workbench.action.terminal.new",
                    title: localize({ key: 'miNewTerminal', comment: ['&& denotes a mnemonic'] }, "&&New Terminal")
                },
                order: 1
            }
        },
        {
            id: MenuId.MenubarTerminalMenu,
            item: {
                group: "1_create",
                command: {
                    id: "workbench.action.terminal.split",
                    title: localize({ key: 'miSplitTerminal', comment: ['&& denotes a mnemonic'] }, "&&Split Terminal"),
                    precondition: ContextKeyExpr.has("terminalIsOpen")
                },
                order: 2,
                when: TerminalContextKeys.processSupported
            }
        },
        {
            id: MenuId.MenubarTerminalMenu,
            item: {
                group: "3_run",
                command: {
                    id: "workbench.action.terminal.runActiveFile",
                    title: localize({ key: 'miRunActiveFile', comment: ['&& denotes a mnemonic'] }, "Run &&Active File")
                },
                order: 3,
                when: TerminalContextKeys.processSupported
            }
        },
        {
            id: MenuId.MenubarTerminalMenu,
            item: {
                group: "3_run",
                command: {
                    id: "workbench.action.terminal.runSelectedText",
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
                group: "1_create",
                command: {
                    id: "workbench.action.terminal.split",
                    title: terminalStrings.split.value
                }
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.new",
                    title: terminalStrings.new
                },
                group: "1_create"
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.killViewOrEditor",
                    title: terminalStrings.kill.value,
                },
                group: "7_kill"
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.copySelection",
                    title: localize('workbench.action.terminal.copySelection.short', "Copy")
                },
                group: "3_edit",
                order: 1
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.copySelectionAsHtml",
                    title: localize('workbench.action.terminal.copySelectionAsHtml', "Copy as HTML")
                },
                group: "3_edit",
                order: 2
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.paste",
                    title: localize('workbench.action.terminal.paste.short', "Paste")
                },
                group: "3_edit",
                order: 3
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.clear",
                    title: localize('workbench.action.terminal.clear', "Clear")
                },
                group: "5_clear",
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.sizeToContentWidth",
                    title: terminalStrings.toggleSizeToContentWidth
                },
                group: "9_config"
            }
        },
        {
            id: MenuId.TerminalInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.selectAll",
                    title: localize('workbench.action.terminal.selectAll', "Select All"),
                },
                group: "3_edit",
                order: 3
            }
        },
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                group: "1_create",
                command: {
                    id: "workbench.action.terminal.split",
                    title: terminalStrings.split.value
                }
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.new",
                    title: terminalStrings.new
                },
                group: "1_create"
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.killEditor",
                    title: terminalStrings.kill.value
                },
                group: "7_kill"
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.copySelection",
                    title: localize('workbench.action.terminal.copySelection.short', "Copy")
                },
                group: "3_edit",
                order: 1
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.copySelectionAsHtml",
                    title: localize('workbench.action.terminal.copySelectionAsHtml', "Copy as HTML")
                },
                group: "3_edit",
                order: 2
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.paste",
                    title: localize('workbench.action.terminal.paste.short', "Paste")
                },
                group: "3_edit",
                order: 3
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.clear",
                    title: localize('workbench.action.terminal.clear', "Clear")
                },
                group: "5_clear",
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.selectAll",
                    title: localize('workbench.action.terminal.selectAll', "Select All"),
                },
                group: "3_edit",
                order: 3
            }
        },
        {
            id: MenuId.TerminalEditorInstanceContext,
            item: {
                command: {
                    id: "workbench.action.terminal.sizeToContentWidth",
                    title: terminalStrings.toggleSizeToContentWidth
                },
                group: "9_config"
            }
        }
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.TerminalTabEmptyAreaContext,
            item: {
                command: {
                    id: "workbench.action.terminal.newWithProfile",
                    title: localize('workbench.action.terminal.newWithProfile.short', "New Terminal With Profile...")
                },
                group: "1_create"
            }
        },
        {
            id: MenuId.TerminalTabEmptyAreaContext,
            item: {
                command: {
                    id: "workbench.action.terminal.new",
                    title: terminalStrings.new
                },
                group: "1_create"
            }
        }
    ]);
    MenuRegistry.appendMenuItems([
        {
            id: MenuId.TerminalNewDropdownContext,
            item: {
                command: {
                    id: "workbench.action.terminal.selectDefaultShell",
                    title: localize2('workbench.action.terminal.selectDefaultProfile', 'Select Default Profile'),
                },
                group: '3_configure'
            }
        },
        {
            id: MenuId.TerminalNewDropdownContext,
            item: {
                command: {
                    id: "workbench.action.terminal.openSettings",
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
                    id: "workbench.action.terminal.switchTerminal",
                    title: localize2('workbench.action.terminal.switchTerminal', 'Switch Terminal')
                },
                group: 'navigation',
                order: 0,
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', TERMINAL_VIEW_ID), ContextKeyExpr.not(`config.${"terminal.integrated.tabs.enabled"}`)),
            }
        },
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.focus",
                    title: terminalStrings.focus
                },
                alt: {
                    id: "workbench.action.terminal.split",
                    title: terminalStrings.split.value,
                    icon: Codicon.splitHorizontal
                },
                group: 'navigation',
                order: 0,
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', TERMINAL_VIEW_ID), ContextKeyExpr.has(`config.${"terminal.integrated.tabs.enabled"}`), ContextKeyExpr.or(ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal"}`, 'singleTerminal'), ContextKeyExpr.equals("terminalGroupCount", 1)), ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal"}`, 'singleTerminalOrNarrow'), ContextKeyExpr.or(ContextKeyExpr.equals("terminalGroupCount", 1), ContextKeyExpr.has("isTerminalTabsNarrow"))), ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal"}`, 'singleGroup'), ContextKeyExpr.equals("terminalGroupCount", 1)), ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal"}`, 'always'))),
            }
        },
        {
            id: MenuId.ViewTitle,
            item: {
                command: {
                    id: "workbench.action.terminal.split",
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
                    id: "workbench.action.terminal.kill",
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
                    id: "workbench.action.terminal.new",
                    title: terminalStrings.new,
                    icon: Codicon.plus
                },
                alt: {
                    id: "workbench.action.terminal.split",
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
                    id: "workbench.action.terminal.clear",
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
                    id: "workbench.action.terminal.runActiveFile",
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
                    id: "workbench.action.terminal.runSelectedText",
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
                    id: "workbench.action.terminal.splitActiveTab",
                    title: terminalStrings.split.value,
                },
                group: "1_create",
                order: 1
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.moveToEditor",
                    title: terminalStrings.moveToEditor.value
                },
                group: "1_create",
                order: 2
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.moveIntoNewWindow",
                    title: terminalStrings.moveIntoNewWindow.value
                },
                group: "1_create",
                order: 2
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.renameActiveTab",
                    title: localize('workbench.action.terminal.renameInstance', "Rename...")
                },
                group: "3_edit"
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.changeIconActiveTab",
                    title: localize('workbench.action.terminal.changeIcon', "Change Icon...")
                },
                group: "3_edit"
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.changeColorActiveTab",
                    title: localize('workbench.action.terminal.changeColor', "Change Color...")
                },
                group: "3_edit"
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.sizeToContentWidth",
                    title: terminalStrings.toggleSizeToContentWidth
                },
                group: "3_edit"
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.joinActiveTab",
                    title: localize('workbench.action.terminal.joinInstance', "Join Terminals")
                },
                when: TerminalContextKeys.tabsSingularSelection.toNegated(),
                group: "9_config"
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.unsplit",
                    title: terminalStrings.unsplit.value
                },
                when: ContextKeyExpr.and(TerminalContextKeys.tabsSingularSelection, TerminalContextKeys.splitTerminal),
                group: "9_config"
            }
        },
        {
            id: MenuId.TerminalTabContext,
            item: {
                command: {
                    id: "workbench.action.terminal.killActiveTab",
                    title: terminalStrings.kill.value
                },
                group: "7_kill",
            }
        }
    ]);
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.moveToTerminalPanel",
            title: terminalStrings.moveToTerminalPanel
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.rename",
            title: terminalStrings.rename
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.changeColor",
            title: terminalStrings.changeColor
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.changeIcon",
            title: terminalStrings.changeIcon
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
        command: {
            id: "workbench.action.terminal.sizeToContentWidth",
            title: terminalStrings.toggleSizeToContentWidth
        },
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        group: '2_files'
    });
    MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
        command: {
            id: "workbench.action.createTerminalEditorSameGroup",
            title: terminalStrings.new,
            icon: Codicon.plus
        },
        alt: {
            id: "workbench.action.terminal.split",
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
        dropdownActions.push(new Action("workbench.action.terminal.newWithProfile", isDefault ? localize('defaultTerminalProfile', "{0} (Default)", sanitizedProfileName) : sanitizedProfileName, undefined, true, async () => {
            const instance = await terminalService.createTerminal(options);
            terminalService.setActiveInstance(instance);
            await terminalService.focusActiveInstance();
        }));
        submenuActions.push(new Action("workbench.action.terminal.split", isDefault ? localize('defaultTerminalProfile', "{0} (Default)", sanitizedProfileName) : sanitizedProfileName, undefined, true, async () => {
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
