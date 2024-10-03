import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IPickerQuickAccessItem } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
export declare function resolveContentAndKeybindingItems(keybindingService: IKeybindingService, value?: string): {
    content: MarkdownString;
    configureKeybindingItems: IPickerQuickAccessItem[] | undefined;
    configuredKeybindingItems: IPickerQuickAccessItem[] | undefined;
} | undefined;
