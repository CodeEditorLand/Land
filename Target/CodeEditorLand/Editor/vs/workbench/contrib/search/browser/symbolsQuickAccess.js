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
var SymbolsQuickAccessProvider_1;
import { localize } from '../../../../nls.js';
import { PickerQuickAccessProvider, TriggerAction } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { ThrottledDelayer } from '../../../../base/common/async.js';
import { getWorkspaceSymbols } from '../common/search.js';
import { SymbolKinds } from '../../../../editor/common/languages.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { Schemas } from '../../../../base/common/network.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService, SIDE_GROUP, ACTIVE_GROUP } from '../../../services/editor/common/editorService.js';
import { Range } from '../../../../editor/common/core/range.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { getSelectionSearchString } from '../../../../editor/contrib/find/browser/findController.js';
import { prepareQuery, scoreFuzzy2, pieceToQuery } from '../../../../base/common/fuzzyScorer.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
let SymbolsQuickAccessProvider = class SymbolsQuickAccessProvider extends PickerQuickAccessProvider {
    static { SymbolsQuickAccessProvider_1 = this; }
    static { this.PREFIX = '#'; }
    static { this.TYPING_SEARCH_DELAY = 200; } // this delay accommodates for the user typing a word and then stops typing to start searching
    static { this.TREAT_AS_GLOBAL_SYMBOL_TYPES = new Set([
        4 /* SymbolKind.Class */,
        9 /* SymbolKind.Enum */,
        0 /* SymbolKind.File */,
        10 /* SymbolKind.Interface */,
        2 /* SymbolKind.Namespace */,
        3 /* SymbolKind.Package */,
        1 /* SymbolKind.Module */
    ]); }
    get defaultFilterValue() {
        // Prefer the word under the cursor in the active editor as default filter
        const editor = this.codeEditorService.getFocusedCodeEditor();
        if (editor) {
            return getSelectionSearchString(editor) ?? undefined;
        }
        return undefined;
    }
    constructor(labelService, openerService, editorService, configurationService, codeEditorService) {
        super(SymbolsQuickAccessProvider_1.PREFIX, {
            canAcceptInBackground: true,
            noResultsPick: {
                label: localize('noSymbolResults', "No matching workspace symbols")
            }
        });
        this.labelService = labelService;
        this.openerService = openerService;
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.codeEditorService = codeEditorService;
        this.delayer = this._register(new ThrottledDelayer(SymbolsQuickAccessProvider_1.TYPING_SEARCH_DELAY));
    }
    get configuration() {
        const editorConfig = this.configurationService.getValue().workbench?.editor;
        return {
            openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
            openSideBySideDirection: editorConfig?.openSideBySideDirection
        };
    }
    _getPicks(filter, disposables, token) {
        return this.getSymbolPicks(filter, undefined, token);
    }
    async getSymbolPicks(filter, options, token) {
        return this.delayer.trigger(async () => {
            if (token.isCancellationRequested) {
                return [];
            }
            return this.doGetSymbolPicks(prepareQuery(filter), options, token);
        }, options?.delay);
    }
    async doGetSymbolPicks(query, options, token) {
        // Split between symbol and container query
        let symbolQuery;
        let containerQuery;
        if (query.values && query.values.length > 1) {
            symbolQuery = pieceToQuery(query.values[0]); // symbol: only match on first part
            containerQuery = pieceToQuery(query.values.slice(1)); // container: match on all but first parts
        }
        else {
            symbolQuery = query;
        }
        // Run the workspace symbol query
        const workspaceSymbols = await getWorkspaceSymbols(symbolQuery.original, token);
        if (token.isCancellationRequested) {
            return [];
        }
        const symbolPicks = [];
        // Convert to symbol picks and apply filtering
        const openSideBySideDirection = this.configuration.openSideBySideDirection;
        for (const { symbol, provider } of workspaceSymbols) {
            // Depending on the workspace symbols filter setting, skip over symbols that:
            // - do not have a container
            // - and are not treated explicitly as global symbols (e.g. classes)
            if (options?.skipLocal && !SymbolsQuickAccessProvider_1.TREAT_AS_GLOBAL_SYMBOL_TYPES.has(symbol.kind) && !!symbol.containerName) {
                continue;
            }
            const symbolLabel = symbol.name;
            const symbolLabelWithIcon = `$(${SymbolKinds.toIcon(symbol.kind).id}) ${symbolLabel}`;
            const symbolLabelIconOffset = symbolLabelWithIcon.length - symbolLabel.length;
            // Score by symbol label if searching
            let symbolScore = undefined;
            let symbolMatches = undefined;
            let skipContainerQuery = false;
            if (symbolQuery.original.length > 0) {
                // First: try to score on the entire query, it is possible that
                // the symbol matches perfectly (e.g. searching for "change log"
                // can be a match on a markdown symbol "change log"). In that
                // case we want to skip the container query altogether.
                if (symbolQuery !== query) {
                    [symbolScore, symbolMatches] = scoreFuzzy2(symbolLabelWithIcon, { ...query, values: undefined /* disable multi-query support */ }, 0, symbolLabelIconOffset);
                    if (typeof symbolScore === 'number') {
                        skipContainerQuery = true; // since we consumed the query, skip any container matching
                    }
                }
                // Otherwise: score on the symbol query and match on the container later
                if (typeof symbolScore !== 'number') {
                    [symbolScore, symbolMatches] = scoreFuzzy2(symbolLabelWithIcon, symbolQuery, 0, symbolLabelIconOffset);
                    if (typeof symbolScore !== 'number') {
                        continue;
                    }
                }
            }
            const symbolUri = symbol.location.uri;
            let containerLabel = undefined;
            if (symbolUri) {
                const containerPath = this.labelService.getUriLabel(symbolUri, { relative: true });
                if (symbol.containerName) {
                    containerLabel = `${symbol.containerName} • ${containerPath}`;
                }
                else {
                    containerLabel = containerPath;
                }
            }
            // Score by container if specified and searching
            let containerScore = undefined;
            let containerMatches = undefined;
            if (!skipContainerQuery && containerQuery && containerQuery.original.length > 0) {
                if (containerLabel) {
                    [containerScore, containerMatches] = scoreFuzzy2(containerLabel, containerQuery);
                }
                if (typeof containerScore !== 'number') {
                    continue;
                }
                if (typeof symbolScore === 'number') {
                    symbolScore += containerScore; // boost symbolScore by containerScore
                }
            }
            const deprecated = symbol.tags ? symbol.tags.indexOf(1 /* SymbolTag.Deprecated */) >= 0 : false;
            symbolPicks.push({
                symbol,
                resource: symbolUri,
                score: symbolScore,
                label: symbolLabelWithIcon,
                ariaLabel: symbolLabel,
                highlights: deprecated ? undefined : {
                    label: symbolMatches,
                    description: containerMatches
                },
                description: containerLabel,
                strikethrough: deprecated,
                buttons: [
                    {
                        iconClass: openSideBySideDirection === 'right' ? ThemeIcon.asClassName(Codicon.splitHorizontal) : ThemeIcon.asClassName(Codicon.splitVertical),
                        tooltip: openSideBySideDirection === 'right' ? localize('openToSide', "Open to the Side") : localize('openToBottom', "Open to the Bottom")
                    }
                ],
                trigger: (buttonIndex, keyMods) => {
                    this.openSymbol(provider, symbol, token, { keyMods, forceOpenSideBySide: true });
                    return TriggerAction.CLOSE_PICKER;
                },
                accept: async (keyMods, event) => this.openSymbol(provider, symbol, token, { keyMods, preserveFocus: event.inBackground, forcePinned: event.inBackground }),
            });
        }
        // Sort picks (unless disabled)
        if (!options?.skipSorting) {
            symbolPicks.sort((symbolA, symbolB) => this.compareSymbols(symbolA, symbolB));
        }
        return symbolPicks;
    }
    async openSymbol(provider, symbol, token, options) {
        // Resolve actual symbol to open for providers that can resolve
        let symbolToOpen = symbol;
        if (typeof provider.resolveWorkspaceSymbol === 'function') {
            symbolToOpen = await provider.resolveWorkspaceSymbol(symbol, token) || symbol;
            if (token.isCancellationRequested) {
                return;
            }
        }
        // Open HTTP(s) links with opener service
        if (symbolToOpen.location.uri.scheme === Schemas.http || symbolToOpen.location.uri.scheme === Schemas.https) {
            await this.openerService.open(symbolToOpen.location.uri, { fromUserGesture: true, allowContributedOpeners: true });
        }
        // Otherwise open as editor
        else {
            await this.editorService.openEditor({
                resource: symbolToOpen.location.uri,
                options: {
                    preserveFocus: options?.preserveFocus,
                    pinned: options.keyMods.ctrlCmd || options.forcePinned || this.configuration.openEditorPinned,
                    selection: symbolToOpen.location.range ? Range.collapseToStart(symbolToOpen.location.range) : undefined
                }
            }, options.keyMods.alt || (this.configuration.openEditorPinned && options.keyMods.ctrlCmd) || options?.forceOpenSideBySide ? SIDE_GROUP : ACTIVE_GROUP);
        }
    }
    compareSymbols(symbolA, symbolB) {
        // By score
        if (typeof symbolA.score === 'number' && typeof symbolB.score === 'number') {
            if (symbolA.score > symbolB.score) {
                return -1;
            }
            if (symbolA.score < symbolB.score) {
                return 1;
            }
        }
        // By name
        if (symbolA.symbol && symbolB.symbol) {
            const symbolAName = symbolA.symbol.name.toLowerCase();
            const symbolBName = symbolB.symbol.name.toLowerCase();
            const res = symbolAName.localeCompare(symbolBName);
            if (res !== 0) {
                return res;
            }
        }
        // By kind
        if (symbolA.symbol && symbolB.symbol) {
            const symbolAKind = SymbolKinds.toIcon(symbolA.symbol.kind).id;
            const symbolBKind = SymbolKinds.toIcon(symbolB.symbol.kind).id;
            return symbolAKind.localeCompare(symbolBKind);
        }
        return 0;
    }
};
SymbolsQuickAccessProvider = SymbolsQuickAccessProvider_1 = __decorate([
    __param(0, ILabelService),
    __param(1, IOpenerService),
    __param(2, IEditorService),
    __param(3, IConfigurationService),
    __param(4, ICodeEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], SymbolsQuickAccessProvider);
export { SymbolsQuickAccessProvider };
