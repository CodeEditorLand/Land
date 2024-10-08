import { URI } from '../../../../base/common/uri.js';
import { EditorInputCapabilities, IEditorIdentifier, IUntypedEditorInput } from '../../../common/editor.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { EditorInput, IEditorCloseHandler } from '../../../common/editor/editorInput.js';
import { ITerminalInstance, ITerminalInstanceService } from './terminal.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IShellLaunchConfig } from '../../../../platform/terminal/common/terminal.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ConfirmResult, IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { Emitter } from '../../../../base/common/event.js';
export declare class TerminalEditorInput extends EditorInput implements IEditorCloseHandler {
    readonly resource: URI;
    private _terminalInstance;
    private readonly _themeService;
    private readonly _terminalInstanceService;
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _lifecycleService;
    private _contextKeyService;
    private readonly _dialogService;
    static readonly ID = "workbench.editors.terminal";
    readonly closeHandler: this;
    private _isDetached;
    private _isShuttingDown;
    private _isReverted;
    private _copyLaunchConfig?;
    private _terminalEditorFocusContextKey;
    private _group;
    protected readonly _onDidRequestAttach: Emitter<ITerminalInstance>;
    readonly onDidRequestAttach: import("../../../workbench.web.main.internal.js").Event<ITerminalInstance>;
    setGroup(group: IEditorGroup | undefined): void;
    get group(): IEditorGroup | undefined;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    setTerminalInstance(instance: ITerminalInstance): void;
    copy(): EditorInput;
    /**
     * Sets the launch config to use for the next call to EditorInput.copy, which will be used when
     * the editor's split command is run.
     */
    setCopyLaunchConfig(launchConfig: IShellLaunchConfig): void;
    /**
     * Returns the terminal instance for this input if it has not yet been detached from the input.
     */
    get terminalInstance(): ITerminalInstance | undefined;
    showConfirm(): boolean;
    confirm(terminals: ReadonlyArray<IEditorIdentifier>): Promise<ConfirmResult>;
    revert(): Promise<void>;
    constructor(resource: URI, _terminalInstance: ITerminalInstance | undefined, _themeService: IThemeService, _terminalInstanceService: ITerminalInstanceService, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _lifecycleService: ILifecycleService, _contextKeyService: IContextKeyService, _dialogService: IDialogService);
    private _setupInstanceListeners;
    getName(): string;
    getIcon(): ThemeIcon | undefined;
    getLabelExtraClasses(): string[];
    /**
     * Detach the instance from the input such that when the input is disposed it will not dispose
     * of the terminal instance/process.
     */
    detachInstance(): void;
    getDescription(): string | undefined;
    toUntyped(): IUntypedEditorInput;
}
