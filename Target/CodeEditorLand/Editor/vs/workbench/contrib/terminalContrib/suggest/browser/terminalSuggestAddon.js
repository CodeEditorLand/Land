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
var SuggestAddon_1;
import * as dom from '../../../../../base/browser/dom.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { combinedDisposable, Disposable, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { sep } from '../../../../../base/common/path.js';
import { commonPrefixLength } from '../../../../../base/common/strings.js';
import { editorSuggestWidgetSelectedBackground } from '../../../../../editor/contrib/suggest/browser/suggestWidget.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { getListStyles } from '../../../../../platform/theme/browser/defaultStyles.js';
import { activeContrastBorder } from '../../../../../platform/theme/common/colorRegistry.js';
import { ITerminalConfigurationService } from '../../../terminal/browser/terminal.js';
import { terminalSuggestConfigSection } from '../common/terminalSuggestConfiguration.js';
import { SimpleCompletionItem } from '../../../../services/suggest/browser/simpleCompletionItem.js';
import { LineContext, SimpleCompletionModel } from '../../../../services/suggest/browser/simpleCompletionModel.js';
import { SimpleSuggestWidget } from '../../../../services/suggest/browser/simpleSuggestWidget.js';
/**
 * A map of the pwsh result type enum's value to the corresponding icon to use in completions.
 *
 * | Value | Name              | Description
 * |-------|-------------------|------------
 * | 0     | Text              | An unknown result type, kept as text only
 * | 1     | History           | A history result type like the items out of get-history
 * | 2     | Command           | A command result type like the items out of get-command
 * | 3     | ProviderItem      | A provider item
 * | 4     | ProviderContainer | A provider container
 * | 5     | Property          | A property result type like the property items out of get-member
 * | 6     | Method            | A method result type like the method items out of get-member
 * | 7     | ParameterName     | A parameter name result type like the Parameters property out of get-command items
 * | 8     | ParameterValue    | A parameter value result type
 * | 9     | Variable          | A variable result type like the items out of get-childitem variable:
 * | 10    | Namespace         | A namespace
 * | 11    | Type              | A type name
 * | 12    | Keyword           | A keyword
 * | 13    | DynamicKeyword    | A dynamic keyword
 *
 * @see https://docs.microsoft.com/en-us/dotnet/api/system.management.automation.completionresulttype?view=powershellsdk-7.0.0
 */
