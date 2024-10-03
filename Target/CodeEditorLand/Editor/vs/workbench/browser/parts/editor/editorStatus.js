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
var ShowLanguageExtensionsAction_1;
import './media/editorstatus.css';
import { localize, localize2 } from '../../../../nls.js';
import { getWindowById, runAtThisOrScheduleAtNextAnimationFrame } from '../../../../base/browser/dom.js';
import { format, compare, splitLines } from '../../../../base/common/strings.js';
import { extname, basename, isEqual } from '../../../../base/common/resources.js';
import { areFunctions, assertIsDefined } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { Action } from '../../../../base/common/actions.js';
import { Language } from '../../../../base/common/platform.js';
import { UntitledTextEditorInput } from '../../../services/untitled/common/untitledTextEditorInput.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { Disposable, MutableDisposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { TrimTrailingWhitespaceAction } from '../../../../editor/contrib/linesOperations/browser/linesOperations.js';
import { IndentUsingSpaces, IndentUsingTabs, ChangeTabDisplaySize, DetectIndentation, IndentationToSpacesAction, IndentationToTabsAction } from '../../../../editor/contrib/indentation/browser/indentation.js';
import { BaseBinaryResourceEditor } from './binaryEditor.js';
import { BinaryResourceDiffEditor } from './binaryDiffEditor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IFileService, FILES_ASSOCIATIONS_CONFIG } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { Range } from '../../../../editor/common/core/range.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { ICommandService, CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { SUPPORTED_ENCODINGS } from '../../../services/textfile/common/encoding.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { deepClone } from '../../../../base/common/objects.js';
import { getCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { Schemas } from '../../../../base/common/network.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { getIconClassesForLanguageId } from '../../../../editor/common/services/getIconClasses.js';
import { Promises, timeout } from '../../../../base/common/async.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { IMarkerService, MarkerSeverity, IMarkerData } from '../../../../platform/markers/common/markers.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { AutomaticLanguageDetectionLikelyWrongId, ILanguageDetectionService } from '../../../services/languageDetection/common/languageDetectionWorkerService.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { KeyChord } from '../../../../base/common/keyCodes.js';
import { TabFocus } from '../../../../editor/browser/config/tabFocus.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
class SideBySideEditorEncodingSupport {
    constructor(primary, secondary) {
        this.primary = primary;
        this.secondary = secondary;
    }
    getEncoding() {
        return this.primary.getEncoding();
    }
    async setEncoding(encoding, mode) {
        await Promises.settled([this.primary, this.secondary].map(editor => editor.setEncoding(encoding, mode)));
    }
}
class SideBySideEditorLanguageSupport {
    constructor(primary, secondary) {
        this.primary = primary;
        this.secondary = secondary;
    }
    setLanguageId(languageId, source) {
        [this.primary, this.secondary].forEach(editor => editor.setLanguageId(languageId, source));
    }
}
function toEditorWithEncodingSupport(input) {
    if (input instanceof UntitledTextEditorInput) {
        return input;
    }
    if (input instanceof SideBySideEditorInput) {
        const primaryEncodingSupport = toEditorWithEncodingSupport(input.primary);
        const secondaryEncodingSupport = toEditorWithEncodingSupport(input.secondary);
        if (primaryEncodingSupport && secondaryEncodingSupport) {
            return new SideBySideEditorEncodingSupport(primaryEncodingSupport, secondaryEncodingSupport);
        }
        return primaryEncodingSupport;
    }
    const encodingSupport = input;
    if (areFunctions(encodingSupport.setEncoding, encodingSupport.getEncoding)) {
        return encodingSupport;
    }
    return null;
}
function toEditorWithLanguageSupport(input) {
    if (input instanceof UntitledTextEditorInput) {
        return input;
    }
    if (input instanceof SideBySideEditorInput) {
        const primaryLanguageSupport = toEditorWithLanguageSupport(input.primary);
        const secondaryLanguageSupport = toEditorWithLanguageSupport(input.secondary);
        if (primaryLanguageSupport && secondaryLanguageSupport) {
            return new SideBySideEditorLanguageSupport(primaryLanguageSupport, secondaryLanguageSupport);
        }
        return primaryLanguageSupport;
    }
    const languageSupport = input;
    if (typeof languageSupport.setLanguageId === 'function') {
        return languageSupport;
    }
    return null;
}
class StateChange {
    constructor() {
        this.indentation = false;
        this.selectionStatus = false;
        this.languageId = false;
        this.languageStatus = false;
        this.encoding = false;
        this.EOL = false;
        this.tabFocusMode = false;
        this.columnSelectionMode = false;
        this.metadata = false;
    }
    combine(other) {
        this.indentation = this.indentation || other.indentation;
        this.selectionStatus = this.selectionStatus || other.selectionStatus;
        this.languageId = this.languageId || other.languageId;
        this.languageStatus = this.languageStatus || other.languageStatus;
        this.encoding = this.encoding || other.encoding;
        this.EOL = this.EOL || other.EOL;
        this.tabFocusMode = this.tabFocusMode || other.tabFocusMode;
        this.columnSelectionMode = this.columnSelectionMode || other.columnSelectionMode;
        this.metadata = this.metadata || other.metadata;
    }
    hasChanges() {
        return this.indentation
            || this.selectionStatus
            || this.languageId
            || this.languageStatus
            || this.encoding
            || this.EOL
            || this.tabFocusMode
            || this.columnSelectionMode
            || this.metadata;
    }
}
class State {
    get selectionStatus() { return this._selectionStatus; }
    get languageId() { return this._languageId; }
    get encoding() { return this._encoding; }
    get EOL() { return this._EOL; }
    get indentation() { return this._indentation; }
    get tabFocusMode() { return this._tabFocusMode; }
    get columnSelectionMode() { return this._columnSelectionMode; }
    get metadata() { return this._metadata; }
    update(update) {
        const change = new StateChange();
        switch (update.type) {
            case 'selectionStatus':
                if (this._selectionStatus !== update.selectionStatus) {
                    this._selectionStatus = update.selectionStatus;
                    change.selectionStatus = true;
                }
                break;
            case 'indentation':
                if (this._indentation !== update.indentation) {
                    this._indentation = update.indentation;
                    change.indentation = true;
                }
                break;
            case 'languageId':
                if (this._languageId !== update.languageId) {
                    this._languageId = update.languageId;
                    change.languageId = true;
                }
                break;
            case 'encoding':
                if (this._encoding !== update.encoding) {
                    this._encoding = update.encoding;
                    change.encoding = true;
                }
                break;
            case 'EOL':
                if (this._EOL !== update.EOL) {
                    this._EOL = update.EOL;
                    change.EOL = true;
                }
                break;
            case 'tabFocusMode':
                if (this._tabFocusMode !== update.tabFocusMode) {
                    this._tabFocusMode = update.tabFocusMode;
                    change.tabFocusMode = true;
                }
                break;
            case 'columnSelectionMode':
                if (this._columnSelectionMode !== update.columnSelectionMode) {
                    this._columnSelectionMode = update.columnSelectionMode;
                    change.columnSelectionMode = true;
                }
                break;
            case 'metadata':
                if (this._metadata !== update.metadata) {
                    this._metadata = update.metadata;
                    change.metadata = true;
                }
                break;
        }
        return change;
    }
}
let TabFocusMode = class TabFocusMode extends Disposable {
    constructor(configurationService) {
        super();
        this.configurationService = configurationService;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.registerListeners();
        const tabFocusModeConfig = configurationService.getValue('editor.tabFocusMode') === true ? true : false;
        TabFocus.setTabFocusMode(tabFocusModeConfig);
    }
    registerListeners() {
        this._register(TabFocus.onDidChangeTabFocus(tabFocusMode => this._onDidChange.fire(tabFocusMode)));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('editor.tabFocusMode')) {
                const tabFocusModeConfig = this.configurationService.getValue('editor.tabFocusMode') === true ? true : false;
                TabFocus.setTabFocusMode(tabFocusModeConfig);
                this._onDidChange.fire(tabFocusModeConfig);
            }
        }));
    }
};
TabFocusMode = __decorate([
    __param(0, IConfigurationService),
    __metadata("design:paramtypes", [Object])
], TabFocusMode);
const nlsSingleSelectionRange = localize('singleSelectionRange', "Ln {0}, Col {1} ({2} selected)");
const nlsSingleSelection = localize('singleSelection', "Ln {0}, Col {1}");
const nlsMultiSelectionRange = localize('multiSelectionRange', "{0} selections ({1} characters selected)");
const nlsMultiSelection = localize('multiSelection', "{0} selections");
const nlsEOLLF = localize('endOfLineLineFeed', "LF");
const nlsEOLCRLF = localize('endOfLineCarriageReturnLineFeed', "CRLF");
let EditorStatus = class EditorStatus extends Disposable {
    constructor(targetWindowId, editorService, quickInputService, languageService, textFileService, statusbarService, instantiationService, configurationService) {
        super();
        this.targetWindowId = targetWindowId;
        this.editorService = editorService;
        this.quickInputService = quickInputService;
        this.languageService = languageService;
        this.textFileService = textFileService;
        this.statusbarService = statusbarService;
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this.tabFocusModeElement = this._register(new MutableDisposable());
        this.columnSelectionModeElement = this._register(new MutableDisposable());
        this.indentationElement = this._register(new MutableDisposable());
        this.selectionElement = this._register(new MutableDisposable());
        this.encodingElement = this._register(new MutableDisposable());
        this.eolElement = this._register(new MutableDisposable());
        this.languageElement = this._register(new MutableDisposable());
        this.metadataElement = this._register(new MutableDisposable());
        this.currentMarkerStatus = this._register(this.instantiationService.createInstance(ShowCurrentMarkerInStatusbarContribution));
        this.tabFocusMode = this._register(this.instantiationService.createInstance(TabFocusMode));
        this.state = new State();
        this.toRender = undefined;
        this.activeEditorListeners = this._register(new DisposableStore());
        this.delayedRender = this._register(new MutableDisposable());
        this.registerCommands();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.editorService.onDidActiveEditorChange(() => this.updateStatusBar()));
        this._register(this.textFileService.untitled.onDidChangeEncoding(model => this.onResourceEncodingChange(model.resource)));
        this._register(this.textFileService.files.onDidChangeEncoding(model => this.onResourceEncodingChange((model.resource))));
        this._register(Event.runAndSubscribe(this.tabFocusMode.onDidChange, (tabFocusMode) => {
            if (tabFocusMode !== undefined) {
                this.onTabFocusModeChange(tabFocusMode);
            }
            else {
                this.onTabFocusModeChange(this.configurationService.getValue('editor.tabFocusMode'));
            }
        }));
    }
    registerCommands() {
        this._register(CommandsRegistry.registerCommand({ id: `changeEditorIndentation${this.targetWindowId}`, handler: () => this.showIndentationPicker() }));
    }
    async showIndentationPicker() {
        const activeTextEditorControl = getCodeEditor(this.editorService.activeTextEditorControl);
        if (!activeTextEditorControl) {
            return this.quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
        }
        if (this.editorService.activeEditor?.isReadonly()) {
            return this.quickInputService.pick([{ label: localize('noWritableCodeEditor', "The active code editor is read-only.") }]);
        }
        const picks = [
            assertIsDefined(activeTextEditorControl.getAction(IndentUsingSpaces.ID)),
            assertIsDefined(activeTextEditorControl.getAction(IndentUsingTabs.ID)),
            assertIsDefined(activeTextEditorControl.getAction(ChangeTabDisplaySize.ID)),
            assertIsDefined(activeTextEditorControl.getAction(DetectIndentation.ID)),
            assertIsDefined(activeTextEditorControl.getAction(IndentationToSpacesAction.ID)),
            assertIsDefined(activeTextEditorControl.getAction(IndentationToTabsAction.ID)),
            assertIsDefined(activeTextEditorControl.getAction(TrimTrailingWhitespaceAction.ID))
        ].map((a) => {
            return {
                id: a.id,
                label: a.label,
                detail: (Language.isDefaultVariant() || a.label === a.alias) ? undefined : a.alias,
                run: () => {
                    activeTextEditorControl.focus();
                    a.run();
                }
            };
        });
        picks.splice(3, 0, { type: 'separator', label: localize('indentConvert', "convert file") });
        picks.unshift({ type: 'separator', label: localize('indentView', "change view") });
        const action = await this.quickInputService.pick(picks, { placeHolder: localize('pickAction', "Select Action"), matchOnDetail: true });
        return action?.run();
    }
    updateTabFocusModeElement(visible) {
        if (visible) {
            if (!this.tabFocusModeElement.value) {
                const text = localize('tabFocusModeEnabled', "Tab Moves Focus");
                this.tabFocusModeElement.value = this.statusbarService.addEntry({
                    name: localize('status.editor.tabFocusMode', "Accessibility Mode"),
                    text,
                    ariaLabel: text,
                    tooltip: localize('disableTabMode', "Disable Accessibility Mode"),
                    command: 'editor.action.toggleTabFocusMode',
                    kind: 'prominent'
                }, 'status.editor.tabFocusMode', 1, 100.7);
            }
        }
        else {
            this.tabFocusModeElement.clear();
        }
    }
    updateColumnSelectionModeElement(visible) {
        if (visible) {
            if (!this.columnSelectionModeElement.value) {
                const text = localize('columnSelectionModeEnabled', "Column Selection");
                this.columnSelectionModeElement.value = this.statusbarService.addEntry({
                    name: localize('status.editor.columnSelectionMode', "Column Selection Mode"),
                    text,
                    ariaLabel: text,
                    tooltip: localize('disableColumnSelectionMode', "Disable Column Selection Mode"),
                    command: 'editor.action.toggleColumnSelection',
                    kind: 'prominent'
                }, 'status.editor.columnSelectionMode', 1, 100.8);
            }
        }
        else {
            this.columnSelectionModeElement.clear();
        }
    }
    updateSelectionElement(text) {
        if (!text) {
            this.selectionElement.clear();
            return;
        }
        const editorURI = getCodeEditor(this.editorService.activeTextEditorControl)?.getModel()?.uri;
        if (editorURI?.scheme === Schemas.vscodeNotebookCell) {
            this.selectionElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.selection', "Editor Selection"),
            text,
            ariaLabel: text,
            tooltip: localize('gotoLine', "Go to Line/Column"),
            command: 'workbench.action.gotoLine'
        };
        this.updateElement(this.selectionElement, props, 'status.editor.selection', 1, 100.5);
    }
    updateIndentationElement(text) {
        if (!text) {
            this.indentationElement.clear();
            return;
        }
        const editorURI = getCodeEditor(this.editorService.activeTextEditorControl)?.getModel()?.uri;
        if (editorURI?.scheme === Schemas.vscodeNotebookCell) {
            this.indentationElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.indentation', "Editor Indentation"),
            text,
            ariaLabel: text,
            tooltip: localize('selectIndentation', "Select Indentation"),
            command: `changeEditorIndentation${this.targetWindowId}`
        };
        this.updateElement(this.indentationElement, props, 'status.editor.indentation', 1, 100.4);
    }
    updateEncodingElement(text) {
        if (!text) {
            this.encodingElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.encoding', "Editor Encoding"),
            text,
            ariaLabel: text,
            tooltip: localize('selectEncoding', "Select Encoding"),
            command: 'workbench.action.editor.changeEncoding'
        };
        this.updateElement(this.encodingElement, props, 'status.editor.encoding', 1, 100.3);
    }
    updateEOLElement(text) {
        if (!text) {
            this.eolElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.eol', "Editor End of Line"),
            text,
            ariaLabel: text,
            tooltip: localize('selectEOL', "Select End of Line Sequence"),
            command: 'workbench.action.editor.changeEOL'
        };
        this.updateElement(this.eolElement, props, 'status.editor.eol', 1, 100.2);
    }
    updateLanguageIdElement(text) {
        if (!text) {
            this.languageElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.mode', "Editor Language"),
            text,
            ariaLabel: text,
            tooltip: localize('selectLanguageMode', "Select Language Mode"),
            command: 'workbench.action.editor.changeLanguageMode'
        };
        this.updateElement(this.languageElement, props, 'status.editor.mode', 1, 100.1);
    }
    updateMetadataElement(text) {
        if (!text) {
            this.metadataElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.info', "File Information"),
            text,
            ariaLabel: text,
            tooltip: localize('fileInfo', "File Information")
        };
        this.updateElement(this.metadataElement, props, 'status.editor.info', 1, 100);
    }
    updateElement(element, props, id, alignment, priority) {
        if (!element.value) {
            element.value = this.statusbarService.addEntry(props, id, alignment, priority);
        }
        else {
            element.value.update(props);
        }
    }
    updateState(update) {
        const changed = this.state.update(update);
        if (!changed.hasChanges()) {
            return;
        }
        if (!this.toRender) {
            this.toRender = changed;
            this.delayedRender.value = runAtThisOrScheduleAtNextAnimationFrame(getWindowById(this.targetWindowId, true).window, () => {
                this.delayedRender.clear();
                const toRender = this.toRender;
                this.toRender = undefined;
                if (toRender) {
                    this.doRenderNow();
                }
            });
        }
        else {
            this.toRender.combine(changed);
        }
    }
    doRenderNow() {
        this.updateTabFocusModeElement(!!this.state.tabFocusMode);
        this.updateColumnSelectionModeElement(!!this.state.columnSelectionMode);
        this.updateIndentationElement(this.state.indentation);
        this.updateSelectionElement(this.state.selectionStatus);
        this.updateEncodingElement(this.state.encoding);
        this.updateEOLElement(this.state.EOL ? this.state.EOL === '\r\n' ? nlsEOLCRLF : nlsEOLLF : undefined);
        this.updateLanguageIdElement(this.state.languageId);
        this.updateMetadataElement(this.state.metadata);
    }
    getSelectionLabel(info) {
        if (!info || !info.selections) {
            return undefined;
        }
        if (info.selections.length === 1) {
            if (info.charactersSelected) {
                return format(nlsSingleSelectionRange, info.selections[0].positionLineNumber, info.selections[0].positionColumn, info.charactersSelected);
            }
            return format(nlsSingleSelection, info.selections[0].positionLineNumber, info.selections[0].positionColumn);
        }
        if (info.charactersSelected) {
            return format(nlsMultiSelectionRange, info.selections.length, info.charactersSelected);
        }
        if (info.selections.length > 0) {
            return format(nlsMultiSelection, info.selections.length);
        }
        return undefined;
    }
    updateStatusBar() {
        const activeInput = this.editorService.activeEditor;
        const activeEditorPane = this.editorService.activeEditorPane;
        const activeCodeEditor = activeEditorPane ? getCodeEditor(activeEditorPane.getControl()) ?? undefined : undefined;
        this.onColumnSelectionModeChange(activeCodeEditor);
        this.onSelectionChange(activeCodeEditor);
        this.onLanguageChange(activeCodeEditor, activeInput);
        this.onEOLChange(activeCodeEditor);
        this.onEncodingChange(activeEditorPane, activeCodeEditor);
        this.onIndentationChange(activeCodeEditor);
        this.onMetadataChange(activeEditorPane);
        this.currentMarkerStatus.update(activeCodeEditor);
        this.activeEditorListeners.clear();
        if (activeEditorPane) {
            this.activeEditorListeners.add(activeEditorPane.onDidChangeControl(() => {
                this.updateStatusBar();
            }));
        }
        if (activeCodeEditor) {
            this.activeEditorListeners.add(activeCodeEditor.onDidChangeConfiguration((event) => {
                if (event.hasChanged(22)) {
                    this.onColumnSelectionModeChange(activeCodeEditor);
                }
            }));
            this.activeEditorListeners.add(Event.defer(activeCodeEditor.onDidChangeCursorPosition)(() => {
                this.onSelectionChange(activeCodeEditor);
                this.currentMarkerStatus.update(activeCodeEditor);
            }));
            this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelLanguage(() => {
                this.onLanguageChange(activeCodeEditor, activeInput);
            }));
            this.activeEditorListeners.add(Event.accumulate(activeCodeEditor.onDidChangeModelContent)(e => {
                this.onEOLChange(activeCodeEditor);
                this.currentMarkerStatus.update(activeCodeEditor);
                const selections = activeCodeEditor.getSelections();
                if (selections) {
                    for (const inner of e) {
                        for (const change of inner.changes) {
                            if (selections.some(selection => Range.areIntersecting(selection, change.range))) {
                                this.onSelectionChange(activeCodeEditor);
                                break;
                            }
                        }
                    }
                }
            }));
            this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelOptions(() => {
                this.onIndentationChange(activeCodeEditor);
            }));
        }
        else if (activeEditorPane instanceof BaseBinaryResourceEditor || activeEditorPane instanceof BinaryResourceDiffEditor) {
            const binaryEditors = [];
            if (activeEditorPane instanceof BinaryResourceDiffEditor) {
                const primary = activeEditorPane.getPrimaryEditorPane();
                if (primary instanceof BaseBinaryResourceEditor) {
                    binaryEditors.push(primary);
                }
                const secondary = activeEditorPane.getSecondaryEditorPane();
                if (secondary instanceof BaseBinaryResourceEditor) {
                    binaryEditors.push(secondary);
                }
            }
            else {
                binaryEditors.push(activeEditorPane);
            }
            for (const editor of binaryEditors) {
                this.activeEditorListeners.add(editor.onDidChangeMetadata(() => {
                    this.onMetadataChange(activeEditorPane);
                }));
                this.activeEditorListeners.add(editor.onDidOpenInPlace(() => {
                    this.updateStatusBar();
                }));
            }
        }
    }
    onLanguageChange(editorWidget, editorInput) {
        const info = { type: 'languageId', languageId: undefined };
        if (editorWidget && editorInput && toEditorWithLanguageSupport(editorInput)) {
            const textModel = editorWidget.getModel();
            if (textModel) {
                const languageId = textModel.getLanguageId();
                info.languageId = this.languageService.getLanguageName(languageId) ?? undefined;
            }
        }
        this.updateState(info);
    }
    onIndentationChange(editorWidget) {
        const update = { type: 'indentation', indentation: undefined };
        if (editorWidget) {
            const model = editorWidget.getModel();
            if (model) {
                const modelOpts = model.getOptions();
                update.indentation = (modelOpts.insertSpaces
                    ? modelOpts.tabSize === modelOpts.indentSize
                        ? localize('spacesSize', "Spaces: {0}", modelOpts.indentSize)
                        : localize('spacesAndTabsSize', "Spaces: {0} (Tab Size: {1})", modelOpts.indentSize, modelOpts.tabSize)
                    : localize({ key: 'tabSize', comment: ['Tab corresponds to the tab key'] }, "Tab Size: {0}", modelOpts.tabSize));
            }
        }
        this.updateState(update);
    }
    onMetadataChange(editor) {
        const update = { type: 'metadata', metadata: undefined };
        if (editor instanceof BaseBinaryResourceEditor || editor instanceof BinaryResourceDiffEditor) {
            update.metadata = editor.getMetadata();
        }
        this.updateState(update);
    }
    onColumnSelectionModeChange(editorWidget) {
        const info = { type: 'columnSelectionMode', columnSelectionMode: false };
        if (editorWidget?.getOption(22)) {
            info.columnSelectionMode = true;
        }
        this.updateState(info);
    }
    onSelectionChange(editorWidget) {
        const info = Object.create(null);
        if (editorWidget) {
            info.selections = editorWidget.getSelections() || [];
            info.charactersSelected = 0;
            const textModel = editorWidget.getModel();
            if (textModel) {
                for (const selection of info.selections) {
                    if (typeof info.charactersSelected !== 'number') {
                        info.charactersSelected = 0;
                    }
                    info.charactersSelected += textModel.getCharacterCountInRange(selection);
                }
            }
            if (info.selections.length === 1) {
                const editorPosition = editorWidget.getPosition();
                const selectionClone = new Selection(info.selections[0].selectionStartLineNumber, info.selections[0].selectionStartColumn, info.selections[0].positionLineNumber, editorPosition ? editorWidget.getStatusbarColumn(editorPosition) : info.selections[0].positionColumn);
                info.selections[0] = selectionClone;
            }
        }
        this.updateState({ type: 'selectionStatus', selectionStatus: this.getSelectionLabel(info) });
    }
    onEOLChange(editorWidget) {
        const info = { type: 'EOL', EOL: undefined };
        if (editorWidget && !editorWidget.getOption(94)) {
            const codeEditorModel = editorWidget.getModel();
            if (codeEditorModel) {
                info.EOL = codeEditorModel.getEOL();
            }
        }
        this.updateState(info);
    }
    onEncodingChange(editor, editorWidget) {
        if (editor && !this.isActiveEditor(editor)) {
            return;
        }
        const info = { type: 'encoding', encoding: undefined };
        if (editor && editorWidget?.hasModel()) {
            const encodingSupport = editor.input ? toEditorWithEncodingSupport(editor.input) : null;
            if (encodingSupport) {
                const rawEncoding = encodingSupport.getEncoding();
                const encodingInfo = typeof rawEncoding === 'string' ? SUPPORTED_ENCODINGS[rawEncoding] : undefined;
                if (encodingInfo) {
                    info.encoding = encodingInfo.labelShort;
                }
                else {
                    info.encoding = rawEncoding;
                }
            }
        }
        this.updateState(info);
    }
    onResourceEncodingChange(resource) {
        const activeEditorPane = this.editorService.activeEditorPane;
        if (activeEditorPane) {
            const activeResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input, { supportSideBySide: SideBySideEditor.PRIMARY });
            if (activeResource && isEqual(activeResource, resource)) {
                const activeCodeEditor = getCodeEditor(activeEditorPane.getControl()) ?? undefined;
                return this.onEncodingChange(activeEditorPane, activeCodeEditor);
            }
        }
    }
    onTabFocusModeChange(tabFocusMode) {
        const info = { type: 'tabFocusMode', tabFocusMode };
        this.updateState(info);
    }
    isActiveEditor(control) {
        const activeEditorPane = this.editorService.activeEditorPane;
        return !!activeEditorPane && activeEditorPane === control;
    }
};
EditorStatus = __decorate([
    __param(1, IEditorService),
    __param(2, IQuickInputService),
    __param(3, ILanguageService),
    __param(4, ITextFileService),
    __param(5, IStatusbarService),
    __param(6, IInstantiationService),
    __param(7, IConfigurationService),
    __metadata("design:paramtypes", [Number, Object, Object, Object, Object, Object, Object, Object])
], EditorStatus);
let EditorStatusContribution = class EditorStatusContribution extends Disposable {
    static { this.ID = 'workbench.contrib.editorStatus'; }
    constructor(editorGroupService) {
        super();
        this.editorGroupService = editorGroupService;
        for (const part of editorGroupService.parts) {
            this.createEditorStatus(part);
        }
        this._register(editorGroupService.onDidCreateAuxiliaryEditorPart(part => this.createEditorStatus(part)));
    }
    createEditorStatus(part) {
        const disposables = new DisposableStore();
        Event.once(part.onWillDispose)(() => disposables.dispose());
        const scopedInstantiationService = this.editorGroupService.getScopedInstantiationService(part);
        disposables.add(scopedInstantiationService.createInstance(EditorStatus, part.windowId));
    }
};
EditorStatusContribution = __decorate([
    __param(0, IEditorGroupsService),
    __metadata("design:paramtypes", [Object])
], EditorStatusContribution);
export { EditorStatusContribution };
let ShowCurrentMarkerInStatusbarContribution = class ShowCurrentMarkerInStatusbarContribution extends Disposable {
    constructor(statusbarService, markerService, configurationService) {
        super();
        this.statusbarService = statusbarService;
        this.markerService = markerService;
        this.configurationService = configurationService;
        this.editor = undefined;
        this.markers = [];
        this.currentMarker = null;
        this.statusBarEntryAccessor = this._register(new MutableDisposable());
        this._register(markerService.onMarkerChanged(changedResources => this.onMarkerChanged(changedResources)));
        this._register(Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('problems.showCurrentInStatus'))(() => this.updateStatus()));
    }
    update(editor) {
        this.editor = editor;
        this.updateMarkers();
        this.updateStatus();
    }
    updateStatus() {
        const previousMarker = this.currentMarker;
        this.currentMarker = this.getMarker();
        if (this.hasToUpdateStatus(previousMarker, this.currentMarker)) {
            if (this.currentMarker) {
                const line = splitLines(this.currentMarker.message)[0];
                const text = `${this.getType(this.currentMarker)} ${line}`;
                if (!this.statusBarEntryAccessor.value) {
                    this.statusBarEntryAccessor.value = this.statusbarService.addEntry({ name: localize('currentProblem', "Current Problem"), text: '', ariaLabel: '' }, 'statusbar.currentProblem', 0);
                }
                this.statusBarEntryAccessor.value.update({ name: localize('currentProblem', "Current Problem"), text, ariaLabel: text });
            }
            else {
                this.statusBarEntryAccessor.clear();
            }
        }
    }
    hasToUpdateStatus(previousMarker, currentMarker) {
        if (!currentMarker) {
            return true;
        }
        if (!previousMarker) {
            return true;
        }
        return IMarkerData.makeKey(previousMarker) !== IMarkerData.makeKey(currentMarker);
    }
    getType(marker) {
        switch (marker.severity) {
            case MarkerSeverity.Error: return '$(error)';
            case MarkerSeverity.Warning: return '$(warning)';
            case MarkerSeverity.Info: return '$(info)';
        }
        return '';
    }
    getMarker() {
        if (!this.configurationService.getValue('problems.showCurrentInStatus')) {
            return null;
        }
        if (!this.editor) {
            return null;
        }
        const model = this.editor.getModel();
        if (!model) {
            return null;
        }
        const position = this.editor.getPosition();
        if (!position) {
            return null;
        }
        return this.markers.find(marker => Range.containsPosition(marker, position)) || null;
    }
    onMarkerChanged(changedResources) {
        if (!this.editor) {
            return;
        }
        const model = this.editor.getModel();
        if (!model) {
            return;
        }
        if (model && !changedResources.some(r => isEqual(model.uri, r))) {
            return;
        }
        this.updateMarkers();
    }
    updateMarkers() {
        if (!this.editor) {
            return;
        }
        const model = this.editor.getModel();
        if (!model) {
            return;
        }
        if (model) {
            this.markers = this.markerService.read({
                resource: model.uri,
                severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info
            });
            this.markers.sort(this.compareMarker);
        }
        else {
            this.markers = [];
        }
        this.updateStatus();
    }
    compareMarker(a, b) {
        let res = compare(a.resource.toString(), b.resource.toString());
        if (res === 0) {
            res = MarkerSeverity.compare(a.severity, b.severity);
        }
        if (res === 0) {
            res = Range.compareRangesUsingStarts(a, b);
        }
        return res;
    }
};
ShowCurrentMarkerInStatusbarContribution = __decorate([
    __param(0, IStatusbarService),
    __param(1, IMarkerService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ShowCurrentMarkerInStatusbarContribution);
let ShowLanguageExtensionsAction = class ShowLanguageExtensionsAction extends Action {
    static { ShowLanguageExtensionsAction_1 = this; }
    static { this.ID = 'workbench.action.showLanguageExtensions'; }
    constructor(fileExtension, commandService, galleryService) {
        super(ShowLanguageExtensionsAction_1.ID, localize('showLanguageExtensions', "Search Marketplace Extensions for '{0}'...", fileExtension));
        this.fileExtension = fileExtension;
        this.commandService = commandService;
        this.enabled = galleryService.isEnabled();
    }
    async run() {
        await this.commandService.executeCommand('workbench.extensions.action.showExtensionsForLanguage', this.fileExtension);
    }
};
ShowLanguageExtensionsAction = ShowLanguageExtensionsAction_1 = __decorate([
    __param(1, ICommandService),
    __param(2, IExtensionGalleryService),
    __metadata("design:paramtypes", [String, Object, Object])
], ShowLanguageExtensionsAction);
export { ShowLanguageExtensionsAction };
export class ChangeLanguageAction extends Action2 {
    static { this.ID = 'workbench.action.editor.changeLanguageMode'; }
    constructor() {
        super({
            id: ChangeLanguageAction.ID,
            title: localize2('changeMode', 'Change Language Mode'),
            f1: true,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 41, 43)
            },
            precondition: ContextKeyExpr.not('notebookEditorFocused'),
            metadata: {
                description: localize('changeLanguageMode.description', "Change the language mode of the active text editor."),
                args: [
                    {
                        name: localize('changeLanguageMode.arg.name', "The name of the language mode to change to."),
                        constraint: (value) => typeof value === 'string',
                    }
                ]
            }
        });
    }
    async run(accessor, languageMode) {
        const quickInputService = accessor.get(IQuickInputService);
        const editorService = accessor.get(IEditorService);
        const languageService = accessor.get(ILanguageService);
        const languageDetectionService = accessor.get(ILanguageDetectionService);
        const textFileService = accessor.get(ITextFileService);
        const preferencesService = accessor.get(IPreferencesService);
        const instantiationService = accessor.get(IInstantiationService);
        const configurationService = accessor.get(IConfigurationService);
        const telemetryService = accessor.get(ITelemetryService);
        const activeTextEditorControl = getCodeEditor(editorService.activeTextEditorControl);
        if (!activeTextEditorControl) {
            await quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
            return;
        }
        const textModel = activeTextEditorControl.getModel();
        const resource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
        let currentLanguageName;
        let currentLanguageId;
        if (textModel) {
            currentLanguageId = textModel.getLanguageId();
            currentLanguageName = languageService.getLanguageName(currentLanguageId) ?? undefined;
        }
        let hasLanguageSupport = !!resource;
        if (resource?.scheme === Schemas.untitled && !textFileService.untitled.get(resource)?.hasAssociatedFilePath) {
            hasLanguageSupport = false;
        }
        const languages = languageService.getSortedRegisteredLanguageNames();
        const picks = languages
            .map(({ languageName, languageId }) => {
            const extensions = languageService.getExtensions(languageId).join(' ');
            let description;
            if (currentLanguageName === languageName) {
                description = localize('languageDescription', "({0}) - Configured Language", languageId);
            }
            else {
                description = localize('languageDescriptionConfigured', "({0})", languageId);
            }
            return {
                label: languageName,
                meta: extensions,
                iconClasses: getIconClassesForLanguageId(languageId),
                description
            };
        });
        picks.unshift({ type: 'separator', label: localize('languagesPicks', "languages (identifier)") });
        let configureLanguageAssociations;
        let configureLanguageSettings;
        let galleryAction;
        if (hasLanguageSupport && resource) {
            const ext = extname(resource) || basename(resource);
            galleryAction = instantiationService.createInstance(ShowLanguageExtensionsAction, ext);
            if (galleryAction.enabled) {
                picks.unshift(galleryAction);
            }
            configureLanguageSettings = { label: localize('configureModeSettings', "Configure '{0}' language based settings...", currentLanguageName) };
            picks.unshift(configureLanguageSettings);
            configureLanguageAssociations = { label: localize('configureAssociationsExt', "Configure File Association for '{0}'...", ext) };
            picks.unshift(configureLanguageAssociations);
        }
        const autoDetectLanguage = {
            label: localize('autoDetect', "Auto Detect")
        };
        picks.unshift(autoDetectLanguage);
        const pick = typeof languageMode === 'string' ? { label: languageMode } : await quickInputService.pick(picks, { placeHolder: localize('pickLanguage', "Select Language Mode"), matchOnDescription: true });
        if (!pick) {
            return;
        }
        if (pick === galleryAction) {
            galleryAction.run();
            return;
        }
        if (pick === configureLanguageAssociations) {
            if (resource) {
                this.configureFileAssociation(resource, languageService, quickInputService, configurationService);
            }
            return;
        }
        if (pick === configureLanguageSettings) {
            preferencesService.openUserSettings({ jsonEditor: true, revealSetting: { key: `[${currentLanguageId ?? null}]`, edit: true } });
            return;
        }
        const activeEditor = editorService.activeEditor;
        if (activeEditor) {
            const languageSupport = toEditorWithLanguageSupport(activeEditor);
            if (languageSupport) {
                let languageSelection;
                let detectedLanguage;
                if (pick === autoDetectLanguage) {
                    if (textModel) {
                        const resource = EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
                        if (resource) {
                            let languageId = languageService.guessLanguageIdByFilepathOrFirstLine(resource, textModel.getLineContent(1)) ?? undefined;
                            if (!languageId || languageId === 'unknown') {
                                detectedLanguage = await languageDetectionService.detectLanguage(resource);
                                languageId = detectedLanguage;
                            }
                            if (languageId) {
                                languageSelection = languageService.createById(languageId);
                            }
                        }
                    }
                }
                else {
                    const languageId = languageService.getLanguageIdByLanguageName(pick.label);
                    languageSelection = languageService.createById(languageId);
                    if (resource) {
                        languageDetectionService.detectLanguage(resource).then(detectedLanguageId => {
                            const chosenLanguageId = languageService.getLanguageIdByLanguageName(pick.label) || 'unknown';
                            if (detectedLanguageId === currentLanguageId && currentLanguageId !== chosenLanguageId) {
                                const modelPreference = configurationService.getValue('workbench.editor.preferHistoryBasedLanguageDetection') ? 'history' : 'classic';
                                telemetryService.publicLog2(AutomaticLanguageDetectionLikelyWrongId, {
                                    currentLanguageId: currentLanguageName ?? 'unknown',
                                    nextLanguageId: pick.label,
                                    lineCount: textModel?.getLineCount() ?? -1,
                                    modelPreference,
                                });
                            }
                        });
                    }
                }
                if (typeof languageSelection !== 'undefined') {
                    languageSupport.setLanguageId(languageSelection.languageId, ChangeLanguageAction.ID);
                    if (resource?.scheme === Schemas.untitled) {
                        const modelPreference = configurationService.getValue('workbench.editor.preferHistoryBasedLanguageDetection') ? 'history' : 'classic';
                        telemetryService.publicLog2('setUntitledDocumentLanguage', {
                            to: languageSelection.languageId,
                            from: currentLanguageId ?? 'none',
                            modelPreference,
                        });
                    }
                }
            }
            activeTextEditorControl.focus();
        }
    }
    configureFileAssociation(resource, languageService, quickInputService, configurationService) {
        const extension = extname(resource);
        const base = basename(resource);
        const currentAssociation = languageService.guessLanguageIdByFilepathOrFirstLine(URI.file(base));
        const languages = languageService.getSortedRegisteredLanguageNames();
        const picks = languages.map(({ languageName, languageId }) => {
            return {
                id: languageId,
                label: languageName,
                iconClasses: getIconClassesForLanguageId(languageId),
                description: (languageId === currentAssociation) ? localize('currentAssociation', "Current Association") : undefined
            };
        });
        setTimeout(async () => {
            const language = await quickInputService.pick(picks, { placeHolder: localize('pickLanguageToConfigure', "Select Language Mode to Associate with '{0}'", extension || base) });
            if (language) {
                const fileAssociationsConfig = configurationService.inspect(FILES_ASSOCIATIONS_CONFIG);
                let associationKey;
                if (extension && base[0] !== '.') {
                    associationKey = `*${extension}`;
                }
                else {
                    associationKey = base;
                }
                let target = 2;
                if (fileAssociationsConfig.workspaceValue && !!fileAssociationsConfig.workspaceValue[associationKey]) {
                    target = 5;
                }
                const currentAssociations = deepClone((target === 5) ? fileAssociationsConfig.workspaceValue : fileAssociationsConfig.userValue) || Object.create(null);
                currentAssociations[associationKey] = language.id;
                configurationService.updateValue(FILES_ASSOCIATIONS_CONFIG, currentAssociations, target);
            }
        }, 50);
    }
}
export class ChangeEOLAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.editor.changeEOL',
            title: localize2('changeEndOfLine', 'Change End of Line Sequence'),
            f1: true
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const quickInputService = accessor.get(IQuickInputService);
        const activeTextEditorControl = getCodeEditor(editorService.activeTextEditorControl);
        if (!activeTextEditorControl) {
            await quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
            return;
        }
        if (editorService.activeEditor?.isReadonly()) {
            await quickInputService.pick([{ label: localize('noWritableCodeEditor', "The active code editor is read-only.") }]);
            return;
        }
        let textModel = activeTextEditorControl.getModel();
        const EOLOptions = [
            { label: nlsEOLLF, eol: 0 },
            { label: nlsEOLCRLF, eol: 1 },
        ];
        const selectedIndex = (textModel?.getEOL() === '\n') ? 0 : 1;
        const eol = await quickInputService.pick(EOLOptions, { placeHolder: localize('pickEndOfLine', "Select End of Line Sequence"), activeItem: EOLOptions[selectedIndex] });
        if (eol) {
            const activeCodeEditor = getCodeEditor(editorService.activeTextEditorControl);
            if (activeCodeEditor?.hasModel() && !editorService.activeEditor?.isReadonly()) {
                textModel = activeCodeEditor.getModel();
                textModel.pushStackElement();
                textModel.pushEOL(eol.eol);
                textModel.pushStackElement();
            }
        }
        activeTextEditorControl.focus();
    }
}
export class ChangeEncodingAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.editor.changeEncoding',
            title: localize2('changeEncoding', 'Change File Encoding'),
            f1: true
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const quickInputService = accessor.get(IQuickInputService);
        const fileService = accessor.get(IFileService);
        const textFileService = accessor.get(ITextFileService);
        const textResourceConfigurationService = accessor.get(ITextResourceConfigurationService);
        const activeTextEditorControl = getCodeEditor(editorService.activeTextEditorControl);
        if (!activeTextEditorControl) {
            await quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
            return;
        }
        const activeEditorPane = editorService.activeEditorPane;
        if (!activeEditorPane) {
            await quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
            return;
        }
        const encodingSupport = toEditorWithEncodingSupport(activeEditorPane.input);
        if (!encodingSupport) {
            await quickInputService.pick([{ label: localize('noFileEditor', "No file active at this time") }]);
            return;
        }
        const saveWithEncodingPick = { label: localize('saveWithEncoding', "Save with Encoding") };
        const reopenWithEncodingPick = { label: localize('reopenWithEncoding', "Reopen with Encoding") };
        if (!Language.isDefaultVariant()) {
            const saveWithEncodingAlias = 'Save with Encoding';
            if (saveWithEncodingAlias !== saveWithEncodingPick.label) {
                saveWithEncodingPick.detail = saveWithEncodingAlias;
            }
            const reopenWithEncodingAlias = 'Reopen with Encoding';
            if (reopenWithEncodingAlias !== reopenWithEncodingPick.label) {
                reopenWithEncodingPick.detail = reopenWithEncodingAlias;
            }
        }
        let action;
        if (encodingSupport instanceof UntitledTextEditorInput) {
            action = saveWithEncodingPick;
        }
        else if (activeEditorPane.input.isReadonly()) {
            action = reopenWithEncodingPick;
        }
        else {
            action = await quickInputService.pick([reopenWithEncodingPick, saveWithEncodingPick], { placeHolder: localize('pickAction', "Select Action"), matchOnDetail: true });
        }
        if (!action) {
            return;
        }
        await timeout(50);
        const resource = EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: SideBySideEditor.PRIMARY });
        if (!resource || (!fileService.hasProvider(resource) && resource.scheme !== Schemas.untitled)) {
            return;
        }
        let guessedEncoding = undefined;
        if (fileService.hasProvider(resource)) {
            const content = await textFileService.readStream(resource, {
                autoGuessEncoding: true,
                candidateGuessEncodings: textResourceConfigurationService.getValue(resource, 'files.candidateGuessEncodings')
            });
            guessedEncoding = content.encoding;
        }
        const isReopenWithEncoding = (action === reopenWithEncodingPick);
        const configuredEncoding = textResourceConfigurationService.getValue(resource, 'files.encoding');
        let directMatchIndex;
        let aliasMatchIndex;
        const picks = Object.keys(SUPPORTED_ENCODINGS)
            .sort((k1, k2) => {
            if (k1 === configuredEncoding) {
                return -1;
            }
            else if (k2 === configuredEncoding) {
                return 1;
            }
            return SUPPORTED_ENCODINGS[k1].order - SUPPORTED_ENCODINGS[k2].order;
        })
            .filter(k => {
            if (k === guessedEncoding && guessedEncoding !== configuredEncoding) {
                return false;
            }
            return !isReopenWithEncoding || !SUPPORTED_ENCODINGS[k].encodeOnly;
        })
            .map((key, index) => {
            if (key === encodingSupport.getEncoding()) {
                directMatchIndex = index;
            }
            else if (SUPPORTED_ENCODINGS[key].alias === encodingSupport.getEncoding()) {
                aliasMatchIndex = index;
            }
            return { id: key, label: SUPPORTED_ENCODINGS[key].labelLong, description: key };
        });
        const items = picks.slice();
        if (guessedEncoding && configuredEncoding !== guessedEncoding && SUPPORTED_ENCODINGS[guessedEncoding]) {
            picks.unshift({ type: 'separator' });
            picks.unshift({ id: guessedEncoding, label: SUPPORTED_ENCODINGS[guessedEncoding].labelLong, description: localize('guessedEncoding', "Guessed from content") });
        }
        const encoding = await quickInputService.pick(picks, {
            placeHolder: isReopenWithEncoding ? localize('pickEncodingForReopen', "Select File Encoding to Reopen File") : localize('pickEncodingForSave', "Select File Encoding to Save with"),
            activeItem: items[typeof directMatchIndex === 'number' ? directMatchIndex : typeof aliasMatchIndex === 'number' ? aliasMatchIndex : -1]
        });
        if (!encoding) {
            return;
        }
        if (!editorService.activeEditorPane) {
            return;
        }
        const activeEncodingSupport = toEditorWithEncodingSupport(editorService.activeEditorPane.input);
        if (typeof encoding.id !== 'undefined' && activeEncodingSupport) {
            await activeEncodingSupport.setEncoding(encoding.id, isReopenWithEncoding ? 1 : 0);
        }
        activeTextEditorControl.focus();
    }
}
