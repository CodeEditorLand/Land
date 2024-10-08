/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MarkdownString } from '../../../../base/common/htmlContent.js';
export function resolveContentAndKeybindingItems(keybindingService, value) {
    if (!value) {
        return;
    }
    const configureKeybindingItems = [];
    const configuredKeybindingItems = [];
    const matches = value.matchAll(/(\<keybinding:(?<commandId>[^\<]*)\>)/gm);
    for (const match of [...matches]) {
        const commandId = match?.groups?.commandId;
        let kbLabel;
        if (match?.length && commandId) {
            const keybinding = keybindingService.lookupKeybinding(commandId)?.getAriaLabel();
            if (!keybinding) {
                kbLabel = ` (unassigned keybinding)`;
                configureKeybindingItems.push({
                    label: commandId,
                    id: commandId
                });
            }
            else {
                kbLabel = ' (' + keybinding + ')';
                configuredKeybindingItems.push({
                    label: commandId,
                    id: commandId
                });
            }
            value = value.replace(match[0], kbLabel);
        }
    }
    const content = new MarkdownString(value);
    content.isTrusted = true;
    return { content, configureKeybindingItems: configureKeybindingItems.length ? configureKeybindingItems : undefined, configuredKeybindingItems: configuredKeybindingItems.length ? configuredKeybindingItems : undefined };
}
