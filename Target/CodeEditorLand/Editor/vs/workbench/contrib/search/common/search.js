import { onUnexpectedExternalError } from '../../../../base/common/errors.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { Range } from '../../../../editor/common/core/range.js';
import { isNumber } from '../../../../base/common/types.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { compare } from '../../../../base/common/strings.js';
import { groupBy } from '../../../../base/common/arrays.js';
export var WorkspaceSymbolProviderRegistry;
(function (WorkspaceSymbolProviderRegistry) {
    const _supports = [];
    function register(provider) {
        let support = provider;
        if (support) {
            _supports.push(support);
        }
        return {
            dispose() {
                if (support) {
                    const idx = _supports.indexOf(support);
                    if (idx >= 0) {
                        _supports.splice(idx, 1);
                        support = undefined;
                    }
                }
            }
        };
    }
    WorkspaceSymbolProviderRegistry.register = register;
    function all() {
        return _supports.slice(0);
    }
    WorkspaceSymbolProviderRegistry.all = all;
})(WorkspaceSymbolProviderRegistry || (WorkspaceSymbolProviderRegistry = {}));
export class WorkspaceSymbolItem {
    constructor(symbol, provider) {
        this.symbol = symbol;
        this.provider = provider;
    }
}
export async function getWorkspaceSymbols(query, token = CancellationToken.None) {
    const all = [];
    const promises = WorkspaceSymbolProviderRegistry.all().map(async (provider) => {
        try {
            const value = await provider.provideWorkspaceSymbols(query, token);
            if (!value) {
                return;
            }
            for (const symbol of value) {
                all.push(new WorkspaceSymbolItem(symbol, provider));
            }
        }
        catch (err) {
            onUnexpectedExternalError(err);
        }
    });
    await Promise.all(promises);
    if (token.isCancellationRequested) {
        return [];
    }
    function compareItems(a, b) {
        let res = compare(a.symbol.name, b.symbol.name);
        if (res === 0) {
            res = a.symbol.kind - b.symbol.kind;
        }
        if (res === 0) {
            res = compare(a.symbol.location.uri.toString(), b.symbol.location.uri.toString());
        }
        if (res === 0) {
            if (a.symbol.location.range && b.symbol.location.range) {
                if (!Range.areIntersecting(a.symbol.location.range, b.symbol.location.range)) {
                    res = Range.compareRangesUsingStarts(a.symbol.location.range, b.symbol.location.range);
                }
            }
            else if (a.provider.resolveWorkspaceSymbol && !b.provider.resolveWorkspaceSymbol) {
                res = -1;
            }
            else if (!a.provider.resolveWorkspaceSymbol && b.provider.resolveWorkspaceSymbol) {
                res = 1;
            }
        }
        if (res === 0) {
            res = compare(a.symbol.containerName ?? '', b.symbol.containerName ?? '');
        }
        return res;
    }
    return groupBy(all, compareItems).map(group => group[0]).flat();
}
export function getOutOfWorkspaceEditorResources(accessor) {
    const editorService = accessor.get(IEditorService);
    const contextService = accessor.get(IWorkspaceContextService);
    const fileService = accessor.get(IFileService);
    const resources = editorService.editors
        .map(editor => EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY }))
        .filter(resource => !!resource && !contextService.isInsideWorkspace(resource) && fileService.hasProvider(resource));
    return resources;
}
const LINE_COLON_PATTERN = /\s?[#:\(](?:line )?(\d*)(?:[#:,](\d*))?\)?:?\s*$/;
export function extractRangeFromFilter(filter, unless) {
    if (!filter || unless?.some(value => {
        const unlessCharPos = filter.indexOf(value);
        return unlessCharPos === 0 || unlessCharPos > 0 && !LINE_COLON_PATTERN.test(filter.substring(unlessCharPos + 1));
    })) {
        return undefined;
    }
    let range = undefined;
    const patternMatch = LINE_COLON_PATTERN.exec(filter);
    if (patternMatch) {
        const startLineNumber = parseInt(patternMatch[1] ?? '', 10);
        if (isNumber(startLineNumber)) {
            range = {
                startLineNumber: startLineNumber,
                startColumn: 1,
                endLineNumber: startLineNumber,
                endColumn: 1
            };
            const startColumn = parseInt(patternMatch[2] ?? '', 10);
            if (isNumber(startColumn)) {
                range = {
                    startLineNumber: range.startLineNumber,
                    startColumn: startColumn,
                    endLineNumber: range.endLineNumber,
                    endColumn: startColumn
                };
            }
        }
        else if (patternMatch[1] === '') {
            range = {
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 1,
                endColumn: 1
            };
        }
    }
    if (patternMatch && range) {
        return {
            filter: filter.substr(0, patternMatch.index),
            range
        };
    }
    return undefined;
}
export var SearchUIState;
(function (SearchUIState) {
    SearchUIState[SearchUIState["Idle"] = 0] = "Idle";
    SearchUIState[SearchUIState["Searching"] = 1] = "Searching";
    SearchUIState[SearchUIState["SlowSearch"] = 2] = "SlowSearch";
})(SearchUIState || (SearchUIState = {}));
export const SearchStateKey = new RawContextKey('searchState', SearchUIState.Idle);
