import { MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { Action } from '../../../../base/common/actions.js';
import { createActionViewItem, createAndFillInActionBarActions, createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { equals } from '../../../../base/common/arrays.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { reset } from '../../../../base/browser/dom.js';
import { ResourceTree } from '../../../../base/common/resourceTree.js';
export function isSCMViewService(element) {
    return Array.isArray(element.repositories) && Array.isArray(element.visibleRepositories);
}
export function isSCMRepository(element) {
    return !!element.provider && !!element.input;
}
export function isSCMInput(element) {
    return !!element.validateInput && typeof element.value === 'string';
}
export function isSCMActionButton(element) {
    return element.type === 'actionButton';
}
export function isSCMResourceGroup(element) {
    return !!element.provider && !!element.resources;
}
export function isSCMResource(element) {
    return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
}
export function isSCMResourceNode(element) {
    return ResourceTree.isResourceNode(element) && isSCMResourceGroup(element.context);
}
export function isSCMHistoryItemViewModelTreeElement(element) {
    return element.type === 'historyItemViewModel';
}
export function isSCMHistoryItemLoadMoreTreeElement(element) {
    return element.type === 'historyItemLoadMore';
}
const compareActions = (a, b) => {
    if (a instanceof MenuItemAction && b instanceof MenuItemAction) {
        return a.id === b.id && a.enabled === b.enabled && a.hideActions?.isHidden === b.hideActions?.isHidden;
    }
    return a.id === b.id && a.enabled === b.enabled;
};
export function connectPrimaryMenu(menu, callback, primaryGroup) {
    let cachedPrimary = [];
    let cachedSecondary = [];
    const updateActions = () => {
        const primary = [];
        const secondary = [];
        createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, { primary, secondary }, primaryGroup);
        if (equals(cachedPrimary, primary, compareActions) && equals(cachedSecondary, secondary, compareActions)) {
            return;
        }
        cachedPrimary = primary;
        cachedSecondary = secondary;
        callback(primary, secondary);
    };
    updateActions();
    return menu.onDidChange(updateActions);
}
export function connectPrimaryMenuToInlineActionBar(menu, actionBar) {
    return connectPrimaryMenu(menu, (primary) => {
        actionBar.clear();
        actionBar.push(primary, { icon: true, label: false });
    }, 'inline');
}
export function collectContextMenuActions(menu) {
    const primary = [];
    const actions = [];
    createAndFillInContextMenuActions(menu, { shouldForwardArgs: true }, { primary, secondary: actions }, 'inline');
    return actions;
}
export class StatusBarAction extends Action {
    constructor(command, commandService) {
        super(`statusbaraction{${command.id}}`, command.title, '', true);
        this.command = command;
        this.commandService = commandService;
        this.tooltip = command.tooltip || '';
    }
    run() {
        return this.commandService.executeCommand(this.command.id, ...(this.command.arguments || []));
    }
}
class StatusBarActionViewItem extends ActionViewItem {
    constructor(action, options) {
        super(null, action, { ...options, icon: false, label: true });
    }
    updateLabel() {
        if (this.options.label && this.label) {
            reset(this.label, ...renderLabelWithIcons(this.action.label));
        }
    }
}
export function getActionViewItemProvider(instaService) {
    return (action, options) => {
        if (action instanceof StatusBarAction) {
            return new StatusBarActionViewItem(action, options);
        }
        return createActionViewItem(instaService, action, options);
    };
}
export function getProviderKey(provider) {
    return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ''}`;
}
export function getRepositoryResourceCount(provider) {
    return provider.groups.reduce((r, g) => r + g.resources.length, 0);
}
export function getHistoryItemEditorTitle(historyItem, maxLength = 20) {
    const title = historyItem.subject.length <= maxLength ?
        historyItem.subject : `${historyItem.subject.substring(0, maxLength)}\u2026`;
    return `${historyItem.displayId ?? historyItem.id} - ${title}`;
}
export function compareHistoryItemRefs(ref1, ref2, currentHistoryItemRef, currentHistoryItemRemoteRef, currentHistoryItemBaseRef) {
    const getHistoryItemRefOrder = (ref) => {
        if (ref.id === currentHistoryItemRef?.id) {
            return 1;
        }
        else if (ref.id === currentHistoryItemRemoteRef?.id) {
            return 2;
        }
        else if (ref.id === currentHistoryItemBaseRef?.id) {
            return 3;
        }
        else if (ref.color !== undefined) {
            return 4;
        }
        return 99;
    };
    const ref1Order = getHistoryItemRefOrder(ref1);
    const ref2Order = getHistoryItemRefOrder(ref2);
    return ref1Order - ref2Order;
}
