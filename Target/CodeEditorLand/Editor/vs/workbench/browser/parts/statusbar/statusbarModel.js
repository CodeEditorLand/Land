import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { isStatusbarEntryLocation } from '../../../services/statusbar/browser/statusbar.js';
import { hide, show, isAncestorOfActiveElement } from '../../../../base/browser/dom.js';
import { Emitter } from '../../../../base/common/event.js';
export class StatusbarViewModel extends Disposable {
    static { this.HIDDEN_ENTRIES_KEY = 'workbench.statusbar.hidden'; }
    get entries() { return this._entries.slice(0); }
    get lastFocusedEntry() {
        return this._lastFocusedEntry && !this.isHidden(this._lastFocusedEntry.id) ? this._lastFocusedEntry : undefined;
    }
    constructor(storageService) {
        super();
        this.storageService = storageService;
        this._onDidChangeEntryVisibility = this._register(new Emitter());
        this.onDidChangeEntryVisibility = this._onDidChangeEntryVisibility.event;
        this._entries = [];
        this.hidden = new Set();
        this.restoreState();
        this.registerListeners();
    }
    restoreState() {
        const hiddenRaw = this.storageService.get(StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0);
        if (hiddenRaw) {
            try {
                this.hidden = new Set(JSON.parse(hiddenRaw));
            }
            catch (error) {
            }
        }
    }
    registerListeners() {
        this._register(this.storageService.onDidChangeValue(0, StatusbarViewModel.HIDDEN_ENTRIES_KEY, this._register(new DisposableStore()))(() => this.onDidStorageValueChange()));
    }
    onDidStorageValueChange() {
        const currentlyHidden = new Set(this.hidden);
        this.hidden.clear();
        this.restoreState();
        const changed = new Set();
        for (const id of currentlyHidden) {
            if (!this.hidden.has(id)) {
                changed.add(id);
            }
        }
        for (const id of this.hidden) {
            if (!currentlyHidden.has(id)) {
                changed.add(id);
            }
        }
        if (changed.size > 0) {
            for (const entry of this._entries) {
                if (changed.has(entry.id)) {
                    this.updateVisibility(entry.id, true);
                    changed.delete(entry.id);
                }
            }
        }
    }
    add(entry) {
        this._entries.push(entry);
        this.updateVisibility(entry, false);
        this.sort();
        this.markFirstLastVisibleEntry();
    }
    remove(entry) {
        const index = this._entries.indexOf(entry);
        if (index >= 0) {
            this._entries.splice(index, 1);
            if (this._entries.some(otherEntry => isStatusbarEntryLocation(otherEntry.priority.primary) && otherEntry.priority.primary.id === entry.id)) {
                this.sort();
            }
            this.markFirstLastVisibleEntry();
        }
    }
    isHidden(id) {
        return this.hidden.has(id);
    }
    hide(id) {
        if (!this.hidden.has(id)) {
            this.hidden.add(id);
            this.updateVisibility(id, true);
            this.saveState();
        }
    }
    show(id) {
        if (this.hidden.has(id)) {
            this.hidden.delete(id);
            this.updateVisibility(id, true);
            this.saveState();
        }
    }
    findEntry(container) {
        return this._entries.find(entry => entry.container === container);
    }
    getEntries(alignment) {
        return this._entries.filter(entry => entry.alignment === alignment);
    }
    focusNextEntry() {
        this.focusEntry(+1, 0);
    }
    focusPreviousEntry() {
        this.focusEntry(-1, this.entries.length - 1);
    }
    isEntryFocused() {
        return !!this.getFocusedEntry();
    }
    getFocusedEntry() {
        return this._entries.find(entry => isAncestorOfActiveElement(entry.container));
    }
    focusEntry(delta, restartPosition) {
        const getVisibleEntry = (start) => {
            let indexToFocus = start;
            let entry = (indexToFocus >= 0 && indexToFocus < this._entries.length) ? this._entries[indexToFocus] : undefined;
            while (entry && this.isHidden(entry.id)) {
                indexToFocus += delta;
                entry = (indexToFocus >= 0 && indexToFocus < this._entries.length) ? this._entries[indexToFocus] : undefined;
            }
            return entry;
        };
        const focused = this.getFocusedEntry();
        if (focused) {
            const entry = getVisibleEntry(this._entries.indexOf(focused) + delta);
            if (entry) {
                this._lastFocusedEntry = entry;
                entry.labelContainer.focus();
                return;
            }
        }
        const entry = getVisibleEntry(restartPosition);
        if (entry) {
            this._lastFocusedEntry = entry;
            entry.labelContainer.focus();
        }
    }
    updateVisibility(arg1, trigger) {
        if (typeof arg1 === 'string') {
            const id = arg1;
            for (const entry of this._entries) {
                if (entry.id === id) {
                    this.updateVisibility(entry, trigger);
                }
            }
        }
        else {
            const entry = arg1;
            const isHidden = this.isHidden(entry.id);
            if (isHidden) {
                hide(entry.container);
            }
            else {
                show(entry.container);
            }
            if (trigger) {
                this._onDidChangeEntryVisibility.fire({ id: entry.id, visible: !isHidden });
            }
            this.markFirstLastVisibleEntry();
        }
    }
    saveState() {
        if (this.hidden.size > 0) {
            this.storageService.store(StatusbarViewModel.HIDDEN_ENTRIES_KEY, JSON.stringify(Array.from(this.hidden.values())), 0, 0);
        }
        else {
            this.storageService.remove(StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0);
        }
    }
    sort() {
        const mapEntryWithNumberedPriorityToIndex = new Map();
        const mapEntryWithRelativePriority = new Map();
        for (let i = 0; i < this._entries.length; i++) {
            const entry = this._entries[i];
            if (typeof entry.priority.primary === 'number') {
                mapEntryWithNumberedPriorityToIndex.set(entry, i);
            }
            else {
                const referenceEntryId = entry.priority.primary.id;
                let entries = mapEntryWithRelativePriority.get(referenceEntryId);
                if (!entries) {
                    for (const relativeEntries of mapEntryWithRelativePriority.values()) {
                        if (relativeEntries.has(referenceEntryId)) {
                            entries = relativeEntries;
                            break;
                        }
                    }
                    if (!entries) {
                        entries = new Map();
                        mapEntryWithRelativePriority.set(referenceEntryId, entries);
                    }
                }
                entries.set(entry.id, entry);
            }
        }
        const sortedEntriesWithNumberedPriority = Array.from(mapEntryWithNumberedPriorityToIndex.keys());
        sortedEntriesWithNumberedPriority.sort((entryA, entryB) => {
            if (entryA.alignment === entryB.alignment) {
                if (entryA.priority.primary !== entryB.priority.primary) {
                    return Number(entryB.priority.primary) - Number(entryA.priority.primary);
                }
                if (entryA.priority.secondary !== entryB.priority.secondary) {
                    return entryB.priority.secondary - entryA.priority.secondary;
                }
                return mapEntryWithNumberedPriorityToIndex.get(entryA) - mapEntryWithNumberedPriorityToIndex.get(entryB);
            }
            if (entryA.alignment === 0) {
                return -1;
            }
            if (entryB.alignment === 0) {
                return 1;
            }
            return 0;
        });
        let sortedEntries;
        if (mapEntryWithRelativePriority.size > 0) {
            sortedEntries = [];
            for (const entry of sortedEntriesWithNumberedPriority) {
                const relativeEntriesMap = mapEntryWithRelativePriority.get(entry.id);
                const relativeEntries = relativeEntriesMap ? Array.from(relativeEntriesMap.values()) : undefined;
                if (relativeEntries) {
                    sortedEntries.push(...relativeEntries.filter(entry => isStatusbarEntryLocation(entry.priority.primary) && entry.priority.primary.alignment === 0));
                }
                sortedEntries.push(entry);
                if (relativeEntries) {
                    sortedEntries.push(...relativeEntries.filter(entry => isStatusbarEntryLocation(entry.priority.primary) && entry.priority.primary.alignment === 1));
                }
                mapEntryWithRelativePriority.delete(entry.id);
            }
            for (const [, entries] of mapEntryWithRelativePriority) {
                sortedEntries.push(...entries.values());
            }
        }
        else {
            sortedEntries = sortedEntriesWithNumberedPriority;
        }
        this._entries = sortedEntries;
    }
    markFirstLastVisibleEntry() {
        this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(0));
        this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(1));
    }
    doMarkFirstLastVisibleStatusbarItem(entries) {
        let firstVisibleItem;
        let lastVisibleItem;
        for (const entry of entries) {
            entry.container.classList.remove('first-visible-item', 'last-visible-item');
            const isVisible = !this.isHidden(entry.id);
            if (isVisible) {
                if (!firstVisibleItem) {
                    firstVisibleItem = entry;
                }
                lastVisibleItem = entry;
            }
        }
        firstVisibleItem?.container.classList.add('first-visible-item');
        lastVisibleItem?.container.classList.add('last-visible-item');
    }
}
