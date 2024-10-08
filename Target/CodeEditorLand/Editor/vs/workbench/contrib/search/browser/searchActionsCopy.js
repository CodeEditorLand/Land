/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from '../../../../nls.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import * as Constants from '../common/constants.js';
import { FileMatch, FolderMatch, FolderMatchWithResource, Match, searchMatchComparer } from './searchModel.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { category, getSearchView } from './searchActionsBase.js';
import { isWindows } from '../../../../base/common/platform.js';
//#region Actions
registerAction2(class CopyMatchCommandAction extends Action2 {
    constructor() {
        super({
            id: "search.action.copyMatch" /* Constants.SearchCommandIds.CopyMatchCommandId */,
            title: nls.localize2('copyMatchLabel', "Copy"),
            category,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: Constants.SearchContext.FileMatchOrMatchFocusKey,
                primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            },
            menu: [{
                    id: MenuId.SearchContext,
                    when: Constants.SearchContext.FileMatchOrMatchFocusKey,
                    group: 'search_2',
                    order: 1
                }]
        });
    }
    async run(accessor, match) {
        await copyMatchCommand(accessor, match);
    }
});
registerAction2(class CopyPathCommandAction extends Action2 {
    constructor() {
        super({
            id: "search.action.copyPath" /* Constants.SearchCommandIds.CopyPathCommandId */,
            title: nls.localize2('copyPathLabel', "Copy Path"),
            category,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: Constants.SearchContext.FileMatchOrFolderMatchWithResourceFocusKey,
                primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
                win: {
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */
                },
            },
            menu: [{
                    id: MenuId.SearchContext,
                    when: Constants.SearchContext.FileMatchOrFolderMatchWithResourceFocusKey,
                    group: 'search_2',
                    order: 2
                }]
        });
    }
    async run(accessor, fileMatch) {
        await copyPathCommand(accessor, fileMatch);
    }
});
registerAction2(class CopyAllCommandAction extends Action2 {
    constructor() {
        super({
            id: "search.action.copyAll" /* Constants.SearchCommandIds.CopyAllCommandId */,
            title: nls.localize2('copyAllLabel', "Copy All"),
            category,
            menu: [{
                    id: MenuId.SearchContext,
                    when: Constants.SearchContext.HasSearchResults,
                    group: 'search_2',
                    order: 3
                }]
        });
    }
    async run(accessor) {
        await copyAllCommand(accessor);
    }
});
//#endregion
//#region Helpers
export const lineDelimiter = isWindows ? '\r\n' : '\n';
async function copyPathCommand(accessor, fileMatch) {
    if (!fileMatch) {
        const selection = getSelectedRow(accessor);
        if (!(selection instanceof FileMatch || selection instanceof FolderMatchWithResource)) {
            return;
        }
        fileMatch = selection;
    }
    const clipboardService = accessor.get(IClipboardService);
    const labelService = accessor.get(ILabelService);
    const text = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
    await clipboardService.writeText(text);
}
async function copyMatchCommand(accessor, match) {
    if (!match) {
        const selection = getSelectedRow(accessor);
        if (!selection) {
            return;
        }
        match = selection;
    }
    const clipboardService = accessor.get(IClipboardService);
    const labelService = accessor.get(ILabelService);
    let text;
    if (match instanceof Match) {
        text = matchToString(match);
    }
    else if (match instanceof FileMatch) {
        text = fileMatchToString(match, labelService).text;
    }
    else if (match instanceof FolderMatch) {
        text = folderMatchToString(match, labelService).text;
    }
    if (text) {
        await clipboardService.writeText(text);
    }
}
async function copyAllCommand(accessor) {
    const viewsService = accessor.get(IViewsService);
    const clipboardService = accessor.get(IClipboardService);
    const labelService = accessor.get(ILabelService);
    const searchView = getSearchView(viewsService);
    if (searchView) {
        const root = searchView.searchResult;
        const text = allFolderMatchesToString(root.folderMatches(), labelService);
        await clipboardService.writeText(text);
    }
}
function matchToString(match, indent = 0) {
    const getFirstLinePrefix = () => `${match.range().startLineNumber},${match.range().startColumn}`;
    const getOtherLinePrefix = (i) => match.range().startLineNumber + i + '';
    const fullMatchLines = match.fullPreviewLines();
    const largestPrefixSize = fullMatchLines.reduce((largest, _, i) => {
        const thisSize = i === 0 ?
            getFirstLinePrefix().length :
            getOtherLinePrefix(i).length;
        return Math.max(thisSize, largest);
    }, 0);
    const formattedLines = fullMatchLines
        .map((line, i) => {
        const prefix = i === 0 ?
            getFirstLinePrefix() :
            getOtherLinePrefix(i);
        const paddingStr = ' '.repeat(largestPrefixSize - prefix.length);
        const indentStr = ' '.repeat(indent);
        return `${indentStr}${prefix}: ${paddingStr}${line}`;
    });
    return formattedLines.join('\n');
}
function fileFolderMatchToString(match, labelService) {
    if (match instanceof FileMatch) {
        return fileMatchToString(match, labelService);
    }
    else {
        return folderMatchToString(match, labelService);
    }
}
function fileMatchToString(fileMatch, labelService) {
    const matchTextRows = fileMatch.matches()
        .sort(searchMatchComparer)
        .map(match => matchToString(match, 2));
    const uriString = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
    return {
        text: `${uriString}${lineDelimiter}${matchTextRows.join(lineDelimiter)}`,
        count: matchTextRows.length
    };
}
function folderMatchToString(folderMatch, labelService) {
    const results = [];
    let numMatches = 0;
    const matches = folderMatch.matches().sort(searchMatchComparer);
    matches.forEach(match => {
        const result = fileFolderMatchToString(match, labelService);
        numMatches += result.count;
        results.push(result.text);
    });
    return {
        text: results.join(lineDelimiter + lineDelimiter),
        count: numMatches
    };
}
function allFolderMatchesToString(folderMatches, labelService) {
    const folderResults = [];
    folderMatches = folderMatches.sort(searchMatchComparer);
    for (let i = 0; i < folderMatches.length; i++) {
        const folderResult = folderMatchToString(folderMatches[i], labelService);
        if (folderResult.count) {
            folderResults.push(folderResult.text);
        }
    }
    return folderResults.join(lineDelimiter + lineDelimiter);
}
function getSelectedRow(accessor) {
    const viewsService = accessor.get(IViewsService);
    const searchView = getSearchView(viewsService);
    return searchView?.getControl().getSelection()[0];
}
//#endregion
