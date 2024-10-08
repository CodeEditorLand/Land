import { Delayer } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, MultiEditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { FindReplaceState, INewFindReplaceState } from './findState.js';
import { IFindController } from './findWidget.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare function getSelectionSearchString(editor: ICodeEditor, seedSearchStringFromSelection?: 'single' | 'multiple', seedSearchStringFromNonEmptySelection?: boolean): string | null;
export declare const enum FindStartFocusAction {
    NoFocusChange = 0,
    FocusFindInput = 1,
    FocusReplaceInput = 2
}
export interface IFindStartOptions {
    forceRevealReplace: boolean;
    seedSearchStringFromSelection: 'none' | 'single' | 'multiple';
    seedSearchStringFromNonEmptySelection: boolean;
    seedSearchStringFromGlobalClipboard: boolean;
    shouldFocus: FindStartFocusAction;
    shouldAnimate: boolean;
    updateSearchScope: boolean;
    loop: boolean;
}
export interface IFindStartArguments {
    searchString?: string;
    replaceString?: string;
    isRegex?: boolean;
    matchWholeWord?: boolean;
    isCaseSensitive?: boolean;
    preserveCase?: boolean;
    findInSelection?: boolean;
}
export declare class CommonFindController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.findController";
    protected _editor: ICodeEditor;
    private readonly _findWidgetVisible;
    protected _state: FindReplaceState;
    protected _updateHistoryDelayer: Delayer<void>;
    private _model;
    protected readonly _storageService: IStorageService;
    private readonly _clipboardService;
    protected readonly _contextKeyService: IContextKeyService;
    protected readonly _notificationService: INotificationService;
    protected readonly _hoverService: IHoverService;
    get editor(): ICodeEditor;
    static get(editor: ICodeEditor): CommonFindController | null;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, storageService: IStorageService, clipboardService: IClipboardService, notificationService: INotificationService, hoverService: IHoverService);
    dispose(): void;
    private disposeModel;
    private _onStateChanged;
    private saveQueryState;
    private loadQueryState;
    isFindInputFocused(): boolean;
    getState(): FindReplaceState;
    closeFindWidget(): void;
    toggleCaseSensitive(): void;
    toggleWholeWords(): void;
    toggleRegex(): void;
    togglePreserveCase(): void;
    toggleSearchScope(): void;
    setSearchString(searchString: string): void;
    highlightFindOptions(ignoreWhenVisible?: boolean): void;
    protected _start(opts: IFindStartOptions, newState?: INewFindReplaceState): Promise<void>;
    start(opts: IFindStartOptions, newState?: INewFindReplaceState): Promise<void>;
    moveToNextMatch(): boolean;
    moveToPrevMatch(): boolean;
    goToMatch(index: number): boolean;
    replace(): boolean;
    replaceAll(): boolean;
    selectAllMatches(): boolean;
    getGlobalBufferTerm(): Promise<string>;
    setGlobalBufferTerm(text: string): void;
}
export declare class FindController extends CommonFindController implements IFindController {
    private readonly _contextViewService;
    private readonly _keybindingService;
    private readonly _themeService;
    private _widget;
    private _findOptionsWidget;
    constructor(editor: ICodeEditor, _contextViewService: IContextViewService, _contextKeyService: IContextKeyService, _keybindingService: IKeybindingService, _themeService: IThemeService, notificationService: INotificationService, _storageService: IStorageService, clipboardService: IClipboardService, hoverService: IHoverService);
    protected _start(opts: IFindStartOptions, newState?: INewFindReplaceState): Promise<void>;
    highlightFindOptions(ignoreWhenVisible?: boolean): void;
    private _createFindWidget;
    saveViewState(): any;
    restoreViewState(state: any): void;
}
export declare const StartFindAction: MultiEditorAction;
export declare class StartFindWithArgsAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | null, editor: ICodeEditor, args?: IFindStartArguments): Promise<void>;
}
export declare class StartFindWithSelectionAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | null, editor: ICodeEditor): Promise<void>;
}
export declare abstract class MatchFindAction extends EditorAction {
    run(accessor: ServicesAccessor | null, editor: ICodeEditor): Promise<void>;
    protected abstract _run(controller: CommonFindController): boolean;
}
export declare class NextMatchFindAction extends MatchFindAction {
    constructor();
    protected _run(controller: CommonFindController): boolean;
}
export declare class PreviousMatchFindAction extends MatchFindAction {
    constructor();
    protected _run(controller: CommonFindController): boolean;
}
export declare class MoveToMatchFindAction extends EditorAction {
    private _highlightDecorations;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void | Promise<void>;
    private clearDecorations;
    private addDecorations;
}
export declare abstract class SelectionMatchFindAction extends EditorAction {
    run(accessor: ServicesAccessor | null, editor: ICodeEditor): Promise<void>;
    protected abstract _run(controller: CommonFindController): boolean;
}
export declare class NextSelectionMatchFindAction extends SelectionMatchFindAction {
    constructor();
    protected _run(controller: CommonFindController): boolean;
}
export declare class PreviousSelectionMatchFindAction extends SelectionMatchFindAction {
    constructor();
    protected _run(controller: CommonFindController): boolean;
}
export declare const StartFindReplaceAction: MultiEditorAction;
