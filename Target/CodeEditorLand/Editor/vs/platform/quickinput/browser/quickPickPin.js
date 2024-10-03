import { Codicon } from '../../../base/common/codicons.js';
import { localize } from '../../../nls.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
const pinButtonClass = ThemeIcon.asClassName(Codicon.pin);
const pinnedButtonClass = ThemeIcon.asClassName(Codicon.pinned);
const buttonClasses = [pinButtonClass, pinnedButtonClass];
export function showWithPinnedItems(storageService, storageKey, quickPick, filterDuplicates) {
    const itemsWithoutPinned = quickPick.items;
    let itemsWithPinned = _formatPinnedItems(storageKey, quickPick, storageService, undefined, filterDuplicates);
    const disposables = new DisposableStore();
    disposables.add(quickPick.onDidTriggerItemButton(async (buttonEvent) => {
        const expectedButton = buttonEvent.button.iconClass && buttonClasses.includes(buttonEvent.button.iconClass);
        if (expectedButton) {
            quickPick.items = itemsWithoutPinned;
            itemsWithPinned = _formatPinnedItems(storageKey, quickPick, storageService, buttonEvent.item, filterDuplicates);
            quickPick.items = quickPick.value ? itemsWithoutPinned : itemsWithPinned;
        }
    }));
    disposables.add(quickPick.onDidChangeValue(async (value) => {
        if (quickPick.items === itemsWithPinned && value) {
            quickPick.items = itemsWithoutPinned;
        }
        else if (quickPick.items === itemsWithoutPinned && !value) {
            quickPick.items = itemsWithPinned;
        }
    }));
    quickPick.items = quickPick.value ? itemsWithoutPinned : itemsWithPinned;
    quickPick.show();
    return disposables;
}
function _formatPinnedItems(storageKey, quickPick, storageService, changedItem, filterDuplicates) {
    const formattedItems = [];
    let pinnedItems;
    if (changedItem) {
        pinnedItems = updatePinnedItems(storageKey, changedItem, storageService);
    }
    else {
        pinnedItems = getPinnedItems(storageKey, storageService);
    }
    if (pinnedItems.length) {
        formattedItems.push({ type: 'separator', label: localize("terminal.commands.pinned", 'pinned') });
    }
    const pinnedIds = new Set();
    for (const itemToFind of pinnedItems) {
        const itemToPin = quickPick.items.find(item => itemsMatch(item, itemToFind));
        if (itemToPin) {
            const pinnedItemId = getItemIdentifier(itemToPin);
            const pinnedItem = { ...itemToPin };
            if (!filterDuplicates || !pinnedIds.has(pinnedItemId)) {
                pinnedIds.add(pinnedItemId);
                updateButtons(pinnedItem, false);
                formattedItems.push(pinnedItem);
            }
        }
    }
    for (const item of quickPick.items) {
        updateButtons(item, true);
        formattedItems.push(item);
    }
    return formattedItems;
}
function getItemIdentifier(item) {
    return item.type === 'separator' ? '' : item.id || `${item.label}${item.description}${item.detail}}`;
}
function updateButtons(item, removePin) {
    if (item.type === 'separator') {
        return;
    }
    const newButtons = item.buttons?.filter(button => button.iconClass && !buttonClasses.includes(button.iconClass)) ?? [];
    newButtons.unshift({
        iconClass: removePin ? pinButtonClass : pinnedButtonClass,
        tooltip: removePin ? localize('pinCommand', "Pin command") : localize('pinnedCommand', "Pinned command"),
        alwaysVisible: false
    });
    item.buttons = newButtons;
}
function itemsMatch(itemA, itemB) {
    return getItemIdentifier(itemA) === getItemIdentifier(itemB);
}
function updatePinnedItems(storageKey, changedItem, storageService) {
    const removePin = changedItem.buttons?.find(b => b.iconClass === pinnedButtonClass);
    let items = getPinnedItems(storageKey, storageService);
    if (removePin) {
        items = items.filter(item => getItemIdentifier(item) !== getItemIdentifier(changedItem));
    }
    else {
        items.push(changedItem);
    }
    storageService.store(storageKey, JSON.stringify(items), 1, 1);
    return items;
}
function getPinnedItems(storageKey, storageService) {
    const items = storageService.get(storageKey, 1);
    return items ? JSON.parse(items) : [];
}
