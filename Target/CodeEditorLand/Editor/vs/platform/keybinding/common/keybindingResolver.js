import { implies, expressionsAreEqualWithConstantSubstitution } from '../../contextkey/common/contextkey.js';
export const NoMatchingKb = { kind: 0 };
const MoreChordsNeeded = { kind: 1 };
function KbFound(commandId, commandArgs, isBubble) {
    return { kind: 2, commandId, commandArgs, isBubble };
}
export class KeybindingResolver {
    constructor(defaultKeybindings, overrides, log) {
        this._log = log;
        this._defaultKeybindings = defaultKeybindings;
        this._defaultBoundCommands = new Map();
        for (const defaultKeybinding of defaultKeybindings) {
            const command = defaultKeybinding.command;
            if (command && command.charAt(0) !== '-') {
                this._defaultBoundCommands.set(command, true);
            }
        }
        this._map = new Map();
        this._lookupMap = new Map();
        this._keybindings = KeybindingResolver.handleRemovals([].concat(defaultKeybindings).concat(overrides));
        for (let i = 0, len = this._keybindings.length; i < len; i++) {
            const k = this._keybindings[i];
            if (k.chords.length === 0) {
                continue;
            }
            const when = k.when?.substituteConstants();
            if (when && when.type === 0) {
                continue;
            }
            this._addKeyPress(k.chords[0], k);
        }
    }
    static _isTargetedForRemoval(defaultKb, keypress, when) {
        if (keypress) {
            for (let i = 0; i < keypress.length; i++) {
                if (keypress[i] !== defaultKb.chords[i]) {
                    return false;
                }
            }
        }
        if (when && when.type !== 1) {
            if (!defaultKb.when) {
                return false;
            }
            if (!expressionsAreEqualWithConstantSubstitution(when, defaultKb.when)) {
                return false;
            }
        }
        return true;
    }
    static handleRemovals(rules) {
        const removals = new Map();
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            if (rule.command && rule.command.charAt(0) === '-') {
                const command = rule.command.substring(1);
                if (!removals.has(command)) {
                    removals.set(command, [rule]);
                }
                else {
                    removals.get(command).push(rule);
                }
            }
        }
        if (removals.size === 0) {
            return rules;
        }
        const result = [];
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            if (!rule.command || rule.command.length === 0) {
                result.push(rule);
                continue;
            }
            if (rule.command.charAt(0) === '-') {
                continue;
            }
            const commandRemovals = removals.get(rule.command);
            if (!commandRemovals || !rule.isDefault) {
                result.push(rule);
                continue;
            }
            let isRemoved = false;
            for (const commandRemoval of commandRemovals) {
                const when = commandRemoval.when;
                if (this._isTargetedForRemoval(rule, commandRemoval.chords, when)) {
                    isRemoved = true;
                    break;
                }
            }
            if (!isRemoved) {
                result.push(rule);
                continue;
            }
        }
        return result;
    }
    _addKeyPress(keypress, item) {
        const conflicts = this._map.get(keypress);
        if (typeof conflicts === 'undefined') {
            this._map.set(keypress, [item]);
            this._addToLookupMap(item);
            return;
        }
        for (let i = conflicts.length - 1; i >= 0; i--) {
            const conflict = conflicts[i];
            if (conflict.command === item.command) {
                continue;
            }
            let isShorterKbPrefix = true;
            for (let i = 1; i < conflict.chords.length && i < item.chords.length; i++) {
                if (conflict.chords[i] !== item.chords[i]) {
                    isShorterKbPrefix = false;
                    break;
                }
            }
            if (!isShorterKbPrefix) {
                continue;
            }
            if (KeybindingResolver.whenIsEntirelyIncluded(conflict.when, item.when)) {
                this._removeFromLookupMap(conflict);
            }
        }
        conflicts.push(item);
        this._addToLookupMap(item);
    }
    _addToLookupMap(item) {
        if (!item.command) {
            return;
        }
        let arr = this._lookupMap.get(item.command);
        if (typeof arr === 'undefined') {
            arr = [item];
            this._lookupMap.set(item.command, arr);
        }
        else {
            arr.push(item);
        }
    }
    _removeFromLookupMap(item) {
        if (!item.command) {
            return;
        }
        const arr = this._lookupMap.get(item.command);
        if (typeof arr === 'undefined') {
            return;
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                arr.splice(i, 1);
                return;
            }
        }
    }
    static whenIsEntirelyIncluded(a, b) {
        if (!b || b.type === 1) {
            return true;
        }
        if (!a || a.type === 1) {
            return false;
        }
        return implies(a, b);
    }
    getDefaultBoundCommands() {
        return this._defaultBoundCommands;
    }
    getDefaultKeybindings() {
        return this._defaultKeybindings;
    }
    getKeybindings() {
        return this._keybindings;
    }
    lookupKeybindings(commandId) {
        const items = this._lookupMap.get(commandId);
        if (typeof items === 'undefined' || items.length === 0) {
            return [];
        }
        const result = [];
        let resultLen = 0;
        for (let i = items.length - 1; i >= 0; i--) {
            result[resultLen++] = items[i];
        }
        return result;
    }
    lookupPrimaryKeybinding(commandId, context) {
        const items = this._lookupMap.get(commandId);
        if (typeof items === 'undefined' || items.length === 0) {
            return null;
        }
        if (items.length === 1) {
            return items[0];
        }
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            if (context.contextMatchesRules(item.when)) {
                return item;
            }
        }
        return items[items.length - 1];
    }
    resolve(context, currentChords, keypress) {
        const pressedChords = [...currentChords, keypress];
        this._log(`| Resolving ${pressedChords}`);
        const kbCandidates = this._map.get(pressedChords[0]);
        if (kbCandidates === undefined) {
            this._log(`\\ No keybinding entries.`);
            return NoMatchingKb;
        }
        let lookupMap = null;
        if (pressedChords.length < 2) {
            lookupMap = kbCandidates;
        }
        else {
            lookupMap = [];
            for (let i = 0, len = kbCandidates.length; i < len; i++) {
                const candidate = kbCandidates[i];
                if (pressedChords.length > candidate.chords.length) {
                    continue;
                }
                let prefixMatches = true;
                for (let i = 1; i < pressedChords.length; i++) {
                    if (candidate.chords[i] !== pressedChords[i]) {
                        prefixMatches = false;
                        break;
                    }
                }
                if (prefixMatches) {
                    lookupMap.push(candidate);
                }
            }
        }
        const result = this._findCommand(context, lookupMap);
        if (!result) {
            this._log(`\\ From ${lookupMap.length} keybinding entries, no when clauses matched the context.`);
            return NoMatchingKb;
        }
        if (pressedChords.length < result.chords.length) {
            this._log(`\\ From ${lookupMap.length} keybinding entries, awaiting ${result.chords.length - pressedChords.length} more chord(s), when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
            return MoreChordsNeeded;
        }
        this._log(`\\ From ${lookupMap.length} keybinding entries, matched ${result.command}, when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
        return KbFound(result.command, result.commandArgs, result.bubble);
    }
    _findCommand(context, matches) {
        for (let i = matches.length - 1; i >= 0; i--) {
            const k = matches[i];
            if (!KeybindingResolver._contextMatchesRules(context, k.when)) {
                continue;
            }
            return k;
        }
        return null;
    }
    static _contextMatchesRules(context, rules) {
        if (!rules) {
            return true;
        }
        return rules.evaluate(context);
    }
}
function printWhenExplanation(when) {
    if (!when) {
        return `no when condition`;
    }
    return `${when.serialize()}`;
}
function printSourceExplanation(kb) {
    return (kb.extensionId
        ? (kb.isBuiltinExtension ? `built-in extension ${kb.extensionId}` : `user extension ${kb.extensionId}`)
        : (kb.isDefault ? `built-in` : `user`));
}
