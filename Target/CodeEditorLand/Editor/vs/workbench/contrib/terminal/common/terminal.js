/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isLinux } from '../../../../base/common/platform.js';
import * as nls from '../../../../nls.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { defaultTerminalContribCommandsToSkipShell } from '../terminalContribExports.js';
export const TERMINAL_VIEW_ID = 'terminal';
export const TERMINAL_CREATION_COMMANDS = ['workbench.action.terminal.toggleTerminal', 'workbench.action.terminal.new', 'workbench.action.togglePanel', 'workbench.action.terminal.focus'];
export const TERMINAL_CONFIG_SECTION = 'terminal.integrated';
export const DEFAULT_LETTER_SPACING = 0;
export const MINIMUM_LETTER_SPACING = -5;
// HACK: On Linux it's common for fonts to include an underline that is rendered lower than the
// bottom of the cell which causes it to be cut off due to `overflow:hidden` in the DOM renderer.
// See:
// - https://github.com/microsoft/vscode/issues/211933
// - https://github.com/xtermjs/xterm.js/issues/4067
export const DEFAULT_LINE_HEIGHT = isLinux ? 1.1 : 1;
export const MINIMUM_FONT_WEIGHT = 1;
export const MAXIMUM_FONT_WEIGHT = 1000;
export const DEFAULT_FONT_WEIGHT = 'normal';
export const DEFAULT_BOLD_FONT_WEIGHT = 'bold';
export const SUGGESTIONS_FONT_WEIGHT = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
export const ITerminalProfileResolverService = createDecorator('terminalProfileResolverService');
/*
 * When there were shell integration args injected
 * and createProcess returns an error, this exit code will be used.
 */
