var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TerminalInstance_1;
import { isFirefox } from '../../../../base/browser/browser.js';
import { BrowserFeatures } from '../../../../base/browser/canIUse.js';
import { DataTransfers } from '../../../../base/browser/dnd.js';
import * as dom from '../../../../base/browser/dom.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { DomScrollableElement } from '../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { AutoOpenBarrier, Promises, disposableTimeout, timeout } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { debounce } from '../../../../base/common/decorators.js';
import { ErrorNoTelemetry, onUnexpectedError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { template } from '../../../../base/common/labels.js';
import { Disposable, DisposableStore, ImmortalReference, MutableDisposable, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import * as path from '../../../../base/common/path.js';
import { OS, isMacintosh, isWindows } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { TabFocus } from '../../../../editor/browser/config/tabFocus.js';
import * as nls from '../../../../nls.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { CodeDataTransfers, containsDragType } from '../../../../platform/dnd/browser/dnd.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { TerminalCapabilityStoreMultiplexer } from '../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js';
import { deserializeEnvironmentVariableCollections } from '../../../../platform/terminal/common/environmentVariableShared.js';
import { ITerminalLogService, TerminalExitReason, TerminalLocation, TitleEventSource } from '../../../../platform/terminal/common/terminal.js';
import { formatMessageForTerminal } from '../../../../platform/terminal/common/terminalStrings.js';
import { editorBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { getIconRegistry } from '../../../../platform/theme/common/iconRegistry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from '../../../common/theme.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ITerminalConfigurationService } from './terminal.js';
import { TerminalLaunchHelpAction } from './terminalActions.js';
import { TerminalEditorInput } from './terminalEditorInput.js';
import { TerminalExtensionsRegistry } from './terminalExtensions.js';
import { getColorClass, createColorStyleElement, getStandardColors } from './terminalIcon.js';
import { TerminalProcessManager } from './terminalProcessManager.js';
import { showRunRecentQuickPick } from './terminalRunRecentQuickPick.js';
import { TerminalStatusList } from './terminalStatusList.js';
import { getTerminalResourcesFromDragEvent, getTerminalUri } from './terminalUri.js';
import { TerminalWidgetManager } from './widgets/widgetManager.js';
import { LineDataEventAddon } from './xterm/lineDataEventAddon.js';
import { XtermTerminal, getXtermScaledDimensions } from './xterm/xtermTerminal.js';
import { getCommandHistory, getDirectoryHistory } from '../common/history.js';
import { DEFAULT_COMMANDS_TO_SKIP_SHELL, ITerminalProfileResolverService, TERMINAL_CREATION_COMMANDS, TERMINAL_VIEW_ID } from '../common/terminal.js';
import { TERMINAL_BACKGROUND_COLOR } from '../common/terminalColorRegistry.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
import { getWorkspaceForTerminal, preparePathForShell } from '../common/terminalEnvironment.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { isHorizontal, IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { importAMDNodeModule } from '../../../../amdX.js';
import { terminalStrings } from '../common/terminalStrings.js';
import { shouldPasteTerminalText } from '../common/terminalClipboard.js';
import { TerminalIconPicker } from './terminalIconPicker.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { TerminalResizeDebouncer } from './terminalResizeDebouncer.js';
import { openContextMenu } from './terminalContextMenu.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
let xtermConstructor;
const shellIntegrationSupportedShellTypes = [
    "bash",
    "zsh",
    "pwsh",
    "python",
];
let TerminalInstance = class TerminalInstance extends Disposable {
    static { TerminalInstance_1 = this; }
    static { this._instanceIdCounter = 1; }
    get domElement() { return this._wrapperElement; }
    get usedShellIntegrationInjection() { return this._usedShellIntegrationInjection; }
    pauseInputEvents(barrier) {
        this._pauseInputEventBarrier = barrier;
    }
    get store() {
        return this._store;
    }
    get extEnvironmentVariableCollection() { return this._processManager.extEnvironmentVariableCollection; }
    get waitOnExit() { return this._shellLaunchConfig.attachPersistentProcess?.waitOnExit || this._shellLaunchConfig.waitOnExit; }
    set waitOnExit(value) {
        this._shellLaunchConfig.waitOnExit = value;
    }
    get targetRef() { return this._targetRef; }
    get target() { return this._targetRef.object; }
    set target(value) {
        this._targetRef.object = value;
        this._onDidChangeTarget.fire(value);
    }
    get instanceId() { return this._instanceId; }
    get resource() { return this._resource; }
    get cols() {
        if (this._fixedCols !== undefined) {
            return this._fixedCols;
        }
        if (this._dimensionsOverride && this._dimensionsOverride.cols) {
            if (this._dimensionsOverride.forceExactSize) {
                return this._dimensionsOverride.cols;
            }
            return Math.min(Math.max(this._dimensionsOverride.cols, 2), this._cols);
        }
        return this._cols;
    }
    get rows() {
        if (this._fixedRows !== undefined) {
            return this._fixedRows;
        }
        if (this._dimensionsOverride && this._dimensionsOverride.rows) {
            if (this._dimensionsOverride.forceExactSize) {
                return this._dimensionsOverride.rows;
            }
            return Math.min(Math.max(this._dimensionsOverride.rows, 2), this._rows);
        }
        return this._rows;
    }
    get isDisposed() { return this._store.isDisposed; }
    get fixedCols() { return this._fixedCols; }
    get fixedRows() { return this._fixedRows; }
    get maxCols() { return this._cols; }
    get maxRows() { return this._rows; }
    get processId() { return this._processManager.shellProcessId; }
    get processReady() { return this._processManager.ptyProcessReady; }
    get hasChildProcesses() { return this.shellLaunchConfig.attachPersistentProcess?.hasChildProcesses || this._processManager.hasChildProcesses; }
    get reconnectionProperties() { return this.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties || this.shellLaunchConfig.reconnectionProperties; }
    get areLinksReady() { return this._areLinksReady; }
    get initialDataEvents() { return this._initialDataEvents; }
    get exitCode() { return this._exitCode; }
    get exitReason() { return this._exitReason; }
    get hadFocusOnExit() { return this._hadFocusOnExit; }
    get isTitleSetByProcess() { return !!this._messageTitleDisposable.value; }
    get shellLaunchConfig() { return this._shellLaunchConfig; }
    get shellType() { return this._shellType; }
    get os() { return this._processManager.os; }
    get isRemote() { return this._processManager.remoteAuthority !== undefined; }
    get remoteAuthority() { return this._processManager.remoteAuthority; }
    get hasFocus() { return dom.isAncestorOfActiveElement(this._wrapperElement); }
    get title() { return this._title; }
    get titleSource() { return this._titleSource; }
    get icon() { return this._getIcon(); }
    get color() { return this._getColor(); }
    get processName() { return this._processName; }
    get sequence() { return this._sequence; }
    get staticTitle() { return this._staticTitle; }
    get workspaceFolder() { return this._workspaceFolder; }
    get cwd() { return this._cwd; }
    get initialCwd() { return this._initialCwd; }
    get description() {
        if (this._description) {
            return this._description;
        }
        const type = this.shellLaunchConfig.attachPersistentProcess?.type || this.shellLaunchConfig.type;
        switch (type) {
            case 'Task': return terminalStrings.typeTask;
            case 'Local': return terminalStrings.typeLocal;
            default: return undefined;
        }
    }
    get userHome() { return this._userHome; }
    get shellIntegrationNonce() { return this._processManager.shellIntegrationNonce; }
    get injectedArgs() { return this._injectedArgs; }
    constructor(_terminalShellTypeContextKey, _terminalInRunCommandPicker, _shellLaunchConfig, _contextKeyService, _contextMenuService, instantiationService, _terminalConfigurationService, _terminalProfileResolverService, _pathService, _keybindingService, _notificationService, _preferencesService, _viewsService, _clipboardService, _themeService, _configurationService, _logService, _storageService, _accessibilityService, _productService, _quickInputService, workbenchEnvironmentService, _workspaceContextService, _editorService, _workspaceTrustRequestService, _historyService, _telemetryService, _openerService, _commandService, _accessibilitySignalService, _viewDescriptorService) {
        super();
        this._terminalShellTypeContextKey = _terminalShellTypeContextKey;
        this._terminalInRunCommandPicker = _terminalInRunCommandPicker;
        this._shellLaunchConfig = _shellLaunchConfig;
        this._contextKeyService = _contextKeyService;
        this._contextMenuService = _contextMenuService;
        this._terminalConfigurationService = _terminalConfigurationService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._pathService = _pathService;
        this._keybindingService = _keybindingService;
        this._notificationService = _notificationService;
        this._preferencesService = _preferencesService;
        this._viewsService = _viewsService;
        this._clipboardService = _clipboardService;
        this._themeService = _themeService;
        this._configurationService = _configurationService;
        this._logService = _logService;
        this._storageService = _storageService;
        this._accessibilityService = _accessibilityService;
        this._productService = _productService;
        this._quickInputService = _quickInputService;
        this._workspaceContextService = _workspaceContextService;
        this._editorService = _editorService;
        this._workspaceTrustRequestService = _workspaceTrustRequestService;
        this._historyService = _historyService;
        this._telemetryService = _telemetryService;
        this._openerService = _openerService;
        this._commandService = _commandService;
        this._accessibilitySignalService = _accessibilitySignalService;
        this._viewDescriptorService = _viewDescriptorService;
        this._contributions = new Map();
        this._latestXtermWriteData = 0;
        this._latestXtermParseData = 0;
        this._title = '';
        this._titleSource = TitleEventSource.Process;
        this._cols = 0;
        this._rows = 0;
        this._cwd = undefined;
        this._initialCwd = undefined;
        this._injectedArgs = undefined;
        this._layoutSettingsChanged = true;
        this._areLinksReady = false;
        this._initialDataEventsListener = this._register(new MutableDisposable());
        this._initialDataEvents = [];
        this._messageTitleDisposable = this._register(new MutableDisposable());
        this._dndObserver = this._register(new MutableDisposable());
        this._processName = '';
        this._usedShellIntegrationInjection = false;
        this.capabilities = this._register(new TerminalCapabilityStoreMultiplexer());
        this.disableLayout = false;
        this._targetRef = new ImmortalReference(undefined);
        this._onExit = new Emitter();
        this.onExit = this._onExit.event;
        this._onDisposed = this._register(new Emitter());
        this.onDisposed = this._onDisposed.event;
        this._onProcessIdReady = this._register(new Emitter());
        this.onProcessIdReady = this._onProcessIdReady.event;
        this._onProcessReplayComplete = this._register(new Emitter());
        this.onProcessReplayComplete = this._onProcessReplayComplete.event;
        this._onTitleChanged = this._register(new Emitter());
        this.onTitleChanged = this._onTitleChanged.event;
        this._onIconChanged = this._register(new Emitter());
        this.onIconChanged = this._onIconChanged.event;
        this._onWillData = this._register(new Emitter());
        this.onWillData = this._onWillData.event;
        this._onData = this._register(new Emitter());
        this.onData = this._onData.event;
        this._onBinary = this._register(new Emitter());
        this.onBinary = this._onBinary.event;
        this._onRequestExtHostProcess = this._register(new Emitter());
        this.onRequestExtHostProcess = this._onRequestExtHostProcess.event;
        this._onDimensionsChanged = this._register(new Emitter());
        this.onDimensionsChanged = this._onDimensionsChanged.event;
        this._onMaximumDimensionsChanged = this._register(new Emitter());
        this.onMaximumDimensionsChanged = this._onMaximumDimensionsChanged.event;
        this._onDidFocus = this._register(new Emitter());
        this.onDidFocus = this._onDidFocus.event;
        this._onDidRequestFocus = this._register(new Emitter());
        this.onDidRequestFocus = this._onDidRequestFocus.event;
        this._onDidBlur = this._register(new Emitter());
        this.onDidBlur = this._onDidBlur.event;
        this._onDidInputData = this._register(new Emitter());
        this.onDidInputData = this._onDidInputData.event;
        this._onDidChangeSelection = this._register(new Emitter());
        this.onDidChangeSelection = this._onDidChangeSelection.event;
        this._onRequestAddInstanceToGroup = this._register(new Emitter());
        this.onRequestAddInstanceToGroup = this._onRequestAddInstanceToGroup.event;
        this._onDidChangeHasChildProcesses = this._register(new Emitter());
        this.onDidChangeHasChildProcesses = this._onDidChangeHasChildProcesses.event;
        this._onDidExecuteText = this._register(new Emitter());
        this.onDidExecuteText = this._onDidExecuteText.event;
        this._onDidChangeTarget = this._register(new Emitter());
        this.onDidChangeTarget = this._onDidChangeTarget.event;
        this._onDidSendText = this._register(new Emitter());
        this.onDidSendText = this._onDidSendText.event;
        this._onDidChangeShellType = this._register(new Emitter());
        this.onDidChangeShellType = this._onDidChangeShellType.event;
        this._onDidChangeVisibility = this._register(new Emitter());
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this._onWillPaste = this._register(new Emitter());
        this.onWillPaste = this._onWillPaste.event;
        this._onDidPaste = this._register(new Emitter());
        this.onDidPaste = this._onDidPaste.event;
        this._onLineData = this._register(new Emitter({
            onDidAddFirstListener: async () => (this.xterm ?? await this._xtermReadyPromise).raw.loadAddon(this._lineDataEventAddon)
        }));
        this.onLineData = this._onLineData.event;
        this._overrideCopySelection = undefined;
        this._wrapperElement = document.createElement('div');
        this._wrapperElement.classList.add('terminal-wrapper');
        this._widgetManager = this._register(instantiationService.createInstance(TerminalWidgetManager));
        this._skipTerminalCommands = [];
        this._isExiting = false;
        this._hadFocusOnExit = false;
        this._isVisible = false;
        this._instanceId = TerminalInstance_1._instanceIdCounter++;
        this._hasHadInput = false;
        this._fixedRows = _shellLaunchConfig.attachPersistentProcess?.fixedDimensions?.rows;
        this._fixedCols = _shellLaunchConfig.attachPersistentProcess?.fixedDimensions?.cols;
        this._resource = getTerminalUri(this._workspaceContextService.getWorkspace().id, this.instanceId, this.title);
        if (this._shellLaunchConfig.attachPersistentProcess?.hideFromUser) {
            this._shellLaunchConfig.hideFromUser = this._shellLaunchConfig.attachPersistentProcess.hideFromUser;
        }
        if (this._shellLaunchConfig.attachPersistentProcess?.isFeatureTerminal) {
            this._shellLaunchConfig.isFeatureTerminal = this._shellLaunchConfig.attachPersistentProcess.isFeatureTerminal;
        }
        if (this._shellLaunchConfig.attachPersistentProcess?.type) {
            this._shellLaunchConfig.type = this._shellLaunchConfig.attachPersistentProcess.type;
        }
        if (this.shellLaunchConfig.cwd) {
            const cwdUri = typeof this._shellLaunchConfig.cwd === 'string' ? URI.from({
                scheme: Schemas.file,
                path: this._shellLaunchConfig.cwd
            }) : this._shellLaunchConfig.cwd;
            if (cwdUri) {
                this._workspaceFolder = this._workspaceContextService.getWorkspaceFolder(cwdUri) ?? undefined;
            }
        }
        if (!this._workspaceFolder) {
            const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
            this._workspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
        }
        const scopedContextKeyService = this._register(_contextKeyService.createScoped(this._wrapperElement));
        this._scopedContextKeyService = scopedContextKeyService;
        this._scopedInstantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
        this._terminalFocusContextKey = TerminalContextKeys.focus.bindTo(scopedContextKeyService);
        this._terminalHasFixedWidth = TerminalContextKeys.terminalHasFixedWidth.bindTo(scopedContextKeyService);
        this._terminalHasTextContextKey = TerminalContextKeys.textSelected.bindTo(scopedContextKeyService);
        this._terminalAltBufferActiveContextKey = TerminalContextKeys.altBufferActive.bindTo(scopedContextKeyService);
        this._terminalShellIntegrationEnabledContextKey = TerminalContextKeys.terminalShellIntegrationEnabled.bindTo(scopedContextKeyService);
        this._logService.trace(`terminalInstance#ctor (instanceId: ${this.instanceId})`, this._shellLaunchConfig);
        this._register(this.capabilities.onDidAddCapabilityType(e => {
            this._logService.debug('terminalInstance added capability', e);
            if (e === 0) {
                this.capabilities.get(0)?.onDidChangeCwd(e => {
                    this._cwd = e;
                    this._setTitle(this.title, TitleEventSource.Config);
                    this._scopedInstantiationService.invokeFunction(getDirectoryHistory)?.add(e, { remoteAuthority: this.remoteAuthority });
                });
            }
            else if (e === 2) {
                const commandCapability = this.capabilities.get(2);
                commandCapability?.onCommandFinished(e => {
                    if (e.command.trim().length > 0) {
                        this._scopedInstantiationService.invokeFunction(getCommandHistory)?.add(e.command, { shellType: this._shellType });
                    }
                });
            }
        }));
        this._register(this.capabilities.onDidRemoveCapabilityType(e => this._logService.debug('terminalInstance removed capability', e)));
        if (!this.shellLaunchConfig.executable && !workbenchEnvironmentService.remoteAuthority) {
            this._terminalProfileResolverService.resolveIcon(this._shellLaunchConfig, OS);
        }
        this._icon = _shellLaunchConfig.attachPersistentProcess?.icon || _shellLaunchConfig.icon;
        if (this.shellLaunchConfig.customPtyImplementation) {
            this._setTitle(this._shellLaunchConfig.name, TitleEventSource.Api);
        }
        this.statusList = this._register(this._scopedInstantiationService.createInstance(TerminalStatusList));
        this._initDimensions();
        this._processManager = this._createProcessManager();
        this._containerReadyBarrier = new AutoOpenBarrier(100);
        this._attachBarrier = new AutoOpenBarrier(1000);
        this._xtermReadyPromise = this._createXterm();
        this._xtermReadyPromise.then(async () => {
            await this._containerReadyBarrier.wait();
            if (!this.shellLaunchConfig.customPtyImplementation && this._terminalConfigurationService.config.shellIntegration?.enabled && !this.shellLaunchConfig.executable) {
                const os = await this._processManager.getBackendOS();
                const defaultProfile = (await this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority: this.remoteAuthority, os }));
                this.shellLaunchConfig.executable = defaultProfile.path;
                this.shellLaunchConfig.args = defaultProfile.args;
                if (this.shellLaunchConfig.isExtensionOwnedTerminal) {
                    this.shellLaunchConfig.icon ??= defaultProfile.icon;
                    this.shellLaunchConfig.color ??= defaultProfile.color;
                    this.shellLaunchConfig.env ??= defaultProfile.env;
                }
                else {
                    this.shellLaunchConfig.icon = defaultProfile.icon;
                    this.shellLaunchConfig.color = defaultProfile.color;
                    this.shellLaunchConfig.env = defaultProfile.env;
                }
            }
            await this._createProcess();
            if (this.shellLaunchConfig.attachPersistentProcess) {
                this._cwd = this.shellLaunchConfig.attachPersistentProcess.cwd;
                this._setTitle(this.shellLaunchConfig.attachPersistentProcess.title, this.shellLaunchConfig.attachPersistentProcess.titleSource);
                this.setShellType(this.shellType);
            }
            if (this._fixedCols) {
                await this._addScrollbar();
            }
        }).catch((err) => {
            if (!this.isDisposed) {
                throw err;
            }
        });
        this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration("accessibility.verbosity.terminal")) {
                this._setAriaLabel(this.xterm?.raw, this._instanceId, this.title);
            }
            if (e.affectsConfiguration('terminal.integrated')) {
                this.updateConfig();
                this.setVisible(this._isVisible);
            }
            const layoutSettings = [
                "terminal.integrated.fontSize",
                "terminal.integrated.fontFamily",
                "terminal.integrated.fontWeight",
                "terminal.integrated.fontWeightBold",
                "terminal.integrated.letterSpacing",
                "terminal.integrated.lineHeight",
                'editor.fontFamily'
            ];
            if (layoutSettings.some(id => e.affectsConfiguration(id))) {
                this._layoutSettingsChanged = true;
                await this._resize();
            }
            if (e.affectsConfiguration("terminal.integrated.unicodeVersion")) {
                this._updateUnicodeVersion();
            }
            if (e.affectsConfiguration('editor.accessibilitySupport')) {
                this.updateAccessibilitySupport();
            }
            if (e.affectsConfiguration("terminal.integrated.tabs.title") ||
                e.affectsConfiguration("terminal.integrated.tabs.separator") ||
                e.affectsConfiguration("terminal.integrated.tabs.description")) {
                this._labelComputer?.refreshLabel(this);
            }
        }));
        this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._labelComputer?.refreshLabel(this)));
        let initialDataEventsTimeout = dom.getWindow(this._container).setTimeout(() => {
            initialDataEventsTimeout = undefined;
            this._initialDataEvents = undefined;
            this._initialDataEventsListener.clear();
        }, 10000);
        this._register(toDisposable(() => {
            if (initialDataEventsTimeout) {
                dom.getWindow(this._container).clearTimeout(initialDataEventsTimeout);
            }
        }));
        const contributionDescs = TerminalExtensionsRegistry.getTerminalContributions();
        for (const desc of contributionDescs) {
            if (this._contributions.has(desc.id)) {
                onUnexpectedError(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
                continue;
            }
            let contribution;
            try {
                contribution = this._register(this._scopedInstantiationService.createInstance(desc.ctor, this, this._processManager, this._widgetManager));
                this._contributions.set(desc.id, contribution);
            }
            catch (err) {
                onUnexpectedError(err);
            }
            this._xtermReadyPromise.then(xterm => {
                contribution.xtermReady?.(xterm);
            });
            this._register(this.onDisposed(() => {
                contribution.dispose();
                this._contributions.delete(desc.id);
                if ('instance' in contribution) {
                    delete contribution.instance;
                }
                if ('_instance' in contribution) {
                    delete contribution._instance;
                }
            }));
        }
    }
    getContribution(id) {
        return this._contributions.get(id);
    }
    _getIcon() {
        if (!this._icon) {
            this._icon = this._processManager.processState >= 2
                ? getIconRegistry().getIcon(this._configurationService.getValue("terminal.integrated.tabs.defaultIcon"))
                : undefined;
        }
        return this._icon;
    }
    _getColor() {
        if (this.shellLaunchConfig.color) {
            return this.shellLaunchConfig.color;
        }
        if (this.shellLaunchConfig?.attachPersistentProcess?.color) {
            return this.shellLaunchConfig.attachPersistentProcess.color;
        }
        if (this._processManager.processState >= 2) {
            return undefined;
        }
        return undefined;
    }
    _initDimensions() {
        if (!this._container) {
            this._cols = 80;
            this._rows = 30;
            return;
        }
        const computedStyle = dom.getWindow(this._container).getComputedStyle(this._container);
        const width = parseInt(computedStyle.width);
        const height = parseInt(computedStyle.height);
        this._evaluateColsAndRows(width, height);
    }
    _evaluateColsAndRows(width, height) {
        if (!width || !height) {
            this._setLastKnownColsAndRows();
            return null;
        }
        const dimension = this._getDimension(width, height);
        if (!dimension) {
            this._setLastKnownColsAndRows();
            return null;
        }
        const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement));
        const newRC = getXtermScaledDimensions(dom.getWindow(this.domElement), font, dimension.width, dimension.height);
        if (!newRC) {
            this._setLastKnownColsAndRows();
            return null;
        }
        if (this._cols !== newRC.cols || this._rows !== newRC.rows) {
            this._cols = newRC.cols;
            this._rows = newRC.rows;
            this._fireMaximumDimensionsChanged();
        }
        return dimension.width;
    }
    _setLastKnownColsAndRows() {
        if (TerminalInstance_1._lastKnownGridDimensions) {
            this._cols = TerminalInstance_1._lastKnownGridDimensions.cols;
            this._rows = TerminalInstance_1._lastKnownGridDimensions.rows;
        }
    }
    _fireMaximumDimensionsChanged() {
        this._onMaximumDimensionsChanged.fire();
    }
    _getDimension(width, height) {
        const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement));
        if (!font || !font.charWidth || !font.charHeight) {
            return undefined;
        }
        if (!this.xterm?.raw.element) {
            return undefined;
        }
        const computedStyle = dom.getWindow(this.xterm.raw.element).getComputedStyle(this.xterm.raw.element);
        const horizontalPadding = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight) + 14;
        const verticalPadding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
        TerminalInstance_1._lastKnownCanvasDimensions = new dom.Dimension(Math.min(4096, width - horizontalPadding), height - verticalPadding + (this._hasScrollBar && this._horizontalScrollbar ? -5 : 0));
        return TerminalInstance_1._lastKnownCanvasDimensions;
    }
    get persistentProcessId() { return this._processManager.persistentProcessId; }
    get shouldPersist() { return this._processManager.shouldPersist && !this.shellLaunchConfig.isTransient && (!this.reconnectionProperties || this._configurationService.getValue('task.reconnection') === true); }
    static getXtermConstructor(keybindingService, contextKeyService) {
        const keybinding = keybindingService.lookupKeybinding("workbench.action.terminal.focusAccessibleBuffer", contextKeyService);
        if (xtermConstructor) {
            return xtermConstructor;
        }
        xtermConstructor = Promises.withAsyncBody(async (resolve) => {
            const Terminal = (await importAMDNodeModule('@xterm/xterm', 'lib/xterm.js')).Terminal;
            Terminal.strings.promptLabel = nls.localize('terminal.integrated.a11yPromptLabel', 'Terminal input');
            Terminal.strings.tooMuchOutput = keybinding ? nls.localize('terminal.integrated.useAccessibleBuffer', 'Use the accessible buffer {0} to manually review output', keybinding.getLabel()) : nls.localize('terminal.integrated.useAccessibleBufferNoKb', 'Use the Terminal: Focus Accessible Buffer command to manually review output');
            resolve(Terminal);
        });
        return xtermConstructor;
    }
    async _createXterm() {
        const Terminal = await TerminalInstance_1.getXtermConstructor(this._keybindingService, this._contextKeyService);
        if (this.isDisposed) {
            throw new ErrorNoTelemetry('Terminal disposed of during xterm.js creation');
        }
        const disableShellIntegrationReporting = (this.shellLaunchConfig.executable === undefined || this.shellType === undefined) || !shellIntegrationSupportedShellTypes.includes(this.shellType);
        const xterm = this._scopedInstantiationService.createInstance(XtermTerminal, Terminal, {
            cols: this._cols,
            rows: this._rows,
            xtermColorProvider: this._scopedInstantiationService.createInstance(TerminalInstanceColorProvider, this._targetRef),
            capabilities: this.capabilities,
            shellIntegrationNonce: this._processManager.shellIntegrationNonce,
            disableShellIntegrationReporting,
        });
        this.xterm = xterm;
        this._resizeDebouncer = this._register(new TerminalResizeDebouncer(() => this._isVisible, () => xterm, async (cols, rows) => {
            xterm.raw.resize(cols, rows);
            await this._updatePtyDimensions(xterm.raw);
        }, async (cols) => {
            xterm.raw.resize(cols, xterm.raw.rows);
            await this._updatePtyDimensions(xterm.raw);
        }, async (rows) => {
            xterm.raw.resize(xterm.raw.cols, rows);
            await this._updatePtyDimensions(xterm.raw);
        }));
        this._register(toDisposable(() => this._resizeDebouncer = undefined));
        this.updateAccessibilitySupport();
        this._register(this.xterm.onDidRequestRunCommand(e => {
            if (e.copyAsHtml) {
                this.copySelection(true, e.command);
            }
            else {
                this.sendText(e.command.command, e.noNewLine ? false : true);
            }
        }));
        this._register(this.xterm.onDidRequestRefreshDimensions(() => {
            if (this._lastLayoutDimensions) {
                this.layout(this._lastLayoutDimensions);
            }
        }));
        const initialTextWrittenPromise = this._shellLaunchConfig.initialText ? new Promise(r => this._writeInitialText(xterm, r)) : undefined;
        const lineDataEventAddon = this._register(new LineDataEventAddon(initialTextWrittenPromise));
        this._register(lineDataEventAddon.onLineData(e => this._onLineData.fire(e)));
        this._lineDataEventAddon = lineDataEventAddon;
        disposableTimeout(() => {
            this._register(xterm.raw.onBell(() => {
                if (this._configurationService.getValue("terminal.integrated.enableBell") || this._configurationService.getValue("terminal.integrated.enableVisualBell")) {
                    this.statusList.add({
                        id: "bell",
                        severity: Severity.Warning,
                        icon: Codicon.bell,
                        tooltip: nls.localize('bellStatus', "Bell")
                    }, this._terminalConfigurationService.config.bellDuration);
                }
                this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalBell);
            }));
        }, 1000, this._store);
        this._register(xterm.raw.onSelectionChange(async () => this._onSelectionChange()));
        this._register(xterm.raw.buffer.onBufferChange(() => this._refreshAltBufferContextKey()));
        this._register(this._processManager.onProcessData(e => this._onProcessData(e)));
        this._register(xterm.raw.onData(async (data) => {
            await this._pauseInputEventBarrier?.wait();
            await this._processManager.write(data);
            this._onDidInputData.fire(data);
        }));
        this._register(xterm.raw.onBinary(data => this._processManager.processBinary(data)));
        this._register(this._processManager.onProcessReady(async (processTraits) => {
            if (this._processManager.os) {
                lineDataEventAddon.setOperatingSystem(this._processManager.os);
            }
            xterm.raw.options.windowsPty = processTraits.windowsPty;
        }));
        this._register(this._processManager.onRestoreCommands(e => this.xterm?.shellIntegration.deserialize(e)));
        this._register(this._viewDescriptorService.onDidChangeLocation(({ views }) => {
            if (views.some(v => v.id === TERMINAL_VIEW_ID)) {
                xterm.refresh();
            }
        }));
        if (!this.capabilities.has(0)) {
            let onKeyListener = xterm.raw.onKey(e => {
                const event = new StandardKeyboardEvent(e.domEvent);
                if (event.equals(3)) {
                    this._updateProcessCwd();
                }
            });
            this._register(this.capabilities.onDidAddCapabilityType(e => {
                if (e === 0) {
                    onKeyListener?.dispose();
                    onKeyListener = undefined;
                }
            }));
        }
        this._pathService.userHome().then(userHome => {
            this._userHome = userHome.fsPath;
        });
        if (this._isVisible) {
            this._open();
        }
        return xterm;
    }
    async runCommand(commandLine, shouldExecute) {
        let commandDetection = this.capabilities.get(2);
        if (!commandDetection && (this._processManager.processState === 1 || this._processManager.processState === 2)) {
            const store = new DisposableStore();
            await Promise.race([
                new Promise(r => {
                    store.add(this.capabilities.onDidAddCapabilityType(e => {
                        if (e === 2) {
                            commandDetection = this.capabilities.get(2);
                            r();
                        }
                    }));
                }),
                timeout(2000),
            ]);
            store.dispose();
        }
        if (!commandDetection || commandDetection.promptInputModel.value.length > 0) {
            await this.sendText('\x03', false);
            await timeout(100);
        }
        await this.sendText(commandLine, shouldExecute, !shouldExecute);
    }
    async runRecent(type, filterMode, value) {
        return this._scopedInstantiationService.invokeFunction(showRunRecentQuickPick, this, this._terminalInRunCommandPicker, type, filterMode, value);
    }
    detachFromElement() {
        this._wrapperElement.remove();
        this._container = undefined;
    }
    attachToElement(container) {
        if (this._container === container) {
            return;
        }
        if (!this._attachBarrier.isOpen()) {
            this._attachBarrier.open();
        }
        this._container = container;
        this._container.appendChild(this._wrapperElement);
        if (this.xterm?.raw.element) {
            this.xterm.raw.open(this.xterm.raw.element);
        }
        this.xterm?.refresh();
        setTimeout(() => this._initDragAndDrop(container));
    }
    _open() {
        if (!this.xterm || this.xterm.raw.element) {
            return;
        }
        if (!this._container || !this._container.isConnected) {
            throw new Error('A container element needs to be set with `attachToElement` and be part of the DOM before calling `_open`');
        }
        const xtermElement = document.createElement('div');
        this._wrapperElement.appendChild(xtermElement);
        this._container.appendChild(this._wrapperElement);
        const xterm = this.xterm;
        this._wrapperElement.xterm = xterm.raw;
        const screenElement = xterm.attachToElement(xtermElement);
        for (const contribution of this._contributions.values()) {
            if (!this.xterm) {
                this._xtermReadyPromise.then(xterm => contribution.xtermOpen?.(xterm));
            }
            else {
                contribution.xtermOpen?.(this.xterm);
            }
        }
        this._register(xterm.shellIntegration.onDidChangeStatus(() => {
            if (this.hasFocus) {
                this._setShellIntegrationContextKey();
            }
            else {
                this._terminalShellIntegrationEnabledContextKey.reset();
            }
        }));
        if (!xterm.raw.element || !xterm.raw.textarea) {
            throw new Error('xterm elements not set after open');
        }
        this._setAriaLabel(xterm.raw, this._instanceId, this._title);
        xterm.raw.attachCustomKeyEventHandler((event) => {
            if (this._isExiting) {
                return false;
            }
            const standardKeyboardEvent = new StandardKeyboardEvent(event);
            const resolveResult = this._keybindingService.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
            const isValidChord = resolveResult.kind === 1 && this._terminalConfigurationService.config.allowChords && event.key !== 'Escape';
            if (this._keybindingService.inChordMode || isValidChord) {
                event.preventDefault();
                return false;
            }
            const SHOW_TERMINAL_CONFIG_PROMPT_KEY = 'terminal.integrated.showTerminalConfigPrompt';
            const EXCLUDED_KEYS = ['RightArrow', 'LeftArrow', 'UpArrow', 'DownArrow', 'Space', 'Meta', 'Control', 'Shift', 'Alt', '', 'Delete', 'Backspace', 'Tab'];
            if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, -1, true) &&
                !EXCLUDED_KEYS.includes(event.key) &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey) {
                this._hasHadInput = true;
            }
            if (resolveResult.kind === 2 && resolveResult.commandId && this._skipTerminalCommands.some(k => k === resolveResult.commandId) && !this._terminalConfigurationService.config.sendKeybindingsToShell) {
                if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, -1, true) &&
                    this._hasHadInput &&
                    !TERMINAL_CREATION_COMMANDS.includes(resolveResult.commandId)) {
                    this._notificationService.prompt(Severity.Info, nls.localize('keybindingHandling', "Some keybindings don't go to the terminal by default and are handled by {0} instead.", this._productService.nameLong), [
                        {
                            label: nls.localize('configureTerminalSettings', "Configure Terminal Settings"),
                            run: () => {
                                this._preferencesService.openSettings({ jsonEditor: false, query: `@id:${"terminal.integrated.commandsToSkipShell"},${"terminal.integrated.sendKeybindingsToShell"},${"terminal.integrated.allowChords"}` });
                            }
                        }
                    ]);
                    this._storageService.store(SHOW_TERMINAL_CONFIG_PROMPT_KEY, false, -1, 0);
                }
                event.preventDefault();
                return false;
            }
            if (this._terminalConfigurationService.config.allowMnemonics && !isMacintosh && event.altKey) {
                return false;
            }
            if (TabFocus.getTabFocusMode() && event.key === 'Tab') {
                return false;
            }
            if (event.key === 'Tab' && event.shiftKey) {
                event.preventDefault();
                return true;
            }
            if (isWindows && event.altKey && event.key === 'F4' && !event.ctrlKey) {
                return false;
            }
            if (!BrowserFeatures.clipboard.readText && event.key === 'v' && event.ctrlKey) {
                return false;
            }
            return true;
        });
        this._register(dom.addDisposableListener(xterm.raw.element, 'mousedown', () => {
            const listener = dom.addDisposableListener(xterm.raw.element.ownerDocument, 'mouseup', () => {
                setTimeout(() => this._refreshSelectionContextKey(), 0);
                listener.dispose();
            });
        }));
        this._register(dom.addDisposableListener(xterm.raw.element, 'touchstart', () => {
            xterm.raw.focus();
        }));
        this._register(dom.addDisposableListener(xterm.raw.element, 'keyup', () => {
            setTimeout(() => this._refreshSelectionContextKey(), 0);
        }));
        this._register(dom.addDisposableListener(xterm.raw.textarea, 'focus', () => this._setFocus(true)));
        this._register(dom.addDisposableListener(xterm.raw.textarea, 'blur', () => this._setFocus(false)));
        this._register(dom.addDisposableListener(xterm.raw.textarea, 'focusout', () => this._setFocus(false)));
        this._initDragAndDrop(this._container);
        this._widgetManager.attachToElement(screenElement);
        if (this._lastLayoutDimensions) {
            this.layout(this._lastLayoutDimensions);
        }
        this.updateConfig();
        if (xterm.raw.options.disableStdin) {
            this._attachPressAnyKeyToCloseListener(xterm.raw);
        }
    }
    _setFocus(focused) {
        if (focused) {
            this._terminalFocusContextKey.set(true);
            this._setShellIntegrationContextKey();
            this._onDidFocus.fire(this);
        }
        else {
            this.resetFocusContextKey();
            this._onDidBlur.fire(this);
            this._refreshSelectionContextKey();
        }
    }
    _setShellIntegrationContextKey() {
        if (this.xterm) {
            this._terminalShellIntegrationEnabledContextKey.set(this.xterm.shellIntegration.status === 2);
        }
    }
    resetFocusContextKey() {
        this._terminalFocusContextKey.reset();
        this._terminalShellIntegrationEnabledContextKey.reset();
    }
    _initDragAndDrop(container) {
        const store = new DisposableStore();
        const dndController = store.add(this._scopedInstantiationService.createInstance(TerminalInstanceDragAndDropController, container));
        store.add(dndController.onDropTerminal(e => this._onRequestAddInstanceToGroup.fire(e)));
        store.add(dndController.onDropFile(async (path) => {
            this.focus();
            await this.sendPath(path, false);
        }));
        store.add(new dom.DragAndDropObserver(container, dndController));
        this._dndObserver.value = store;
    }
    hasSelection() {
        return this.xterm ? this.xterm.raw.hasSelection() : false;
    }
    async copySelection(asHtml, command) {
        const xterm = await this._xtermReadyPromise;
        await xterm.copySelection(asHtml, command);
    }
    get selection() {
        return this.xterm && this.hasSelection() ? this.xterm.raw.getSelection() : undefined;
    }
    clearSelection() {
        this.xterm?.raw.clearSelection();
    }
    _refreshAltBufferContextKey() {
        this._terminalAltBufferActiveContextKey.set(!!(this.xterm && this.xterm.raw.buffer.active === this.xterm.raw.buffer.alternate));
    }
    dispose(reason) {
        if (this.shellLaunchConfig.type === 'Task' && reason === TerminalExitReason.Process && this._exitCode !== 0 && !this.shellLaunchConfig.waitOnExit) {
            return;
        }
        if (this.isDisposed) {
            return;
        }
        this._logService.trace(`terminalInstance#dispose (instanceId: ${this.instanceId})`);
        dispose(this._widgetManager);
        if (this.xterm?.raw.element) {
            this._hadFocusOnExit = this.hasFocus;
        }
        if (this._wrapperElement.xterm) {
            this._wrapperElement.xterm = undefined;
        }
        if (this._horizontalScrollbar) {
            this._horizontalScrollbar.dispose();
            this._horizontalScrollbar = undefined;
        }
        try {
            this.xterm?.dispose();
        }
        catch (err) {
            this._logService.error('Exception occurred during xterm disposal', err);
        }
        if (isFirefox) {
            this.resetFocusContextKey();
            this._terminalHasTextContextKey.reset();
            this._onDidBlur.fire(this);
        }
        if (this._pressAnyKeyToCloseListener) {
            this._pressAnyKeyToCloseListener.dispose();
            this._pressAnyKeyToCloseListener = undefined;
        }
        if (this._exitReason === undefined) {
            this._exitReason = reason ?? TerminalExitReason.Unknown;
        }
        this._processManager.dispose();
        this._onProcessExit(undefined);
        this._onDisposed.fire(this);
        super.dispose();
    }
    async detachProcessAndDispose(reason) {
        await this._processManager.detachFromProcess(reason === TerminalExitReason.User);
        this.dispose(reason);
    }
    focus(force) {
        this._refreshAltBufferContextKey();
        if (!this.xterm) {
            return;
        }
        if (force || !dom.getActiveWindow().getSelection()?.toString()) {
            this.xterm.raw.focus();
            this._onDidRequestFocus.fire();
        }
    }
    async focusWhenReady(force) {
        await this._xtermReadyPromise;
        await this._attachBarrier.wait();
        this.focus(force);
    }
    async paste() {
        await this._paste(await this._clipboardService.readText());
    }
    async pasteSelection() {
        await this._paste(await this._clipboardService.readText('selection'));
    }
    async _paste(value) {
        if (!this.xterm) {
            return;
        }
        let currentText = value;
        const shouldPasteText = await this._scopedInstantiationService.invokeFunction(shouldPasteTerminalText, currentText, this.xterm?.raw.modes.bracketedPasteMode);
        if (!shouldPasteText) {
            return;
        }
        if (typeof shouldPasteText === 'object') {
            currentText = shouldPasteText.modifiedText;
        }
        this.focus();
        this._onWillPaste.fire(currentText);
        this.xterm.raw.paste(currentText);
        this._onDidPaste.fire(currentText);
    }
    async sendText(text, shouldExecute, bracketedPasteMode) {
        if (bracketedPasteMode && this.xterm?.raw.modes.bracketedPasteMode) {
            text = `\x1b[200~${text}\x1b[201~`;
        }
        text = text.replace(/\r?\n/g, '\r');
        if (shouldExecute && !text.endsWith('\r')) {
            text += '\r';
        }
        this._logService.debug('sending data (vscode)', text);
        await this._processManager.write(text);
        this._onDidInputData.fire(text);
        this._onDidSendText.fire(text);
        this.xterm?.scrollToBottom();
        if (shouldExecute) {
            this._onDidExecuteText.fire();
        }
    }
    async sendPath(originalPath, shouldExecute) {
        return this.sendText(await this.preparePathForShell(originalPath), shouldExecute);
    }
    async preparePathForShell(originalPath) {
        await this.processReady;
        return preparePathForShell(originalPath, this.shellLaunchConfig.executable, this.title, this.shellType, this._processManager.backend, this._processManager.os);
    }
    setVisible(visible) {
        const didChange = this._isVisible !== visible;
        this._isVisible = visible;
        this._wrapperElement.classList.toggle('active', visible);
        if (visible && this.xterm) {
            this._open();
            this._resizeDebouncer?.flush();
            this._resize();
        }
        if (didChange) {
            this._onDidChangeVisibility.fire(visible);
        }
    }
    scrollDownLine() {
        this.xterm?.scrollDownLine();
    }
    scrollDownPage() {
        this.xterm?.scrollDownPage();
    }
    scrollToBottom() {
        this.xterm?.scrollToBottom();
    }
    scrollUpLine() {
        this.xterm?.scrollUpLine();
    }
    scrollUpPage() {
        this.xterm?.scrollUpPage();
    }
    scrollToTop() {
        this.xterm?.scrollToTop();
    }
    clearBuffer() {
        this._processManager.clearBuffer();
        this.xterm?.clearBuffer();
    }
    _refreshSelectionContextKey() {
        const isActive = !!this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
        let isEditorActive = false;
        const editor = this._editorService.activeEditor;
        if (editor) {
            isEditorActive = editor instanceof TerminalEditorInput;
        }
        this._terminalHasTextContextKey.set((isActive || isEditorActive) && this.hasSelection());
    }
    _createProcessManager() {
        let deserializedCollections;
        if (this.shellLaunchConfig.attachPersistentProcess?.environmentVariableCollections) {
            deserializedCollections = deserializeEnvironmentVariableCollections(this.shellLaunchConfig.attachPersistentProcess.environmentVariableCollections);
        }
        const processManager = this._scopedInstantiationService.createInstance(TerminalProcessManager, this._instanceId, this.shellLaunchConfig?.cwd, deserializedCollections, this.shellLaunchConfig.attachPersistentProcess?.shellIntegrationNonce);
        this.capabilities.add(processManager.capabilities);
        this._register(processManager.onProcessReady(async (e) => {
            this._onProcessIdReady.fire(this);
            this._initialCwd = await this.getInitialCwd();
            if (!this._labelComputer) {
                this._labelComputer = this._register(this._scopedInstantiationService.createInstance(TerminalLabelComputer));
                this._register(this._labelComputer.onDidChangeLabel(e => {
                    const wasChanged = this._title !== e.title || this._description !== e.description;
                    if (wasChanged) {
                        this._title = e.title;
                        this._description = e.description;
                        this._onTitleChanged.fire(this);
                    }
                }));
            }
            if (this._shellLaunchConfig.name) {
                this._setTitle(this._shellLaunchConfig.name, TitleEventSource.Api);
            }
            else {
                setTimeout(() => {
                    this._xtermReadyPromise.then(xterm => {
                        this._messageTitleDisposable.value = xterm.raw.onTitleChange(e => this._onTitleChange(e));
                    });
                });
                this._setTitle(this._shellLaunchConfig.executable, TitleEventSource.Process);
            }
        }));
        this._register(processManager.onProcessExit(exitCode => this._onProcessExit(exitCode)));
        this._register(processManager.onDidChangeProperty(({ type, value }) => {
            switch (type) {
                case "cwd":
                    this._cwd = value;
                    this._labelComputer?.refreshLabel(this);
                    break;
                case "initialCwd":
                    this._initialCwd = value;
                    this._cwd = this._initialCwd;
                    this._setTitle(this.title, TitleEventSource.Config);
                    this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
                    this._onIconChanged.fire({ instance: this, userInitiated: false });
                    break;
                case "title":
                    this._setTitle(value ?? '', TitleEventSource.Process);
                    break;
                case "overrideDimensions":
                    this.setOverrideDimensions(value, true);
                    break;
                case "resolvedShellLaunchConfig":
                    this._setResolvedShellLaunchConfig(value);
                    break;
                case "shellType":
                    this.setShellType(value);
                    break;
                case "hasChildProcesses":
                    this._onDidChangeHasChildProcesses.fire(value);
                    break;
                case "usedShellIntegrationInjection":
                    this._usedShellIntegrationInjection = true;
                    break;
            }
        }));
        this._initialDataEventsListener.value = processManager.onProcessData(ev => this._initialDataEvents?.push(ev.data));
        this._register(processManager.onProcessReplayComplete(() => this._onProcessReplayComplete.fire()));
        this._register(processManager.onEnvironmentVariableInfoChanged(e => this._onEnvironmentVariableInfoChanged(e)));
        this._register(processManager.onPtyDisconnect(() => {
            if (this.xterm) {
                this.xterm.raw.options.disableStdin = true;
            }
            this.statusList.add({
                id: "disconnected",
                severity: Severity.Error,
                icon: Codicon.debugDisconnect,
                tooltip: nls.localize('disconnectStatus', "Lost connection to process")
            });
        }));
        this._register(processManager.onPtyReconnect(() => {
            if (this.xterm) {
                this.xterm.raw.options.disableStdin = false;
            }
            this.statusList.remove("disconnected");
        }));
        return processManager;
    }
    async _createProcess() {
        if (this.isDisposed) {
            return;
        }
        const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(Schemas.file);
        if (activeWorkspaceRootUri) {
            const trusted = await this._trust();
            if (!trusted) {
                this._onProcessExit({ message: nls.localize('workspaceNotTrustedCreateTerminal', "Cannot launch a terminal process in an untrusted workspace") });
            }
        }
        else if (this._cwd && this._userHome && this._cwd !== this._userHome) {
            this._onProcessExit({
                message: nls.localize('workspaceNotTrustedCreateTerminalCwd', "Cannot launch a terminal process in an untrusted workspace with cwd {0} and userHome {1}", this._cwd, this._userHome)
            });
        }
        if (this._container && this._cols === 0 && this._rows === 0) {
            this._initDimensions();
            this.xterm?.raw.resize(this._cols || 80, this._rows || 30);
        }
        const originalIcon = this.shellLaunchConfig.icon;
        await this._processManager.createProcess(this._shellLaunchConfig, this._cols || 80, this._rows || 30).then(result => {
            if (result) {
                if ('message' in result) {
                    this._onProcessExit(result);
                }
                else if ('injectedArgs' in result) {
                    this._injectedArgs = result.injectedArgs;
                }
            }
        });
        if (this.isDisposed) {
            return;
        }
        if (this.xterm?.shellIntegration) {
            this.capabilities.add(this.xterm.shellIntegration.capabilities);
        }
        if (originalIcon !== this.shellLaunchConfig.icon || this.shellLaunchConfig.color) {
            this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
            this._onIconChanged.fire({ instance: this, userInitiated: false });
        }
    }
    registerMarker(offset) {
        return this.xterm?.raw.registerMarker(offset);
    }
    addBufferMarker(properties) {
        this.capabilities.get(4)?.addMark(properties);
    }
    scrollToMark(startMarkId, endMarkId, highlight) {
        this.xterm?.markTracker.scrollToClosestMarker(startMarkId, endMarkId, highlight);
    }
    async freePortKillProcess(port, command) {
        await this._processManager?.freePortKillProcess(port);
        this.runCommand(command, false);
    }
    _onProcessData(ev) {
        const execIndex = ev.data.indexOf('\x1b]633;C\x07');
        if (execIndex !== -1) {
            if (ev.trackCommit) {
                this._writeProcessData(ev.data.substring(0, execIndex + '\x1b]633;C\x07'.length));
                ev.writePromise = new Promise(r => this._writeProcessData(ev.data.substring(execIndex + '\x1b]633;C\x07'.length), r));
            }
            else {
                this._writeProcessData(ev.data.substring(0, execIndex + '\x1b]633;C\x07'.length));
                this._writeProcessData(ev.data.substring(execIndex + '\x1b]633;C\x07'.length));
            }
        }
        else {
            if (ev.trackCommit) {
                ev.writePromise = new Promise(r => this._writeProcessData(ev.data, r));
            }
            else {
                this._writeProcessData(ev.data);
            }
        }
    }
    _writeProcessData(data, cb) {
        this._onWillData.fire(data);
        const messageId = ++this._latestXtermWriteData;
        this.xterm?.raw.write(data, () => {
            this._latestXtermParseData = messageId;
            this._processManager.acknowledgeDataEvent(data.length);
            cb?.();
            this._onData.fire(data);
        });
    }
    async _onProcessExit(exitCodeOrError) {
        if (this._isExiting) {
            return;
        }
        const parsedExitResult = parseExitResult(exitCodeOrError, this.shellLaunchConfig, this._processManager.processState, this._initialCwd);
        if (this._usedShellIntegrationInjection && this._processManager.processState === 4 && parsedExitResult?.code !== 0) {
            this._relaunchWithShellIntegrationDisabled(parsedExitResult?.message);
            this._onExit.fire(exitCodeOrError);
            return;
        }
        this._isExiting = true;
        await this._flushXtermData();
        this._exitCode = parsedExitResult?.code;
        const exitMessage = parsedExitResult?.message;
        this._logService.debug('Terminal process exit', 'instanceId', this.instanceId, 'code', this._exitCode, 'processState', this._processManager.processState);
        const waitOnExit = this.waitOnExit;
        if (waitOnExit && this._processManager.processState !== 5) {
            this._xtermReadyPromise.then(xterm => {
                if (exitMessage) {
                    xterm.raw.write(formatMessageForTerminal(exitMessage));
                }
                switch (typeof waitOnExit) {
                    case 'string':
                        xterm.raw.write(formatMessageForTerminal(waitOnExit, { excludeLeadingNewLine: true }));
                        break;
                    case 'function':
                        if (this.exitCode !== undefined) {
                            xterm.raw.write(formatMessageForTerminal(waitOnExit(this.exitCode), { excludeLeadingNewLine: true }));
                        }
                        break;
                }
                xterm.raw.options.disableStdin = true;
                if (xterm.raw.textarea) {
                    this._attachPressAnyKeyToCloseListener(xterm.raw);
                }
            });
        }
        else {
            if (exitMessage) {
                const failedDuringLaunch = this._processManager.processState === 4;
                if (failedDuringLaunch || this._terminalConfigurationService.config.showExitAlert) {
                    this._notificationService.notify({
                        message: exitMessage,
                        severity: Severity.Error,
                        actions: { primary: [this._scopedInstantiationService.createInstance(TerminalLaunchHelpAction)] }
                    });
                }
                else {
                    this._logService.warn(exitMessage);
                }
            }
            this.dispose(TerminalExitReason.Process);
        }
        this._onExit.fire(exitCodeOrError);
        if (this.isDisposed) {
            this._onExit.dispose();
        }
    }
    _relaunchWithShellIntegrationDisabled(exitMessage) {
        this._shellLaunchConfig.ignoreShellIntegration = true;
        this.relaunch();
        this.statusList.add({
            id: "shell-integration-attention-needed",
            severity: Severity.Warning,
            icon: Codicon.warning,
            tooltip: `${exitMessage} ` + nls.localize('launchFailed.exitCodeOnlyShellIntegration', 'Disabling shell integration in user settings might help.'),
            hoverActions: [{
                    commandId: "workbench.action.terminal.learnMore",
                    label: nls.localize('shellIntegration.learnMore', "Learn more about shell integration"),
                    run: () => {
                        this._openerService.open('https://code.visualstudio.com/docs/editor/integrated-terminal#_shell-integration');
                    }
                }, {
                    commandId: 'workbench.action.openSettings',
                    label: nls.localize('shellIntegration.openSettings', "Open user settings"),
                    run: () => {
                        this._commandService.executeCommand('workbench.action.openSettings', 'terminal.integrated.shellIntegration.enabled');
                    }
                }]
        });
        this._telemetryService.publicLog2('terminal/shellIntegrationFailureProcessExit');
    }
    _flushXtermData() {
        if (this._latestXtermWriteData === this._latestXtermParseData) {
            return Promise.resolve();
        }
        let retries = 0;
        return new Promise(r => {
            const interval = dom.disposableWindowInterval(dom.getActiveWindow().window, () => {
                if (this._latestXtermWriteData === this._latestXtermParseData || ++retries === 5) {
                    interval.dispose();
                    r();
                }
            }, 20);
        });
    }
    _attachPressAnyKeyToCloseListener(xterm) {
        if (xterm.textarea && !this._pressAnyKeyToCloseListener) {
            this._pressAnyKeyToCloseListener = dom.addDisposableListener(xterm.textarea, 'keypress', (event) => {
                if (this._pressAnyKeyToCloseListener) {
                    this._pressAnyKeyToCloseListener.dispose();
                    this._pressAnyKeyToCloseListener = undefined;
                    this.dispose(TerminalExitReason.Process);
                    event.preventDefault();
                }
            });
        }
    }
    _writeInitialText(xterm, callback) {
        if (!this._shellLaunchConfig.initialText) {
            callback?.();
            return;
        }
        const text = typeof this._shellLaunchConfig.initialText === 'string'
            ? this._shellLaunchConfig.initialText
            : this._shellLaunchConfig.initialText?.text;
        if (typeof this._shellLaunchConfig.initialText === 'string') {
            xterm.raw.writeln(text, callback);
        }
        else {
            if (this._shellLaunchConfig.initialText.trailingNewLine) {
                xterm.raw.writeln(text, callback);
            }
            else {
                xterm.raw.write(text, callback);
            }
        }
    }
    async reuseTerminal(shell, reset = false) {
        this._pressAnyKeyToCloseListener?.dispose();
        this._pressAnyKeyToCloseListener = undefined;
        const xterm = this.xterm;
        if (xterm) {
            if (!reset) {
                await new Promise(r => xterm.raw.write('\n\x1b[G', r));
            }
            if (shell.initialText) {
                this._shellLaunchConfig.initialText = shell.initialText;
                await new Promise(r => this._writeInitialText(xterm, r));
            }
            if (this._isExiting && this._shellLaunchConfig.waitOnExit) {
                xterm.raw.options.disableStdin = false;
                this._isExiting = false;
            }
            if (reset) {
                xterm.clearDecorations();
            }
        }
        this.statusList.remove("relaunch-needed");
        if (!reset) {
            shell.initialText = ' ';
        }
        this._shellLaunchConfig = shell;
        await this._processManager.relaunch(this._shellLaunchConfig, this._cols || 80, this._rows || 30, reset).then(result => {
            if (result) {
                if ('message' in result) {
                    this._onProcessExit(result);
                }
                else if ('injectedArgs' in result) {
                    this._injectedArgs = result.injectedArgs;
                }
            }
        });
    }
    relaunch() {
        this.reuseTerminal(this._shellLaunchConfig, true);
    }
    _onTitleChange(title) {
        if (this.isTitleSetByProcess) {
            this._setTitle(title, TitleEventSource.Sequence);
        }
    }
    async _trust() {
        return (await this._workspaceTrustRequestService.requestWorkspaceTrust({
            message: nls.localize('terminal.requestTrust', "Creating a terminal process requires executing code")
        })) === true;
    }
    async _onSelectionChange() {
        this._onDidChangeSelection.fire(this);
        if (this._configurationService.getValue("terminal.integrated.copyOnSelection")) {
            if (this._overrideCopySelection === false) {
                return;
            }
            if (this.hasSelection()) {
                await this.copySelection();
            }
        }
    }
    overrideCopyOnSelection(value) {
        if (this._overrideCopySelection !== undefined) {
            throw new Error('Cannot set a copy on selection override multiple times');
        }
        this._overrideCopySelection = value;
        return toDisposable(() => this._overrideCopySelection = undefined);
    }
    async _updateProcessCwd() {
        if (this.isDisposed || this.shellLaunchConfig.customPtyImplementation) {
            return;
        }
        try {
            const cwd = await this._refreshProperty("cwd");
            if (typeof cwd !== 'string') {
                throw new Error(`cwd is not a string ${cwd}`);
            }
        }
        catch (e) {
            if (e instanceof Error && e.message === 'Cannot refresh property when process is not set') {
                return;
            }
            throw e;
        }
    }
    updateConfig() {
        this._setCommandsToSkipShell(this._terminalConfigurationService.config.commandsToSkipShell);
        this._refreshEnvironmentVariableInfoWidgetState(this._processManager.environmentVariableInfo);
    }
    async _updateUnicodeVersion() {
        this._processManager.setUnicodeVersion(this._terminalConfigurationService.config.unicodeVersion);
    }
    updateAccessibilitySupport() {
        this.xterm.raw.options.screenReaderMode = this._accessibilityService.isScreenReaderOptimized();
    }
    _setCommandsToSkipShell(commands) {
        const excludeCommands = commands.filter(command => command[0] === '-').map(command => command.slice(1));
        this._skipTerminalCommands = DEFAULT_COMMANDS_TO_SKIP_SHELL.filter(defaultCommand => {
            return !excludeCommands.includes(defaultCommand);
        }).concat(commands);
    }
    layout(dimension) {
        this._lastLayoutDimensions = dimension;
        if (this.disableLayout) {
            return;
        }
        if (dimension.width <= 0 || dimension.height <= 0) {
            return;
        }
        const terminalWidth = this._evaluateColsAndRows(dimension.width, dimension.height);
        if (!terminalWidth) {
            return;
        }
        this._resize();
        if (!this._containerReadyBarrier.isOpen()) {
            this._containerReadyBarrier.open();
        }
        for (const contribution of this._contributions.values()) {
            if (!this.xterm) {
                this._xtermReadyPromise.then(xterm => contribution.layout?.(xterm, dimension));
            }
            else {
                contribution.layout?.(this.xterm, dimension);
            }
        }
    }
    async _resize(immediate) {
        if (!this.xterm) {
            return;
        }
        let cols = this.cols;
        let rows = this.rows;
        if (this._isVisible && this._layoutSettingsChanged) {
            const font = this.xterm.getFont();
            const config = this._terminalConfigurationService.config;
            this.xterm.raw.options.letterSpacing = font.letterSpacing;
            this.xterm.raw.options.lineHeight = font.lineHeight;
            this.xterm.raw.options.fontSize = font.fontSize;
            this.xterm.raw.options.fontFamily = font.fontFamily;
            this.xterm.raw.options.fontWeight = config.fontWeight;
            this.xterm.raw.options.fontWeightBold = config.fontWeightBold;
            this._initDimensions();
            cols = this.cols;
            rows = this.rows;
            this._layoutSettingsChanged = false;
        }
        if (isNaN(cols) || isNaN(rows)) {
            return;
        }
        if (cols !== this.xterm.raw.cols || rows !== this.xterm.raw.rows) {
            if (this._fixedRows || this._fixedCols) {
                await this._updateProperty("fixedDimensions", { cols: this._fixedCols, rows: this._fixedRows });
            }
            this._onDimensionsChanged.fire();
        }
        TerminalInstance_1._lastKnownGridDimensions = { cols, rows };
        this._resizeDebouncer.resize(cols, rows, immediate ?? false);
    }
    async _updatePtyDimensions(rawXterm) {
        await this._processManager.setDimensions(rawXterm.cols, rawXterm.rows);
    }
    setShellType(shellType) {
        if (this._shellType === shellType) {
            return;
        }
        if (shellType) {
            this._shellType = shellType;
            this._terminalShellTypeContextKey.set(shellType?.toString());
            this._onDidChangeShellType.fire(shellType);
        }
    }
    _setAriaLabel(xterm, terminalId, title) {
        const labelParts = [];
        if (xterm && xterm.textarea) {
            if (title && title.length > 0) {
                labelParts.push(nls.localize('terminalTextBoxAriaLabelNumberAndTitle', "Terminal {0}, {1}", terminalId, title));
            }
            else {
                labelParts.push(nls.localize('terminalTextBoxAriaLabel', "Terminal {0}", terminalId));
            }
            const screenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
            if (!screenReaderOptimized) {
                labelParts.push(nls.localize('terminalScreenReaderMode', "Run the command: Toggle Screen Reader Accessibility Mode for an optimized screen reader experience"));
            }
            const accessibilityHelpKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp")?.getLabel();
            if (this._configurationService.getValue("accessibility.verbosity.terminal") && accessibilityHelpKeybinding) {
                labelParts.push(nls.localize('terminalHelpAriaLabel', "Use {0} for terminal accessibility help", accessibilityHelpKeybinding));
            }
            xterm.textarea.setAttribute('aria-label', labelParts.join('\n'));
        }
    }
    _updateTitleProperties(title, eventSource) {
        if (!title) {
            return this._processName;
        }
        switch (eventSource) {
            case TitleEventSource.Process:
                if (this._processManager.os === 1) {
                    title = path.win32.parse(title).name;
                }
                else {
                    const firstSpaceIndex = title.indexOf(' ');
                    if (title.startsWith('/')) {
                        title = path.basename(title);
                    }
                    else if (firstSpaceIndex > -1) {
                        title = title.substring(0, firstSpaceIndex);
                    }
                }
                this._processName = title;
                break;
            case TitleEventSource.Api:
                this._staticTitle = title;
                this._messageTitleDisposable.value = undefined;
                break;
            case TitleEventSource.Sequence:
                this._sequence = title;
                if (this._processManager.os === 1 &&
                    title.match(/^[a-zA-Z]:\\.+\.[a-zA-Z]{1,3}/)) {
                    this._sequence = path.win32.parse(title).name;
                }
                break;
        }
        this._titleSource = eventSource;
        return title;
    }
    setOverrideDimensions(dimensions, immediate = false) {
        if (this._dimensionsOverride && this._dimensionsOverride.forceExactSize && !dimensions && this._rows === 0 && this._cols === 0) {
            this._cols = this._dimensionsOverride.cols;
            this._rows = this._dimensionsOverride.rows;
        }
        this._dimensionsOverride = dimensions;
        if (immediate) {
            this._resize(true);
        }
        else {
            this._resize();
        }
    }
    async setFixedDimensions() {
        const cols = await this._quickInputService.input({
            title: nls.localize('setTerminalDimensionsColumn', "Set Fixed Dimensions: Column"),
            placeHolder: 'Enter a number of columns or leave empty for automatic width',
            validateInput: async (text) => text.length > 0 && !text.match(/^\d+$/) ? { content: 'Enter a number or leave empty size automatically', severity: Severity.Error } : undefined
        });
        if (cols === undefined) {
            return;
        }
        this._fixedCols = this._parseFixedDimension(cols);
        this._labelComputer?.refreshLabel(this);
        this._terminalHasFixedWidth.set(!!this._fixedCols);
        const rows = await this._quickInputService.input({
            title: nls.localize('setTerminalDimensionsRow', "Set Fixed Dimensions: Row"),
            placeHolder: 'Enter a number of rows or leave empty for automatic height',
            validateInput: async (text) => text.length > 0 && !text.match(/^\d+$/) ? { content: 'Enter a number or leave empty size automatically', severity: Severity.Error } : undefined
        });
        if (rows === undefined) {
            return;
        }
        this._fixedRows = this._parseFixedDimension(rows);
        this._labelComputer?.refreshLabel(this);
        await this._refreshScrollbar();
        this._resize();
        this.focus();
    }
    _parseFixedDimension(value) {
        if (value === '') {
            return undefined;
        }
        const parsed = parseInt(value);
        if (parsed <= 0) {
            throw new Error(`Could not parse dimension "${value}"`);
        }
        return parsed;
    }
    async toggleSizeToContentWidth() {
        if (!this.xterm?.raw.buffer.active) {
            return;
        }
        if (this._hasScrollBar) {
            this._terminalHasFixedWidth.set(false);
            this._fixedCols = undefined;
            this._fixedRows = undefined;
            this._hasScrollBar = false;
            this._initDimensions();
            await this._resize();
        }
        else {
            const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement));
            const maxColsForTexture = Math.floor(4096 / (font.charWidth ?? 20));
            const proposedCols = Math.max(this.maxCols, Math.min(this.xterm.getLongestViewportWrappedLineLength(), maxColsForTexture));
            if (proposedCols > this.xterm.raw.cols) {
                this._fixedCols = proposedCols;
            }
        }
        await this._refreshScrollbar();
        this._labelComputer?.refreshLabel(this);
        this.focus();
    }
    _refreshScrollbar() {
        if (this._fixedCols || this._fixedRows) {
            return this._addScrollbar();
        }
        return this._removeScrollbar();
    }
    async _addScrollbar() {
        const charWidth = (this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement))).charWidth;
        if (!this.xterm?.raw.element || !this._container || !charWidth || !this._fixedCols) {
            return;
        }
        this._wrapperElement.classList.add('fixed-dims');
        this._hasScrollBar = true;
        this._initDimensions();
        await this._resize();
        this._terminalHasFixedWidth.set(true);
        if (!this._horizontalScrollbar) {
            this._horizontalScrollbar = this._register(new DomScrollableElement(this._wrapperElement, {
                vertical: 2,
                horizontal: 1,
                useShadows: false,
                scrollYToX: false,
                consumeMouseWheelIfScrollbarIsNeeded: false
            }));
            this._container.appendChild(this._horizontalScrollbar.getDomNode());
        }
        this._horizontalScrollbar.setScrollDimensions({
            width: this.xterm.raw.element.clientWidth,
            scrollWidth: this._fixedCols * charWidth + 40
        });
        this._horizontalScrollbar.getDomNode().style.paddingBottom = '16px';
        if (isWindows) {
            for (let i = this.xterm.raw.buffer.active.viewportY; i < this.xterm.raw.buffer.active.length; i++) {
                const line = this.xterm.raw.buffer.active.getLine(i);
                line._line.isWrapped = false;
            }
        }
    }
    async _removeScrollbar() {
        if (!this._container || !this._horizontalScrollbar) {
            return;
        }
        this._horizontalScrollbar.getDomNode().remove();
        this._horizontalScrollbar.dispose();
        this._horizontalScrollbar = undefined;
        this._wrapperElement.remove();
        this._wrapperElement.classList.remove('fixed-dims');
        this._container.appendChild(this._wrapperElement);
    }
    _setResolvedShellLaunchConfig(shellLaunchConfig) {
        this._shellLaunchConfig.args = shellLaunchConfig.args;
        this._shellLaunchConfig.cwd = shellLaunchConfig.cwd;
        this._shellLaunchConfig.executable = shellLaunchConfig.executable;
        this._shellLaunchConfig.env = shellLaunchConfig.env;
    }
    _onEnvironmentVariableInfoChanged(info) {
        if (info.requiresAction) {
            this.xterm?.raw.textarea?.setAttribute('aria-label', nls.localize('terminalStaleTextBoxAriaLabel', "Terminal {0} environment is stale, run the 'Show Environment Information' command for more information", this._instanceId));
        }
        this._refreshEnvironmentVariableInfoWidgetState(info);
    }
    async _refreshEnvironmentVariableInfoWidgetState(info) {
        if (!info) {
            this.statusList.remove("relaunch-needed");
            this.statusList.remove("env-var-info-changes-active");
            return;
        }
        if (info.requiresAction &&
            this._terminalConfigurationService.config.environmentChangesRelaunch &&
            !this._processManager.hasWrittenData &&
            (!this._shellLaunchConfig.isFeatureTerminal || (this.reconnectionProperties && this._configurationService.getValue('task.reconnection') === true)) &&
            !this._shellLaunchConfig.customPtyImplementation &&
            !this._shellLaunchConfig.isExtensionOwnedTerminal &&
            !this._shellLaunchConfig.attachPersistentProcess &&
            !(this._processManager.remoteAuthority && this._terminalConfigurationService.config.windowsEnableConpty && (await this._processManager.getBackendOS()) === 1)) {
            this.relaunch();
            return;
        }
        const workspaceFolder = getWorkspaceForTerminal(this.shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
        this.statusList.add(info.getStatus({ workspaceFolder }));
    }
    async getInitialCwd() {
        if (!this._initialCwd) {
            this._initialCwd = this._processManager.initialCwd;
        }
        return this._initialCwd;
    }
    async getCwd() {
        if (this.capabilities.has(0)) {
            return this.capabilities.get(0).getCwd();
        }
        else if (this.capabilities.has(1)) {
            return this.capabilities.get(1).getCwd();
        }
        return this._processManager.initialCwd;
    }
    async _refreshProperty(type) {
        await this.processReady;
        return this._processManager.refreshProperty(type);
    }
    async _updateProperty(type, value) {
        return this._processManager.updateProperty(type, value);
    }
    async rename(title) {
        this._setTitle(title, TitleEventSource.Api);
    }
    _setTitle(title, eventSource) {
        const reset = !title;
        title = this._updateTitleProperties(title, eventSource);
        const titleChanged = title !== this._title;
        this._title = title;
        this._labelComputer?.refreshLabel(this, reset);
        this._setAriaLabel(this.xterm?.raw, this._instanceId, this._title);
        if (titleChanged) {
            this._onTitleChanged.fire(this);
        }
    }
    async changeIcon(icon) {
        if (icon) {
            this._icon = icon;
            this._onIconChanged.fire({ instance: this, userInitiated: true });
            return icon;
        }
        const iconPicker = this._scopedInstantiationService.createInstance(TerminalIconPicker);
        const pickedIcon = await iconPicker.pickIcons();
        iconPicker.dispose();
        if (!pickedIcon) {
            return undefined;
        }
        this._icon = pickedIcon;
        this._onIconChanged.fire({ instance: this, userInitiated: true });
        return pickedIcon;
    }
    async changeColor(color, skipQuickPick) {
        if (color) {
            this.shellLaunchConfig.color = color;
            this._onIconChanged.fire({ instance: this, userInitiated: true });
            return color;
        }
        else if (skipQuickPick) {
            this.shellLaunchConfig.color = '';
            this._onIconChanged.fire({ instance: this, userInitiated: true });
            return;
        }
        const icon = this._getIcon();
        if (!icon) {
            return;
        }
        const colorTheme = this._themeService.getColorTheme();
        const standardColors = getStandardColors(colorTheme);
        const colorStyleDisposable = createColorStyleElement(colorTheme);
        const items = [];
        for (const colorKey of standardColors) {
            const colorClass = getColorClass(colorKey);
            items.push({
                label: `$(${Codicon.circleFilled.id}) ${colorKey.replace('terminal.ansi', '')}`, id: colorKey, description: colorKey, iconClasses: [colorClass]
            });
        }
        items.push({ type: 'separator' });
        const showAllColorsItem = { label: 'Reset to default' };
        items.push(showAllColorsItem);
        const disposables = [];
        const quickPick = this._quickInputService.createQuickPick({ useSeparators: true });
        disposables.push(quickPick);
        quickPick.items = items;
        quickPick.matchOnDescription = true;
        quickPick.placeholder = nls.localize('changeColor', 'Select a color for the terminal');
        quickPick.show();
        const result = await new Promise(r => {
            disposables.push(quickPick.onDidHide(() => r(undefined)));
            disposables.push(quickPick.onDidAccept(() => r(quickPick.selectedItems[0])));
        });
        dispose(disposables);
        if (result) {
            this.shellLaunchConfig.color = result.id;
            this._onIconChanged.fire({ instance: this, userInitiated: true });
        }
        quickPick.hide();
        colorStyleDisposable.dispose();
        return result?.id;
    }
    forceScrollbarVisibility() {
        this._wrapperElement.classList.add('force-scrollbar');
    }
    resetScrollbarVisibility() {
        this._wrapperElement.classList.remove('force-scrollbar');
    }
    setParentContextKeyService(parentContextKeyService) {
        this._scopedContextKeyService.updateParent(parentContextKeyService);
    }
    async handleMouseEvent(event, contextMenu) {
        if (dom.isHTMLElement(event.target) && (event.target.classList.contains('scrollbar') || event.target.classList.contains('slider'))) {
            return { cancelContextMenu: true };
        }
        if (event.which === 2) {
            switch (this._terminalConfigurationService.config.middleClickBehavior) {
                case 'paste':
                    this.paste();
                    break;
                case 'default':
                default:
                    this.focus();
                    break;
            }
            return;
        }
        if (event.which === 3) {
            const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
            if (rightClickBehavior === 'nothing') {
                if (!event.shiftKey) {
                    return { cancelContextMenu: true };
                }
                return;
            }
            else if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                    openContextMenu(dom.getActiveWindow(), event, this, contextMenu, this._contextMenuService);
                    return;
                }
                if (rightClickBehavior === 'copyPaste' && this.hasSelection()) {
                    await this.copySelection();
                    this.clearSelection();
                }
                else {
                    if (BrowserFeatures.clipboard.readText) {
                        this.paste();
                    }
                    else {
                        this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${isMacintosh ? '⌘' : 'Ctrl'}+V instead.`);
                    }
                }
                if (isMacintosh) {
                    setTimeout(() => this.clearSelection(), 0);
                }
                return { cancelContextMenu: true };
            }
        }
    }
};
__decorate([
    debounce(50),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TerminalInstance.prototype, "_fireMaximumDimensionsChanged", null);
__decorate([
    debounce(1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TerminalInstance.prototype, "relaunch", null);
__decorate([
    debounce(2000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TerminalInstance.prototype, "_updateProcessCwd", null);
TerminalInstance = TerminalInstance_1 = __decorate([
    __param(3, IContextKeyService),
    __param(4, IContextMenuService),
    __param(5, IInstantiationService),
    __param(6, ITerminalConfigurationService),
    __param(7, ITerminalProfileResolverService),
    __param(8, IPathService),
    __param(9, IKeybindingService),
    __param(10, INotificationService),
    __param(11, IPreferencesService),
    __param(12, IViewsService),
    __param(13, IClipboardService),
    __param(14, IThemeService),
    __param(15, IConfigurationService),
    __param(16, ITerminalLogService),
    __param(17, IStorageService),
    __param(18, IAccessibilityService),
    __param(19, IProductService),
    __param(20, IQuickInputService),
    __param(21, IWorkbenchEnvironmentService),
    __param(22, IWorkspaceContextService),
    __param(23, IEditorService),
    __param(24, IWorkspaceTrustRequestService),
    __param(25, IHistoryService),
    __param(26, ITelemetryService),
    __param(27, IOpenerService),
    __param(28, ICommandService),
    __param(29, IAccessibilitySignalService),
    __param(30, IViewDescriptorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalInstance);
export { TerminalInstance };
let TerminalInstanceDragAndDropController = class TerminalInstanceDragAndDropController extends Disposable {
    get onDropFile() { return this._onDropFile.event; }
    get onDropTerminal() { return this._onDropTerminal.event; }
    constructor(_container, _layoutService, _viewDescriptorService, _hostService) {
        super();
        this._container = _container;
        this._layoutService = _layoutService;
        this._viewDescriptorService = _viewDescriptorService;
        this._hostService = _hostService;
        this._onDropFile = this._register(new Emitter());
        this._onDropTerminal = this._register(new Emitter());
        this._register(toDisposable(() => this._clearDropOverlay()));
    }
    _clearDropOverlay() {
        this._dropOverlay?.remove();
        this._dropOverlay = undefined;
    }
    onDragEnter(e) {
        if (!containsDragType(e, DataTransfers.FILES, DataTransfers.RESOURCES, "Terminals", CodeDataTransfers.FILES)) {
            return;
        }
        if (!this._dropOverlay) {
            this._dropOverlay = document.createElement('div');
            this._dropOverlay.classList.add('terminal-drop-overlay');
        }
        if (containsDragType(e, "Terminals")) {
            const side = this._getDropSide(e);
            this._dropOverlay.classList.toggle('drop-before', side === 'before');
            this._dropOverlay.classList.toggle('drop-after', side === 'after');
        }
        if (!this._dropOverlay.parentElement) {
            this._container.appendChild(this._dropOverlay);
        }
    }
    onDragLeave(e) {
        this._clearDropOverlay();
    }
    onDragEnd(e) {
        this._clearDropOverlay();
    }
    onDragOver(e) {
        if (!e.dataTransfer || !this._dropOverlay) {
            return;
        }
        if (containsDragType(e, "Terminals")) {
            const side = this._getDropSide(e);
            this._dropOverlay.classList.toggle('drop-before', side === 'before');
            this._dropOverlay.classList.toggle('drop-after', side === 'after');
        }
        this._dropOverlay.style.opacity = '1';
    }
    async onDrop(e) {
        this._clearDropOverlay();
        if (!e.dataTransfer) {
            return;
        }
        const terminalResources = getTerminalResourcesFromDragEvent(e);
        if (terminalResources) {
            for (const uri of terminalResources) {
                const side = this._getDropSide(e);
                this._onDropTerminal.fire({ uri, side });
            }
            return;
        }
        let path;
        const rawResources = e.dataTransfer.getData(DataTransfers.RESOURCES);
        if (rawResources) {
            path = URI.parse(JSON.parse(rawResources)[0]);
        }
        const rawCodeFiles = e.dataTransfer.getData(CodeDataTransfers.FILES);
        if (!path && rawCodeFiles) {
            path = URI.file(JSON.parse(rawCodeFiles)[0]);
        }
        if (!path && e.dataTransfer.files.length > 0 && this._hostService.getPathForFile(e.dataTransfer.files[0])) {
            path = URI.file(this._hostService.getPathForFile(e.dataTransfer.files[0]));
        }
        if (!path) {
            return;
        }
        this._onDropFile.fire(path);
    }
    _getDropSide(e) {
        const target = this._container;
        if (!target) {
            return 'after';
        }
        const rect = target.getBoundingClientRect();
        return this._getViewOrientation() === 1
            ? (e.clientX - rect.left < rect.width / 2 ? 'before' : 'after')
            : (e.clientY - rect.top < rect.height / 2 ? 'before' : 'after');
    }
    _getViewOrientation() {
        const panelPosition = this._layoutService.getPanelPosition();
        const terminalLocation = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
        return terminalLocation === 1 && isHorizontal(panelPosition)
            ? 1
            : 0;
    }
};
TerminalInstanceDragAndDropController = __decorate([
    __param(1, IWorkbenchLayoutService),
    __param(2, IViewDescriptorService),
    __param(3, IHostService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object])
], TerminalInstanceDragAndDropController);
let TerminalLabelComputer = class TerminalLabelComputer extends Disposable {
    get title() { return this._title; }
    get description() { return this._description; }
    constructor(_fileService, _terminalConfigurationService, _workspaceContextService) {
        super();
        this._fileService = _fileService;
        this._terminalConfigurationService = _terminalConfigurationService;
        this._workspaceContextService = _workspaceContextService;
        this._title = '';
        this._description = '';
        this._onDidChangeLabel = this._register(new Emitter());
        this.onDidChangeLabel = this._onDidChangeLabel.event;
    }
    refreshLabel(instance, reset) {
        this._title = this.computeLabel(instance, this._terminalConfigurationService.config.tabs.title, "title", reset);
        this._description = this.computeLabel(instance, this._terminalConfigurationService.config.tabs.description, "description");
        if (this._title !== instance.title || this._description !== instance.description || reset) {
            this._onDidChangeLabel.fire({ title: this._title, description: this._description });
        }
    }
    computeLabel(instance, labelTemplate, labelType, reset) {
        const type = instance.shellLaunchConfig.attachPersistentProcess?.type || instance.shellLaunchConfig.type;
        const templateProperties = {
            cwd: instance.cwd || instance.initialCwd || '',
            cwdFolder: '',
            workspaceFolderName: instance.workspaceFolder?.name,
            workspaceFolder: instance.workspaceFolder ? path.basename(instance.workspaceFolder.uri.fsPath) : undefined,
            local: type === 'Local' ? terminalStrings.typeLocal : undefined,
            process: instance.processName,
            sequence: instance.sequence,
            task: type === 'Task' ? terminalStrings.typeTask : undefined,
            fixedDimensions: instance.fixedCols
                ? (instance.fixedRows ? `\u2194${instance.fixedCols} \u2195${instance.fixedRows}` : `\u2194${instance.fixedCols}`)
                : (instance.fixedRows ? `\u2195${instance.fixedRows}` : ''),
            separator: { label: this._terminalConfigurationService.config.tabs.separator }
        };
        templateProperties.workspaceFolderName = instance.workspaceFolder?.name ?? templateProperties.workspaceFolder;
        labelTemplate = labelTemplate.trim();
        if (!labelTemplate) {
            return labelType === "title" ? (instance.processName || '') : '';
        }
        if (!reset && instance.staticTitle && labelType === "title") {
            return instance.staticTitle.replace(/[\n\r\t]/g, '') || templateProperties.process?.replace(/[\n\r\t]/g, '') || '';
        }
        const detection = instance.capabilities.has(0) || instance.capabilities.has(1);
        const folders = this._workspaceContextService.getWorkspace().folders;
        const multiRootWorkspace = folders.length > 1;
        if (templateProperties.cwd && detection && (!instance.shellLaunchConfig.isFeatureTerminal || labelType === "title")) {
            const cwdUri = URI.from({
                scheme: instance.workspaceFolder?.uri.scheme || Schemas.file,
                path: instance.cwd ? path.resolve(instance.cwd) : undefined
            });
            let showCwd = false;
            if (multiRootWorkspace) {
                showCwd = true;
            }
            else if (instance.workspaceFolder?.uri) {
                const caseSensitive = this._fileService.hasCapability(instance.workspaceFolder.uri, 1024);
                showCwd = cwdUri.fsPath.localeCompare(instance.workspaceFolder.uri.fsPath, undefined, { sensitivity: caseSensitive ? 'case' : 'base' }) !== 0;
            }
            if (showCwd) {
                templateProperties.cwdFolder = path.basename(templateProperties.cwd);
            }
        }
        const label = template(labelTemplate, templateProperties).replace(/[\n\r\t]/g, '').trim();
        return label === '' && labelType === "title" ? (instance.processName || '') : label;
    }
};
TerminalLabelComputer = __decorate([
    __param(0, IFileService),
    __param(1, ITerminalConfigurationService),
    __param(2, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TerminalLabelComputer);
export { TerminalLabelComputer };
export function parseExitResult(exitCodeOrError, shellLaunchConfig, processState, initialCwd) {
    if (exitCodeOrError === undefined || exitCodeOrError === 0) {
        return { code: exitCodeOrError, message: undefined };
    }
    const code = typeof exitCodeOrError === 'number' ? exitCodeOrError : exitCodeOrError.code;
    let message = undefined;
    switch (typeof exitCodeOrError) {
        case 'number': {
            let commandLine = undefined;
            if (shellLaunchConfig.executable) {
                commandLine = shellLaunchConfig.executable;
                if (typeof shellLaunchConfig.args === 'string') {
                    commandLine += ` ${shellLaunchConfig.args}`;
                }
                else if (shellLaunchConfig.args && shellLaunchConfig.args.length) {
                    commandLine += shellLaunchConfig.args.map(a => ` '${a}'`).join();
                }
            }
            if (processState === 4) {
                if (commandLine) {
                    message = nls.localize('launchFailed.exitCodeAndCommandLine', "The terminal process \"{0}\" failed to launch (exit code: {1}).", commandLine, code);
                }
                else {
                    message = nls.localize('launchFailed.exitCodeOnly', "The terminal process failed to launch (exit code: {0}).", code);
                }
            }
            else {
                if (commandLine) {
                    message = nls.localize('terminated.exitCodeAndCommandLine', "The terminal process \"{0}\" terminated with exit code: {1}.", commandLine, code);
                }
                else {
                    message = nls.localize('terminated.exitCodeOnly', "The terminal process terminated with exit code: {0}.", code);
                }
            }
            break;
        }
        case 'object': {
            if (exitCodeOrError.message.toString().includes('Could not find pty with id')) {
                break;
            }
            let innerMessage = exitCodeOrError.message;
            const conptyError = exitCodeOrError.message.match(/.*error code:\s*(\d+).*$/);
            if (conptyError) {
                const errorCode = conptyError.length > 1 ? parseInt(conptyError[1]) : undefined;
                switch (errorCode) {
                    case 5:
                        innerMessage = `Access was denied to the path containing your executable "${shellLaunchConfig.executable}". Manage and change your permissions to get this to work`;
                        break;
                    case 267:
                        innerMessage = `Invalid starting directory "${initialCwd}", review your terminal.integrated.cwd setting`;
                        break;
                    case 1260:
                        innerMessage = `Windows cannot open this program because it has been prevented by a software restriction policy. For more information, open Event Viewer or contact your system Administrator`;
                        break;
                }
            }
            message = nls.localize('launchFailed.errorMessage', "The terminal process failed to launch: {0}.", innerMessage);
            break;
        }
    }
    return { code, message };
}
let TerminalInstanceColorProvider = class TerminalInstanceColorProvider {
    constructor(_target, _viewDescriptorService) {
        this._target = _target;
        this._viewDescriptorService = _viewDescriptorService;
    }
    getBackgroundColor(theme) {
        const terminalBackground = theme.getColor(TERMINAL_BACKGROUND_COLOR);
        if (terminalBackground) {
            return terminalBackground;
        }
        if (this._target.object === TerminalLocation.Editor) {
            return theme.getColor(editorBackground);
        }
        const location = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
        if (location === 1) {
            return theme.getColor(PANEL_BACKGROUND);
        }
        return theme.getColor(SIDE_BAR_BACKGROUND);
    }
};
TerminalInstanceColorProvider = __decorate([
    __param(1, IViewDescriptorService),
    __metadata("design:paramtypes", [Object, Object])
], TerminalInstanceColorProvider);
export { TerminalInstanceColorProvider };
