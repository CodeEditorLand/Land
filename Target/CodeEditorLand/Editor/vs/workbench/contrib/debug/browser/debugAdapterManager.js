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
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import Severity from '../../../../base/common/severity.js';
import * as strings from '../../../../base/common/strings.js';
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import * as nls from '../../../../nls.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Extensions as JSONExtensions } from '../../../../platform/jsonschemas/common/jsonContributionRegistry.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Breakpoints } from '../common/breakpoints.js';
import { CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_EXTENSION_AVAILABLE, INTERNAL_CONSOLE_OPTIONS_SCHEMA } from '../common/debug.js';
import { Debugger } from '../common/debugger.js';
import { breakpointsExtPoint, debuggersExtPoint, launchSchema, presentationSchema } from '../common/debugSchemas.js';
import { TaskDefinitionRegistry } from '../../tasks/common/taskDefinitionRegistry.js';
import { ITaskService } from '../../tasks/common/taskService.js';
import { launchSchemaId } from '../../../services/configuration/common/configuration.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
const jsonRegistry = Registry.as(JSONExtensions.JSONContribution);
let AdapterManager = class AdapterManager extends Disposable {
    constructor(delegate, editorService, configurationService, quickInputService, instantiationService, commandService, extensionService, contextKeyService, languageService, dialogService, lifecycleService, tasksService, menuService) {
        super();
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.quickInputService = quickInputService;
        this.instantiationService = instantiationService;
        this.commandService = commandService;
        this.extensionService = extensionService;
        this.contextKeyService = contextKeyService;
        this.languageService = languageService;
        this.dialogService = dialogService;
        this.lifecycleService = lifecycleService;
        this.tasksService = tasksService;
        this.menuService = menuService;
        this.debugAdapterFactories = new Map();
        this._onDidRegisterDebugger = new Emitter();
        this._onDidDebuggersExtPointRead = new Emitter();
        this.breakpointContributions = [];
        this.debuggerWhenKeys = new Set();
        this.taskLabels = [];
        this.usedDebugTypes = new Set();
        this.adapterDescriptorFactories = [];
        this.debuggers = [];
        this.registerListeners();
        this.contextKeyService.bufferChangeEvents(() => {
            this.debuggersAvailable = CONTEXT_DEBUGGERS_AVAILABLE.bindTo(contextKeyService);
            this.debugExtensionsAvailable = CONTEXT_DEBUG_EXTENSION_AVAILABLE.bindTo(contextKeyService);
        });
        this._register(this.contextKeyService.onDidChangeContext(e => {
            if (e.affectsSome(this.debuggerWhenKeys)) {
                this.debuggersAvailable.set(this.hasEnabledDebuggers());
                this.updateDebugAdapterSchema();
            }
        }));
        this._register(this.onDidDebuggersExtPointRead(() => {
            this.debugExtensionsAvailable.set(this.debuggers.length > 0);
        }));
        // generous debounce since this will end up calling `resolveTask` internally
        const updateTaskScheduler = this._register(new RunOnceScheduler(() => this.updateTaskLabels(), 5000));
        this._register(Event.any(tasksService.onDidChangeTaskConfig, tasksService.onDidChangeTaskProviders)(() => {
            updateTaskScheduler.cancel();
            updateTaskScheduler.schedule();
        }));
        this.lifecycleService.when(4 /* LifecyclePhase.Eventually */)
            .then(() => this.debugExtensionsAvailable.set(this.debuggers.length > 0)); // If no extensions with a debugger contribution are loaded
        this._register(delegate.onDidNewSession(s => {
            this.usedDebugTypes.add(s.configuration.type);
        }));
        updateTaskScheduler.schedule();
    }
    registerListeners() {
        debuggersExtPoint.setHandler((extensions, delta) => {
            delta.added.forEach(added => {
                added.value.forEach(rawAdapter => {
                    if (!rawAdapter.type || (typeof rawAdapter.type !== 'string')) {
                        added.collector.error(nls.localize('debugNoType', "Debugger 'type' can not be omitted and must be of type 'string'."));
                    }
                    if (rawAdapter.type !== '*') {
                        const existing = this.getDebugger(rawAdapter.type);
                        if (existing) {
                            existing.merge(rawAdapter, added.description);
                        }
                        else {
                            const dbg = this.instantiationService.createInstance(Debugger, this, rawAdapter, added.description);
                            dbg.when?.keys().forEach(key => this.debuggerWhenKeys.add(key));
                            this.debuggers.push(dbg);
                        }
                    }
                });
            });
            // take care of all wildcard contributions
            extensions.forEach(extension => {
                extension.value.forEach(rawAdapter => {
                    if (rawAdapter.type === '*') {
                        this.debuggers.forEach(dbg => dbg.merge(rawAdapter, extension.description));
                    }
                });
            });
            delta.removed.forEach(removed => {
                const removedTypes = removed.value.map(rawAdapter => rawAdapter.type);
                this.debuggers = this.debuggers.filter(d => removedTypes.indexOf(d.type) === -1);
            });
            this.updateDebugAdapterSchema();
            this._onDidDebuggersExtPointRead.fire();
        });
        breakpointsExtPoint.setHandler(extensions => {
            this.breakpointContributions = extensions.flatMap(ext => ext.value.map(breakpoint => this.instantiationService.createInstance(Breakpoints, breakpoint)));
        });
    }
    updateTaskLabels() {
        this.tasksService.getKnownTasks().then(tasks => {
            this.taskLabels = tasks.map(task => task._label);
            this.updateDebugAdapterSchema();
        });
    }
    updateDebugAdapterSchema() {
        // update the schema to include all attributes, snippets and types from extensions.
        const items = launchSchema.properties['configurations'].items;
        const taskSchema = TaskDefinitionRegistry.getJsonSchema();
        const definitions = {
            'common': {
                properties: {
                    'name': {
                        type: 'string',
                        description: nls.localize('debugName', "Name of configuration; appears in the launch configuration dropdown menu."),
                        default: 'Launch'
                    },
                    'debugServer': {
                        type: 'number',
                        description: nls.localize('debugServer', "For debug extension development only: if a port is specified VS Code tries to connect to a debug adapter running in server mode"),
                        default: 4711
                    },
                    'preLaunchTask': {
                        anyOf: [taskSchema, {
                                type: ['string']
                            }],
                        default: '',
                        defaultSnippets: [{ body: { task: '', type: '' } }],
                        description: nls.localize('debugPrelaunchTask', "Task to run before debug session starts."),
                        examples: this.taskLabels,
                    },
                    'postDebugTask': {
                        anyOf: [taskSchema, {
                                type: ['string'],
                            }],
                        default: '',
                        defaultSnippets: [{ body: { task: '', type: '' } }],
                        description: nls.localize('debugPostDebugTask', "Task to run after debug session ends."),
                        examples: this.taskLabels,
                    },
                    'presentation': presentationSchema,
                    'internalConsoleOptions': INTERNAL_CONSOLE_OPTIONS_SCHEMA,
                    'suppressMultipleSessionWarning': {
                        type: 'boolean',
                        description: nls.localize('suppressMultipleSessionWarning', "Disable the warning when trying to start the same debug configuration more than once."),
                        default: true
                    }
                }
            }
        };
        launchSchema.definitions = definitions;
        items.oneOf = [];
        items.defaultSnippets = [];
        this.debuggers.forEach(adapter => {
            const schemaAttributes = adapter.getSchemaAttributes(definitions);
            if (schemaAttributes && items.oneOf) {
                items.oneOf.push(...schemaAttributes);
            }
            const configurationSnippets = adapter.configurationSnippets;
            if (configurationSnippets && items.defaultSnippets) {
                items.defaultSnippets.push(...configurationSnippets);
            }
        });
        jsonRegistry.registerSchema(launchSchemaId, launchSchema);
    }
    registerDebugAdapterFactory(debugTypes, debugAdapterLauncher) {
        debugTypes.forEach(debugType => this.debugAdapterFactories.set(debugType, debugAdapterLauncher));
        this.debuggersAvailable.set(this.hasEnabledDebuggers());
        this._onDidRegisterDebugger.fire();
        return {
            dispose: () => {
                debugTypes.forEach(debugType => this.debugAdapterFactories.delete(debugType));
            }
        };
    }
    hasEnabledDebuggers() {
        for (const [type] of this.debugAdapterFactories) {
            const dbg = this.getDebugger(type);
            if (dbg && dbg.enabled) {
                return true;
            }
        }
        return false;
    }
    createDebugAdapter(session) {
        const factory = this.debugAdapterFactories.get(session.configuration.type);
        if (factory) {
            return factory.createDebugAdapter(session);
        }
        return undefined;
    }
    substituteVariables(debugType, folder, config) {
        const factory = this.debugAdapterFactories.get(debugType);
        if (factory) {
            return factory.substituteVariables(folder, config);
        }
        return Promise.resolve(config);
    }
    runInTerminal(debugType, args, sessionId) {
        const factory = this.debugAdapterFactories.get(debugType);
        if (factory) {
            return factory.runInTerminal(args, sessionId);
        }
        return Promise.resolve(void 0);
    }
    registerDebugAdapterDescriptorFactory(debugAdapterProvider) {
        this.adapterDescriptorFactories.push(debugAdapterProvider);
        return {
            dispose: () => {
                this.unregisterDebugAdapterDescriptorFactory(debugAdapterProvider);
            }
        };
    }
    unregisterDebugAdapterDescriptorFactory(debugAdapterProvider) {
        const ix = this.adapterDescriptorFactories.indexOf(debugAdapterProvider);
        if (ix >= 0) {
            this.adapterDescriptorFactories.splice(ix, 1);
        }
    }
    getDebugAdapterDescriptor(session) {
        const config = session.configuration;
        const providers = this.adapterDescriptorFactories.filter(p => p.type === config.type && p.createDebugAdapterDescriptor);
        if (providers.length === 1) {
            return providers[0].createDebugAdapterDescriptor(session);
        }
        else {
            // TODO@AW handle n > 1 case
        }
        return Promise.resolve(undefined);
    }
    getDebuggerLabel(type) {
        const dbgr = this.getDebugger(type);
        if (dbgr) {
            return dbgr.label;
        }
        return undefined;
    }
    get onDidRegisterDebugger() {
        return this._onDidRegisterDebugger.event;
    }
    get onDidDebuggersExtPointRead() {
        return this._onDidDebuggersExtPointRead.event;
    }
    canSetBreakpointsIn(model) {
        const languageId = model.getLanguageId();
        if (!languageId || languageId === 'jsonc' || languageId === 'log') {
            // do not allow breakpoints in our settings files and output
            return false;
        }
        if (this.configurationService.getValue('debug').allowBreakpointsEverywhere) {
            return true;
        }
        return this.breakpointContributions.some(breakpoints => breakpoints.language === languageId && breakpoints.enabled);
    }
    getDebugger(type) {
        return this.debuggers.find(dbg => strings.equalsIgnoreCase(dbg.type, type));
    }
    getEnabledDebugger(type) {
        const adapter = this.getDebugger(type);
        return adapter && adapter.enabled ? adapter : undefined;
    }
    someDebuggerInterestedInLanguage(languageId) {
        return !!this.debuggers
            .filter(d => d.enabled)
            .find(a => a.interestedInLanguage(languageId));
    }
    async guessDebugger(gettingConfigurations) {
        const activeTextEditorControl = this.editorService.activeTextEditorControl;
        let candidates = [];
        let languageLabel = null;
        let model = null;
        if (isCodeEditor(activeTextEditorControl)) {
            model = activeTextEditorControl.getModel();
            const language = model ? model.getLanguageId() : undefined;
            if (language) {
                languageLabel = this.languageService.getLanguageName(language);
            }
            const adapters = this.debuggers
                .filter(a => a.enabled)
                .filter(a => language && a.interestedInLanguage(language));
            if (adapters.length === 1) {
                return adapters[0];
            }
            if (adapters.length > 1) {
                candidates = adapters;
            }
        }
        // We want to get the debuggers that have configuration providers in the case we are fetching configurations
        // Or if a breakpoint can be set in the current file (good hint that an extension can handle it)
        if ((!languageLabel || gettingConfigurations || (model && this.canSetBreakpointsIn(model))) && candidates.length === 0) {
            await this.activateDebuggers('onDebugInitialConfigurations');
            candidates = this.debuggers
                .filter(a => a.enabled)
                .filter(dbg => dbg.hasInitialConfiguration() || dbg.hasDynamicConfigurationProviders() || dbg.hasConfigurationProvider());
        }
        if (candidates.length === 0 && languageLabel) {
            if (languageLabel.indexOf(' ') >= 0) {
                languageLabel = `'${languageLabel}'`;
            }
            const { confirmed } = await this.dialogService.confirm({
                type: Severity.Warning,
                message: nls.localize('CouldNotFindLanguage', "You don't have an extension for debugging {0}. Should we find a {0} extension in the Marketplace?", languageLabel),
                primaryButton: nls.localize({ key: 'findExtension', comment: ['&& denotes a mnemonic'] }, "&&Find {0} extension", languageLabel)
            });
            if (confirmed) {
                await this.commandService.executeCommand('debug.installAdditionalDebuggers', languageLabel);
            }
            return undefined;
        }
        this.initExtensionActivationsIfNeeded();
        candidates.sort((first, second) => first.label.localeCompare(second.label));
        candidates = candidates.filter(a => !a.isHiddenFromDropdown);
        const suggestedCandidates = [];
        const otherCandidates = [];
        candidates.forEach(d => {
            const descriptor = d.getMainExtensionDescriptor();
            if (descriptor.id && !!this.earlyActivatedExtensions?.has(descriptor.id)) {
                // Was activated early
                suggestedCandidates.push(d);
            }
            else if (this.usedDebugTypes.has(d.type)) {
                // Was used already
                suggestedCandidates.push(d);
            }
            else {
                otherCandidates.push(d);
            }
        });
        const picks = [];
        if (suggestedCandidates.length > 0) {
            picks.push({ type: 'separator', label: nls.localize('suggestedDebuggers', "Suggested") }, ...suggestedCandidates.map(c => ({ label: c.label, debugger: c })));
        }
        if (otherCandidates.length > 0) {
            if (picks.length > 0) {
                picks.push({ type: 'separator', label: '' });
            }
            picks.push(...otherCandidates.map(c => ({ label: c.label, debugger: c })));
        }
        picks.push({ type: 'separator', label: '' }, { label: languageLabel ? nls.localize('installLanguage', "Install an extension for {0}...", languageLabel) : nls.localize('installExt', "Install extension...") });
        const contributed = this.menuService.getMenuActions(MenuId.DebugCreateConfiguration, this.contextKeyService);
        for (const [, action] of contributed) {
            for (const item of action) {
                picks.push(item);
            }
        }
        const placeHolder = nls.localize('selectDebug', "Select debugger");
        return this.quickInputService.pick(picks, { activeItem: picks[0], placeHolder })
            .then(async (picked) => {
            if (picked && 'debugger' in picked && picked.debugger) {
                return picked.debugger;
            }
            else if (picked instanceof MenuItemAction) {
                picked.run();
                return;
            }
            if (picked) {
                this.commandService.executeCommand('debug.installAdditionalDebuggers', languageLabel);
            }
            return undefined;
        });
    }
    initExtensionActivationsIfNeeded() {
        if (!this.earlyActivatedExtensions) {
            this.earlyActivatedExtensions = new Set();
            const status = this.extensionService.getExtensionsStatus();
            for (const id in status) {
                if (!!status[id].activationTimes) {
                    this.earlyActivatedExtensions.add(id);
                }
            }
        }
    }
    async activateDebuggers(activationEvent, debugType) {
        this.initExtensionActivationsIfNeeded();
        const promises = [
            this.extensionService.activateByEvent(activationEvent),
            this.extensionService.activateByEvent('onDebug')
        ];
        if (debugType) {
            promises.push(this.extensionService.activateByEvent(`${activationEvent}:${debugType}`));
        }
        await Promise.all(promises);
    }
};
AdapterManager = __decorate([
    __param(1, IEditorService),
    __param(2, IConfigurationService),
    __param(3, IQuickInputService),
    __param(4, IInstantiationService),
    __param(5, ICommandService),
    __param(6, IExtensionService),
    __param(7, IContextKeyService),
    __param(8, ILanguageService),
    __param(9, IDialogService),
    __param(10, ILifecycleService),
    __param(11, ITaskService),
    __param(12, IMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AdapterManager);
export { AdapterManager };
