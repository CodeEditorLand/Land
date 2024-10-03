import * as os from 'os';
import { Emitter, Event } from '../../base/common/event.js';
import { cloneAndChange } from '../../base/common/objects.js';
import { Disposable } from '../../base/common/lifecycle.js';
import * as path from '../../base/common/path.js';
import * as platform from '../../base/common/platform.js';
import { URI } from '../../base/common/uri.js';
import { createRandomIPCHandle } from '../../base/parts/ipc/node/ipc.net.js';
import { createURITransformer } from '../../workbench/api/node/uriTransformer.js';
import { CLIServerBase } from '../../workbench/api/node/extHostCLIServer.js';
import { MergedEnvironmentVariableCollection } from '../../platform/terminal/common/environmentVariableCollection.js';
import { deserializeEnvironmentDescriptionMap, deserializeEnvironmentVariableCollection } from '../../platform/terminal/common/environmentVariableShared.js';
import * as terminalEnvironment from '../../workbench/contrib/terminal/common/terminalEnvironment.js';
import { AbstractVariableResolverService } from '../../workbench/services/configurationResolver/common/variableResolver.js';
import { buildUserEnvironment } from './extensionHostConnection.js';
import { promiseWithResolvers } from '../../base/common/async.js';
import { shouldUseEnvironmentVariableCollection } from '../../platform/terminal/common/terminalEnvironment.js';
class CustomVariableResolver extends AbstractVariableResolverService {
    constructor(env, workspaceFolders, activeFileResource, resolvedVariables, extensionService) {
        super({
            getFolderUri: (folderName) => {
                const found = workspaceFolders.filter(f => f.name === folderName);
                if (found && found.length > 0) {
                    return found[0].uri;
                }
                return undefined;
            },
            getWorkspaceFolderCount: () => {
                return workspaceFolders.length;
            },
            getConfigurationValue: (folderUri, section) => {
                return resolvedVariables[`config:${section}`];
            },
            getExecPath: () => {
                return env['VSCODE_EXEC_PATH'];
            },
            getAppRoot: () => {
                return env['VSCODE_CWD'];
            },
            getFilePath: () => {
                if (activeFileResource) {
                    return path.normalize(activeFileResource.fsPath);
                }
                return undefined;
            },
            getSelectedText: () => {
                return resolvedVariables['selectedText'];
            },
            getLineNumber: () => {
                return resolvedVariables['lineNumber'];
            },
            getExtension: async (id) => {
                const installed = await extensionService.getInstalled();
                const found = installed.find(e => e.identifier.id === id);
                return found && { extensionLocation: found.location };
            },
        }, undefined, Promise.resolve(os.homedir()), Promise.resolve(env));
    }
}
export class RemoteTerminalChannel extends Disposable {
    constructor(_environmentService, _logService, _ptyHostService, _productService, _extensionManagementService, _configurationService) {
        super();
        this._environmentService = _environmentService;
        this._logService = _logService;
        this._ptyHostService = _ptyHostService;
        this._productService = _productService;
        this._extensionManagementService = _extensionManagementService;
        this._configurationService = _configurationService;
        this._lastReqId = 0;
        this._pendingCommands = new Map();
        this._onExecuteCommand = this._register(new Emitter());
        this.onExecuteCommand = this._onExecuteCommand.event;
    }
    async call(ctx, command, args) {
        switch (command) {
            case "$restartPtyHost": return this._ptyHostService.restartPtyHost.apply(this._ptyHostService, args);
            case "$createProcess": {
                const uriTransformer = createURITransformer(ctx.remoteAuthority);
                return this._createProcess(uriTransformer, args);
            }
            case "$attachToProcess": return this._ptyHostService.attachToProcess.apply(this._ptyHostService, args);
            case "$detachFromProcess": return this._ptyHostService.detachFromProcess.apply(this._ptyHostService, args);
            case "$listProcesses": return this._ptyHostService.listProcesses.apply(this._ptyHostService, args);
            case "$getLatency": return this._ptyHostService.getLatency.apply(this._ptyHostService, args);
            case "$getPerformanceMarks": return this._ptyHostService.getPerformanceMarks.apply(this._ptyHostService, args);
            case "$orphanQuestionReply": return this._ptyHostService.orphanQuestionReply.apply(this._ptyHostService, args);
            case "$acceptPtyHostResolvedVariables": return this._ptyHostService.acceptPtyHostResolvedVariables.apply(this._ptyHostService, args);
            case "$start": return this._ptyHostService.start.apply(this._ptyHostService, args);
            case "$input": return this._ptyHostService.input.apply(this._ptyHostService, args);
            case "$acknowledgeDataEvent": return this._ptyHostService.acknowledgeDataEvent.apply(this._ptyHostService, args);
            case "$shutdown": return this._ptyHostService.shutdown.apply(this._ptyHostService, args);
            case "$resize": return this._ptyHostService.resize.apply(this._ptyHostService, args);
            case "$clearBuffer": return this._ptyHostService.clearBuffer.apply(this._ptyHostService, args);
            case "$getInitialCwd": return this._ptyHostService.getInitialCwd.apply(this._ptyHostService, args);
            case "$getCwd": return this._ptyHostService.getCwd.apply(this._ptyHostService, args);
            case "$processBinary": return this._ptyHostService.processBinary.apply(this._ptyHostService, args);
            case "$sendCommandResult": return this._sendCommandResult(args[0], args[1], args[2]);
            case "$installAutoReply": return this._ptyHostService.installAutoReply.apply(this._ptyHostService, args);
            case "$uninstallAllAutoReplies": return this._ptyHostService.uninstallAllAutoReplies.apply(this._ptyHostService, args);
            case "$getDefaultSystemShell": return this._getDefaultSystemShell.apply(this, args);
            case "$getProfiles": return this._getProfiles.apply(this, args);
            case "$getEnvironment": return this._getEnvironment();
            case "$getWslPath": return this._getWslPath(args[0], args[1]);
            case "$getTerminalLayoutInfo": return this._ptyHostService.getTerminalLayoutInfo(args);
            case "$setTerminalLayoutInfo": return this._ptyHostService.setTerminalLayoutInfo(args);
            case "$serializeTerminalState": return this._ptyHostService.serializeTerminalState.apply(this._ptyHostService, args);
            case "$reviveTerminalProcesses": return this._ptyHostService.reviveTerminalProcesses.apply(this._ptyHostService, args);
            case "$getRevivedPtyNewId": return this._ptyHostService.getRevivedPtyNewId.apply(this._ptyHostService, args);
            case "$setUnicodeVersion": return this._ptyHostService.setUnicodeVersion.apply(this._ptyHostService, args);
            case "$reduceConnectionGraceTime": return this._reduceConnectionGraceTime();
            case "$updateIcon": return this._ptyHostService.updateIcon.apply(this._ptyHostService, args);
            case "$updateTitle": return this._ptyHostService.updateTitle.apply(this._ptyHostService, args);
            case "$updateProperty": return this._ptyHostService.updateProperty.apply(this._ptyHostService, args);
            case "$refreshProperty": return this._ptyHostService.refreshProperty.apply(this._ptyHostService, args);
            case "$requestDetachInstance": return this._ptyHostService.requestDetachInstance(args[0], args[1]);
            case "$acceptDetachedInstance": return this._ptyHostService.acceptDetachInstanceReply(args[0], args[1]);
            case "$freePortKillProcess": return this._ptyHostService.freePortKillProcess.apply(this._ptyHostService, args);
            case "$acceptDetachInstanceReply": return this._ptyHostService.acceptDetachInstanceReply.apply(this._ptyHostService, args);
        }
        throw new Error(`IPC Command ${command} not found`);
    }
    listen(_, event, arg) {
        switch (event) {
            case "$onPtyHostExitEvent": return this._ptyHostService.onPtyHostExit || Event.None;
            case "$onPtyHostStartEvent": return this._ptyHostService.onPtyHostStart || Event.None;
            case "$onPtyHostUnresponsiveEvent": return this._ptyHostService.onPtyHostUnresponsive || Event.None;
            case "$onPtyHostResponsiveEvent": return this._ptyHostService.onPtyHostResponsive || Event.None;
            case "$onPtyHostRequestResolveVariablesEvent": return this._ptyHostService.onPtyHostRequestResolveVariables || Event.None;
            case "$onProcessDataEvent": return this._ptyHostService.onProcessData;
            case "$onProcessReadyEvent": return this._ptyHostService.onProcessReady;
            case "$onProcessExitEvent": return this._ptyHostService.onProcessExit;
            case "$onProcessReplayEvent": return this._ptyHostService.onProcessReplay;
            case "$onProcessOrphanQuestion": return this._ptyHostService.onProcessOrphanQuestion;
            case "$onExecuteCommand": return this.onExecuteCommand;
            case "$onDidRequestDetach": return this._ptyHostService.onDidRequestDetach || Event.None;
            case "$onDidChangeProperty": return this._ptyHostService.onDidChangeProperty;
        }
        throw new Error(`IPC Command ${event} not found`);
    }
    async _createProcess(uriTransformer, args) {
        const shellLaunchConfig = {
            name: args.shellLaunchConfig.name,
            executable: args.shellLaunchConfig.executable,
            args: args.shellLaunchConfig.args,
            cwd: (typeof args.shellLaunchConfig.cwd === 'string' || typeof args.shellLaunchConfig.cwd === 'undefined'
                ? args.shellLaunchConfig.cwd
                : URI.revive(uriTransformer.transformIncoming(args.shellLaunchConfig.cwd))),
            env: args.shellLaunchConfig.env,
            useShellEnvironment: args.shellLaunchConfig.useShellEnvironment,
            reconnectionProperties: args.shellLaunchConfig.reconnectionProperties,
            type: args.shellLaunchConfig.type,
            isFeatureTerminal: args.shellLaunchConfig.isFeatureTerminal
        };
        const baseEnv = await buildUserEnvironment(args.resolverEnv, !!args.shellLaunchConfig.useShellEnvironment, platform.language, this._environmentService, this._logService, this._configurationService);
        this._logService.trace('baseEnv', baseEnv);
        const reviveWorkspaceFolder = (workspaceData) => {
            return {
                uri: URI.revive(uriTransformer.transformIncoming(workspaceData.uri)),
                name: workspaceData.name,
                index: workspaceData.index,
                toResource: () => {
                    throw new Error('Not implemented');
                }
            };
        };
        const workspaceFolders = args.workspaceFolders.map(reviveWorkspaceFolder);
        const activeWorkspaceFolder = args.activeWorkspaceFolder ? reviveWorkspaceFolder(args.activeWorkspaceFolder) : undefined;
        const activeFileResource = args.activeFileResource ? URI.revive(uriTransformer.transformIncoming(args.activeFileResource)) : undefined;
        const customVariableResolver = new CustomVariableResolver(baseEnv, workspaceFolders, activeFileResource, args.resolvedVariables, this._extensionManagementService);
        const variableResolver = terminalEnvironment.createVariableResolver(activeWorkspaceFolder, process.env, customVariableResolver);
        const initialCwd = await terminalEnvironment.getCwd(shellLaunchConfig, os.homedir(), variableResolver, activeWorkspaceFolder?.uri, args.configuration['terminal.integrated.cwd'], this._logService);
        shellLaunchConfig.cwd = initialCwd;
        const envPlatformKey = platform.isWindows ? 'terminal.integrated.env.windows' : (platform.isMacintosh ? 'terminal.integrated.env.osx' : 'terminal.integrated.env.linux');
        const envFromConfig = args.configuration[envPlatformKey];
        const env = await terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfig, variableResolver, this._productService.version, args.configuration['terminal.integrated.detectLocale'], baseEnv);
        if (shouldUseEnvironmentVariableCollection(shellLaunchConfig)) {
            const entries = [];
            for (const [k, v, d] of args.envVariableCollections) {
                entries.push([k, { map: deserializeEnvironmentVariableCollection(v), descriptionMap: deserializeEnvironmentDescriptionMap(d) }]);
            }
            const envVariableCollections = new Map(entries);
            const mergedCollection = new MergedEnvironmentVariableCollection(envVariableCollections);
            const workspaceFolder = activeWorkspaceFolder ? activeWorkspaceFolder ?? undefined : undefined;
            await mergedCollection.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
        }
        this._logService.debug(`Terminal process launching on remote agent`, { shellLaunchConfig, initialCwd, cols: args.cols, rows: args.rows, env });
        const ipcHandlePath = createRandomIPCHandle();
        env.VSCODE_IPC_HOOK_CLI = ipcHandlePath;
        const persistentProcessId = await this._ptyHostService.createProcess(shellLaunchConfig, initialCwd, args.cols, args.rows, args.unicodeVersion, env, baseEnv, args.options, args.shouldPersistTerminal, args.workspaceId, args.workspaceName);
        const commandsExecuter = {
            executeCommand: (id, ...args) => this._executeCommand(persistentProcessId, id, args, uriTransformer)
        };
        const cliServer = new CLIServerBase(commandsExecuter, this._logService, ipcHandlePath);
        this._ptyHostService.onProcessExit(e => e.id === persistentProcessId && cliServer.dispose());
        return {
            persistentTerminalId: persistentProcessId,
            resolvedShellLaunchConfig: shellLaunchConfig
        };
    }
    _executeCommand(persistentProcessId, commandId, commandArgs, uriTransformer) {
        const { resolve, reject, promise } = promiseWithResolvers();
        const reqId = ++this._lastReqId;
        this._pendingCommands.set(reqId, { resolve, reject, uriTransformer });
        const serializedCommandArgs = cloneAndChange(commandArgs, (obj) => {
            if (obj && obj.$mid === 1) {
                return uriTransformer.transformOutgoing(obj);
            }
            if (obj && obj instanceof URI) {
                return uriTransformer.transformOutgoingURI(obj);
            }
            return undefined;
        });
        this._onExecuteCommand.fire({
            reqId,
            persistentProcessId,
            commandId,
            commandArgs: serializedCommandArgs
        });
        return promise;
    }
    _sendCommandResult(reqId, isError, serializedPayload) {
        const data = this._pendingCommands.get(reqId);
        if (!data) {
            return;
        }
        this._pendingCommands.delete(reqId);
        const payload = cloneAndChange(serializedPayload, (obj) => {
            if (obj && obj.$mid === 1) {
                return data.uriTransformer.transformIncoming(obj);
            }
            return undefined;
        });
        if (isError) {
            data.reject(payload);
        }
        else {
            data.resolve(payload);
        }
    }
    _getDefaultSystemShell(osOverride) {
        return this._ptyHostService.getDefaultSystemShell(osOverride);
    }
    async _getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles) {
        return this._ptyHostService.getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles) || [];
    }
    _getEnvironment() {
        return { ...process.env };
    }
    _getWslPath(original, direction) {
        return this._ptyHostService.getWslPath(original, direction);
    }
    _reduceConnectionGraceTime() {
        return this._ptyHostService.reduceConnectionGraceTime();
    }
}
