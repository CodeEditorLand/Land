import type { ITheme, Terminal as RawXtermTerminal } from '@xterm/xterm';
import type { ISearchOptions } from '@xterm/addon-search';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IShellIntegration, ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
import { ITerminalFont } from '../../common/terminal.js';
import { IMarkTracker, IInternalXtermTerminal, IXtermTerminal, IXtermColorProvider, IXtermAttachToElementOptions, IDetachedXtermTerminal, ITerminalConfigurationService } from '../terminal.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ScrollPosition } from './markNavigationAddon.js';
import { IColorTheme, IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalCapabilityStore, ITerminalCommand } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { ILayoutService } from '../../../../../platform/layout/browser/layoutService.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { XtermAddonImporter } from './xtermAddonImporter.js';
export interface IXtermTerminalOptions {
    /** The columns to initialize the terminal with. */
    cols: number;
    /** The rows to initialize the terminal with. */
    rows: number;
    /** The color provider for the terminal. */
    xtermColorProvider: IXtermColorProvider;
    /** The capabilities of the terminal. */
    capabilities: ITerminalCapabilityStore;
    /** The shell integration nonce to verify data coming from SI is trustworthy. */
    shellIntegrationNonce?: string;
    /** Whether to disable shell integration telemetry reporting. */
    disableShellIntegrationReporting?: boolean;
    /** The object that imports xterm addons, set this to inject an importer in tests. */
    xtermAddonImpoter?: XtermAddonImporter;
}
/**
 * Wraps the xterm object with additional functionality. Interaction with the backing process is out
 * of the scope of this class.
 */
export declare class XtermTerminal extends Disposable implements IXtermTerminal, IDetachedXtermTerminal, IInternalXtermTerminal {
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _notificationService;
    private readonly _themeService;
    private readonly _telemetryService;
    private readonly _terminalConfigurationService;
    private readonly _clipboardService;
    private readonly _accessibilitySignalService;
    /** The raw xterm.js instance */
    readonly raw: RawXtermTerminal;
    private _core;
    private readonly _xtermAddonLoader;
    private readonly _xtermColorProvider;
    private readonly _capabilities;
    private static _suggestedRendererType;
    private static _checkedWebglCompatible;
    private _attached?;
    private _isPhysicalMouseWheel;
    private _markNavigationAddon;
    private _shellIntegrationAddon;
    private _decorationAddon;
    private _clipboardAddon?;
    private _searchAddon?;
    private _unicode11Addon?;
    private _webglAddon?;
    private _serializeAddon?;
    private _imageAddon?;
    private readonly _attachedDisposables;
    private readonly _anyTerminalFocusContextKey;
    private readonly _anyFocusedTerminalHasSelection;
    private _lastFindResult;
    get findResult(): {
        resultIndex: number;
        resultCount: number;
    } | undefined;
    get isStdinDisabled(): boolean;
    get isGpuAccelerated(): boolean;
    private readonly _onDidRequestRunCommand;
    readonly onDidRequestRunCommand: import("../../../../workbench.web.main.internal.js").Event<{
        command: ITerminalCommand;
        noNewLine?: boolean;
    }>;
    private readonly _onDidRequestCopyAsHtml;
    readonly onDidRequestCopyAsHtml: import("../../../../workbench.web.main.internal.js").Event<{
        command: ITerminalCommand;
    }>;
    private readonly _onDidRequestRefreshDimensions;
    readonly onDidRequestRefreshDimensions: import("../../../../workbench.web.main.internal.js").Event<void>;
    private readonly _onDidChangeFindResults;
    readonly onDidChangeFindResults: import("../../../../workbench.web.main.internal.js").Event<{
        resultIndex: number;
        resultCount: number;
    }>;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: import("../../../../workbench.web.main.internal.js").Event<void>;
    private readonly _onDidChangeFocus;
    readonly onDidChangeFocus: import("../../../../workbench.web.main.internal.js").Event<boolean>;
    private readonly _onDidDispose;
    readonly onDidDispose: import("../../../../workbench.web.main.internal.js").Event<void>;
    get markTracker(): IMarkTracker;
    get shellIntegration(): IShellIntegration;
    get textureAtlas(): Promise<ImageBitmap> | undefined;
    get isFocused(): boolean;
    /**
     * @param xtermCtor The xterm.js constructor, this is passed in so it can be fetched lazily
     * outside of this class such that {@link raw} is not nullable.
     */
    constructor(xtermCtor: typeof RawXtermTerminal, options: IXtermTerminalOptions, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _logService: ITerminalLogService, _notificationService: INotificationService, _themeService: IThemeService, _telemetryService: ITelemetryService, _terminalConfigurationService: ITerminalConfigurationService, _clipboardService: IClipboardService, contextKeyService: IContextKeyService, _accessibilitySignalService: IAccessibilitySignalService, layoutService: ILayoutService);
    getBufferReverseIterator(): IterableIterator<string>;
    getContentsAsHtml(): Promise<string>;
    getSelectionAsHtml(command?: ITerminalCommand): Promise<string>;
    attachToElement(container: HTMLElement, partialOptions?: Partial<IXtermAttachToElementOptions>): HTMLElement;
    private _setFocused;
    write(data: string | Uint8Array, callback?: () => void): void;
    resize(columns: number, rows: number): void;
    updateConfig(): void;
    private _updateSmoothScrolling;
    private _shouldLoadWebgl;
    forceRedraw(): void;
    clearDecorations(): void;
    forceRefresh(): void;
    findNext(term: string, searchOptions: ISearchOptions): Promise<boolean>;
    findPrevious(term: string, searchOptions: ISearchOptions): Promise<boolean>;
    private _updateFindColors;
    private _searchAddonPromise;
    private _getSearchAddon;
    clearSearchDecorations(): void;
    clearActiveSearchDecoration(): void;
    getFont(): ITerminalFont;
    getLongestViewportWrappedLineLength(): number;
    private _getWrappedLineCount;
    scrollDownLine(): void;
    scrollDownPage(): void;
    scrollToBottom(): void;
    scrollUpLine(): void;
    scrollUpPage(): void;
    scrollToTop(): void;
    scrollToLine(line: number, position?: ScrollPosition): void;
    clearBuffer(): void;
    hasSelection(): boolean;
    clearSelection(): void;
    selectMarkedRange(fromMarkerId: string, toMarkerId: string, scrollIntoView?: boolean): void;
    selectAll(): void;
    focus(): void;
    copySelection(asHtml?: boolean, command?: ITerminalCommand): Promise<void>;
    private _setCursorBlink;
    private _setCursorStyle;
    private _setCursorStyleInactive;
    private _setCursorWidth;
    private _enableWebglRenderer;
    private _disableWebglForThisSession;
    private _refreshImageAddon;
    private _disposeOfWebglRenderer;
    getXtermTheme(theme?: IColorTheme): ITheme;
    private _updateTheme;
    refresh(): void;
    private _updateUnicodeVersion;
    _writeText(data: string): void;
    dispose(): void;
}
export declare function getXtermScaledDimensions(w: Window, font: ITerminalFont, width: number, height: number): {
    rows: number;
    cols: number;
} | null;
