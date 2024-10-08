import { SimpleFindWidget } from '../../../codeEditor/browser/find/simpleFindWidget.js';
import { IContextMenuService, IContextViewService } from '../../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IDetachedTerminalInstance, ITerminalInstance } from '../../../terminal/browser/terminal.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
export declare class TerminalFindWidget extends SimpleFindWidget {
    private _instance;
    private _findInputFocused;
    private _findWidgetFocused;
    private _findWidgetVisible;
    private _overrideCopyOnSelectionDisposable;
    constructor(_instance: ITerminalInstance | IDetachedTerminalInstance, clipboardService: IClipboardService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, contextViewService: IContextViewService, hoverService: IHoverService, keybindingService: IKeybindingService, themeService: IThemeService);
    find(previous: boolean, update?: boolean): void;
    reveal(): void;
    show(): void;
    hide(): void;
    protected _getResultCount(): Promise<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    protected _onInputChanged(): boolean;
    protected _onFocusTrackerFocus(): void;
    protected _onFocusTrackerBlur(): void;
    protected _onFindInputFocusTrackerFocus(): void;
    protected _onFindInputFocusTrackerBlur(): void;
    findFirst(): void;
    private _findNextWithEvent;
    private _findPreviousWithEvent;
}
