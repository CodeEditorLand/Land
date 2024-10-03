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
var AbstractCommandsQuickAccessProvider_1, CommandsHistory_1;
import { toErrorMessage } from '../../../base/common/errorMessage.js';
import { isCancellationError } from '../../../base/common/errors.js';
import { matchesContiguousSubString, matchesPrefix, matchesWords, or } from '../../../base/common/filters.js';
import { createSingleCallFunction } from '../../../base/common/functional.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { LRUCache } from '../../../base/common/map.js';
import { TfIdfCalculator, normalizeTfIdfScores } from '../../../base/common/tfIdf.js';
import { localize } from '../../../nls.js';
import { ICommandService } from '../../commands/common/commands.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IDialogService } from '../../dialogs/common/dialogs.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { ILogService } from '../../log/common/log.js';
import { PickerQuickAccessProvider } from './pickerQuickAccess.js';
import { IStorageService, WillSaveStateReason } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
let AbstractCommandsQuickAccessProvider = class AbstractCommandsQuickAccessProvider extends PickerQuickAccessProvider {
    static { AbstractCommandsQuickAccessProvider_1 = this; }
    static { this.PREFIX = '>'; }
    static { this.TFIDF_THRESHOLD = 0.5; }
    static { this.TFIDF_MAX_RESULTS = 5; }
    static { this.WORD_FILTER = or(matchesPrefix, matchesWords, matchesContiguousSubString); }
    constructor(options, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
        super(AbstractCommandsQuickAccessProvider_1.PREFIX, options);
        this.instantiationService = instantiationService;
        this.keybindingService = keybindingService;
        this.commandService = commandService;
        this.telemetryService = telemetryService;
        this.dialogService = dialogService;
        this.commandsHistory = this._register(this.instantiationService.createInstance(CommandsHistory));
        this.options = options;
    }
    async _getPicks(filter, _disposables, token, runOptions) {
        const allCommandPicks = await this.getCommandPicks(token);
        if (token.isCancellationRequested) {
            return [];
        }
        const runTfidf = createSingleCallFunction(() => {
            const tfidf = new TfIdfCalculator();
            tfidf.updateDocuments(allCommandPicks.map(commandPick => ({
                key: commandPick.commandId,
                textChunks: [this.getTfIdfChunk(commandPick)]
            })));
            const result = tfidf.calculateScores(filter, token);
            return normalizeTfIdfScores(result)
                .filter(score => score.score > AbstractCommandsQuickAccessProvider_1.TFIDF_THRESHOLD)
                .slice(0, AbstractCommandsQuickAccessProvider_1.TFIDF_MAX_RESULTS);
        });
        const filteredCommandPicks = [];
        for (const commandPick of allCommandPicks) {
            const labelHighlights = AbstractCommandsQuickAccessProvider_1.WORD_FILTER(filter, commandPick.label) ?? undefined;
            const aliasHighlights = commandPick.commandAlias ? AbstractCommandsQuickAccessProvider_1.WORD_FILTER(filter, commandPick.commandAlias) ?? undefined : undefined;
            if (labelHighlights || aliasHighlights) {
                commandPick.highlights = {
                    label: labelHighlights,
                    detail: this.options.showAlias ? aliasHighlights : undefined
                };
                filteredCommandPicks.push(commandPick);
            }
            else if (filter === commandPick.commandId) {
                filteredCommandPicks.push(commandPick);
            }
            else if (filter.length >= 3) {
                const tfidf = runTfidf();
                if (token.isCancellationRequested) {
                    return [];
                }
                const tfidfScore = tfidf.find(score => score.key === commandPick.commandId);
                if (tfidfScore) {
                    commandPick.tfIdfScore = tfidfScore.score;
                    filteredCommandPicks.push(commandPick);
                }
            }
        }
        const mapLabelToCommand = new Map();
        for (const commandPick of filteredCommandPicks) {
            const existingCommandForLabel = mapLabelToCommand.get(commandPick.label);
            if (existingCommandForLabel) {
                commandPick.description = commandPick.commandId;
                existingCommandForLabel.description = existingCommandForLabel.commandId;
            }
            else {
                mapLabelToCommand.set(commandPick.label, commandPick);
            }
        }
        filteredCommandPicks.sort((commandPickA, commandPickB) => {
            if (commandPickA.tfIdfScore && commandPickB.tfIdfScore) {
                if (commandPickA.tfIdfScore === commandPickB.tfIdfScore) {
                    return commandPickA.label.localeCompare(commandPickB.label);
                }
                return commandPickB.tfIdfScore - commandPickA.tfIdfScore;
            }
            else if (commandPickA.tfIdfScore) {
                return 1;
            }
            else if (commandPickB.tfIdfScore) {
                return -1;
            }
            const commandACounter = this.commandsHistory.peek(commandPickA.commandId);
            const commandBCounter = this.commandsHistory.peek(commandPickB.commandId);
            if (commandACounter && commandBCounter) {
                return commandACounter > commandBCounter ? -1 : 1;
            }
            if (commandACounter) {
                return -1;
            }
            if (commandBCounter) {
                return 1;
            }
            if (this.options.suggestedCommandIds) {
                const commandASuggestion = this.options.suggestedCommandIds.has(commandPickA.commandId);
                const commandBSuggestion = this.options.suggestedCommandIds.has(commandPickB.commandId);
                if (commandASuggestion && commandBSuggestion) {
                    return 0;
                }
                if (commandASuggestion) {
                    return -1;
                }
                if (commandBSuggestion) {
                    return 1;
                }
            }
            return commandPickA.label.localeCompare(commandPickB.label);
        });
        const commandPicks = [];
        let addOtherSeparator = false;
        let addSuggestedSeparator = true;
        let addCommonlyUsedSeparator = !!this.options.suggestedCommandIds;
        for (let i = 0; i < filteredCommandPicks.length; i++) {
            const commandPick = filteredCommandPicks[i];
            if (i === 0 && this.commandsHistory.peek(commandPick.commandId)) {
                commandPicks.push({ type: 'separator', label: localize('recentlyUsed', "recently used") });
                addOtherSeparator = true;
            }
            if (addSuggestedSeparator && commandPick.tfIdfScore !== undefined) {
                commandPicks.push({ type: 'separator', label: localize('suggested', "similar commands") });
                addSuggestedSeparator = false;
            }
            if (addCommonlyUsedSeparator && commandPick.tfIdfScore === undefined && !this.commandsHistory.peek(commandPick.commandId) && this.options.suggestedCommandIds?.has(commandPick.commandId)) {
                commandPicks.push({ type: 'separator', label: localize('commonlyUsed', "commonly used") });
                addOtherSeparator = true;
                addCommonlyUsedSeparator = false;
            }
            if (addOtherSeparator && commandPick.tfIdfScore === undefined && !this.commandsHistory.peek(commandPick.commandId) && !this.options.suggestedCommandIds?.has(commandPick.commandId)) {
                commandPicks.push({ type: 'separator', label: localize('morecCommands', "other commands") });
                addOtherSeparator = false;
            }
            commandPicks.push(this.toCommandPick(commandPick, runOptions));
        }
        if (!this.hasAdditionalCommandPicks(filter, token)) {
            return commandPicks;
        }
        return {
            picks: commandPicks,
            additionalPicks: (async () => {
                const additionalCommandPicks = await this.getAdditionalCommandPicks(allCommandPicks, filteredCommandPicks, filter, token);
                if (token.isCancellationRequested) {
                    return [];
                }
                const commandPicks = additionalCommandPicks.map(commandPick => this.toCommandPick(commandPick, runOptions));
                if (addSuggestedSeparator && commandPicks[0]?.type !== 'separator') {
                    commandPicks.unshift({ type: 'separator', label: localize('suggested', "similar commands") });
                }
                return commandPicks;
            })()
        };
    }
    toCommandPick(commandPick, runOptions) {
        if (commandPick.type === 'separator') {
            return commandPick;
        }
        const keybinding = this.keybindingService.lookupKeybinding(commandPick.commandId);
        const ariaLabel = keybinding ?
            localize('commandPickAriaLabelWithKeybinding', "{0}, {1}", commandPick.label, keybinding.getAriaLabel()) :
            commandPick.label;
        return {
            ...commandPick,
            ariaLabel,
            detail: this.options.showAlias && commandPick.commandAlias !== commandPick.label ? commandPick.commandAlias : undefined,
            keybinding,
            accept: async () => {
                this.commandsHistory.push(commandPick.commandId);
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: commandPick.commandId,
                    from: runOptions?.from ?? 'quick open'
                });
                try {
                    commandPick.args?.length
                        ? await this.commandService.executeCommand(commandPick.commandId, ...commandPick.args)
                        : await this.commandService.executeCommand(commandPick.commandId);
                }
                catch (error) {
                    if (!isCancellationError(error)) {
                        this.dialogService.error(localize('canNotRun', "Command '{0}' resulted in an error", commandPick.label), toErrorMessage(error));
                    }
                }
            }
        };
    }
    getTfIdfChunk({ label, commandAlias, commandDescription }) {
        let chunk = label;
        if (commandAlias && commandAlias !== label) {
            chunk += ` - ${commandAlias}`;
        }
        if (commandDescription && commandDescription.value !== label) {
            chunk += ` - ${commandDescription.value === commandDescription.original ? commandDescription.value : `${commandDescription.value} (${commandDescription.original})`}`;
        }
        return chunk;
    }
};
AbstractCommandsQuickAccessProvider = AbstractCommandsQuickAccessProvider_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IKeybindingService),
    __param(3, ICommandService),
    __param(4, ITelemetryService),
    __param(5, IDialogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], AbstractCommandsQuickAccessProvider);
