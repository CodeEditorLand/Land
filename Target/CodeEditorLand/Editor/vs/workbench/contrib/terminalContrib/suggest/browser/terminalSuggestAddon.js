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
    static { this.requestCompletionsSequence = '\x1b[24~e'; }
    static { this.requestGlobalCompletionsSequence = '\x1b[24~f'; }
    static { this.requestEnableGitCompletionsSequence = '\x1b[24~g'; }
    static { this.requestEnableCodeCompletionsSequence = '\x1b[24~h'; }
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
        this._cachedBashAliases = new Set();
        this._cachedBashBuiltins = new Set();
        this._cachedBashCommands = new Set();
        this._cachedBashKeywords = new Set();
        this._register(Event.runAndSubscribe(Event.any(this._capabilities.onDidAddCapabilityType, this._capabilities.onDidRemoveCapabilityType), () => {
            const commandDetection = this._capabilities.get(2);
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
        this._register(xterm.parser.registerOscHandler(633, data => {
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
        if (this._cachedPwshCommands.size === 0) {
            this._requestGlobalCompletions();
        }
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
            let sent = false;
            if (!this._terminalSuggestWidgetVisibleContextKey.get()) {
                if (config.quickSuggestions) {
                    if (promptInputState.cursorIndex === 1 || promptInputState.prefix.match(/([\s\[])[^\s]$/)) {
                        if (!this._lastUserData?.match(/^\x1b[\[O]?[A-D]$/)) {
                            this._requestCompletions();
                            sent = true;
                        }
                    }
                }
            }
            if (config.suggestOnTriggerCharacters && !sent) {
                const prefix = promptInputState.prefix;
                if (prefix?.match(/\s[\-]$/) ||
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
        if (this._currentPromptInputState.cursorIndex > 1 && this._currentPromptInputState.value.at(this._currentPromptInputState.cursorIndex - 1) === ' ') {
            this.hideSuggestWidget();
            return;
        }
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
        const [command, ...args] = data.split(';');
        switch (command) {
            case "Completions":
                this._handleCompletionsSequence(this._terminal, data, command, args);
                return true;
            case "CompletionsBash":
                this._handleCompletionsBashSequence(this._terminal, data, command, args);
                return true;
            case "CompletionsBashFirstWord":
                return this._handleCompletionsBashFirstWordSequence(this._terminal, data, command, args);
        }
        return false;
    }
    _handleCompletionsSequence(terminal, data, command, args) {
        this._onDidReceiveCompletions.fire();
        if (!terminal.element || !this._enableWidget || !this._promptInputModel) {
            return;
        }
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
        const payload = data.slice(command.length + args[0].length + args[1].length + args[2].length + 4);
        const rawCompletions = args.length === 0 || payload.length === 0 ? undefined : JSON.parse(payload);
        const completions = parseCompletionsFromShell(rawCompletions);
        const firstChar = this._leadingLineContent.length === 0 ? '' : this._leadingLineContent[0];
        if (this._leadingLineContent.includes(' ') || firstChar === '[') {
            replacementIndex = parseInt(args[0]);
            replacementLength = parseInt(args[1]);
            this._leadingLineContent = this._promptInputModel.prefix;
        }
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
        const completionList = data.slice(command.length + type.length + 2).split(';');
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
        this._cachedFirstWord = undefined;
        return true;
    }
    _handleCompletionsBashSequence(terminal, data, command, args) {
        if (!terminal.element) {
            return;
        }
        let replacementIndex = parseInt(args[0]);
        const replacementLength = parseInt(args[1]);
        if (!args[2]) {
            this._onBell.fire();
            return;
        }
        const completionList = data.slice(command.length + args[0].length + args[1].length + args[2].length + 4).split(';');
        let completions;
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
        const replacementText = currentPromptInputState.value.substring(this._model.replacementIndex, currentPromptInputState.cursorIndex);
        let rightSideReplacementText = '';
        if ((currentPromptInputState.ghostTextIndex === -1 || currentPromptInputState.ghostTextIndex > currentPromptInputState.cursorIndex) &&
            currentPromptInputState.value.length > currentPromptInputState.cursorIndex + 1 &&
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
        if (completion.icon === Codicon.folder) {
            this._lastAcceptedCompletionTimestamp = 0;
        }
        this._mostRecentCompletion = completion;
        const commonPrefixLen = commonPrefixLength(replacementText, completion.label);
        const commonPrefix = replacementText.substring(replacementText.length - 1 - commonPrefixLen, replacementText.length - 1);
        const completionSuffix = completion.label.substring(commonPrefixLen);
        let resultSequence;
        if (currentPromptInputState.suffix.length > 0 && currentPromptInputState.prefix.endsWith(commonPrefix) && currentPromptInputState.suffix.startsWith(completionSuffix)) {
            resultSequence = '\x1bOC'.repeat(completion.label.length - commonPrefixLen);
        }
        else {
            resultSequence = [
                '\x7F'.repeat(replacementText.length - commonPrefixLen),
                '\x1b[3~'.repeat(rightSideReplacementText.length),
                completionSuffix,
                runOnEnter ? '\r' : ''
            ].join('');
        }
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
        this._key = "terminal.integrated.suggestSize";
    }
    restore() {
        const raw = this._storageService.get(this._key, 0) ?? '';
        try {
            const obj = JSON.parse(raw);
            if (dom.Dimension.is(obj)) {
                return dom.Dimension.lift(obj);
            }
        }
        catch {
        }
        return undefined;
    }
    store(size) {
        this._storageService.store(this._key, JSON.stringify(size), 0, 1);
    }
    reset() {
        this._storageService.remove(this._key, 0);
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
    let label = rawCompletion.CompletionText;
    if (rawCompletion.ResultType === 4 &&
        !label.match(/^[\-+]$/) &&
        !label.match(/^\.\.?$/) &&
        !label.match(/[\\\/]$/)) {
        const separator = label.match(/(?<sep>[\\\/])/)?.groups?.sep ?? sep;
        label = label + separator;
    }
    const detail = rawCompletion.ToolTip ?? label;
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
