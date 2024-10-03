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
    private readonly _contextKeyService;
    private readonly _themeService;
    private readonly _configurationService;
    private _findInputFocused;
    private _findWidgetFocused;
    private _findWidgetVisible;
    private _overrideCopyOnSelectionDisposable;
    constructor(_instance: ITerminalInstance | IDetachedTerminalInstance, _contextViewService: IContextViewService, keybindingService: IKeybindingService, _contextKeyService: IContextKeyService, _contextMenuService: IContextMenuService, _clipboardService: IClipboardService, hoverService: IHoverService, _themeService: IThemeService, _configurationService: IConfigurationService);
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
