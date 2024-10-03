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
import { localize } from '../../../../nls.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { workbenchConfigurationNodeBase, Extensions as WorkbenchExtensions } from '../../../common/configuration.js';
import { AccessibilitySignal } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { ISpeechService, SPEECH_LANGUAGES } from '../../speech/common/speechService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { isDefined } from '../../../../base/common/types.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export const accessibilityHelpIsShown = new RawContextKey('accessibilityHelpIsShown', false, true);
export const accessibleViewIsShown = new RawContextKey('accessibleViewIsShown', false, true);
export const accessibleViewSupportsNavigation = new RawContextKey('accessibleViewSupportsNavigation', false, true);
export const accessibleViewVerbosityEnabled = new RawContextKey('accessibleViewVerbosityEnabled', false, true);
export const accessibleViewGoToSymbolSupported = new RawContextKey('accessibleViewGoToSymbolSupported', false, true);
export const accessibleViewOnLastLine = new RawContextKey('accessibleViewOnLastLine', false, true);
export const accessibleViewCurrentProviderId = new RawContextKey('accessibleViewCurrentProviderId', undefined, undefined);
export const accessibleViewInCodeBlock = new RawContextKey('accessibleViewInCodeBlock', undefined, undefined);
export const accessibleViewContainsCodeBlocks = new RawContextKey('accessibleViewContainsCodeBlocks', undefined, undefined);
export const accessibleViewHasUnassignedKeybindings = new RawContextKey('accessibleViewHasUnassignedKeybindings', undefined, undefined);
export const accessibleViewHasAssignedKeybindings = new RawContextKey('accessibleViewHasAssignedKeybindings', undefined, undefined);
const baseVerbosityProperty = {
    type: 'boolean',
    default: true,
    tags: ['accessibility']
};
export const accessibilityConfigurationNodeBase = Object.freeze({
    id: 'accessibility',
    title: localize('accessibilityConfigurationTitle', "Accessibility"),
    type: 'object'
});
export const soundFeatureBase = {
    'type': 'string',
    'enum': ['auto', 'on', 'off'],
    'default': 'auto',
    'enumDescriptions': [
        localize('sound.enabled.auto', "Enable sound when a screen reader is attached."),
        localize('sound.enabled.on', "Enable sound."),
        localize('sound.enabled.off', "Disable sound.")
    ],
    tags: ['accessibility'],
};
const signalFeatureBase = {
    'type': 'object',
    'tags': ['accessibility'],
    additionalProperties: false,
    default: {
        sound: 'auto',
        announcement: 'auto'
    }
};
export const announcementFeatureBase = {
    'type': 'string',
    'enum': ['auto', 'off'],
    'default': 'auto',
    'enumDescriptions': [
        localize('announcement.enabled.auto', "Enable announcement, will only play when in screen reader optimized mode."),
        localize('announcement.enabled.off', "Disable announcement.")
    ],
    tags: ['accessibility'],
};
const defaultNoAnnouncement = {
    'type': 'object',
    'tags': ['accessibility'],
    additionalProperties: false,
    'default': {
        'sound': 'auto',
    }
};
const configuration = {
    ...accessibilityConfigurationNodeBase,
    scope: 4,
    properties: {
        ["accessibility.verbosity.terminal"]: {
            description: localize('verbosity.terminal.description', 'Provide information about how to access the terminal accessibility help menu when the terminal is focused.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.diffEditor"]: {
            description: localize('verbosity.diffEditor.description', 'Provide information about how to navigate changes in the diff editor when it is focused.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.panelChat"]: {
            description: localize('verbosity.chat.description', 'Provide information about how to access the chat help menu when the chat input is focused.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.inlineChat"]: {
            description: localize('verbosity.interactiveEditor.description', 'Provide information about how to access the inline editor chat accessibility help menu and alert with hints that describe how to use the feature when the input is focused.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.inlineCompletions"]: {
            description: localize('verbosity.inlineCompletions.description', 'Provide information about how to access the inline completions hover and Accessible View.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.keybindingsEditor"]: {
            description: localize('verbosity.keybindingsEditor.description', 'Provide information about how to change a keybinding in the keybindings editor when a row is focused.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.notebook"]: {
            description: localize('verbosity.notebook', 'Provide information about how to focus the cell container or inner editor when a notebook cell is focused.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.hover"]: {
            description: localize('verbosity.hover', 'Provide information about how to open the hover in an Accessible View.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.notification"]: {
            description: localize('verbosity.notification', 'Provide information about how to open the notification in an Accessible View.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.emptyEditorHint"]: {
            description: localize('verbosity.emptyEditorHint', 'Provide information about relevant actions in an empty text editor.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.replInputHint"]: {
            description: localize('verbosity.replInputHint', 'Provide information about relevant actions For the Repl input.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.comments"]: {
            description: localize('verbosity.comments', 'Provide information about actions that can be taken in the comment widget or in a file which contains comments.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.diffEditorActive"]: {
            description: localize('verbosity.diffEditorActive', 'Indicate when a diff editor becomes the active editor.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.debug"]: {
            description: localize('verbosity.debug', 'Provide information about how to access the debug console accessibility help dialog when the debug console or run and debug viewlet is focused. Note that a reload of the window is required for this to take effect.'),
            ...baseVerbosityProperty
        },
        ["accessibility.verbosity.walkthrough"]: {
            description: localize('verbosity.walkthrough', 'Provide information about how to open the walkthrough in an Accessible View.'),
            ...baseVerbosityProperty
        },
        ["accessibility.accessibleView.closeOnKeyPress"]: {
            markdownDescription: localize('terminal.integrated.accessibleView.closeOnKeyPress', "On keypress, close the Accessible View and focus the element from which it was invoked."),
            type: 'boolean',
            default: true
        },
        'accessibility.signalOptions.volume': {
            'description': localize('accessibility.signalOptions.volume', "The volume of the sounds in percent (0-100)."),
            'type': 'number',
            'minimum': 0,
            'maximum': 100,
            'default': 70,
            'tags': ['accessibility']
        },
        'accessibility.signalOptions.debouncePositionChanges': {
            'description': localize('accessibility.signalOptions.debouncePositionChanges', "Whether or not position changes should be debounced"),
            'type': 'boolean',
            'default': false,
            'tags': ['accessibility']
        },
        'accessibility.signalOptions.experimental.delays.general': {
            'type': 'object',
            'description': 'Delays for all signals besides error and warning at position',
            'additionalProperties': false,
            'properties': {
                'announcement': {
                    'description': localize('accessibility.signalOptions.delays.general.announcement', "The delay in milliseconds before an announcement is made."),
                    'type': 'number',
                    'minimum': 0,
                    'default': 3000
                },
                'sound': {
                    'description': localize('accessibility.signalOptions.delays.general.sound', "The delay in milliseconds before a sound is played."),
                    'type': 'number',
                    'minimum': 0,
                    'default': 400
                }
            },
            'tags': ['accessibility']
        },
        'accessibility.signalOptions.experimental.delays.warningAtPosition': {
            'type': 'object',
            'additionalProperties': false,
            'properties': {
                'announcement': {
                    'description': localize('accessibility.signalOptions.delays.warningAtPosition.announcement', "The delay in milliseconds before an announcement is made when there's a warning at the position."),
                    'type': 'number',
                    'minimum': 0,
                    'default': 3000
                },
                'sound': {
                    'description': localize('accessibility.signalOptions.delays.warningAtPosition.sound', "The delay in milliseconds before a sound is played when there's a warning at the position."),
                    'type': 'number',
                    'minimum': 0,
                    'default': 1000
                }
            },
            'tags': ['accessibility']
        },
        'accessibility.signalOptions.experimental.delays.errorAtPosition': {
            'type': 'object',
            'additionalProperties': false,
            'properties': {
                'announcement': {
                    'description': localize('accessibility.signalOptions.delays.errorAtPosition.announcement', "The delay in milliseconds before an announcement is made when there's an error at the position."),
                    'type': 'number',
                    'minimum': 0,
                    'default': 3000
                },
                'sound': {
                    'description': localize('accessibility.signalOptions.delays.errorAtPosition.sound', "The delay in milliseconds before a sound is played when there's an error at the position."),
                    'type': 'number',
                    'minimum': 0,
                    'default': 1000
                }
            },
            'tags': ['accessibility']
        },
        'accessibility.signals.lineHasBreakpoint': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.lineHasBreakpoint', "Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has a breakpoint."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.lineHasBreakpoint.sound', "Plays a sound when the active line has a breakpoint."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.lineHasBreakpoint.announcement', "Announces when the active line has a breakpoint."),
                    ...announcementFeatureBase
                },
            },
        },
        'accessibility.signals.lineHasInlineSuggestion': {
            ...defaultNoAnnouncement,
            'description': localize('accessibility.signals.lineHasInlineSuggestion', "Plays a sound / audio cue when the active line has an inline suggestion."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.lineHasInlineSuggestion.sound', "Plays a sound when the active line has an inline suggestion."),
                    ...soundFeatureBase,
                    'default': 'off'
                }
            }
        },
        'accessibility.signals.lineHasError': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.lineHasError', "Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has an error."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.lineHasError.sound', "Plays a sound when the active line has an error."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.lineHasError.announcement', "Announces when the active line has an error."),
                    ...announcementFeatureBase,
                    default: 'off'
                },
            },
        },
        'accessibility.signals.lineHasFoldedArea': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.lineHasFoldedArea', "Plays a signal - sound (audio cue) and/or announcement (alert) - the active line has a folded area that can be unfolded."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.lineHasFoldedArea.sound', "Plays a sound when the active line has a folded area that can be unfolded."),
                    ...soundFeatureBase,
                    default: 'off'
                },
                'announcement': {
                    'description': localize('accessibility.signals.lineHasFoldedArea.announcement', "Announces when the active line has a folded area that can be unfolded."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.lineHasWarning': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.lineHasWarning', "Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has a warning."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.lineHasWarning.sound', "Plays a sound when the active line has a warning."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.lineHasWarning.announcement', "Announces when the active line has a warning."),
                    ...announcementFeatureBase,
                    default: 'off'
                },
            },
        },
        'accessibility.signals.positionHasError': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.positionHasError', "Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has a warning."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.positionHasError.sound', "Plays a sound when the active line has a warning."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.positionHasError.announcement', "Announces when the active line has a warning."),
                    ...announcementFeatureBase,
                    default: 'on'
                },
            },
        },
        'accessibility.signals.positionHasWarning': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.positionHasWarning', "Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has a warning."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.positionHasWarning.sound', "Plays a sound when the active line has a warning."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.positionHasWarning.announcement', "Announces when the active line has a warning."),
                    ...announcementFeatureBase,
                    default: 'on'
                },
            },
        },
        'accessibility.signals.onDebugBreak': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.onDebugBreak', "Plays a signal - sound (audio cue) and/or announcement (alert) - when the debugger stopped on a breakpoint."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.onDebugBreak.sound', "Plays a sound when the debugger stopped on a breakpoint."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.onDebugBreak.announcement', "Announces when the debugger stopped on a breakpoint."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.noInlayHints': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.noInlayHints', "Plays a signal - sound (audio cue) and/or announcement (alert) - when trying to read a line with inlay hints that has no inlay hints."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.noInlayHints.sound', "Plays a sound when trying to read a line with inlay hints that has no inlay hints."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.noInlayHints.announcement', "Announces when trying to read a line with inlay hints that has no inlay hints."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.taskCompleted': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.taskCompleted', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a task is completed."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.taskCompleted.sound', "Plays a sound when a task is completed."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.taskCompleted.announcement', "Announces when a task is completed."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.taskFailed': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.taskFailed', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a task fails (non-zero exit code)."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.taskFailed.sound', "Plays a sound when a task fails (non-zero exit code)."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.taskFailed.announcement', "Announces when a task fails (non-zero exit code)."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.terminalCommandFailed': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.terminalCommandFailed', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a terminal command fails (non-zero exit code) or when a command with such an exit code is navigated to in the accessible view."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.terminalCommandFailed.sound', "Plays a sound when a terminal command fails (non-zero exit code) or when a command with such an exit code is navigated to in the accessible view."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.terminalCommandFailed.announcement', "Announces when a terminal command fails (non-zero exit code) or when a command with such an exit code is navigated to in the accessible view."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.terminalCommandSucceeded': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.terminalCommandSucceeded', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a terminal command succeeds (zero exit code) or when a command with such an exit code is navigated to in the accessible view."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.terminalCommandSucceeded.sound', "Plays a sound when a terminal command succeeds (zero exit code) or when a command with such an exit code is navigated to in the accessible view."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.terminalCommandSucceeded.announcement', "Announces when a terminal command succeeds (zero exit code) or when a command with such an exit code is navigated to in the accessible view."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.terminalQuickFix': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.terminalQuickFix', "Plays a signal - sound (audio cue) and/or announcement (alert) - when terminal Quick Fixes are available."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.terminalQuickFix.sound', "Plays a sound when terminal Quick Fixes are available."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.terminalQuickFix.announcement', "Announces when terminal Quick Fixes are available."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.terminalBell': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.terminalBell', "Plays a signal - sound (audio cue) and/or announcement (alert) - when the terminal bell is ringing."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.terminalBell.sound', "Plays a sound when the terminal bell is ringing."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.terminalBell.announcement', "Announces when the terminal bell is ringing."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.diffLineInserted': {
            ...defaultNoAnnouncement,
            'description': localize('accessibility.signals.diffLineInserted', "Plays a sound / audio cue when the focus moves to an inserted line in Accessible Diff Viewer mode or to the next/previous change."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.sound', "Plays a sound when the focus moves to an inserted line in Accessible Diff Viewer mode or to the next/previous change."),
                    ...soundFeatureBase
                }
            }
        },
        'accessibility.signals.diffLineModified': {
            ...defaultNoAnnouncement,
            'description': localize('accessibility.signals.diffLineModified', "Plays a sound / audio cue when the focus moves to an modified line in Accessible Diff Viewer mode or to the next/previous change."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.diffLineModified.sound', "Plays a sound when the focus moves to a modified line in Accessible Diff Viewer mode or to the next/previous change."),
                    ...soundFeatureBase
                }
            }
        },
        'accessibility.signals.diffLineDeleted': {
            ...defaultNoAnnouncement,
            'description': localize('accessibility.signals.diffLineDeleted', "Plays a sound / audio cue when the focus moves to an deleted line in Accessible Diff Viewer mode or to the next/previous change."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.diffLineDeleted.sound', "Plays a sound when the focus moves to an deleted line in Accessible Diff Viewer mode or to the next/previous change."),
                    ...soundFeatureBase
                }
            }
        },
        'accessibility.signals.notebookCellCompleted': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.notebookCellCompleted', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a notebook cell execution is successfully completed."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.notebookCellCompleted.sound', "Plays a sound when a notebook cell execution is successfully completed."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.notebookCellCompleted.announcement', "Announces when a notebook cell execution is successfully completed."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.notebookCellFailed': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.notebookCellFailed', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a notebook cell execution fails."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.notebookCellFailed.sound', "Plays a sound when a notebook cell execution fails."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.notebookCellFailed.announcement', "Announces when a notebook cell execution fails."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.chatRequestSent': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.chatRequestSent', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a chat request is made."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.chatRequestSent.sound', "Plays a sound when a chat request is made."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.chatRequestSent.announcement', "Announces when a chat request is made."),
                    ...announcementFeatureBase
                },
            }
        },
        'accessibility.signals.progress': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.progress', "Plays a signal - sound (audio cue) and/or announcement (alert) - on loop while progress is occurring."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.progress.sound', "Plays a sound on loop while progress is occurring."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.progress.announcement', "Alerts on loop while progress is occurring."),
                    ...announcementFeatureBase
                },
            },
        },
        'accessibility.signals.chatResponseReceived': {
            ...defaultNoAnnouncement,
            'description': localize('accessibility.signals.chatResponseReceived', "Plays a sound / audio cue when the response has been received."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.chatResponseReceived.sound', "Plays a sound on loop while the response has been received."),
                    ...soundFeatureBase
                },
            }
        },
        'accessibility.signals.voiceRecordingStarted': {
            ...defaultNoAnnouncement,
            'description': localize('accessibility.signals.voiceRecordingStarted', "Plays a sound / audio cue when the voice recording has started."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.voiceRecordingStarted.sound', "Plays a sound when the voice recording has started."),
                    ...soundFeatureBase,
                },
            },
            'default': {
                'sound': 'on'
            }
        },
        'accessibility.signals.voiceRecordingStopped': {
            ...defaultNoAnnouncement,
            'description': localize('accessibility.signals.voiceRecordingStopped', "Plays a sound / audio cue when the voice recording has stopped."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.voiceRecordingStopped.sound', "Plays a sound when the voice recording has stopped."),
                    ...soundFeatureBase,
                    default: 'off'
                },
            }
        },
        'accessibility.signals.clear': {
            ...signalFeatureBase,
            'description': localize('accessibility.signals.clear', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a feature is cleared (for example, the terminal, Debug Console, or Output channel)."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.clear.sound', "Plays a sound when a feature is cleared."),
                    ...soundFeatureBase
                },
                'announcement': {
                    'description': localize('accessibility.signals.clear.announcement', "Announces when a feature is cleared."),
                    ...announcementFeatureBase
                },
            },
        },
        'accessibility.signals.save': {
            'type': 'object',
            'tags': ['accessibility'],
            additionalProperties: false,
            'markdownDescription': localize('accessibility.signals.save', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a file is saved."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.save.sound', "Plays a sound when a file is saved."),
                    'type': 'string',
                    'enum': ['userGesture', 'always', 'never'],
                    'default': 'never',
                    'enumDescriptions': [
                        localize('accessibility.signals.save.sound.userGesture', "Plays the sound when a user explicitly saves a file."),
                        localize('accessibility.signals.save.sound.always', "Plays the sound whenever a file is saved, including auto save."),
                        localize('accessibility.signals.save.sound.never', "Never plays the sound.")
                    ],
                },
                'announcement': {
                    'description': localize('accessibility.signals.save.announcement', "Announces when a file is saved."),
                    'type': 'string',
                    'enum': ['userGesture', 'always', 'never'],
                    'default': 'never',
                    'enumDescriptions': [
                        localize('accessibility.signals.save.announcement.userGesture', "Announces when a user explicitly saves a file."),
                        localize('accessibility.signals.save.announcement.always', "Announces whenever a file is saved, including auto save."),
                        localize('accessibility.signals.save.announcement.never', "Never plays the announcement.")
                    ],
                },
            },
            default: {
                'sound': 'never',
                'announcement': 'never'
            }
        },
        'accessibility.signals.format': {
            'type': 'object',
            'tags': ['accessibility'],
            additionalProperties: false,
            'markdownDescription': localize('accessibility.signals.format', "Plays a signal - sound (audio cue) and/or announcement (alert) - when a file or notebook is formatted."),
            'properties': {
                'sound': {
                    'description': localize('accessibility.signals.format.sound', "Plays a sound when a file or notebook is formatted."),
                    'type': 'string',
                    'enum': ['userGesture', 'always', 'never'],
                    'default': 'never',
                    'enumDescriptions': [
                        localize('accessibility.signals.format.userGesture', "Plays the sound when a user explicitly formats a file."),
                        localize('accessibility.signals.format.always', "Plays the sound whenever a file is formatted, including if it is set to format on save, type, or, paste, or run of a cell."),
                        localize('accessibility.signals.format.never', "Never plays the sound.")
                    ],
                },
                'announcement': {
                    'description': localize('accessibility.signals.format.announcement', "Announces when a file or notebook is formatted."),
                    'type': 'string',
                    'enum': ['userGesture', 'always', 'never'],
                    'default': 'never',
                    'enumDescriptions': [
                        localize('accessibility.signals.format.announcement.userGesture', "Announces when a user explicitly formats a file."),
                        localize('accessibility.signals.format.announcement.always', "Announces whenever a file is formatted, including if it is set to format on save, type, or, paste, or run of a cell."),
                        localize('accessibility.signals.format.announcement.never', "Never announces.")
                    ],
                },
            },
            default: {
                'sound': 'never',
                'announcement': 'never'
            }
        },
        'accessibility.underlineLinks': {
            'type': 'boolean',
            'description': localize('accessibility.underlineLinks', "Controls whether links should be underlined in the workbench."),
            'default': false,
        },
        'accessibility.debugWatchVariableAnnouncements': {
            'type': 'boolean',
            'description': localize('accessibility.debugWatchVariableAnnouncements', "Controls whether variable changes should be announced in the debug watch view."),
            'default': true,
        },
    }
};
export function registerAccessibilityConfiguration() {
    const registry = Registry.as(Extensions.Configuration);
    registry.registerConfiguration(configuration);
    registry.registerConfiguration({
        ...workbenchConfigurationNodeBase,
        properties: {
            ["accessibility.dimUnfocused.enabled"]: {
                description: localize('dimUnfocusedEnabled', 'Whether to dim unfocused editors and terminals, which makes it more clear where typed input will go to. This works with the majority of editors with the notable exceptions of those that utilize iframes like notebooks and extension webview editors.'),
                type: 'boolean',
                default: false,
                tags: ['accessibility'],
                scope: 1,
            },
            ["accessibility.dimUnfocused.opacity"]: {
                markdownDescription: localize('dimUnfocusedOpacity', 'The opacity fraction (0.2 to 1.0) to use for unfocused editors and terminals. This will only take effect when {0} is enabled.', `\`#${"accessibility.dimUnfocused.enabled"}#\``),
                type: 'number',
                minimum: 0.2,
                maximum: 1,
                default: 0.75,
                tags: ['accessibility'],
                scope: 1,
            },
            ["accessibility.hideAccessibleView"]: {
                description: localize('accessibility.hideAccessibleView', "Controls whether the Accessible View is hidden."),
                type: 'boolean',
                default: false,
                tags: ['accessibility']
            }
        }
    });
}
export const SpeechTimeoutDefault = 1200;
let DynamicSpeechAccessibilityConfiguration = class DynamicSpeechAccessibilityConfiguration extends Disposable {
    static { this.ID = 'workbench.contrib.dynamicSpeechAccessibilityConfiguration'; }
    constructor(speechService, productService) {
        super();
        this.speechService = speechService;
        this.productService = productService;
        this._register(Event.runAndSubscribe(speechService.onDidChangeHasSpeechProvider, () => this.updateConfiguration()));
    }
    updateConfiguration() {
        if (!this.speechService.hasSpeechProvider) {
            return;
        }
        const languages = this.getLanguages();
        const languagesSorted = Object.keys(languages).sort((langA, langB) => {
            return languages[langA].name.localeCompare(languages[langB].name);
        });
        const registry = Registry.as(Extensions.Configuration);
        registry.registerConfiguration({
            ...accessibilityConfigurationNodeBase,
            properties: {
                ["accessibility.voice.speechTimeout"]: {
                    'markdownDescription': localize('voice.speechTimeout', "The duration in milliseconds that voice speech recognition remains active after you stop speaking. For example in a chat session, the transcribed text is submitted automatically after the timeout is met. Set to `0` to disable this feature."),
                    'type': 'number',
                    'default': SpeechTimeoutDefault,
                    'minimum': 0,
                    'tags': ['accessibility']
                },
                ["accessibility.voice.speechLanguage"]: {
                    'markdownDescription': localize('voice.speechLanguage', "The language that text-to-speech and speech-to-text should use. Select `auto` to use the configured display language if possible. Note that not all display languages maybe supported by speech recognition and synthesizers."),
                    'type': 'string',
                    'enum': languagesSorted,
                    'default': 'auto',
                    'tags': ['accessibility'],
                    'enumDescriptions': languagesSorted.map(key => languages[key].name),
                    'enumItemLabels': languagesSorted.map(key => languages[key].name)
                },
                ["accessibility.voice.autoSynthesize"]: {
                    'type': 'string',
                    'enum': ['on', 'off', 'auto'],
                    'enumDescriptions': [
                        localize('accessibility.voice.autoSynthesize.on', "Enable the feature. When a screen reader is enabled, note that this will disable aria updates."),
                        localize('accessibility.voice.autoSynthesize.off', "Disable the feature."),
                        localize('accessibility.voice.autoSynthesize.auto', "When a screen reader is detected, disable the feature. Otherwise, enable the feature.")
                    ],
                    'markdownDescription': localize('autoSynthesize', "Whether a textual response should automatically be read out aloud when speech was used as input. For example in a chat session, a response is automatically synthesized when voice was used as chat request."),
                    'default': this.productService.quality !== 'stable' ? 'auto' : 'off',
                    'tags': ['accessibility']
                }
            }
        });
    }
    getLanguages() {
        return {
            ['auto']: {
                name: localize('speechLanguage.auto', "Auto (Use Display Language)")
            },
            ...SPEECH_LANGUAGES
        };
    }
};
DynamicSpeechAccessibilityConfiguration = __decorate([
    __param(0, ISpeechService),
    __param(1, IProductService),
    __metadata("design:paramtypes", [Object, Object])
], DynamicSpeechAccessibilityConfiguration);
export { DynamicSpeechAccessibilityConfiguration };
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations([{
        key: 'audioCues.volume',
        migrateFn: (value, accessor) => {
            return [
                ['accessibility.signalOptions.volume', { value }],
                ['audioCues.volume', { value: undefined }]
            ];
        }
    }]);
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations([{
        key: 'audioCues.debouncePositionChanges',
        migrateFn: (value) => {
            return [
                ['accessibility.signalOptions.debouncePositionChanges', { value }],
                ['audioCues.debouncePositionChanges', { value: undefined }]
            ];
        }
    }]);
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations([{
        key: 'accessibility.signalOptions',
        migrateFn: (value, accessor) => {
            const delayGeneral = getDelaysFromConfig(accessor, 'general');
            const delayError = getDelaysFromConfig(accessor, 'errorAtPosition');
            const delayWarning = getDelaysFromConfig(accessor, 'warningAtPosition');
            const volume = getVolumeFromConfig(accessor);
            const debouncePositionChanges = getDebouncePositionChangesFromConfig(accessor);
            const result = [];
            if (!!volume) {
                result.push(['accessibility.signalOptions.volume', { value: volume }]);
            }
            if (!!delayGeneral) {
                result.push(['accessibility.signalOptions.experimental.delays.general', { value: delayGeneral }]);
            }
            if (!!delayError) {
                result.push(['accessibility.signalOptions.experimental.delays.errorAtPosition', { value: delayError }]);
            }
            if (!!delayWarning) {
                result.push(['accessibility.signalOptions.experimental.delays.warningAtPosition', { value: delayWarning }]);
            }
            if (!!debouncePositionChanges) {
                result.push(['accessibility.signalOptions.debouncePositionChanges', { value: debouncePositionChanges }]);
            }
            result.push(['accessibility.signalOptions', { value: undefined }]);
            return result;
        }
    }]);
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations([{
        key: 'accessibility.signals.sounds.volume',
        migrateFn: (value) => {
            return [
                ['accessibility.signalOptions.volume', { value }],
                ['accessibility.signals.sounds.volume', { value: undefined }]
            ];
        }
    }]);
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations([{
        key: 'accessibility.signals.debouncePositionChanges',
        migrateFn: (value) => {
            return [
                ['accessibility.signalOptions.debouncePositionChanges', { value }],
                ['accessibility.signals.debouncePositionChanges', { value: undefined }]
            ];
        }
    }]);
