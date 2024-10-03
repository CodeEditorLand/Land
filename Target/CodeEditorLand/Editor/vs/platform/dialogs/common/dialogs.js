import { basename } from '../../../base/common/resources.js';
import Severity from '../../../base/common/severity.js';
import { localize } from '../../../nls.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { mnemonicButtonLabel } from '../../../base/common/labels.js';
import { isLinux, isMacintosh, isWindows } from '../../../base/common/platform.js';
import { deepClone } from '../../../base/common/objects.js';
export const IDialogService = createDecorator('dialogService');
var DialogKind;
(function (DialogKind) {
    DialogKind[DialogKind["Confirmation"] = 1] = "Confirmation";
    DialogKind[DialogKind["Prompt"] = 2] = "Prompt";
    DialogKind[DialogKind["Input"] = 3] = "Input";
})(DialogKind || (DialogKind = {}));
export class AbstractDialogHandler {
    getConfirmationButtons(dialog) {
        return this.getButtons(dialog, DialogKind.Confirmation);
    }
    getPromptButtons(dialog) {
        return this.getButtons(dialog, DialogKind.Prompt);
    }
    getInputButtons(dialog) {
        return this.getButtons(dialog, DialogKind.Input);
    }
    getButtons(dialog, kind) {
        const buttons = [];
        switch (kind) {
            case DialogKind.Confirmation: {
                const confirmationDialog = dialog;
                if (confirmationDialog.primaryButton) {
                    buttons.push(confirmationDialog.primaryButton);
                }
                else {
                    buttons.push(localize({ key: 'yesButton', comment: ['&& denotes a mnemonic'] }, "&&Yes"));
                }
                if (confirmationDialog.cancelButton) {
                    buttons.push(confirmationDialog.cancelButton);
                }
                else {
                    buttons.push(localize('cancelButton', "Cancel"));
                }
                break;
            }
            case DialogKind.Prompt: {
                const promptDialog = dialog;
                if (Array.isArray(promptDialog.buttons) && promptDialog.buttons.length > 0) {
                    buttons.push(...promptDialog.buttons.map(button => button.label));
                }
                if (promptDialog.cancelButton) {
                    if (promptDialog.cancelButton === true) {
                        buttons.push(localize('cancelButton', "Cancel"));
                    }
                    else if (typeof promptDialog.cancelButton === 'string') {
                        buttons.push(promptDialog.cancelButton);
                    }
                    else {
                        if (promptDialog.cancelButton.label) {
                            buttons.push(promptDialog.cancelButton.label);
                        }
                        else {
                            buttons.push(localize('cancelButton', "Cancel"));
                        }
                    }
                }
                if (buttons.length === 0) {
                    buttons.push(localize({ key: 'okButton', comment: ['&& denotes a mnemonic'] }, "&&OK"));
                }
                break;
            }
            case DialogKind.Input: {
                const inputDialog = dialog;
                if (inputDialog.primaryButton) {
                    buttons.push(inputDialog.primaryButton);
                }
                else {
                    buttons.push(localize({ key: 'okButton', comment: ['&& denotes a mnemonic'] }, "&&OK"));
                }
                if (inputDialog.cancelButton) {
                    buttons.push(inputDialog.cancelButton);
                }
                else {
                    buttons.push(localize('cancelButton', "Cancel"));
                }
                break;
            }
        }
        return buttons;
    }
    getDialogType(type) {
        if (typeof type === 'string') {
            return type;
        }
        if (typeof type === 'number') {
            return (type === Severity.Info) ? 'info' : (type === Severity.Error) ? 'error' : (type === Severity.Warning) ? 'warning' : 'none';
        }
        return undefined;
    }
    getPromptResult(prompt, buttonIndex, checkboxChecked) {
        const promptButtons = [...(prompt.buttons ?? [])];
        if (prompt.cancelButton && typeof prompt.cancelButton !== 'string' && typeof prompt.cancelButton !== 'boolean') {
            promptButtons.push(prompt.cancelButton);
        }
        let result = promptButtons[buttonIndex]?.run({ checkboxChecked });
        if (!(result instanceof Promise)) {
            result = Promise.resolve(result);
        }
        return { result, checkboxChecked };
    }
}
export const IFileDialogService = createDecorator('fileDialogService');
const MAX_CONFIRM_FILES = 10;
export function getFileNamesMessage(fileNamesOrResources) {
    const message = [];
    message.push(...fileNamesOrResources.slice(0, MAX_CONFIRM_FILES).map(fileNameOrResource => typeof fileNameOrResource === 'string' ? fileNameOrResource : basename(fileNameOrResource)));
    if (fileNamesOrResources.length > MAX_CONFIRM_FILES) {
        if (fileNamesOrResources.length - MAX_CONFIRM_FILES === 1) {
            message.push(localize('moreFile', "...1 additional file not shown"));
        }
        else {
            message.push(localize('moreFiles', "...{0} additional files not shown", fileNamesOrResources.length - MAX_CONFIRM_FILES));
        }
    }
    message.push('');
    return message.join('\n');
}
export function massageMessageBoxOptions(options, productService) {
    const massagedOptions = deepClone(options);
    let buttons = (massagedOptions.buttons ?? []).map(button => mnemonicButtonLabel(button));
    let buttonIndeces = (options.buttons || []).map((button, index) => index);
    let defaultId = 0;
    let cancelId = massagedOptions.cancelId ?? buttons.length - 1;
    if (buttons.length > 1) {
        const cancelButton = typeof cancelId === 'number' ? buttons[cancelId] : undefined;
        if (isLinux || isMacintosh) {
            if (typeof cancelButton === 'string' && buttons.length > 1 && cancelId !== 1) {
                buttons.splice(cancelId, 1);
                buttons.splice(1, 0, cancelButton);
                const cancelButtonIndex = buttonIndeces[cancelId];
                buttonIndeces.splice(cancelId, 1);
                buttonIndeces.splice(1, 0, cancelButtonIndex);
                cancelId = 1;
            }
            if (isLinux && buttons.length > 1) {
                buttons = buttons.reverse();
                buttonIndeces = buttonIndeces.reverse();
                defaultId = buttons.length - 1;
                if (typeof cancelButton === 'string') {
                    cancelId = defaultId - 1;
                }
            }
        }
        else if (isWindows) {
            if (typeof cancelButton === 'string' && buttons.length > 1 && cancelId !== buttons.length - 1) {
                buttons.splice(cancelId, 1);
                buttons.push(cancelButton);
                const buttonIndex = buttonIndeces[cancelId];
                buttonIndeces.splice(cancelId, 1);
                buttonIndeces.push(buttonIndex);
                cancelId = buttons.length - 1;
            }
        }
    }
    massagedOptions.buttons = buttons;
    massagedOptions.defaultId = defaultId;
    massagedOptions.cancelId = cancelId;
    massagedOptions.noLink = true;
    massagedOptions.title = massagedOptions.title || productService.nameLong;
    return {
        options: massagedOptions,
        buttonIndeces
    };
}
