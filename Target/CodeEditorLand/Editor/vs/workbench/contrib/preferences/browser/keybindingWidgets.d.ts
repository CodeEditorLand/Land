import './media/keybindings.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { Widget } from '../../../../base/browser/ui/widget.js';
import { ResolvedKeybinding } from '../../../../base/common/keybindings.js';
import * as dom from '../../../../base/browser/dom.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { SearchWidget, SearchOptions } from './preferencesWidgets.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
export interface KeybindingsSearchOptions extends SearchOptions {
    recordEnter?: boolean;
    quoteRecordedKeys?: boolean;
}
export declare class KeybindingsSearchWidget extends SearchWidget {
    private _chords;
    private _inputValue;
    private readonly recordDisposables;
    private _onKeybinding;
    readonly onKeybinding: Event<ResolvedKeybinding[] | null>;
    private _onEnter;
    readonly onEnter: Event<void>;
    private _onEscape;
    readonly onEscape: Event<void>;
    private _onBlur;
    readonly onBlur: Event<void>;
    constructor(parent: HTMLElement, options: KeybindingsSearchOptions, contextViewService: IContextViewService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    clear(): void;
    startRecordingKeys(): void;
    stopRecordingKeys(): void;
    setInputValue(value: string): void;
    private _onKeyDown;
    private printKeybinding;
}
export declare class DefineKeybindingWidget extends Widget {
    private readonly instantiationService;
    private static readonly WIDTH;
    private static readonly HEIGHT;
    private _domNode;
    private _keybindingInputWidget;
    private _outputNode;
    private _showExistingKeybindingsNode;
    private readonly _keybindingDisposables;
    private _chords;
    private _isVisible;
    private _onHide;
    private _onDidChange;
    onDidChange: Event<string>;
    private _onShowExistingKeybindings;
    readonly onShowExistingKeybidings: Event<string | null>;
    constructor(parent: HTMLElement | null, instantiationService: IInstantiationService);
    get domNode(): HTMLElement;
    define(): Promise<string | null>;
    layout(layout: dom.Dimension): void;
    printExisting(numberOfExisting: number): void;
    private onKeybinding;
    private getUserSettingsLabel;
    private onCancel;
    private clearOrHide;
    private hide;
}
export declare class DefineKeybindingOverlayWidget extends Disposable implements IOverlayWidget {
    private _editor;
    private static readonly ID;
    private readonly _widget;
    constructor(_editor: ICodeEditor, instantiationService: IInstantiationService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition;
    dispose(): void;
    start(): Promise<string | null>;
}
