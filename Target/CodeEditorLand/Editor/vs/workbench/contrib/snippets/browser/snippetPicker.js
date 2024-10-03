import * as nls from '../../../../nls.js';
import { ISnippetsService } from './snippets.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
export async function pickSnippet(accessor, languageIdOrSnippets) {
    const snippetService = accessor.get(ISnippetsService);
    const quickInputService = accessor.get(IQuickInputService);
    let snippets;
    if (Array.isArray(languageIdOrSnippets)) {
        snippets = languageIdOrSnippets;
    }
    else {
        snippets = (await snippetService.getSnippets(languageIdOrSnippets, { includeDisabledSnippets: true, includeNoPrefixSnippets: true }));
    }
    snippets.sort((a, b) => a.snippetSource - b.snippetSource);
    const makeSnippetPicks = () => {
        const result = [];
        let prevSnippet;
        for (const snippet of snippets) {
            const pick = {
                label: snippet.prefix || snippet.name,
                detail: snippet.description || snippet.body,
                snippet
            };
            if (!prevSnippet || prevSnippet.snippetSource !== snippet.snippetSource || prevSnippet.source !== snippet.source) {
                let label = '';
                switch (snippet.snippetSource) {
                    case 1:
                        label = nls.localize('sep.userSnippet', "User Snippets");
                        break;
                    case 3:
                        label = snippet.source;
                        break;
                    case 2:
                        label = nls.localize('sep.workspaceSnippet', "Workspace Snippets");
                        break;
                }
                result.push({ type: 'separator', label });
            }
            if (snippet.snippetSource === 3) {
                const isEnabled = snippetService.isEnabled(snippet);
                if (isEnabled) {
                    pick.buttons = [{
                            iconClass: ThemeIcon.asClassName(Codicon.eyeClosed),
                            tooltip: nls.localize('disableSnippet', 'Hide from IntelliSense')
                        }];
                }
                else {
                    pick.description = nls.localize('isDisabled', "(hidden from IntelliSense)");
                    pick.buttons = [{
                            iconClass: ThemeIcon.asClassName(Codicon.eye),
                            tooltip: nls.localize('enable.snippet', 'Show in IntelliSense')
                        }];
                }
            }
            result.push(pick);
            prevSnippet = snippet;
        }
        return result;
    };
    const disposables = new DisposableStore();
    const picker = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
    picker.placeholder = nls.localize('pick.placeholder', "Select a snippet");
    picker.matchOnDetail = true;
    picker.ignoreFocusOut = false;
    picker.keepScrollPosition = true;
    disposables.add(picker.onDidTriggerItemButton(ctx => {
        const isEnabled = snippetService.isEnabled(ctx.item.snippet);
        snippetService.updateEnablement(ctx.item.snippet, !isEnabled);
        picker.items = makeSnippetPicks();
    }));
    picker.items = makeSnippetPicks();
    if (!picker.items.length) {
        picker.validationMessage = nls.localize('pick.noSnippetAvailable', "No snippet available");
    }
    picker.show();
    await Promise.race([Event.toPromise(picker.onDidAccept), Event.toPromise(picker.onDidHide)]);
    const result = picker.selectedItems[0]?.snippet;
    disposables.dispose();
    return result;
}
