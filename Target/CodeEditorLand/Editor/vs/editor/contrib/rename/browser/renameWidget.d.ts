import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import './renameWidget.css';
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from '../../../browser/editorBrowser.js';
import { IDimension } from '../../../common/core/dimension.js';
import { IRange } from '../../../common/core/range.js';
import { NewSymbolName, NewSymbolNameTriggerKind, ProviderResult } from '../../../common/languages.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
export declare const CONTEXT_RENAME_INPUT_VISIBLE: RawContextKey<boolean>;
export declare const CONTEXT_RENAME_INPUT_FOCUSED: RawContextKey<boolean>;
export type NewNameSource = {
    k: 'inputField';
} | {
    k: 'renameSuggestion';
} | {
    k: 'userEditedRenameSuggestion';
};
export type RenameWidgetStats = {
    nRenameSuggestions: number;
    source: NewNameSource;
    timeBeforeFirstInputFieldEdit: number | undefined;
    nRenameSuggestionsInvocations: number;
    hadAutomaticRenameSuggestionsInvocation: boolean;
};
export type RenameWidgetResult = {
    newName: string;
    wantsPreview?: boolean;
    stats: RenameWidgetStats;
};
interface IRenameWidget {
    getInput(where: IRange, currentName: string, supportPreview: boolean, requestRenameSuggestions: (triggerKind: NewSymbolNameTriggerKind, cts: CancellationToken) => ProviderResult<NewSymbolName[]>[], cts: CancellationTokenSource): Promise<RenameWidgetResult | boolean>;
    acceptInput(wantsPreview: boolean): void;
    cancelInput(focusEditor: boolean, caller: string): void;
    focusNextRenameSuggestion(): void;
    focusPreviousRenameSuggestion(): void;
}
export declare class RenameWidget implements IRenameWidget, IContentWidget, IDisposable {
    private readonly _editor;
    private readonly _acceptKeybindings;
    private readonly _themeService;
    private readonly _keybindingService;
    private readonly _logService;
    readonly allowEditorOverflow: boolean;
    private _domNode?;
    private _inputWithButton;
    private _renameCandidateListView?;
    private _label?;
    private _nPxAvailableAbove?;
    private _nPxAvailableBelow?;
    private _position?;
    private _currentName?;
    private _isEditingRenameCandidate;
    private readonly _candidates;
    private _visible?;
    private _beforeFirstInputFieldEditSW;
    private _timeBeforeFirstInputFieldEdit;
    private _nRenameSuggestionsInvocations;
    private _hadAutomaticRenameSuggestionsInvocation;
    private _renameCandidateProvidersCts;
    private _renameCts;
    private readonly _visibleContextKey;
    private readonly _disposables;
    constructor(_editor: ICodeEditor, _acceptKeybindings: [string, string], _themeService: IThemeService, _keybindingService: IKeybindingService, contextKeyService: IContextKeyService, _logService: ILogService);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    private _updateStyles;
    private _updateFont;
    private _computeLabelFontSize;
    getPosition(): IContentWidgetPosition | null;
    beforeRender(): IDimension | null;
    afterRender(position: ContentWidgetPositionPreference | null): void;
    private _currentAcceptInput?;
    private _currentCancelInput?;
    private _requestRenameCandidatesOnce?;
    acceptInput(wantsPreview: boolean): void;
    cancelInput(focusEditor: boolean, caller: string): void;
    focusNextRenameSuggestion(): void;
    focusPreviousRenameSuggestion(): void;
    getInput(where: IRange, currentName: string, supportPreview: boolean, requestRenameCandidates: undefined | ((triggerKind: NewSymbolNameTriggerKind, cts: CancellationToken) => ProviderResult<NewSymbolName[]>[]), cts: CancellationTokenSource): Promise<RenameWidgetResult | boolean>;
    private _requestRenameCandidates;
    private _getSelection;
    private _show;
    private _updateRenameCandidates;
    private _hide;
    private _getTopForPosition;
    private _trace;
}
export {};