export const ShellIntegrationExitCode = 633;
export const ITerminalProfileService = createDecorator('terminalProfileService');
export const isTerminalProcessManager = (t) => typeof t.write === 'function';
export const QUICK_LAUNCH_PROFILE_CHOICE = 'workbench.action.terminal.profile.choice';
export const DEFAULT_COMMANDS_TO_SKIP_SHELL = [
    "workbench.action.terminal.clearSelection" /* TerminalCommandId.ClearSelection */,
    "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
    "workbench.action.terminal.copyAndClearSelection" /* TerminalCommandId.CopyAndClearSelection */,
    "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
    "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
    "workbench.action.terminal.copyLastCommand" /* TerminalCommandId.CopyLastCommand */,
    "workbench.action.terminal.copyLastCommandOutput" /* TerminalCommandId.CopyLastCommandOutput */,
    "workbench.action.terminal.copyLastCommandAndLastCommandOutput" /* TerminalCommandId.CopyLastCommandAndLastCommandOutput */,
    "workbench.action.terminal.deleteToLineStart" /* TerminalCommandId.DeleteToLineStart */,
    "workbench.action.terminal.deleteWordLeft" /* TerminalCommandId.DeleteWordLeft */,
    "workbench.action.terminal.deleteWordRight" /* TerminalCommandId.DeleteWordRight */,
    "workbench.action.terminal.focusNextPane" /* TerminalCommandId.FocusNextPane */,
    "workbench.action.terminal.focusNext" /* TerminalCommandId.FocusNext */,
    "workbench.action.terminal.focusPreviousPane" /* TerminalCommandId.FocusPreviousPane */,
    "workbench.action.terminal.focusPrevious" /* TerminalCommandId.FocusPrevious */,
    "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
    "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
    "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
    "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
    "workbench.action.terminal.moveToEditor" /* TerminalCommandId.MoveToEditor */,
    "workbench.action.terminal.moveToLineEnd" /* TerminalCommandId.MoveToLineEnd */,
    "workbench.action.terminal.moveToLineStart" /* TerminalCommandId.MoveToLineStart */,
    "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
    "workbench.action.terminal.newInActiveWorkspace" /* TerminalCommandId.NewInActiveWorkspace */,
    "workbench.action.terminal.new" /* TerminalCommandId.New */,
    "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
    "workbench.action.terminal.pasteSelection" /* TerminalCommandId.PasteSelection */,
    "workbench.action.terminal.resizePaneDown" /* TerminalCommandId.ResizePaneDown */,
    "workbench.action.terminal.resizePaneLeft" /* TerminalCommandId.ResizePaneLeft */,
    "workbench.action.terminal.resizePaneRight" /* TerminalCommandId.ResizePaneRight */,
    "workbench.action.terminal.resizePaneUp" /* TerminalCommandId.ResizePaneUp */,
    "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
    "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
    "workbench.action.terminal.scrollDown" /* TerminalCommandId.ScrollDownLine */,
    "workbench.action.terminal.scrollDownPage" /* TerminalCommandId.ScrollDownPage */,
    "workbench.action.terminal.scrollToBottom" /* TerminalCommandId.ScrollToBottom */,
    "workbench.action.terminal.scrollToNextCommand" /* TerminalCommandId.ScrollToNextCommand */,
    "workbench.action.terminal.scrollToPreviousCommand" /* TerminalCommandId.ScrollToPreviousCommand */,
    "workbench.action.terminal.scrollToTop" /* TerminalCommandId.ScrollToTop */,
    "workbench.action.terminal.scrollUp" /* TerminalCommandId.ScrollUpLine */,
    "workbench.action.terminal.scrollUpPage" /* TerminalCommandId.ScrollUpPage */,
    "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
    "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
    "workbench.action.terminal.selectToNextCommand" /* TerminalCommandId.SelectToNextCommand */,
    "workbench.action.terminal.selectToNextLine" /* TerminalCommandId.SelectToNextLine */,
    "workbench.action.terminal.selectToPreviousCommand" /* TerminalCommandId.SelectToPreviousCommand */,
    "workbench.action.terminal.selectToPreviousLine" /* TerminalCommandId.SelectToPreviousLine */,
    "workbench.action.terminal.splitInActiveWorkspace" /* TerminalCommandId.SplitInActiveWorkspace */,
    "workbench.action.terminal.split" /* TerminalCommandId.Split */,
    "workbench.action.terminal.toggleTerminal" /* TerminalCommandId.Toggle */,
    "workbench.action.terminal.focusHover" /* TerminalCommandId.FocusHover */,
    "editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */,
    'editor.action.toggleTabFocusMode',
    'notifications.hideList',
    'notifications.hideToasts',
    'workbench.action.closeQuickOpen',
    'workbench.action.quickOpen',
    'workbench.action.quickOpenPreviousEditor',
    'workbench.action.showCommands',
    'workbench.action.tasks.build',
    'workbench.action.tasks.restartTask',
    'workbench.action.tasks.runTask',
    'workbench.action.tasks.reRunTask',
    'workbench.action.tasks.showLog',
    'workbench.action.tasks.showTasks',
    'workbench.action.tasks.terminate',
    'workbench.action.tasks.test',
    'workbench.action.toggleFullScreen',
    'workbench.action.terminal.focusAtIndex1',
    'workbench.action.terminal.focusAtIndex2',
    'workbench.action.terminal.focusAtIndex3',
    'workbench.action.terminal.focusAtIndex4',
    'workbench.action.terminal.focusAtIndex5',
    'workbench.action.terminal.focusAtIndex6',
    'workbench.action.terminal.focusAtIndex7',
    'workbench.action.terminal.focusAtIndex8',
    'workbench.action.terminal.focusAtIndex9',
    'workbench.action.focusSecondEditorGroup',
    'workbench.action.focusThirdEditorGroup',
    'workbench.action.focusFourthEditorGroup',
    'workbench.action.focusFifthEditorGroup',
    'workbench.action.focusSixthEditorGroup',
    'workbench.action.focusSeventhEditorGroup',
    'workbench.action.focusEighthEditorGroup',
    'workbench.action.focusNextPart',
    'workbench.action.focusPreviousPart',
    'workbench.action.nextPanelView',
    'workbench.action.previousPanelView',
    'workbench.action.nextSideBarView',
    'workbench.action.previousSideBarView',
    'workbench.action.debug.start',
    'workbench.action.debug.stop',
    'workbench.action.debug.run',
    'workbench.action.debug.restart',
    'workbench.action.debug.continue',
    'workbench.action.debug.pause',
    'workbench.action.debug.stepInto',
    'workbench.action.debug.stepOut',
    'workbench.action.debug.stepOver',
    'workbench.action.nextEditor',
    'workbench.action.previousEditor',
    'workbench.action.nextEditorInGroup',
    'workbench.action.previousEditorInGroup',
    'workbench.action.openNextRecentlyUsedEditor',
    'workbench.action.openPreviousRecentlyUsedEditor',
    'workbench.action.openNextRecentlyUsedEditorInGroup',
    'workbench.action.openPreviousRecentlyUsedEditorInGroup',
    'workbench.action.quickOpenPreviousRecentlyUsedEditor',
    'workbench.action.quickOpenLeastRecentlyUsedEditor',
    'workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup',
    'workbench.action.quickOpenLeastRecentlyUsedEditorInGroup',
    'workbench.action.focusActiveEditorGroup',
    'workbench.action.focusFirstEditorGroup',
    'workbench.action.focusLastEditorGroup',
    'workbench.action.firstEditorInGroup',
    'workbench.action.lastEditorInGroup',
    'workbench.action.navigateUp',
    'workbench.action.navigateDown',
    'workbench.action.navigateRight',
    'workbench.action.navigateLeft',
    'workbench.action.togglePanel',
    'workbench.action.quickOpenView',
    'workbench.action.toggleMaximizedPanel',
    'notification.acceptPrimaryAction',
    'runCommands',
    'workbench.action.terminal.chat.start',
    'workbench.action.terminal.chat.close',
    'workbench.action.terminal.chat.discard',
    'workbench.action.terminal.chat.makeRequest',
    'workbench.action.terminal.chat.cancel',
    'workbench.action.terminal.chat.feedbackHelpful',
    'workbench.action.terminal.chat.feedbackUnhelpful',
    'workbench.action.terminal.chat.feedbackReportIssue',
    'workbench.action.terminal.chat.runCommand',
    'workbench.action.terminal.chat.insertCommand',
    'workbench.action.terminal.chat.viewInChat',
    ...defaultTerminalContribCommandsToSkipShell,
];
export const terminalContributionsDescriptor = {
    extensionPoint: 'terminal',
    defaultExtensionKind: ['workspace'],
    activationEventsGenerator: (contribs, result) => {
        for (const contrib of contribs) {
            for (const profileContrib of (contrib.profiles ?? [])) {
                result.push(`onTerminalProfile:${profileContrib.id}`);
            }
        }
    },
    jsonSchema: {
        description: nls.localize('vscode.extension.contributes.terminal', 'Contributes terminal functionality.'),
        type: 'object',
        properties: {
            profiles: {
                type: 'array',
                description: nls.localize('vscode.extension.contributes.terminal.profiles', "Defines additional terminal profiles that the user can create."),
                items: {
                    type: 'object',
                    required: ['id', 'title'],
                    defaultSnippets: [{
                            body: {
                                id: '$1',
                                title: '$2'
                            }
                        }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.terminal.profiles.id', "The ID of the terminal profile provider."),
                            type: 'string',
                        },
                        title: {
                            description: nls.localize('vscode.extension.contributes.terminal.profiles.title', "Title for this terminal profile."),
                            type: 'string',
                        },
                        icon: {
                            description: nls.localize('vscode.extension.contributes.terminal.types.icon', "A codicon, URI, or light and dark URIs to associate with this terminal type."),
                            anyOf: [{
                                    type: 'string',
                                },
                                {
                                    type: 'object',
                                    properties: {
                                        light: {
                                            description: nls.localize('vscode.extension.contributes.terminal.types.icon.light', 'Icon path when a light theme is used'),
                                            type: 'string'
                                        },
                                        dark: {
                                            description: nls.localize('vscode.extension.contributes.terminal.types.icon.dark', 'Icon path when a dark theme is used'),
                                            type: 'string'
                                        }
                                    }
                                }]
                        },
                    },
                },
            },
        },
    },
};
