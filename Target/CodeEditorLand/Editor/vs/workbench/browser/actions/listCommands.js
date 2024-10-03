import { KeyChord } from '../../../base/common/keyCodes.js';
import { KeybindingsRegistry } from '../../../platform/keybinding/common/keybindingsRegistry.js';
import { List } from '../../../base/browser/ui/list/listWidget.js';
import { WorkbenchListFocusContextKey, IListService, WorkbenchListSupportsMultiSelectContextKey, WorkbenchListHasSelectionOrFocus, getSelectionKeyboardEvent, WorkbenchListSelectionNavigation, WorkbenchTreeElementCanCollapse, WorkbenchTreeElementHasParent, WorkbenchTreeElementHasChild, WorkbenchTreeElementCanExpand, RawWorkbenchListFocusContextKey, WorkbenchTreeFindOpen, WorkbenchListSupportsFind, WorkbenchListScrollAtBottomContextKey, WorkbenchListScrollAtTopContextKey, WorkbenchTreeStickyScrollFocused } from '../../../platform/list/browser/listService.js';
import { PagedList } from '../../../base/browser/ui/list/listPaging.js';
import { equals, range } from '../../../base/common/arrays.js';
import { ContextKeyExpr } from '../../../platform/contextkey/common/contextkey.js';
import { ObjectTree } from '../../../base/browser/ui/tree/objectTree.js';
import { AsyncDataTree } from '../../../base/browser/ui/tree/asyncDataTree.js';
import { DataTree } from '../../../base/browser/ui/tree/dataTree.js';
import { CommandsRegistry } from '../../../platform/commands/common/commands.js';
import { Table } from '../../../base/browser/ui/table/tableWidget.js';
import { AbstractTree, TreeFindMatchType, TreeFindMode } from '../../../base/browser/ui/tree/abstractTree.js';
import { isActiveElement } from '../../../base/browser/dom.js';
import { Action2, registerAction2 } from '../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { localize, localize2 } from '../../../nls.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
function ensureDOMFocus(widget) {
    const element = widget?.getHTMLElement();
    if (element && !isActiveElement(element)) {
        widget?.domFocus();
    }
}
async function updateFocus(widget, updateFocusFn) {
    if (!WorkbenchListSelectionNavigation.getValue(widget.contextKeyService)) {
        return updateFocusFn(widget);
    }
    const focus = widget.getFocus();
    const selection = widget.getSelection();
    await updateFocusFn(widget);
    const newFocus = widget.getFocus();
    if (selection.length > 1 || !equals(focus, selection) || equals(focus, newFocus)) {
        return;
    }
    const fakeKeyboardEvent = new KeyboardEvent('keydown');
    widget.setSelection(newFocus, fakeKeyboardEvent);
}
async function navigate(widget, updateFocusFn) {
    if (!widget) {
        return;
    }
    await updateFocus(widget, updateFocusFn);
    const listFocus = widget.getFocus();
    if (listFocus.length) {
        widget.reveal(listFocus[0]);
    }
    widget.setAnchor(listFocus[0]);
    ensureDOMFocus(widget);
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusDown',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 18,
    mac: {
        primary: 18,
        secondary: [256 | 44]
    },
    handler: (accessor, arg2) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            await widget.focusNext(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusUp',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 16,
    mac: {
        primary: 16,
        secondary: [256 | 46]
    },
    handler: (accessor, arg2) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            await widget.focusPrevious(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusAnyDown',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 512 | 18,
    mac: {
        primary: 512 | 18,
        secondary: [256 | 512 | 44]
    },
    handler: (accessor, arg2) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown', { altKey: true });
            await widget.focusNext(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusAnyUp',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 512 | 16,
    mac: {
        primary: 512 | 16,
        secondary: [256 | 512 | 46]
    },
    handler: (accessor, arg2) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown', { altKey: true });
            await widget.focusPrevious(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusPageDown',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 12,
    handler: (accessor) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            await widget.focusNextPage(fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusPageUp',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 11,
    handler: (accessor) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            await widget.focusPreviousPage(fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusFirst',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 14,
    handler: (accessor) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            await widget.focusFirst(fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusLast',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 13,
    handler: (accessor) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            await widget.focusLast(fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusAnyFirst',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 512 | 14,
    handler: (accessor) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown', { altKey: true });
            await widget.focusFirst(fakeKeyboardEvent);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusAnyLast',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 512 | 13,
    handler: (accessor) => {
        navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
            const fakeKeyboardEvent = new KeyboardEvent('keydown', { altKey: true });
            await widget.focusLast(fakeKeyboardEvent);
        });
    }
});
function expandMultiSelection(focused, previousFocus) {
    if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
        const list = focused;
        const focus = list.getFocus() ? list.getFocus()[0] : undefined;
        const selection = list.getSelection();
        if (selection && typeof focus === 'number' && selection.indexOf(focus) >= 0) {
            list.setSelection(selection.filter(s => s !== previousFocus));
        }
        else {
            if (typeof focus === 'number') {
                list.setSelection(selection.concat(focus));
            }
        }
    }
    else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
        const list = focused;
        const focus = list.getFocus() ? list.getFocus()[0] : undefined;
        if (previousFocus === focus) {
            return;
        }
        const selection = list.getSelection();
        const fakeKeyboardEvent = new KeyboardEvent('keydown', { shiftKey: true });
        if (selection && selection.indexOf(focus) >= 0) {
            list.setSelection(selection.filter(s => s !== previousFocus), fakeKeyboardEvent);
        }
        else {
            list.setSelection(selection.concat(focus), fakeKeyboardEvent);
        }
    }
}
function revealFocusedStickyScroll(tree, postRevealAction) {
    const focus = tree.getStickyScrollFocus();
    if (focus.length === 0) {
        throw new Error(`StickyScroll has no focus`);
    }
    if (focus.length > 1) {
        throw new Error(`StickyScroll can only have a single focused item`);
    }
    tree.reveal(focus[0]);
    tree.getHTMLElement().focus();
    tree.setFocus(focus);
    postRevealAction?.(focus[0]);
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.expandSelectionDown',
    weight: 200,
    when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListSupportsMultiSelectContextKey),
    primary: 1024 | 18,
    handler: (accessor, arg2) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget) {
            return;
        }
        const previousFocus = widget.getFocus() ? widget.getFocus()[0] : undefined;
        const fakeKeyboardEvent = new KeyboardEvent('keydown');
        widget.focusNext(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
        expandMultiSelection(widget, previousFocus);
        const focus = widget.getFocus();
        if (focus.length) {
            widget.reveal(focus[0]);
        }
        ensureDOMFocus(widget);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.expandSelectionUp',
    weight: 200,
    when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListSupportsMultiSelectContextKey),
    primary: 1024 | 16,
    handler: (accessor, arg2) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget) {
            return;
        }
        const previousFocus = widget.getFocus() ? widget.getFocus()[0] : undefined;
        const fakeKeyboardEvent = new KeyboardEvent('keydown');
        widget.focusPrevious(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
        expandMultiSelection(widget, previousFocus);
        const focus = widget.getFocus();
        if (focus.length) {
            widget.reveal(focus[0]);
        }
        ensureDOMFocus(widget);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.collapse',
    weight: 200,
    when: ContextKeyExpr.and(WorkbenchListFocusContextKey, ContextKeyExpr.or(WorkbenchTreeElementCanCollapse, WorkbenchTreeElementHasParent)),
    primary: 15,
    mac: {
        primary: 15,
        secondary: [2048 | 16]
    },
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
            return;
        }
        const tree = widget;
        const focusedElements = tree.getFocus();
        if (focusedElements.length === 0) {
            return;
        }
        const focus = focusedElements[0];
        if (!tree.collapse(focus)) {
            const parent = tree.getParentElement(focus);
            if (parent) {
                navigate(widget, widget => {
                    const fakeKeyboardEvent = new KeyboardEvent('keydown');
                    widget.setFocus([parent], fakeKeyboardEvent);
                });
            }
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.stickyScroll.collapse',
    weight: 200 + 50,
    when: WorkbenchTreeStickyScrollFocused,
    primary: 15,
    mac: {
        primary: 15,
        secondary: [2048 | 16]
    },
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
            return;
        }
        revealFocusedStickyScroll(widget, focus => widget.collapse(focus));
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.collapseAll',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 2048 | 15,
    mac: {
        primary: 2048 | 15,
        secondary: [2048 | 1024 | 16]
    },
    handler: (accessor) => {
        const focused = accessor.get(IListService).lastFocusedList;
        if (focused && !(focused instanceof List || focused instanceof PagedList || focused instanceof Table)) {
            focused.collapseAll();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.collapseAllToFocus',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    handler: accessor => {
        const focused = accessor.get(IListService).lastFocusedList;
        const fakeKeyboardEvent = getSelectionKeyboardEvent('keydown', true);
        if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
            const tree = focused;
            const focus = tree.getFocus();
            if (focus.length > 0) {
                tree.collapse(focus[0], true);
            }
            tree.setSelection(focus, fakeKeyboardEvent);
            tree.setAnchor(focus[0]);
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.focusParent',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
            return;
        }
        const tree = widget;
        const focusedElements = tree.getFocus();
        if (focusedElements.length === 0) {
            return;
        }
        const focus = focusedElements[0];
        const parent = tree.getParentElement(focus);
        if (parent) {
            navigate(widget, widget => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                widget.setFocus([parent], fakeKeyboardEvent);
            });
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.expand',
    weight: 200,
    when: ContextKeyExpr.and(WorkbenchListFocusContextKey, ContextKeyExpr.or(WorkbenchTreeElementCanExpand, WorkbenchTreeElementHasChild)),
    primary: 17,
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget) {
            return;
        }
        if (widget instanceof ObjectTree || widget instanceof DataTree) {
            const focusedElements = widget.getFocus();
            if (focusedElements.length === 0) {
                return;
            }
            const focus = focusedElements[0];
            if (!widget.expand(focus)) {
                const child = widget.getFirstElementChild(focus);
                if (child) {
                    const node = widget.getNode(child);
                    if (node.visible) {
                        navigate(widget, widget => {
                            const fakeKeyboardEvent = new KeyboardEvent('keydown');
                            widget.setFocus([child], fakeKeyboardEvent);
                        });
                    }
                }
            }
        }
        else if (widget instanceof AsyncDataTree) {
            const focusedElements = widget.getFocus();
            if (focusedElements.length === 0) {
                return;
            }
            const focus = focusedElements[0];
            widget.expand(focus).then(didExpand => {
                if (focus && !didExpand) {
                    const child = widget.getFirstElementChild(focus);
                    if (child) {
                        const node = widget.getNode(child);
                        if (node.visible) {
                            navigate(widget, widget => {
                                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                                widget.setFocus([child], fakeKeyboardEvent);
                            });
                        }
                    }
                }
            });
        }
    }
});
function selectElement(accessor, retainCurrentFocus) {
    const focused = accessor.get(IListService).lastFocusedList;
    const fakeKeyboardEvent = getSelectionKeyboardEvent('keydown', retainCurrentFocus);
    if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
        const list = focused;
        list.setAnchor(list.getFocus()[0]);
        list.setSelection(list.getFocus(), fakeKeyboardEvent);
    }
    else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
        const tree = focused;
        const focus = tree.getFocus();
        if (focus.length > 0) {
            let toggleCollapsed = true;
            if (tree.expandOnlyOnTwistieClick === true) {
                toggleCollapsed = false;
            }
            else if (typeof tree.expandOnlyOnTwistieClick !== 'boolean' && tree.expandOnlyOnTwistieClick(focus[0])) {
                toggleCollapsed = false;
            }
            if (toggleCollapsed) {
                tree.toggleCollapsed(focus[0]);
            }
        }
        tree.setAnchor(focus[0]);
        tree.setSelection(focus, fakeKeyboardEvent);
    }
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.select',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 3,
    mac: {
        primary: 3,
        secondary: [2048 | 18]
    },
    handler: (accessor) => {
        selectElement(accessor, false);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.stickyScrollselect',
    weight: 200 + 50,
    when: WorkbenchTreeStickyScrollFocused,
    primary: 3,
    mac: {
        primary: 3,
        secondary: [2048 | 18]
    },
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
            return;
        }
        revealFocusedStickyScroll(widget, focus => widget.setSelection([focus]));
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.selectAndPreserveFocus',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    handler: accessor => {
        selectElement(accessor, true);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.selectAll',
    weight: 200,
    when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListSupportsMultiSelectContextKey),
    primary: 2048 | 31,
    handler: (accessor) => {
        const focused = accessor.get(IListService).lastFocusedList;
        if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
            const list = focused;
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            list.setSelection(range(list.length), fakeKeyboardEvent);
        }
        else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
            const tree = focused;
            const focus = tree.getFocus();
            const selection = tree.getSelection();
            let start = undefined;
            if (focus.length > 0 && (selection.length === 0 || !selection.includes(focus[0]))) {
                start = focus[0];
            }
            if (!start && selection.length > 0) {
                start = selection[0];
            }
            let scope = undefined;
            if (!start) {
                scope = undefined;
            }
            else {
                scope = tree.getParentElement(start);
            }
            const newSelection = [];
            const visit = (node) => {
                for (const child of node.children) {
                    if (child.visible) {
                        newSelection.push(child.element);
                        if (!child.collapsed) {
                            visit(child);
                        }
                    }
                }
            };
            visit(tree.getNode(scope));
            if (scope && selection.length === newSelection.length) {
                newSelection.unshift(scope);
            }
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            tree.setSelection(newSelection, fakeKeyboardEvent);
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.toggleSelection',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 2048 | 1024 | 3,
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget) {
            return;
        }
        const focus = widget.getFocus();
        if (focus.length === 0) {
            return;
        }
        const selection = widget.getSelection();
        const index = selection.indexOf(focus[0]);
        if (index > -1) {
            widget.setSelection([...selection.slice(0, index), ...selection.slice(index + 1)]);
        }
        else {
            widget.setSelection([...selection, focus[0]]);
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.showHover',
    weight: 200,
    primary: KeyChord(2048 | 41, 2048 | 39),
    when: WorkbenchListFocusContextKey,
    handler: async (accessor, ...args) => {
        const listService = accessor.get(IListService);
        const lastFocusedList = listService.lastFocusedList;
        if (!lastFocusedList) {
            return;
        }
        const focus = lastFocusedList.getFocus();
        if (!focus || (focus.length === 0)) {
            return;
        }
        const treeDOM = lastFocusedList.getHTMLElement();
        const scrollableElement = treeDOM.querySelector('.monaco-scrollable-element');
        const listRows = scrollableElement?.querySelector('.monaco-list-rows');
        const focusedElement = listRows?.querySelector('.focused');
        if (!focusedElement) {
            return;
        }
        const elementWithHover = getCustomHoverForElement(focusedElement);
        if (elementWithHover) {
            accessor.get(IHoverService).showManagedHover(elementWithHover);
        }
    },
});
function getCustomHoverForElement(element) {
    if (element.matches('[custom-hover="true"]')) {
        return element;
    }
    const noneFocusableElementWithHover = element.querySelector('[custom-hover="true"]:not([tabindex]):not(.action-item)');
    if (noneFocusableElementWithHover) {
        return noneFocusableElementWithHover;
    }
    return undefined;
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.toggleExpand',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    primary: 10,
    handler: (accessor) => {
        const focused = accessor.get(IListService).lastFocusedList;
        if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
            const tree = focused;
            const focus = tree.getFocus();
            if (focus.length > 0 && tree.isCollapsible(focus[0])) {
                tree.toggleCollapsed(focus[0]);
                return;
            }
        }
        selectElement(accessor, true);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.stickyScrolltoggleExpand',
    weight: 200 + 50,
    when: WorkbenchTreeStickyScrollFocused,
    primary: 10,
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
            return;
        }
        revealFocusedStickyScroll(widget);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.clear',
    weight: 200,
    when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListHasSelectionOrFocus),
    primary: 9,
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (!widget) {
            return;
        }
        const selection = widget.getSelection();
        const fakeKeyboardEvent = new KeyboardEvent('keydown');
        if (selection.length > 1) {
            const useSelectionNavigation = WorkbenchListSelectionNavigation.getValue(widget.contextKeyService);
            if (useSelectionNavigation) {
                const focus = widget.getFocus();
                widget.setSelection([focus[0]], fakeKeyboardEvent);
            }
            else {
                widget.setSelection([], fakeKeyboardEvent);
            }
        }
        else {
            widget.setSelection([], fakeKeyboardEvent);
            widget.setFocus([], fakeKeyboardEvent);
        }
        widget.setAnchor(undefined);
    }
});
CommandsRegistry.registerCommand({
    id: 'list.triggerTypeNavigation',
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        widget?.triggerTypeNavigation();
    }
});
CommandsRegistry.registerCommand({
    id: 'list.toggleFindMode',
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
            const tree = widget;
            tree.findMode = tree.findMode === TreeFindMode.Filter ? TreeFindMode.Highlight : TreeFindMode.Filter;
        }
    }
});
CommandsRegistry.registerCommand({
    id: 'list.toggleFindMatchType',
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
            const tree = widget;
            tree.findMatchType = tree.findMatchType === TreeFindMatchType.Contiguous ? TreeFindMatchType.Fuzzy : TreeFindMatchType.Contiguous;
        }
    }
});
CommandsRegistry.registerCommandAlias('list.toggleKeyboardNavigation', 'list.triggerTypeNavigation');
CommandsRegistry.registerCommandAlias('list.toggleFilterOnType', 'list.toggleFindMode');
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.find',
    weight: 200,
    when: ContextKeyExpr.and(RawWorkbenchListFocusContextKey, WorkbenchListSupportsFind),
    primary: 2048 | 512 | 36,
    secondary: [61],
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (widget instanceof List || widget instanceof PagedList || widget instanceof Table) {
        }
        else if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
            const tree = widget;
            tree.openFind();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.closeFind',
    weight: 200,
    when: ContextKeyExpr.and(RawWorkbenchListFocusContextKey, WorkbenchTreeFindOpen),
    primary: 9,
    handler: (accessor) => {
        const widget = accessor.get(IListService).lastFocusedList;
        if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
            const tree = widget;
            tree.closeFind();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.scrollUp',
    weight: 200,
    when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListScrollAtTopContextKey?.negate()),
    primary: 2048 | 16,
    handler: accessor => {
        const focused = accessor.get(IListService).lastFocusedList;
        if (!focused) {
            return;
        }
        focused.scrollTop -= 10;
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.scrollDown',
    weight: 200,
    when: ContextKeyExpr.and(WorkbenchListFocusContextKey, WorkbenchListScrollAtBottomContextKey?.negate()),
    primary: 2048 | 18,
    handler: accessor => {
        const focused = accessor.get(IListService).lastFocusedList;
        if (!focused) {
            return;
        }
        focused.scrollTop += 10;
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.scrollLeft',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    handler: accessor => {
        const focused = accessor.get(IListService).lastFocusedList;
        if (!focused) {
            return;
        }
        focused.scrollLeft -= 10;
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.scrollRight',
    weight: 200,
    when: WorkbenchListFocusContextKey,
    handler: accessor => {
        const focused = accessor.get(IListService).lastFocusedList;
        if (!focused) {
            return;
        }
        focused.scrollLeft += 10;
    }
});
registerAction2(class ToggleStickyScroll extends Action2 {
    constructor() {
        super({
            id: 'tree.toggleStickyScroll',
            title: {
                ...localize2('toggleTreeStickyScroll', "Toggle Tree Sticky Scroll"),
                mnemonicTitle: localize({ key: 'mitoggleTreeStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Toggle Tree Sticky Scroll"),
            },
            category: 'View',
            metadata: { description: localize('toggleTreeStickyScrollDescription', "Toggles Sticky Scroll widget at the top of tree structures such as the File Explorer and Debug variables View.") },
            f1: true
        });
    }
    run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        const newValue = !configurationService.getValue('workbench.tree.enableStickyScroll');
        configurationService.updateValue('workbench.tree.enableStickyScroll', newValue);
    }
});
