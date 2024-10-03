import { Disposable } from '../../../../base/common/lifecycle.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
export declare class KeybindingEditorDecorationsRenderer extends Disposable {
    private _editor;
    private readonly _keybindingService;
    private _updateDecorations;
    private readonly _dec;
    constructor(_editor: ICodeEditor, _keybindingService: IKeybindingService);
    private _updateDecorationsNow;
    private _getDecorationForEntry;
    static _userSettingsFuzzyEquals(a: string, b: string): boolean;
    private _createDecoration;
}
