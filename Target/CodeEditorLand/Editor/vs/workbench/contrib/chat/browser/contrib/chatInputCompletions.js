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
var BuiltinDynamicCompletions_1, VariableCompletions_1;
import { isPatternInWord } from '../../../../../base/common/filters.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../../../base/common/map.js';
import { generateUuid } from '../../../../../base/common/uuid.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { getWordAtText } from '../../../../../editor/common/core/wordHelper.js';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.js';
import { localize } from '../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { Extensions as WorkbenchExtensions } from '../../../../common/contributions.js';
import { IHistoryService } from '../../../../services/history/common/history.js';
import { QueryBuilder } from '../../../../services/search/common/queryBuilder.js';
import { ISearchService } from '../../../../services/search/common/search.js';
import { ChatAgentLocation, IChatAgentNameService, IChatAgentService, getFullyQualifiedId } from '../../common/chatAgents.js';
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestTextPart, ChatRequestToolPart, ChatRequestVariablePart, chatAgentLeader, chatSubcommandLeader, chatVariableLeader } from '../../common/chatParserTypes.js';
import { IChatSlashCommandService } from '../../common/chatSlashCommands.js';
import { IChatVariablesService } from '../../common/chatVariables.js';
import { ILanguageModelToolsService } from '../../common/languageModelToolsService.js';
import { SubmitAction } from '../actions/chatExecuteActions.js';
import { IChatWidgetService } from '../chat.js';
import { ChatInputPart } from '../chatInputPart.js';
import { ChatDynamicVariableModel, SelectAndInsertFileAction } from './chatDynamicVariables.js';
let SlashCommandCompletions = class SlashCommandCompletions extends Disposable {
    constructor(languageFeaturesService, chatWidgetService, chatSlashCommandService) {
        super();
        this.languageFeaturesService = languageFeaturesService;
        this.chatWidgetService = chatWidgetService;
        this.chatSlashCommandService = chatSlashCommandService;
        this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
            _debugDisplayName: 'globalSlashCommands',
            triggerCharacters: ['/'],
            provideCompletionItems: async (model, position, _context, _token) => {
                const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                if (!widget || !widget.viewModel) {
                    return null;
                }
                const range = computeCompletionRanges(model, position, /\/\w*/g);
                if (!range) {
                    return null;
                }
                const parsedRequest = widget.parsedInput.parts;
                const usedAgent = parsedRequest.find(p => p instanceof ChatRequestAgentPart);
                if (usedAgent) {
                    // No (classic) global slash commands when an agent is used
                    return;
                }
                const slashCommands = this.chatSlashCommandService.getCommands(widget.location);
                if (!slashCommands) {
                    return null;
                }
                return {
                    suggestions: slashCommands.map((c, i) => {
                        const withSlash = `/${c.command}`;
                        return {
                            label: withSlash,
                            insertText: c.executeImmediately ? '' : `${withSlash} `,
                            detail: c.detail,
                            range: new Range(1, 1, 1, 1),
                            sortText: c.sortText ?? 'a'.repeat(i + 1),
                            kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway,
                            command: c.executeImmediately ? { id: SubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : undefined,
                        };
                    })
                };
            }
        }));
        this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
            _debugDisplayName: 'globalSlashCommandsAt',
            triggerCharacters: ['@'],
            provideCompletionItems: async (model, position, _context, _token) => {
                const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                if (!widget || !widget.viewModel) {
                    return null;
                }
                const range = computeCompletionRanges(model, position, /@\w*/g);
                if (!range) {
                    return null;
                }
                const slashCommands = this.chatSlashCommandService.getCommands(widget.location);
                if (!slashCommands) {
                    return null;
                }
                return {
                    suggestions: slashCommands.map((c, i) => {
                        const withSlash = `${chatSubcommandLeader}${c.command}`;
                        return {
                            label: withSlash,
                            insertText: c.executeImmediately ? '' : `${withSlash} `,
                            detail: c.detail,
                            range: new Range(1, 1, 1, 1),
                            filterText: `${chatAgentLeader}${c.command}`,
                            sortText: c.sortText ?? 'z'.repeat(i + 1),
                            kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway,
                            command: c.executeImmediately ? { id: SubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : undefined,
                        };
                    })
                };
            }
        }));
    }
};
SlashCommandCompletions = __decorate([
    __param(0, ILanguageFeaturesService),
    __param(1, IChatWidgetService),
    __param(2, IChatSlashCommandService),
    __metadata("design:paramtypes", [Object, Object, Object])
], SlashCommandCompletions);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(SlashCommandCompletions, 4 /* LifecyclePhase.Eventually */);
let AgentCompletions = class AgentCompletions extends Disposable {
    constructor(languageFeaturesService, chatWidgetService, chatAgentService, chatAgentNameService) {
        super();
        this.languageFeaturesService = languageFeaturesService;
        this.chatWidgetService = chatWidgetService;
        this.chatAgentService = chatAgentService;
        this.chatAgentNameService = chatAgentNameService;
        const subCommandProvider = {
            _debugDisplayName: 'chatAgentSubcommand',
            triggerCharacters: ['/'],
            provideCompletionItems: async (model, position, _context, token) => {
                const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                if (!widget || !widget.viewModel) {
                    return;
                }
                const range = computeCompletionRanges(model, position, /\/\w*/g);
                if (!range) {
                    return null;
                }
                const parsedRequest = widget.parsedInput.parts;
                const usedAgentIdx = parsedRequest.findIndex((p) => p instanceof ChatRequestAgentPart);
                if (usedAgentIdx < 0) {
                    return;
                }
                const usedSubcommand = parsedRequest.find(p => p instanceof ChatRequestAgentSubcommandPart);
                if (usedSubcommand) {
                    // Only one allowed
                    return;
                }
                for (const partAfterAgent of parsedRequest.slice(usedAgentIdx + 1)) {
                    // Could allow text after 'position'
                    if (!(partAfterAgent instanceof ChatRequestTextPart) || !partAfterAgent.text.trim().match(/^(\/\w*)?$/)) {
                        // No text allowed between agent and subcommand
                        return;
                    }
                }
                const usedAgent = parsedRequest[usedAgentIdx];
                return {
                    suggestions: usedAgent.agent.slashCommands.map((c, i) => {
                        const withSlash = `/${c.name}`;
                        return {
                            label: withSlash,
                            insertText: `${withSlash} `,
                            detail: c.description,
                            range,
                            kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                        };
                    })
                };
            }
        };
        this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, subCommandProvider));
        this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
            _debugDisplayName: 'chatAgentAndSubcommand',
            triggerCharacters: ['@', '/'],
            provideCompletionItems: async (model, position, _context, token) => {
                const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                const viewModel = widget?.viewModel;
                if (!widget || !viewModel) {
                    return;
                }
                const range = computeCompletionRanges(model, position, /(@|\/)\w*/g);
                if (!range) {
                    return null;
                }
                const preceedingChar = position.column > 1 ?
                    model.getValueInRange(new Range(position.lineNumber, position.column - 1, position.lineNumber, position.column)) :
                    '@';
                const agents = this.chatAgentService.getAgents()
                    .filter(a => a.locations.includes(widget.location));
                // When the input is only `/`, items are sorted by sortText.
                // When typing, filterText is used to score and sort.
                // The same list is refiltered/ranked while typing.
                const getFilterText = (agent, command) => {
                    // This is hacking the filter algorithm to make @terminal /explain match worse than @workspace /explain by making its match index later in the string.
                    // When I type `/exp`, the workspace one should be sorted over the terminal one.
                    const dummyPrefix = agent.id === 'github.copilot.terminalPanel' ? `0000` : ``;
                    return `${preceedingChar}${dummyPrefix}${agent.name}.${command}`;
                };
                const justAgents = agents
                    .filter(a => !a.isDefault)
                    .map(agent => {
                    const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
                    const detail = agent.description;
                    return {
                        label: isDupe ?
                            { label: agentLabel, description: agent.description, detail: ` (${agent.publisherDisplayName})` } :
                            agentLabel,
                        detail,
                        filterText: `${preceedingChar}${agent.name}`,
                        insertText: `${agentLabel} `,
                        range: new Range(1, 1, 1, 1),
                        kind: 18 /* CompletionItemKind.Text */,
                        sortText: `${chatAgentLeader}${agent.name}`,
                        command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] },
                    };
                });
                return {
                    suggestions: justAgents.concat(agents.flatMap(agent => agent.slashCommands.map((c, i) => {
                        const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
                        const label = `${agentLabel} ${chatSubcommandLeader}${c.name}`;
                        const item = {
                            label: isDupe ?
                                { label, description: c.description, detail: isDupe ? ` (${agent.publisherDisplayName})` : undefined } :
                                label,
                            detail: c.description,
                            filterText: getFilterText(agent, c.name),
                            commitCharacters: [' '],
                            insertText: label + ' ',
                            range: new Range(1, 1, 1, 1),
                            kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                            sortText: `x${chatAgentLeader}${agent.name}${c.name}`,
                            command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] },
                        };
                        if (agent.isDefault) {
                            // default agent isn't mentioned nor inserted
                            const label = `${chatSubcommandLeader}${c.name}`;
                            item.label = label;
                            item.insertText = `${label} `;
                            item.detail = c.description;
                        }
                        return item;
                    })))
                };
            }
        }));
    }
    getAgentCompletionDetails(agent) {
        const isAllowed = this.chatAgentNameService.getAgentNameRestriction(agent);
        const agentLabel = `${chatAgentLeader}${isAllowed ? agent.name : getFullyQualifiedId(agent)}`;
        const isDupe = isAllowed && this.chatAgentService.agentHasDupeName(agent.id);
        return { label: agentLabel, isDupe };
    }
};
AgentCompletions = __decorate([
    __param(0, ILanguageFeaturesService),
    __param(1, IChatWidgetService),
    __param(2, IChatAgentService),
    __param(3, IChatAgentNameService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AgentCompletions);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(AgentCompletions, 4 /* LifecyclePhase.Eventually */);
class AssignSelectedAgentAction extends Action2 {
    static { this.ID = 'workbench.action.chat.assignSelectedAgent'; }
    constructor() {
        super({
            id: AssignSelectedAgentAction.ID,
            title: '' // not displayed
        });
    }
    async run(accessor, ...args) {
        const arg = args[0];
        if (!arg || !arg.widget || !arg.agent) {
            return;
        }
        arg.widget.lastSelectedAgent = arg.agent;
    }
}
registerAction2(AssignSelectedAgentAction);
class ReferenceArgument {
    constructor(widget, variable) {
        this.widget = widget;
        this.variable = variable;
    }
}
let BuiltinDynamicCompletions = class BuiltinDynamicCompletions extends Disposable {
    static { BuiltinDynamicCompletions_1 = this; }
    static { this.addReferenceCommand = '_addReferenceCmd'; }
    static { this.VariableNameDef = new RegExp(`${chatVariableLeader}\\w*`, 'g'); } // MUST be using `g`-flag
    constructor(historyService, workspaceContextService, searchService, labelService, languageFeaturesService, chatWidgetService, instantiationService) {
        super();
        this.historyService = historyService;
        this.workspaceContextService = workspaceContextService;
        this.searchService = searchService;
        this.labelService = labelService;
        this.languageFeaturesService = languageFeaturesService;
        this.chatWidgetService = chatWidgetService;
        this.instantiationService = instantiationService;
        this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
            _debugDisplayName: 'chatDynamicCompletions',
            triggerCharacters: [chatVariableLeader],
            provideCompletionItems: async (model, position, _context, token) => {
                const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                if (!widget || !widget.supportsFileReferences) {
                    return null;
                }
                const result = { suggestions: [] };
                const range = computeCompletionRanges(model, position, BuiltinDynamicCompletions_1.VariableNameDef, true);
                if (range) {
                    const afterRange = new Range(position.lineNumber, range.replace.startColumn, position.lineNumber, range.replace.startColumn + '#file:'.length);
                    result.suggestions.push({
                        label: `${chatVariableLeader}file`,
                        insertText: `${chatVariableLeader}file:`,
                        detail: localize('pickFileLabel', "Pick a file"),
                        range,
                        kind: 18 /* CompletionItemKind.Text */,
                        command: { id: SelectAndInsertFileAction.ID, title: SelectAndInsertFileAction.ID, arguments: [{ widget, range: afterRange }] },
                        sortText: 'z'
                    });
                }
                const range2 = computeCompletionRanges(model, position, new RegExp(`${chatVariableLeader}[^\\s]*`, 'g'), true);
                if (range2) {
                    await this.addFileEntries(widget, result, range2, token);
                }
                return result;
            }
        }));
        this._register(CommandsRegistry.registerCommand(BuiltinDynamicCompletions_1.addReferenceCommand, (_services, arg) => this.cmdAddReference(arg)));
        this.queryBuilder = this.instantiationService.createInstance(QueryBuilder);
    }
    async addFileEntries(widget, result, info, token) {
        const makeFileCompletionItem = (resource) => {
            const basename = this.labelService.getUriBasenameLabel(resource);
            const text = `${chatVariableLeader}file:${basename}`;
            return {
                label: { label: basename, description: this.labelService.getUriLabel(resource, { relative: true }) },
                filterText: `${chatVariableLeader}${basename}`,
                insertText: info.varWord?.endColumn === info.replace.endColumn ? `${text} ` : text,
                range: info,
                kind: 20 /* CompletionItemKind.File */,
                sortText: '{', // after `z`
                command: {
                    id: BuiltinDynamicCompletions_1.addReferenceCommand, title: '', arguments: [new ReferenceArgument(widget, {
                            id: 'vscode.file',
                            range: { startLineNumber: info.replace.startLineNumber, startColumn: info.replace.startColumn, endLineNumber: info.replace.endLineNumber, endColumn: info.replace.startColumn + text.length },
                            data: resource
                        })]
                }
            };
        };
        let pattern;
        if (info.varWord?.word && info.varWord.word.startsWith(chatVariableLeader)) {
            pattern = info.varWord.word.toLowerCase().slice(1); // remove leading #
        }
        const seen = new ResourceSet();
        const len = result.suggestions.length;
        // HISTORY
        // always take the last N items
        for (const item of this.historyService.getHistory()) {
            if (!item.resource || !this.workspaceContextService.getWorkspaceFolder(item.resource)) {
                // ignore "forgein" editors
                continue;
            }
            if (pattern) {
                // use pattern if available
                const basename = this.labelService.getUriBasenameLabel(item.resource).toLowerCase();
                if (!isPatternInWord(pattern, 0, pattern.length, basename, 0, basename.length)) {
                    continue;
                }
            }
            seen.add(item.resource);
            const newLen = result.suggestions.push(makeFileCompletionItem(item.resource));
            if (newLen - len >= 5) {
                break;
            }
        }
        // SEARCH
        // use file search when having a pattern
        if (pattern) {
            if (this.cacheKey && Date.now() - this.cacheKey.time > 60000) {
                this.searchService.clearCache(this.cacheKey.key);
                this.cacheKey = undefined;
            }
            if (!this.cacheKey) {
                this.cacheKey = {
                    key: generateUuid(),
                    time: Date.now()
                };
            }
            this.cacheKey.time = Date.now();
            const query = this.queryBuilder.file(this.workspaceContextService.getWorkspace().folders, {
                filePattern: pattern,
                sortByScore: true,
                maxResults: 250,
                cacheKey: this.cacheKey.key
            });
            const data = await this.searchService.fileSearch(query, token);
            for (const match of data.results) {
                if (seen.has(match.resource)) {
                    // already included via history
                    continue;
                }
                result.suggestions.push(makeFileCompletionItem(match.resource));
            }
        }
        // mark results as incomplete because further typing might yield
        // in more search results
        result.incomplete = true;
    }
    cmdAddReference(arg) {
        // invoked via the completion command
        arg.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference(arg.variable);
    }
};
BuiltinDynamicCompletions = BuiltinDynamicCompletions_1 = __decorate([
    __param(0, IHistoryService),
    __param(1, IWorkspaceContextService),
    __param(2, ISearchService),
    __param(3, ILabelService),
    __param(4, ILanguageFeaturesService),
    __param(5, IChatWidgetService),
    __param(6, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], BuiltinDynamicCompletions);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(BuiltinDynamicCompletions, 4 /* LifecyclePhase.Eventually */);
export function computeCompletionRanges(model, position, reg, onlyOnWordStart = false) {
    const varWord = getWordAtText(position.column, reg, model.getLineContent(position.lineNumber), 0);
    if (!varWord && model.getWordUntilPosition(position).word) {
        // inside a "normal" word
        return;
    }
    if (!varWord && position.column > 1) {
        const textBefore = model.getValueInRange(new Range(position.lineNumber, position.column - 1, position.lineNumber, position.column));
        if (textBefore !== ' ') {
            return;
        }
    }
    if (varWord && onlyOnWordStart) {
        const wordBefore = model.getWordUntilPosition({ lineNumber: position.lineNumber, column: varWord.startColumn });
        if (wordBefore.word) {
            // inside a word
            return;
        }
    }
    let insert;
    let replace;
    if (!varWord) {
        insert = replace = Range.fromPositions(position);
    }
    else {
        insert = new Range(position.lineNumber, varWord.startColumn, position.lineNumber, position.column);
        replace = new Range(position.lineNumber, varWord.startColumn, position.lineNumber, varWord.endColumn);
    }
    return { insert, replace, varWord };
}
let VariableCompletions = class VariableCompletions extends Disposable {
    static { VariableCompletions_1 = this; }
    static { this.VariableNameDef = new RegExp(`(?<=^|\\s)${chatVariableLeader}\\w*`, 'g'); } // MUST be using `g`-flag
    constructor(languageFeaturesService, chatWidgetService, chatVariablesService, configService, toolsService) {
        super();
        this.languageFeaturesService = languageFeaturesService;
        this.chatWidgetService = chatWidgetService;
        this.chatVariablesService = chatVariablesService;
        this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
            _debugDisplayName: 'chatVariables',
            triggerCharacters: [chatVariableLeader],
            provideCompletionItems: async (model, position, _context, _token) => {
                const locations = new Set();
                locations.add(ChatAgentLocation.Panel);
                locations.add(ChatAgentLocation.EditingSession);
                for (const value of Object.values(ChatAgentLocation)) {
                    if (typeof value === 'string' && configService.getValue(`chat.experimental.variables.${value}`)) {
                        locations.add(value);
                    }
                }
                const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                if (!widget || !locations.has(widget.location)) {
                    return null;
                }
                const range = computeCompletionRanges(model, position, VariableCompletions_1.VariableNameDef, true);
                if (!range) {
                    return null;
                }
                const usedAgent = widget.parsedInput.parts.find(p => p instanceof ChatRequestAgentPart);
                const slowSupported = usedAgent ? usedAgent.agent.metadata.supportsSlowVariables : true;
                const usedVariables = widget.parsedInput.parts.filter((p) => p instanceof ChatRequestVariablePart);
                const usedVariableNames = new Set(usedVariables.map(v => v.variableName));
                const variableItems = Array.from(this.chatVariablesService.getVariables(widget.location))
                    // This doesn't look at dynamic variables like `file`, where multiple makes sense.
                    .filter(v => !usedVariableNames.has(v.name))
                    .filter(v => !v.isSlow || slowSupported)
                    .map((v) => {
                    const withLeader = `${chatVariableLeader}${v.name}`;
                    return {
                        label: withLeader,
                        range,
                        insertText: withLeader + ' ',
                        detail: v.description,
                        kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                        sortText: 'z'
                    };
                });
                const usedTools = widget.parsedInput.parts.filter((p) => p instanceof ChatRequestToolPart);
                const usedToolNames = new Set(usedTools.map(v => v.toolName));
                const toolItems = [];
                if (!usedAgent || usedAgent.agent.supportsToolReferences) {
                    toolItems.push(...Array.from(toolsService.getTools())
                        .filter(t => t.canBeInvokedManually)
                        .filter(t => !usedToolNames.has(t.name ?? ''))
                        .map((t) => {
                        const withLeader = `${chatVariableLeader}${t.name}`;
                        return {
                            label: withLeader,
                            range,
                            insertText: withLeader + ' ',
                            detail: t.userDescription,
                            kind: 18 /* CompletionItemKind.Text */,
                            sortText: 'z'
                        };
                    }));
                }
                return {
                    suggestions: [...variableItems, ...toolItems]
                };
            }
        }));
    }
};
VariableCompletions = VariableCompletions_1 = __decorate([
    __param(0, ILanguageFeaturesService),
    __param(1, IChatWidgetService),
    __param(2, IChatVariablesService),
    __param(3, IConfigurationService),
    __param(4, ILanguageModelToolsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], VariableCompletions);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(VariableCompletions, 4 /* LifecyclePhase.Eventually */);
