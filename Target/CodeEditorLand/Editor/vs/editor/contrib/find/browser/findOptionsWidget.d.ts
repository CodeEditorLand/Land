import './findOptionsWidget.css';
import { Widget } from '../../../../base/browser/ui/widget.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../../browser/editorBrowser.js';
import { FindReplaceState } from './findState.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export declare class FindOptionsWidget extends Widget implements IOverlayWidget {
    private static readonly ID;
    private readonly _editor;
    private readonly _state;
    private readonly _keybindingService;
    private readonly _domNode;
    private readonly regex;
    private readonly wholeWords;
    private readonly caseSensitive;
    constructor(editor: ICodeEditor, state: FindReplaceState, keybindingService: IKeybindingService);
    private _keybindingLabelFor;
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition;
    highlightFindOptions(): void;
    private _hideSoon;
    private _revealTemporarily;
    private _onMouseLeave;
    private _onMouseOver;
    private _isVisible;
    private _show;
    private _hide;
}
