import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
export async function shouldPasteTerminalText(accessor, text, bracketedPasteMode) {
    const configurationService = accessor.get(IConfigurationService);
    const dialogService = accessor.get(IDialogService);
    const textForLines = text.split(/\r?\n/);
    if (textForLines.length === 1) {
        return true;
    }
    function parseConfigValue(value) {
        if (typeof value === 'string') {
            if (value === 'auto' || value === 'always' || value === 'never') {
                return value;
            }
        }
        if (typeof value === 'boolean') {
            return value ? 'auto' : 'never';
        }
        return 'auto';
    }
    const configValue = parseConfigValue(configurationService.getValue("terminal.integrated.enableMultiLinePasteWarning"));
    if (configValue === 'never') {
        return true;
    }
    if (configValue === 'auto') {
        if (bracketedPasteMode) {
            return true;
        }
        const textForLines = text.split(/\r?\n/);
        if (textForLines.length === 2 && textForLines[1].trim().length === 0) {
            return true;
        }
    }
    const displayItemsCount = 3;
    const maxPreviewLineLength = 30;
    let detail = localize('preview', "Preview:");
    for (let i = 0; i < Math.min(textForLines.length, displayItemsCount); i++) {
        const line = textForLines[i];
        const cleanedLine = line.length > maxPreviewLineLength ? `${line.slice(0, maxPreviewLineLength)}…` : line;
        detail += `\n${cleanedLine}`;
    }
    if (textForLines.length > displayItemsCount) {
        detail += `\n…`;
    }
    const { result, checkboxChecked } = await dialogService.prompt({
        message: localize('confirmMoveTrashMessageFilesAndDirectories', "Are you sure you want to paste {0} lines of text into the terminal?", textForLines.length),
        detail,
        type: 'warning',
        buttons: [
            {
                label: localize({ key: 'multiLinePasteButton', comment: ['&& denotes a mnemonic'] }, "&&Paste"),
                run: () => ({ confirmed: true, singleLine: false })
            },
            {
                label: localize({ key: 'multiLinePasteButton.oneLine', comment: ['&& denotes a mnemonic'] }, "Paste as &&one line"),
                run: () => ({ confirmed: true, singleLine: true })
            }
        ],
        cancelButton: true,
        checkbox: {
            label: localize('doNotAskAgain', "Do not ask me again")
        }
    });
    if (!result) {
        return false;
    }
    if (result.confirmed && checkboxChecked) {
        await configurationService.updateValue("terminal.integrated.enableMultiLinePasteWarning", false);
    }
    if (result.singleLine) {
        return { modifiedText: text.replace(/\r?\n/g, '') };
    }
    return result.confirmed;
}