export { AbstractCommandsQuickAccessProvider };
let CommandsHistory = class CommandsHistory extends Disposable {
    static { CommandsHistory_1 = this; }
    static { this.DEFAULT_COMMANDS_HISTORY_LENGTH = 50; }
    static { this.PREF_KEY_CACHE = 'commandPalette.mru.cache'; }
    static { this.PREF_KEY_COUNTER = 'commandPalette.mru.counter'; }
    static { this.counter = 1; }
    static { this.hasChanges = false; }
    constructor(storageService, configurationService, logService) {
        super();
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.logService = logService;
        this.configuredCommandsHistoryLength = 0;
        this.updateConfiguration();
        this.load();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => this.updateConfiguration(e)));
        this._register(this.storageService.onWillSaveState(e => {
            if (e.reason === WillSaveStateReason.SHUTDOWN) {
                this.saveState();
            }
        }));
    }
    updateConfiguration(e) {
        if (e && !e.affectsConfiguration('workbench.commandPalette.history')) {
            return;
        }
        this.configuredCommandsHistoryLength = CommandsHistory_1.getConfiguredCommandHistoryLength(this.configurationService);
        if (CommandsHistory_1.cache && CommandsHistory_1.cache.limit !== this.configuredCommandsHistoryLength) {
            CommandsHistory_1.cache.limit = this.configuredCommandsHistoryLength;
            CommandsHistory_1.hasChanges = true;
        }
    }
    load() {
        const raw = this.storageService.get(CommandsHistory_1.PREF_KEY_CACHE, 0);
        let serializedCache;
        if (raw) {
            try {
                serializedCache = JSON.parse(raw);
            }
            catch (error) {
                this.logService.error(`[CommandsHistory] invalid data: ${error}`);
            }
        }
        const cache = CommandsHistory_1.cache = new LRUCache(this.configuredCommandsHistoryLength, 1);
        if (serializedCache) {
            let entries;
            if (serializedCache.usesLRU) {
                entries = serializedCache.entries;
            }
            else {
                entries = serializedCache.entries.sort((a, b) => a.value - b.value);
            }
            entries.forEach(entry => cache.set(entry.key, entry.value));
        }
        CommandsHistory_1.counter = this.storageService.getNumber(CommandsHistory_1.PREF_KEY_COUNTER, 0, CommandsHistory_1.counter);
    }
    push(commandId) {
        if (!CommandsHistory_1.cache) {
            return;
        }
        CommandsHistory_1.cache.set(commandId, CommandsHistory_1.counter++);
        CommandsHistory_1.hasChanges = true;
    }
    peek(commandId) {
        return CommandsHistory_1.cache?.peek(commandId);
    }
    saveState() {
        if (!CommandsHistory_1.cache) {
            return;
        }
        if (!CommandsHistory_1.hasChanges) {
            return;
        }
        const serializedCache = { usesLRU: true, entries: [] };
        CommandsHistory_1.cache.forEach((value, key) => serializedCache.entries.push({ key, value }));
        this.storageService.store(CommandsHistory_1.PREF_KEY_CACHE, JSON.stringify(serializedCache), 0, 0);
        this.storageService.store(CommandsHistory_1.PREF_KEY_COUNTER, CommandsHistory_1.counter, 0, 0);
        CommandsHistory_1.hasChanges = false;
    }
    static getConfiguredCommandHistoryLength(configurationService) {
        const config = configurationService.getValue();
        const configuredCommandHistoryLength = config.workbench?.commandPalette?.history;
        if (typeof configuredCommandHistoryLength === 'number') {
            return configuredCommandHistoryLength;
        }
        return CommandsHistory_1.DEFAULT_COMMANDS_HISTORY_LENGTH;
    }
    static clearHistory(configurationService, storageService) {
        const commandHistoryLength = CommandsHistory_1.getConfiguredCommandHistoryLength(configurationService);
        CommandsHistory_1.cache = new LRUCache(commandHistoryLength);
        CommandsHistory_1.counter = 1;
        CommandsHistory_1.hasChanges = true;
    }
};
CommandsHistory = CommandsHistory_1 = __decorate([
    __param(0, IStorageService),
    __param(1, IConfigurationService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], CommandsHistory);
export { CommandsHistory };
