/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KeybindingsEditorModel_1;
import { localize } from '../../../../nls.js';
import { distinct, coalesce } from '../../../../base/common/arrays.js';
import * as strings from '../../../../base/common/strings.js';
import { Language } from '../../../../base/common/platform.js';
import { or, matchesContiguousSubString, matchesPrefix, matchesCamelCase, matchesWords } from '../../../../base/common/filters.js';
import { AriaLabelProvider, UserSettingsLabelProvider, UILabelProvider } from '../../../../base/common/keybindingLabels.js';
import { MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ResolvedKeybindingItem } from '../../../../platform/keybinding/common/resolvedKeybindingItem.js';
import { getAllUnboundCommands } from '../../keybinding/browser/unboundCommands.js';
import { isEmptyObject, isString } from '../../../../base/common/types.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { ExtensionIdentifier, ExtensionIdentifierMap } from '../../../../platform/extensions/common/extensions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
export const KEYBINDING_ENTRY_TEMPLATE_ID = 'keybinding.entry.template';
const SOURCE_SYSTEM = localize('default', "System");
const SOURCE_EXTENSION = localize('extension', "Extension");
const SOURCE_USER = localize('user', "User");
export function createKeybindingCommandQuery(commandId, when) {
    const whenPart = when ? ` +when:${when}` : '';
    return `@command:${commandId}${whenPart}`;
}
const wordFilter = or(matchesPrefix, matchesWords, matchesContiguousSubString);
const COMMAND_REGEX = /@command:\s*([^\+]+)/i;
const WHEN_REGEX = /\+when:\s*(.+)/i;
const SOURCE_REGEX = /@source:\s*(user|default|system|extension)/i;
const EXTENSION_REGEX = /@ext:\s*((".+")|([^\s]+))/i;
const KEYBINDING_REGEX = /@keybinding:\s*((\".+\")|(\S+))/i;
let KeybindingsEditorModel = KeybindingsEditorModel_1 = class KeybindingsEditorModel extends EditorModel {
    constructor(os, keybindingsService, extensionService) {
        super();
        this.keybindingsService = keybindingsService;
        this.extensionService = extensionService;
        this._keybindingItems = [];
        this._keybindingItemsSortedByPrecedence = [];
        this.modifierLabels = {
            ui: UILabelProvider.modifierLabels[os],
            aria: AriaLabelProvider.modifierLabels[os],
            user: UserSettingsLabelProvider.modifierLabels[os]
        };
    }
    fetch(searchValue, sortByPrecedence = false) {
        let keybindingItems = sortByPrecedence ? this._keybindingItemsSortedByPrecedence : this._keybindingItems;
        // @command:COMMAND_ID
        const commandIdMatches = COMMAND_REGEX.exec(searchValue);
        if (commandIdMatches && commandIdMatches[1]) {
            const command = commandIdMatches[1].trim();
            let filteredKeybindingItems = keybindingItems.filter(k => k.command === command);
            // +when:WHEN_EXPRESSION
            if (filteredKeybindingItems.length) {
                const whenMatches = WHEN_REGEX.exec(searchValue);
                if (whenMatches && whenMatches[1]) {
                    const whenValue = whenMatches[1].trim();
                    filteredKeybindingItems = this.filterByWhen(filteredKeybindingItems, command, whenValue);
                }
            }
            return filteredKeybindingItems.map((keybindingItem) => ({ id: KeybindingsEditorModel_1.getId(keybindingItem), keybindingItem, templateId: KEYBINDING_ENTRY_TEMPLATE_ID }));
        }
        // @source:SOURCE
        if (SOURCE_REGEX.test(searchValue)) {
            keybindingItems = this.filterBySource(keybindingItems, searchValue);
            searchValue = searchValue.replace(SOURCE_REGEX, '');
        }
        else {
            // @ext:EXTENSION_ID
            const extensionMatches = EXTENSION_REGEX.exec(searchValue);
            if (extensionMatches && (extensionMatches[2] || extensionMatches[3])) {
                const extensionId = extensionMatches[2] ? extensionMatches[2].substring(1, extensionMatches[2].length - 1) : extensionMatches[3];
                keybindingItems = this.filterByExtension(keybindingItems, extensionId);
                searchValue = searchValue.replace(EXTENSION_REGEX, '');
            }
            else {
                // @keybinding:KEYBINDING
                const keybindingMatches = KEYBINDING_REGEX.exec(searchValue);
                if (keybindingMatches && (keybindingMatches[2] || keybindingMatches[3])) {
                    searchValue = keybindingMatches[2] || `"${keybindingMatches[3]}"`;
                }
            }
        }
        searchValue = searchValue.trim();
        if (!searchValue) {
            return keybindingItems.map((keybindingItem) => ({ id: KeybindingsEditorModel_1.getId(keybindingItem), keybindingItem, templateId: KEYBINDING_ENTRY_TEMPLATE_ID }));
        }
        return this.filterByText(keybindingItems, searchValue);
    }
    filterBySource(keybindingItems, searchValue) {
        if (/@source:\s*default/i.test(searchValue) || /@source:\s*system/i.test(searchValue)) {
            return keybindingItems.filter(k => k.source === SOURCE_SYSTEM);
        }
        if (/@source:\s*user/i.test(searchValue)) {
            return keybindingItems.filter(k => k.source === SOURCE_USER);
        }
        if (/@source:\s*extension/i.test(searchValue)) {
            return keybindingItems.filter(k => !isString(k.source) || k.source === SOURCE_EXTENSION);
        }
        return keybindingItems;
    }
    filterByExtension(keybindingItems, extension) {
        extension = extension.toLowerCase().trim();
        return keybindingItems.filter(k => !isString(k.source) && (ExtensionIdentifier.equals(k.source.identifier, extension) || k.source.displayName?.toLowerCase() === extension.toLowerCase()));
    }
    filterByText(keybindingItems, searchValue) {
        const quoteAtFirstChar = searchValue.charAt(0) === '"';
        const quoteAtLastChar = searchValue.charAt(searchValue.length - 1) === '"';
        const completeMatch = quoteAtFirstChar && quoteAtLastChar;
        if (quoteAtFirstChar) {
            searchValue = searchValue.substring(1);
        }
        if (quoteAtLastChar) {
            searchValue = searchValue.substring(0, searchValue.length - 1);
        }
        searchValue = searchValue.trim();
        const result = [];
        const words = searchValue.split(' ');
        const keybindingWords = this.splitKeybindingWords(words);
        for (const keybindingItem of keybindingItems) {
            const keybindingMatches = new KeybindingItemMatches(this.modifierLabels, keybindingItem, searchValue, words, keybindingWords, completeMatch);
            if (keybindingMatches.commandIdMatches
                || keybindingMatches.commandLabelMatches
                || keybindingMatches.commandDefaultLabelMatches
                || keybindingMatches.sourceMatches
                || keybindingMatches.whenMatches
                || keybindingMatches.keybindingMatches
                || keybindingMatches.extensionIdMatches
                || keybindingMatches.extensionLabelMatches) {
                result.push({
                    id: KeybindingsEditorModel_1.getId(keybindingItem),
                    templateId: KEYBINDING_ENTRY_TEMPLATE_ID,
                    commandLabelMatches: keybindingMatches.commandLabelMatches || undefined,
                    commandDefaultLabelMatches: keybindingMatches.commandDefaultLabelMatches || undefined,
                    keybindingItem,
                    keybindingMatches: keybindingMatches.keybindingMatches || undefined,
                    commandIdMatches: keybindingMatches.commandIdMatches || undefined,
                    sourceMatches: keybindingMatches.sourceMatches || undefined,
                    whenMatches: keybindingMatches.whenMatches || undefined,
                    extensionIdMatches: keybindingMatches.extensionIdMatches || undefined,
                    extensionLabelMatches: keybindingMatches.extensionLabelMatches || undefined
                });
            }
        }
        return result;
    }
    filterByWhen(keybindingItems, command, when) {
        if (keybindingItems.length === 0) {
            return [];
        }
        // Check if a keybinding with the same command id and when clause exists
        const keybindingItemsWithWhen = keybindingItems.filter(k => k.when === when);
        if (keybindingItemsWithWhen.length) {
            return keybindingItemsWithWhen;
        }
        // Create a new entry with the when clause which does not live in the model
        // We can reuse some of the properties from the same command with different when clause
        const commandLabel = keybindingItems[0].commandLabel;
        const keybindingItem = new ResolvedKeybindingItem(undefined, command, null, ContextKeyExpr.deserialize(when), false, null, false);
        const actionLabels = new Map([[command, commandLabel]]);
        return [KeybindingsEditorModel_1.toKeybindingEntry(command, keybindingItem, actionLabels, this.getExtensionsMapping())];
    }
    splitKeybindingWords(wordsSeparatedBySpaces) {
        const result = [];
        for (const word of wordsSeparatedBySpaces) {
            result.push(...coalesce(word.split('+')));
        }
        return result;
    }
    async resolve(actionLabels = new Map()) {
        const extensions = this.getExtensionsMapping();
        this._keybindingItemsSortedByPrecedence = [];
        const boundCommands = new Map();
        for (const keybinding of this.keybindingsService.getKeybindings()) {
            if (keybinding.command) { // Skip keybindings without commands
                this._keybindingItemsSortedByPrecedence.push(KeybindingsEditorModel_1.toKeybindingEntry(keybinding.command, keybinding, actionLabels, extensions));
                boundCommands.set(keybinding.command, true);
            }
        }
        const commandsWithDefaultKeybindings = this.keybindingsService.getDefaultKeybindings().map(keybinding => keybinding.command);
        for (const command of getAllUnboundCommands(boundCommands)) {
            const keybindingItem = new ResolvedKeybindingItem(undefined, command, null, undefined, commandsWithDefaultKeybindings.indexOf(command) === -1, null, false);
            this._keybindingItemsSortedByPrecedence.push(KeybindingsEditorModel_1.toKeybindingEntry(command, keybindingItem, actionLabels, extensions));
        }
        this._keybindingItemsSortedByPrecedence = distinct(this._keybindingItemsSortedByPrecedence, keybindingItem => KeybindingsEditorModel_1.getId(keybindingItem));
        this._keybindingItems = this._keybindingItemsSortedByPrecedence.slice(0).sort((a, b) => KeybindingsEditorModel_1.compareKeybindingData(a, b));
        return super.resolve();
    }
    static getId(keybindingItem) {
        return keybindingItem.command + (keybindingItem?.keybinding?.getAriaLabel() ?? '') + keybindingItem.when + (isString(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.identifier.value);
    }
    getExtensionsMapping() {
        const extensions = new ExtensionIdentifierMap();
        for (const extension of this.extensionService.extensions) {
            extensions.set(extension.identifier, extension);
        }
        return extensions;
    }
    static compareKeybindingData(a, b) {
        if (a.keybinding && !b.keybinding) {
            return -1;
        }
        if (b.keybinding && !a.keybinding) {
            return 1;
        }
        if (a.commandLabel && !b.commandLabel) {
            return -1;
        }
        if (b.commandLabel && !a.commandLabel) {
            return 1;
        }
        if (a.commandLabel && b.commandLabel) {
            if (a.commandLabel !== b.commandLabel) {
                return a.commandLabel.localeCompare(b.commandLabel);
            }
        }
        if (a.command === b.command) {
            return a.keybindingItem.isDefault ? 1 : -1;
        }
        return a.command.localeCompare(b.command);
    }
    static toKeybindingEntry(command, keybindingItem, actions, extensions) {
        const menuCommand = MenuRegistry.getCommand(command);
        const editorActionLabel = actions.get(command);
        let source = SOURCE_USER;
        if (keybindingItem.isDefault) {
            const extensionId = keybindingItem.extensionId ?? (keybindingItem.resolvedKeybinding ? undefined : menuCommand?.source?.id);
            source = extensionId ? extensions.get(extensionId) ?? SOURCE_EXTENSION : SOURCE_SYSTEM;
        }
        // eslint-disable-next-line local/code-no-dangerous-type-assertions
        return {
            keybinding: keybindingItem.resolvedKeybinding,
            keybindingItem,
            command,
            commandLabel: KeybindingsEditorModel_1.getCommandLabel(menuCommand, editorActionLabel),
            commandDefaultLabel: KeybindingsEditorModel_1.getCommandDefaultLabel(menuCommand),
            when: keybindingItem.when ? keybindingItem.when.serialize() : '',
            source
        };
    }
    static getCommandDefaultLabel(menuCommand) {
        if (!Language.isDefaultVariant()) {
            if (menuCommand && menuCommand.title && menuCommand.title.original) {
                const category = menuCommand.category ? menuCommand.category.original : undefined;
                const title = menuCommand.title.original;
                return category ? localize('cat.title', "{0}: {1}", category, title) : title;
            }
        }
        return null;
    }
    static getCommandLabel(menuCommand, editorActionLabel) {
        if (menuCommand) {
            const category = menuCommand.category ? typeof menuCommand.category === 'string' ? menuCommand.category : menuCommand.category.value : undefined;
            const title = typeof menuCommand.title === 'string' ? menuCommand.title : menuCommand.title.value;
            return category ? localize('cat.title', "{0}: {1}", category, title) : title;
        }
        if (editorActionLabel) {
            return editorActionLabel;
        }
        return '';
    }
};
KeybindingsEditorModel = KeybindingsEditorModel_1 = __decorate([
    __param(1, IKeybindingService),
    __param(2, IExtensionService),
    __metadata("design:paramtypes", [Number, Object, Object])
], KeybindingsEditorModel);
export { KeybindingsEditorModel };
class KeybindingItemMatches {
    constructor(modifierLabels, keybindingItem, searchValue, words, keybindingWords, completeMatch) {
        this.modifierLabels = modifierLabels;
        this.commandIdMatches = null;
        this.commandLabelMatches = null;
        this.commandDefaultLabelMatches = null;
        this.sourceMatches = null;
        this.whenMatches = null;
        this.keybindingMatches = null;
        this.extensionIdMatches = null;
        this.extensionLabelMatches = null;
        if (!completeMatch) {
            this.commandIdMatches = this.matches(searchValue, keybindingItem.command, or(matchesWords, matchesCamelCase), words);
            this.commandLabelMatches = keybindingItem.commandLabel ? this.matches(searchValue, keybindingItem.commandLabel, (word, wordToMatchAgainst) => matchesWords(word, keybindingItem.commandLabel, true), words) : null;
            this.commandDefaultLabelMatches = keybindingItem.commandDefaultLabel ? this.matches(searchValue, keybindingItem.commandDefaultLabel, (word, wordToMatchAgainst) => matchesWords(word, keybindingItem.commandDefaultLabel, true), words) : null;
            this.whenMatches = keybindingItem.when ? this.matches(null, keybindingItem.when, or(matchesWords, matchesCamelCase), words) : null;
            if (isString(keybindingItem.source)) {
                this.sourceMatches = this.matches(searchValue, keybindingItem.source, (word, wordToMatchAgainst) => matchesWords(word, keybindingItem.source, true), words);
            }
            else {
                this.extensionLabelMatches = keybindingItem.source.displayName ? this.matches(searchValue, keybindingItem.source.displayName, (word, wordToMatchAgainst) => matchesWords(word, keybindingItem.commandLabel, true), words) : null;
            }
        }
        this.keybindingMatches = keybindingItem.keybinding ? this.matchesKeybinding(keybindingItem.keybinding, searchValue, keybindingWords, completeMatch) : null;
    }
    matches(searchValue, wordToMatchAgainst, wordMatchesFilter, words) {
        let matches = searchValue ? wordFilter(searchValue, wordToMatchAgainst) : null;
        if (!matches) {
            matches = this.matchesWords(words, wordToMatchAgainst, wordMatchesFilter);
        }
        if (matches) {
            matches = this.filterAndSort(matches);
        }
        return matches;
    }
    matchesWords(words, wordToMatchAgainst, wordMatchesFilter) {
        let matches = [];
        for (const word of words) {
            const wordMatches = wordMatchesFilter(word, wordToMatchAgainst);
            if (wordMatches) {
                matches = [...(matches || []), ...wordMatches];
            }
            else {
                matches = null;
                break;
            }
        }
        return matches;
    }
    filterAndSort(matches) {
        return distinct(matches, (a => a.start + '.' + a.end)).filter(match => !matches.some(m => !(m.start === match.start && m.end === match.end) && (m.start <= match.start && m.end >= match.end))).sort((a, b) => a.start - b.start);
    }
    matchesKeybinding(keybinding, searchValue, words, completeMatch) {
        const [firstPart, chordPart] = keybinding.getChords();
        const userSettingsLabel = keybinding.getUserSettingsLabel();
        const ariaLabel = keybinding.getAriaLabel();
        const label = keybinding.getLabel();
        if ((userSettingsLabel && strings.compareIgnoreCase(searchValue, userSettingsLabel) === 0)
            || (ariaLabel && strings.compareIgnoreCase(searchValue, ariaLabel) === 0)
            || (label && strings.compareIgnoreCase(searchValue, label) === 0)) {
            return {
                firstPart: this.createCompleteMatch(firstPart),
                chordPart: this.createCompleteMatch(chordPart)
            };
        }
        const firstPartMatch = {};
        let chordPartMatch = {};
        const matchedWords = [];
        const firstPartMatchedWords = [];
        let chordPartMatchedWords = [];
        let matchFirstPart = true;
        for (let index = 0; index < words.length; index++) {
            const word = words[index];
            let firstPartMatched = false;
            let chordPartMatched = false;
            matchFirstPart = matchFirstPart && !firstPartMatch.keyCode;
            let matchChordPart = !chordPartMatch.keyCode;
            if (matchFirstPart) {
                firstPartMatched = this.matchPart(firstPart, firstPartMatch, word, completeMatch);
                if (firstPartMatch.keyCode) {
                    for (const cordPartMatchedWordIndex of chordPartMatchedWords) {
                        if (firstPartMatchedWords.indexOf(cordPartMatchedWordIndex) === -1) {
                            matchedWords.splice(matchedWords.indexOf(cordPartMatchedWordIndex), 1);
                        }
                    }
                    chordPartMatch = {};
                    chordPartMatchedWords = [];
                    matchChordPart = false;
                }
            }
            if (matchChordPart) {
                chordPartMatched = this.matchPart(chordPart, chordPartMatch, word, completeMatch);
            }
            if (firstPartMatched) {
                firstPartMatchedWords.push(index);
            }
            if (chordPartMatched) {
                chordPartMatchedWords.push(index);
            }
            if (firstPartMatched || chordPartMatched) {
                matchedWords.push(index);
            }
            matchFirstPart = matchFirstPart && this.isModifier(word);
        }
        if (matchedWords.length !== words.length) {
            return null;
        }
        if (completeMatch) {
            if (!this.isCompleteMatch(firstPart, firstPartMatch)) {
                return null;
            }
            if (!isEmptyObject(chordPartMatch) && !this.isCompleteMatch(chordPart, chordPartMatch)) {
                return null;
            }
        }
        return this.hasAnyMatch(firstPartMatch) || this.hasAnyMatch(chordPartMatch) ? { firstPart: firstPartMatch, chordPart: chordPartMatch } : null;
    }
    matchPart(chord, match, word, completeMatch) {
        let matched = false;
        if (this.matchesMetaModifier(chord, word)) {
            matched = true;
            match.metaKey = true;
        }
        if (this.matchesCtrlModifier(chord, word)) {
            matched = true;
            match.ctrlKey = true;
        }
        if (this.matchesShiftModifier(chord, word)) {
            matched = true;
            match.shiftKey = true;
        }
        if (this.matchesAltModifier(chord, word)) {
            matched = true;
            match.altKey = true;
        }
        if (this.matchesKeyCode(chord, word, completeMatch)) {
            match.keyCode = true;
            matched = true;
        }
        return matched;
    }
    matchesKeyCode(chord, word, completeMatch) {
        if (!chord) {
            return false;
        }
        const ariaLabel = chord.keyAriaLabel || '';
        if (completeMatch || ariaLabel.length === 1 || word.length === 1) {
            if (strings.compareIgnoreCase(ariaLabel, word) === 0) {
                return true;
            }
        }
        else {
            if (matchesContiguousSubString(word, ariaLabel)) {
                return true;
            }
        }
        return false;
    }
    matchesMetaModifier(chord, word) {
        if (!chord) {
            return false;
        }
        if (!chord.metaKey) {
            return false;
        }
        return this.wordMatchesMetaModifier(word);
    }
    matchesCtrlModifier(chord, word) {
        if (!chord) {
            return false;
        }
        if (!chord.ctrlKey) {
            return false;
        }
        return this.wordMatchesCtrlModifier(word);
    }
    matchesShiftModifier(chord, word) {
        if (!chord) {
            return false;
        }
        if (!chord.shiftKey) {
            return false;
        }
        return this.wordMatchesShiftModifier(word);
    }
    matchesAltModifier(chord, word) {
        if (!chord) {
            return false;
        }
        if (!chord.altKey) {
            return false;
        }
        return this.wordMatchesAltModifier(word);
    }
    hasAnyMatch(keybindingMatch) {
        return !!keybindingMatch.altKey ||
            !!keybindingMatch.ctrlKey ||
            !!keybindingMatch.metaKey ||
            !!keybindingMatch.shiftKey ||
            !!keybindingMatch.keyCode;
    }
    isCompleteMatch(chord, match) {
        if (!chord) {
            return true;
        }
        if (!match.keyCode) {
            return false;
        }
        if (chord.metaKey && !match.metaKey) {
            return false;
        }
        if (chord.altKey && !match.altKey) {
            return false;
        }
        if (chord.ctrlKey && !match.ctrlKey) {
            return false;
        }
        if (chord.shiftKey && !match.shiftKey) {
            return false;
        }
        return true;
    }
    createCompleteMatch(chord) {
        const match = {};
        if (chord) {
            match.keyCode = true;
            if (chord.metaKey) {
                match.metaKey = true;
            }
            if (chord.altKey) {
                match.altKey = true;
            }
            if (chord.ctrlKey) {
                match.ctrlKey = true;
            }
            if (chord.shiftKey) {
                match.shiftKey = true;
            }
        }
        return match;
    }
    isModifier(word) {
        if (this.wordMatchesAltModifier(word)) {
            return true;
        }
        if (this.wordMatchesCtrlModifier(word)) {
            return true;
        }
        if (this.wordMatchesMetaModifier(word)) {
            return true;
        }
        if (this.wordMatchesShiftModifier(word)) {
            return true;
        }
        return false;
    }
    wordMatchesAltModifier(word) {
        if (strings.equalsIgnoreCase(this.modifierLabels.ui.altKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(this.modifierLabels.aria.altKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(this.modifierLabels.user.altKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(localize('option', "option"), word)) {
            return true;
        }
        return false;
    }
    wordMatchesCtrlModifier(word) {
        if (strings.equalsIgnoreCase(this.modifierLabels.ui.ctrlKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(this.modifierLabels.aria.ctrlKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(this.modifierLabels.user.ctrlKey, word)) {
            return true;
        }
        return false;
    }
    wordMatchesMetaModifier(word) {
        if (strings.equalsIgnoreCase(this.modifierLabels.ui.metaKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(this.modifierLabels.aria.metaKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(this.modifierLabels.user.metaKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(localize('meta', "meta"), word)) {
            return true;
        }
        return false;
    }
    wordMatchesShiftModifier(word) {
        if (strings.equalsIgnoreCase(this.modifierLabels.ui.shiftKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(this.modifierLabels.aria.shiftKey, word)) {
            return true;
        }
        if (strings.equalsIgnoreCase(this.modifierLabels.user.shiftKey, word)) {
            return true;
        }
        return false;
    }
}
