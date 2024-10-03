import { createDecorator } from '../../instantiation/common/instantiation.js';
import { Schemas } from '../../../base/common/network.js';
export const NO_KEY_MODS = { ctrlCmd: false, alt: false };
export var QuickInputHideReason;
(function (QuickInputHideReason) {
    QuickInputHideReason[QuickInputHideReason["Blur"] = 1] = "Blur";
    QuickInputHideReason[QuickInputHideReason["Gesture"] = 2] = "Gesture";
    QuickInputHideReason[QuickInputHideReason["Other"] = 3] = "Other";
})(QuickInputHideReason || (QuickInputHideReason = {}));
export var ItemActivation;
(function (ItemActivation) {
    ItemActivation[ItemActivation["NONE"] = 0] = "NONE";
    ItemActivation[ItemActivation["FIRST"] = 1] = "FIRST";
    ItemActivation[ItemActivation["SECOND"] = 2] = "SECOND";
    ItemActivation[ItemActivation["LAST"] = 3] = "LAST";
})(ItemActivation || (ItemActivation = {}));
export var QuickPickFocus;
(function (QuickPickFocus) {
    QuickPickFocus[QuickPickFocus["First"] = 1] = "First";
    QuickPickFocus[QuickPickFocus["Second"] = 2] = "Second";
    QuickPickFocus[QuickPickFocus["Last"] = 3] = "Last";
    QuickPickFocus[QuickPickFocus["Next"] = 4] = "Next";
    QuickPickFocus[QuickPickFocus["Previous"] = 5] = "Previous";
    QuickPickFocus[QuickPickFocus["NextPage"] = 6] = "NextPage";
    QuickPickFocus[QuickPickFocus["PreviousPage"] = 7] = "PreviousPage";
    QuickPickFocus[QuickPickFocus["NextSeparator"] = 8] = "NextSeparator";
    QuickPickFocus[QuickPickFocus["PreviousSeparator"] = 9] = "PreviousSeparator";
})(QuickPickFocus || (QuickPickFocus = {}));
export var QuickInputButtonLocation;
(function (QuickInputButtonLocation) {
    QuickInputButtonLocation[QuickInputButtonLocation["Title"] = 1] = "Title";
    QuickInputButtonLocation[QuickInputButtonLocation["Inline"] = 2] = "Inline";
})(QuickInputButtonLocation || (QuickInputButtonLocation = {}));
export class QuickPickItemScorerAccessor {
    constructor(options) {
        this.options = options;
    }
    getItemLabel(entry) {
        return entry.label;
    }
    getItemDescription(entry) {
        if (this.options?.skipDescription) {
            return undefined;
        }
        return entry.description;
    }
    getItemPath(entry) {
        if (this.options?.skipPath) {
            return undefined;
        }
        if (entry.resource?.scheme === Schemas.file) {
            return entry.resource.fsPath;
        }
        return entry.resource?.path;
    }
}
export const quickPickItemScorerAccessor = new QuickPickItemScorerAccessor();
export const IQuickInputService = createDecorator('quickInputService');
