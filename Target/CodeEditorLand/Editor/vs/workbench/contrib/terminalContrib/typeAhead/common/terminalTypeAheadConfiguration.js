/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../../nls.js';
export const DEFAULT_LOCAL_ECHO_EXCLUDE = ['vim', 'vi', 'nano', 'tmux'];
export const terminalTypeAheadConfiguration = {
    ["terminal.integrated.localEchoLatencyThreshold" /* TerminalTypeAheadSettingId.LocalEchoLatencyThreshold */]: {
        description: localize('terminal.integrated.localEchoLatencyThreshold', "Length of network delay, in milliseconds, where local edits will be echoed on the terminal without waiting for server acknowledgement. If '0', local echo will always be on, and if '-1' it will be disabled."),
        type: 'integer',
        minimum: -1,
        default: 30,
    },
    ["terminal.integrated.localEchoEnabled" /* TerminalTypeAheadSettingId.LocalEchoEnabled */]: {
        markdownDescription: localize('terminal.integrated.localEchoEnabled', "When local echo should be enabled. This will override {0}", '`#terminal.integrated.localEchoLatencyThreshold#`'),
        type: 'string',
        enum: ['on', 'off', 'auto'],
        enumDescriptions: [
            localize('terminal.integrated.localEchoEnabled.on', "Always enabled"),
            localize('terminal.integrated.localEchoEnabled.off', "Always disabled"),
            localize('terminal.integrated.localEchoEnabled.auto', "Enabled only for remote workspaces")
        ],
        default: 'auto'
    },
    ["terminal.integrated.localEchoExcludePrograms" /* TerminalTypeAheadSettingId.LocalEchoExcludePrograms */]: {
        description: localize('terminal.integrated.localEchoExcludePrograms', "Local echo will be disabled when any of these program names are found in the terminal title."),
        type: 'array',
        items: {
            type: 'string',
            uniqueItems: true
        },
        default: DEFAULT_LOCAL_ECHO_EXCLUDE,
    },
    ["terminal.integrated.localEchoStyle" /* TerminalTypeAheadSettingId.LocalEchoStyle */]: {
        description: localize('terminal.integrated.localEchoStyle', "Terminal style of locally echoed text; either a font style or an RGB color."),
        default: 'dim',
        anyOf: [
            {
                enum: ['bold', 'dim', 'italic', 'underlined', 'inverted', '#ff0000'],
            },
            {
                type: 'string',
                format: 'color-hex',
            }
        ]
    },
};
