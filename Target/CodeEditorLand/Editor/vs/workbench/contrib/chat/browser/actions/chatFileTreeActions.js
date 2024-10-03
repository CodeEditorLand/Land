import { localize2 } from '../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { CHAT_CATEGORY } from './chatActions.js';
import { IChatWidgetService } from '../chat.js';
import { CONTEXT_IN_CHAT_SESSION, CONTEXT_CHAT_ENABLED } from '../../common/chatContextKeys.js';
import { isResponseVM } from '../../common/chatViewModel.js';
export function registerChatFileTreeActions() {
    registerAction2(class NextFileTreeAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.nextFileTree',
                title: localize2('interactive.nextFileTree.label', "Next File Tree"),
                keybinding: {
                    primary: 2048 | 67,
                    weight: 200,
                    when: CONTEXT_IN_CHAT_SESSION,
                },
                precondition: CONTEXT_CHAT_ENABLED,
                f1: true,
                category: CHAT_CATEGORY,
            });
        }
        run(accessor, ...args) {
            navigateTrees(accessor, false);
        }
    });
    registerAction2(class PreviousFileTreeAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.previousFileTree',
                title: localize2('interactive.previousFileTree.label', "Previous File Tree"),
                keybinding: {
                    primary: 2048 | 1024 | 67,
                    weight: 200,
                    when: CONTEXT_IN_CHAT_SESSION,
                },
                precondition: CONTEXT_CHAT_ENABLED,
                f1: true,
                category: CHAT_CATEGORY,
            });
        }
        run(accessor, ...args) {
            navigateTrees(accessor, true);
        }
    });
}
function navigateTrees(accessor, reverse) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
        return;
    }
    const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
    const focusedResponse = isResponseVM(focused) ? focused : undefined;
    const currentResponse = focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => isResponseVM(item));
    if (!currentResponse) {
        return;
    }
    widget.reveal(currentResponse);
    const responseFileTrees = widget.getFileTreeInfosForResponse(currentResponse);
    const lastFocusedFileTree = widget.getLastFocusedFileTreeForResponse(currentResponse);
    const focusIdx = lastFocusedFileTree ?
        (lastFocusedFileTree.treeIndex + (reverse ? -1 : 1) + responseFileTrees.length) % responseFileTrees.length :
        reverse ? responseFileTrees.length - 1 : 0;
    responseFileTrees[focusIdx]?.focus();
}
