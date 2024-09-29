var H=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var u=(g,v,e,t)=>{for(var i=t>1?void 0:t?M(v,e):v,n=g.length-1,r;n>=0;n--)(r=g[n])&&(i=(t?r(v,e,i):r(i))||i);return t&&i&&H(v,e,i),i},s=(g,v)=>(e,t)=>v(e,t,g);import*as G from"../../../../base/browser/dom.js";import{DeferredPromise as W,timeout as x}from"../../../../base/common/async.js";import{debounce as A,memoize as p}from"../../../../base/common/decorators.js";import{DynamicListEventMultiplexer as U,Emitter as I,Event as S}from"../../../../base/common/event.js";import{Disposable as q,dispose as R,toDisposable as N}from"../../../../base/common/lifecycle.js";import{Schemas as L}from"../../../../base/common/network.js";import{isMacintosh as V,isWeb as k}from"../../../../base/common/platform.js";import{URI as w}from"../../../../base/common/uri.js";import"../../../../platform/quickinput/common/quickInput.js";import*as P from"../../../../nls.js";import{ICommandService as $}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as j}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as X}from"../../../../platform/contextkey/common/contextkey.js";import{IDialogService as z}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as Y}from"../../../../platform/instantiation/common/instantiation.js";import{INotificationService as Q}from"../../../../platform/notification/common/notification.js";import{ITerminalLogService as J,TerminalExitReason as b,TerminalLocation as o,TerminalLocationString as Z,TitleEventSource as ee}from"../../../../platform/terminal/common/terminal.js";import{formatMessageForTerminal as O}from"../../../../platform/terminal/common/terminalStrings.js";import{iconForeground as te}from"../../../../platform/theme/common/colorRegistry.js";import{getIconRegistry as ie}from"../../../../platform/theme/common/iconRegistry.js";import{ColorScheme as ne}from"../../../../platform/theme/common/theme.js";import{IThemeService as re,Themable as ae}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as se}from"../../../../base/common/themables.js";import{IWorkspaceContextService as oe}from"../../../../platform/workspace/common/workspace.js";import{VirtualWorkspaceContext as ce}from"../../../common/contextkeys.js";import"../../../common/views.js";import{IViewsService as le}from"../../../services/views/common/viewsService.js";import{ITerminalConfigurationService as B,ITerminalEditorService as me,ITerminalGroupService as de,ITerminalInstanceService as he,ITerminalService as ue,TerminalConnectionState as D}from"./terminal.js";import{getCwdForSplit as Ie}from"./terminalActions.js";import{TerminalEditorInput as K}from"./terminalEditorInput.js";import{getColorStyleContent as ve,getUriClasses as pe}from"./terminalIcon.js";import{TerminalProfileQuickpick as fe}from"./terminalProfileQuickpick.js";import{getInstanceFromResource as _e,getTerminalUri as ge,parseTerminalUri as Te}from"./terminalUri.js";import"./terminalView.js";import{ITerminalProfileService as F,TERMINAL_VIEW_ID as Se}from"../common/terminal.js";import{TerminalContextKeys as y}from"../common/terminalContextKey.js";import{columnToEditorGroup as ye}from"../../../services/editor/common/editorGroupColumn.js";import{IEditorGroupsService as Ce}from"../../../services/editor/common/editorGroupsService.js";import{AUX_WINDOW_GROUP as we,IEditorService as Pe,SIDE_GROUP as De}from"../../../services/editor/common/editorService.js";import{IWorkbenchEnvironmentService as Ee}from"../../../services/environment/common/environmentService.js";import{IExtensionService as be}from"../../../services/extensions/common/extensions.js";import{ILifecycleService as Ge,ShutdownReason as C,StartupKind as Ae}from"../../../services/lifecycle/common/lifecycle.js";import{IRemoteAgentService as xe}from"../../../services/remote/common/remoteAgentService.js";import{XtermTerminal as Re}from"./xterm/xtermTerminal.js";import{TerminalInstance as Le}from"./terminalInstance.js";import{IKeybindingService as ke}from"../../../../platform/keybinding/common/keybinding.js";import{TerminalCapabilityStore as Oe}from"../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";import{ITimerService as Be}from"../../../services/timer/browser/timerService.js";import{mark as c}from"../../../../base/common/performance.js";import{DetachedTerminal as Ke}from"./detachedTerminal.js";import"../../../../platform/terminal/common/capabilities/capabilities.js";import{createInstanceCapabilityEventMultiplexer as Fe}from"./terminalEvents.js";import{mainWindow as He}from"../../../../base/browser/window.js";import"../../../common/editor.js";let h=class extends q{constructor(e,t,i,n,r,a,l,m,f,T,_,Me,We,Ue,qe,Ne,Ve,$e,je,Xe,ze,Ye){super();this._contextKeyService=e;this._lifecycleService=t;this._logService=i;this._dialogService=n;this._instantiationService=r;this._remoteAgentService=a;this._viewsService=l;this._configurationService=m;this._terminalConfigService=f;this._environmentService=T;this._terminalConfigurationService=_;this._terminalEditorService=Me;this._terminalGroupService=We;this._terminalInstanceService=Ue;this._editorGroupsService=qe;this._terminalProfileService=Ne;this._extensionService=Ve;this._notificationService=$e;this._workspaceContextService=je;this._commandService=Xe;this._keybindingService=ze;this._timerService=Ye;this._register(this.onDidCreateInstance(()=>this._terminalProfileService.refreshAvailableProfiles())),this._forwardInstanceHostEvents(this._terminalGroupService),this._forwardInstanceHostEvents(this._terminalEditorService),this._register(this._terminalGroupService.onDidChangeActiveGroup(this._onDidChangeActiveGroup.fire,this._onDidChangeActiveGroup)),this._register(this._terminalInstanceService.onDidCreateInstance(d=>{this._initInstanceListeners(d),this._onDidCreateInstance.fire(d)})),this._register(this._terminalGroupService.onDidChangeActiveInstance(d=>{!d&&!this._isShuttingDown&&this._terminalGroupService.hidePanel(),d?.shellType?this._terminalShellTypeContextKey.set(d.shellType.toString()):(!d||!d.shellType)&&this._terminalShellTypeContextKey.reset()})),this._handleInstanceContextKeys(),this._terminalShellTypeContextKey=y.shellType.bindTo(this._contextKeyService),this._processSupportContextKey=y.processSupported.bindTo(this._contextKeyService),this._processSupportContextKey.set(!k||this._remoteAgentService.getConnection()!==null),this._terminalHasBeenCreated=y.terminalHasBeenCreated.bindTo(this._contextKeyService),this._terminalCountContextKey=y.count.bindTo(this._contextKeyService),this._terminalEditorActive=y.terminalEditorActive.bindTo(this._contextKeyService),this._register(this.onDidChangeActiveInstance(d=>{this._terminalEditorActive.set(!!d?.target&&d.target===o.Editor)})),this._register(t.onBeforeShutdown(async d=>d.veto(this._onBeforeShutdown(d.reason),"veto.terminal"))),this._register(t.onWillShutdown(d=>this._onWillShutdown(d))),this._initializePrimaryBackend(),x(0).then(()=>this._register(this._instantiationService.createInstance(E,He.document.head)))}_hostActiveTerminals=new Map;_detachedXterms=new Set;_terminalEditorActive;_terminalShellTypeContextKey;_isShuttingDown=!1;_backgroundedTerminalInstances=[];_backgroundedTerminalDisposables=new Map;_processSupportContextKey;_primaryBackend;_terminalHasBeenCreated;_terminalCountContextKey;_nativeDelegate;_shutdownWindowCount;_editable;get isProcessSupportRegistered(){return!!this._processSupportContextKey.get()}_connectionState=D.Connecting;get connectionState(){return this._connectionState}_whenConnected=new W;get whenConnected(){return this._whenConnected.p}_restoredGroupCount=0;get restoredGroupCount(){return this._restoredGroupCount}get instances(){return this._terminalGroupService.instances.concat(this._terminalEditorService.instances).concat(this._backgroundedTerminalInstances)}get detachedInstances(){return this._detachedXterms}_reconnectedTerminalGroups;_reconnectedTerminals=new Map;getReconnectedTerminals(e){return this._reconnectedTerminals.get(e)}get defaultLocation(){return this._terminalConfigurationService.config.defaultLocation===Z.Editor?o.Editor:o.Panel}_activeInstance;get activeInstance(){for(const e of this._hostActiveTerminals.values())if(e?.hasFocus)return e;return this._activeInstance}_editingTerminal;_onDidCreateInstance=this._register(new I);get onDidCreateInstance(){return this._onDidCreateInstance.event}_onDidChangeInstanceDimensions=this._register(new I);get onDidChangeInstanceDimensions(){return this._onDidChangeInstanceDimensions.event}_onDidRegisterProcessSupport=this._register(new I);get onDidRegisterProcessSupport(){return this._onDidRegisterProcessSupport.event}_onDidChangeConnectionState=this._register(new I);get onDidChangeConnectionState(){return this._onDidChangeConnectionState.event}_onDidRequestStartExtensionTerminal=this._register(new I);get onDidRequestStartExtensionTerminal(){return this._onDidRequestStartExtensionTerminal.event}_onDidDisposeInstance=this._register(new I);get onDidDisposeInstance(){return this._onDidDisposeInstance.event}_onDidFocusInstance=this._register(new I);get onDidFocusInstance(){return this._onDidFocusInstance.event}_onDidChangeActiveInstance=this._register(new I);get onDidChangeActiveInstance(){return this._onDidChangeActiveInstance.event}_onDidChangeInstances=this._register(new I);get onDidChangeInstances(){return this._onDidChangeInstances.event}_onDidChangeInstanceCapability=this._register(new I);get onDidChangeInstanceCapability(){return this._onDidChangeInstanceCapability.event}_onDidChangeActiveGroup=this._register(new I);get onDidChangeActiveGroup(){return this._onDidChangeActiveGroup.event}get onAnyInstanceData(){return this._register(this.createOnInstanceEvent(e=>S.map(e.onData,t=>({instance:e,data:t})))).event}get onAnyInstanceDataInput(){return this._register(this.createOnInstanceEvent(e=>S.map(e.onDidInputData,()=>e,e.store))).event}get onAnyInstanceIconChange(){return this._register(this.createOnInstanceEvent(e=>e.onIconChanged)).event}get onAnyInstanceMaximumDimensionsChange(){return this._register(this.createOnInstanceEvent(e=>S.map(e.onMaximumDimensionsChanged,()=>e,e.store))).event}get onAnyInstancePrimaryStatusChange(){return this._register(this.createOnInstanceEvent(e=>S.map(e.statusList.onDidChangePrimaryStatus,()=>e,e.store))).event}get onAnyInstanceProcessIdReady(){return this._register(this.createOnInstanceEvent(e=>e.onProcessIdReady)).event}get onAnyInstanceSelectionChange(){return this._register(this.createOnInstanceEvent(e=>e.onDidChangeSelection)).event}get onAnyInstanceTitleChange(){return this._register(this.createOnInstanceEvent(e=>e.onTitleChanged)).event}async showProfileQuickPick(e,t){const n=await this._instantiationService.createInstance(fe).showAndGetResult(e);if(!n||typeof n=="string")return;const r=n.keyMods;if(e==="createInstance"){const a=this.getDefaultInstanceHost().activeInstance;let l;if(n.config&&"id"in n?.config){await this.createContributedTerminalProfile(n.config.extensionIdentifier,n.config.id,{icon:n.config.options?.icon,color:n.config.options?.color,location:r?.alt&&a?{splitActiveTerminal:!0}:this.defaultLocation});return}else n.config&&"profileName"in n.config&&(r?.alt&&a?l=await this.createTerminal({location:{parentTerminal:a},config:n.config,cwd:t}):l=await this.createTerminal({location:this.defaultLocation,config:n.config,cwd:t}));if(l&&this.defaultLocation!==o.Editor)return this._terminalGroupService.showPanel(!0),this.setActiveInstance(l),l}}async _initializePrimaryBackend(){c("code/terminal/willGetTerminalBackend"),this._primaryBackend=await this._terminalInstanceService.getBackend(this._environmentService.remoteAuthority),c("code/terminal/didGetTerminalBackend");const e=this._terminalConfigurationService.config.enablePersistentSessions;this._connectionState=D.Connecting;const t=!!this._environmentService.remoteAuthority&&e;this._primaryBackend&&this._register(this._primaryBackend.onDidRequestDetach(async n=>{const r=this.getInstanceFromResource(ge(n.workspaceId,n.instanceId));if(r){const a=r?.persistentProcessId;a&&!r.shellLaunchConfig.isFeatureTerminal&&!r.shellLaunchConfig.customPtyImplementation?(r.target===o.Editor?this._terminalEditorService.detachInstance(r):this._terminalGroupService.getGroupForInstance(r)?.removeInstance(r),await r.detachProcessAndDispose(b.User),await this._primaryBackend?.acceptDetachInstanceReply(n.requestId,a)):await this._primaryBackend?.acceptDetachInstanceReply(n.requestId,void 0)}})),c("code/terminal/willReconnect");let i;t?i=this._reconnectToRemoteTerminals():e?i=this._reconnectToLocalTerminals():i=Promise.resolve(),i.then(async()=>{this._setConnected(),c("code/terminal/didReconnect"),c("code/terminal/willReplay");const n=await this._reconnectedTerminalGroups?.then(r=>r.map(a=>a.terminalInstances).flat())??[];await Promise.all(n.map(r=>new Promise(a=>S.once(r.onProcessReplayComplete)(a)))),c("code/terminal/didReplay"),c("code/terminal/willGetPerformanceMarks"),await Promise.all(Array.from(this._terminalInstanceService.getRegisteredBackends()).map(async r=>{this._timerService.setPerformanceMarks(r.remoteAuthority===void 0?"localPtyHost":"remotePtyHost",await r.getPerformanceMarks()),r.setReady()})),c("code/terminal/didGetPerformanceMarks"),this._whenConnected.complete()})}getPrimaryBackend(){return this._primaryBackend}_forwardInstanceHostEvents(e){this._register(e.onDidChangeInstances(this._onDidChangeInstances.fire,this._onDidChangeInstances)),this._register(e.onDidDisposeInstance(this._onDidDisposeInstance.fire,this._onDidDisposeInstance)),this._register(e.onDidChangeActiveInstance(t=>this._evaluateActiveInstance(e,t))),this._register(e.onDidFocusInstance(t=>{this._onDidFocusInstance.fire(t),this._evaluateActiveInstance(e,t)})),this._register(e.onDidChangeInstanceCapability(t=>{this._onDidChangeInstanceCapability.fire(t)})),this._hostActiveTerminals.set(e,void 0)}_evaluateActiveInstance(e,t){if(this._hostActiveTerminals.set(e,t),t===void 0)for(const i of this._hostActiveTerminals.values())i&&(t=i);this._activeInstance=t,this._onDidChangeActiveInstance.fire(t)}setActiveInstance(e){e.shellLaunchConfig.hideFromUser&&this._showBackgroundTerminal(e),e.target===o.Editor?this._terminalEditorService.setActiveInstance(e):this._terminalGroupService.setActiveInstance(e)}async focusInstance(e){return e.target===o.Editor?this._terminalEditorService.focusInstance(e):this._terminalGroupService.focusInstance(e)}async focusActiveInstance(){if(this._activeInstance)return this.focusInstance(this._activeInstance)}async createContributedTerminalProfile(e,t,i){await this._extensionService.activateByEvent(`onTerminalProfile:${t}`);const n=this._terminalProfileService.getContributedProfileProvider(e,t);if(!n){this._notificationService.error(`No terminal profile provider registered for id "${t}"`);return}try{await n.createContributedTerminalProfile(i),this._terminalGroupService.setActiveInstanceByIndex(this._terminalGroupService.instances.length-1),await this._terminalGroupService.activeInstance?.focusWhenReady()}catch(r){this._notificationService.error(r.message)}}async safeDisposeTerminal(e){if(!(e.target!==o.Editor&&e.hasChildProcesses&&(this._terminalConfigurationService.config.confirmOnKill==="panel"||this._terminalConfigurationService.config.confirmOnKill==="always")&&await this._showTerminalCloseConfirmation(!0)))return new Promise(t=>{S.once(e.onExit)(()=>t()),e.dispose(b.User)})}_setConnected(){this._connectionState=D.Connected,this._onDidChangeConnectionState.fire(),this._logService.trace("Pty host ready")}async _reconnectToRemoteTerminals(){const e=this._environmentService.remoteAuthority;if(!e)return;const t=await this._terminalInstanceService.getBackend(e);if(!t)return;c("code/terminal/willGetTerminalLayoutInfo");const i=await t.getTerminalLayoutInfo();c("code/terminal/didGetTerminalLayoutInfo"),t.reduceConnectionGraceTime(),c("code/terminal/willRecreateTerminalGroups"),await this._recreateTerminalGroups(i),c("code/terminal/didRecreateTerminalGroups"),this._attachProcessLayoutListeners(),this._logService.trace("Reconnected to remote terminals")}async _reconnectToLocalTerminals(){const e=await this._terminalInstanceService.getBackend();if(!e)return;c("code/terminal/willGetTerminalLayoutInfo");const t=await e.getTerminalLayoutInfo();c("code/terminal/didGetTerminalLayoutInfo"),t&&t.tabs.length>0&&(c("code/terminal/willRecreateTerminalGroups"),this._reconnectedTerminalGroups=this._recreateTerminalGroups(t),c("code/terminal/didRecreateTerminalGroups")),this._attachProcessLayoutListeners(),this._logService.trace("Reconnected to local terminals")}_recreateTerminalGroups(e){const t=[];let i;if(e){for(const n of e.tabs){const r=n.terminals.filter(a=>a.terminal&&a.terminal.isOrphan);if(r.length){this._restoredGroupCount+=r.length;const a=this._recreateTerminalGroup(n,r);t.push(a),n.isActive&&(i=a);const l=this.instances.find(m=>m.shellLaunchConfig.attachPersistentProcess?.id===n.activePersistentProcessId);l&&this.setActiveInstance(l)}}e.tabs.length&&i?.then(n=>this._terminalGroupService.activeGroup=n)}return Promise.all(t).then(n=>n.filter(r=>!!r))}async _recreateTerminalGroup(e,t){let i;for(const r of t){const a=r.terminal;this._lifecycleService.startupKind!==Ae.ReloadedWindow&&a.type==="Task"||(c(`code/terminal/willRecreateTerminal/${a.id}-${a.pid}`),i=this.createTerminal({config:{attachPersistentProcess:a},location:i?{parentTerminal:i}:o.Panel}),i.then(()=>c(`code/terminal/didRecreateTerminal/${a.id}-${a.pid}`)))}return i?.then(r=>{const a=this._terminalGroupService.getGroupForInstance(r);return a?.resizePanes(e.terminals.map(l=>l.relativeSize)),a})}_attachProcessLayoutListeners(){this._register(this.onDidChangeActiveGroup(()=>this._saveState())),this._register(this.onDidChangeActiveInstance(()=>this._saveState())),this._register(this.onDidChangeInstances(()=>this._saveState())),this._register(this.onAnyInstanceProcessIdReady(()=>this._saveState())),this._register(this.onAnyInstanceTitleChange(e=>this._updateTitle(e))),this._register(this.onAnyInstanceIconChange(e=>this._updateIcon(e.instance,e.userInitiated)))}_handleInstanceContextKeys(){const e=y.isOpen.bindTo(this._contextKeyService),t=()=>{e.set(this.instances.length>0),this._terminalCountContextKey.set(this.instances.length)};this._register(this.onDidChangeInstances(()=>t()))}async getActiveOrCreateInstance(e){const t=this.activeInstance;if(!t)return this.createTerminal();if(!e?.acceptsInput||t.xterm?.isStdinDisabled!==!0)return t;const i=await this.createTerminal();return this.setActiveInstance(i),await this.revealActiveTerminal(),i}async revealTerminal(e,t){e.target===o.Editor?await this._terminalEditorService.revealActiveEditor(t):await this._terminalGroupService.showPanel()}async revealActiveTerminal(e){const t=this.activeInstance;t&&await this.revealTerminal(t,e)}setEditable(e,t){t?this._editable={instance:e,data:t}:this._editable=void 0;const i=this._viewsService.getActiveViewWithId(Se),n=this.isEditable(e);i?.terminalTabbedView?.setEditable(n)}isEditable(e){return!!this._editable&&(this._editable.instance===e||!e)}getEditableData(e){return this._editable&&this._editable.instance===e?this._editable.data:void 0}requestStartExtensionTerminal(e,t,i){return new Promise(n=>{this._onDidRequestStartExtensionTerminal.fire({proxy:e,cols:t,rows:i,callback:n})})}_onBeforeShutdown(e){return k?(this._isShuttingDown=!0,!1):this._onBeforeShutdownAsync(e)}async _onBeforeShutdownAsync(e){if(this.instances.length===0)return!1;try{if(this._shutdownWindowCount=await this._nativeDelegate?.getWindowCount(),this._shouldReviveProcesses(e)&&await Promise.race([this._primaryBackend?.persistTerminalState(),x(2e3)]),!(this._terminalConfigurationService.config.enablePersistentSessions&&e===C.RELOAD)&&(this._terminalConfigurationService.config.confirmOnExit==="always"&&this.instances.length>0||this._terminalConfigurationService.config.confirmOnExit==="hasChildProcesses"&&this.instances.some(r=>r.hasChildProcesses)))return this._onBeforeShutdownConfirmation(e)}catch(t){this._logService.warn("Exception occurred during terminal shutdown",t)}return this._isShuttingDown=!0,!1}setNativeDelegate(e){this._nativeDelegate=e}_shouldReviveProcesses(e){if(!this._terminalConfigurationService.config.enablePersistentSessions)return!1;switch(this._terminalConfigurationService.config.persistentSessionReviveProcess){case"onExit":return e===C.CLOSE&&this._shutdownWindowCount===1&&!V?!0:e===C.LOAD||e===C.QUIT;case"onExitAndWindowClose":return e!==C.RELOAD;default:return!1}}async _onBeforeShutdownConfirmation(e){const t=await this._showTerminalCloseConfirmation();return t||(this._isShuttingDown=!0),t}_onWillShutdown(e){const t=this._terminalConfigurationService.config.enablePersistentSessions&&e.reason===C.RELOAD;for(const i of[...this._terminalGroupService.instances,...this._backgroundedTerminalInstances])t&&i.shouldPersist?i.detachProcessAndDispose(b.Shutdown):i.dispose(b.Shutdown);!t&&!this._shouldReviveProcesses(e.reason)&&this._primaryBackend?.setTerminalLayoutInfo(void 0)}_saveState(){if(this._isShuttingDown||!this._terminalConfigurationService.config.enablePersistentSessions)return;const t={tabs:this._terminalGroupService.groups.map(i=>i.getLayoutInfo(i===this._terminalGroupService.activeGroup))};this._primaryBackend?.setTerminalLayoutInfo(t)}_updateTitle(e){!this._terminalConfigurationService.config.enablePersistentSessions||!e||!e.persistentProcessId||!e.title||e.isDisposed||(e.staticTitle?this._primaryBackend?.updateTitle(e.persistentProcessId,e.staticTitle,ee.Api):this._primaryBackend?.updateTitle(e.persistentProcessId,e.title,e.titleSource))}_updateIcon(e,t){!this._terminalConfigurationService.config.enablePersistentSessions||!e||!e.persistentProcessId||!e.icon||e.isDisposed||this._primaryBackend?.updateIcon(e.persistentProcessId,t,e.icon,e.color)}refreshActiveGroup(){this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup)}getInstanceFromId(e){let t=-1;if(this._backgroundedTerminalInstances.forEach((i,n)=>{i.instanceId===e&&(t=n)}),t!==-1)return this._backgroundedTerminalInstances[t];try{return this.instances[this._getIndexFromId(e)]}catch{return}}getInstanceFromIndex(e){return this.instances[e]}getInstanceFromResource(e){return _e(this.instances,e)}isAttachedToTerminal(e){return this.instances.some(t=>t.processId===e.pid)}moveToEditor(e,t){if(e.target===o.Editor)return;const i=this._terminalGroupService.getGroupForInstance(e);i&&(i.removeInstance(e),this._terminalEditorService.openEditor(e,t?{viewColumn:t}:void 0))}moveIntoNewEditor(e){this.moveToEditor(e,we)}async moveToTerminalView(e,t,i){if(w.isUri(e)&&(e=this.getInstanceFromResource(e)),!e)return;if(this._terminalEditorService.detachInstance(e),e.target!==o.Editor){await this._terminalGroupService.showPanel(!0);return}e.target=o.Panel;let n;if(t&&(n=this._terminalGroupService.getGroupForInstance(t)),n||(n=this._terminalGroupService.createGroup()),n.addInstance(e),this.setActiveInstance(e),await this._terminalGroupService.showPanel(!0),t&&i){const r=n.terminalInstances.indexOf(t)+(i==="after"?1:0);n.moveInstance(e,r,i)}this._onDidChangeInstances.fire(),this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup)}_initInstanceListeners(e){const t=[e.onDimensionsChanged(()=>{this._onDidChangeInstanceDimensions.fire(e),this._terminalConfigurationService.config.enablePersistentSessions&&this.isProcessSupportRegistered&&this._saveState()}),e.onDidFocus(this._onDidChangeActiveInstance.fire,this._onDidChangeActiveInstance),e.onRequestAddInstanceToGroup(async i=>await this._addInstanceToGroup(e,i))];e.onDisposed(()=>R(t))}async _addInstanceToGroup(e,t){const i=Te(t.uri);if(i.instanceId===void 0)return;let n=this.getInstanceFromResource(t.uri);if(!n){const r=await this._primaryBackend?.requestDetachInstance(i.workspaceId,i.instanceId);if(r){n=await this.createTerminal({config:{attachPersistentProcess:r},resource:t.uri}),this._terminalGroupService.moveInstance(n,e,t.side);return}}if(n=this._terminalGroupService.getInstanceFromResource(t.uri),n){this._terminalGroupService.moveInstance(n,e,t.side);return}if(n=this._terminalEditorService.getInstanceFromResource(t.uri),n){this.moveToTerminalView(n,e,t.side);return}}registerProcessSupport(e){e&&(this._processSupportContextKey.set(e),this._onDidRegisterProcessSupport.fire())}_getIndexFromId(e){let t=-1;if(this.instances.forEach((i,n)=>{i.instanceId===e&&(t=n)}),t===-1)throw new Error(`Terminal with ID ${e} does not exist (has it already been disposed?)`);return t}async _showTerminalCloseConfirmation(e){let t;this.instances.length===1||e?t=P.localize("terminalService.terminalCloseConfirmationSingular","Do you want to terminate the active terminal session?"):t=P.localize("terminalService.terminalCloseConfirmationPlural","Do you want to terminate the {0} active terminal sessions?",this.instances.length);const{confirmed:i}=await this._dialogService.confirm({type:"warning",message:t,primaryButton:P.localize({key:"terminate",comment:["&& denotes a mnemonic"]},"&&Terminate")});return!i}getDefaultInstanceHost(){return this.defaultLocation===o.Editor?this._terminalEditorService:this._terminalGroupService}async getInstanceHost(e){if(e){if(e===o.Editor)return this._terminalEditorService;if(typeof e=="object"){if("viewColumn"in e)return this._terminalEditorService;if("parentTerminal"in e)return(await e.parentTerminal).target===o.Editor?this._terminalEditorService:this._terminalGroupService}else return this._terminalGroupService}return this}async createTerminal(e){if(this._terminalProfileService.availableProfiles.length===0){const m=e?.config&&"customPtyImplementation"in e.config,f=this._remoteAgentService.getConnection()&&w.isUri(e?.cwd)&&e?.cwd.scheme===L.vscodeFileResource;!m&&!f&&(this._connectionState===D.Connecting&&c("code/terminal/willGetProfiles"),await this._terminalProfileService.profilesReady,this._connectionState===D.Connecting&&c("code/terminal/didGetProfiles"))}const t=e?.config||this._terminalProfileService.getDefaultProfile(),i=t&&"extensionIdentifier"in t?{}:this._terminalInstanceService.convertProfileToShellLaunchConfig(t||{}),n=e?.skipContributedProfileCheck?void 0:await this._getContributedProfile(i,e),r=typeof e?.location=="object"&&"splitActiveTerminal"in e.location?e.location.splitActiveTerminal:typeof e?.location=="object"?"parentTerminal"in e.location:!1;if(await this._resolveCwd(i,r,e),n){const m=await this.resolveLocation(e?.location);let f;r?f=m===o.Editor?{viewColumn:De}:{splitActiveTerminal:!0}:f=typeof e?.location=="object"&&"viewColumn"in e.location?e.location:m,await this.createContributedTerminalProfile(n.extensionIdentifier,n.id,{icon:n.icon,color:n.color,location:f,cwd:i.cwd});const T=m===o.Editor?this._terminalEditorService:this._terminalGroupService,_=T.instances[T.instances.length-1];return await _?.focusWhenReady(),this._terminalHasBeenCreated.set(!0),_}if(!i.customPtyImplementation&&!this.isProcessSupportRegistered)throw new Error("Could not create terminal when process support is not registered");if(i.hideFromUser){const m=this._terminalInstanceService.createInstance(i,o.Panel);return this._backgroundedTerminalInstances.push(m),this._backgroundedTerminalDisposables.set(m.instanceId,[m.onDisposed(this._onDidDisposeInstance.fire,this._onDidDisposeInstance)]),this._terminalHasBeenCreated.set(!0),m}this._evaluateLocalCwd(i);const a=await this.resolveLocation(e?.location)||this.defaultLocation,l=await this._getSplitParent(e?.location);return this._terminalHasBeenCreated.set(!0),l?this._splitTerminal(i,a,l):this._createTerminal(i,a,e)}async _getContributedProfile(e,t){return t?.config&&"extensionIdentifier"in t.config?t.config:this._terminalProfileService.getContributedDefaultProfile(e)}async createDetachedTerminal(e){const t=await Le.getXtermConstructor(this._keybindingService,this._contextKeyService),i=this._instantiationService.createInstance(Re,t,e.cols,e.rows,e.colorProvider,e.capabilities||new Oe,"",!1);e.readonly&&i.raw.attachCustomKeyEventHandler(()=>!1);const n=new Ke(i,e,this._instantiationService);this._detachedXterms.add(n);const r=i.onDidDispose(()=>{this._detachedXterms.delete(n),r.dispose()});return n}async _resolveCwd(e,t,i){if(!e.cwd){if(i?.cwd)e.cwd=i.cwd;else if(t&&i?.location){let r=this.activeInstance;if(typeof i.location=="object"&&"parentTerminal"in i.location&&(r=await i.location.parentTerminal),!r)throw new Error("Cannot split without an active instance");e.cwd=await Ie(r,this._workspaceContextService.getWorkspace().folders,this._commandService,this._terminalConfigService)}}}_splitTerminal(e,t,i){let n;if(typeof e.cwd!="object"&&typeof i.shellLaunchConfig.cwd=="object"&&(e.cwd=w.from({scheme:i.shellLaunchConfig.cwd.scheme,authority:i.shellLaunchConfig.cwd.authority,path:e.cwd||i.shellLaunchConfig.cwd.path})),t===o.Editor||i.target===o.Editor)n=this._terminalEditorService.splitInstance(i,e);else{const r=this._terminalGroupService.getGroupForInstance(i);if(!r)throw new Error(`Cannot split a terminal without a group (instanceId: ${i.instanceId}, title: ${i.title})`);e.parentTerminalId=i.instanceId,n=r.split(e)}return this._addToReconnected(n),n}_addToReconnected(e){if(!e.reconnectionProperties?.ownerId)return;const t=this._reconnectedTerminals.get(e.reconnectionProperties.ownerId);t?t.push(e):this._reconnectedTerminals.set(e.reconnectionProperties.ownerId,[e])}_createTerminal(e,t,i){let n;const r=this._getEditorOptions(i?.location);return t===o.Editor?(n=this._terminalInstanceService.createInstance(e,o.Editor),this._terminalEditorService.openEditor(n,r)):n=this._terminalGroupService.createGroup(e).terminalInstances[0],this._addToReconnected(n),n}async resolveLocation(e){if(e&&typeof e=="object")if("parentTerminal"in e){const t=await e.parentTerminal;return t.target?t.target:o.Panel}else{if("viewColumn"in e)return o.Editor;if("splitActiveTerminal"in e)return this._activeInstance?.target?this._activeInstance?.target:o.Panel}return e}async _getSplitParent(e){if(e&&typeof e=="object"&&"parentTerminal"in e)return e.parentTerminal;if(e&&typeof e=="object"&&"splitActiveTerminal"in e)return this.activeInstance}_getEditorOptions(e){if(e&&typeof e=="object"&&"viewColumn"in e)return e.viewColumn=ye(this._editorGroupsService,this._configurationService,e.viewColumn),e}_evaluateLocalCwd(e){typeof e.cwd!="string"&&e.cwd?.scheme===L.file&&(ce.getValue(this._contextKeyService)?(e.initialText=O(P.localize("localTerminalVirtualWorkspace","This shell is open to a {0}local{1} folder, NOT to the virtual folder","\x1B[3m","\x1B[23m"),{excludeLeadingNewLine:!0,loudFormatting:!0}),e.type="Local"):this._remoteAgentService.getConnection()&&(e.initialText=O(P.localize("localTerminalRemote","This shell is running on your {0}local{1} machine, NOT on the connected remote machine","\x1B[3m","\x1B[23m"),{excludeLeadingNewLine:!0,loudFormatting:!0}),e.type="Local"))}_showBackgroundTerminal(e){this._backgroundedTerminalInstances.splice(this._backgroundedTerminalInstances.indexOf(e),1);const t=this._backgroundedTerminalDisposables.get(e.instanceId);t&&R(t),this._backgroundedTerminalDisposables.delete(e.instanceId),e.shellLaunchConfig.hideFromUser=!1,this._terminalGroupService.createGroup(e),this.instances.length===1&&this._terminalGroupService.setActiveInstanceByIndex(0),this._onDidChangeInstances.fire()}async setContainers(e,t){this._terminalConfigurationService.setPanelContainer(e),this._terminalGroupService.setContainer(t)}getEditingTerminal(){return this._editingTerminal}setEditingTerminal(e){this._editingTerminal=e}createOnInstanceEvent(e){return new U(this.instances,this.onDidCreateInstance,this.onDidDisposeInstance,e)}createOnInstanceCapabilityEvent(e,t){return Fe(this.instances,this.onDidCreateInstance,this.onDidDisposeInstance,e,t)}};u([p],h.prototype,"onAnyInstanceData",1),u([p],h.prototype,"onAnyInstanceDataInput",1),u([p],h.prototype,"onAnyInstanceIconChange",1),u([p],h.prototype,"onAnyInstanceMaximumDimensionsChange",1),u([p],h.prototype,"onAnyInstancePrimaryStatusChange",1),u([p],h.prototype,"onAnyInstanceProcessIdReady",1),u([p],h.prototype,"onAnyInstanceSelectionChange",1),u([p],h.prototype,"onAnyInstanceTitleChange",1),u([A(500)],h.prototype,"_saveState",1),u([A(500)],h.prototype,"_updateTitle",1),u([A(500)],h.prototype,"_updateIcon",1),h=u([s(0,X),s(1,Ge),s(2,J),s(3,z),s(4,Y),s(5,xe),s(6,le),s(7,j),s(8,B),s(9,Ee),s(10,B),s(11,me),s(12,de),s(13,he),s(14,Ce),s(15,F),s(16,be),s(17,Q),s(18,oe),s(19,$),s(20,ke),s(21,Be)],h);let E=class extends ae{constructor(e,t,i,n,r){super(i);this._terminalService=t;this._themeService=i;this._terminalProfileService=n;this._editorService=r;this._registerListeners(),this._styleElement=G.createStyleSheet(e),this._register(N(()=>this._styleElement.remove())),this.updateStyles()}_styleElement;_registerListeners(){this._register(this._terminalService.onAnyInstanceIconChange(()=>this.updateStyles())),this._register(this._terminalService.onDidCreateInstance(()=>this.updateStyles())),this._register(this._editorService.onDidActiveEditorChange(()=>{this._editorService.activeEditor instanceof K&&this.updateStyles()})),this._register(this._editorService.onDidCloseEditor(()=>{this._editorService.activeEditor instanceof K&&this.updateStyles()})),this._register(this._terminalProfileService.onDidChangeAvailableProfiles(()=>this.updateStyles()))}updateStyles(){super.updateStyles();const e=this._themeService.getColorTheme();let t="";const i=this._themeService.getProductIconTheme();for(const r of this._terminalService.instances){const a=r.icon;if(!a)continue;let l;a instanceof w?l=a:a instanceof Object&&"light"in a&&"dark"in a&&(l=e.type===ne.LIGHT?a.light:a.dark);const m=pe(r,e.type);if(l instanceof w&&m&&m.length>1&&(t+=`.monaco-workbench .terminal-tab.${m[0]}::before{content: ''; background-image: ${G.asCSSUrl(l)};}`),se.isThemeIcon(a)){const T=ie().getIcon(a.id);if(T){const _=i.getIcon(T);_&&(t+=`.monaco-workbench .terminal-tab.codicon-${a.id}::before{content: '${_.fontCharacter}' !important; font-family: ${G.asCSSPropertyValue(_.font?.id??"codicon")} !important;}`)}}}const n=e.getColor(te);n&&(t+=`.monaco-workbench .show-file-icons .file-icon.terminal-tab::before { color: ${n}; }`),t+=ve(e,!0),this._styleElement.textContent=t}};E=u([s(1,ue),s(2,re),s(3,F),s(4,Pe)],E);export{h as TerminalService};
