import { OperatingSystem } from '../../../../base/common/platform.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IKeybindingItemEntry } from '../common/preferences.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
export declare const KEYBINDING_ENTRY_TEMPLATE_ID = "keybinding.entry.template";
export declare function createKeybindingCommandQuery(commandId: string, when?: string): string;
export declare class KeybindingsEditorModel extends EditorModel {
    private readonly keybindingsService;
    private readonly extensionService;
    private _keybindingItems;
    private _keybindingItemsSortedByPrecedence;
    private modifierLabels;
    constructor(os: OperatingSystem, keybindingsService: IKeybindingService, extensionService: IExtensionService);
    fetch(searchValue: string, sortByPrecedence?: boolean): IKeybindingItemEntry[];
    private filterBySource;
    private filterByExtension;
    private filterByText;
    private filterByWhen;
    private splitKeybindingWords;
    resolve(actionLabels?: Map<string, string>): Promise<void>;
    private static getId;
    private getExtensionsMapping;
    private static compareKeybindingData;
    private static toKeybindingEntry;
    private static getCommandDefaultLabel;
    private static getCommandLabel;
}
