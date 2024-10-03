import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { localize } from '../../../../nls.js';
export class BaseTerminalBackend extends Disposable {
    get isResponsive() { return !this._isPtyHostUnresponsive; }
    constructor(_ptyHostController, _logService, historyService, configurationResolverService, statusBarService, _workspaceContextService) {
        super();
        this._ptyHostController = _ptyHostController;
        this._logService = _logService;
        this._workspaceContextService = _workspaceContextService;
        this._isPtyHostUnresponsive = false;
        this._onPtyHostConnected = this._register(new Emitter());
        this.onPtyHostConnected = this._onPtyHostConnected.event;
        this._onPtyHostRestart = this._register(new Emitter());
        this.onPtyHostRestart = this._onPtyHostRestart.event;
        this._onPtyHostUnresponsive = this._register(new Emitter());
        this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
        this._onPtyHostResponsive = this._register(new Emitter());
        this.onPtyHostResponsive = this._onPtyHostResponsive.event;
        let unresponsiveStatusBarEntry;
        let statusBarAccessor;
        let hasStarted = false;
        this._register(this._ptyHostController.onPtyHostExit(() => {
            this._logService.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
        }));
        this._register(this.onPtyHostConnected(() => hasStarted = true));
        this._register(this._ptyHostController.onPtyHostStart(() => {
            this._logService.debug(`The terminal's pty host process is starting`);
            if (hasStarted) {
                this._logService.trace('IPtyHostController#onPtyHostRestart');
                this._onPtyHostRestart.fire();
            }
            statusBarAccessor?.dispose();
            this._isPtyHostUnresponsive = false;
        }));
        this._register(this._ptyHostController.onPtyHostUnresponsive(() => {
            statusBarAccessor?.dispose();
            if (!unresponsiveStatusBarEntry) {
                unresponsiveStatusBarEntry = {
                    name: localize('ptyHostStatus', 'Pty Host Status'),
                    text: `$(debug-disconnect) ${localize('ptyHostStatus.short', 'Pty Host')}`,
                    tooltip: localize('nonResponsivePtyHost', "The connection to the terminal's pty host process is unresponsive, terminals may stop working. Click to manually restart the pty host."),
                    ariaLabel: localize('ptyHostStatus.ariaLabel', 'Pty Host is unresponsive'),
                    command: "workbench.action.terminal.restartPtyHost",
                    kind: 'warning'
                };
            }
            statusBarAccessor = statusBarService.addEntry(unresponsiveStatusBarEntry, 'ptyHostStatus', 0);
            this._isPtyHostUnresponsive = true;
            this._onPtyHostUnresponsive.fire();
        }));
        this._register(this._ptyHostController.onPtyHostResponsive(() => {
            if (!this._isPtyHostUnresponsive) {
                return;
            }
            this._logService.info('The pty host became responsive again');
            statusBarAccessor?.dispose();
            this._isPtyHostUnresponsive = false;
            this._onPtyHostResponsive.fire();
        }));
        this._register(this._ptyHostController.onPtyHostRequestResolveVariables(async (e) => {
            if (e.workspaceId !== this._workspaceContextService.getWorkspace().id) {
                return;
            }
            const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(Schemas.file);
            const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            const resolveCalls = e.originalText.map(t => {
                return configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, t);
            });
            const result = await Promise.all(resolveCalls);
            this._ptyHostController.acceptPtyHostResolvedVariables(e.requestId, result);
        }));
    }
    restartPtyHost() {
        this._ptyHostController.restartPtyHost();
    }
    _deserializeTerminalState(serializedState) {
        if (serializedState === undefined) {
            return undefined;
        }
        const parsedUnknown = JSON.parse(serializedState);
        if (!('version' in parsedUnknown) || !('state' in parsedUnknown) || !Array.isArray(parsedUnknown.state)) {
            this._logService.warn('Could not revive serialized processes, wrong format', parsedUnknown);
            return undefined;
        }
        const parsedCrossVersion = parsedUnknown;
        if (parsedCrossVersion.version !== 1) {
            this._logService.warn(`Could not revive serialized processes, wrong version "${parsedCrossVersion.version}"`, parsedCrossVersion);
            return undefined;
        }
        return parsedCrossVersion.state;
    }
    _getWorkspaceId() {
        return this._workspaceContextService.getWorkspace().id;
    }
}
