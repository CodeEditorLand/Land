import { Disposable } from '../../../../base/common/lifecycle.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export declare class ExtensionAccessibilityHelpDialogContribution extends Disposable {
    static ID: string;
    private _viewHelpDialogMap;
    constructor(keybindingService: IKeybindingService);
}
