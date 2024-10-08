/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
            case "$restartPtyHost" /* RemoteTerminalChannelRequest.RestartPtyHost */: return this._ptyHostService.restartPtyHost.apply(this._ptyHostService, args);
            case "$createProcess" /* RemoteTerminalChannelRequest.CreateProcess */: {
                const uriTransformer = createURITransformer(ctx.remoteAuthority);
                return this._createProcess(uriTransformer, args);
            }
            case "$attachToProcess" /* RemoteTerminalChannelRequest.AttachToProcess */: return this._ptyHostService.attachToProcess.apply(this._ptyHostService, args);
            case "$detachFromProcess" /* RemoteTerminalChannelRequest.DetachFromProcess */: return this._ptyHostService.detachFromProcess.apply(this._ptyHostService, args);
            case "$listProcesses" /* RemoteTerminalChannelRequest.ListProcesses */: return this._ptyHostService.listProcesses.apply(this._ptyHostService, args);
            case "$getLatency" /* RemoteTerminalChannelRequest.GetLatency */: return this._ptyHostService.getLatency.apply(this._ptyHostService, args);
            case "$getPerformanceMarks" /* RemoteTerminalChannelRequest.GetPerformanceMarks */: return this._ptyHostService.getPerformanceMarks.apply(this._ptyHostService, args);
            case "$orphanQuestionReply" /* RemoteTerminalChannelRequest.OrphanQuestionReply */: return this._ptyHostService.orphanQuestionReply.apply(this._ptyHostService, args);
            case "$acceptPtyHostResolvedVariables" /* RemoteTerminalChannelRequest.AcceptPtyHostResolvedVariables */: return this._ptyHostService.acceptPtyHostResolvedVariables.apply(this._ptyHostService, args);
            case "$start" /* RemoteTerminalChannelRequest.Start */: return this._ptyHostService.start.apply(this._ptyHostService, args);
            case "$input" /* RemoteTerminalChannelRequest.Input */: return this._ptyHostService.input.apply(this._ptyHostService, args);
            case "$acknowledgeDataEvent" /* RemoteTerminalChannelRequest.AcknowledgeDataEvent */: return this._ptyHostService.acknowledgeDataEvent.apply(this._ptyHostService, args);
            case "$shutdown" /* RemoteTerminalChannelRequest.Shutdown */: return this._ptyHostService.shutdown.apply(this._ptyHostService, args);
            case "$resize" /* RemoteTerminalChannelRequest.Resize */: return this._ptyHostService.resize.apply(this._ptyHostService, args);
            case "$clearBuffer" /* RemoteTerminalChannelRequest.ClearBuffer */: return this._ptyHostService.clearBuffer.apply(this._ptyHostService, args);
            case "$getInitialCwd" /* RemoteTerminalChannelRequest.GetInitialCwd */: return this._ptyHostService.getInitialCwd.apply(this._ptyHostService, args);
            case "$getCwd" /* RemoteTerminalChannelRequest.GetCwd */: return this._ptyHostService.getCwd.apply(this._ptyHostService, args);
            case "$processBinary" /* RemoteTerminalChannelRequest.ProcessBinary */: return this._ptyHostService.processBinary.apply(this._ptyHostService, args);
            case "$sendCommandResult" /* RemoteTerminalChannelRequest.SendCommandResult */: return this._sendCommandResult(args[0], args[1], args[2]);
            case "$installAutoReply" /* RemoteTerminalChannelRequest.InstallAutoReply */: return this._ptyHostService.installAutoReply.apply(this._ptyHostService, args);
            case "$uninstallAllAutoReplies" /* RemoteTerminalChannelRequest.UninstallAllAutoReplies */: return this._ptyHostService.uninstallAllAutoReplies.apply(this._ptyHostService, args);
            case "$getDefaultSystemShell" /* RemoteTerminalChannelRequest.GetDefaultSystemShell */: return this._getDefaultSystemShell.apply(this, args);
            case "$getProfiles" /* RemoteTerminalChannelRequest.GetProfiles */: return this._getProfiles.apply(this, args);
            case "$getEnvironment" /* RemoteTerminalChannelRequest.GetEnvironment */: return this._getEnvironment();
            case "$getWslPath" /* RemoteTerminalChannelRequest.GetWslPath */: return this._getWslPath(args[0], args[1]);
            case "$getTerminalLayoutInfo" /* RemoteTerminalChannelRequest.GetTerminalLayoutInfo */: return this._ptyHostService.getTerminalLayoutInfo(args);
            case "$setTerminalLayoutInfo" /* RemoteTerminalChannelRequest.SetTerminalLayoutInfo */: return this._ptyHostService.setTerminalLayoutInfo(args);
            case "$serializeTerminalState" /* RemoteTerminalChannelRequest.SerializeTerminalState */: return this._ptyHostService.serializeTerminalState.apply(this._ptyHostService, args);
            case "$reviveTerminalProcesses" /* RemoteTerminalChannelRequest.ReviveTerminalProcesses */: return this._ptyHostService.reviveTerminalProcesses.apply(this._ptyHostService, args);
            case "$getRevivedPtyNewId" /* RemoteTerminalChannelRequest.GetRevivedPtyNewId */: return this._ptyHostService.getRevivedPtyNewId.apply(this._ptyHostService, args);
            case "$setUnicodeVersion" /* RemoteTerminalChannelRequest.SetUnicodeVersion */: return this._ptyHostService.setUnicodeVersion.apply(this._ptyHostService, args);
            case "$reduceConnectionGraceTime" /* RemoteTerminalChannelRequest.ReduceConnectionGraceTime */: return this._reduceConnectionGraceTime();
            case "$updateIcon" /* RemoteTerminalChannelRequest.UpdateIcon */: return this._ptyHostService.updateIcon.apply(this._ptyHostService, args);
            case "$updateTitle" /* RemoteTerminalChannelRequest.UpdateTitle */: return this._ptyHostService.updateTitle.apply(this._ptyHostService, args);
            case "$updateProperty" /* RemoteTerminalChannelRequest.UpdateProperty */: return this._ptyHostService.updateProperty.apply(this._ptyHostService, args);
            case "$refreshProperty" /* RemoteTerminalChannelRequest.RefreshProperty */: return this._ptyHostService.refreshProperty.apply(this._ptyHostService, args);
            case "$requestDetachInstance" /* RemoteTerminalChannelRequest.RequestDetachInstance */: return this._ptyHostService.requestDetachInstance(args[0], args[1]);
            case "$acceptDetachedInstance" /* RemoteTerminalChannelRequest.AcceptDetachedInstance */: return this._ptyHostService.acceptDetachInstanceReply(args[0], args[1]);
            case "$freePortKillProcess" /* RemoteTerminalChannelRequest.FreePortKillProcess */: return this._ptyHostService.freePortKillProcess.apply(this._ptyHostService, args);
            case "$acceptDetachInstanceReply" /* RemoteTerminalChannelRequest.AcceptDetachInstanceReply */: return this._ptyHostService.acceptDetachInstanceReply.apply(this._ptyHostService, args);
        }
        // @ts-expect-error Assert command is the `never` type to ensure all messages are handled
        throw new Error(`IPC Command ${command} not found`);
    }
    listen(_, event, arg) {
        switch (event) {
            case "$onPtyHostExitEvent" /* RemoteTerminalChannelEvent.OnPtyHostExitEvent */: return this._ptyHostService.onPtyHostExit || Event.None;
            case "$onPtyHostStartEvent" /* RemoteTerminalChannelEvent.OnPtyHostStartEvent */: return this._ptyHostService.onPtyHostStart || Event.None;
            case "$onPtyHostUnresponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostUnresponsiveEvent */: return this._ptyHostService.onPtyHostUnresponsive || Event.None;
            case "$onPtyHostResponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostResponsiveEvent */: return this._ptyHostService.onPtyHostResponsive || Event.None;
            case "$onPtyHostRequestResolveVariablesEvent" /* RemoteTerminalChannelEvent.OnPtyHostRequestResolveVariablesEvent */: return this._ptyHostService.onPtyHostRequestResolveVariables || Event.None;
            case "$onProcessDataEvent" /* RemoteTerminalChannelEvent.OnProcessDataEvent */: return this._ptyHostService.onProcessData;
            case "$onProcessReadyEvent" /* RemoteTerminalChannelEvent.OnProcessReadyEvent */: return this._ptyHostService.onProcessReady;
            case "$onProcessExitEvent" /* RemoteTerminalChannelEvent.OnProcessExitEvent */: return this._ptyHostService.onProcessExit;
            case "$onProcessReplayEvent" /* RemoteTerminalChannelEvent.OnProcessReplayEvent */: return this._ptyHostService.onProcessReplay;
            case "$onProcessOrphanQuestion" /* RemoteTerminalChannelEvent.OnProcessOrphanQuestion */: return this._ptyHostService.onProcessOrphanQuestion;
            case "$onExecuteCommand" /* RemoteTerminalChannelEvent.OnExecuteCommand */: return this.onExecuteCommand;
            case "$onDidRequestDetach" /* RemoteTerminalChannelEvent.OnDidRequestDetach */: return this._ptyHostService.onDidRequestDetach || Event.None;
            case "$onDidChangeProperty" /* RemoteTerminalChannelEvent.OnDidChangeProperty */: return this._ptyHostService.onDidChangeProperty;
        }
        // @ts-expect-error Assert event is the `never` type to ensure all messages are handled
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
        // Get the initial cwd
        const initialCwd = await terminalEnvironment.getCwd(shellLaunchConfig, os.homedir(), variableResolver, activeWorkspaceFolder?.uri, args.configuration['terminal.integrated.cwd'], this._logService);
        shellLaunchConfig.cwd = initialCwd;
        const envPlatformKey = platform.isWindows ? 'terminal.integrated.env.windows' : (platform.isMacintosh ? 'terminal.integrated.env.osx' : 'terminal.integrated.env.linux');
        const envFromConfig = args.configuration[envPlatformKey];
        const env = await terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfig, variableResolver, this._productService.version, args.configuration['terminal.integrated.detectLocale'], baseEnv);
        // Apply extension environment variable collections to the environment
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
        // Fork the process and listen for messages
        this._logService.debug(`Terminal process launching on remote agent`, { shellLaunchConfig, initialCwd, cols: args.cols, rows: args.rows, env });
        // Setup the CLI server to support forwarding commands run from the CLI
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
                // this is UriComponents
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
                // this is UriComponents
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
