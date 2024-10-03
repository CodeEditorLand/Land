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
import { localize } from '../../../../../../nls.js';
import { Emitter } from '../../../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../../../base/common/map.js';
import { EditorConfiguration } from '../../../../../../editor/browser/config/editorConfiguration.js';
import { CoreEditingCommands } from '../../../../../../editor/browser/coreCommands.js';
import { RedoCommand, UndoCommand } from '../../../../../../editor/browser/editorExtensions.js';
import { CodeEditorWidget } from '../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { cursorBlinkingStyleFromString, cursorStyleFromString, TextEditorCursorStyle } from '../../../../../../editor/common/config/editorOptions.js';
import { Selection } from '../../../../../../editor/common/core/selection.js';
import { USUAL_WORD_SEPARATORS } from '../../../../../../editor/common/core/wordHelper.js';
import { CommandExecutor, CursorsController } from '../../../../../../editor/common/cursor/cursor.js';
import { DeleteOperations } from '../../../../../../editor/common/cursor/cursorDeleteOperations.js';
import { CursorConfiguration } from '../../../../../../editor/common/cursorCommon.js';
import { ILanguageConfigurationService } from '../../../../../../editor/common/languages/languageConfigurationRegistry.js';
import { indentOfLine } from '../../../../../../editor/common/model/textModel.js';
import { ITextModelService } from '../../../../../../editor/common/services/resolverService.js';
import { ViewModelEventsCollector } from '../../../../../../editor/common/viewModelEventDispatcher.js';
import { WordHighlighterContribution } from '../../../../../../editor/contrib/wordHighlighter/browser/wordHighlighter.js';
import { IAccessibilityService } from '../../../../../../platform/accessibility/common/accessibility.js';
import { MenuId, registerAction2 } from '../../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IUndoRedoService } from '../../../../../../platform/undoRedo/common/undoRedo.js';
import { registerWorkbenchContribution2 } from '../../../../../common/contributions.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from '../../../common/notebookContextKeys.js';
import { NotebookAction } from '../../controller/coreActions.js';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { CellEditorOptions } from '../../view/cellParts/cellEditorOptions.js';
const NOTEBOOK_ADD_FIND_MATCH_TO_SELECTION_ID = 'notebook.addFindMatchToSelection';
export var NotebookMultiCursorState;
(function (NotebookMultiCursorState) {
    NotebookMultiCursorState[NotebookMultiCursorState["Idle"] = 0] = "Idle";
    NotebookMultiCursorState[NotebookMultiCursorState["Selecting"] = 1] = "Selecting";
    NotebookMultiCursorState[NotebookMultiCursorState["Editing"] = 2] = "Editing";
})(NotebookMultiCursorState || (NotebookMultiCursorState = {}));
export const NOTEBOOK_MULTI_CURSOR_CONTEXT = {
    IsNotebookMultiCursor: new RawContextKey('isNotebookMultiSelect', false),
    NotebookMultiSelectCursorState: new RawContextKey('notebookMultiSelectCursorState', NotebookMultiCursorState.Idle),
};
let NotebookMultiCursorController = class NotebookMultiCursorController extends Disposable {
    static { this.id = 'notebook.multiCursorController'; }
    getState() {
        return this.state;
    }
    constructor(notebookEditor, contextKeyService, textModelService, languageConfigurationService, accessibilityService, configurationService, undoRedoService) {
        super();
        this.notebookEditor = notebookEditor;
        this.contextKeyService = contextKeyService;
        this.textModelService = textModelService;
        this.languageConfigurationService = languageConfigurationService;
        this.accessibilityService = accessibilityService;
        this.configurationService = configurationService;
        this.undoRedoService = undoRedoService;
        this.word = '';
        this.trackedMatches = [];
        this._onDidChangeAnchorCell = this._register(new Emitter());
        this.onDidChangeAnchorCell = this._onDidChangeAnchorCell.event;
        this.anchorDisposables = this._register(new DisposableStore());
        this.cursorsDisposables = this._register(new DisposableStore());
        this.cursorsControllers = new ResourceMap();
        this.state = NotebookMultiCursorState.Idle;
        this._nbIsMultiSelectSession = NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor.bindTo(this.contextKeyService);
        this._nbMultiSelectState = NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.bindTo(this.contextKeyService);
        this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
        this._register(this.onDidChangeAnchorCell(() => {
            this.updateCursorsControllers();
            this.updateAnchorListeners();
        }));
    }
    updateCursorsControllers() {
        this.cursorsDisposables.clear();
        this.trackedMatches.forEach(async (match) => {
            const textModelRef = await this.textModelService.createModelReference(match.cellViewModel.uri);
            const textModel = textModelRef.object.textEditorModel;
            if (!textModel) {
                return;
            }
            const cursorSimpleModel = this.constructCursorSimpleModel(match.cellViewModel);
            const converter = this.constructCoordinatesConverter();
            const editorConfig = match.editorConfig;
            const controller = this.cursorsDisposables.add(new CursorsController(textModel, cursorSimpleModel, converter, new CursorConfiguration(textModel.getLanguageId(), textModel.getOptions(), editorConfig, this.languageConfigurationService)));
            controller.setSelections(new ViewModelEventsCollector(), undefined, match.wordSelections, 3);
            this.cursorsControllers.set(match.cellViewModel.uri, controller);
        });
    }
    constructCoordinatesConverter() {
        return {
            convertViewPositionToModelPosition(viewPosition) {
                return viewPosition;
            },
            convertViewRangeToModelRange(viewRange) {
                return viewRange;
            },
            validateViewPosition(viewPosition, expectedModelPosition) {
                return viewPosition;
            },
            validateViewRange(viewRange, expectedModelRange) {
                return viewRange;
            },
            convertModelPositionToViewPosition(modelPosition, affinity, allowZeroLineNumber, belowHiddenRanges) {
                return modelPosition;
            },
            convertModelRangeToViewRange(modelRange, affinity) {
                return modelRange;
            },
            modelPositionIsVisible(modelPosition) {
                return true;
            },
            getModelLineViewLineCount(modelLineNumber) {
                return 1;
            },
            getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
                return modelLineNumber;
            }
        };
    }
    constructCursorSimpleModel(cell) {
        return {
            getLineCount() {
                return cell.textBuffer.getLineCount();
            },
            getLineContent(lineNumber) {
                return cell.textBuffer.getLineContent(lineNumber);
            },
            getLineMinColumn(lineNumber) {
                return cell.textBuffer.getLineMinColumn(lineNumber);
            },
            getLineMaxColumn(lineNumber) {
                return cell.textBuffer.getLineMaxColumn(lineNumber);
            },
            getLineFirstNonWhitespaceColumn(lineNumber) {
                return cell.textBuffer.getLineFirstNonWhitespaceColumn(lineNumber);
            },
            getLineLastNonWhitespaceColumn(lineNumber) {
                return cell.textBuffer.getLineLastNonWhitespaceColumn(lineNumber);
            },
            normalizePosition(position, affinity) {
                return position;
            },
            getLineIndentColumn(lineNumber) {
                return indentOfLine(cell.textBuffer.getLineContent(lineNumber)) + 1;
            }
        };
    }
    updateAnchorListeners() {
        this.anchorDisposables.clear();
        if (!this.anchorCell) {
            throw new Error('Anchor cell is undefined');
        }
        this.anchorDisposables.add(this.anchorCell[1].onWillType((input) => {
            const collector = new ViewModelEventsCollector();
            this.trackedMatches.forEach(match => {
                const controller = this.cursorsControllers.get(match.cellViewModel.uri);
                if (!controller) {
                    return;
                }
                if (match.cellViewModel.handle !== this.anchorCell?.[0].handle) {
                    controller.type(collector, input, 'keyboard');
                }
            });
        }));
        this.anchorDisposables.add(this.anchorCell[1].onDidType(() => {
            this.state = NotebookMultiCursorState.Editing;
            this._nbMultiSelectState.set(NotebookMultiCursorState.Editing);
            const anchorController = this.cursorsControllers.get(this.anchorCell[0].uri);
            if (!anchorController) {
                return;
            }
            const activeSelections = this.notebookEditor.activeCodeEditor?.getSelections();
            if (!activeSelections) {
                return;
            }
            anchorController.setSelections(new ViewModelEventsCollector(), 'keyboard', activeSelections, 3);
            this.trackedMatches.forEach(match => {
                const controller = this.cursorsControllers.get(match.cellViewModel.uri);
                if (!controller) {
                    return;
                }
                match.initialSelection = controller.getSelection();
                match.wordSelections = [];
            });
            this.updateLazyDecorations();
        }));
        this.anchorDisposables.add(this.anchorCell[1].onDidChangeCursorSelection((e) => {
            if (e.source === 'mouse') {
                this.resetToIdleState();
                return;
            }
            if (!e.oldSelections || e.reason === 0 || e.reason === 2) {
                return;
            }
            const translation = {
                deltaStartCol: e.selection.startColumn - e.oldSelections[0].startColumn,
                deltaStartLine: e.selection.startLineNumber - e.oldSelections[0].startLineNumber,
                deltaEndCol: e.selection.endColumn - e.oldSelections[0].endColumn,
                deltaEndLine: e.selection.endLineNumber - e.oldSelections[0].endLineNumber,
            };
            const translationDir = e.selection.getDirection();
            this.trackedMatches.forEach(match => {
                const controller = this.cursorsControllers.get(match.cellViewModel.uri);
                if (!controller) {
                    return;
                }
                const newSelections = controller.getSelections().map(selection => {
                    const newStartCol = selection.startColumn + translation.deltaStartCol;
                    const newStartLine = selection.startLineNumber + translation.deltaStartLine;
                    const newEndCol = selection.endColumn + translation.deltaEndCol;
                    const newEndLine = selection.endLineNumber + translation.deltaEndLine;
                    return Selection.createWithDirection(newStartLine, newStartCol, newEndLine, newEndCol, translationDir);
                });
                controller.setSelections(new ViewModelEventsCollector(), e.source, newSelections, 3);
            });
            this.updateLazyDecorations();
        }));
        this.anchorDisposables.add(this.anchorCell[1].onWillTriggerEditorOperationEvent((e) => {
            this.trackedMatches.forEach(match => {
                if (match.cellViewModel.handle === this.anchorCell?.[0].handle) {
                    return;
                }
                const eventsCollector = new ViewModelEventsCollector();
                const controller = this.cursorsControllers.get(match.cellViewModel.uri);
                if (!controller) {
                    return;
                }
                switch (e.handlerId) {
                    case "compositionStart":
                        controller.startComposition(eventsCollector);
                        return;
                    case "compositionEnd":
                        controller.endComposition(eventsCollector, e.source);
                        return;
                    case "replacePreviousChar": {
                        const args = e.payload;
                        controller.compositionType(eventsCollector, args.text || '', args.replaceCharCnt || 0, 0, 0, e.source);
                        return;
                    }
                    case "compositionType": {
                        const args = e.payload;
                        controller.compositionType(eventsCollector, args.text || '', args.replacePrevCharCnt || 0, args.replaceNextCharCnt || 0, args.positionDelta || 0, e.source);
                        return;
                    }
                    case "paste": {
                        const args = e.payload;
                        controller.paste(eventsCollector, args.text || '', args.pasteOnNewLine || false, args.multicursorText || null, e.source);
                        return;
                    }
                    case "cut":
                        controller.cut(eventsCollector, e.source);
                        return;
                }
            });
        }));
        this.anchorDisposables.add(this.anchorCell[1].onDidBlurEditorWidget(() => {
            if (this.state === NotebookMultiCursorState.Selecting || this.state === NotebookMultiCursorState.Editing) {
                this.resetToIdleState();
            }
        }));
    }
    updateFinalUndoRedo() {
        const anchorCellModel = this.anchorCell?.[1].getModel();
        if (!anchorCellModel) {
            return;
        }
        const newElementsMap = new ResourceMap();
        const resources = [];
        this.trackedMatches.forEach(trackedMatch => {
            const undoRedoState = trackedMatch.undoRedoHistory;
            if (!undoRedoState) {
                return;
            }
            resources.push(trackedMatch.cellViewModel.uri);
            const currentPastElements = this.undoRedoService.getElements(trackedMatch.cellViewModel.uri).past.slice();
            const oldPastElements = trackedMatch.undoRedoHistory.past.slice();
            const newElements = currentPastElements.slice(oldPastElements.length);
            if (newElements.length === 0) {
                return;
            }
            newElementsMap.set(trackedMatch.cellViewModel.uri, newElements);
            this.undoRedoService.removeElements(trackedMatch.cellViewModel.uri);
            oldPastElements.forEach(element => {
                this.undoRedoService.pushElement(element);
            });
        });
        this.undoRedoService.pushElement({
            type: 1,
            resources: resources,
            label: 'Multi Cursor Edit',
            code: 'multiCursorEdit',
            confirmBeforeUndo: false,
            undo: async () => {
                newElementsMap.forEach(async (value) => {
                    value.reverse().forEach(async (element) => {
                        await element.undo();
                    });
                });
            },
            redo: async () => {
                newElementsMap.forEach(async (value) => {
                    value.forEach(async (element) => {
                        await element.redo();
                    });
                });
            }
        });
    }
    resetToIdleState() {
        this.state = NotebookMultiCursorState.Idle;
        this._nbMultiSelectState.set(NotebookMultiCursorState.Idle);
        this._nbIsMultiSelectSession.set(false);
        this.updateFinalUndoRedo();
        this.trackedMatches.forEach(match => {
            this.clearDecorations(match);
            match.cellViewModel.setSelections([match.initialSelection]);
        });
        this.anchorDisposables.clear();
        this.anchorCell = undefined;
        this.cursorsDisposables.clear();
        this.cursorsControllers.clear();
        this.trackedMatches = [];
    }
    async findAndTrackNextSelection(cell) {
        if (this.state === NotebookMultiCursorState.Idle) {
            const textModel = cell.textModel;
            if (!textModel) {
                return;
            }
            const inputSelection = cell.getSelections()[0];
            const word = this.getWord(inputSelection, textModel);
            if (!word) {
                return;
            }
            this.word = word.word;
            const newSelection = new Selection(inputSelection.startLineNumber, word.startColumn, inputSelection.startLineNumber, word.endColumn);
            cell.setSelections([newSelection]);
            this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
            if (!this.anchorCell || this.anchorCell[0].handle !== cell.handle) {
                throw new Error('Active cell is not the same as the cell passed as context');
            }
            if (!(this.anchorCell[1] instanceof CodeEditorWidget)) {
                throw new Error('Active cell is not an instance of CodeEditorWidget');
            }
            textModel.pushStackElement();
            this.trackedMatches = [];
            const editorConfig = this.constructCellEditorOptions(this.anchorCell[0]);
            const rawEditorOptions = editorConfig.getRawOptions();
            const cursorConfig = {
                cursorStyle: cursorStyleFromString(rawEditorOptions.cursorStyle),
                cursorBlinking: cursorBlinkingStyleFromString(rawEditorOptions.cursorBlinking),
                cursorSmoothCaretAnimation: rawEditorOptions.cursorSmoothCaretAnimation
            };
            const newMatch = {
                cellViewModel: cell,
                initialSelection: inputSelection,
                wordSelections: [newSelection],
                editorConfig: editorConfig,
                cursorConfig: cursorConfig,
                decorationIds: [],
                undoRedoHistory: this.undoRedoService.getElements(cell.uri)
            };
            this.trackedMatches.push(newMatch);
            this._nbIsMultiSelectSession.set(true);
            this.state = NotebookMultiCursorState.Selecting;
            this._nbMultiSelectState.set(NotebookMultiCursorState.Selecting);
            this._onDidChangeAnchorCell.fire();
        }
        else if (this.state === NotebookMultiCursorState.Selecting) {
            const notebookTextModel = this.notebookEditor.textModel;
            if (!notebookTextModel) {
                return;
            }
            const index = this.notebookEditor.getCellIndex(cell);
            if (index === undefined) {
                return;
            }
            const findResult = notebookTextModel.findNextMatch(this.word, { cellIndex: index, position: cell.getSelections()[cell.getSelections().length - 1].getEndPosition() }, false, true, USUAL_WORD_SEPARATORS);
            if (!findResult) {
                return;
            }
            const resultCellViewModel = this.notebookEditor.getCellByHandle(findResult.cell.handle);
            if (!resultCellViewModel) {
                return;
            }
            let newMatch;
            if (findResult.cell.handle === cell.handle) {
                newMatch = this.trackedMatches.find(match => match.cellViewModel.handle === findResult.cell.handle);
                newMatch.wordSelections.push(Selection.fromRange(findResult.match.range, 0));
                resultCellViewModel.setSelections(newMatch.wordSelections);
                const controller = this.cursorsControllers.get(newMatch.cellViewModel.uri);
                if (!controller) {
                    return;
                }
                controller.setSelections(new ViewModelEventsCollector(), undefined, newMatch.wordSelections, 3);
            }
            else if (findResult.cell.handle !== cell.handle) {
                await this.notebookEditor.revealRangeInViewAsync(resultCellViewModel, findResult.match.range);
                this.notebookEditor.focusNotebookCell(resultCellViewModel, 'editor');
                const initialSelection = resultCellViewModel.getSelections()[0];
                const newSelection = Selection.fromRange(findResult.match.range, 0);
                resultCellViewModel.setSelections([newSelection]);
                if (this.notebookEditor.activeCellAndCodeEditor?.[0].handle !== resultCellViewModel.handle) {
                    throw new Error('Focused cell does not match the find match data');
                }
                this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
                if (!this.anchorCell || !(this.anchorCell[1] instanceof CodeEditorWidget)) {
                    throw new Error('Active cell is not an instance of CodeEditorWidget');
                }
                const textModel = await resultCellViewModel.resolveTextModel();
                textModel.pushStackElement();
                const editorConfig = this.constructCellEditorOptions(this.anchorCell[0]);
                const rawEditorOptions = editorConfig.getRawOptions();
                const cursorConfig = {
                    cursorStyle: cursorStyleFromString(rawEditorOptions.cursorStyle),
                    cursorBlinking: cursorBlinkingStyleFromString(rawEditorOptions.cursorBlinking),
                    cursorSmoothCaretAnimation: rawEditorOptions.cursorSmoothCaretAnimation
                };
                newMatch = {
                    cellViewModel: resultCellViewModel,
                    initialSelection: initialSelection,
                    wordSelections: [newSelection],
                    editorConfig: editorConfig,
                    cursorConfig: cursorConfig,
                    decorationIds: [],
                    undoRedoHistory: this.undoRedoService.getElements(resultCellViewModel.uri)
                };
                this.trackedMatches.push(newMatch);
                this._onDidChangeAnchorCell.fire();
                this.initializeMultiSelectDecorations(this.trackedMatches.find(match => match.cellViewModel.handle === cell.handle));
            }
            else {
                return;
            }
        }
    }
    async deleteLeft() {
        this.trackedMatches.forEach(match => {
            const controller = this.cursorsControllers.get(match.cellViewModel.uri);
            if (!controller) {
                return;
            }
            const [, commands] = DeleteOperations.deleteLeft(controller.getPrevEditOperationType(), controller.context.cursorConfig, controller.context.model, controller.getSelections(), controller.getAutoClosedCharacters());
            const delSelections = CommandExecutor.executeCommands(controller.context.model, controller.getSelections(), commands);
            if (!delSelections) {
                return;
            }
            controller.setSelections(new ViewModelEventsCollector(), undefined, delSelections, 3);
        });
        this.updateLazyDecorations();
    }
    async deleteRight() {
        this.trackedMatches.forEach(match => {
            const controller = this.cursorsControllers.get(match.cellViewModel.uri);
            if (!controller) {
                return;
            }
            const [, commands] = DeleteOperations.deleteRight(controller.getPrevEditOperationType(), controller.context.cursorConfig, controller.context.model, controller.getSelections());
            if (match.cellViewModel.handle !== this.anchorCell?.[0].handle) {
                const delSelections = CommandExecutor.executeCommands(controller.context.model, controller.getSelections(), commands);
                if (!delSelections) {
                    return;
                }
                controller.setSelections(new ViewModelEventsCollector(), undefined, delSelections, 3);
            }
            else {
                controller.setSelections(new ViewModelEventsCollector(), undefined, match.cellViewModel.getSelections(), 3);
            }
        });
        this.updateLazyDecorations();
    }
    async undo() {
        const models = [];
        for (const match of this.trackedMatches) {
            const model = await match.cellViewModel.resolveTextModel();
            if (model) {
                models.push(model);
            }
            const controller = this.cursorsControllers.get(match.cellViewModel.uri);
            if (!controller) {
                return;
            }
            controller.setSelections(new ViewModelEventsCollector(), undefined, match.cellViewModel.getSelections(), 3);
        }
        await Promise.all(models.map(model => model.undo()));
        this.updateLazyDecorations();
    }
    async redo() {
        const models = [];
        for (const match of this.trackedMatches) {
            const model = await match.cellViewModel.resolveTextModel();
            if (model) {
                models.push(model);
            }
            const controller = this.cursorsControllers.get(match.cellViewModel.uri);
            if (!controller) {
                return;
            }
            controller.setSelections(new ViewModelEventsCollector(), undefined, match.cellViewModel.getSelections(), 3);
        }
        await Promise.all(models.map(model => model.redo()));
        this.updateLazyDecorations();
    }
    constructCellEditorOptions(cell) {
        const cellEditorOptions = new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(cell.language), this.notebookEditor.notebookOptions, this.configurationService);
        const options = cellEditorOptions.getUpdatedValue(cell.internalMetadata, cell.uri);
        return new EditorConfiguration(false, MenuId.EditorContent, options, null, this.accessibilityService);
    }
    initializeMultiSelectDecorations(match, isCurrentWord) {
        if (!match) {
            return;
        }
        const decorations = [];
        match.wordSelections.forEach(selection => {
            decorations.push({
                range: Selection.fromPositions(selection.getEndPosition()),
                options: {
                    description: '',
                    className: this.getClassName(match.cursorConfig, true),
                }
            });
        });
        match.decorationIds = match.cellViewModel.deltaModelDecorations(match.decorationIds, decorations);
    }
    updateLazyDecorations() {
        this.trackedMatches.forEach(match => {
            if (match.cellViewModel.handle === this.anchorCell?.[0].handle) {
                return;
            }
            const controller = this.cursorsControllers.get(match.cellViewModel.uri);
            if (!controller) {
                return;
            }
            const selections = controller.getSelections();
            const newDecorations = [];
            selections?.map(selection => {
                const isEmpty = selection.isEmpty();
                if (!isEmpty) {
                    newDecorations.push({
                        range: selection,
                        options: {
                            description: '',
                            className: this.getClassName(match.cursorConfig, false),
                        }
                    });
                }
                newDecorations.push({
                    range: Selection.fromPositions(selection.getPosition()),
                    options: {
                        description: '',
                        zIndex: 10000,
                        className: this.getClassName(match.cursorConfig, true),
                    }
                });
            });
            match.decorationIds = match.cellViewModel.deltaModelDecorations(match.decorationIds, newDecorations);
            const matchingEditor = this.notebookEditor.codeEditors.find(cellEditor => cellEditor[0] === match.cellViewModel);
            if (matchingEditor) {
                WordHighlighterContribution.get(matchingEditor[1])?.wordHighlighter?.trigger();
            }
        });
    }
    clearDecorations(match) {
        match.decorationIds = match.cellViewModel.deltaModelDecorations(match.decorationIds, []);
    }
    getWord(selection, model) {
        const lineNumber = selection.startLineNumber;
        const startColumn = selection.startColumn;
        if (model.isDisposed()) {
            return null;
        }
        return model.getWordAtPosition({
            lineNumber: lineNumber,
            column: startColumn
        });
    }
    getClassName(cursorConfig, isCursor) {
        let result = isCursor ? '.nb-multicursor-cursor' : '.nb-multicursor-selection';
        if (isCursor) {
            switch (cursorConfig.cursorStyle) {
                case TextEditorCursorStyle.Line:
                    break;
                case TextEditorCursorStyle.Block:
                    result += '.nb-cursor-block-style';
                    break;
                case TextEditorCursorStyle.Underline:
                    result += '.nb-cursor-underline-style';
                    break;
                case TextEditorCursorStyle.LineThin:
                    result += '.nb-cursor-line-thin-style';
                    break;
                case TextEditorCursorStyle.BlockOutline:
                    result += '.nb-cursor-block-outline-style';
                    break;
                case TextEditorCursorStyle.UnderlineThin:
                    result += '.nb-cursor-underline-thin-style';
                    break;
                default:
                    break;
            }
            switch (cursorConfig.cursorBlinking) {
                case 1:
                    result += '.nb-blink';
                    break;
                case 2:
                    result += '.nb-smooth';
                    break;
                case 3:
                    result += '.nb-phase';
                    break;
                case 4:
                    result += '.nb-expand';
                    break;
                case 5:
                    result += '.nb-solid';
                    break;
                default:
                    result += '.nb-solid';
                    break;
            }
            if (cursorConfig.cursorSmoothCaretAnimation === 'on' || cursorConfig.cursorSmoothCaretAnimation === 'explicit') {
                result += '.nb-smooth-caret-animation';
            }
        }
        return result;
    }
    dispose() {
        super.dispose();
        this.anchorDisposables.dispose();
        this.cursorsDisposables.dispose();
        this.trackedMatches.forEach(match => {
            this.clearDecorations(match);
        });
        this.trackedMatches = [];
    }
};
NotebookMultiCursorController = __decorate([
    __param(1, IContextKeyService),
    __param(2, ITextModelService),
    __param(3, ILanguageConfigurationService),
    __param(4, IAccessibilityService),
    __param(5, IConfigurationService),
    __param(6, IUndoRedoService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], NotebookMultiCursorController);
export { NotebookMultiCursorController };
class NotebookAddMatchToMultiSelectionAction extends NotebookAction {
    constructor() {
        super({
            id: NOTEBOOK_ADD_FIND_MATCH_TO_SELECTION_ID,
            title: localize('addFindMatchToSelection', "Add Find Match to Selection"),
            precondition: ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_CELL_EDITOR_FOCUSED),
            keybinding: {
                when: ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_CELL_EDITOR_FOCUSED),
                primary: 2048 | 34,
                weight: 200
            }
        });
    }
    async runWithContext(accessor, context) {
        const editorService = accessor.get(IEditorService);
        const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!editor) {
            return;
        }
        if (!context.cell) {
            return;
        }
        const controller = editor.getContribution(NotebookMultiCursorController.id);
        controller.findAndTrackNextSelection(context.cell);
    }
}
class NotebookExitMultiSelectionAction extends NotebookAction {
    constructor() {
        super({
            id: 'noteMultiCursor.exit',
            title: localize('exitMultiSelection', "Exit Multi Cursor Mode"),
            precondition: ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor),
            keybinding: {
                when: ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor),
                primary: 9,
                weight: 200
            }
        });
    }
    async runWithContext(accessor, context) {
        const editorService = accessor.get(IEditorService);
        const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!editor) {
            return;
        }
        const controller = editor.getContribution(NotebookMultiCursorController.id);
        controller.resetToIdleState();
    }
}
class NotebookDeleteLeftMultiSelectionAction extends NotebookAction {
    constructor() {
        super({
            id: 'noteMultiCursor.deleteLeft',
            title: localize('deleteLeftMultiSelection', "Delete Left"),
            precondition: ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor, ContextKeyExpr.or(NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(NotebookMultiCursorState.Selecting), NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(NotebookMultiCursorState.Editing))),
            keybinding: {
                when: ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor, ContextKeyExpr.or(NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(NotebookMultiCursorState.Selecting), NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(NotebookMultiCursorState.Editing))),
                primary: 1,
                weight: 200
            }
        });
    }
    async runWithContext(accessor, context) {
        const editorService = accessor.get(IEditorService);
        const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!editor) {
            return;
        }
        const controller = editor.getContribution(NotebookMultiCursorController.id);
        controller.deleteLeft();
    }
}
class NotebookDeleteRightMultiSelectionAction extends NotebookAction {
    constructor() {
        super({
            id: 'noteMultiCursor.deleteRight',
            title: localize('deleteRightMultiSelection', "Delete Right"),
            precondition: ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor, ContextKeyExpr.or(NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(NotebookMultiCursorState.Selecting), NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(NotebookMultiCursorState.Editing))),
            keybinding: {
                when: ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor, ContextKeyExpr.or(NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(NotebookMultiCursorState.Selecting), NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(NotebookMultiCursorState.Editing))),
                primary: 20,
                weight: 200
            }
        });
    }
    async runWithContext(accessor, context) {
        const editorService = accessor.get(IEditorService);
        const nbEditor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!nbEditor) {
            return;
        }
        const cellEditor = nbEditor.activeCodeEditor;
        if (!cellEditor) {
            return;
        }
        CoreEditingCommands.DeleteRight.runEditorCommand(accessor, cellEditor, null);
        const controller = nbEditor.getContribution(NotebookMultiCursorController.id);
        controller.deleteRight();
    }
}
let NotebookMultiCursorUndoRedoContribution = class NotebookMultiCursorUndoRedoContribution extends Disposable {
    static { this.ID = 'workbench.contrib.notebook.multiCursorUndoRedo'; }
    constructor(_editorService, configurationService) {
        super();
        this._editorService = _editorService;
        this.configurationService = configurationService;
        if (!this.configurationService.getValue('notebook.multiCursor.enabled')) {
            return;
        }
        const PRIORITY = 10005;
        this._register(UndoCommand.addImplementation(PRIORITY, 'notebook-multicursor-undo-redo', () => {
            const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
            if (!editor) {
                return false;
            }
            if (!editor.hasModel()) {
                return false;
            }
            const controller = editor.getContribution(NotebookMultiCursorController.id);
            return controller.undo();
        }, ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor)));
        this._register(RedoCommand.addImplementation(PRIORITY, 'notebook-multicursor-undo-redo', () => {
            const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
            if (!editor) {
                return false;
            }
            if (!editor.hasModel()) {
                return false;
            }
            const controller = editor.getContribution(NotebookMultiCursorController.id);
            return controller.redo();
        }, ContextKeyExpr.and(ContextKeyExpr.equals('config.notebook.multiCursor.enabled', true), NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor)));
    }
};
NotebookMultiCursorUndoRedoContribution = __decorate([
    __param(0, IEditorService),
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], NotebookMultiCursorUndoRedoContribution);
registerNotebookContribution(NotebookMultiCursorController.id, NotebookMultiCursorController);
registerWorkbenchContribution2(NotebookMultiCursorUndoRedoContribution.ID, NotebookMultiCursorUndoRedoContribution, 2);
registerAction2(NotebookAddMatchToMultiSelectionAction);
registerAction2(NotebookExitMultiSelectionAction);
registerAction2(NotebookDeleteLeftMultiSelectionAction);
registerAction2(NotebookDeleteRightMultiSelectionAction);
