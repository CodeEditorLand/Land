/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { asArray } from '../../../../base/common/arrays.js';
import * as Async from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { isUNC } from '../../../../base/common/extpath.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { LinkedMap } from '../../../../base/common/map.js';
import * as Objects from '../../../../base/common/objects.js';
import * as path from '../../../../base/common/path.js';
import * as Platform from '../../../../base/common/platform.js';
import * as resources from '../../../../base/common/resources.js';
import Severity from '../../../../base/common/severity.js';
import * as Types from '../../../../base/common/types.js';
import * as nls from '../../../../nls.js';
import { MarkerSeverity } from '../../../../platform/markers/common/markers.js';
import { Markers } from '../../markers/common/markers.js';
import { ProblemMatcherRegistry /*, ProblemPattern, getResource */ } from '../common/problemMatcher.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Schemas } from '../../../../base/common/network.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { formatMessageForTerminal } from '../../../../platform/terminal/common/terminalStrings.js';
import { TaskTerminalStatus } from './taskTerminalStatus.js';
import { StartStopProblemCollector, WatchingProblemCollector } from '../common/problemCollectors.js';
import { GroupKind } from '../common/taskConfiguration.js';
import { TaskError, Triggers } from '../common/taskSystem.js';
import { CommandString, ContributedTask, CustomTask, InMemoryTask, PanelKind, RevealKind, RevealProblemKind, RuntimeType, ShellQuoting, TaskEvent, TaskSourceKind } from '../common/tasks.js';
import { VSCodeSequence } from '../../terminal/browser/terminalEscapeSequences.js';
import { TerminalProcessExtHostProxy } from '../../terminal/browser/terminalProcessExtHostProxy.js';
import { TERMINAL_VIEW_ID } from '../../terminal/common/terminal.js';
const ReconnectionType = 'Task';
class VariableResolver {
    static { this._regex = /\$\{(.*?)\}/g; }
    constructor(workspaceFolder, taskSystemInfo, values, _service) {
        this.workspaceFolder = workspaceFolder;
        this.taskSystemInfo = taskSystemInfo;
        this.values = values;
        this._service = _service;
    }
    async resolve(value) {
        const replacers = [];
        value.replace(VariableResolver._regex, (match, ...args) => {
            replacers.push(this._replacer(match, args));
            return match;
        });
        const resolvedReplacers = await Promise.all(replacers);
        return value.replace(VariableResolver._regex, () => resolvedReplacers.shift());
    }
    async _replacer(match, args) {
        // Strip out the ${} because the map contains them variables without those characters.
        const result = this.values.get(match.substring(2, match.length - 1));
        if ((result !== undefined) && (result !== null)) {
            return result;
        }
        if (this._service) {
            return this._service.resolveAsync(this.workspaceFolder, match);
        }
        return match;
    }
}
class VerifiedTask {
    constructor(task, resolver, trigger) {
        this.task = task;
        this.resolver = resolver;
        this.trigger = trigger;
    }
    verify() {
        let verified = false;
        if (this.trigger && this.resolvedVariables && this.workspaceFolder && (this.shellLaunchConfig !== undefined)) {
            verified = true;
        }
        return verified;
    }
    getVerifiedTask() {
        if (this.verify()) {
            return { task: this.task, resolver: this.resolver, trigger: this.trigger, resolvedVariables: this.resolvedVariables, systemInfo: this.systemInfo, workspaceFolder: this.workspaceFolder, shellLaunchConfig: this.shellLaunchConfig };
        }
        else {
            throw new Error('VerifiedTask was not checked. verify must be checked before getVerifiedTask.');
        }
    }
}
export class TerminalTaskSystem extends Disposable {
    static { this.TelemetryEventName = 'taskService'; }
    static { this.ProcessVarName = '__process__'; }
    static { this._shellQuotes = {
        'cmd': {
            strong: '"'
        },
        'powershell': {
            escape: {
                escapeChar: '`',
                charsToEscape: ' "\'()'
            },
            strong: '\'',
            weak: '"'
        },
        'bash': {
            escape: {
                escapeChar: '\\',
                charsToEscape: ' "\''
            },
            strong: '\'',
            weak: '"'
        },
        'zsh': {
            escape: {
                escapeChar: '\\',
                charsToEscape: ' "\''
            },
            strong: '\'',
            weak: '"'
        }
    }; }
    static { this._osShellQuotes = {
        'Linux': TerminalTaskSystem._shellQuotes['bash'],
        'Mac': TerminalTaskSystem._shellQuotes['bash'],
        'Windows': TerminalTaskSystem._shellQuotes['powershell']
    }; }
    taskShellIntegrationStartSequence(cwd) {
        return (VSCodeSequence("A" /* VSCodeOscPt.PromptStart */) +
            VSCodeSequence("P" /* VSCodeOscPt.Property */, `${"Task" /* VSCodeOscProperty.Task */}=True`) +
            (cwd
                ? VSCodeSequence("P" /* VSCodeOscPt.Property */, `${"Cwd" /* VSCodeOscProperty.Cwd */}=${typeof cwd === 'string' ? cwd : cwd.fsPath}`)
                : '') +
            VSCodeSequence("B" /* VSCodeOscPt.CommandStart */));
    }
    get taskShellIntegrationOutputSequence() {
        return VSCodeSequence("C" /* VSCodeOscPt.CommandExecuted */);
    }
    constructor(_terminalService, _terminalGroupService, _outputService, _paneCompositeService, _viewsService, _markerService, _modelService, _configurationResolverService, _contextService, _environmentService, _outputChannelId, _fileService, _terminalProfileResolverService, _pathService, _viewDescriptorService, _logService, _notificationService, instantiationService, taskSystemInfoResolver) {
        super();
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._outputService = _outputService;
        this._paneCompositeService = _paneCompositeService;
        this._viewsService = _viewsService;
        this._markerService = _markerService;
        this._modelService = _modelService;
        this._configurationResolverService = _configurationResolverService;
        this._contextService = _contextService;
        this._environmentService = _environmentService;
        this._outputChannelId = _outputChannelId;
        this._fileService = _fileService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._pathService = _pathService;
        this._viewDescriptorService = _viewDescriptorService;
        this._logService = _logService;
        this._notificationService = _notificationService;
        this._isRerun = false;
        this._terminalCreationQueue = Promise.resolve();
        this._hasReconnected = false;
        this._activeTasks = Object.create(null);
        this._busyTasks = Object.create(null);
        this._terminals = Object.create(null);
        this._idleTaskTerminals = new LinkedMap();
        this._sameTaskTerminals = Object.create(null);
        this._onDidStateChange = new Emitter();
        this._taskSystemInfoResolver = taskSystemInfoResolver;
        this._register(this._terminalStatusManager = instantiationService.createInstance(TaskTerminalStatus));
    }
    get onDidStateChange() {
        return this._onDidStateChange.event;
    }
    _log(value) {
        this._appendOutput(value + '\n');
    }
    _showOutput() {
        this._outputService.showChannel(this._outputChannelId, true);
    }
    reconnect(task, resolver) {
        this._reconnectToTerminals();
        return this.run(task, resolver, Triggers.reconnect);
    }
    run(task, resolver, trigger = Triggers.command) {
        task = task.clone(); // A small amount of task state is stored in the task (instance) and tasks passed in to run may have that set already.
        const instances = InMemoryTask.is(task) || this._isTaskEmpty(task) ? [] : this._getInstances(task);
        const validInstance = instances.length < ((task.runOptions && task.runOptions.instanceLimit) ?? 1);
        const instance = instances[0]?.count?.count ?? 0;
        this._currentTask = new VerifiedTask(task, resolver, trigger);
        if (instance > 0) {
            task.instance = instance;
        }
        if (!validInstance) {
            const terminalData = instances[instances.length - 1];
            this._lastTask = this._currentTask;
            return { kind: 2 /* TaskExecuteKind.Active */, task: terminalData.task, active: { same: true, background: task.configurationProperties.isBackground }, promise: terminalData.promise };
        }
        try {
            const executeResult = { kind: 1 /* TaskExecuteKind.Started */, task, started: {}, promise: this._executeTask(task, resolver, trigger, new Set(), new Map(), undefined) };
            executeResult.promise.then(summary => {
                this._lastTask = this._currentTask;
            });
            return executeResult;
        }
        catch (error) {
            if (error instanceof TaskError) {
                throw error;
            }
            else if (error instanceof Error) {
                this._log(error.message);
                throw new TaskError(Severity.Error, error.message, 7 /* TaskErrors.UnknownError */);
            }
            else {
                this._log(error.toString());
                throw new TaskError(Severity.Error, nls.localize('TerminalTaskSystem.unknownError', 'A unknown error has occurred while executing a task. See task output log for details.'), 7 /* TaskErrors.UnknownError */);
            }
        }
    }
    rerun() {
        if (this._lastTask && this._lastTask.verify()) {
            if ((this._lastTask.task.runOptions.reevaluateOnRerun !== undefined) && !this._lastTask.task.runOptions.reevaluateOnRerun) {
                this._isRerun = true;
            }
            const result = this.run(this._lastTask.task, this._lastTask.resolver);
            result.promise.then(summary => {
                this._isRerun = false;
            });
            return result;
        }
        else {
            return undefined;
        }
    }
    _showTaskLoadErrors(task) {
        if (task.taskLoadMessages && task.taskLoadMessages.length > 0) {
            task.taskLoadMessages.forEach(loadMessage => {
                this._log(loadMessage + '\n');
            });
            const openOutput = 'Show Output';
            this._notificationService.prompt(Severity.Warning, nls.localize('TerminalTaskSystem.taskLoadReporting', "There are issues with task \"{0}\". See the output for more details.", task._label), [{
                    label: openOutput,
                    run: () => this._showOutput()
                }]);
        }
    }
    isTaskVisible(task) {
        const terminalData = this._activeTasks[task.getMapKey()];
        if (!terminalData?.terminal) {
            return false;
        }
        const activeTerminalInstance = this._terminalService.activeInstance;
        const isPanelShowingTerminal = !!this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
        return isPanelShowingTerminal && (activeTerminalInstance?.instanceId === terminalData.terminal.instanceId);
    }
    revealTask(task) {
        const terminalData = this._activeTasks[task.getMapKey()];
        if (!terminalData?.terminal) {
            return false;
        }
        const isTerminalInPanel = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID) === 1 /* ViewContainerLocation.Panel */;
        if (isTerminalInPanel && this.isTaskVisible(task)) {
            if (this._previousPanelId) {
                if (this._previousTerminalInstance) {
                    this._terminalService.setActiveInstance(this._previousTerminalInstance);
                }
                this._paneCompositeService.openPaneComposite(this._previousPanelId, 1 /* ViewContainerLocation.Panel */);
            }
            else {
                this._paneCompositeService.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            }
            this._previousPanelId = undefined;
            this._previousTerminalInstance = undefined;
        }
        else {
            if (isTerminalInPanel) {
                this._previousPanelId = this._paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.getId();
                if (this._previousPanelId === TERMINAL_VIEW_ID) {
                    this._previousTerminalInstance = this._terminalService.activeInstance ?? undefined;
                }
            }
            this._terminalService.setActiveInstance(terminalData.terminal);
            if (CustomTask.is(task) || ContributedTask.is(task)) {
                this._terminalGroupService.showPanel(task.command.presentation.focus);
            }
        }
        return true;
    }
    isActive() {
        return Promise.resolve(this.isActiveSync());
    }
    isActiveSync() {
        return Object.values(this._activeTasks).some(value => !!value.terminal);
    }
    canAutoTerminate() {
        return Object.values(this._activeTasks).every(value => !value.task.configurationProperties.promptOnClose);
    }
    getActiveTasks() {
        return Object.values(this._activeTasks).flatMap(value => value.terminal ? value.task : []);
    }
    getLastInstance(task) {
        const recentKey = task.getKey();
        return Object.values(this._activeTasks).reverse().find((value) => recentKey && recentKey === value.task.getKey())?.task;
    }
    getBusyTasks() {
        return Object.keys(this._busyTasks).map(key => this._busyTasks[key]);
    }
    customExecutionComplete(task, result) {
        const activeTerminal = this._activeTasks[task.getMapKey()];
        if (!activeTerminal?.terminal) {
            return Promise.reject(new Error('Expected to have a terminal for a custom execution task'));
        }
        return new Promise((resolve) => {
            // activeTerminal.terminal.rendererExit(result);
            resolve();
        });
    }
    _getInstances(task) {
        const recentKey = task.getKey();
        return Object.values(this._activeTasks).filter((value) => recentKey && recentKey === value.task.getKey());
    }
    _removeFromActiveTasks(task) {
        const key = typeof task === 'string' ? task : task.getMapKey();
        const taskToRemove = this._activeTasks[key];
        if (!taskToRemove) {
            return;
        }
        delete this._activeTasks[key];
    }
    _fireTaskEvent(event) {
        if (event.kind !== "changed" /* TaskEventKind.Changed */) {
            const activeTask = this._activeTasks[event.__task.getMapKey()];
            if (activeTask) {
                activeTask.state = event.kind;
            }
        }
        this._onDidStateChange.fire(event);
    }
    terminate(task) {
        const activeTerminal = this._activeTasks[task.getMapKey()];
        if (!activeTerminal) {
            return Promise.resolve({ success: false, task: undefined });
        }
        const terminal = activeTerminal.terminal;
        if (!terminal) {
            return Promise.resolve({ success: false, task: undefined });
        }
        return new Promise((resolve, reject) => {
            terminal.onDisposed(terminal => {
                this._fireTaskEvent(TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
            });
            const onExit = terminal.onExit(() => {
                const task = activeTerminal.task;
                try {
                    onExit.dispose();
                    this._fireTaskEvent(TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                }
                catch (error) {
                    // Do nothing.
                }
                resolve({ success: true, task: task });
            });
            terminal.dispose();
        });
    }
    terminateAll() {
        const promises = [];
        for (const [key, terminalData] of Object.entries(this._activeTasks)) {
            const terminal = terminalData?.terminal;
            if (terminal) {
                promises.push(new Promise((resolve, reject) => {
                    const onExit = terminal.onExit(() => {
                        const task = terminalData.task;
                        try {
                            onExit.dispose();
                            this._fireTaskEvent(TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                        }
                        catch (error) {
                            // Do nothing.
                        }
                        if (this._activeTasks[key] === terminalData) {
                            delete this._activeTasks[key];
                        }
                        resolve({ success: true, task: terminalData.task });
                    });
                }));
                terminal.dispose();
            }
        }
        return Promise.all(promises);
    }
    _showDependencyCycleMessage(task) {
        this._log(nls.localize('dependencyCycle', 'There is a dependency cycle. See task "{0}".', task._label));
        this._showOutput();
    }
    _executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
        this._showTaskLoadErrors(task);
        const mapKey = task.getMapKey();
        // It's important that we add this task's entry to _activeTasks before
        // any of the code in the then runs (see #180541 and #180578). Wrapping
        // it in Promise.resolve().then() ensures that.
        const promise = Promise.resolve().then(async () => {
            alreadyResolved = alreadyResolved ?? new Map();
            const promises = [];
            if (task.configurationProperties.dependsOn) {
                const nextLiveDependencies = new Set(liveDependencies).add(task.getCommonTaskId());
                for (const dependency of task.configurationProperties.dependsOn) {
                    const dependencyTask = await resolver.resolve(dependency.uri, dependency.task);
                    if (dependencyTask) {
                        this._adoptConfigurationForDependencyTask(dependencyTask, task);
                        let taskResult;
                        const commonKey = dependencyTask.getCommonTaskId();
                        if (nextLiveDependencies.has(commonKey)) {
                            this._showDependencyCycleMessage(dependencyTask);
                            taskResult = Promise.resolve({});
                        }
                        else {
                            taskResult = encounteredTasks.get(commonKey);
                            if (!taskResult) {
                                const activeTask = this._activeTasks[dependencyTask.getMapKey()] ?? this._getInstances(dependencyTask).pop();
                                taskResult = activeTask && this._getDependencyPromise(activeTask);
                            }
                        }
                        if (!taskResult) {
                            this._fireTaskEvent(TaskEvent.general("dependsOnStarted" /* TaskEventKind.DependsOnStarted */, task));
                            taskResult = this._executeDependencyTask(dependencyTask, resolver, trigger, nextLiveDependencies, encounteredTasks, alreadyResolved);
                        }
                        encounteredTasks.set(commonKey, taskResult);
                        promises.push(taskResult);
                        if (task.configurationProperties.dependsOrder === "sequence" /* DependsOrder.sequence */) {
                            const promiseResult = await taskResult;
                            if (promiseResult.exitCode !== 0) {
                                break;
                            }
                        }
                    }
                    else {
                        this._log(nls.localize('dependencyFailed', 'Couldn\'t resolve dependent task \'{0}\' in workspace folder \'{1}\'', Types.isString(dependency.task) ? dependency.task : JSON.stringify(dependency.task, undefined, 0), dependency.uri.toString()));
                        this._showOutput();
                    }
                }
            }
            return Promise.all(promises).then((summaries) => {
                for (const summary of summaries) {
                    if (summary.exitCode !== 0) {
                        return { exitCode: summary.exitCode };
                    }
                }
                if ((ContributedTask.is(task) || CustomTask.is(task)) && (task.command)) {
                    if (this._isRerun) {
                        return this._reexecuteCommand(task, trigger, alreadyResolved);
                    }
                    else {
                        return this._executeCommand(task, trigger, alreadyResolved);
                    }
                }
                return { exitCode: 0 };
            });
        }).finally(() => {
            delete this._activeTasks[mapKey];
        });
        const lastInstance = this._getInstances(task).pop();
        const count = lastInstance?.count ?? { count: 0 };
        count.count++;
        const activeTask = { task, promise, count };
        this._activeTasks[mapKey] = activeTask;
        return promise;
    }
    _createInactiveDependencyPromise(task) {
        return new Promise(resolve => {
            const taskInactiveDisposable = this.onDidStateChange(taskEvent => {
                if ((taskEvent.kind === "inactive" /* TaskEventKind.Inactive */) && (taskEvent.__task === task)) {
                    taskInactiveDisposable.dispose();
                    resolve({ exitCode: 0 });
                }
            });
        });
    }
    _adoptConfigurationForDependencyTask(dependencyTask, task) {
        if (dependencyTask.configurationProperties.icon) {
            dependencyTask.configurationProperties.icon.id ||= task.configurationProperties.icon?.id;
            dependencyTask.configurationProperties.icon.color ||= task.configurationProperties.icon?.color;
        }
        else {
            dependencyTask.configurationProperties.icon = task.configurationProperties.icon;
        }
    }
    async _getDependencyPromise(task) {
        if (!task.task.configurationProperties.isBackground) {
            return task.promise;
        }
        if (!task.task.configurationProperties.problemMatchers || task.task.configurationProperties.problemMatchers.length === 0) {
            return task.promise;
        }
        if (task.state === "inactive" /* TaskEventKind.Inactive */) {
            return { exitCode: 0 };
        }
        return this._createInactiveDependencyPromise(task.task);
    }
    async _executeDependencyTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
        // If the task is a background task with a watching problem matcher, we don't wait for the whole task to finish,
        // just for the problem matcher to go inactive.
        if (!task.configurationProperties.isBackground) {
            return this._executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved);
        }
        const inactivePromise = this._createInactiveDependencyPromise(task);
        return Promise.race([inactivePromise, this._executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved)]);
    }
    async _resolveAndFindExecutable(systemInfo, workspaceFolder, task, cwd, envPath) {
        const command = await this._configurationResolverService.resolveAsync(workspaceFolder, CommandString.value(task.command.name));
        cwd = cwd ? await this._configurationResolverService.resolveAsync(workspaceFolder, cwd) : undefined;
        const paths = envPath ? await Promise.all(envPath.split(path.delimiter).map(p => this._configurationResolverService.resolveAsync(workspaceFolder, p))) : undefined;
        let foundExecutable = await systemInfo?.findExecutable(command, cwd, paths);
        if (!foundExecutable) {
            foundExecutable = path.join(cwd ?? '', command);
        }
        return foundExecutable;
    }
    _findUnresolvedVariables(variables, alreadyResolved) {
        if (alreadyResolved.size === 0) {
            return variables;
        }
        const unresolved = new Set();
        for (const variable of variables) {
            if (!alreadyResolved.has(variable.substring(2, variable.length - 1))) {
                unresolved.add(variable);
            }
        }
        return unresolved;
    }
    _mergeMaps(mergeInto, mergeFrom) {
        for (const entry of mergeFrom) {
            if (!mergeInto.has(entry[0])) {
                mergeInto.set(entry[0], entry[1]);
            }
        }
    }
    async _acquireInput(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
        const resolved = await this._resolveVariablesFromSet(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved);
        this._fireTaskEvent(TaskEvent.general("acquiredInput" /* TaskEventKind.AcquiredInput */, task));
        return resolved;
    }
    _resolveVariablesFromSet(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
        const isProcess = task.command && task.command.runtime === RuntimeType.Process;
        const options = task.command && task.command.options ? task.command.options : undefined;
        const cwd = options ? options.cwd : undefined;
        let envPath = undefined;
        if (options && options.env) {
            for (const key of Object.keys(options.env)) {
                if (key.toLowerCase() === 'path') {
                    if (Types.isString(options.env[key])) {
                        envPath = options.env[key];
                    }
                    break;
                }
            }
        }
        const unresolved = this._findUnresolvedVariables(variables, alreadyResolved);
        let resolvedVariables;
        if (taskSystemInfo && workspaceFolder) {
            const resolveSet = {
                variables: unresolved
            };
            if (taskSystemInfo.platform === 3 /* Platform.Platform.Windows */ && isProcess) {
                resolveSet.process = { name: CommandString.value(task.command.name) };
                if (cwd) {
                    resolveSet.process.cwd = cwd;
                }
                if (envPath) {
                    resolveSet.process.path = envPath;
                }
            }
            resolvedVariables = taskSystemInfo.resolveVariables(workspaceFolder, resolveSet, TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolved) => {
                if (!resolved) {
                    return undefined;
                }
                this._mergeMaps(alreadyResolved, resolved.variables);
                resolved.variables = new Map(alreadyResolved);
                if (isProcess) {
                    let process = CommandString.value(task.command.name);
                    if (taskSystemInfo.platform === 3 /* Platform.Platform.Windows */) {
                        process = await this._resolveAndFindExecutable(taskSystemInfo, workspaceFolder, task, cwd, envPath);
                    }
                    resolved.variables.set(TerminalTaskSystem.ProcessVarName, process);
                }
                return resolved;
            });
            return resolvedVariables;
        }
        else {
            const variablesArray = new Array();
            unresolved.forEach(variable => variablesArray.push(variable));
            return new Promise((resolve, reject) => {
                this._configurationResolverService.resolveWithInteraction(workspaceFolder, variablesArray, 'tasks', undefined, TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolvedVariablesMap) => {
                    if (resolvedVariablesMap) {
                        this._mergeMaps(alreadyResolved, resolvedVariablesMap);
                        resolvedVariablesMap = new Map(alreadyResolved);
                        if (isProcess) {
                            let processVarValue;
                            if (Platform.isWindows) {
                                processVarValue = await this._resolveAndFindExecutable(taskSystemInfo, workspaceFolder, task, cwd, envPath);
                            }
                            else {
                                processVarValue = await this._configurationResolverService.resolveAsync(workspaceFolder, CommandString.value(task.command.name));
                            }
                            resolvedVariablesMap.set(TerminalTaskSystem.ProcessVarName, processVarValue);
                        }
                        const resolvedVariablesResult = {
                            variables: resolvedVariablesMap,
                        };
                        resolve(resolvedVariablesResult);
                    }
                    else {
                        resolve(undefined);
                    }
                }, reason => {
                    reject(reason);
                });
            });
        }
    }
    _executeCommand(task, trigger, alreadyResolved) {
        const taskWorkspaceFolder = task.getWorkspaceFolder();
        let workspaceFolder;
        if (taskWorkspaceFolder) {
            workspaceFolder = this._currentTask.workspaceFolder = taskWorkspaceFolder;
        }
        else {
            const folders = this._contextService.getWorkspace().folders;
            workspaceFolder = folders.length > 0 ? folders[0] : undefined;
        }
        const systemInfo = this._currentTask.systemInfo = this._taskSystemInfoResolver(workspaceFolder);
        const variables = new Set();
        this._collectTaskVariables(variables, task);
        const resolvedVariables = this._acquireInput(systemInfo, workspaceFolder, task, variables, alreadyResolved);
        return resolvedVariables.then((resolvedVariables) => {
            if (resolvedVariables && !this._isTaskEmpty(task)) {
                this._currentTask.resolvedVariables = resolvedVariables;
                return this._executeInTerminal(task, trigger, new VariableResolver(workspaceFolder, systemInfo, resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
            }
            else {
                // Allows the taskExecutions array to be updated in the extension host
                this._fireTaskEvent(TaskEvent.general("end" /* TaskEventKind.End */, task));
                return Promise.resolve({ exitCode: 0 });
            }
        }, reason => {
            return Promise.reject(reason);
        });
    }
    _isTaskEmpty(task) {
        const isCustomExecution = (task.command.runtime === RuntimeType.CustomExecution);
        return !((task.command !== undefined) && task.command.runtime && (isCustomExecution || (task.command.name !== undefined)));
    }
    _reexecuteCommand(task, trigger, alreadyResolved) {
        const lastTask = this._lastTask;
        if (!lastTask) {
            return Promise.reject(new Error('No task previously run'));
        }
        const workspaceFolder = this._currentTask.workspaceFolder = lastTask.workspaceFolder;
        const variables = new Set();
        this._collectTaskVariables(variables, task);
        // Check that the task hasn't changed to include new variables
        let hasAllVariables = true;
        variables.forEach(value => {
            if (value.substring(2, value.length - 1) in lastTask.getVerifiedTask().resolvedVariables) {
                hasAllVariables = false;
            }
        });
        if (!hasAllVariables) {
            return this._acquireInput(lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().workspaceFolder, task, variables, alreadyResolved).then((resolvedVariables) => {
                if (!resolvedVariables) {
                    // Allows the taskExecutions array to be updated in the extension host
                    this._fireTaskEvent(TaskEvent.general("end" /* TaskEventKind.End */, task));
                    return { exitCode: 0 };
                }
                this._currentTask.resolvedVariables = resolvedVariables;
                return this._executeInTerminal(task, trigger, new VariableResolver(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
            }, reason => {
                return Promise.reject(reason);
            });
        }
        else {
            this._currentTask.resolvedVariables = lastTask.getVerifiedTask().resolvedVariables;
            return this._executeInTerminal(task, trigger, new VariableResolver(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
        }
    }
    async _executeInTerminal(task, trigger, resolver, workspaceFolder) {
        let terminal = undefined;
        let error = undefined;
        let promise = undefined;
        if (task.configurationProperties.isBackground) {
            const problemMatchers = await this._resolveMatchers(resolver, task.configurationProperties.problemMatchers);
            const watchingProblemMatcher = new WatchingProblemCollector(problemMatchers, this._markerService, this._modelService, this._fileService);
            if ((problemMatchers.length > 0) && !watchingProblemMatcher.isWatching()) {
                this._appendOutput(nls.localize('TerminalTaskSystem.nonWatchingMatcher', 'Task {0} is a background task but uses a problem matcher without a background pattern', task._label));
                this._showOutput();
            }
            const toDispose = new DisposableStore();
            let eventCounter = 0;
            const mapKey = task.getMapKey();
            toDispose.add(watchingProblemMatcher.onDidStateChange((event) => {
                if (event.kind === "backgroundProcessingBegins" /* ProblemCollectorEventKind.BackgroundProcessingBegins */) {
                    eventCounter++;
                    this._busyTasks[mapKey] = task;
                    this._fireTaskEvent(TaskEvent.general("active" /* TaskEventKind.Active */, task, terminal?.instanceId));
                }
                else if (event.kind === "backgroundProcessingEnds" /* ProblemCollectorEventKind.BackgroundProcessingEnds */) {
                    eventCounter--;
                    if (this._busyTasks[mapKey]) {
                        delete this._busyTasks[mapKey];
                    }
                    this._fireTaskEvent(TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal?.instanceId));
                    if (eventCounter === 0) {
                        if ((watchingProblemMatcher.numberOfMatches > 0) && watchingProblemMatcher.maxMarkerSeverity &&
                            (watchingProblemMatcher.maxMarkerSeverity >= MarkerSeverity.Error)) {
                            const reveal = task.command.presentation.reveal;
                            const revealProblems = task.command.presentation.revealProblems;
                            if (revealProblems === RevealProblemKind.OnProblem) {
                                this._viewsService.openView(Markers.MARKERS_VIEW_ID, true);
                            }
                            else if (reveal === RevealKind.Silent) {
                                this._terminalService.setActiveInstance(terminal);
                                this._terminalGroupService.showPanel(false);
                            }
                        }
                    }
                }
            }));
            watchingProblemMatcher.aboutToStart();
            let delayer = undefined;
            [terminal, error] = await this._createTerminal(task, resolver, workspaceFolder);
            if (error) {
                return Promise.reject(new Error(error.message));
            }
            if (!terminal) {
                return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
            }
            this._terminalStatusManager.addTerminal(task, terminal, watchingProblemMatcher);
            let processStartedSignaled = false;
            terminal.processReady.then(() => {
                if (!processStartedSignaled) {
                    this._fireTaskEvent(TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                    processStartedSignaled = true;
                }
            }, (_error) => {
                this._logService.error('Task terminal process never got ready');
            });
            this._fireTaskEvent(TaskEvent.start(task, terminal.instanceId, resolver.values));
            let onData;
            if (problemMatchers.length) {
                // prevent https://github.com/microsoft/vscode/issues/174511 from happening
                onData = terminal.onLineData((line) => {
                    watchingProblemMatcher.processLine(line);
                    if (!delayer) {
                        delayer = new Async.Delayer(3000);
                    }
                    delayer.trigger(() => {
                        watchingProblemMatcher.forceDelivery();
                        delayer = undefined;
                    });
                });
            }
            promise = new Promise((resolve, reject) => {
                const onExit = terminal.onExit((terminalLaunchResult) => {
                    const exitCode = typeof terminalLaunchResult === 'number' ? terminalLaunchResult : terminalLaunchResult?.code;
                    onData?.dispose();
                    onExit.dispose();
                    const key = task.getMapKey();
                    if (this._busyTasks[mapKey]) {
                        delete this._busyTasks[mapKey];
                    }
                    this._removeFromActiveTasks(task);
                    this._fireTaskEvent(TaskEvent.changed());
                    if (terminalLaunchResult !== undefined) {
                        // Only keep a reference to the terminal if it is not being disposed.
                        switch (task.command.presentation.panel) {
                            case PanelKind.Dedicated:
                                this._sameTaskTerminals[key] = terminal.instanceId.toString();
                                break;
                            case PanelKind.Shared:
                                this._idleTaskTerminals.set(key, terminal.instanceId.toString(), 1 /* Touch.AsOld */);
                                break;
                        }
                    }
                    const reveal = task.command.presentation.reveal;
                    if ((reveal === RevealKind.Silent) && ((exitCode !== 0) || (watchingProblemMatcher.numberOfMatches > 0) && watchingProblemMatcher.maxMarkerSeverity &&
                        (watchingProblemMatcher.maxMarkerSeverity >= MarkerSeverity.Error))) {
                        try {
                            this._terminalService.setActiveInstance(terminal);
                            this._terminalGroupService.showPanel(false);
                        }
                        catch (e) {
                            // If the terminal has already been disposed, then setting the active instance will fail. #99828
                            // There is nothing else to do here.
                        }
                    }
                    watchingProblemMatcher.done();
                    watchingProblemMatcher.dispose();
                    if (!processStartedSignaled) {
                        this._fireTaskEvent(TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                        processStartedSignaled = true;
                    }
                    this._fireTaskEvent(TaskEvent.processEnded(task, terminal.instanceId, exitCode));
                    for (let i = 0; i < eventCounter; i++) {
                        this._fireTaskEvent(TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal.instanceId));
                    }
                    eventCounter = 0;
                    this._fireTaskEvent(TaskEvent.general("end" /* TaskEventKind.End */, task));
                    toDispose.dispose();
                    resolve({ exitCode: exitCode ?? undefined });
                });
            });
            if (trigger === Triggers.reconnect && !!terminal.xterm) {
                const bufferLines = [];
                const bufferReverseIterator = terminal.xterm.getBufferReverseIterator();
                const startRegex = new RegExp(watchingProblemMatcher.beginPatterns.map(pattern => pattern.source).join('|'));
                for (const nextLine of bufferReverseIterator) {
                    bufferLines.push(nextLine);
                    if (startRegex.test(nextLine)) {
                        break;
                    }
                }
                let delayer = undefined;
                for (let i = bufferLines.length - 1; i >= 0; i--) {
                    watchingProblemMatcher.processLine(bufferLines[i]);
                    if (!delayer) {
                        delayer = new Async.Delayer(3000);
                    }
                    delayer.trigger(() => {
                        watchingProblemMatcher.forceDelivery();
                        delayer = undefined;
                    });
                }
            }
        }
        else {
            [terminal, error] = await this._createTerminal(task, resolver, workspaceFolder);
            if (error) {
                return Promise.reject(new Error(error.message));
            }
            if (!terminal) {
                return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
            }
            this._fireTaskEvent(TaskEvent.start(task, terminal.instanceId, resolver.values));
            const mapKey = task.getMapKey();
            this._busyTasks[mapKey] = task;
            this._fireTaskEvent(TaskEvent.general("active" /* TaskEventKind.Active */, task, terminal.instanceId));
            const problemMatchers = await this._resolveMatchers(resolver, task.configurationProperties.problemMatchers);
            const startStopProblemMatcher = new StartStopProblemCollector(problemMatchers, this._markerService, this._modelService, 0 /* ProblemHandlingStrategy.Clean */, this._fileService);
            this._terminalStatusManager.addTerminal(task, terminal, startStopProblemMatcher);
            let processStartedSignaled = false;
            terminal.processReady.then(() => {
                if (!processStartedSignaled) {
                    this._fireTaskEvent(TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                    processStartedSignaled = true;
                }
            }, (_error) => {
                // The process never got ready. Need to think how to handle this.
            });
            const onData = terminal.onLineData((line) => {
                startStopProblemMatcher.processLine(line);
            });
            promise = new Promise((resolve, reject) => {
                const onExit = terminal.onExit((terminalLaunchResult) => {
                    const exitCode = typeof terminalLaunchResult === 'number' ? terminalLaunchResult : terminalLaunchResult?.code;
                    onExit.dispose();
                    const key = task.getMapKey();
                    this._removeFromActiveTasks(task);
                    this._fireTaskEvent(TaskEvent.changed());
                    if (terminalLaunchResult !== undefined) {
                        // Only keep a reference to the terminal if it is not being disposed.
                        switch (task.command.presentation.panel) {
                            case PanelKind.Dedicated:
                                this._sameTaskTerminals[key] = terminal.instanceId.toString();
                                break;
                            case PanelKind.Shared:
                                this._idleTaskTerminals.set(key, terminal.instanceId.toString(), 1 /* Touch.AsOld */);
                                break;
                        }
                    }
                    const reveal = task.command.presentation.reveal;
                    const revealProblems = task.command.presentation.revealProblems;
                    const revealProblemPanel = terminal && (revealProblems === RevealProblemKind.OnProblem) && (startStopProblemMatcher.numberOfMatches > 0);
                    if (revealProblemPanel) {
                        this._viewsService.openView(Markers.MARKERS_VIEW_ID);
                    }
                    else if (terminal && (reveal === RevealKind.Silent) && ((exitCode !== 0) || (startStopProblemMatcher.numberOfMatches > 0) && startStopProblemMatcher.maxMarkerSeverity &&
                        (startStopProblemMatcher.maxMarkerSeverity >= MarkerSeverity.Error))) {
                        try {
                            this._terminalService.setActiveInstance(terminal);
                            this._terminalGroupService.showPanel(false);
                        }
                        catch (e) {
                            // If the terminal has already been disposed, then setting the active instance will fail. #99828
                            // There is nothing else to do here.
                        }
                    }
                    // Hack to work around #92868 until terminal is fixed.
                    setTimeout(() => {
                        onData.dispose();
                        startStopProblemMatcher.done();
                        startStopProblemMatcher.dispose();
                    }, 100);
                    if (!processStartedSignaled && terminal) {
                        this._fireTaskEvent(TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                        processStartedSignaled = true;
                    }
                    this._fireTaskEvent(TaskEvent.processEnded(task, terminal?.instanceId, exitCode ?? undefined));
                    if (this._busyTasks[mapKey]) {
                        delete this._busyTasks[mapKey];
                    }
                    this._fireTaskEvent(TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal?.instanceId));
                    this._fireTaskEvent(TaskEvent.general("end" /* TaskEventKind.End */, task, terminal?.instanceId));
                    resolve({ exitCode: exitCode ?? undefined });
                });
            });
        }
        const showProblemPanel = task.command.presentation && (task.command.presentation.revealProblems === RevealProblemKind.Always);
        if (showProblemPanel) {
            this._viewsService.openView(Markers.MARKERS_VIEW_ID);
        }
        else if (task.command.presentation && (task.command.presentation.focus || task.command.presentation.reveal === RevealKind.Always)) {
            this._terminalService.setActiveInstance(terminal);
            await this._terminalService.revealTerminal(terminal);
            if (task.command.presentation.focus) {
                this._terminalService.focusInstance(terminal);
            }
        }
        this._activeTasks[task.getMapKey()].terminal = terminal;
        this._fireTaskEvent(TaskEvent.changed());
        return promise;
    }
    _createTerminalName(task) {
        const needsFolderQualification = this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
        return needsFolderQualification ? task.getQualifiedLabel() : (task.configurationProperties.name || '');
    }
    async _createShellLaunchConfig(task, workspaceFolder, variableResolver, platform, options, command, args, waitOnExit) {
        let shellLaunchConfig;
        const isShellCommand = task.command.runtime === RuntimeType.Shell;
        const needsFolderQualification = this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
        const terminalName = this._createTerminalName(task);
        const type = ReconnectionType;
        const originalCommand = task.command.name;
        let cwd;
        if (options.cwd) {
            cwd = options.cwd;
            if (!path.isAbsolute(cwd)) {
                if (workspaceFolder && (workspaceFolder.uri.scheme === Schemas.file)) {
                    cwd = path.join(workspaceFolder.uri.fsPath, cwd);
                }
            }
            // This must be normalized to the OS
            cwd = isUNC(cwd) ? cwd : resources.toLocalResource(URI.from({ scheme: Schemas.file, path: cwd }), this._environmentService.remoteAuthority, this._pathService.defaultUriScheme);
        }
        if (isShellCommand) {
            let os;
            switch (platform) {
                case 3 /* Platform.Platform.Windows */:
                    os = 1 /* Platform.OperatingSystem.Windows */;
                    break;
                case 1 /* Platform.Platform.Mac */:
                    os = 2 /* Platform.OperatingSystem.Macintosh */;
                    break;
                case 2 /* Platform.Platform.Linux */:
                default:
                    os = 3 /* Platform.OperatingSystem.Linux */;
                    break;
            }
            const defaultProfile = await this._terminalProfileResolverService.getDefaultProfile({
                allowAutomationShell: true,
                os,
                remoteAuthority: this._environmentService.remoteAuthority
            });
            let icon;
            if (task.configurationProperties.icon?.id) {
                icon = ThemeIcon.fromId(task.configurationProperties.icon.id);
            }
            else {
                const taskGroupKind = task.configurationProperties.group ? GroupKind.to(task.configurationProperties.group) : undefined;
                const kindId = typeof taskGroupKind === 'string' ? taskGroupKind : taskGroupKind?.kind;
                icon = kindId === 'test' ? ThemeIcon.fromId(Codicon.beaker.id) : defaultProfile.icon;
            }
            shellLaunchConfig = {
                name: terminalName,
                type,
                executable: defaultProfile.path,
                args: defaultProfile.args,
                env: { ...defaultProfile.env },
                icon,
                color: task.configurationProperties.icon?.color || undefined,
                waitOnExit
            };
            let shellSpecified = false;
            const shellOptions = task.command.options && task.command.options.shell;
            if (shellOptions) {
                if (shellOptions.executable) {
                    // Clear out the args so that we don't end up with mismatched args.
                    if (shellOptions.executable !== shellLaunchConfig.executable) {
                        shellLaunchConfig.args = undefined;
                    }
                    shellLaunchConfig.executable = await this._resolveVariable(variableResolver, shellOptions.executable);
                    shellSpecified = true;
                }
                if (shellOptions.args) {
                    shellLaunchConfig.args = await this._resolveVariables(variableResolver, shellOptions.args.slice());
                }
            }
            if (shellLaunchConfig.args === undefined) {
                shellLaunchConfig.args = [];
            }
            const shellArgs = Array.isArray(shellLaunchConfig.args) ? shellLaunchConfig.args.slice(0) : [shellLaunchConfig.args];
            const toAdd = [];
            const basename = path.posix.basename((await this._pathService.fileURI(shellLaunchConfig.executable)).path).toLowerCase();
            const commandLine = this._buildShellCommandLine(platform, basename, shellOptions, command, originalCommand, args);
            let windowsShellArgs = false;
            if (platform === 3 /* Platform.Platform.Windows */) {
                windowsShellArgs = true;
                // If we don't have a cwd, then the terminal uses the home dir.
                const userHome = await this._pathService.userHome();
                if (basename === 'cmd.exe' && ((options.cwd && isUNC(options.cwd)) || (!options.cwd && isUNC(userHome.fsPath)))) {
                    return undefined;
                }
                if ((basename === 'powershell.exe') || (basename === 'pwsh.exe')) {
                    if (!shellSpecified) {
                        toAdd.push('-Command');
                    }
                }
                else if ((basename === 'bash.exe') || (basename === 'zsh.exe')) {
                    windowsShellArgs = false;
                    if (!shellSpecified) {
                        toAdd.push('-c');
                    }
                }
                else if (basename === 'wsl.exe') {
                    if (!shellSpecified) {
                        toAdd.push('-e');
                    }
                }
                else {
                    if (!shellSpecified) {
                        toAdd.push('/d', '/c');
                    }
                }
            }
            else {
                if (!shellSpecified) {
                    // Under Mac remove -l to not start it as a login shell.
                    if (platform === 1 /* Platform.Platform.Mac */) {
                        // Background on -l on osx https://github.com/microsoft/vscode/issues/107563
                        // TODO: Handle by pulling the default terminal profile?
                        // const osxShellArgs = this._configurationService.inspect(TerminalSettingId.ShellArgsMacOs);
                        // if ((osxShellArgs.user === undefined) && (osxShellArgs.userLocal === undefined) && (osxShellArgs.userLocalValue === undefined)
                        // 	&& (osxShellArgs.userRemote === undefined) && (osxShellArgs.userRemoteValue === undefined)
                        // 	&& (osxShellArgs.userValue === undefined) && (osxShellArgs.workspace === undefined)
                        // 	&& (osxShellArgs.workspaceFolder === undefined) && (osxShellArgs.workspaceFolderValue === undefined)
                        // 	&& (osxShellArgs.workspaceValue === undefined)) {
                        // 	const index = shellArgs.indexOf('-l');
                        // 	if (index !== -1) {
                        // 		shellArgs.splice(index, 1);
                        // 	}
                        // }
                    }
                    toAdd.push('-c');
                }
            }
            const combinedShellArgs = this._addAllArgument(toAdd, shellArgs);
            combinedShellArgs.push(commandLine);
            shellLaunchConfig.args = windowsShellArgs ? combinedShellArgs.join(' ') : combinedShellArgs;
            if (task.command.presentation && task.command.presentation.echo) {
                if (needsFolderQualification && workspaceFolder) {
                    const folder = cwd && typeof cwd === 'object' && 'path' in cwd ? path.basename(cwd.path) : workspaceFolder.name;
                    shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + formatMessageForTerminal(nls.localize({
                        key: 'task.executingInFolder',
                        comment: ['The workspace folder the task is running in', 'The task command line or label']
                    }, 'Executing task in folder {0}: {1}', folder, commandLine), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                }
                else {
                    shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + formatMessageForTerminal(nls.localize({
                        key: 'task.executing.shellIntegration',
                        comment: ['The task command line or label']
                    }, 'Executing task: {0}', commandLine), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                }
            }
            else {
                shellLaunchConfig.initialText = {
                    text: this.taskShellIntegrationStartSequence(cwd) + this.taskShellIntegrationOutputSequence,
                    trailingNewLine: false
                };
            }
        }
        else {
            const commandExecutable = (task.command.runtime !== RuntimeType.CustomExecution) ? CommandString.value(command) : undefined;
            const executable = !isShellCommand
                ? await this._resolveVariable(variableResolver, await this._resolveVariable(variableResolver, '${' + TerminalTaskSystem.ProcessVarName + '}'))
                : commandExecutable;
            // When we have a process task there is no need to quote arguments. So we go ahead and take the string value.
            shellLaunchConfig = {
                name: terminalName,
                type,
                icon: task.configurationProperties.icon?.id ? ThemeIcon.fromId(task.configurationProperties.icon.id) : undefined,
                color: task.configurationProperties.icon?.color || undefined,
                executable: executable,
                args: args.map(a => Types.isString(a) ? a : a.value),
                waitOnExit
            };
            if (task.command.presentation && task.command.presentation.echo) {
                const getArgsToEcho = (args) => {
                    if (!args || args.length === 0) {
                        return '';
                    }
                    if (Types.isString(args)) {
                        return args;
                    }
                    return args.join(' ');
                };
                if (needsFolderQualification && workspaceFolder) {
                    shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + formatMessageForTerminal(nls.localize({
                        key: 'task.executingInFolder',
                        comment: ['The workspace folder the task is running in', 'The task command line or label']
                    }, 'Executing task in folder {0}: {1}', workspaceFolder.name, `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                }
                else {
                    shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + formatMessageForTerminal(nls.localize({
                        key: 'task.executing.shell-integration',
                        comment: ['The task command line or label']
                    }, 'Executing task: {0}', `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                }
            }
            else {
                shellLaunchConfig.initialText = {
                    text: this.taskShellIntegrationStartSequence(cwd) + this.taskShellIntegrationOutputSequence,
                    trailingNewLine: false
                };
            }
        }
        if (cwd) {
            shellLaunchConfig.cwd = cwd;
        }
        if (options.env) {
            if (shellLaunchConfig.env) {
                shellLaunchConfig.env = { ...shellLaunchConfig.env, ...options.env };
            }
            else {
                shellLaunchConfig.env = options.env;
            }
        }
        shellLaunchConfig.isFeatureTerminal = true;
        shellLaunchConfig.useShellEnvironment = true;
        return shellLaunchConfig;
    }
    _addAllArgument(shellCommandArgs, configuredShellArgs) {
        const combinedShellArgs = Objects.deepClone(configuredShellArgs);
        shellCommandArgs.forEach(element => {
            const shouldAddShellCommandArg = configuredShellArgs.every((arg, index) => {
                if ((arg.toLowerCase() === element) && (configuredShellArgs.length > index + 1)) {
                    // We can still add the argument, but only if not all of the following arguments begin with "-".
                    return !configuredShellArgs.slice(index + 1).every(testArg => testArg.startsWith('-'));
                }
                else {
                    return arg.toLowerCase() !== element;
                }
            });
            if (shouldAddShellCommandArg) {
                combinedShellArgs.push(element);
            }
        });
        return combinedShellArgs;
    }
    async _reconnectToTerminal(task) {
        if (!this._reconnectedTerminals) {
            return;
        }
        for (let i = 0; i < this._reconnectedTerminals.length; i++) {
            const terminal = this._reconnectedTerminals[i];
            if (getReconnectionData(terminal)?.lastTask === task.getCommonTaskId()) {
                this._reconnectedTerminals.splice(i, 1);
                return terminal;
            }
        }
        return undefined;
    }
    async _doCreateTerminal(task, group, launchConfigs) {
        const reconnectedTerminal = await this._reconnectToTerminal(task);
        const onDisposed = (terminal) => this._fireTaskEvent(TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
        if (reconnectedTerminal) {
            if ('command' in task && task.command.presentation) {
                reconnectedTerminal.waitOnExit = getWaitOnExitValue(task.command.presentation, task.configurationProperties);
            }
            reconnectedTerminal.onDisposed(onDisposed);
            this._logService.trace('reconnected to task and terminal', task._id);
            return reconnectedTerminal;
        }
        if (group) {
            // Try to find an existing terminal to split.
            // Even if an existing terminal is found, the split can fail if the terminal width is too small.
            for (const terminal of Object.values(this._terminals)) {
                if (terminal.group === group) {
                    this._logService.trace(`Found terminal to split for group ${group}`);
                    const originalInstance = terminal.terminal;
                    const result = await this._terminalService.createTerminal({ location: { parentTerminal: originalInstance }, config: launchConfigs });
                    result.onDisposed(onDisposed);
                    if (result) {
                        return result;
                    }
                }
            }
            this._logService.trace(`No terminal found to split for group ${group}`);
        }
        // Either no group is used, no terminal with the group exists or splitting an existing terminal failed.
        const createdTerminal = await this._terminalService.createTerminal({ config: launchConfigs });
        createdTerminal.onDisposed(onDisposed);
        return createdTerminal;
    }
    _reconnectToTerminals() {
        if (this._hasReconnected) {
            this._logService.trace(`Already reconnected, to ${this._reconnectedTerminals?.length} terminals so returning`);
            return;
        }
        this._reconnectedTerminals = this._terminalService.getReconnectedTerminals(ReconnectionType)?.filter(t => !t.isDisposed && getReconnectionData(t)) || [];
        this._logService.trace(`Attempting reconnection of ${this._reconnectedTerminals?.length} terminals`);
        if (!this._reconnectedTerminals?.length) {
            this._logService.trace(`No terminals to reconnect to so returning`);
        }
        else {
            for (const terminal of this._reconnectedTerminals) {
                const data = getReconnectionData(terminal);
                if (data) {
                    const terminalData = { lastTask: data.lastTask, group: data.group, terminal };
                    this._terminals[terminal.instanceId] = terminalData;
                    this._logService.trace('Reconnecting to task terminal', terminalData.lastTask, terminal.instanceId);
                }
            }
        }
        this._hasReconnected = true;
    }
    _deleteTaskAndTerminal(terminal, terminalData) {
        delete this._terminals[terminal.instanceId];
        delete this._sameTaskTerminals[terminalData.lastTask];
        this._idleTaskTerminals.delete(terminalData.lastTask);
        // Delete the task now as a work around for cases when the onExit isn't fired.
        // This can happen if the terminal wasn't shutdown with an "immediate" flag and is expected.
        // For correct terminal re-use, the task needs to be deleted immediately.
        // Note that this shouldn't be a problem anymore since user initiated terminal kills are now immediate.
        const mapKey = terminalData.lastTask;
        this._removeFromActiveTasks(mapKey);
        if (this._busyTasks[mapKey]) {
            delete this._busyTasks[mapKey];
        }
    }
    async _createTerminal(task, resolver, workspaceFolder) {
        const platform = resolver.taskSystemInfo ? resolver.taskSystemInfo.platform : Platform.platform;
        const options = await this._resolveOptions(resolver, task.command.options);
        const presentationOptions = task.command.presentation;
        if (!presentationOptions) {
            throw new Error('Task presentation options should not be undefined here.');
        }
        const waitOnExit = getWaitOnExitValue(presentationOptions, task.configurationProperties);
        let command;
        let args;
        let launchConfigs;
        if (task.command.runtime === RuntimeType.CustomExecution) {
            this._currentTask.shellLaunchConfig = launchConfigs = {
                customPtyImplementation: (id, cols, rows) => new TerminalProcessExtHostProxy(id, cols, rows, this._terminalService),
                waitOnExit,
                name: this._createTerminalName(task),
                initialText: task.command.presentation && task.command.presentation.echo ? formatMessageForTerminal(nls.localize({
                    key: 'task.executing',
                    comment: ['The task command line or label']
                }, 'Executing task: {0}', task._label), { excludeLeadingNewLine: true }) : undefined,
                isFeatureTerminal: true,
                icon: task.configurationProperties.icon?.id ? ThemeIcon.fromId(task.configurationProperties.icon.id) : undefined,
                color: task.configurationProperties.icon?.color || undefined
            };
        }
        else {
            const resolvedResult = await this._resolveCommandAndArgs(resolver, task.command);
            command = resolvedResult.command;
            args = resolvedResult.args;
            this._currentTask.shellLaunchConfig = launchConfigs = await this._createShellLaunchConfig(task, workspaceFolder, resolver, platform, options, command, args, waitOnExit);
            if (launchConfigs === undefined) {
                return [undefined, new TaskError(Severity.Error, nls.localize('TerminalTaskSystem', 'Can\'t execute a shell command on an UNC drive using cmd.exe.'), 7 /* TaskErrors.UnknownError */)];
            }
        }
        const prefersSameTerminal = presentationOptions.panel === PanelKind.Dedicated;
        const allowsSharedTerminal = presentationOptions.panel === PanelKind.Shared;
        const group = presentationOptions.group;
        const taskKey = task.getMapKey();
        let terminalToReuse;
        if (prefersSameTerminal) {
            const terminalId = this._sameTaskTerminals[taskKey];
            if (terminalId) {
                terminalToReuse = this._terminals[terminalId];
                delete this._sameTaskTerminals[taskKey];
            }
        }
        else if (allowsSharedTerminal) {
            // Always allow to reuse the terminal previously used by the same task.
            let terminalId = this._idleTaskTerminals.remove(taskKey);
            if (!terminalId) {
                // There is no idle terminal which was used by the same task.
                // Search for any idle terminal used previously by a task of the same group
                // (or, if the task has no group, a terminal used by a task without group).
                for (const taskId of this._idleTaskTerminals.keys()) {
                    const idleTerminalId = this._idleTaskTerminals.get(taskId);
                    if (idleTerminalId && this._terminals[idleTerminalId] && this._terminals[idleTerminalId].group === group) {
                        terminalId = this._idleTaskTerminals.remove(taskId);
                        break;
                    }
                }
            }
            if (terminalId) {
                terminalToReuse = this._terminals[terminalId];
            }
        }
        if (terminalToReuse) {
            if (!launchConfigs) {
                throw new Error('Task shell launch configuration should not be undefined here.');
            }
            terminalToReuse.terminal.scrollToBottom();
            if (task.configurationProperties.isBackground) {
                launchConfigs.reconnectionProperties = { ownerId: ReconnectionType, data: { lastTask: task.getCommonTaskId(), group, label: task._label, id: task._id } };
            }
            await terminalToReuse.terminal.reuseTerminal(launchConfigs);
            if (task.command.presentation && task.command.presentation.clear) {
                terminalToReuse.terminal.clearBuffer();
            }
            this._terminals[terminalToReuse.terminal.instanceId.toString()].lastTask = taskKey;
            return [terminalToReuse.terminal, undefined];
        }
        this._terminalCreationQueue = this._terminalCreationQueue.then(() => this._doCreateTerminal(task, group, launchConfigs));
        const terminal = (await this._terminalCreationQueue);
        if (task.configurationProperties.isBackground) {
            terminal.shellLaunchConfig.reconnectionProperties = { ownerId: ReconnectionType, data: { lastTask: task.getCommonTaskId(), group, label: task._label, id: task._id } };
        }
        const terminalKey = terminal.instanceId.toString();
        const terminalData = { terminal: terminal, lastTask: taskKey, group };
        terminal.onDisposed(() => this._deleteTaskAndTerminal(terminal, terminalData));
        this._terminals[terminalKey] = terminalData;
        return [terminal, undefined];
    }
    _buildShellCommandLine(platform, shellExecutable, shellOptions, command, originalCommand, args) {
        const basename = path.parse(shellExecutable).name.toLowerCase();
        const shellQuoteOptions = this._getQuotingOptions(basename, shellOptions, platform);
        function needsQuotes(value) {
            if (value.length >= 2) {
                const first = value[0] === shellQuoteOptions.strong ? shellQuoteOptions.strong : value[0] === shellQuoteOptions.weak ? shellQuoteOptions.weak : undefined;
                if (first === value[value.length - 1]) {
                    return false;
                }
            }
            let quote;
            for (let i = 0; i < value.length; i++) {
                // We found the end quote.
                const ch = value[i];
                if (ch === quote) {
                    quote = undefined;
                }
                else if (quote !== undefined) {
                    // skip the character. We are quoted.
                    continue;
                }
                else if (ch === shellQuoteOptions.escape) {
                    // Skip the next character
                    i++;
                }
                else if (ch === shellQuoteOptions.strong || ch === shellQuoteOptions.weak) {
                    quote = ch;
                }
                else if (ch === ' ') {
                    return true;
                }
            }
            return false;
        }
        function quote(value, kind) {
            if (kind === ShellQuoting.Strong && shellQuoteOptions.strong) {
                return [shellQuoteOptions.strong + value + shellQuoteOptions.strong, true];
            }
            else if (kind === ShellQuoting.Weak && shellQuoteOptions.weak) {
                return [shellQuoteOptions.weak + value + shellQuoteOptions.weak, true];
            }
            else if (kind === ShellQuoting.Escape && shellQuoteOptions.escape) {
                if (Types.isString(shellQuoteOptions.escape)) {
                    return [value.replace(/ /g, shellQuoteOptions.escape + ' '), true];
                }
                else {
                    const buffer = [];
                    for (const ch of shellQuoteOptions.escape.charsToEscape) {
                        buffer.push(`\\${ch}`);
                    }
                    const regexp = new RegExp('[' + buffer.join(',') + ']', 'g');
                    const escapeChar = shellQuoteOptions.escape.escapeChar;
                    return [value.replace(regexp, (match) => escapeChar + match), true];
                }
            }
            return [value, false];
        }
        function quoteIfNecessary(value) {
            if (Types.isString(value)) {
                if (needsQuotes(value)) {
                    return quote(value, ShellQuoting.Strong);
                }
                else {
                    return [value, false];
                }
            }
            else {
                return quote(value.value, value.quoting);
            }
        }
        // If we have no args and the command is a string then use the command to stay backwards compatible with the old command line
        // model. To allow variable resolving with spaces we do continue if the resolved value is different than the original one
        // and the resolved one needs quoting.
        if ((!args || args.length === 0) && Types.isString(command) && (command === originalCommand || needsQuotes(originalCommand))) {
            return command;
        }
        const result = [];
        let commandQuoted = false;
        let argQuoted = false;
        let value;
        let quoted;
        [value, quoted] = quoteIfNecessary(command);
        result.push(value);
        commandQuoted = quoted;
        for (const arg of args) {
            [value, quoted] = quoteIfNecessary(arg);
            result.push(value);
            argQuoted = argQuoted || quoted;
        }
        let commandLine = result.join(' ');
        // There are special rules quoted command line in cmd.exe
        if (platform === 3 /* Platform.Platform.Windows */) {
            if (basename === 'cmd' && commandQuoted && argQuoted) {
                commandLine = '"' + commandLine + '"';
            }
            else if ((basename === 'powershell' || basename === 'pwsh') && commandQuoted) {
                commandLine = '& ' + commandLine;
            }
        }
        return commandLine;
    }
    _getQuotingOptions(shellBasename, shellOptions, platform) {
        if (shellOptions && shellOptions.quoting) {
            return shellOptions.quoting;
        }
        return TerminalTaskSystem._shellQuotes[shellBasename] || TerminalTaskSystem._osShellQuotes[Platform.PlatformToString(platform)];
    }
    _collectTaskVariables(variables, task) {
        if (task.command && task.command.name) {
            this._collectCommandVariables(variables, task.command, task);
        }
        this._collectMatcherVariables(variables, task.configurationProperties.problemMatchers);
        if (task.command.runtime === RuntimeType.CustomExecution && (CustomTask.is(task) || ContributedTask.is(task))) {
            let definition;
            if (CustomTask.is(task)) {
                definition = task._source.config.element;
            }
            else {
                definition = Objects.deepClone(task.defines);
                delete definition._key;
                delete definition.type;
            }
            this._collectDefinitionVariables(variables, definition);
        }
    }
    _collectDefinitionVariables(variables, definition) {
        if (Types.isString(definition)) {
            this._collectVariables(variables, definition);
        }
        else if (Array.isArray(definition)) {
            definition.forEach((element) => this._collectDefinitionVariables(variables, element));
        }
        else if (Types.isObject(definition)) {
            for (const key in definition) {
                this._collectDefinitionVariables(variables, definition[key]);
            }
        }
    }
    _collectCommandVariables(variables, command, task) {
        // The custom execution should have everything it needs already as it provided
        // the callback.
        if (command.runtime === RuntimeType.CustomExecution) {
            return;
        }
        if (command.name === undefined) {
            throw new Error('Command name should never be undefined here.');
        }
        this._collectVariables(variables, command.name);
        command.args?.forEach(arg => this._collectVariables(variables, arg));
        // Try to get a scope.
        const scope = task._source.scope;
        if (scope !== 1 /* TaskScope.Global */) {
            variables.add('${workspaceFolder}');
        }
        if (command.options) {
            const options = command.options;
            if (options.cwd) {
                this._collectVariables(variables, options.cwd);
            }
            const optionsEnv = options.env;
            if (optionsEnv) {
                Object.keys(optionsEnv).forEach((key) => {
                    const value = optionsEnv[key];
                    if (Types.isString(value)) {
                        this._collectVariables(variables, value);
                    }
                });
            }
            if (options.shell) {
                if (options.shell.executable) {
                    this._collectVariables(variables, options.shell.executable);
                }
                options.shell.args?.forEach(arg => this._collectVariables(variables, arg));
            }
        }
    }
    _collectMatcherVariables(variables, values) {
        if (values === undefined || values === null || values.length === 0) {
            return;
        }
        values.forEach((value) => {
            let matcher;
            if (Types.isString(value)) {
                if (value[0] === '$') {
                    matcher = ProblemMatcherRegistry.get(value.substring(1));
                }
                else {
                    matcher = ProblemMatcherRegistry.get(value);
                }
            }
            else {
                matcher = value;
            }
            if (matcher && matcher.filePrefix) {
                if (Types.isString(matcher.filePrefix)) {
                    this._collectVariables(variables, matcher.filePrefix);
                }
                else {
                    for (const fp of [...asArray(matcher.filePrefix.include || []), ...asArray(matcher.filePrefix.exclude || [])]) {
                        this._collectVariables(variables, fp);
                    }
                }
            }
        });
    }
    _collectVariables(variables, value) {
        const string = Types.isString(value) ? value : value.value;
        const r = /\$\{(.*?)\}/g;
        let matches;
        do {
            matches = r.exec(string);
            if (matches) {
                variables.add(matches[0]);
            }
        } while (matches);
    }
    async _resolveCommandAndArgs(resolver, commandConfig) {
        // First we need to use the command args:
        let args = commandConfig.args ? commandConfig.args.slice() : [];
        args = await this._resolveVariables(resolver, args);
        const command = await this._resolveVariable(resolver, commandConfig.name);
        return { command, args };
    }
    async _resolveVariables(resolver, value) {
        return Promise.all(value.map(s => this._resolveVariable(resolver, s)));
    }
    async _resolveMatchers(resolver, values) {
        if (values === undefined || values === null || values.length === 0) {
            return [];
        }
        const result = [];
        for (const value of values) {
            let matcher;
            if (Types.isString(value)) {
                if (value[0] === '$') {
                    matcher = ProblemMatcherRegistry.get(value.substring(1));
                }
                else {
                    matcher = ProblemMatcherRegistry.get(value);
                }
            }
            else {
                matcher = value;
            }
            if (!matcher) {
                this._appendOutput(nls.localize('unknownProblemMatcher', 'Problem matcher {0} can\'t be resolved. The matcher will be ignored'));
                continue;
            }
            const taskSystemInfo = resolver.taskSystemInfo;
            const hasFilePrefix = matcher.filePrefix !== undefined;
            const hasUriProvider = taskSystemInfo !== undefined && taskSystemInfo.uriProvider !== undefined;
            if (!hasFilePrefix && !hasUriProvider) {
                result.push(matcher);
            }
            else {
                const copy = Objects.deepClone(matcher);
                if (hasUriProvider && (taskSystemInfo !== undefined)) {
                    copy.uriProvider = taskSystemInfo.uriProvider;
                }
                if (hasFilePrefix) {
                    const filePrefix = copy.filePrefix;
                    if (Types.isString(filePrefix)) {
                        copy.filePrefix = await this._resolveVariable(resolver, filePrefix);
                    }
                    else if (filePrefix !== undefined) {
                        if (filePrefix.include) {
                            filePrefix.include = Array.isArray(filePrefix.include)
                                ? await Promise.all(filePrefix.include.map(x => this._resolveVariable(resolver, x)))
                                : await this._resolveVariable(resolver, filePrefix.include);
                        }
                        if (filePrefix.exclude) {
                            filePrefix.exclude = Array.isArray(filePrefix.exclude)
                                ? await Promise.all(filePrefix.exclude.map(x => this._resolveVariable(resolver, x)))
                                : await this._resolveVariable(resolver, filePrefix.exclude);
                        }
                    }
                }
                result.push(copy);
            }
        }
        return result;
    }
    async _resolveVariable(resolver, value) {
        // TODO@Dirk Task.getWorkspaceFolder should return a WorkspaceFolder that is defined in workspace.ts
        if (Types.isString(value)) {
            return resolver.resolve(value);
        }
        else if (value !== undefined) {
            return {
                value: await resolver.resolve(value.value),
                quoting: value.quoting
            };
        }
        else { // This should never happen
            throw new Error('Should never try to resolve undefined.');
        }
    }
    async _resolveOptions(resolver, options) {
        if (options === undefined || options === null) {
            let cwd;
            try {
                cwd = await this._resolveVariable(resolver, '${workspaceFolder}');
            }
            catch (e) {
                // No workspace
            }
            return { cwd };
        }
        const result = Types.isString(options.cwd)
            ? { cwd: await this._resolveVariable(resolver, options.cwd) }
            : { cwd: await this._resolveVariable(resolver, '${workspaceFolder}') };
        if (options.env) {
            result.env = Object.create(null);
            for (const key of Object.keys(options.env)) {
                const value = options.env[key];
                if (Types.isString(value)) {
                    result.env[key] = await this._resolveVariable(resolver, value);
                }
                else {
                    result.env[key] = value.toString();
                }
            }
        }
        return result;
    }
    static { this.WellKnownCommands = {
        'ant': true,
        'cmake': true,
        'eslint': true,
        'gradle': true,
        'grunt': true,
        'gulp': true,
        'jake': true,
        'jenkins': true,
        'jshint': true,
        'make': true,
        'maven': true,
        'msbuild': true,
        'msc': true,
        'nmake': true,
        'npm': true,
        'rake': true,
        'tsc': true,
        'xbuild': true
    }; }
    getSanitizedCommand(cmd) {
        let result = cmd.toLowerCase();
        const index = result.lastIndexOf(path.sep);
        if (index !== -1) {
            result = result.substring(index + 1);
        }
        if (TerminalTaskSystem.WellKnownCommands[result]) {
            return result;
        }
        return 'other';
    }
    _appendOutput(output) {
        const outputChannel = this._outputService.getChannel(this._outputChannelId);
        outputChannel?.append(output);
    }
}
function getWaitOnExitValue(presentationOptions, configurationProperties) {
    if ((presentationOptions.close === undefined) || (presentationOptions.close === false)) {
        if ((presentationOptions.reveal !== RevealKind.Never) || !configurationProperties.isBackground || (presentationOptions.close === false)) {
            if (presentationOptions.panel === PanelKind.New) {
                return taskShellIntegrationWaitOnExitSequence(nls.localize('closeTerminal', 'Press any key to close the terminal.'));
            }
            else if (presentationOptions.showReuseMessage) {
                return taskShellIntegrationWaitOnExitSequence(nls.localize('reuseTerminal', 'Terminal will be reused by tasks, press any key to close it.'));
            }
            else {
                return true;
            }
        }
    }
    return !presentationOptions.close;
}
function taskShellIntegrationWaitOnExitSequence(message) {
    return (exitCode) => {
        return `${VSCodeSequence("D" /* VSCodeOscPt.CommandFinished */, exitCode.toString())}${message}`;
    };
}
function getReconnectionData(terminal) {
    return terminal.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties?.data;
}