const pwshTypeToIconMap = {
    0: Codicon.symbolText,
    1: Codicon.history,
    2: Codicon.symbolMethod,
    3: Codicon.symbolFile,
    4: Codicon.folder,
    5: Codicon.symbolProperty,
    6: Codicon.symbolMethod,
    7: Codicon.symbolVariable,
    8: Codicon.symbolValue,
    9: Codicon.symbolVariable,
    10: Codicon.symbolNamespace,
    11: Codicon.symbolInterface,
    12: Codicon.symbolKeyword,
    13: Codicon.symbolKeyword
};
let SuggestAddon = class SuggestAddon extends Disposable {
    static { SuggestAddon_1 = this; }
    static { this.requestCompletionsSequence = '\x1b[24~e'; } // F12,e
    static { this.requestGlobalCompletionsSequence = '\x1b[24~f'; } // F12,f
    static { this.requestEnableGitCompletionsSequence = '\x1b[24~g'; } // F12,g
    static { this.requestEnableCodeCompletionsSequence = '\x1b[24~h'; } // F12,h
    constructor(_cachedPwshCommands, _capabilities, _terminalSuggestWidgetVisibleContextKey, _configurationService, _instantiationService, _terminalConfigurationService) {
        super();
        this._cachedPwshCommands = _cachedPwshCommands;
        this._capabilities = _capabilities;
        this._terminalSuggestWidgetVisibleContextKey = _terminalSuggestWidgetVisibleContextKey;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._terminalConfigurationService = _terminalConfigurationService;
        this._promptInputModelSubscriptions = this._register(new MutableDisposable());
        this._enableWidget = true;
        this._pathSeparator = sep;
        this._isFilteringDirectories = false;
        this._codeCompletionsRequested = false;
        this._gitCompletionsRequested = false;
        this._cursorIndexDelta = 0;
        this._lastUserDataTimestamp = 0;
        this._lastAcceptedCompletionTimestamp = 0;
        this.isPasting = false;
        this._onBell = this._register(new Emitter());
        this.onBell = this._onBell.event;
        this._onAcceptedCompletion = this._register(new Emitter());
        this.onAcceptedCompletion = this._onAcceptedCompletion.event;
        this._onDidRequestCompletions = this._register(new Emitter());
        this.onDidRequestCompletions = this._onDidRequestCompletions.event;
        this._onDidReceiveCompletions = this._register(new Emitter());
        this.onDidReceiveCompletions = this._onDidReceiveCompletions.event;
        this._replacementIndex = 0;
        this._replacementLength = 0;
        // TODO: These aren't persisted across reloads
        // TODO: Allow triggering anywhere in the first word based on the cached completions
        this._cachedBashAliases = new Set();
        this._cachedBashBuiltins = new Set();
        this._cachedBashCommands = new Set();
        this._cachedBashKeywords = new Set();
        this._register(Event.runAndSubscribe(Event.any(this._capabilities.onDidAddCapabilityType, this._capabilities.onDidRemoveCapabilityType), () => {
            const commandDetection = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (commandDetection) {
                if (this._promptInputModel !== commandDetection.promptInputModel) {
                    this._promptInputModel = commandDetection.promptInputModel;
                    this._promptInputModelSubscriptions.value = combinedDisposable(this._promptInputModel.onDidChangeInput(e => this._sync(e)), this._promptInputModel.onDidFinishInput(() => this.hideSuggestWidget()));
                }
            }
            else {
                this._promptInputModel = undefined;
            }
        }));
    }
    activate(xterm) {
        this._terminal = xterm;
        this._register(xterm.parser.registerOscHandler(633 /* ShellIntegrationOscPs.VSCode */, data => {
            return this._handleVSCodeSequence(data);
        }));
        this._register(xterm.onData(e => {
            this._lastUserData = e;
            this._lastUserDataTimestamp = Date.now();
        }));
    }
    setContainerWithOverflow(container) {
        this._container = container;
    }
    setScreen(screen) {
        this._screen = screen;
    }
    _requestCompletions() {
        if (!this._promptInputModel) {
            return;
        }
        if (this.isPasting) {
            return;
        }
        const builtinCompletionsConfig = this._configurationService.getValue(terminalSuggestConfigSection).builtinCompletions;
        if (!this._codeCompletionsRequested && builtinCompletionsConfig.pwshCode) {
            this._onAcceptedCompletion.fire(SuggestAddon_1.requestEnableCodeCompletionsSequence);
            this._codeCompletionsRequested = true;
        }
        if (!this._gitCompletionsRequested && builtinCompletionsConfig.pwshGit) {
            this._onAcceptedCompletion.fire(SuggestAddon_1.requestEnableGitCompletionsSequence);
            this._gitCompletionsRequested = true;
        }
        // Request global completions if there are none cached
        if (this._cachedPwshCommands.size === 0) {
            this._requestGlobalCompletions();
        }
        // Ensure that a key has been pressed since the last accepted completion in order to prevent
        // completions being requested again right after accepting a completion
        if (this._lastUserDataTimestamp > this._lastAcceptedCompletionTimestamp) {
            this._onAcceptedCompletion.fire(SuggestAddon_1.requestCompletionsSequence);
            this._onDidRequestCompletions.fire();
        }
    }
    _requestGlobalCompletions() {
        this._onAcceptedCompletion.fire(SuggestAddon_1.requestGlobalCompletionsSequence);
    }
    _sync(promptInputState) {
        const config = this._configurationService.getValue(terminalSuggestConfigSection);
        if (!this._mostRecentPromptInputState || promptInputState.cursorIndex > this._mostRecentPromptInputState.cursorIndex) {
            // If input has been added
            let sent = false;
            // Quick suggestions
            if (!this._terminalSuggestWidgetVisibleContextKey.get()) {
                if (config.quickSuggestions) {
                    if (promptInputState.cursorIndex === 1 || promptInputState.prefix.match(/([\s\[])[^\s]$/)) {
                        // Never request completions if the last key sequence was up or down as the user was likely
                        // navigating history
                        if (!this._lastUserData?.match(/^\x1b[\[O]?[A-D]$/)) {
                            this._requestCompletions();
                            sent = true;
                        }
                    }
                }
            }
            // Trigger characters - this happens even if the widget is showing
            if (config.suggestOnTriggerCharacters && !sent) {
                const prefix = promptInputState.prefix;
                if (
                // Only trigger on `-` if it's after a space. This is required to not clear
                // completions when typing the `-` in `git cherry-pick`
                prefix?.match(/\s[\-]$/) ||
                    // Only trigger on `\` and `/` if it's a directory. Not doing so causes problems
                    // with git branches in particular
                    this._isFilteringDirectories && prefix?.match(/[\\\/]$/)) {
                    this._requestCompletions();
                    sent = true;
                }
            }
        }
        this._mostRecentPromptInputState = promptInputState;
        if (!this._promptInputModel || !this._terminal || !this._suggestWidget || this._leadingLineContent === undefined) {
            return;
        }
        this._currentPromptInputState = promptInputState;
        // Hide the widget if the latest character was a space
        if (this._currentPromptInputState.cursorIndex > 1 && this._currentPromptInputState.value.at(this._currentPromptInputState.cursorIndex - 1) === ' ') {
            this.hideSuggestWidget();
            return;
        }
        // Hide the widget if the cursor moves to the left of the initial position as the
        // completions are no longer valid
        if (this._currentPromptInputState.cursorIndex < this._replacementIndex + this._replacementLength) {
            this.hideSuggestWidget();
            return;
        }
        if (this._terminalSuggestWidgetVisibleContextKey.get()) {
            this._cursorIndexDelta = this._currentPromptInputState.cursorIndex - (this._replacementIndex + this._replacementLength);
            let normalizedLeadingLineContent = this._currentPromptInputState.value.substring(this._replacementIndex, this._replacementIndex + this._replacementLength + this._cursorIndexDelta);
            if (this._isFilteringDirectories) {
                normalizedLeadingLineContent = normalizePathSeparator(normalizedLeadingLineContent, this._pathSeparator);
            }
            const lineContext = new LineContext(normalizedLeadingLineContent, this._cursorIndexDelta);
            this._suggestWidget.setLineContext(lineContext);
        }
        // Hide and clear model if there are no more items
        if (!this._suggestWidget.hasCompletions()) {
            this.hideSuggestWidget();
            return;
        }
        const dimensions = this._getTerminalDimensions();
        if (!dimensions.width || !dimensions.height) {
            return;
        }
        const xtermBox = this._screen.getBoundingClientRect();
        this._suggestWidget.showSuggestions(0, false, false, {
            left: xtermBox.left + this._terminal.buffer.active.cursorX * dimensions.width,
            top: xtermBox.top + this._terminal.buffer.active.cursorY * dimensions.height,
            height: dimensions.height
        });
    }
    _handleVSCodeSequence(data) {
        if (!this._terminal) {
            return false;
        }
        // Pass the sequence along to the capability
        const [command, ...args] = data.split(';');
        switch (command) {
            case "Completions" /* VSCodeSuggestOscPt.Completions */:
                this._handleCompletionsSequence(this._terminal, data, command, args);
                return true;
            case "CompletionsBash" /* VSCodeSuggestOscPt.CompletionsBash */:
                this._handleCompletionsBashSequence(this._terminal, data, command, args);
                return true;
            case "CompletionsBashFirstWord" /* VSCodeSuggestOscPt.CompletionsBashFirstWord */:
                return this._handleCompletionsBashFirstWordSequence(this._terminal, data, command, args);
        }
        // Unrecognized sequence
        return false;
    }
    _handleCompletionsSequence(terminal, data, command, args) {
        this._onDidReceiveCompletions.fire();
        // Nothing to handle if the terminal is not attached
        if (!terminal.element || !this._enableWidget || !this._promptInputModel) {
            return;
        }
        // Only show the suggest widget if the terminal is focused
        if (!dom.isAncestorOfActiveElement(terminal.element)) {
            return;
        }
        let replacementIndex = 0;
        let replacementLength = this._promptInputModel.cursorIndex;
        this._currentPromptInputState = {
            value: this._promptInputModel.value,
            prefix: this._promptInputModel.prefix,
            suffix: this._promptInputModel.suffix,
            cursorIndex: this._promptInputModel.cursorIndex,
            ghostTextIndex: this._promptInputModel.ghostTextIndex
        };
        this._leadingLineContent = this._currentPromptInputState.prefix.substring(replacementIndex, replacementIndex + replacementLength + this._cursorIndexDelta);
        const payload = data.slice(command.length + args[0].length + args[1].length + args[2].length + 4 /*semi-colons*/);
        const rawCompletions = args.length === 0 || payload.length === 0 ? undefined : JSON.parse(payload);
        const completions = parseCompletionsFromShell(rawCompletions);
        const firstChar = this._leadingLineContent.length === 0 ? '' : this._leadingLineContent[0];
        // This is a TabExpansion2 result
        if (this._leadingLineContent.includes(' ') || firstChar === '[') {
            replacementIndex = parseInt(args[0]);
            replacementLength = parseInt(args[1]);
            this._leadingLineContent = this._promptInputModel.prefix;
        }
        // This is a global command, add cached commands list to completions
        else {
            completions.push(...this._cachedPwshCommands);
        }
        this._replacementIndex = replacementIndex;
        this._replacementLength = replacementLength;
        if (this._mostRecentCompletion?.isDirectory && completions.every(e => e.completion.isDirectory)) {
            completions.push(new SimpleCompletionItem(this._mostRecentCompletion));
        }
        this._mostRecentCompletion = undefined;
        this._cursorIndexDelta = this._currentPromptInputState.cursorIndex - (replacementIndex + replacementLength);
        let normalizedLeadingLineContent = this._leadingLineContent;
        // If there is a single directory in the completions:
        // - `\` and `/` are normalized such that either can be used
        // - Using `\` or `/` will request new completions. It's important that this only occurs
        //   when a directory is present, if not completions like git branches could be requested
        //   which leads to flickering
        this._isFilteringDirectories = completions.some(e => e.completion.isDirectory);
        if (this._isFilteringDirectories) {
            const firstDir = completions.find(e => e.completion.isDirectory);
            this._pathSeparator = firstDir?.completion.label.match(/(?<sep>[\\\/])/)?.groups?.sep ?? sep;
            normalizedLeadingLineContent = normalizePathSeparator(normalizedLeadingLineContent, this._pathSeparator);
        }
        const lineContext = new LineContext(normalizedLeadingLineContent, this._cursorIndexDelta);
        const model = new SimpleCompletionModel(completions, lineContext, replacementIndex, replacementLength);
        this._handleCompletionModel(model);
    }
    _handleCompletionsBashFirstWordSequence(terminal, data, command, args) {
        const type = args[0];
        const completionList = data.slice(command.length + type.length + 2 /*semi-colons*/).split(';');
        let set;
        switch (type) {
            case 'alias':
                set = this._cachedBashAliases;
                break;
            case 'builtin':
                set = this._cachedBashBuiltins;
                break;
            case 'command':
                set = this._cachedBashCommands;
                break;
            case 'keyword':
                set = this._cachedBashKeywords;
                break;
            default: return false;
        }
        set.clear();
        const distinctLabels = new Set();
        for (const label of completionList) {
            distinctLabels.add(label);
        }
        for (const label of distinctLabels) {
            set.add(new SimpleCompletionItem({
                label,
                icon: Codicon.symbolString,
                detail: type
            }));
        }
        // Invalidate compound list cache
        this._cachedFirstWord = undefined;
        return true;
    }
    _handleCompletionsBashSequence(terminal, data, command, args) {
        // Nothing to handle if the terminal is not attached
        if (!terminal.element) {
            return;
        }
        let replacementIndex = parseInt(args[0]);
        const replacementLength = parseInt(args[1]);
        if (!args[2]) {
            this._onBell.fire();
            return;
        }
        const completionList = data.slice(command.length + args[0].length + args[1].length + args[2].length + 4 /*semi-colons*/).split(';');
        // TODO: Create a trigger suggest command which encapsulates sendSequence and uses cached if available
        let completions;
        // TODO: This 100 is a hack just for the prototype, this should get it based on some terminal input model
        if (replacementIndex !== 100 && completionList.length > 0) {
            completions = completionList.map(label => {
                return new SimpleCompletionItem({
                    label: label,
                    icon: Codicon.symbolProperty
                });
            });
        }
        else {
            replacementIndex = 0;
            if (!this._cachedFirstWord) {
                this._cachedFirstWord = [
                    ...this._cachedBashAliases,
                    ...this._cachedBashBuiltins,
                    ...this._cachedBashCommands,
                    ...this._cachedBashKeywords
                ];
                this._cachedFirstWord.sort((a, b) => {
                    const aCode = a.completion.label.charCodeAt(0);
                    const bCode = b.completion.label.charCodeAt(0);
                    const isANonAlpha = aCode < 65 || aCode > 90 && aCode < 97 || aCode > 122 ? 1 : 0;
                    const isBNonAlpha = bCode < 65 || bCode > 90 && bCode < 97 || bCode > 122 ? 1 : 0;
                    if (isANonAlpha !== isBNonAlpha) {
                        return isANonAlpha - isBNonAlpha;
                    }
                    return a.completion.label.localeCompare(b.completion.label);
                });
            }
            completions = this._cachedFirstWord;
        }
        if (completions.length === 0) {
            return;
        }
        this._leadingLineContent = completions[0].completion.label.slice(0, replacementLength);
        const model = new SimpleCompletionModel(completions, new LineContext(this._leadingLineContent, replacementIndex), replacementIndex, replacementLength);
        if (completions.length === 1) {
            const insertText = completions[0].completion.label.substring(replacementLength);
            if (insertText.length === 0) {
                this._onBell.fire();
                return;
            }
        }
        this._handleCompletionModel(model);
    }
    _getTerminalDimensions() {
        const cssCellDims = this._terminal._core._renderService.dimensions.css.cell;
        return {
            width: cssCellDims.width,
            height: cssCellDims.height,
        };
    }
    _handleCompletionModel(model) {
        if (!this._terminal?.element) {
            return;
        }
        const suggestWidget = this._ensureSuggestWidget(this._terminal);
        suggestWidget.setCompletionModel(model);
        if (model.items.length === 0 || !this._promptInputModel) {
            return;
        }
        this._model = model;
        const dimensions = this._getTerminalDimensions();
        if (!dimensions.width || !dimensions.height) {
            return;
        }
        const xtermBox = this._screen.getBoundingClientRect();
        suggestWidget.showSuggestions(0, false, false, {
            left: xtermBox.left + this._terminal.buffer.active.cursorX * dimensions.width,
            top: xtermBox.top + this._terminal.buffer.active.cursorY * dimensions.height,
            height: dimensions.height
        });
    }
    _ensureSuggestWidget(terminal) {
        this._terminalSuggestWidgetVisibleContextKey.set(true);
        if (!this._suggestWidget) {
            const c = this._terminalConfigurationService.config;
            const font = this._terminalConfigurationService.getFont(dom.getActiveWindow());
            const fontInfo = {
                fontFamily: font.fontFamily,
                fontSize: font.fontSize,
                lineHeight: Math.ceil(1.5 * font.fontSize),
                fontWeight: c.fontWeight.toString(),
                letterSpacing: font.letterSpacing
            };
            this._suggestWidget = this._register(this._instantiationService.createInstance(SimpleSuggestWidget, this._container, this._instantiationService.createInstance(PersistedWidgetSize), () => fontInfo, {}));
            this._suggestWidget.list.style(getListStyles({
                listInactiveFocusBackground: editorSuggestWidgetSelectedBackground,
                listInactiveFocusOutline: activeContrastBorder
            }));
            this._register(this._suggestWidget.onDidSelect(async (e) => this.acceptSelectedSuggestion(e)));
            this._register(this._suggestWidget.onDidHide(() => this._terminalSuggestWidgetVisibleContextKey.set(false)));
            this._register(this._suggestWidget.onDidShow(() => this._terminalSuggestWidgetVisibleContextKey.set(true)));
        }
        return this._suggestWidget;
    }
    selectPreviousSuggestion() {
        this._suggestWidget?.selectPrevious();
    }
    selectPreviousPageSuggestion() {
        this._suggestWidget?.selectPreviousPage();
    }
    selectNextSuggestion() {
        this._suggestWidget?.selectNext();
    }
    selectNextPageSuggestion() {
        this._suggestWidget?.selectNextPage();
    }
    acceptSelectedSuggestion(suggestion, respectRunOnEnter) {
        if (!suggestion) {
            suggestion = this._suggestWidget?.getFocusedItem();
        }
        const initialPromptInputState = this._mostRecentPromptInputState;
        if (!suggestion || !initialPromptInputState || !this._leadingLineContent || !this._model) {
            return;
        }
        this._lastAcceptedCompletionTimestamp = Date.now();
        this._suggestWidget?.hide();
        const currentPromptInputState = this._currentPromptInputState ?? initialPromptInputState;
        // The replacement text is any text after the replacement index for the completions, this
        // includes any text that was there before the completions were requested and any text added
        // since to refine the completion.
        const replacementText = currentPromptInputState.value.substring(this._model.replacementIndex, currentPromptInputState.cursorIndex);
        // Right side of replacement text in the same word
        let rightSideReplacementText = '';
        if (
        // The line didn't end with ghost text
        (currentPromptInputState.ghostTextIndex === -1 || currentPromptInputState.ghostTextIndex > currentPromptInputState.cursorIndex) &&
            // There is more than one charatcer
            currentPromptInputState.value.length > currentPromptInputState.cursorIndex + 1 &&
            // THe next character is not a space
            currentPromptInputState.value.at(currentPromptInputState.cursorIndex) !== ' ') {
            const spaceIndex = currentPromptInputState.value.substring(currentPromptInputState.cursorIndex, currentPromptInputState.ghostTextIndex === -1 ? undefined : currentPromptInputState.ghostTextIndex).indexOf(' ');
            rightSideReplacementText = currentPromptInputState.value.substring(currentPromptInputState.cursorIndex, spaceIndex === -1 ? undefined : currentPromptInputState.cursorIndex + spaceIndex);
        }
        const completion = suggestion.item.completion;
        const completionText = completion.label;
        let runOnEnter = false;
        if (respectRunOnEnter) {
            const runOnEnterConfig = this._configurationService.getValue(terminalSuggestConfigSection).runOnEnter;
            switch (runOnEnterConfig) {
                case 'always': {
                    runOnEnter = true;
                    break;
                }
                case 'exactMatch': {
                    runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
                    break;
                }
                case 'exactMatchIgnoreExtension': {
                    runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
                    if (completion.isFile) {
                        runOnEnter ||= replacementText.toLowerCase() === completionText.toLowerCase().replace(/\.[^\.]+$/, '');
                    }
                    break;
                }
            }
        }
        // For folders, allow the next completion request to get completions for that folder
        if (completion.icon === Codicon.folder) {
            this._lastAcceptedCompletionTimestamp = 0;
        }
        this._mostRecentCompletion = completion;
        const commonPrefixLen = commonPrefixLength(replacementText, completion.label);
        const commonPrefix = replacementText.substring(replacementText.length - 1 - commonPrefixLen, replacementText.length - 1);
        const completionSuffix = completion.label.substring(commonPrefixLen);
        let resultSequence;
        if (currentPromptInputState.suffix.length > 0 && currentPromptInputState.prefix.endsWith(commonPrefix) && currentPromptInputState.suffix.startsWith(completionSuffix)) {
            // Move right to the end of the completion
            resultSequence = '\x1bOC'.repeat(completion.label.length - commonPrefixLen);
        }
        else {
            resultSequence = [
                // Backspace (left) to remove all additional input
                '\x7F'.repeat(replacementText.length - commonPrefixLen),
                // Delete (right) to remove any additional text in the same word
                '\x1b[3~'.repeat(rightSideReplacementText.length),
                // Write the completion
                completionSuffix,
                // Run on enter if needed
                runOnEnter ? '\r' : ''
            ].join('');
        }
        // Send the completion
        this._onAcceptedCompletion.fire(resultSequence);
        this.hideSuggestWidget();
    }
    hideSuggestWidget() {
        this._currentPromptInputState = undefined;
        this._leadingLineContent = undefined;
        this._suggestWidget?.hide();
    }
};
SuggestAddon = SuggestAddon_1 = __decorate([
    __param(3, IConfigurationService),
    __param(4, IInstantiationService),
    __param(5, ITerminalConfigurationService),
    __metadata("design:paramtypes", [Set, Object, Object, Object, Object, Object])
], SuggestAddon);
export { SuggestAddon };
let PersistedWidgetSize = class PersistedWidgetSize {
    constructor(_storageService) {
        this._storageService = _storageService;
        this._key = "terminal.integrated.suggestSize" /* TerminalStorageKeys.TerminalSuggestSize */;
    }
    restore() {
        const raw = this._storageService.get(this._key, 0 /* StorageScope.PROFILE */) ?? '';
        try {
            const obj = JSON.parse(raw);
            if (dom.Dimension.is(obj)) {
                return dom.Dimension.lift(obj);
            }
        }
        catch {
            // ignore
        }
        return undefined;
    }
    store(size) {
        this._storageService.store(this._key, JSON.stringify(size), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
    }
    reset() {
        this._storageService.remove(this._key, 0 /* StorageScope.PROFILE */);
    }
};
PersistedWidgetSize = __decorate([
    __param(0, IStorageService),
    __metadata("design:paramtypes", [Object])
], PersistedWidgetSize);
export function parseCompletionsFromShell(rawCompletions) {
    if (!rawCompletions) {
        return [];
    }
    let typedRawCompletions;
    if (!Array.isArray(rawCompletions)) {
        typedRawCompletions = [rawCompletions];
    }
    else {
        if (rawCompletions.length === 0) {
            return [];
        }
        if (typeof rawCompletions[0] === 'string') {
            typedRawCompletions = [rawCompletions].map(e => ({
                CompletionText: e[0],
                ResultType: e[1],
                ToolTip: e[2],
                CustomIcon: e[3],
            }));
        }
        else if (Array.isArray(rawCompletions[0])) {
            typedRawCompletions = rawCompletions.map(e => ({
                CompletionText: e[0],
                ResultType: e[1],
                ToolTip: e[2],
                CustomIcon: e[3],
            }));
        }
        else {
            typedRawCompletions = rawCompletions;
        }
    }
    return typedRawCompletions.map(e => rawCompletionToSimpleCompletionItem(e));
}
function rawCompletionToSimpleCompletionItem(rawCompletion) {
    // HACK: Somewhere along the way from the powershell script to here, the path separator at the
    // end of directories may go missing, likely because `\"` -> `"`. As a result, make sure there
    // is a trailing separator at the end of all directory completions. This should not be done for
    // `.` and `..` entries because they are optimized not for navigating to different directories
    // but for passing as args.
    let label = rawCompletion.CompletionText;
    if (rawCompletion.ResultType === 4 &&
        !label.match(/^[\-+]$/) && // Don't add a `/` to `-` or `+` (navigate location history)
        !label.match(/^\.\.?$/) &&
        !label.match(/[\\\/]$/)) {
        const separator = label.match(/(?<sep>[\\\/])/)?.groups?.sep ?? sep;
        label = label + separator;
    }
    // If tooltip is not present it means it's the same as label
    const detail = rawCompletion.ToolTip ?? label;
    // Pwsh gives executables a result type of 2, but we want to treat them as files wrt the sorting
    // and file extension score boost. An example of where this improves the experience is typing
    // `git`, `git.exe` should appear at the top and beat `git-lfs.exe`. Keep the same icon though.
    const icon = getIcon(rawCompletion.ResultType, rawCompletion.CustomIcon);
    const isExecutable = rawCompletion.ResultType === 2 && rawCompletion.CompletionText.match(/\.[a-z0-9]{2,4}$/i);
    if (isExecutable) {
        rawCompletion.ResultType = 3;
    }
    return new SimpleCompletionItem({
        label,
        icon,
        detail,
        isFile: rawCompletion.ResultType === 3,
        isDirectory: rawCompletion.ResultType === 4,
        isKeyword: rawCompletion.ResultType === 12,
    });
}
function getIcon(resultType, customIconId) {
    if (customIconId) {
        const icon = customIconId in Codicon ? Codicon[customIconId] : Codicon.symbolText;
        if (icon) {
            return icon;
        }
    }
    return pwshTypeToIconMap[resultType] ?? Codicon.symbolText;
}
function normalizePathSeparator(path, sep) {
    if (sep === '/') {
        return path.replaceAll('\\', '/');
    }
    return path.replaceAll('/', '\\');
}
