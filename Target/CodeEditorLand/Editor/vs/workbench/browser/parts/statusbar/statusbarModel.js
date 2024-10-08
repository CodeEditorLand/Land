/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
        this._entries = []; // Intentionally not using a map here since multiple entries can have the same ID
        this.hidden = new Set();
        this.restoreState();
        this.registerListeners();
    }
    restoreState() {
        const hiddenRaw = this.storageService.get(StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0 /* StorageScope.PROFILE */);
        if (hiddenRaw) {
            try {
                this.hidden = new Set(JSON.parse(hiddenRaw));
            }
            catch (error) {
                // ignore parsing errors
            }
        }
    }
    registerListeners() {
        this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, StatusbarViewModel.HIDDEN_ENTRIES_KEY, this._register(new DisposableStore()))(() => this.onDidStorageValueChange()));
    }
    onDidStorageValueChange() {
        // Keep current hidden entries
        const currentlyHidden = new Set(this.hidden);
        // Load latest state of hidden entries
        this.hidden.clear();
        this.restoreState();
        const changed = new Set();
        // Check for each entry that is now visible
        for (const id of currentlyHidden) {
            if (!this.hidden.has(id)) {
                changed.add(id);
            }
        }
        // Check for each entry that is now hidden
        for (const id of this.hidden) {
            if (!currentlyHidden.has(id)) {
                changed.add(id);
            }
        }
        // Update visibility for entries have changed
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
        // Add to set of entries
        this._entries.push(entry);
        // Update visibility directly
        this.updateVisibility(entry, false);
        // Sort according to priority
        this.sort();
        // Mark first/last visible entry
        this.markFirstLastVisibleEntry();
    }
    remove(entry) {
        const index = this._entries.indexOf(entry);
        if (index >= 0) {
            // Remove from entries
            this._entries.splice(index, 1);
            // Re-sort entries if this one was used
            // as reference from other entries
            if (this._entries.some(otherEntry => isStatusbarEntryLocation(otherEntry.priority.primary) && otherEntry.priority.primary.id === entry.id)) {
                this.sort();
            }
            // Mark first/last visible entry
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
        // By identifier
        if (typeof arg1 === 'string') {
            const id = arg1;
            for (const entry of this._entries) {
                if (entry.id === id) {
                    this.updateVisibility(entry, trigger);
                }
            }
        }
        // By entry
        else {
            const entry = arg1;
            const isHidden = this.isHidden(entry.id);
            // Use CSS to show/hide item container
            if (isHidden) {
                hide(entry.container);
            }
            else {
                show(entry.container);
            }
            if (trigger) {
                this._onDidChangeEntryVisibility.fire({ id: entry.id, visible: !isHidden });
            }
            // Mark first/last visible entry
            this.markFirstLastVisibleEntry();
        }
    }
    saveState() {
        if (this.hidden.size > 0) {
            this.storageService.store(StatusbarViewModel.HIDDEN_ENTRIES_KEY, JSON.stringify(Array.from(this.hidden.values())), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        else {
            this.storageService.remove(StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0 /* StorageScope.PROFILE */);
        }
    }
    sort() {
        // Split up entries into 2 buckets:
        // - those with `priority: number` that can be compared
        // - those with `priority: string` that must be sorted
        //   relative to another entry if possible
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
                    // It is possible that this entry references another entry
                    // that itself references an entry. In that case, we want
                    // to add it to the entries of the referenced entry.
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
        // Sort the entries with `priority: number` according to that
        const sortedEntriesWithNumberedPriority = Array.from(mapEntryWithNumberedPriorityToIndex.keys());
        sortedEntriesWithNumberedPriority.sort((entryA, entryB) => {
            if (entryA.alignment === entryB.alignment) {
                // Sort by primary/secondary priority: higher values move towards the left
                if (entryA.priority.primary !== entryB.priority.primary) {
                    return Number(entryB.priority.primary) - Number(entryA.priority.primary);
                }
                if (entryA.priority.secondary !== entryB.priority.secondary) {
                    return entryB.priority.secondary - entryA.priority.secondary;
                }
                // otherwise maintain stable order (both values known to be in map)
                return mapEntryWithNumberedPriorityToIndex.get(entryA) - mapEntryWithNumberedPriorityToIndex.get(entryB);
            }
            if (entryA.alignment === 0 /* StatusbarAlignment.LEFT */) {
                return -1;
            }
            if (entryB.alignment === 0 /* StatusbarAlignment.LEFT */) {
                return 1;
            }
            return 0;
        });
        let sortedEntries;
        // Entries with location: sort in accordingly
        if (mapEntryWithRelativePriority.size > 0) {
            sortedEntries = [];
            for (const entry of sortedEntriesWithNumberedPriority) {
                const relativeEntriesMap = mapEntryWithRelativePriority.get(entry.id);
                const relativeEntries = relativeEntriesMap ? Array.from(relativeEntriesMap.values()) : undefined;
                // Fill relative entries to LEFT
                if (relativeEntries) {
                    sortedEntries.push(...relativeEntries.filter(entry => isStatusbarEntryLocation(entry.priority.primary) && entry.priority.primary.alignment === 0 /* StatusbarAlignment.LEFT */));
                }
                // Fill referenced entry
                sortedEntries.push(entry);
                // Fill relative entries to RIGHT
                if (relativeEntries) {
                    sortedEntries.push(...relativeEntries.filter(entry => isStatusbarEntryLocation(entry.priority.primary) && entry.priority.primary.alignment === 1 /* StatusbarAlignment.RIGHT */));
                }
                // Delete from map to mark as handled
                mapEntryWithRelativePriority.delete(entry.id);
            }
            // Finally, just append all entries that reference another entry
            // that does not exist to the end of the list
            for (const [, entries] of mapEntryWithRelativePriority) {
                sortedEntries.push(...entries.values());
            }
        }
        // No entries with relative priority: take sorted entries as is
        else {
            sortedEntries = sortedEntriesWithNumberedPriority;
        }
        // Take over as new truth of entries
        this._entries = sortedEntries;
    }
    markFirstLastVisibleEntry() {
        this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(0 /* StatusbarAlignment.LEFT */));
        this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(1 /* StatusbarAlignment.RIGHT */));
    }
    doMarkFirstLastVisibleStatusbarItem(entries) {
        let firstVisibleItem;
        let lastVisibleItem;
        for (const entry of entries) {
            // Clear previous first
            entry.container.classList.remove('first-visible-item', 'last-visible-item');
            const isVisible = !this.isHidden(entry.id);
            if (isVisible) {
                if (!firstVisibleItem) {
                    firstVisibleItem = entry;
                }
                lastVisibleItem = entry;
            }
        }
        // Mark: first visible item
        firstVisibleItem?.container.classList.add('first-visible-item');
        // Mark: last visible item
        lastVisibleItem?.container.classList.add('last-visible-item');
    }
}
