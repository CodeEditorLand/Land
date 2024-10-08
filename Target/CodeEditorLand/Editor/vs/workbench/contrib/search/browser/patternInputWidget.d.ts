import * as dom from '../../../../base/browser/dom.js';
import { IContextViewProvider } from '../../../../base/browser/ui/contextview/contextview.js';
import { HistoryInputBox, IInputBoxStyles } from '../../../../base/browser/ui/inputbox/inputBox.js';
import { Widget } from '../../../../base/browser/ui/widget.js';
import { Event as CommonEvent } from '../../../../base/common/event.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export interface IOptions {
    placeholder?: string;
    showPlaceholderOnFocus?: boolean;
    tooltip?: string;
    width?: number;
    ariaLabel?: string;
    history?: string[];
    inputBoxStyles: IInputBoxStyles;
}
export declare class PatternInputWidget extends Widget {
    private contextViewProvider;
    private readonly contextKeyService;
    protected readonly configurationService: IConfigurationService;
    private readonly keybindingService;
    static OPTION_CHANGE: string;
    inputFocusTracker: dom.IFocusTracker;
    private width;
    private domNode;
    protected inputBox: HistoryInputBox;
    private _onSubmit;
    onSubmit: CommonEvent<boolean>;
    private _onCancel;
    onCancel: CommonEvent<void>;
    constructor(parent: HTMLElement, contextViewProvider: IContextViewProvider, options: IOptions, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    dispose(): void;
    setWidth(newWidth: number): void;
    getValue(): string;
    setValue(value: string): void;
    select(): void;
    focus(): void;
    inputHasFocus(): boolean;
    private setInputWidth;
    protected getSubcontrolsWidth(): number;
    getHistory(): string[];
    clearHistory(): void;
    prependHistory(history: string[]): void;
    clear(): void;
    onSearchSubmit(): void;
    showNextTerm(): void;
    showPreviousTerm(): void;
    private render;
    protected renderSubcontrols(_controlsDiv: HTMLDivElement): void;
    private onInputKeyUp;
}
export declare class IncludePatternInputWidget extends PatternInputWidget {
    private _onChangeSearchInEditorsBoxEmitter;
    onChangeSearchInEditorsBox: CommonEvent<void>;
    constructor(parent: HTMLElement, contextViewProvider: IContextViewProvider, options: IOptions, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    private useSearchInEditorsBox;
    dispose(): void;
    onlySearchInOpenEditors(): boolean;
    setOnlySearchInOpenEditors(value: boolean): void;
    protected getSubcontrolsWidth(): number;
    protected renderSubcontrols(controlsDiv: HTMLDivElement): void;
}
export declare class ExcludePatternInputWidget extends PatternInputWidget {
    private _onChangeIgnoreBoxEmitter;
    onChangeIgnoreBox: CommonEvent<void>;
    constructor(parent: HTMLElement, contextViewProvider: IContextViewProvider, options: IOptions, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    private useExcludesAndIgnoreFilesBox;
    dispose(): void;
    useExcludesAndIgnoreFiles(): boolean;
    setUseExcludesAndIgnoreFiles(value: boolean): void;
    protected getSubcontrolsWidth(): number;
    protected renderSubcontrols(controlsDiv: HTMLDivElement): void;
}
