import * as DOM from '../../../../base/browser/dom.js';
import { BaseActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { HistoryInputBox, IHistoryInputOptions } from '../../../../base/browser/ui/inputbox/inputBox.js';
import { Widget } from '../../../../base/browser/ui/widget.js';
import { IAction } from '../../../../base/common/actions.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditor, IEditorMouseEvent } from '../../../../editor/browser/editorBrowser.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { IContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IWorkspaceContextService, IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare class FolderSettingsActionViewItem extends BaseActionViewItem {
    private readonly contextService;
    private readonly contextMenuService;
    private readonly hoverService;
    private _folder;
    private _folderSettingCounts;
    private container;
    private anchorElement;
    private anchorElementHover;
    private labelElement;
    private detailsElement;
    private dropDownElement;
    constructor(action: IAction, contextService: IWorkspaceContextService, contextMenuService: IContextMenuService, hoverService: IHoverService);
    get folder(): IWorkspaceFolder | null;
    set folder(folder: IWorkspaceFolder | null);
    setCount(settingsTarget: URI, count: number): void;
    render(container: HTMLElement): void;
    private onKeyUp;
    onClick(event: DOM.EventLike): void;
    protected updateEnabled(): void;
    protected updateChecked(): void;
    private onWorkspaceFoldersChanged;
    private update;
    private showMenu;
    private getDropdownMenuActions;
    private labelWithCount;
}
export type SettingsTarget = ConfigurationTarget.APPLICATION | ConfigurationTarget.USER_LOCAL | ConfigurationTarget.USER_REMOTE | ConfigurationTarget.WORKSPACE | URI;
export interface ISettingsTargetsWidgetOptions {
    enableRemoteSettings?: boolean;
}
export declare class SettingsTargetsWidget extends Widget {
    private readonly contextService;
    private readonly instantiationService;
    private readonly environmentService;
    private readonly labelService;
    private readonly languageService;
    private settingsSwitcherBar;
    private userLocalSettings;
    private userRemoteSettings;
    private workspaceSettings;
    private folderSettingsAction;
    private folderSettings;
    private options;
    private _settingsTarget;
    private readonly _onDidTargetChange;
    readonly onDidTargetChange: Event<SettingsTarget>;
    constructor(parent: HTMLElement, options: ISettingsTargetsWidgetOptions | undefined, contextService: IWorkspaceContextService, instantiationService: IInstantiationService, environmentService: IWorkbenchEnvironmentService, labelService: ILabelService, languageService: ILanguageService);
    private resetLabels;
    private create;
    get settingsTarget(): SettingsTarget | null;
    set settingsTarget(settingsTarget: SettingsTarget | null);
    setResultCount(settingsTarget: SettingsTarget, count: number): void;
    updateLanguageFilterIndicators(filter: string | undefined): void;
    private onWorkbenchStateChanged;
    updateTarget(settingsTarget: SettingsTarget): Promise<void>;
    private update;
}
export interface SearchOptions extends IHistoryInputOptions {
    focusKey?: IContextKey<boolean>;
    showResultCount?: boolean;
    ariaLive?: string;
    ariaLabelledBy?: string;
}
export declare class SearchWidget extends Widget {
    protected options: SearchOptions;
    private readonly contextViewService;
    protected instantiationService: IInstantiationService;
    private readonly contextKeyService;
    protected readonly keybindingService: IKeybindingService;
    domNode: HTMLElement;
    private countElement;
    private searchContainer;
    inputBox: HistoryInputBox;
    private controlsDiv;
    private readonly _onDidChange;
    readonly onDidChange: Event<string>;
    private readonly _onFocus;
    readonly onFocus: Event<void>;
    constructor(parent: HTMLElement, options: SearchOptions, contextViewService: IContextViewService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    private create;
    private createSearchContainer;
    protected createInputBox(parent: HTMLElement): HistoryInputBox;
    showMessage(message: string): void;
    layout(dimension: DOM.Dimension): void;
    private getControlsWidth;
    focus(): void;
    hasFocus(): boolean;
    clear(): void;
    getValue(): string;
    setValue(value: string): string;
    dispose(): void;
}
export declare class EditPreferenceWidget<T> extends Disposable {
    private editor;
    private _line;
    private _preferences;
    private readonly _editPreferenceDecoration;
    private readonly _onClick;
    readonly onClick: Event<IEditorMouseEvent>;
    constructor(editor: ICodeEditor);
    get preferences(): T[];
    getLine(): number;
    show(line: number, hoverMessage: string, preferences: T[]): void;
    hide(): void;
    isVisible(): boolean;
    dispose(): void;
}