function getDelaysFromConfig(accessor, type) {
    return accessor(`accessibility.signalOptions.experimental.delays.${type}`) || accessor('accessibility.signalOptions')?.['experimental.delays']?.[`${type}`] || accessor('accessibility.signalOptions')?.['delays']?.[`${type}`];
}
function getVolumeFromConfig(accessor) {
    return accessor('accessibility.signalOptions.volume') || accessor('accessibility.signalOptions')?.volume || accessor('accessibility.signals.sounds.volume') || accessor('audioCues.volume');
}
function getDebouncePositionChangesFromConfig(accessor) {
    return accessor('accessibility.signalOptions.debouncePositionChanges') || accessor('accessibility.signalOptions')?.debouncePositionChanges || accessor('accessibility.signals.debouncePositionChanges') || accessor('audioCues.debouncePositionChanges');
}
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations([{
        key: "accessibility.voice.autoSynthesize",
        migrateFn: (value) => {
            let newValue;
            if (value === true) {
                newValue = 'on';
            }
            else if (value === false) {
                newValue = 'off';
            }
            else {
                return [];
            }
            return [
                ["accessibility.voice.autoSynthesize", { value: newValue }],
            ];
        }
    }]);
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations([{
        key: 'accessibility.signals.chatResponsePending',
        migrateFn: (value, accessor) => {
            return [
                ['accessibility.signals.progress', { value }],
                ['accessibility.signals.chatResponsePending', { value: undefined }],
            ];
        }
    }]);
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations(AccessibilitySignal.allAccessibilitySignals.map(item => item.legacySoundSettingsKey ? ({
    key: item.legacySoundSettingsKey,
    migrateFn: (sound, accessor) => {
        const configurationKeyValuePairs = [];
        const legacyAnnouncementSettingsKey = item.legacyAnnouncementSettingsKey;
        let announcement;
        if (legacyAnnouncementSettingsKey) {
            announcement = accessor(legacyAnnouncementSettingsKey) ?? undefined;
            if (announcement !== undefined && typeof announcement !== 'string') {
                announcement = announcement ? 'auto' : 'off';
            }
        }
        configurationKeyValuePairs.push([`${item.legacySoundSettingsKey}`, { value: undefined }]);
        configurationKeyValuePairs.push([`${item.settingsKey}`, { value: announcement !== undefined ? { announcement, sound } : { sound } }]);
        return configurationKeyValuePairs;
    }
}) : undefined).filter(isDefined));
Registry.as(WorkbenchExtensions.ConfigurationMigration)
    .registerConfigurationMigrations(AccessibilitySignal.allAccessibilitySignals.filter(i => !!i.legacyAnnouncementSettingsKey && !!i.legacySoundSettingsKey).map(item => ({
    key: item.legacyAnnouncementSettingsKey,
    migrateFn: (announcement, accessor) => {
        const configurationKeyValuePairs = [];
        const sound = accessor(item.settingsKey)?.sound || accessor(item.legacySoundSettingsKey);
        if (announcement !== undefined && typeof announcement !== 'string') {
            announcement = announcement ? 'auto' : 'off';
        }
        configurationKeyValuePairs.push([`${item.settingsKey}`, { value: announcement !== undefined ? { announcement, sound } : { sound } }]);
        configurationKeyValuePairs.push([`${item.legacyAnnouncementSettingsKey}`, { value: undefined }]);
        configurationKeyValuePairs.push([`${item.legacySoundSettingsKey}`, { value: undefined }]);
        return configurationKeyValuePairs;
    }
})));
