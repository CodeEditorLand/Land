import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IMarkTracker } from '../terminal.js';
import { ITerminalCapabilityStore, ITerminalCommand } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import type { Terminal, IMarker, ITerminalAddon, IBufferRange } from '@xterm/xterm';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { ICurrentPartialCommand } from '../../../../../platform/terminal/common/capabilities/commandDetection/terminalCommand.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
declare enum Boundary {
    Top = 0,
    Bottom = 1
}
export declare const enum ScrollPosition {
    Top = 0,
    Middle = 1
}
export declare class MarkNavigationAddon extends Disposable implements IMarkTracker, ITerminalAddon {
    private readonly _capabilities;
    private readonly _configurationService;
    private readonly _themeService;
    private _currentMarker;
    private _selectionStart;
    private _isDisposable;
    protected _terminal: Terminal | undefined;
    private _navigationDecorations;
    private _activeCommandGuide?;
    private readonly _commandGuideDecorations;
    activate(terminal: Terminal): void;
    constructor(_capabilities: ITerminalCapabilityStore, _configurationService: IConfigurationService, _themeService: IThemeService);
    private _getMarkers;
    private _findCommand;
    clear(): void;
    private _resetNavigationDecorations;
    private _isEmptyCommand;
    scrollToPreviousMark(scrollPosition?: ScrollPosition, retainSelection?: boolean, skipEmptyCommands?: boolean): void;
    scrollToNextMark(scrollPosition?: ScrollPosition, retainSelection?: boolean, skipEmptyCommands?: boolean): void;
    private _scrollToCommand;
    private _scrollToMarker;
    private _createMarkerForOffset;
    revealCommand(command: ITerminalCommand | ICurrentPartialCommand, position?: ScrollPosition): void;
    revealRange(range: IBufferRange): void;
    showCommandGuide(command: ITerminalCommand | undefined): void;
    private _scrollState;
    saveScrollState(): void;
    restoreScrollState(): void;
    private _highlightBufferRange;
    registerTemporaryDecoration(marker: IMarker | number, endMarker: IMarker | number | undefined, showOutline: boolean): void;
    scrollToLine(line: number, position: ScrollPosition): void;
    getTargetScrollLine(line: number, position: ScrollPosition): number;
    private _isMarkerInViewport;
    scrollToClosestMarker(startMarkerId: string, endMarkerId?: string, highlight?: boolean | undefined): void;
    selectToPreviousMark(): void;
    selectToNextMark(): void;
    selectToPreviousLine(): void;
    selectToNextLine(): void;
    scrollToPreviousLine(xterm: Terminal, scrollPosition?: ScrollPosition, retainSelection?: boolean): void;
    scrollToNextLine(xterm: Terminal, scrollPosition?: ScrollPosition, retainSelection?: boolean): void;
    private _registerMarkerOrThrow;
    private _getOffset;
    private _findPreviousMarker;
    private _findNextMarker;
}
export declare function getLine(xterm: Terminal, marker: IMarker | Boundary): number;
export declare function selectLines(xterm: Terminal, start: IMarker | Boundary, end: IMarker | Boundary | null): void;
export {};
