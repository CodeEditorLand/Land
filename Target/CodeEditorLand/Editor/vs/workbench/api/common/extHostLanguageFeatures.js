/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { asArray, coalesce, isFalsyOrEmpty, isNonEmptyArray } from '../../../base/common/arrays.js';
import { raceCancellationError } from '../../../base/common/async.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { NotImplementedError, isCancellationError } from '../../../base/common/errors.js';
import { IdGenerator } from '../../../base/common/idGenerator.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { equals, mixin } from '../../../base/common/objects.js';
import { StopWatch } from '../../../base/common/stopwatch.js';
import { regExpLeadsToEndlessLoop } from '../../../base/common/strings.js';
import { assertType, isObject } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { Range as EditorRange } from '../../../editor/common/core/range.js';
import { Selection } from '../../../editor/common/core/selection.js';
import * as languages from '../../../editor/common/languages.js';
import { encodeSemanticTokensDto } from '../../../editor/common/services/semanticTokensDto.js';
import { localize } from '../../../nls.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import * as typeConvert from './extHostTypeConverters.js';
import { CodeActionKind, CompletionList, Disposable, DocumentDropOrPasteEditKind, DocumentSymbol, InlineCompletionTriggerKind, InlineEditTriggerKind, InternalDataTransferItem, Location, NewSymbolNameTriggerKind, Range, SemanticTokens, SemanticTokensEdit, SemanticTokensEdits, SnippetString, SyntaxTokenType } from './extHostTypes.js';
import { checkProposedApiEnabled, isProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { Cache } from './cache.js';
import * as extHostProtocol from './extHost.protocol.js';
// --- adapter
class DocumentSymbolAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideDocumentSymbols(resource, token) {
        const doc = this._documents.getDocument(resource);
        const value = await this._provider.provideDocumentSymbols(doc, token);
        if (isFalsyOrEmpty(value)) {
            return undefined;
        }
        else if (value[0] instanceof DocumentSymbol) {
            return value.map(typeConvert.DocumentSymbol.from);
        }
        else {
            return DocumentSymbolAdapter._asDocumentSymbolTree(value);
        }
    }
    static _asDocumentSymbolTree(infos) {
        // first sort by start (and end) and then loop over all elements
        // and build a tree based on containment.
        infos = infos.slice(0).sort((a, b) => {
            let res = a.location.range.start.compareTo(b.location.range.start);
            if (res === 0) {
                res = b.location.range.end.compareTo(a.location.range.end);
            }
            return res;
        });
        const res = [];
        const parentStack = [];
        for (const info of infos) {
            const element = {
                name: info.name || '!!MISSING: name!!',
                kind: typeConvert.SymbolKind.from(info.kind),
                tags: info.tags?.map(typeConvert.SymbolTag.from) || [],
                detail: '',
                containerName: info.containerName,
                range: typeConvert.Range.from(info.location.range),
                selectionRange: typeConvert.Range.from(info.location.range),
                children: []
            };
            while (true) {
                if (parentStack.length === 0) {
                    parentStack.push(element);
                    res.push(element);
                    break;
                }
                const parent = parentStack[parentStack.length - 1];
                if (EditorRange.containsRange(parent.range, element.range) && !EditorRange.equalsRange(parent.range, element.range)) {
                    parent.children?.push(element);
                    parentStack.push(element);
                    break;
                }
                parentStack.pop();
            }
        }
        return res;
    }
}
class CodeLensAdapter {
    constructor(_documents, _commands, _provider, _extension, _extTelemetry, _logService) {
        this._documents = _documents;
        this._commands = _commands;
        this._provider = _provider;
        this._extension = _extension;
        this._extTelemetry = _extTelemetry;
        this._logService = _logService;
        this._cache = new Cache('CodeLens');
        this._disposables = new Map();
    }
    async provideCodeLenses(resource, token) {
        const doc = this._documents.getDocument(resource);
        const lenses = await this._provider.provideCodeLenses(doc, token);
        if (!lenses || token.isCancellationRequested) {
            return undefined;
        }
        const cacheId = this._cache.add(lenses);
        const disposables = new DisposableStore();
        this._disposables.set(cacheId, disposables);
        const result = {
            cacheId,
            lenses: [],
        };
        for (let i = 0; i < lenses.length; i++) {
            result.lenses.push({
                cacheId: [cacheId, i],
                range: typeConvert.Range.from(lenses[i].range),
                command: this._commands.toInternal(lenses[i].command, disposables)
            });
        }
        return result;
    }
    async resolveCodeLens(symbol, token) {
        const lens = symbol.cacheId && this._cache.get(...symbol.cacheId);
        if (!lens) {
            return undefined;
        }
        let resolvedLens;
        if (typeof this._provider.resolveCodeLens !== 'function' || lens.isResolved) {
            resolvedLens = lens;
        }
        else {
            resolvedLens = await this._provider.resolveCodeLens(lens, token);
        }
        if (!resolvedLens) {
            resolvedLens = lens;
        }
        if (token.isCancellationRequested) {
            return undefined;
        }
        const disposables = symbol.cacheId && this._disposables.get(symbol.cacheId[0]);
        if (!disposables) {
            // disposed in the meantime
            return undefined;
        }
        if (!resolvedLens.command) {
            const error = new Error('INVALID code lens resolved, lacks command: ' + this._extension.identifier.value);
            this._extTelemetry.onExtensionError(this._extension.identifier, error);
            this._logService.error(error);
            return undefined;
        }
        symbol.command = this._commands.toInternal(resolvedLens.command, disposables);
        return symbol;
    }
    releaseCodeLenses(cachedId) {
        this._disposables.get(cachedId)?.dispose();
        this._disposables.delete(cachedId);
        this._cache.delete(cachedId);
    }
}
function convertToLocationLinks(value) {
    if (Array.isArray(value)) {
        return value.map(typeConvert.DefinitionLink.from);
    }
    else if (value) {
        return [typeConvert.DefinitionLink.from(value)];
    }
    return [];
}
class DefinitionAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideDefinition(resource, position, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideDefinition(doc, pos, token);
        return convertToLocationLinks(value);
    }
}
class DeclarationAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideDeclaration(resource, position, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideDeclaration(doc, pos, token);
        return convertToLocationLinks(value);
    }
}
class ImplementationAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideImplementation(resource, position, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideImplementation(doc, pos, token);
        return convertToLocationLinks(value);
    }
}
class TypeDefinitionAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideTypeDefinition(resource, position, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideTypeDefinition(doc, pos, token);
        return convertToLocationLinks(value);
    }
}
class HoverAdapter {
    static { this.HOVER_MAP_MAX_SIZE = 10; }
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
        this._hoverCounter = 0;
        this._hoverMap = new Map();
    }
    async provideHover(resource, position, context, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        let value;
        if (context && context.verbosityRequest) {
            const previousHoverId = context.verbosityRequest.previousHover.id;
            const previousHover = this._hoverMap.get(previousHoverId);
            if (!previousHover) {
                throw new Error(`Hover with id ${previousHoverId} not found`);
            }
            const hoverContext = { verbosityDelta: context.verbosityRequest.verbosityDelta, previousHover };
            value = await this._provider.provideHover(doc, pos, token, hoverContext);
        }
        else {
            value = await this._provider.provideHover(doc, pos, token);
        }
        if (!value || isFalsyOrEmpty(value.contents)) {
            return undefined;
        }
        if (!value.range) {
            value.range = doc.getWordRangeAtPosition(pos);
        }
        if (!value.range) {
            value.range = new Range(pos, pos);
        }
        const convertedHover = typeConvert.Hover.from(value);
        const id = this._hoverCounter;
        // Check if hover map has more than 10 elements and if yes, remove oldest from the map
        if (this._hoverMap.size === HoverAdapter.HOVER_MAP_MAX_SIZE) {
            const minimumId = Math.min(...this._hoverMap.keys());
            this._hoverMap.delete(minimumId);
        }
        this._hoverMap.set(id, value);
        this._hoverCounter += 1;
        const hover = {
            ...convertedHover,
            id
        };
        return hover;
    }
    releaseHover(id) {
        this._hoverMap.delete(id);
    }
}
class EvaluatableExpressionAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideEvaluatableExpression(resource, position, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideEvaluatableExpression(doc, pos, token);
        if (value) {
            return typeConvert.EvaluatableExpression.from(value);
        }
        return undefined;
    }
}
class InlineValuesAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideInlineValues(resource, viewPort, context, token) {
        const doc = this._documents.getDocument(resource);
        const value = await this._provider.provideInlineValues(doc, typeConvert.Range.to(viewPort), typeConvert.InlineValueContext.to(context), token);
        if (Array.isArray(value)) {
            return value.map(iv => typeConvert.InlineValue.from(iv));
        }
        return undefined;
    }
}
class DocumentHighlightAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideDocumentHighlights(resource, position, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideDocumentHighlights(doc, pos, token);
        if (Array.isArray(value)) {
            return value.map(typeConvert.DocumentHighlight.from);
        }
        return undefined;
    }
}
class MultiDocumentHighlightAdapter {
    constructor(_documents, _provider, _logService) {
        this._documents = _documents;
        this._provider = _provider;
        this._logService = _logService;
    }
    async provideMultiDocumentHighlights(resource, position, otherResources, token) {
        const doc = this._documents.getDocument(resource);
        const otherDocuments = otherResources.map(r => {
            try {
                return this._documents.getDocument(r);
            }
            catch (err) {
                this._logService.error('Error: Unable to retrieve document from URI: ' + r + '. Error message: ' + err);
                return undefined;
            }
        }).filter(doc => doc !== undefined);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideMultiDocumentHighlights(doc, pos, otherDocuments, token);
        if (Array.isArray(value)) {
            return value.map(typeConvert.MultiDocumentHighlight.from);
        }
        return undefined;
    }
}
class LinkedEditingRangeAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideLinkedEditingRanges(resource, position, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideLinkedEditingRanges(doc, pos, token);
        if (value && Array.isArray(value.ranges)) {
            return {
                ranges: coalesce(value.ranges.map(typeConvert.Range.from)),
                wordPattern: value.wordPattern
            };
        }
        return undefined;
    }
}
class ReferenceAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideReferences(resource, position, context, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideReferences(doc, pos, context, token);
        if (Array.isArray(value)) {
            return value.map(typeConvert.location.from);
        }
        return undefined;
    }
}
class CodeActionAdapter {
    static { this._maxCodeActionsPerFile = 1000; }
    constructor(_documents, _commands, _diagnostics, _provider, _logService, _extension, _apiDeprecation) {
        this._documents = _documents;
        this._commands = _commands;
        this._diagnostics = _diagnostics;
        this._provider = _provider;
        this._logService = _logService;
        this._extension = _extension;
        this._apiDeprecation = _apiDeprecation;
        this._cache = new Cache('CodeAction');
        this._disposables = new Map();
    }
    async provideCodeActions(resource, rangeOrSelection, context, token) {
        const doc = this._documents.getDocument(resource);
        const ran = Selection.isISelection(rangeOrSelection)
            ? typeConvert.Selection.to(rangeOrSelection)
            : typeConvert.Range.to(rangeOrSelection);
        const allDiagnostics = [];
        for (const diagnostic of this._diagnostics.getDiagnostics(resource)) {
            if (ran.intersection(diagnostic.range)) {
                const newLen = allDiagnostics.push(diagnostic);
                if (newLen > CodeActionAdapter._maxCodeActionsPerFile) {
                    break;
                }
            }
        }
        const codeActionContext = {
            diagnostics: allDiagnostics,
            only: context.only ? new CodeActionKind(context.only) : undefined,
            triggerKind: typeConvert.CodeActionTriggerKind.to(context.trigger),
        };
        const commandsOrActions = await this._provider.provideCodeActions(doc, ran, codeActionContext, token);
        if (!isNonEmptyArray(commandsOrActions) || token.isCancellationRequested) {
            return undefined;
        }
        const cacheId = this._cache.add(commandsOrActions);
        const disposables = new DisposableStore();
        this._disposables.set(cacheId, disposables);
        const actions = [];
        for (let i = 0; i < commandsOrActions.length; i++) {
            const candidate = commandsOrActions[i];
            if (!candidate) {
                continue;
            }
            if (CodeActionAdapter._isCommand(candidate)) {
                // old school: synthetic code action
                this._apiDeprecation.report('CodeActionProvider.provideCodeActions - return commands', this._extension, `Return 'CodeAction' instances instead.`);
                actions.push({
                    _isSynthetic: true,
                    title: candidate.title,
                    command: this._commands.toInternal(candidate, disposables),
                });
            }
            else {
                if (codeActionContext.only) {
                    if (!candidate.kind) {
                        this._logService.warn(`${this._extension.identifier.value} - Code actions of kind '${codeActionContext.only.value}' requested but returned code action does not have a 'kind'. Code action will be dropped. Please set 'CodeAction.kind'.`);
                    }
                    else if (!codeActionContext.only.contains(candidate.kind)) {
                        this._logService.warn(`${this._extension.identifier.value} - Code actions of kind '${codeActionContext.only.value}' requested but returned code action is of kind '${candidate.kind.value}'. Code action will be dropped. Please check 'CodeActionContext.only' to only return requested code actions.`);
                    }
                }
                // Ensures that this is either a Range[] or an empty array so we don't get Array<Range | undefined>
                const range = candidate.ranges ?? [];
                // new school: convert code action
                actions.push({
                    cacheId: [cacheId, i],
                    title: candidate.title,
                    command: candidate.command && this._commands.toInternal(candidate.command, disposables),
                    diagnostics: candidate.diagnostics && candidate.diagnostics.map(typeConvert.Diagnostic.from),
                    edit: candidate.edit && typeConvert.WorkspaceEdit.from(candidate.edit, undefined),
                    kind: candidate.kind && candidate.kind.value,
                    isPreferred: candidate.isPreferred,
                    isAI: isProposedApiEnabled(this._extension, 'codeActionAI') ? candidate.isAI : false,
                    ranges: isProposedApiEnabled(this._extension, 'codeActionRanges') ? coalesce(range.map(typeConvert.Range.from)) : undefined,
                    disabled: candidate.disabled?.reason
                });
            }
        }
        return { cacheId, actions };
    }
    async resolveCodeAction(id, token) {
        const [sessionId, itemId] = id;
        const item = this._cache.get(sessionId, itemId);
        if (!item || CodeActionAdapter._isCommand(item)) {
            return {}; // code actions only!
        }
        if (!this._provider.resolveCodeAction) {
            return {}; // this should not happen...
        }
        const resolvedItem = (await this._provider.resolveCodeAction(item, token)) ?? item;
        let resolvedEdit;
        if (resolvedItem.edit) {
            resolvedEdit = typeConvert.WorkspaceEdit.from(resolvedItem.edit, undefined);
        }
        let resolvedCommand;
        if (resolvedItem.command) {
            const disposables = this._disposables.get(sessionId);
            if (disposables) {
                resolvedCommand = this._commands.toInternal(resolvedItem.command, disposables);
            }
        }
        return { edit: resolvedEdit, command: resolvedCommand };
    }
    releaseCodeActions(cachedId) {
        this._disposables.get(cachedId)?.dispose();
        this._disposables.delete(cachedId);
        this._cache.delete(cachedId);
    }
    static _isCommand(thing) {
        return typeof thing.command === 'string' && typeof thing.title === 'string';
    }
}
class DocumentPasteEditProvider {
    constructor(_proxy, _documents, _provider, _handle, _extension) {
        this._proxy = _proxy;
        this._documents = _documents;
        this._provider = _provider;
        this._handle = _handle;
        this._extension = _extension;
        this._cache = new Cache('DocumentPasteEdit');
    }
    async prepareDocumentPaste(resource, ranges, dataTransferDto, token) {
        if (!this._provider.prepareDocumentPaste) {
            return;
        }
        const doc = this._documents.getDocument(resource);
        const vscodeRanges = ranges.map(range => typeConvert.Range.to(range));
        const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, () => {
            throw new NotImplementedError();
        });
        await this._provider.prepareDocumentPaste(doc, vscodeRanges, dataTransfer, token);
        if (token.isCancellationRequested) {
            return;
        }
        // Only send back values that have been added to the data transfer
        const entries = Array.from(dataTransfer).filter(([, value]) => !(value instanceof InternalDataTransferItem));
        return typeConvert.DataTransfer.from(entries);
    }
    async providePasteEdits(requestId, resource, ranges, dataTransferDto, context, token) {
        if (!this._provider.provideDocumentPasteEdits) {
            return [];
        }
        const doc = this._documents.getDocument(resource);
        const vscodeRanges = ranges.map(range => typeConvert.Range.to(range));
        const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, async (id) => {
            return (await this._proxy.$resolvePasteFileData(this._handle, requestId, id)).buffer;
        });
        const edits = await this._provider.provideDocumentPasteEdits(doc, vscodeRanges, dataTransfer, {
            only: context.only ? new DocumentDropOrPasteEditKind(context.only) : undefined,
            triggerKind: context.triggerKind,
        }, token);
        if (!edits || token.isCancellationRequested) {
            return [];
        }
        const cacheId = this._cache.add(edits);
        return edits.map((edit, i) => ({
            _cacheId: [cacheId, i],
            title: edit.title ?? localize('defaultPasteLabel', "Paste using '{0}' extension", this._extension.displayName || this._extension.name),
            kind: edit.kind,
            yieldTo: edit.yieldTo?.map(x => x.value),
            insertText: typeof edit.insertText === 'string' ? edit.insertText : { snippet: edit.insertText.value },
            additionalEdit: edit.additionalEdit ? typeConvert.WorkspaceEdit.from(edit.additionalEdit, undefined) : undefined,
        }));
    }
    async resolvePasteEdit(id, token) {
        const [sessionId, itemId] = id;
        const item = this._cache.get(sessionId, itemId);
        if (!item || !this._provider.resolveDocumentPasteEdit) {
            return {}; // this should not happen...
        }
        const resolvedItem = (await this._provider.resolveDocumentPasteEdit(item, token)) ?? item;
        const additionalEdit = resolvedItem.additionalEdit ? typeConvert.WorkspaceEdit.from(resolvedItem.additionalEdit, undefined) : undefined;
        return { additionalEdit };
    }
    releasePasteEdits(id) {
        this._cache.delete(id);
    }
}
class DocumentFormattingAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideDocumentFormattingEdits(resource, options, token) {
        const document = this._documents.getDocument(resource);
        const value = await this._provider.provideDocumentFormattingEdits(document, options, token);
        if (Array.isArray(value)) {
            return value.map(typeConvert.TextEdit.from);
        }
        return undefined;
    }
}
class RangeFormattingAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideDocumentRangeFormattingEdits(resource, range, options, token) {
        const document = this._documents.getDocument(resource);
        const ran = typeConvert.Range.to(range);
        const value = await this._provider.provideDocumentRangeFormattingEdits(document, ran, options, token);
        if (Array.isArray(value)) {
            return value.map(typeConvert.TextEdit.from);
        }
        return undefined;
    }
    async provideDocumentRangesFormattingEdits(resource, ranges, options, token) {
        assertType(typeof this._provider.provideDocumentRangesFormattingEdits === 'function', 'INVALID invocation of `provideDocumentRangesFormattingEdits`');
        const document = this._documents.getDocument(resource);
        const _ranges = ranges.map(typeConvert.Range.to);
        const value = await this._provider.provideDocumentRangesFormattingEdits(document, _ranges, options, token);
        if (Array.isArray(value)) {
            return value.map(typeConvert.TextEdit.from);
        }
        return undefined;
    }
}
class OnTypeFormattingAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
        this.autoFormatTriggerCharacters = []; // not here
    }
    async provideOnTypeFormattingEdits(resource, position, ch, options, token) {
        const document = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const value = await this._provider.provideOnTypeFormattingEdits(document, pos, ch, options, token);
        if (Array.isArray(value)) {
            return value.map(typeConvert.TextEdit.from);
        }
        return undefined;
    }
}
class NavigateTypeAdapter {
    constructor(_provider, _logService) {
        this._provider = _provider;
        this._logService = _logService;
        this._cache = new Cache('WorkspaceSymbols');
    }
    async provideWorkspaceSymbols(search, token) {
        const value = await this._provider.provideWorkspaceSymbols(search, token);
        if (!isNonEmptyArray(value)) {
            return { symbols: [] };
        }
        const sid = this._cache.add(value);
        const result = {
            cacheId: sid,
            symbols: []
        };
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (!item || !item.name) {
                this._logService.warn('INVALID SymbolInformation', item);
                continue;
            }
            result.symbols.push({
                ...typeConvert.WorkspaceSymbol.from(item),
                cacheId: [sid, i]
            });
        }
        return result;
    }
    async resolveWorkspaceSymbol(symbol, token) {
        if (typeof this._provider.resolveWorkspaceSymbol !== 'function') {
            return symbol;
        }
        if (!symbol.cacheId) {
            return symbol;
        }
        const item = this._cache.get(...symbol.cacheId);
        if (item) {
            const value = await this._provider.resolveWorkspaceSymbol(item, token);
            return value && mixin(symbol, typeConvert.WorkspaceSymbol.from(value), true);
        }
        return undefined;
    }
    releaseWorkspaceSymbols(id) {
        this._cache.delete(id);
    }
}
class RenameAdapter {
    static supportsResolving(provider) {
        return typeof provider.prepareRename === 'function';
    }
    constructor(_documents, _provider, _logService) {
        this._documents = _documents;
        this._provider = _provider;
        this._logService = _logService;
    }
    async provideRenameEdits(resource, position, newName, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        try {
            const value = await this._provider.provideRenameEdits(doc, pos, newName, token);
            if (!value) {
                return undefined;
            }
            return typeConvert.WorkspaceEdit.from(value);
        }
        catch (err) {
            const rejectReason = RenameAdapter._asMessage(err);
            if (rejectReason) {
                return { rejectReason, edits: undefined };
            }
            else {
                // generic error
                return Promise.reject(err);
            }
        }
    }
    async resolveRenameLocation(resource, position, token) {
        if (typeof this._provider.prepareRename !== 'function') {
            return Promise.resolve(undefined);
        }
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        try {
            const rangeOrLocation = await this._provider.prepareRename(doc, pos, token);
            let range;
            let text;
            if (Range.isRange(rangeOrLocation)) {
                range = rangeOrLocation;
                text = doc.getText(rangeOrLocation);
            }
            else if (isObject(rangeOrLocation)) {
                range = rangeOrLocation.range;
                text = rangeOrLocation.placeholder;
            }
            if (!range || !text) {
                return undefined;
            }
            if (range.start.line > pos.line || range.end.line < pos.line) {
                this._logService.warn('INVALID rename location: position line must be within range start/end lines');
                return undefined;
            }
            return { range: typeConvert.Range.from(range), text };
        }
        catch (err) {
            const rejectReason = RenameAdapter._asMessage(err);
            if (rejectReason) {
                return { rejectReason, range: undefined, text: undefined };
            }
            else {
                return Promise.reject(err);
            }
        }
    }
    static _asMessage(err) {
        if (typeof err === 'string') {
            return err;
        }
        else if (err instanceof Error && typeof err.message === 'string') {
            return err.message;
        }
        else {
            return undefined;
        }
    }
}
class NewSymbolNamesAdapter {
    static { this.languageTriggerKindToVSCodeTriggerKind = {
        [languages.NewSymbolNameTriggerKind.Invoke]: NewSymbolNameTriggerKind.Invoke,
        [languages.NewSymbolNameTriggerKind.Automatic]: NewSymbolNameTriggerKind.Automatic,
    }; }
    constructor(_documents, _provider, _logService) {
        this._documents = _documents;
        this._provider = _provider;
        this._logService = _logService;
    }
    async supportsAutomaticNewSymbolNamesTriggerKind() {
        return this._provider.supportsAutomaticTriggerKind;
    }
    async provideNewSymbolNames(resource, range, triggerKind, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Range.to(range);
        try {
            const kind = NewSymbolNamesAdapter.languageTriggerKindToVSCodeTriggerKind[triggerKind];
            const value = await this._provider.provideNewSymbolNames(doc, pos, kind, token);
            if (!value) {
                return undefined;
            }
            return value.map(v => typeof v === 'string' /* @ulugbekna: for backward compatibility because `value` used to be just `string[]` */
                ? { newSymbolName: v }
                : { newSymbolName: v.newSymbolName, tags: v.tags });
        }
        catch (err) {
            this._logService.error(NewSymbolNamesAdapter._asMessage(err) ?? JSON.stringify(err, null, '\t') /* @ulugbekna: assuming `err` doesn't have circular references that could result in an exception when converting to JSON */);
            return undefined;
        }
    }
    // @ulugbekna: this method is also defined in RenameAdapter but seems OK to be duplicated
    static _asMessage(err) {
        if (typeof err === 'string') {
            return err;
        }
        else if (err instanceof Error && typeof err.message === 'string') {
            return err.message;
        }
        else {
            return undefined;
        }
    }
}
class SemanticTokensPreviousResult {
    constructor(resultId, tokens) {
        this.resultId = resultId;
        this.tokens = tokens;
    }
}
class DocumentSemanticTokensAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
        this._nextResultId = 1;
        this._previousResults = new Map();
    }
    async provideDocumentSemanticTokens(resource, previousResultId, token) {
        const doc = this._documents.getDocument(resource);
        const previousResult = (previousResultId !== 0 ? this._previousResults.get(previousResultId) : null);
        let value = typeof previousResult?.resultId === 'string' && typeof this._provider.provideDocumentSemanticTokensEdits === 'function'
            ? await this._provider.provideDocumentSemanticTokensEdits(doc, previousResult.resultId, token)
            : await this._provider.provideDocumentSemanticTokens(doc, token);
        if (previousResult) {
            this._previousResults.delete(previousResultId);
        }
        if (!value) {
            return null;
        }
        value = DocumentSemanticTokensAdapter._fixProvidedSemanticTokens(value);
        return this._send(DocumentSemanticTokensAdapter._convertToEdits(previousResult, value), value);
    }
    async releaseDocumentSemanticColoring(semanticColoringResultId) {
        this._previousResults.delete(semanticColoringResultId);
    }
    static _fixProvidedSemanticTokens(v) {
        if (DocumentSemanticTokensAdapter._isSemanticTokens(v)) {
            if (DocumentSemanticTokensAdapter._isCorrectSemanticTokens(v)) {
                return v;
            }
            return new SemanticTokens(new Uint32Array(v.data), v.resultId);
        }
        else if (DocumentSemanticTokensAdapter._isSemanticTokensEdits(v)) {
            if (DocumentSemanticTokensAdapter._isCorrectSemanticTokensEdits(v)) {
                return v;
            }
            return new SemanticTokensEdits(v.edits.map(edit => new SemanticTokensEdit(edit.start, edit.deleteCount, edit.data ? new Uint32Array(edit.data) : edit.data)), v.resultId);
        }
        return v;
    }
    static _isSemanticTokens(v) {
        return v && !!(v.data);
    }
    static _isCorrectSemanticTokens(v) {
        return (v.data instanceof Uint32Array);
    }
    static _isSemanticTokensEdits(v) {
        return v && Array.isArray(v.edits);
    }
    static _isCorrectSemanticTokensEdits(v) {
        for (const edit of v.edits) {
            if (!(edit.data instanceof Uint32Array)) {
                return false;
            }
        }
        return true;
    }
    static _convertToEdits(previousResult, newResult) {
        if (!DocumentSemanticTokensAdapter._isSemanticTokens(newResult)) {
            return newResult;
        }
        if (!previousResult || !previousResult.tokens) {
            return newResult;
        }
        const oldData = previousResult.tokens;
        const oldLength = oldData.length;
        const newData = newResult.data;
        const newLength = newData.length;
        let commonPrefixLength = 0;
        const maxCommonPrefixLength = Math.min(oldLength, newLength);
        while (commonPrefixLength < maxCommonPrefixLength && oldData[commonPrefixLength] === newData[commonPrefixLength]) {
            commonPrefixLength++;
        }
        if (commonPrefixLength === oldLength && commonPrefixLength === newLength) {
            // complete overlap!
            return new SemanticTokensEdits([], newResult.resultId);
        }
        let commonSuffixLength = 0;
        const maxCommonSuffixLength = maxCommonPrefixLength - commonPrefixLength;
        while (commonSuffixLength < maxCommonSuffixLength && oldData[oldLength - commonSuffixLength - 1] === newData[newLength - commonSuffixLength - 1]) {
            commonSuffixLength++;
        }
        return new SemanticTokensEdits([{
                start: commonPrefixLength,
                deleteCount: (oldLength - commonPrefixLength - commonSuffixLength),
                data: newData.subarray(commonPrefixLength, newLength - commonSuffixLength)
            }], newResult.resultId);
    }
    _send(value, original) {
        if (DocumentSemanticTokensAdapter._isSemanticTokens(value)) {
            const myId = this._nextResultId++;
            this._previousResults.set(myId, new SemanticTokensPreviousResult(value.resultId, value.data));
            return encodeSemanticTokensDto({
                id: myId,
                type: 'full',
                data: value.data
            });
        }
        if (DocumentSemanticTokensAdapter._isSemanticTokensEdits(value)) {
            const myId = this._nextResultId++;
            if (DocumentSemanticTokensAdapter._isSemanticTokens(original)) {
                // store the original
                this._previousResults.set(myId, new SemanticTokensPreviousResult(original.resultId, original.data));
            }
            else {
                this._previousResults.set(myId, new SemanticTokensPreviousResult(value.resultId));
            }
            return encodeSemanticTokensDto({
                id: myId,
                type: 'delta',
                deltas: (value.edits || []).map(edit => ({ start: edit.start, deleteCount: edit.deleteCount, data: edit.data }))
            });
        }
        return null;
    }
}
class DocumentRangeSemanticTokensAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideDocumentRangeSemanticTokens(resource, range, token) {
        const doc = this._documents.getDocument(resource);
        const value = await this._provider.provideDocumentRangeSemanticTokens(doc, typeConvert.Range.to(range), token);
        if (!value) {
            return null;
        }
        return this._send(value);
    }
    _send(value) {
        return encodeSemanticTokensDto({
            id: 0,
            type: 'full',
            data: value.data
        });
    }
}
class CompletionsAdapter {
    static supportsResolving(provider) {
        return typeof provider.resolveCompletionItem === 'function';
    }
    constructor(_documents, _commands, _provider, _apiDeprecation, _extension) {
        this._documents = _documents;
        this._commands = _commands;
        this._provider = _provider;
        this._apiDeprecation = _apiDeprecation;
        this._extension = _extension;
        this._cache = new Cache('CompletionItem');
        this._disposables = new Map();
    }
    async provideCompletionItems(resource, position, context, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        // The default insert/replace ranges. It's important to compute them
        // before asynchronously asking the provider for its results. See
        // https://github.com/microsoft/vscode/issues/83400#issuecomment-546851421
        const replaceRange = doc.getWordRangeAtPosition(pos) || new Range(pos, pos);
        const insertRange = replaceRange.with({ end: pos });
        const sw = new StopWatch();
        const itemsOrList = await this._provider.provideCompletionItems(doc, pos, token, typeConvert.CompletionContext.to(context));
        if (!itemsOrList) {
            // undefined and null are valid results
            return undefined;
        }
        if (token.isCancellationRequested) {
            // cancelled -> return without further ado, esp no caching
            // of results as they will leak
            return undefined;
        }
        const list = Array.isArray(itemsOrList) ? new CompletionList(itemsOrList) : itemsOrList;
        // keep result for providers that support resolving
        const pid = CompletionsAdapter.supportsResolving(this._provider) ? this._cache.add(list.items) : this._cache.add([]);
        const disposables = new DisposableStore();
        this._disposables.set(pid, disposables);
        const completions = [];
        const result = {
            x: pid,
            ["b" /* extHostProtocol.ISuggestResultDtoField.completions */]: completions,
            ["a" /* extHostProtocol.ISuggestResultDtoField.defaultRanges */]: { replace: typeConvert.Range.from(replaceRange), insert: typeConvert.Range.from(insertRange) },
            ["c" /* extHostProtocol.ISuggestResultDtoField.isIncomplete */]: list.isIncomplete || undefined,
            ["d" /* extHostProtocol.ISuggestResultDtoField.duration */]: sw.elapsed()
        };
        for (let i = 0; i < list.items.length; i++) {
            const item = list.items[i];
            // check for bad completion item first
            const dto = this._convertCompletionItem(item, [pid, i], insertRange, replaceRange);
            completions.push(dto);
        }
        return result;
    }
    async resolveCompletionItem(id, token) {
        if (typeof this._provider.resolveCompletionItem !== 'function') {
            return undefined;
        }
        const item = this._cache.get(...id);
        if (!item) {
            return undefined;
        }
        const dto1 = this._convertCompletionItem(item, id);
        const resolvedItem = await this._provider.resolveCompletionItem(item, token);
        if (!resolvedItem) {
            return undefined;
        }
        const dto2 = this._convertCompletionItem(resolvedItem, id);
        if (dto1["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] !== dto2["h" /* extHostProtocol.ISuggestDataDtoField.insertText */]
            || dto1["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */] !== dto2["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]) {
            this._apiDeprecation.report('CompletionItem.insertText', this._extension, 'extension MAY NOT change \'insertText\' of a CompletionItem during resolve');
        }
        if (dto1["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */] !== dto2["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]
            || dto1["o" /* extHostProtocol.ISuggestDataDtoField.commandId */] !== dto2["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]
            || !equals(dto1["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */], dto2["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */])) {
            this._apiDeprecation.report('CompletionItem.command', this._extension, 'extension MAY NOT change \'command\' of a CompletionItem during resolve');
        }
        return {
            ...dto1,
            ["d" /* extHostProtocol.ISuggestDataDtoField.documentation */]: dto2["d" /* extHostProtocol.ISuggestDataDtoField.documentation */],
            ["c" /* extHostProtocol.ISuggestDataDtoField.detail */]: dto2["c" /* extHostProtocol.ISuggestDataDtoField.detail */],
            ["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */]: dto2["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */],
            // (fishy) async insertText
            ["h" /* extHostProtocol.ISuggestDataDtoField.insertText */]: dto2["h" /* extHostProtocol.ISuggestDataDtoField.insertText */],
            ["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]: dto2["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */],
            // (fishy) async command
            ["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]: dto2["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */],
            ["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]: dto2["o" /* extHostProtocol.ISuggestDataDtoField.commandId */],
            ["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */]: dto2["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */],
        };
    }
    releaseCompletionItems(id) {
        this._disposables.get(id)?.dispose();
        this._disposables.delete(id);
        this._cache.delete(id);
    }
    _convertCompletionItem(item, id, defaultInsertRange, defaultReplaceRange) {
        const disposables = this._disposables.get(id[0]);
        if (!disposables) {
            throw Error('DisposableStore is missing...');
        }
        const command = this._commands.toInternal(item.command, disposables);
        const result = {
            //
            x: id,
            //
            ["a" /* extHostProtocol.ISuggestDataDtoField.label */]: item.label,
            ["b" /* extHostProtocol.ISuggestDataDtoField.kind */]: item.kind !== undefined ? typeConvert.CompletionItemKind.from(item.kind) : undefined,
            ["m" /* extHostProtocol.ISuggestDataDtoField.kindModifier */]: item.tags && item.tags.map(typeConvert.CompletionItemTag.from),
            ["c" /* extHostProtocol.ISuggestDataDtoField.detail */]: item.detail,
            ["d" /* extHostProtocol.ISuggestDataDtoField.documentation */]: typeof item.documentation === 'undefined' ? undefined : typeConvert.MarkdownString.fromStrict(item.documentation),
            ["e" /* extHostProtocol.ISuggestDataDtoField.sortText */]: item.sortText !== item.label ? item.sortText : undefined,
            ["f" /* extHostProtocol.ISuggestDataDtoField.filterText */]: item.filterText !== item.label ? item.filterText : undefined,
            ["g" /* extHostProtocol.ISuggestDataDtoField.preselect */]: item.preselect || undefined,
            ["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]: item.keepWhitespace ? 1 /* languages.CompletionItemInsertTextRule.KeepWhitespace */ : 0 /* languages.CompletionItemInsertTextRule.None */,
            ["k" /* extHostProtocol.ISuggestDataDtoField.commitCharacters */]: item.commitCharacters?.join(''),
            ["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */]: item.additionalTextEdits && item.additionalTextEdits.map(typeConvert.TextEdit.from),
            ["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]: command?.$ident,
            ["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]: command?.id,
            ["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */]: command?.$ident ? undefined : command?.arguments, // filled in on main side from $ident
        };
        // 'insertText'-logic
        if (item.textEdit) {
            this._apiDeprecation.report('CompletionItem.textEdit', this._extension, `Use 'CompletionItem.insertText' and 'CompletionItem.range' instead.`);
            result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.textEdit.newText;
        }
        else if (typeof item.insertText === 'string') {
            result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.insertText;
        }
        else if (item.insertText instanceof SnippetString) {
            result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.insertText.value;
            result["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */] |= 4 /* languages.CompletionItemInsertTextRule.InsertAsSnippet */;
        }
        // 'overwrite[Before|After]'-logic
        let range;
        if (item.textEdit) {
            range = item.textEdit.range;
        }
        else if (item.range) {
            range = item.range;
        }
        if (Range.isRange(range)) {
            // "old" range
            result["j" /* extHostProtocol.ISuggestDataDtoField.range */] = typeConvert.Range.from(range);
        }
        else if (range && (!defaultInsertRange?.isEqual(range.inserting) || !defaultReplaceRange?.isEqual(range.replacing))) {
            // ONLY send range when it's different from the default ranges (safe bandwidth)
            result["j" /* extHostProtocol.ISuggestDataDtoField.range */] = {
                insert: typeConvert.Range.from(range.inserting),
                replace: typeConvert.Range.from(range.replacing)
            };
        }
        return result;
    }
}
class InlineCompletionAdapterBase {
    async provideInlineCompletions(resource, position, context, token) {
        return undefined;
    }
    async provideInlineEditsForRange(resource, range, context, token) {
        return undefined;
    }
    disposeCompletions(pid) { }
    handleDidShowCompletionItem(pid, idx, updatedInsertText) { }
    handlePartialAccept(pid, idx, acceptedCharacters, info) { }
}
class InlineCompletionAdapter extends InlineCompletionAdapterBase {
    constructor(_extension, _documents, _provider, _commands) {
        super();
        this._extension = _extension;
        this._documents = _documents;
        this._provider = _provider;
        this._commands = _commands;
        this._references = new ReferenceMap();
        this._isAdditionsProposedApiEnabled = isProposedApiEnabled(this._extension, 'inlineCompletionsAdditions');
        this.languageTriggerKindToVSCodeTriggerKind = {
            [languages.InlineCompletionTriggerKind.Automatic]: InlineCompletionTriggerKind.Automatic,
            [languages.InlineCompletionTriggerKind.Explicit]: InlineCompletionTriggerKind.Invoke,
        };
    }
    get supportsHandleEvents() {
        return isProposedApiEnabled(this._extension, 'inlineCompletionsAdditions')
            && (typeof this._provider.handleDidShowCompletionItem === 'function'
                || typeof this._provider.handleDidPartiallyAcceptCompletionItem === 'function');
    }
    async provideInlineCompletions(resource, position, context, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const result = await this._provider.provideInlineCompletionItems(doc, pos, {
            selectedCompletionInfo: context.selectedSuggestionInfo
                ? {
                    range: typeConvert.Range.to(context.selectedSuggestionInfo.range),
                    text: context.selectedSuggestionInfo.text
                }
                : undefined,
            triggerKind: this.languageTriggerKindToVSCodeTriggerKind[context.triggerKind]
        }, token);
        if (!result) {
            // undefined and null are valid results
            return undefined;
        }
        if (token.isCancellationRequested) {
            // cancelled -> return without further ado, esp no caching
            // of results as they will leak
            return undefined;
        }
        const normalizedResult = Array.isArray(result) ? result : result.items;
        const commands = this._isAdditionsProposedApiEnabled ? Array.isArray(result) ? [] : result.commands || [] : [];
        const enableForwardStability = this._isAdditionsProposedApiEnabled && !Array.isArray(result) ? result.enableForwardStability : undefined;
        let disposableStore = undefined;
        const pid = this._references.createReferenceId({
            dispose() {
                disposableStore?.dispose();
            },
            items: normalizedResult
        });
        return {
            pid,
            items: normalizedResult.map((item, idx) => {
                let command = undefined;
                if (item.command) {
                    if (!disposableStore) {
                        disposableStore = new DisposableStore();
                    }
                    command = this._commands.toInternal(item.command, disposableStore);
                }
                const insertText = item.insertText;
                return ({
                    insertText: typeof insertText === 'string' ? insertText : { snippet: insertText.value },
                    filterText: item.filterText,
                    range: item.range ? typeConvert.Range.from(item.range) : undefined,
                    command,
                    idx: idx,
                    completeBracketPairs: this._isAdditionsProposedApiEnabled ? item.completeBracketPairs : false,
                });
            }),
            commands: commands.map(c => {
                if (!disposableStore) {
                    disposableStore = new DisposableStore();
                }
                return this._commands.toInternal(c, disposableStore);
            }),
            suppressSuggestions: false,
            enableForwardStability,
        };
    }
    async provideInlineEditsForRange(resource, range, context, token) {
        if (!this._provider.provideInlineEditsForRange) {
            return undefined;
        }
        checkProposedApiEnabled(this._extension, 'inlineCompletionsAdditions');
        const doc = this._documents.getDocument(resource);
        const r = typeConvert.Range.to(range);
        const result = await this._provider.provideInlineEditsForRange(doc, r, {
            selectedCompletionInfo: context.selectedSuggestionInfo
                ? {
                    range: typeConvert.Range.to(context.selectedSuggestionInfo.range),
                    text: context.selectedSuggestionInfo.text
                }
                : undefined,
            triggerKind: this.languageTriggerKindToVSCodeTriggerKind[context.triggerKind],
            userPrompt: context.userPrompt,
        }, token);
        if (!result) {
            // undefined and null are valid results
            return undefined;
        }
        if (token.isCancellationRequested) {
            // cancelled -> return without further ado, esp no caching
            // of results as they will leak
            return undefined;
        }
        const normalizedResult = Array.isArray(result) ? result : result.items;
        const commands = this._isAdditionsProposedApiEnabled ? Array.isArray(result) ? [] : result.commands || [] : [];
        const enableForwardStability = this._isAdditionsProposedApiEnabled && !Array.isArray(result) ? result.enableForwardStability : undefined;
        let disposableStore = undefined;
        const pid = this._references.createReferenceId({
            dispose() {
                disposableStore?.dispose();
            },
            items: normalizedResult
        });
        return {
            pid,
            items: normalizedResult.map((item, idx) => {
                let command = undefined;
                if (item.command) {
                    if (!disposableStore) {
                        disposableStore = new DisposableStore();
                    }
                    command = this._commands.toInternal(item.command, disposableStore);
                }
                const insertText = item.insertText;
                return ({
                    insertText: typeof insertText === 'string' ? insertText : { snippet: insertText.value },
                    filterText: item.filterText,
                    range: item.range ? typeConvert.Range.from(item.range) : undefined,
                    command,
                    idx: idx,
                    completeBracketPairs: this._isAdditionsProposedApiEnabled ? item.completeBracketPairs : false,
                });
            }),
            commands: commands.map(c => {
                if (!disposableStore) {
                    disposableStore = new DisposableStore();
                }
                return this._commands.toInternal(c, disposableStore);
            }),
            suppressSuggestions: false,
            enableForwardStability,
        };
    }
    disposeCompletions(pid) {
        const data = this._references.disposeReferenceId(pid);
        data?.dispose();
    }
    handleDidShowCompletionItem(pid, idx, updatedInsertText) {
        const completionItem = this._references.get(pid)?.items[idx];
        if (completionItem) {
            if (this._provider.handleDidShowCompletionItem && this._isAdditionsProposedApiEnabled) {
                this._provider.handleDidShowCompletionItem(completionItem, updatedInsertText);
            }
        }
    }
    handlePartialAccept(pid, idx, acceptedCharacters, info) {
        const completionItem = this._references.get(pid)?.items[idx];
        if (completionItem) {
            if (this._provider.handleDidPartiallyAcceptCompletionItem && this._isAdditionsProposedApiEnabled) {
                this._provider.handleDidPartiallyAcceptCompletionItem(completionItem, acceptedCharacters);
                this._provider.handleDidPartiallyAcceptCompletionItem(completionItem, typeConvert.PartialAcceptInfo.to(info));
            }
        }
    }
}
class InlineEditAdapter {
    async provideInlineEdits(uri, context, token) {
        const doc = this._documents.getDocument(uri);
        const result = await this._provider.provideInlineEdit(doc, {
            triggerKind: this.languageTriggerKindToVSCodeTriggerKind[context.triggerKind]
        }, token);
        if (!result) {
            // undefined and null are valid results
            return undefined;
        }
        if (token.isCancellationRequested) {
            // cancelled -> return without further ado, esp no caching
            // of results as they will leak
            return undefined;
        }
        let disposableStore = undefined;
        const pid = this._references.createReferenceId({
            dispose() {
                disposableStore?.dispose();
            },
            item: result
        });
        let acceptCommand = undefined;
        if (result.accepted) {
            if (!disposableStore) {
                disposableStore = new DisposableStore();
            }
            acceptCommand = this._commands.toInternal(result.accepted, disposableStore);
        }
        let rejectCommand = undefined;
        if (result.rejected) {
            if (!disposableStore) {
                disposableStore = new DisposableStore();
            }
            rejectCommand = this._commands.toInternal(result.rejected, disposableStore);
        }
        const langResult = {
            pid,
            text: result.text,
            range: typeConvert.Range.from(result.range),
            accepted: acceptCommand,
            rejected: rejectCommand,
        };
        return langResult;
    }
    disposeEdit(pid) {
        const data = this._references.disposeReferenceId(pid);
        data?.dispose();
    }
    constructor(_extension, _documents, _provider, _commands) {
        this._documents = _documents;
        this._provider = _provider;
        this._commands = _commands;
        this._references = new ReferenceMap();
        this.languageTriggerKindToVSCodeTriggerKind = {
            [languages.InlineEditTriggerKind.Automatic]: InlineEditTriggerKind.Automatic,
            [languages.InlineEditTriggerKind.Invoke]: InlineEditTriggerKind.Invoke,
        };
    }
}
class ReferenceMap {
    constructor() {
        this._references = new Map();
        this._idPool = 1;
    }
    createReferenceId(value) {
        const id = this._idPool++;
        this._references.set(id, value);
        return id;
    }
    disposeReferenceId(referenceId) {
        const value = this._references.get(referenceId);
        this._references.delete(referenceId);
        return value;
    }
    get(referenceId) {
        return this._references.get(referenceId);
    }
}
class SignatureHelpAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
        this._cache = new Cache('SignatureHelp');
    }
    async provideSignatureHelp(resource, position, context, token) {
        const doc = this._documents.getDocument(resource);
        const pos = typeConvert.Position.to(position);
        const vscodeContext = this.reviveContext(context);
        const value = await this._provider.provideSignatureHelp(doc, pos, token, vscodeContext);
        if (value) {
            const id = this._cache.add([value]);
            return { ...typeConvert.SignatureHelp.from(value), id };
        }
        return undefined;
    }
    reviveContext(context) {
        let activeSignatureHelp = undefined;
        if (context.activeSignatureHelp) {
            const revivedSignatureHelp = typeConvert.SignatureHelp.to(context.activeSignatureHelp);
            const saved = this._cache.get(context.activeSignatureHelp.id, 0);
            if (saved) {
                activeSignatureHelp = saved;
                activeSignatureHelp.activeSignature = revivedSignatureHelp.activeSignature;
                activeSignatureHelp.activeParameter = revivedSignatureHelp.activeParameter;
            }
            else {
                activeSignatureHelp = revivedSignatureHelp;
            }
        }
        return { ...context, activeSignatureHelp };
    }
    releaseSignatureHelp(id) {
        this._cache.delete(id);
    }
}
class InlayHintsAdapter {
    constructor(_documents, _commands, _provider, _logService, _extension) {
        this._documents = _documents;
        this._commands = _commands;
        this._provider = _provider;
        this._logService = _logService;
        this._extension = _extension;
        this._cache = new Cache('InlayHints');
        this._disposables = new Map();
    }
    async provideInlayHints(resource, ran, token) {
        const doc = this._documents.getDocument(resource);
        const range = typeConvert.Range.to(ran);
        const hints = await this._provider.provideInlayHints(doc, range, token);
        if (!Array.isArray(hints) || hints.length === 0) {
            // bad result
            this._logService.trace(`[InlayHints] NO inlay hints from '${this._extension.identifier.value}' for range ${JSON.stringify(ran)}`);
            return undefined;
        }
        if (token.isCancellationRequested) {
            // cancelled -> return without further ado, esp no caching
            // of results as they will leak
            return undefined;
        }
        const pid = this._cache.add(hints);
        this._disposables.set(pid, new DisposableStore());
        const result = { hints: [], cacheId: pid };
        for (let i = 0; i < hints.length; i++) {
            if (this._isValidInlayHint(hints[i], range)) {
                result.hints.push(this._convertInlayHint(hints[i], [pid, i]));
            }
        }
        this._logService.trace(`[InlayHints] ${result.hints.length} inlay hints from '${this._extension.identifier.value}' for range ${JSON.stringify(ran)}`);
        return result;
    }
    async resolveInlayHint(id, token) {
        if (typeof this._provider.resolveInlayHint !== 'function') {
            return undefined;
        }
        const item = this._cache.get(...id);
        if (!item) {
            return undefined;
        }
        const hint = await this._provider.resolveInlayHint(item, token);
        if (!hint) {
            return undefined;
        }
        if (!this._isValidInlayHint(hint)) {
            return undefined;
        }
        return this._convertInlayHint(hint, id);
    }
    releaseHints(id) {
        this._disposables.get(id)?.dispose();
        this._disposables.delete(id);
        this._cache.delete(id);
    }
    _isValidInlayHint(hint, range) {
        if (hint.label.length === 0 || Array.isArray(hint.label) && hint.label.every(part => part.value.length === 0)) {
            console.log('INVALID inlay hint, empty label', hint);
            return false;
        }
        if (range && !range.contains(hint.position)) {
            // console.log('INVALID inlay hint, position outside range', range, hint);
            return false;
        }
        return true;
    }
    _convertInlayHint(hint, id) {
        const disposables = this._disposables.get(id[0]);
        if (!disposables) {
            throw Error('DisposableStore is missing...');
        }
        const result = {
            label: '', // fill-in below
            cacheId: id,
            tooltip: typeConvert.MarkdownString.fromStrict(hint.tooltip),
            position: typeConvert.Position.from(hint.position),
            textEdits: hint.textEdits && hint.textEdits.map(typeConvert.TextEdit.from),
            kind: hint.kind && typeConvert.InlayHintKind.from(hint.kind),
            paddingLeft: hint.paddingLeft,
            paddingRight: hint.paddingRight,
        };
        if (typeof hint.label === 'string') {
            result.label = hint.label;
        }
        else {
            const parts = [];
            result.label = parts;
            for (const part of hint.label) {
                if (!part.value) {
                    console.warn('INVALID inlay hint, empty label part', this._extension.identifier.value);
                    continue;
                }
                const part2 = {
                    label: part.value,
                    tooltip: typeConvert.MarkdownString.fromStrict(part.tooltip)
                };
                if (Location.isLocation(part.location)) {
                    part2.location = typeConvert.location.from(part.location);
                }
                if (part.command) {
                    part2.command = this._commands.toInternal(part.command, disposables);
                }
                parts.push(part2);
            }
        }
        return result;
    }
}
class LinkProviderAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
        this._cache = new Cache('DocumentLink');
    }
    async provideLinks(resource, token) {
        const doc = this._documents.getDocument(resource);
        const links = await this._provider.provideDocumentLinks(doc, token);
        if (!Array.isArray(links) || links.length === 0) {
            // bad result
            return undefined;
        }
        if (token.isCancellationRequested) {
            // cancelled -> return without further ado, esp no caching
            // of results as they will leak
            return undefined;
        }
        if (typeof this._provider.resolveDocumentLink !== 'function') {
            // no resolve -> no caching
            return { links: links.filter(LinkProviderAdapter._validateLink).map(typeConvert.DocumentLink.from) };
        }
        else {
            // cache links for future resolving
            const pid = this._cache.add(links);
            const result = { links: [], cacheId: pid };
            for (let i = 0; i < links.length; i++) {
                if (!LinkProviderAdapter._validateLink(links[i])) {
                    continue;
                }
                const dto = typeConvert.DocumentLink.from(links[i]);
                dto.cacheId = [pid, i];
                result.links.push(dto);
            }
            return result;
        }
    }
    static _validateLink(link) {
        if (link.target && link.target.path.length > 50_000) {
            console.warn('DROPPING link because it is too long');
            return false;
        }
        return true;
    }
    async resolveLink(id, token) {
        if (typeof this._provider.resolveDocumentLink !== 'function') {
            return undefined;
        }
        const item = this._cache.get(...id);
        if (!item) {
            return undefined;
        }
        const link = await this._provider.resolveDocumentLink(item, token);
        if (!link || !LinkProviderAdapter._validateLink(link)) {
            return undefined;
        }
        return typeConvert.DocumentLink.from(link);
    }
    releaseLinks(id) {
        this._cache.delete(id);
    }
}
class ColorProviderAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideColors(resource, token) {
        const doc = this._documents.getDocument(resource);
        const colors = await this._provider.provideDocumentColors(doc, token);
        if (!Array.isArray(colors)) {
            return [];
        }
        const colorInfos = colors.map(ci => {
            return {
                color: typeConvert.Color.from(ci.color),
                range: typeConvert.Range.from(ci.range)
            };
        });
        return colorInfos;
    }
    async provideColorPresentations(resource, raw, token) {
        const document = this._documents.getDocument(resource);
        const range = typeConvert.Range.to(raw.range);
        const color = typeConvert.Color.to(raw.color);
        const value = await this._provider.provideColorPresentations(color, { document, range }, token);
        if (!Array.isArray(value)) {
            return undefined;
        }
        return value.map(typeConvert.ColorPresentation.from);
    }
}
class FoldingProviderAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideFoldingRanges(resource, context, token) {
        const doc = this._documents.getDocument(resource);
        const ranges = await this._provider.provideFoldingRanges(doc, context, token);
        if (!Array.isArray(ranges)) {
            return undefined;
        }
        return ranges.map(typeConvert.FoldingRange.from);
    }
}
class SelectionRangeAdapter {
    constructor(_documents, _provider, _logService) {
        this._documents = _documents;
        this._provider = _provider;
        this._logService = _logService;
    }
    async provideSelectionRanges(resource, pos, token) {
        const document = this._documents.getDocument(resource);
        const positions = pos.map(typeConvert.Position.to);
        const allProviderRanges = await this._provider.provideSelectionRanges(document, positions, token);
        if (!isNonEmptyArray(allProviderRanges)) {
            return [];
        }
        if (allProviderRanges.length !== positions.length) {
            this._logService.warn('BAD selection ranges, provider must return ranges for each position');
            return [];
        }
        const allResults = [];
        for (let i = 0; i < positions.length; i++) {
            const oneResult = [];
            allResults.push(oneResult);
            let last = positions[i];
            let selectionRange = allProviderRanges[i];
            while (true) {
                if (!selectionRange.range.contains(last)) {
                    throw new Error('INVALID selection range, must contain the previous range');
                }
                oneResult.push(typeConvert.SelectionRange.from(selectionRange));
                if (!selectionRange.parent) {
                    break;
                }
                last = selectionRange.range;
                selectionRange = selectionRange.parent;
            }
        }
        return allResults;
    }
}
class CallHierarchyAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
        this._idPool = new IdGenerator('');
        this._cache = new Map();
    }
    async prepareSession(uri, position, token) {
        const doc = this._documents.getDocument(uri);
        const pos = typeConvert.Position.to(position);
        const items = await this._provider.prepareCallHierarchy(doc, pos, token);
        if (!items) {
            return undefined;
        }
        const sessionId = this._idPool.nextId();
        this._cache.set(sessionId, new Map());
        if (Array.isArray(items)) {
            return items.map(item => this._cacheAndConvertItem(sessionId, item));
        }
        else {
            return [this._cacheAndConvertItem(sessionId, items)];
        }
    }
    async provideCallsTo(sessionId, itemId, token) {
        const item = this._itemFromCache(sessionId, itemId);
        if (!item) {
            throw new Error('missing call hierarchy item');
        }
        const calls = await this._provider.provideCallHierarchyIncomingCalls(item, token);
        if (!calls) {
            return undefined;
        }
        return calls.map(call => {
            return {
                from: this._cacheAndConvertItem(sessionId, call.from),
                fromRanges: call.fromRanges.map(r => typeConvert.Range.from(r))
            };
        });
    }
    async provideCallsFrom(sessionId, itemId, token) {
        const item = this._itemFromCache(sessionId, itemId);
        if (!item) {
            throw new Error('missing call hierarchy item');
        }
        const calls = await this._provider.provideCallHierarchyOutgoingCalls(item, token);
        if (!calls) {
            return undefined;
        }
        return calls.map(call => {
            return {
                to: this._cacheAndConvertItem(sessionId, call.to),
                fromRanges: call.fromRanges.map(r => typeConvert.Range.from(r))
            };
        });
    }
    releaseSession(sessionId) {
        this._cache.delete(sessionId);
    }
    _cacheAndConvertItem(sessionId, item) {
        const map = this._cache.get(sessionId);
        const dto = typeConvert.CallHierarchyItem.from(item, sessionId, map.size.toString(36));
        map.set(dto._itemId, item);
        return dto;
    }
    _itemFromCache(sessionId, itemId) {
        const map = this._cache.get(sessionId);
        return map?.get(itemId);
    }
}
class TypeHierarchyAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
        this._idPool = new IdGenerator('');
        this._cache = new Map();
    }
    async prepareSession(uri, position, token) {
        const doc = this._documents.getDocument(uri);
        const pos = typeConvert.Position.to(position);
        const items = await this._provider.prepareTypeHierarchy(doc, pos, token);
        if (!items) {
            return undefined;
        }
        const sessionId = this._idPool.nextId();
        this._cache.set(sessionId, new Map());
        if (Array.isArray(items)) {
            return items.map(item => this._cacheAndConvertItem(sessionId, item));
        }
        else {
            return [this._cacheAndConvertItem(sessionId, items)];
        }
    }
    async provideSupertypes(sessionId, itemId, token) {
        const item = this._itemFromCache(sessionId, itemId);
        if (!item) {
            throw new Error('missing type hierarchy item');
        }
        const supertypes = await this._provider.provideTypeHierarchySupertypes(item, token);
        if (!supertypes) {
            return undefined;
        }
        return supertypes.map(supertype => {
            return this._cacheAndConvertItem(sessionId, supertype);
        });
    }
    async provideSubtypes(sessionId, itemId, token) {
        const item = this._itemFromCache(sessionId, itemId);
        if (!item) {
            throw new Error('missing type hierarchy item');
        }
        const subtypes = await this._provider.provideTypeHierarchySubtypes(item, token);
        if (!subtypes) {
            return undefined;
        }
        return subtypes.map(subtype => {
            return this._cacheAndConvertItem(sessionId, subtype);
        });
    }
    releaseSession(sessionId) {
        this._cache.delete(sessionId);
    }
    _cacheAndConvertItem(sessionId, item) {
        const map = this._cache.get(sessionId);
        const dto = typeConvert.TypeHierarchyItem.from(item, sessionId, map.size.toString(36));
        map.set(dto._itemId, item);
        return dto;
    }
    _itemFromCache(sessionId, itemId) {
        const map = this._cache.get(sessionId);
        return map?.get(itemId);
    }
}
class DocumentDropEditAdapter {
    constructor(_proxy, _documents, _provider, _handle, _extension) {
        this._proxy = _proxy;
        this._documents = _documents;
        this._provider = _provider;
        this._handle = _handle;
        this._extension = _extension;
        this._cache = new Cache('DocumentDropEdit');
    }
    async provideDocumentOnDropEdits(requestId, uri, position, dataTransferDto, token) {
        const doc = this._documents.getDocument(uri);
        const pos = typeConvert.Position.to(position);
        const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, async (id) => {
            return (await this._proxy.$resolveDocumentOnDropFileData(this._handle, requestId, id)).buffer;
        });
        const edits = await this._provider.provideDocumentDropEdits(doc, pos, dataTransfer, token);
        if (!edits) {
            return undefined;
        }
        const editsArray = asArray(edits);
        const cacheId = this._cache.add(editsArray);
        return editsArray.map((edit, i) => ({
            _cacheId: [cacheId, i],
            title: edit.title ?? localize('defaultDropLabel', "Drop using '{0}' extension", this._extension.displayName || this._extension.name),
            kind: edit.kind?.value,
            yieldTo: edit.yieldTo?.map(x => x.value),
            insertText: typeof edit.insertText === 'string' ? edit.insertText : { snippet: edit.insertText.value },
            additionalEdit: edit.additionalEdit ? typeConvert.WorkspaceEdit.from(edit.additionalEdit, undefined) : undefined,
        }));
    }
    async resolveDropEdit(id, token) {
        const [sessionId, itemId] = id;
        const item = this._cache.get(sessionId, itemId);
        if (!item || !this._provider.resolveDocumentDropEdit) {
            return {}; // this should not happen...
        }
        const resolvedItem = (await this._provider.resolveDocumentDropEdit(item, token)) ?? item;
        const additionalEdit = resolvedItem.additionalEdit ? typeConvert.WorkspaceEdit.from(resolvedItem.additionalEdit, undefined) : undefined;
        return { additionalEdit };
    }
    releaseDropEdits(id) {
        this._cache.delete(id);
    }
}
class MappedEditsAdapter {
    constructor(_documents, _provider) {
        this._documents = _documents;
        this._provider = _provider;
    }
    async provideMappedEdits(resource, codeBlocks, context, token) {
        const uri = URI.revive(resource);
        const doc = this._documents.getDocument(uri);
        const reviveContextItem = (item) => ({
            uri: URI.revive(item.uri),
            version: item.version,
            ranges: item.ranges.map(r => typeConvert.Range.to(r)),
        });
        const usedContext = context.documents.map(docSubArray => docSubArray.map(reviveContextItem));
        const ctx = {
            documents: usedContext,
            selections: usedContext[0]?.[0]?.ranges ?? [], // @ulugbekna: this is a hack for backward compatibility
            conversation: context.conversation?.map(c => {
                if (c.type === 'response') {
                    return {
                        type: 'response',
                        message: c.message,
                        references: c.references?.map(reviveContextItem)
                    };
                }
                else {
                    return {
                        type: 'request',
                        message: c.message,
                    };
                }
            })
        };
        const mappedEdits = await this._provider.provideMappedEdits(doc, codeBlocks, ctx, token);
        return mappedEdits ? typeConvert.WorkspaceEdit.from(mappedEdits) : null;
    }
}
class AdapterData {
    constructor(adapter, extension) {
        this.adapter = adapter;
        this.extension = extension;
    }
}
export class ExtHostLanguageFeatures {
    static { this._handlePool = 0; }
    constructor(mainContext, _uriTransformer, _documents, _commands, _diagnostics, _logService, _apiDeprecation, _extensionTelemetry) {
        this._uriTransformer = _uriTransformer;
        this._documents = _documents;
        this._commands = _commands;
        this._diagnostics = _diagnostics;
        this._logService = _logService;
        this._apiDeprecation = _apiDeprecation;
        this._extensionTelemetry = _extensionTelemetry;
        this._adapter = new Map();
        this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadLanguageFeatures);
    }
    _transformDocumentSelector(selector, extension) {
        return typeConvert.DocumentSelector.from(selector, this._uriTransformer, extension);
    }
    _createDisposable(handle) {
        return new Disposable(() => {
            this._adapter.delete(handle);
            this._proxy.$unregister(handle);
        });
    }
    _nextHandle() {
        return ExtHostLanguageFeatures._handlePool++;
    }
    async _withAdapter(handle, ctor, callback, fallbackValue, tokenToRaceAgainst, doNotLog = false) {
        const data = this._adapter.get(handle);
        if (!data || !(data.adapter instanceof ctor)) {
            return fallbackValue;
        }
        const t1 = Date.now();
        if (!doNotLog) {
            this._logService.trace(`[${data.extension.identifier.value}] INVOKE provider '${callback.toString().replace(/[\r\n]/g, '')}'`);
        }
        const result = callback(data.adapter, data.extension);
        // logging,tracing
        Promise.resolve(result).catch(err => {
            if (!isCancellationError(err)) {
                this._logService.error(`[${data.extension.identifier.value}] provider FAILED`);
                this._logService.error(err);
                this._extensionTelemetry.onExtensionError(data.extension.identifier, err);
            }
        }).finally(() => {
            if (!doNotLog) {
                this._logService.trace(`[${data.extension.identifier.value}] provider DONE after ${Date.now() - t1}ms`);
            }
        });
        if (CancellationToken.isCancellationToken(tokenToRaceAgainst)) {
            return raceCancellationError(result, tokenToRaceAgainst);
        }
        return result;
    }
    _addNewAdapter(adapter, extension) {
        const handle = this._nextHandle();
        this._adapter.set(handle, new AdapterData(adapter, extension));
        return handle;
    }
    static _extLabel(ext) {
        return ext.displayName || ext.name;
    }
    static _extId(ext) {
        return ext.identifier.value;
    }
    // --- outline
    registerDocumentSymbolProvider(extension, selector, provider, metadata) {
        const handle = this._addNewAdapter(new DocumentSymbolAdapter(this._documents, provider), extension);
        const displayName = (metadata && metadata.label) || ExtHostLanguageFeatures._extLabel(extension);
        this._proxy.$registerDocumentSymbolProvider(handle, this._transformDocumentSelector(selector, extension), displayName);
        return this._createDisposable(handle);
    }
    $provideDocumentSymbols(handle, resource, token) {
        return this._withAdapter(handle, DocumentSymbolAdapter, adapter => adapter.provideDocumentSymbols(URI.revive(resource), token), undefined, token);
    }
    // --- code lens
    registerCodeLensProvider(extension, selector, provider) {
        const handle = this._nextHandle();
        const eventHandle = typeof provider.onDidChangeCodeLenses === 'function' ? this._nextHandle() : undefined;
        this._adapter.set(handle, new AdapterData(new CodeLensAdapter(this._documents, this._commands.converter, provider, extension, this._extensionTelemetry, this._logService), extension));
        this._proxy.$registerCodeLensSupport(handle, this._transformDocumentSelector(selector, extension), eventHandle);
        let result = this._createDisposable(handle);
        if (eventHandle !== undefined) {
            const subscription = provider.onDidChangeCodeLenses(_ => this._proxy.$emitCodeLensEvent(eventHandle));
            result = Disposable.from(result, subscription);
        }
        return result;
    }
    $provideCodeLenses(handle, resource, token) {
        return this._withAdapter(handle, CodeLensAdapter, adapter => adapter.provideCodeLenses(URI.revive(resource), token), undefined, token, resource.scheme === 'output');
    }
    $resolveCodeLens(handle, symbol, token) {
        return this._withAdapter(handle, CodeLensAdapter, adapter => adapter.resolveCodeLens(symbol, token), undefined, undefined, true);
    }
    $releaseCodeLenses(handle, cacheId) {
        this._withAdapter(handle, CodeLensAdapter, adapter => Promise.resolve(adapter.releaseCodeLenses(cacheId)), undefined, undefined, true);
    }
    // --- declaration
    registerDefinitionProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new DefinitionAdapter(this._documents, provider), extension);
        this._proxy.$registerDefinitionSupport(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideDefinition(handle, resource, position, token) {
        return this._withAdapter(handle, DefinitionAdapter, adapter => adapter.provideDefinition(URI.revive(resource), position, token), [], token);
    }
    registerDeclarationProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new DeclarationAdapter(this._documents, provider), extension);
        this._proxy.$registerDeclarationSupport(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideDeclaration(handle, resource, position, token) {
        return this._withAdapter(handle, DeclarationAdapter, adapter => adapter.provideDeclaration(URI.revive(resource), position, token), [], token);
    }
    registerImplementationProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new ImplementationAdapter(this._documents, provider), extension);
        this._proxy.$registerImplementationSupport(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideImplementation(handle, resource, position, token) {
        return this._withAdapter(handle, ImplementationAdapter, adapter => adapter.provideImplementation(URI.revive(resource), position, token), [], token);
    }
    registerTypeDefinitionProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new TypeDefinitionAdapter(this._documents, provider), extension);
        this._proxy.$registerTypeDefinitionSupport(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideTypeDefinition(handle, resource, position, token) {
        return this._withAdapter(handle, TypeDefinitionAdapter, adapter => adapter.provideTypeDefinition(URI.revive(resource), position, token), [], token);
    }
    // --- extra info
    registerHoverProvider(extension, selector, provider, extensionId) {
        const handle = this._addNewAdapter(new HoverAdapter(this._documents, provider), extension);
        this._proxy.$registerHoverProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideHover(handle, resource, position, context, token) {
        return this._withAdapter(handle, HoverAdapter, adapter => adapter.provideHover(URI.revive(resource), position, context, token), undefined, token);
    }
    $releaseHover(handle, id) {
        this._withAdapter(handle, HoverAdapter, adapter => Promise.resolve(adapter.releaseHover(id)), undefined, undefined);
    }
    // --- debug hover
    registerEvaluatableExpressionProvider(extension, selector, provider, extensionId) {
        const handle = this._addNewAdapter(new EvaluatableExpressionAdapter(this._documents, provider), extension);
        this._proxy.$registerEvaluatableExpressionProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideEvaluatableExpression(handle, resource, position, token) {
        return this._withAdapter(handle, EvaluatableExpressionAdapter, adapter => adapter.provideEvaluatableExpression(URI.revive(resource), position, token), undefined, token);
    }
    // --- debug inline values
    registerInlineValuesProvider(extension, selector, provider, extensionId) {
        const eventHandle = typeof provider.onDidChangeInlineValues === 'function' ? this._nextHandle() : undefined;
        const handle = this._addNewAdapter(new InlineValuesAdapter(this._documents, provider), extension);
        this._proxy.$registerInlineValuesProvider(handle, this._transformDocumentSelector(selector, extension), eventHandle);
        let result = this._createDisposable(handle);
        if (eventHandle !== undefined) {
            const subscription = provider.onDidChangeInlineValues(_ => this._proxy.$emitInlineValuesEvent(eventHandle));
            result = Disposable.from(result, subscription);
        }
        return result;
    }
    $provideInlineValues(handle, resource, range, context, token) {
        return this._withAdapter(handle, InlineValuesAdapter, adapter => adapter.provideInlineValues(URI.revive(resource), range, context, token), undefined, token);
    }
    // --- occurrences
    registerDocumentHighlightProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new DocumentHighlightAdapter(this._documents, provider), extension);
        this._proxy.$registerDocumentHighlightProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    registerMultiDocumentHighlightProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new MultiDocumentHighlightAdapter(this._documents, provider, this._logService), extension);
        this._proxy.$registerMultiDocumentHighlightProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideDocumentHighlights(handle, resource, position, token) {
        return this._withAdapter(handle, DocumentHighlightAdapter, adapter => adapter.provideDocumentHighlights(URI.revive(resource), position, token), undefined, token);
    }
    $provideMultiDocumentHighlights(handle, resource, position, otherModels, token) {
        return this._withAdapter(handle, MultiDocumentHighlightAdapter, adapter => adapter.provideMultiDocumentHighlights(URI.revive(resource), position, otherModels.map(model => URI.revive(model)), token), undefined, token);
    }
    // --- linked editing
    registerLinkedEditingRangeProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new LinkedEditingRangeAdapter(this._documents, provider), extension);
        this._proxy.$registerLinkedEditingRangeProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideLinkedEditingRanges(handle, resource, position, token) {
        return this._withAdapter(handle, LinkedEditingRangeAdapter, async (adapter) => {
            const res = await adapter.provideLinkedEditingRanges(URI.revive(resource), position, token);
            if (res) {
                return {
                    ranges: res.ranges,
                    wordPattern: res.wordPattern ? ExtHostLanguageFeatures._serializeRegExp(res.wordPattern) : undefined
                };
            }
            return undefined;
        }, undefined, token);
    }
    // --- references
    registerReferenceProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new ReferenceAdapter(this._documents, provider), extension);
        this._proxy.$registerReferenceSupport(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideReferences(handle, resource, position, context, token) {
        return this._withAdapter(handle, ReferenceAdapter, adapter => adapter.provideReferences(URI.revive(resource), position, context, token), undefined, token);
    }
    // --- code actions
    registerCodeActionProvider(extension, selector, provider, metadata) {
        const store = new DisposableStore();
        const handle = this._addNewAdapter(new CodeActionAdapter(this._documents, this._commands.converter, this._diagnostics, provider, this._logService, extension, this._apiDeprecation), extension);
        this._proxy.$registerCodeActionSupport(handle, this._transformDocumentSelector(selector, extension), {
            providedKinds: metadata?.providedCodeActionKinds?.map(kind => kind.value),
            documentation: metadata?.documentation?.map(x => ({
                kind: x.kind.value,
                command: this._commands.converter.toInternal(x.command, store),
            }))
        }, ExtHostLanguageFeatures._extLabel(extension), ExtHostLanguageFeatures._extId(extension), Boolean(provider.resolveCodeAction));
        store.add(this._createDisposable(handle));
        return store;
    }
    $provideCodeActions(handle, resource, rangeOrSelection, context, token) {
        return this._withAdapter(handle, CodeActionAdapter, adapter => adapter.provideCodeActions(URI.revive(resource), rangeOrSelection, context, token), undefined, token);
    }
    $resolveCodeAction(handle, id, token) {
        return this._withAdapter(handle, CodeActionAdapter, adapter => adapter.resolveCodeAction(id, token), {}, undefined);
    }
    $releaseCodeActions(handle, cacheId) {
        this._withAdapter(handle, CodeActionAdapter, adapter => Promise.resolve(adapter.releaseCodeActions(cacheId)), undefined, undefined);
    }
    // --- formatting
    registerDocumentFormattingEditProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new DocumentFormattingAdapter(this._documents, provider), extension);
        this._proxy.$registerDocumentFormattingSupport(handle, this._transformDocumentSelector(selector, extension), extension.identifier, extension.displayName || extension.name);
        return this._createDisposable(handle);
    }
    $provideDocumentFormattingEdits(handle, resource, options, token) {
        return this._withAdapter(handle, DocumentFormattingAdapter, adapter => adapter.provideDocumentFormattingEdits(URI.revive(resource), options, token), undefined, token);
    }
    registerDocumentRangeFormattingEditProvider(extension, selector, provider) {
        const canFormatMultipleRanges = typeof provider.provideDocumentRangesFormattingEdits === 'function';
        const handle = this._addNewAdapter(new RangeFormattingAdapter(this._documents, provider), extension);
        this._proxy.$registerRangeFormattingSupport(handle, this._transformDocumentSelector(selector, extension), extension.identifier, extension.displayName || extension.name, canFormatMultipleRanges);
        return this._createDisposable(handle);
    }
    $provideDocumentRangeFormattingEdits(handle, resource, range, options, token) {
        return this._withAdapter(handle, RangeFormattingAdapter, adapter => adapter.provideDocumentRangeFormattingEdits(URI.revive(resource), range, options, token), undefined, token);
    }
    $provideDocumentRangesFormattingEdits(handle, resource, ranges, options, token) {
        return this._withAdapter(handle, RangeFormattingAdapter, adapter => adapter.provideDocumentRangesFormattingEdits(URI.revive(resource), ranges, options, token), undefined, token);
    }
    registerOnTypeFormattingEditProvider(extension, selector, provider, triggerCharacters) {
        const handle = this._addNewAdapter(new OnTypeFormattingAdapter(this._documents, provider), extension);
        this._proxy.$registerOnTypeFormattingSupport(handle, this._transformDocumentSelector(selector, extension), triggerCharacters, extension.identifier);
        return this._createDisposable(handle);
    }
    $provideOnTypeFormattingEdits(handle, resource, position, ch, options, token) {
        return this._withAdapter(handle, OnTypeFormattingAdapter, adapter => adapter.provideOnTypeFormattingEdits(URI.revive(resource), position, ch, options, token), undefined, token);
    }
    // --- navigate types
    registerWorkspaceSymbolProvider(extension, provider) {
        const handle = this._addNewAdapter(new NavigateTypeAdapter(provider, this._logService), extension);
        this._proxy.$registerNavigateTypeSupport(handle, typeof provider.resolveWorkspaceSymbol === 'function');
        return this._createDisposable(handle);
    }
    $provideWorkspaceSymbols(handle, search, token) {
        return this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.provideWorkspaceSymbols(search, token), { symbols: [] }, token);
    }
    $resolveWorkspaceSymbol(handle, symbol, token) {
        return this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.resolveWorkspaceSymbol(symbol, token), undefined, undefined);
    }
    $releaseWorkspaceSymbols(handle, id) {
        this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.releaseWorkspaceSymbols(id), undefined, undefined);
    }
    // --- rename
    registerRenameProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new RenameAdapter(this._documents, provider, this._logService), extension);
        this._proxy.$registerRenameSupport(handle, this._transformDocumentSelector(selector, extension), RenameAdapter.supportsResolving(provider));
        return this._createDisposable(handle);
    }
    $provideRenameEdits(handle, resource, position, newName, token) {
        return this._withAdapter(handle, RenameAdapter, adapter => adapter.provideRenameEdits(URI.revive(resource), position, newName, token), undefined, token);
    }
    $resolveRenameLocation(handle, resource, position, token) {
        return this._withAdapter(handle, RenameAdapter, adapter => adapter.resolveRenameLocation(URI.revive(resource), position, token), undefined, token);
    }
    registerNewSymbolNamesProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new NewSymbolNamesAdapter(this._documents, provider, this._logService), extension);
        this._proxy.$registerNewSymbolNamesProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $supportsAutomaticNewSymbolNamesTriggerKind(handle) {
        return this._withAdapter(handle, NewSymbolNamesAdapter, adapter => adapter.supportsAutomaticNewSymbolNamesTriggerKind(), false, undefined);
    }
    $provideNewSymbolNames(handle, resource, range, triggerKind, token) {
        return this._withAdapter(handle, NewSymbolNamesAdapter, adapter => adapter.provideNewSymbolNames(URI.revive(resource), range, triggerKind, token), undefined, token);
    }
    //#region semantic coloring
    registerDocumentSemanticTokensProvider(extension, selector, provider, legend) {
        const handle = this._addNewAdapter(new DocumentSemanticTokensAdapter(this._documents, provider), extension);
        const eventHandle = (typeof provider.onDidChangeSemanticTokens === 'function' ? this._nextHandle() : undefined);
        this._proxy.$registerDocumentSemanticTokensProvider(handle, this._transformDocumentSelector(selector, extension), legend, eventHandle);
        let result = this._createDisposable(handle);
        if (eventHandle) {
            const subscription = provider.onDidChangeSemanticTokens(_ => this._proxy.$emitDocumentSemanticTokensEvent(eventHandle));
            result = Disposable.from(result, subscription);
        }
        return result;
    }
    $provideDocumentSemanticTokens(handle, resource, previousResultId, token) {
        return this._withAdapter(handle, DocumentSemanticTokensAdapter, adapter => adapter.provideDocumentSemanticTokens(URI.revive(resource), previousResultId, token), null, token);
    }
    $releaseDocumentSemanticTokens(handle, semanticColoringResultId) {
        this._withAdapter(handle, DocumentSemanticTokensAdapter, adapter => adapter.releaseDocumentSemanticColoring(semanticColoringResultId), undefined, undefined);
    }
    registerDocumentRangeSemanticTokensProvider(extension, selector, provider, legend) {
        const handle = this._addNewAdapter(new DocumentRangeSemanticTokensAdapter(this._documents, provider), extension);
        this._proxy.$registerDocumentRangeSemanticTokensProvider(handle, this._transformDocumentSelector(selector, extension), legend);
        return this._createDisposable(handle);
    }
    $provideDocumentRangeSemanticTokens(handle, resource, range, token) {
        return this._withAdapter(handle, DocumentRangeSemanticTokensAdapter, adapter => adapter.provideDocumentRangeSemanticTokens(URI.revive(resource), range, token), null, token);
    }
    //#endregion
    // --- suggestion
    registerCompletionItemProvider(extension, selector, provider, triggerCharacters) {
        const handle = this._addNewAdapter(new CompletionsAdapter(this._documents, this._commands.converter, provider, this._apiDeprecation, extension), extension);
        this._proxy.$registerCompletionsProvider(handle, this._transformDocumentSelector(selector, extension), triggerCharacters, CompletionsAdapter.supportsResolving(provider), extension.identifier);
        return this._createDisposable(handle);
    }
    $provideCompletionItems(handle, resource, position, context, token) {
        return this._withAdapter(handle, CompletionsAdapter, adapter => adapter.provideCompletionItems(URI.revive(resource), position, context, token), undefined, token);
    }
    $resolveCompletionItem(handle, id, token) {
        return this._withAdapter(handle, CompletionsAdapter, adapter => adapter.resolveCompletionItem(id, token), undefined, token);
    }
    $releaseCompletionItems(handle, id) {
        this._withAdapter(handle, CompletionsAdapter, adapter => adapter.releaseCompletionItems(id), undefined, undefined);
    }
    // --- ghost test
    registerInlineCompletionsProvider(extension, selector, provider, metadata) {
        const adapter = new InlineCompletionAdapter(extension, this._documents, provider, this._commands.converter);
        const handle = this._addNewAdapter(adapter, extension);
        this._proxy.$registerInlineCompletionsSupport(handle, this._transformDocumentSelector(selector, extension), adapter.supportsHandleEvents, ExtensionIdentifier.toKey(extension.identifier.value), metadata?.yieldTo?.map(extId => ExtensionIdentifier.toKey(extId)) || []);
        return this._createDisposable(handle);
    }
    $provideInlineCompletions(handle, resource, position, context, token) {
        return this._withAdapter(handle, InlineCompletionAdapterBase, adapter => adapter.provideInlineCompletions(URI.revive(resource), position, context, token), undefined, token);
    }
    $provideInlineEditsForRange(handle, resource, range, context, token) {
        return this._withAdapter(handle, InlineCompletionAdapterBase, adapter => adapter.provideInlineEditsForRange(URI.revive(resource), range, context, token), undefined, token);
    }
    $handleInlineCompletionDidShow(handle, pid, idx, updatedInsertText) {
        this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => {
            adapter.handleDidShowCompletionItem(pid, idx, updatedInsertText);
        }, undefined, undefined);
    }
    $handleInlineCompletionPartialAccept(handle, pid, idx, acceptedCharacters, info) {
        this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => {
            adapter.handlePartialAccept(pid, idx, acceptedCharacters, info);
        }, undefined, undefined);
    }
    $freeInlineCompletionsList(handle, pid) {
        this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => { adapter.disposeCompletions(pid); }, undefined, undefined);
    }
    // --- inline edit
    registerInlineEditProvider(extension, selector, provider) {
        const adapter = new InlineEditAdapter(extension, this._documents, provider, this._commands.converter);
        const handle = this._addNewAdapter(adapter, extension);
        this._proxy.$registerInlineEditProvider(handle, this._transformDocumentSelector(selector, extension), extension.identifier);
        return this._createDisposable(handle);
    }
    $provideInlineEdit(handle, resource, context, token) {
        return this._withAdapter(handle, InlineEditAdapter, adapter => adapter.provideInlineEdits(URI.revive(resource), context, token), undefined, token);
    }
    $freeInlineEdit(handle, pid) {
        this._withAdapter(handle, InlineEditAdapter, async (adapter) => { adapter.disposeEdit(pid); }, undefined, undefined);
    }
    // --- parameter hints
    registerSignatureHelpProvider(extension, selector, provider, metadataOrTriggerChars) {
        const metadata = Array.isArray(metadataOrTriggerChars)
            ? { triggerCharacters: metadataOrTriggerChars, retriggerCharacters: [] }
            : metadataOrTriggerChars;
        const handle = this._addNewAdapter(new SignatureHelpAdapter(this._documents, provider), extension);
        this._proxy.$registerSignatureHelpProvider(handle, this._transformDocumentSelector(selector, extension), metadata);
        return this._createDisposable(handle);
    }
    $provideSignatureHelp(handle, resource, position, context, token) {
        return this._withAdapter(handle, SignatureHelpAdapter, adapter => adapter.provideSignatureHelp(URI.revive(resource), position, context, token), undefined, token);
    }
    $releaseSignatureHelp(handle, id) {
        this._withAdapter(handle, SignatureHelpAdapter, adapter => adapter.releaseSignatureHelp(id), undefined, undefined);
    }
    // --- inline hints
    registerInlayHintsProvider(extension, selector, provider) {
        const eventHandle = typeof provider.onDidChangeInlayHints === 'function' ? this._nextHandle() : undefined;
        const handle = this._addNewAdapter(new InlayHintsAdapter(this._documents, this._commands.converter, provider, this._logService, extension), extension);
        this._proxy.$registerInlayHintsProvider(handle, this._transformDocumentSelector(selector, extension), typeof provider.resolveInlayHint === 'function', eventHandle, ExtHostLanguageFeatures._extLabel(extension));
        let result = this._createDisposable(handle);
        if (eventHandle !== undefined) {
            const subscription = provider.onDidChangeInlayHints(uri => this._proxy.$emitInlayHintsEvent(eventHandle));
            result = Disposable.from(result, subscription);
        }
        return result;
    }
    $provideInlayHints(handle, resource, range, token) {
        return this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.provideInlayHints(URI.revive(resource), range, token), undefined, token);
    }
    $resolveInlayHint(handle, id, token) {
        return this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.resolveInlayHint(id, token), undefined, token);
    }
    $releaseInlayHints(handle, id) {
        this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.releaseHints(id), undefined, undefined);
    }
    // --- links
    registerDocumentLinkProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new LinkProviderAdapter(this._documents, provider), extension);
        this._proxy.$registerDocumentLinkProvider(handle, this._transformDocumentSelector(selector, extension), typeof provider.resolveDocumentLink === 'function');
        return this._createDisposable(handle);
    }
    $provideDocumentLinks(handle, resource, token) {
        return this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.provideLinks(URI.revive(resource), token), undefined, token, resource.scheme === 'output');
    }
    $resolveDocumentLink(handle, id, token) {
        return this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.resolveLink(id, token), undefined, undefined, true);
    }
    $releaseDocumentLinks(handle, id) {
        this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.releaseLinks(id), undefined, undefined, true);
    }
    registerColorProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new ColorProviderAdapter(this._documents, provider), extension);
        this._proxy.$registerDocumentColorProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideDocumentColors(handle, resource, token) {
        return this._withAdapter(handle, ColorProviderAdapter, adapter => adapter.provideColors(URI.revive(resource), token), [], token);
    }
    $provideColorPresentations(handle, resource, colorInfo, token) {
        return this._withAdapter(handle, ColorProviderAdapter, adapter => adapter.provideColorPresentations(URI.revive(resource), colorInfo, token), undefined, token);
    }
    registerFoldingRangeProvider(extension, selector, provider) {
        const handle = this._nextHandle();
        const eventHandle = typeof provider.onDidChangeFoldingRanges === 'function' ? this._nextHandle() : undefined;
        this._adapter.set(handle, new AdapterData(new FoldingProviderAdapter(this._documents, provider), extension));
        this._proxy.$registerFoldingRangeProvider(handle, this._transformDocumentSelector(selector, extension), extension.identifier, eventHandle);
        let result = this._createDisposable(handle);
        if (eventHandle !== undefined) {
            const subscription = provider.onDidChangeFoldingRanges(() => this._proxy.$emitFoldingRangeEvent(eventHandle));
            result = Disposable.from(result, subscription);
        }
        return result;
    }
    $provideFoldingRanges(handle, resource, context, token) {
        return this._withAdapter(handle, FoldingProviderAdapter, (adapter) => adapter.provideFoldingRanges(URI.revive(resource), context, token), undefined, token);
    }
    // --- smart select
    registerSelectionRangeProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new SelectionRangeAdapter(this._documents, provider, this._logService), extension);
        this._proxy.$registerSelectionRangeProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $provideSelectionRanges(handle, resource, positions, token) {
        return this._withAdapter(handle, SelectionRangeAdapter, adapter => adapter.provideSelectionRanges(URI.revive(resource), positions, token), [], token);
    }
    // --- call hierarchy
    registerCallHierarchyProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new CallHierarchyAdapter(this._documents, provider), extension);
        this._proxy.$registerCallHierarchyProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $prepareCallHierarchy(handle, resource, position, token) {
        return this._withAdapter(handle, CallHierarchyAdapter, adapter => Promise.resolve(adapter.prepareSession(URI.revive(resource), position, token)), undefined, token);
    }
    $provideCallHierarchyIncomingCalls(handle, sessionId, itemId, token) {
        return this._withAdapter(handle, CallHierarchyAdapter, adapter => adapter.provideCallsTo(sessionId, itemId, token), undefined, token);
    }
    $provideCallHierarchyOutgoingCalls(handle, sessionId, itemId, token) {
        return this._withAdapter(handle, CallHierarchyAdapter, adapter => adapter.provideCallsFrom(sessionId, itemId, token), undefined, token);
    }
    $releaseCallHierarchy(handle, sessionId) {
        this._withAdapter(handle, CallHierarchyAdapter, adapter => Promise.resolve(adapter.releaseSession(sessionId)), undefined, undefined);
    }
    // --- type hierarchy
    registerTypeHierarchyProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new TypeHierarchyAdapter(this._documents, provider), extension);
        this._proxy.$registerTypeHierarchyProvider(handle, this._transformDocumentSelector(selector, extension));
        return this._createDisposable(handle);
    }
    $prepareTypeHierarchy(handle, resource, position, token) {
        return this._withAdapter(handle, TypeHierarchyAdapter, adapter => Promise.resolve(adapter.prepareSession(URI.revive(resource), position, token)), undefined, token);
    }
    $provideTypeHierarchySupertypes(handle, sessionId, itemId, token) {
        return this._withAdapter(handle, TypeHierarchyAdapter, adapter => adapter.provideSupertypes(sessionId, itemId, token), undefined, token);
    }
    $provideTypeHierarchySubtypes(handle, sessionId, itemId, token) {
        return this._withAdapter(handle, TypeHierarchyAdapter, adapter => adapter.provideSubtypes(sessionId, itemId, token), undefined, token);
    }
    $releaseTypeHierarchy(handle, sessionId) {
        this._withAdapter(handle, TypeHierarchyAdapter, adapter => Promise.resolve(adapter.releaseSession(sessionId)), undefined, undefined);
    }
    // --- Document on drop
    registerDocumentOnDropEditProvider(extension, selector, provider, metadata) {
        const handle = this._nextHandle();
        this._adapter.set(handle, new AdapterData(new DocumentDropEditAdapter(this._proxy, this._documents, provider, handle, extension), extension));
        this._proxy.$registerDocumentOnDropEditProvider(handle, this._transformDocumentSelector(selector, extension), isProposedApiEnabled(extension, 'documentPaste') && metadata ? {
            supportsResolve: !!provider.resolveDocumentDropEdit,
            dropMimeTypes: metadata.dropMimeTypes,
        } : undefined);
        return this._createDisposable(handle);
    }
    $provideDocumentOnDropEdits(handle, requestId, resource, position, dataTransferDto, token) {
        return this._withAdapter(handle, DocumentDropEditAdapter, adapter => Promise.resolve(adapter.provideDocumentOnDropEdits(requestId, URI.revive(resource), position, dataTransferDto, token)), undefined, undefined);
    }
    $resolveDropEdit(handle, id, token) {
        return this._withAdapter(handle, DocumentDropEditAdapter, adapter => adapter.resolveDropEdit(id, token), {}, undefined);
    }
    $releaseDocumentOnDropEdits(handle, cacheId) {
        this._withAdapter(handle, DocumentDropEditAdapter, adapter => Promise.resolve(adapter.releaseDropEdits(cacheId)), undefined, undefined);
    }
    // --- mapped edits
    registerMappedEditsProvider(extension, selector, provider) {
        const handle = this._addNewAdapter(new MappedEditsAdapter(this._documents, provider), extension);
        this._proxy.$registerMappedEditsProvider(handle, this._transformDocumentSelector(selector, extension), extension.displayName ?? extension.name);
        return this._createDisposable(handle);
    }
    $provideMappedEdits(handle, document, codeBlocks, context, token) {
        return this._withAdapter(handle, MappedEditsAdapter, adapter => Promise.resolve(adapter.provideMappedEdits(document, codeBlocks, context, token)), null, token);
    }
    // --- copy/paste actions
    registerDocumentPasteEditProvider(extension, selector, provider, metadata) {
        const handle = this._nextHandle();
        this._adapter.set(handle, new AdapterData(new DocumentPasteEditProvider(this._proxy, this._documents, provider, handle, extension), extension));
        this._proxy.$registerPasteEditProvider(handle, this._transformDocumentSelector(selector, extension), {
            supportsCopy: !!provider.prepareDocumentPaste,
            supportsPaste: !!provider.provideDocumentPasteEdits,
            supportsResolve: !!provider.resolveDocumentPasteEdit,
            providedPasteEditKinds: metadata.providedPasteEditKinds?.map(x => x.value),
            copyMimeTypes: metadata.copyMimeTypes,
            pasteMimeTypes: metadata.pasteMimeTypes,
        });
        return this._createDisposable(handle);
    }
    $prepareDocumentPaste(handle, resource, ranges, dataTransfer, token) {
        return this._withAdapter(handle, DocumentPasteEditProvider, adapter => adapter.prepareDocumentPaste(URI.revive(resource), ranges, dataTransfer, token), undefined, token);
    }
    $providePasteEdits(handle, requestId, resource, ranges, dataTransferDto, context, token) {
        return this._withAdapter(handle, DocumentPasteEditProvider, adapter => adapter.providePasteEdits(requestId, URI.revive(resource), ranges, dataTransferDto, context, token), undefined, token);
    }
    $resolvePasteEdit(handle, id, token) {
        return this._withAdapter(handle, DocumentPasteEditProvider, adapter => adapter.resolvePasteEdit(id, token), {}, undefined);
    }
    $releasePasteEdits(handle, cacheId) {
        this._withAdapter(handle, DocumentPasteEditProvider, adapter => Promise.resolve(adapter.releasePasteEdits(cacheId)), undefined, undefined);
    }
    // --- configuration
    static _serializeRegExp(regExp) {
        return {
            pattern: regExp.source,
            flags: regExp.flags,
        };
    }
    static _serializeIndentationRule(indentationRule) {
        return {
            decreaseIndentPattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.decreaseIndentPattern),
            increaseIndentPattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.increaseIndentPattern),
            indentNextLinePattern: indentationRule.indentNextLinePattern ? ExtHostLanguageFeatures._serializeRegExp(indentationRule.indentNextLinePattern) : undefined,
            unIndentedLinePattern: indentationRule.unIndentedLinePattern ? ExtHostLanguageFeatures._serializeRegExp(indentationRule.unIndentedLinePattern) : undefined,
        };
    }
    static _serializeOnEnterRule(onEnterRule) {
        return {
            beforeText: ExtHostLanguageFeatures._serializeRegExp(onEnterRule.beforeText),
            afterText: onEnterRule.afterText ? ExtHostLanguageFeatures._serializeRegExp(onEnterRule.afterText) : undefined,
            previousLineText: onEnterRule.previousLineText ? ExtHostLanguageFeatures._serializeRegExp(onEnterRule.previousLineText) : undefined,
            action: onEnterRule.action
        };
    }
    static _serializeOnEnterRules(onEnterRules) {
        return onEnterRules.map(ExtHostLanguageFeatures._serializeOnEnterRule);
    }
    static _serializeAutoClosingPair(autoClosingPair) {
        return {
            open: autoClosingPair.open,
            close: autoClosingPair.close,
            notIn: autoClosingPair.notIn ? autoClosingPair.notIn.map(v => SyntaxTokenType.toString(v)) : undefined,
        };
    }
    static _serializeAutoClosingPairs(autoClosingPairs) {
        return autoClosingPairs.map(ExtHostLanguageFeatures._serializeAutoClosingPair);
    }
    setLanguageConfiguration(extension, languageId, configuration) {
        const { wordPattern } = configuration;
        // check for a valid word pattern
        if (wordPattern && regExpLeadsToEndlessLoop(wordPattern)) {
            throw new Error(`Invalid language configuration: wordPattern '${wordPattern}' is not allowed to match the empty string.`);
        }
        // word definition
        if (wordPattern) {
            this._documents.setWordDefinitionFor(languageId, wordPattern);
        }
        else {
            this._documents.setWordDefinitionFor(languageId, undefined);
        }
        if (configuration.__electricCharacterSupport) {
            this._apiDeprecation.report('LanguageConfiguration.__electricCharacterSupport', extension, `Do not use.`);
        }
        if (configuration.__characterPairSupport) {
            this._apiDeprecation.report('LanguageConfiguration.__characterPairSupport', extension, `Do not use.`);
        }
        const handle = this._nextHandle();
        const serializedConfiguration = {
            comments: configuration.comments,
            brackets: configuration.brackets,
            wordPattern: configuration.wordPattern ? ExtHostLanguageFeatures._serializeRegExp(configuration.wordPattern) : undefined,
            indentationRules: configuration.indentationRules ? ExtHostLanguageFeatures._serializeIndentationRule(configuration.indentationRules) : undefined,
            onEnterRules: configuration.onEnterRules ? ExtHostLanguageFeatures._serializeOnEnterRules(configuration.onEnterRules) : undefined,
            __electricCharacterSupport: configuration.__electricCharacterSupport,
            __characterPairSupport: configuration.__characterPairSupport,
            autoClosingPairs: configuration.autoClosingPairs ? ExtHostLanguageFeatures._serializeAutoClosingPairs(configuration.autoClosingPairs) : undefined,
        };
        this._proxy.$setLanguageConfiguration(handle, languageId, serializedConfiguration);
        return this._createDisposable(handle);
    }
    $setWordDefinitions(wordDefinitions) {
        for (const wordDefinition of wordDefinitions) {
            this._documents.setWordDefinitionFor(wordDefinition.languageId, new RegExp(wordDefinition.regexSource, wordDefinition.regexFlags));
        }
    }
}
