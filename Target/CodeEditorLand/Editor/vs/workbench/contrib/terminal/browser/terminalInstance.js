/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { onUnexpectedError } from '../../../../base/common/errors.js';
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
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { CodeDataTransfers, containsDragType, getPathForFile } from '../../../../platform/dnd/browser/dnd.js';
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
import { TerminalStatusList } from './terminalStatusList.js';
import { getTerminalResourcesFromDragEvent, getTerminalUri } from './terminalUri.js';
import { TerminalWidgetManager } from './widgets/widgetManager.js';
import { LineDataEventAddon } from './xterm/lineDataEventAddon.js';
import { XtermTerminal, getXtermScaledDimensions } from './xterm/xtermTerminal.js';
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
import { TerminalIconPicker } from './terminalIconPicker.js';
import { TerminalResizeDebouncer } from './terminalResizeDebouncer.js';
import { openContextMenu } from './terminalContextMenu.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
let xtermConstructor;
const shellIntegrationSupportedShellTypes = [
    "bash" /* PosixShellType.Bash */,
    "zsh" /* PosixShellType.Zsh */,
    "pwsh" /* GeneralShellType.PowerShell */,
    "python" /* GeneralShellType.Python */,
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
    // TODO: Ideally processId would be merged into processReady
    get processId() { return this._processManager.shellProcessId; }
    // TODO: How does this work with detached processes?
    // TODO: Should this be an event as it can fire twice?
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
    constructor(_terminalShellTypeContextKey, _shellLaunchConfig, _contextKeyService, _contextMenuService, instantiationService, _terminalConfigurationService, _terminalProfileResolverService, _pathService, _keybindingService, _notificationService, _preferencesService, _viewsService, _themeService, _configurationService, _logService, _storageService, _accessibilityService, _productService, _quickInputService, workbenchEnvironmentService, _workspaceContextService, _editorService, _workspaceTrustRequestService, _historyService, _telemetryService, _openerService, _commandService, _accessibilitySignalService, _viewDescriptorService) {
        super();
        this._terminalShellTypeContextKey = _terminalShellTypeContextKey;
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
        // The onExit event is special in that it fires and is disposed after the terminal instance
        // itself is disposed
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
        this._onLineData = this._register(new Emitter({
            onDidAddFirstListener: async () => (this.xterm ?? await this._xtermReadyPromise)?.raw.loadAddon(this._lineDataEventAddon)
        }));
        this.onLineData = this._onLineData.event;
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
        this._register(this.capabilities.onDidAddCapabilityType(e => this._logService.debug('terminalInstance added capability', e)));
        this._register(this.capabilities.onDidRemoveCapabilityType(e => this._logService.debug('terminalInstance removed capability', e)));
        this._register(this.capabilities.onDidAddCapabilityType(e => {
            if (e === 0 /* TerminalCapability.CwdDetection */) {
                this.capabilities.get(0 /* TerminalCapability.CwdDetection */)?.onDidChangeCwd(e => {
                    this._cwd = e;
                    this._setTitle(this.title, TitleEventSource.Config);
                });
            }
        }));
        // Resolve just the icon ahead of time so that it shows up immediately in the tabs. This is
        // disabled in remote because this needs to be sync and the OS may differ on the remote
        // which would result in the wrong profile being selected and the wrong icon being
        // permanently attached to the terminal. This also doesn't work when the default profile
        // setting is set to null, that's handled after the process is created.
        if (!this.shellLaunchConfig.executable && !workbenchEnvironmentService.remoteAuthority) {
            this._terminalProfileResolverService.resolveIcon(this._shellLaunchConfig, OS);
        }
        this._icon = _shellLaunchConfig.attachPersistentProcess?.icon || _shellLaunchConfig.icon;
        // When a custom pty is used set the name immediately so it gets passed over to the exthost
        // and is available when Pseudoterminal.open fires.
        if (this.shellLaunchConfig.customPtyImplementation) {
            this._setTitle(this._shellLaunchConfig.name, TitleEventSource.Api);
        }
        this.statusList = this._register(this._scopedInstantiationService.createInstance(TerminalStatusList));
        this._initDimensions();
        this._processManager = this._createProcessManager();
        this._containerReadyBarrier = new AutoOpenBarrier(100 /* Constants.WaitForContainerThreshold */);
        this._attachBarrier = new AutoOpenBarrier(1000);
        this._xtermReadyPromise = this._createXterm();
        this._xtermReadyPromise.then(async () => {
            // Wait for a period to allow a container to be ready
            await this._containerReadyBarrier.wait();
            // Resolve the executable ahead of time if shell integration is enabled, this should not
            // be done for custom PTYs as that would cause extension Pseudoterminal-based terminals
            // to hang in resolver extensions
            if (!this.shellLaunchConfig.customPtyImplementation && this._terminalConfigurationService.config.shellIntegration?.enabled && !this.shellLaunchConfig.executable) {
                const os = await this._processManager.getBackendOS();
                const defaultProfile = (await this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority: this.remoteAuthority, os }));
                this.shellLaunchConfig.executable = defaultProfile.path;
                this.shellLaunchConfig.args = defaultProfile.args;
                if (this.shellLaunchConfig.isExtensionOwnedTerminal) {
                    // Only use default icon and color and env if they are undefined in the SLC
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
            // Re-establish the title after reconnect
            if (this.shellLaunchConfig.attachPersistentProcess) {
                this._cwd = this.shellLaunchConfig.attachPersistentProcess.cwd;
                this._setTitle(this.shellLaunchConfig.attachPersistentProcess.title, this.shellLaunchConfig.attachPersistentProcess.titleSource);
                this.setShellType(this.shellType);
            }
            if (this._fixedCols) {
                await this._addScrollbar();
            }
        }).catch((err) => {
            // Ignore exceptions if the terminal is already disposed
            if (!this.isDisposed) {
                throw err;
            }
        });
        this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration("accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */)) {
                this._setAriaLabel(this.xterm?.raw, this._instanceId, this.title);
            }
            if (e.affectsConfiguration('terminal.integrated')) {
                this.updateConfig();
                this.setVisible(this._isVisible);
            }
            const layoutSettings = [
                "terminal.integrated.fontSize" /* TerminalSettingId.FontSize */,
                "terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */,
                "terminal.integrated.fontWeight" /* TerminalSettingId.FontWeight */,
                "terminal.integrated.fontWeightBold" /* TerminalSettingId.FontWeightBold */,
                "terminal.integrated.letterSpacing" /* TerminalSettingId.LetterSpacing */,
                "terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */,
                'editor.fontFamily'
            ];
            if (layoutSettings.some(id => e.affectsConfiguration(id))) {
                this._layoutSettingsChanged = true;
                await this._resize();
            }
            if (e.affectsConfiguration("terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */)) {
                this._updateUnicodeVersion();
            }
            if (e.affectsConfiguration('editor.accessibilitySupport')) {
                this.updateAccessibilitySupport();
            }
            if (e.affectsConfiguration("terminal.integrated.tabs.title" /* TerminalSettingId.TerminalTitle */) ||
                e.affectsConfiguration("terminal.integrated.tabs.separator" /* TerminalSettingId.TerminalTitleSeparator */) ||
                e.affectsConfiguration("terminal.integrated.tabs.description" /* TerminalSettingId.TerminalDescription */)) {
                this._labelComputer?.refreshLabel(this);
            }
        }));
        this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._labelComputer?.refreshLabel(this)));
        // Clear out initial data events after 10 seconds, hopefully extension hosts are up and
        // running at that point.
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
        // Initialize contributions
        const contributionDescs = TerminalExtensionsRegistry.getTerminalContributions();
        for (const desc of contributionDescs) {
            if (this._contributions.has(desc.id)) {
                onUnexpectedError(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
                continue;
            }
            let contribution;
            try {
                contribution = this._register(this._scopedInstantiationService.createInstance(desc.ctor, {
                    instance: this,
                    processManager: this._processManager,
                    widgetManager: this._widgetManager
                }));
                this._contributions.set(desc.id, contribution);
            }
            catch (err) {
                onUnexpectedError(err);
            }
            this._xtermReadyPromise.then(xterm => {
                if (xterm) {
                    contribution.xtermReady?.(xterm);
                }
            });
            this._register(this.onDisposed(() => {
                contribution.dispose();
                this._contributions.delete(desc.id);
                // Just in case to prevent potential future memory leaks due to cyclic dependency.
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
            this._icon = this._processManager.processState >= 2 /* ProcessState.Launching */
                ? getIconRegistry().getIcon(this._configurationService.getValue("terminal.integrated.tabs.defaultIcon" /* TerminalSettingId.TabsDefaultIcon */))
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
        if (this._processManager.processState >= 2 /* ProcessState.Launching */) {
            return undefined;
        }
        return undefined;
    }
    _initDimensions() {
        // The terminal panel needs to have been created to get the real view dimensions
        if (!this._container) {
            // Set the fallback dimensions if not
            this._cols = 80 /* Constants.DefaultCols */;
            this._rows = 30 /* Constants.DefaultRows */;
            return;
        }
        const computedStyle = dom.getWindow(this._container).getComputedStyle(this._container);
        const width = parseInt(computedStyle.width);
        const height = parseInt(computedStyle.height);
        this._evaluateColsAndRows(width, height);
    }
    /**
     * Evaluates and sets the cols and rows of the terminal if possible.
     * @param width The width of the container.
     * @param height The height of the container.
     * @return The terminal's width if it requires a layout.
     */
    _evaluateColsAndRows(width, height) {
        // Ignore if dimensions are undefined or 0
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
        // The font needs to have been initialized
        const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(dom.getWindow(this.domElement));
        if (!font || !font.charWidth || !font.charHeight) {
            return undefined;
        }
        if (!this.xterm?.raw.element) {
            return undefined;
        }
        const computedStyle = dom.getWindow(this.xterm.raw.element).getComputedStyle(this.xterm.raw.element);
        const horizontalPadding = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight) + 14 /*scroll bar padding*/;
        const verticalPadding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
        TerminalInstance_1._lastKnownCanvasDimensions = new dom.Dimension(Math.min(4096 /* Constants.MaxCanvasWidth */, width - horizontalPadding), height - verticalPadding + (this._hasScrollBar && this._horizontalScrollbar ? -5 /* scroll bar height */ : 0));
        return TerminalInstance_1._lastKnownCanvasDimensions;
    }
    get persistentProcessId() { return this._processManager.persistentProcessId; }
    get shouldPersist() { return this._processManager.shouldPersist && !this.shellLaunchConfig.isTransient && (!this.reconnectionProperties || this._configurationService.getValue('task.reconnection') === true); }
    static getXtermConstructor(keybindingService, contextKeyService) {
        const keybinding = keybindingService.lookupKeybinding("workbench.action.terminal.focusAccessibleBuffer" /* TerminalContribCommandId.A11yFocusAccessibleBuffer */, contextKeyService);
        if (xtermConstructor) {
            return xtermConstructor;
        }
        xtermConstructor = Promises.withAsyncBody(async (resolve) => {
            const Terminal = (await importAMDNodeModule('@xterm/xterm', 'lib/xterm.js')).Terminal;
            // Localize strings
            Terminal.strings.promptLabel = nls.localize('terminal.integrated.a11yPromptLabel', 'Terminal input');
            Terminal.strings.tooMuchOutput = keybinding ? nls.localize('terminal.integrated.useAccessibleBuffer', 'Use the accessible buffer {0} to manually review output', keybinding.getLabel()) : nls.localize('terminal.integrated.useAccessibleBufferNoKb', 'Use the Terminal: Focus Accessible Buffer command to manually review output');
            resolve(Terminal);
        });
        return xtermConstructor;
    }
    /**
     * Create xterm.js instance and attach data listeners.
     */
    async _createXterm() {
        const Terminal = await TerminalInstance_1.getXtermConstructor(this._keybindingService, this._contextKeyService);
        if (this.isDisposed) {
            return undefined;
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
            this.sendText(e.command.command, e.noNewLine ? false : true);
        }));
        this._register(this.xterm.onDidRequestRefreshDimensions(() => {
            if (this._lastLayoutDimensions) {
                this.layout(this._lastLayoutDimensions);
            }
        }));
        // Write initial text, deferring onLineFeed listener when applicable to avoid firing
        // onLineData events containing initialText
        const initialTextWrittenPromise = this._shellLaunchConfig.initialText ? new Promise(r => this._writeInitialText(xterm, r)) : undefined;
        const lineDataEventAddon = this._register(new LineDataEventAddon(initialTextWrittenPromise));
        this._register(lineDataEventAddon.onLineData(e => this._onLineData.fire(e)));
        this._lineDataEventAddon = lineDataEventAddon;
        // Delay the creation of the bell listener to avoid showing the bell when the terminal
        // starts up or reconnects
        disposableTimeout(() => {
            this._register(xterm.raw.onBell(() => {
                if (this._configurationService.getValue("terminal.integrated.enableBell" /* TerminalSettingId.EnableBell */) || this._configurationService.getValue("terminal.integrated.enableVisualBell" /* TerminalSettingId.EnableVisualBell */)) {
                    this.statusList.add({
                        id: "bell" /* TerminalStatus.Bell */,
                        severity: Severity.Warning,
                        icon: Codicon.bell,
                        tooltip: nls.localize('bellStatus', "Bell")
                    }, this._terminalConfigurationService.config.bellDuration);
                }
                this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalBell);
            }));
        }, 1000, this._store);
        this._register(xterm.raw.onSelectionChange(() => this._onDidChangeSelection.fire(this)));
        this._register(xterm.raw.buffer.onBufferChange(() => this._refreshAltBufferContextKey()));
        this._register(this._processManager.onProcessData(e => this._onProcessData(e)));
        this._register(xterm.raw.onData(async (data) => {
            await this._pauseInputEventBarrier?.wait();
            await this._processManager.write(data);
            this._onDidInputData.fire(data);
        }));
        this._register(xterm.raw.onBinary(data => this._processManager.processBinary(data)));
        // Init winpty compat and link handler after process creation as they rely on the
        // underlying process OS
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
        // Set up updating of the process cwd on key press, this is only needed when the cwd
        // detection capability has not been registered
        if (!this.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
            let onKeyListener = xterm.raw.onKey(e => {
                const event = new StandardKeyboardEvent(e.domEvent);
                if (event.equals(3 /* KeyCode.Enter */)) {
                    this._updateProcessCwd();
                }
            });
            this._register(this.capabilities.onDidAddCapabilityType(e => {
                if (e === 0 /* TerminalCapability.CwdDetection */) {
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
        let commandDetection = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
        // Await command detection if the terminal is starting up
        if (!commandDetection && (this._processManager.processState === 1 /* ProcessState.Uninitialized */ || this._processManager.processState === 2 /* ProcessState.Launching */)) {
            const store = new DisposableStore();
            await Promise.race([
                new Promise(r => {
                    store.add(this.capabilities.onDidAddCapabilityType(e => {
                        if (e === 2 /* TerminalCapability.CommandDetection */) {
                            commandDetection = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
                            r();
                        }
                    }));
                }),
                timeout(2000),
            ]);
            store.dispose();
        }
        // Determine whether to send ETX (ctrl+c) before running the command. This should always
        // happen unless command detection can reliably say that a command is being entered and
        // there is no content in the prompt
        if (!commandDetection || commandDetection.promptInputModel.value.length > 0) {
            await this.sendText('\x03', false);
            // Wait a little before running the command to avoid the sequences being echoed while the ^C
            // is being evaluated
            await timeout(100);
        }
        // Use bracketed paste mode only when not running the command
        await this.sendText(commandLine, shouldExecute, !shouldExecute);
    }
    detachFromElement() {
        this._wrapperElement.remove();
        this._container = undefined;
    }
    attachToElement(container) {
        // The container did not change, do nothing
        if (this._container === container) {
            return;
        }
        if (!this._attachBarrier.isOpen()) {
            this._attachBarrier.open();
        }
        // The container changed, reattach
        this._container = container;
        this._container.appendChild(this._wrapperElement);
        // If xterm is already attached, call open again to pick up any changes to the window.
        if (this.xterm?.raw.element) {
            this.xterm.raw.open(this.xterm.raw.element);
        }
        this.xterm?.refresh();
        setTimeout(() => {
            if (this._store.isDisposed) {
                return;
            }
            this._initDragAndDrop(container);
        }, 0);
    }
    /**
     * Opens the the terminal instance inside the parent DOM element previously set with
     * `attachToElement`, you must ensure the parent DOM element is explicitly visible before
     * invoking this function as it performs some DOM calculations internally
     */
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
        // Attach the xterm object to the DOM, exposing it to the smoke tests
        this._wrapperElement.xterm = xterm.raw;
        const screenElement = xterm.attachToElement(xtermElement);
        // Fire xtermOpen on all contributions
        for (const contribution of this._contributions.values()) {
            if (!this.xterm) {
                this._xtermReadyPromise.then(xterm => {
                    if (xterm) {
                        contribution.xtermOpen?.(xterm);
                    }
                });
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
            // Disable all input if the terminal is exiting
            if (this._isExiting) {
                return false;
            }
            const standardKeyboardEvent = new StandardKeyboardEvent(event);
            const resolveResult = this._keybindingService.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
            // Respect chords if the allowChords setting is set and it's not Escape. Escape is
            // handled specially for Zen Mode's Escape, Escape chord, plus it's important in
            // terminals generally
            const isValidChord = resolveResult.kind === 1 /* ResultKind.MoreChordsNeeded */ && this._terminalConfigurationService.config.allowChords && event.key !== 'Escape';
            if (this._keybindingService.inChordMode || isValidChord) {
                event.preventDefault();
                return false;
            }
            const SHOW_TERMINAL_CONFIG_PROMPT_KEY = 'terminal.integrated.showTerminalConfigPrompt';
            const EXCLUDED_KEYS = ['RightArrow', 'LeftArrow', 'UpArrow', 'DownArrow', 'Space', 'Meta', 'Control', 'Shift', 'Alt', '', 'Delete', 'Backspace', 'Tab'];
            // only keep track of input if prompt hasn't already been shown
            if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, -1 /* StorageScope.APPLICATION */, true) &&
                !EXCLUDED_KEYS.includes(event.key) &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey) {
                this._hasHadInput = true;
            }
            // for keyboard events that resolve to commands described
            // within commandsToSkipShell, either alert or skip processing by xterm.js
            if (resolveResult.kind === 2 /* ResultKind.KbFound */ && resolveResult.commandId && this._skipTerminalCommands.some(k => k === resolveResult.commandId) && !this._terminalConfigurationService.config.sendKeybindingsToShell) {
                // don't alert when terminal is opened or closed
                if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, -1 /* StorageScope.APPLICATION */, true) &&
                    this._hasHadInput &&
                    !TERMINAL_CREATION_COMMANDS.includes(resolveResult.commandId)) {
                    this._notificationService.prompt(Severity.Info, nls.localize('keybindingHandling', "Some keybindings don't go to the terminal by default and are handled by {0} instead.", this._productService.nameLong), [
                        {
                            label: nls.localize('configureTerminalSettings', "Configure Terminal Settings"),
                            run: () => {
                                this._preferencesService.openSettings({ jsonEditor: false, query: `@id:${"terminal.integrated.commandsToSkipShell" /* TerminalSettingId.CommandsToSkipShell */},${"terminal.integrated.sendKeybindingsToShell" /* TerminalSettingId.SendKeybindingsToShell */},${"terminal.integrated.allowChords" /* TerminalSettingId.AllowChords */}` });
                            }
                        }
                    ]);
                    this._storageService.store(SHOW_TERMINAL_CONFIG_PROMPT_KEY, false, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                }
                event.preventDefault();
                return false;
            }
            // Skip processing by xterm.js of keyboard events that match menu bar mnemonics
            if (this._terminalConfigurationService.config.allowMnemonics && !isMacintosh && event.altKey) {
                return false;
            }
            // If tab focus mode is on, tab is not passed to the terminal
            if (TabFocus.getTabFocusMode() && event.key === 'Tab') {
                return false;
            }
            // Prevent default when shift+tab is being sent to the terminal to avoid it bubbling up
            // and changing focus https://github.com/microsoft/vscode/issues/188329
            if (event.key === 'Tab' && event.shiftKey) {
                event.preventDefault();
                return true;
            }
            // Always have alt+F4 skip the terminal on Windows and allow it to be handled by the
            // system
            if (isWindows && event.altKey && event.key === 'F4' && !event.ctrlKey) {
                return false;
            }
            // Fallback to force ctrl+v to paste on browsers that do not support
            // navigator.clipboard.readText
            if (!BrowserFeatures.clipboard.readText && event.key === 'v' && event.ctrlKey) {
                return false;
            }
            return true;
        });
        this._register(dom.addDisposableListener(xterm.raw.element, 'mousedown', () => {
            // We need to listen to the mouseup event on the document since the user may release
            // the mouse button anywhere outside of _xterm.element.
            const listener = dom.addDisposableListener(xterm.raw.element.ownerDocument, 'mouseup', () => {
                // Delay with a setTimeout to allow the mouseup to propagate through the DOM
                // before evaluating the new selection state.
                setTimeout(() => this._refreshSelectionContextKey(), 0);
                listener.dispose();
            });
        }));
        this._register(dom.addDisposableListener(xterm.raw.element, 'touchstart', () => {
            xterm.raw.focus();
        }));
        // xterm.js currently drops selection on keyup as we need to handle this case.
        this._register(dom.addDisposableListener(xterm.raw.element, 'keyup', () => {
            // Wait until keyup has propagated through the DOM before evaluating
            // the new selection state.
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
        // If IShellLaunchConfig.waitOnExit was true and the process finished before the terminal
        // panel was initialized.
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
            this._terminalShellIntegrationEnabledContextKey.set(this.xterm.shellIntegration.status === 2 /* ShellIntegrationStatus.VSCode */);
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
            // See https://github.com/microsoft/vscode/issues/153486
            this._logService.error('Exception occurred during xterm disposal', err);
        }
        // HACK: Workaround for Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=559561,
        // as 'blur' event in xterm.raw.textarea is not triggered on xterm.dispose()
        // See https://github.com/microsoft/vscode/issues/138358
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
        // Process manager dispose/shutdown doesn't fire process exit, trigger with undefined if it
        // hasn't happened yet
        this._onProcessExit(undefined);
        this._onDisposed.fire(this);
        super.dispose();
    }
    async detachProcessAndDispose(reason) {
        // Detach the process and dispose the instance, without the instance dispose the terminal
        // won't go away. Force persist if the detach was requested by the user (not shutdown).
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
    async sendText(text, shouldExecute, bracketedPasteMode) {
        // Apply bracketed paste sequences if the terminal has the mode enabled, this will prevent
        // the text from triggering keybindings and ensure new lines are handled properly
        if (bracketedPasteMode && this.xterm?.raw.modes.bracketedPasteMode) {
            text = `\x1b[200~${text}\x1b[201~`;
        }
        // Normalize line endings to 'enter' press.
        text = text.replace(/\r?\n/g, '\r');
        if (shouldExecute && !text.endsWith('\r')) {
            text += '\r';
        }
        // Send it to the process
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
        // Wait for shell type to be ready
        await this.processReady;
        return preparePathForShell(originalPath, this.shellLaunchConfig.executable, this.title, this.shellType, this._processManager.backend, this._processManager.os);
    }
    setVisible(visible) {
        const didChange = this._isVisible !== visible;
        this._isVisible = visible;
        this._wrapperElement.classList.toggle('active', visible);
        if (visible && this.xterm) {
            this._open();
            // Flush any pending resizes
            this._resizeDebouncer?.flush();
            // Resize to re-evaluate dimensions, this will ensure when switching to a terminal it is
            // using the most up to date dimensions (eg. when terminal is created in the background
            // using cached dimensions of a split terminal).
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
            // Set the initial name based on the _resolved_ shell launch config, this will also
            // ensure the resolved icon gets shown
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
                // Listen to xterm.js' sequence title change event, trigger this async to ensure
                // _xtermReadyPromise is ready constructed since this is called from the ctor
                setTimeout(() => {
                    this._xtermReadyPromise.then(xterm => {
                        if (xterm) {
                            this._messageTitleDisposable.value = xterm.raw.onTitleChange(e => this._onTitleChange(e));
                        }
                    });
                });
                this._setTitle(this._shellLaunchConfig.executable, TitleEventSource.Process);
            }
        }));
        this._register(processManager.onProcessExit(exitCode => this._onProcessExit(exitCode)));
        this._register(processManager.onDidChangeProperty(({ type, value }) => {
            switch (type) {
                case "cwd" /* ProcessPropertyType.Cwd */:
                    this._cwd = value;
                    this._labelComputer?.refreshLabel(this);
                    break;
                case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                    this._initialCwd = value;
                    this._cwd = this._initialCwd;
                    this._setTitle(this.title, TitleEventSource.Config);
                    this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
                    this._onIconChanged.fire({ instance: this, userInitiated: false });
                    break;
                case "title" /* ProcessPropertyType.Title */:
                    this._setTitle(value ?? '', TitleEventSource.Process);
                    break;
                case "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */:
                    this.setOverrideDimensions(value, true);
                    break;
                case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                    this._setResolvedShellLaunchConfig(value);
                    break;
                case "shellType" /* ProcessPropertyType.ShellType */:
                    this.setShellType(value);
                    break;
                case "hasChildProcesses" /* ProcessPropertyType.HasChildProcesses */:
                    this._onDidChangeHasChildProcesses.fire(value);
                    break;
                case "usedShellIntegrationInjection" /* ProcessPropertyType.UsedShellIntegrationInjection */:
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
                id: "disconnected" /* TerminalStatus.Disconnected */,
                severity: Severity.Error,
                icon: Codicon.debugDisconnect,
                tooltip: nls.localize('disconnectStatus', "Lost connection to process")
            });
        }));
        this._register(processManager.onPtyReconnect(() => {
            if (this.xterm) {
                this.xterm.raw.options.disableStdin = false;
            }
            this.statusList.remove("disconnected" /* TerminalStatus.Disconnected */);
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
            // something strange is going on if cwd is not userHome in an empty workspace
            this._onProcessExit({
                message: nls.localize('workspaceNotTrustedCreateTerminalCwd', "Cannot launch a terminal process in an untrusted workspace with cwd {0} and userHome {1}", this._cwd, this._userHome)
            });
        }
        // Re-evaluate dimensions if the container has been set since the xterm instance was created
        if (this._container && this._cols === 0 && this._rows === 0) {
            this._initDimensions();
            this.xterm?.raw.resize(this._cols || 80 /* Constants.DefaultCols */, this._rows || 30 /* Constants.DefaultRows */);
        }
        const originalIcon = this.shellLaunchConfig.icon;
        await this._processManager.createProcess(this._shellLaunchConfig, this._cols || 80 /* Constants.DefaultCols */, this._rows || 30 /* Constants.DefaultRows */).then(result => {
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
        this.capabilities.get(4 /* TerminalCapability.BufferMarkDetection */)?.addMark(properties);
    }
    scrollToMark(startMarkId, endMarkId, highlight) {
        this.xterm?.markTracker.scrollToClosestMarker(startMarkId, endMarkId, highlight);
    }
    async freePortKillProcess(port, command) {
        await this._processManager?.freePortKillProcess(port);
        this.runCommand(command, false);
    }
    _onProcessData(ev) {
        // Ensure events are split by SI command execute sequence to ensure the output of the
        // command can be read by extensions. This must be done here as xterm.js does not currently
        // have a listener for when individual data events are parsed, only `onWriteParsed` which
        // fires when the write buffer is flushed.
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
    /**
     * Called when either a process tied to a terminal has exited or when a terminal renderer
     * simulates a process exiting (e.g. custom execution task).
     * @param exitCode The exit code of the process, this is undefined when the terminal was exited
     * through user action.
     */
    async _onProcessExit(exitCodeOrError) {
        // Prevent dispose functions being triggered multiple times
        if (this._isExiting) {
            return;
        }
        const parsedExitResult = parseExitResult(exitCodeOrError, this.shellLaunchConfig, this._processManager.processState, this._initialCwd);
        if (this._usedShellIntegrationInjection && this._processManager.processState === 4 /* ProcessState.KilledDuringLaunch */ && parsedExitResult?.code !== 0) {
            this._relaunchWithShellIntegrationDisabled(parsedExitResult?.message);
            this._onExit.fire(exitCodeOrError);
            return;
        }
        this._isExiting = true;
        await this._flushXtermData();
        this._exitCode = parsedExitResult?.code;
        const exitMessage = parsedExitResult?.message;
        this._logService.debug('Terminal process exit', 'instanceId', this.instanceId, 'code', this._exitCode, 'processState', this._processManager.processState);
        // Only trigger wait on exit when the exit was *not* triggered by the
        // user (via the `workbench.action.terminal.kill` command).
        const waitOnExit = this.waitOnExit;
        if (waitOnExit && this._processManager.processState !== 5 /* ProcessState.KilledByUser */) {
            this._xtermReadyPromise.then(xterm => {
                if (!xterm) {
                    return;
                }
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
                // Disable all input if the terminal is exiting and listen for next keypress
                xterm.raw.options.disableStdin = true;
                if (xterm.raw.textarea) {
                    this._attachPressAnyKeyToCloseListener(xterm.raw);
                }
            });
        }
        else {
            if (exitMessage) {
                const failedDuringLaunch = this._processManager.processState === 4 /* ProcessState.KilledDuringLaunch */;
                if (failedDuringLaunch || this._terminalConfigurationService.config.showExitAlert) {
                    // Always show launch failures
                    this._notificationService.notify({
                        message: exitMessage,
                        severity: Severity.Error,
                        actions: { primary: [this._scopedInstantiationService.createInstance(TerminalLaunchHelpAction)] }
                    });
                }
                else {
                    // Log to help surface the error in case users report issues with showExitAlert
                    // disabled
                    this._logService.warn(exitMessage);
                }
            }
            this.dispose(TerminalExitReason.Process);
        }
        // First onExit to consumers, this can happen after the terminal has already been disposed.
        this._onExit.fire(exitCodeOrError);
        // Dispose of the onExit event if the terminal will not be reused again
        if (this.isDisposed) {
            this._onExit.dispose();
        }
    }
    _relaunchWithShellIntegrationDisabled(exitMessage) {
        this._shellLaunchConfig.ignoreShellIntegration = true;
        this.relaunch();
        this.statusList.add({
            id: "shell-integration-attention-needed" /* TerminalStatus.ShellIntegrationAttentionNeeded */,
            severity: Severity.Warning,
            icon: Codicon.warning,
            tooltip: `${exitMessage} ` + nls.localize('launchFailed.exitCodeOnlyShellIntegration', 'Disabling shell integration in user settings might help.'),
            hoverActions: [{
                    commandId: "workbench.action.terminal.learnMore" /* TerminalCommandId.ShellIntegrationLearnMore */,
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
    /**
     * Ensure write calls to xterm.js have finished before resolving.
     */
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
        // Unsubscribe any key listener we may have.
        this._pressAnyKeyToCloseListener?.dispose();
        this._pressAnyKeyToCloseListener = undefined;
        const xterm = this.xterm;
        if (xterm) {
            if (!reset) {
                // Ensure new processes' output starts at start of new line
                await new Promise(r => xterm.raw.write('\n\x1b[G', r));
            }
            // Print initialText if specified
            if (shell.initialText) {
                this._shellLaunchConfig.initialText = shell.initialText;
                await new Promise(r => this._writeInitialText(xterm, r));
            }
            // Clean up waitOnExit state
            if (this._isExiting && this._shellLaunchConfig.waitOnExit) {
                xterm.raw.options.disableStdin = false;
                this._isExiting = false;
            }
            if (reset) {
                xterm.clearDecorations();
            }
        }
        // Dispose the environment info widget if it exists
        this.statusList.remove("relaunch-needed" /* TerminalStatus.RelaunchNeeded */);
        if (!reset) {
            // HACK: Force initialText to be non-falsy for reused terminals such that the
            // conptyInheritCursor flag is passed to the node-pty, this flag can cause a Window to stop
            // responding in Windows 10 1903 so we only want to use it when something is definitely written
            // to the terminal.
            shell.initialText = ' ';
        }
        // Set the new shell launch config
        this._shellLaunchConfig = shell; // Must be done before calling _createProcess()
        await this._processManager.relaunch(this._shellLaunchConfig, this._cols || 80 /* Constants.DefaultCols */, this._rows || 30 /* Constants.DefaultRows */, reset).then(result => {
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
    async _updateProcessCwd() {
        if (this.isDisposed || this.shellLaunchConfig.customPtyImplementation) {
            return;
        }
        // reset cwd if it has changed, so file based url paths can be resolved
        try {
            const cwd = await this._refreshProperty("cwd" /* ProcessPropertyType.Cwd */);
            if (typeof cwd !== 'string') {
                throw new Error(`cwd is not a string ${cwd}`);
            }
        }
        catch (e) {
            // Swallow this as it means the process has been killed
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
        // Don't layout if dimensions are invalid (eg. the container is not attached to the DOM or
        // if display: none
        if (dimension.width <= 0 || dimension.height <= 0) {
            return;
        }
        // Evaluate columns and rows, exclude the wrapper element's margin
        const terminalWidth = this._evaluateColsAndRows(dimension.width, dimension.height);
        if (!terminalWidth) {
            return;
        }
        this._resize();
        // Signal the container is ready
        if (!this._containerReadyBarrier.isOpen()) {
            this._containerReadyBarrier.open();
        }
        // Layout all contributions
        for (const contribution of this._contributions.values()) {
            if (!this.xterm) {
                this._xtermReadyPromise.then(xterm => {
                    if (xterm) {
                        contribution.layout?.(xterm, dimension);
                    }
                });
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
        // Only apply these settings when the terminal is visible so that
        // the characters are measured correctly.
        if (this._isVisible && this._layoutSettingsChanged) {
            const font = this.xterm.getFont();
            const config = this._terminalConfigurationService.config;
            this.xterm.raw.options.letterSpacing = font.letterSpacing;
            this.xterm.raw.options.lineHeight = font.lineHeight;
            this.xterm.raw.options.fontSize = font.fontSize;
            this.xterm.raw.options.fontFamily = font.fontFamily;
            this.xterm.raw.options.fontWeight = config.fontWeight;
            this.xterm.raw.options.fontWeightBold = config.fontWeightBold;
            // Any of the above setting changes could have changed the dimensions of the
            // terminal, re-evaluate now.
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
                await this._updateProperty("fixedDimensions" /* ProcessPropertyType.FixedDimensions */, { cols: this._fixedCols, rows: this._fixedRows });
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
            const accessibilityHelpKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
            if (this._configurationService.getValue("accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */) && accessibilityHelpKeybinding) {
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
                if (this._processManager.os === 1 /* OperatingSystem.Windows */) {
                    // Extract the file name without extension
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
                // If the title has not been set by the API or the rename command, unregister the handler that
                // automatically updates the terminal name
                this._staticTitle = title;
                this._messageTitleDisposable.value = undefined;
                break;
            case TitleEventSource.Sequence:
                // On Windows, some shells will fire this with the full path which we want to trim
                // to show just the file name. This should only happen if the title looks like an
                // absolute Windows file path
                this._sequence = title;
                if (this._processManager.os === 1 /* OperatingSystem.Windows */ &&
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
            // this terminal never had a real size => keep the last dimensions override exact size
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
            const maxColsForTexture = Math.floor(4096 /* Constants.MaxCanvasWidth */ / (font.charWidth ?? 20));
            // Fixed columns should be at least xterm.js' regular column count
            const proposedCols = Math.max(this.maxCols, Math.min(this.xterm.getLongestViewportWrappedLineLength(), maxColsForTexture));
            // Don't switch to fixed dimensions if the content already fits as it makes the scroll
            // bar look bad being off the edge
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
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                useShadows: false,
                scrollYToX: false,
                consumeMouseWheelIfScrollbarIsNeeded: false
            }));
            this._container.appendChild(this._horizontalScrollbar.getDomNode());
        }
        this._horizontalScrollbar.setScrollDimensions({
            width: this.xterm.raw.element.clientWidth,
            scrollWidth: this._fixedCols * charWidth + 40 // Padding + scroll bar
        });
        this._horizontalScrollbar.getDomNode().style.paddingBottom = '16px';
        // work around for https://github.com/xtermjs/xterm.js/issues/3482
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
        // Check if the status should exist
        if (!info) {
            this.statusList.remove("relaunch-needed" /* TerminalStatus.RelaunchNeeded */);
            this.statusList.remove("env-var-info-changes-active" /* TerminalStatus.EnvironmentVariableInfoChangesActive */);
            return;
        }
        // Recreate the process seamlessly without informing the use if the following conditions are
        // met.
        if (
        // The change requires a relaunch
        info.requiresAction &&
            // The feature is enabled
            this._terminalConfigurationService.config.environmentChangesRelaunch &&
            // Has not been interacted with
            !this._processManager.hasWrittenData &&
            // Not a feature terminal or is a reconnecting task terminal (TODO: Need to explain the latter case)
            (!this._shellLaunchConfig.isFeatureTerminal || (this.reconnectionProperties && this._configurationService.getValue('task.reconnection') === true)) &&
            // Not a custom pty
            !this._shellLaunchConfig.customPtyImplementation &&
            // Not an extension owned terminal
            !this._shellLaunchConfig.isExtensionOwnedTerminal &&
            // Not a reconnected or revived terminal
            !this._shellLaunchConfig.attachPersistentProcess &&
            // Not a Windows remote using ConPTY (#187084)
            !(this._processManager.remoteAuthority && this._terminalConfigurationService.config.windowsEnableConpty && (await this._processManager.getBackendOS()) === 1 /* OperatingSystem.Windows */)) {
            this.relaunch();
            return;
        }
        // Re-create statuses
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
        if (this.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
            return this.capabilities.get(0 /* TerminalCapability.CwdDetection */).getCwd();
        }
        else if (this.capabilities.has(1 /* TerminalCapability.NaiveCwdDetection */)) {
            return this.capabilities.get(1 /* TerminalCapability.NaiveCwdDetection */).getCwd();
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
            // Reset this tab's color
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
        // Don't handle mouse event if it was on the scroll bar
        if (dom.isHTMLElement(event.target) && (event.target.classList.contains('scrollbar') || event.target.classList.contains('slider'))) {
            return { cancelContextMenu: true };
        }
        // Allow contributions to handle the mouse event first
        for (const contrib of this._contributions.values()) {
            const result = await contrib.handleMouseEvent?.(event);
            if (result?.handled) {
                return { cancelContextMenu: true };
            }
        }
        // Middle click
        if (event.which === 2) {
            switch (this._terminalConfigurationService.config.middleClickBehavior) {
                case 'default':
                default:
                    // Drop selection and focus terminal on Linux to enable middle button paste
                    // when click occurs on the selection itself.
                    this.focus();
                    break;
            }
            return;
        }
        // Right click
        if (event.which === 3) {
            // Shift click forces the context menu
            if (event.shiftKey) {
                openContextMenu(dom.getActiveWindow(), event, this, contextMenu, this._contextMenuService);
                return;
            }
            const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
            if (rightClickBehavior === 'nothing') {
                if (!event.shiftKey) {
                    return { cancelContextMenu: true };
                }
                return;
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
    __param(2, IContextKeyService),
    __param(3, IContextMenuService),
    __param(4, IInstantiationService),
    __param(5, ITerminalConfigurationService),
    __param(6, ITerminalProfileResolverService),
    __param(7, IPathService),
    __param(8, IKeybindingService),
    __param(9, INotificationService),
    __param(10, IPreferencesService),
    __param(11, IViewsService),
    __param(12, IThemeService),
    __param(13, IConfigurationService),
    __param(14, ITerminalLogService),
    __param(15, IStorageService),
    __param(16, IAccessibilityService),
    __param(17, IProductService),
    __param(18, IQuickInputService),
    __param(19, IWorkbenchEnvironmentService),
    __param(20, IWorkspaceContextService),
    __param(21, IEditorService),
    __param(22, IWorkspaceTrustRequestService),
    __param(23, IHistoryService),
    __param(24, ITelemetryService),
    __param(25, IOpenerService),
    __param(26, ICommandService),
    __param(27, IAccessibilitySignalService),
    __param(28, IViewDescriptorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalInstance);
export { TerminalInstance };
let TerminalInstanceDragAndDropController = class TerminalInstanceDragAndDropController extends Disposable {
    get onDropFile() { return this._onDropFile.event; }
    get onDropTerminal() { return this._onDropTerminal.event; }
    constructor(_container, _layoutService, _viewDescriptorService) {
        super();
        this._container = _container;
        this._layoutService = _layoutService;
        this._viewDescriptorService = _viewDescriptorService;
        this._onDropFile = this._register(new Emitter());
        this._onDropTerminal = this._register(new Emitter());
        this._register(toDisposable(() => this._clearDropOverlay()));
    }
    _clearDropOverlay() {
        this._dropOverlay?.remove();
        this._dropOverlay = undefined;
    }
    onDragEnter(e) {
        if (!containsDragType(e, DataTransfers.FILES, DataTransfers.RESOURCES, "Terminals" /* TerminalDataTransfers.Terminals */, CodeDataTransfers.FILES)) {
            return;
        }
        if (!this._dropOverlay) {
            this._dropOverlay = document.createElement('div');
            this._dropOverlay.classList.add('terminal-drop-overlay');
        }
        // Dragging terminals
        if (containsDragType(e, "Terminals" /* TerminalDataTransfers.Terminals */)) {
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
        // Dragging terminals
        if (containsDragType(e, "Terminals" /* TerminalDataTransfers.Terminals */)) {
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
        // Check if files were dragged from the tree explorer
        let path;
        const rawResources = e.dataTransfer.getData(DataTransfers.RESOURCES);
        if (rawResources) {
            path = URI.parse(JSON.parse(rawResources)[0]);
        }
        const rawCodeFiles = e.dataTransfer.getData(CodeDataTransfers.FILES);
        if (!path && rawCodeFiles) {
            path = URI.file(JSON.parse(rawCodeFiles)[0]);
        }
        if (!path && e.dataTransfer.files.length > 0 && getPathForFile(e.dataTransfer.files[0])) {
            // Check if the file was dragged from the filesystem
            path = URI.file(getPathForFile(e.dataTransfer.files[0]));
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
        return this._getViewOrientation() === 1 /* Orientation.HORIZONTAL */
            ? (e.clientX - rect.left < rect.width / 2 ? 'before' : 'after')
            : (e.clientY - rect.top < rect.height / 2 ? 'before' : 'after');
    }
    _getViewOrientation() {
        const panelPosition = this._layoutService.getPanelPosition();
        const terminalLocation = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
        return terminalLocation === 1 /* ViewContainerLocation.Panel */ && isHorizontal(panelPosition)
            ? 1 /* Orientation.HORIZONTAL */
            : 0 /* Orientation.VERTICAL */;
    }
};
TerminalInstanceDragAndDropController = __decorate([
    __param(1, IWorkbenchLayoutService),
    __param(2, IViewDescriptorService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object])
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
        this._title = this.computeLabel(instance, this._terminalConfigurationService.config.tabs.title, "title" /* TerminalLabelType.Title */, reset);
        this._description = this.computeLabel(instance, this._terminalConfigurationService.config.tabs.description, "description" /* TerminalLabelType.Description */);
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
            return labelType === "title" /* TerminalLabelType.Title */ ? (instance.processName || '') : '';
        }
        if (!reset && instance.staticTitle && labelType === "title" /* TerminalLabelType.Title */) {
            return instance.staticTitle.replace(/[\n\r\t]/g, '') || templateProperties.process?.replace(/[\n\r\t]/g, '') || '';
        }
        const detection = instance.capabilities.has(0 /* TerminalCapability.CwdDetection */) || instance.capabilities.has(1 /* TerminalCapability.NaiveCwdDetection */);
        const folders = this._workspaceContextService.getWorkspace().folders;
        const multiRootWorkspace = folders.length > 1;
        // Only set cwdFolder if detection is on
        if (templateProperties.cwd && detection && (!instance.shellLaunchConfig.isFeatureTerminal || labelType === "title" /* TerminalLabelType.Title */)) {
            const cwdUri = URI.from({
                scheme: instance.workspaceFolder?.uri.scheme || Schemas.file,
                path: instance.cwd ? path.resolve(instance.cwd) : undefined
            });
            // Multi-root workspaces always show cwdFolder to disambiguate them, otherwise only show
            // when it differs from the workspace folder in which it was launched from
            let showCwd = false;
            if (multiRootWorkspace) {
                showCwd = true;
            }
            else if (instance.workspaceFolder?.uri) {
                const caseSensitive = this._fileService.hasCapability(instance.workspaceFolder.uri, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                showCwd = cwdUri.fsPath.localeCompare(instance.workspaceFolder.uri.fsPath, undefined, { sensitivity: caseSensitive ? 'case' : 'base' }) !== 0;
            }
            if (showCwd) {
                templateProperties.cwdFolder = path.basename(templateProperties.cwd);
            }
        }
        // Remove special characters that could mess with rendering
        const label = template(labelTemplate, templateProperties).replace(/[\n\r\t]/g, '').trim();
        return label === '' && labelType === "title" /* TerminalLabelType.Title */ ? (instance.processName || '') : label;
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
    // Only return a message if the exit code is non-zero
    if (exitCodeOrError === undefined || exitCodeOrError === 0) {
        return { code: exitCodeOrError, message: undefined };
    }
    const code = typeof exitCodeOrError === 'number' ? exitCodeOrError : exitCodeOrError.code;
    // Create exit code message
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
            if (processState === 4 /* ProcessState.KilledDuringLaunch */) {
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
            // Ignore internal errors
            if (exitCodeOrError.message.toString().includes('Could not find pty with id')) {
                break;
            }
            // Convert conpty code-based failures into human friendly messages
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
        if (location === 1 /* ViewContainerLocation.Panel */) {
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
