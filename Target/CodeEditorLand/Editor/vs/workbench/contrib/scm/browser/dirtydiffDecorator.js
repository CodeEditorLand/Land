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
var DirtyDiffController_1, DirtyDiffDecorator_1;
import * as nls from '../../../../nls.js';
import './media/dirtydiffDecorator.css';
import { ThrottledDelayer } from '../../../../base/common/async.js';
import { dispose, toDisposable, Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ISCMService } from '../common/scm.js';
import { ModelDecorationOptions } from '../../../../editor/common/model/textModel.js';
import { themeColorFromId, IThemeService } from '../../../../platform/theme/common/themeService.js';
import { editorErrorForeground, registerColor, transparent } from '../../../../platform/theme/common/colorRegistry.js';
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { registerEditorAction, registerEditorContribution, EditorAction } from '../../../../editor/browser/editorExtensions.js';
import { PeekViewWidget, getOuterEditor, peekViewBorder, peekViewTitleBackground, peekViewTitleForeground, peekViewTitleInfoForeground } from '../../../../editor/contrib/peekView/browser/peekView.js';
import { IContextKeyService, ContextKeyExpr, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { Position } from '../../../../editor/common/core/position.js';
import { rot } from '../../../../base/common/numbers.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { EmbeddedDiffEditorWidget } from '../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js';
import { Action, ActionRunner } from '../../../../base/common/actions.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { basename } from '../../../../base/common/resources.js';
import { MenuId, IMenuService, MenuItemAction, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { createAndFillInActionBarActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { OverviewRulerLane, shouldSynchronizeModel } from '../../../../editor/common/model.js';
import { equals, sortedDiff } from '../../../../base/common/arrays.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import * as dom from '../../../../base/browser/dom.js';
import { ITextFileService, isTextFileEditorModel } from '../../../services/textfile/common/textfiles.js';
import { gotoNextLocation, gotoPreviousLocation } from '../../../../platform/theme/common/iconRegistry.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { TextCompareEditorActiveContext } from '../../../common/contextkeys.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { Color } from '../../../../base/common/color.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IQuickDiffService } from '../common/quickDiff.js';
import { SwitchQuickDiffBaseAction, SwitchQuickDiffViewItem } from './dirtyDiffSwitcher.js';
class DiffActionRunner extends ActionRunner {
    runAction(action, context) {
        if (action instanceof MenuItemAction) {
            return action.run(...context);
        }
        return super.runAction(action, context);
    }
}
export const isDirtyDiffVisible = new RawContextKey('dirtyDiffVisible', false);
function getChangeHeight(change) {
    const modified = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
    const original = change.originalEndLineNumber - change.originalStartLineNumber + 1;
    if (change.originalEndLineNumber === 0) {
        return modified;
    }
    else if (change.modifiedEndLineNumber === 0) {
        return original;
    }
    else {
        return modified + original;
    }
}
function getModifiedEndLineNumber(change) {
    if (change.modifiedEndLineNumber === 0) {
        return change.modifiedStartLineNumber === 0 ? 1 : change.modifiedStartLineNumber;
    }
    else {
        return change.modifiedEndLineNumber;
    }
}
function lineIntersectsChange(lineNumber, change) {
    // deletion at the beginning of the file
    if (lineNumber === 1 && change.modifiedStartLineNumber === 0 && change.modifiedEndLineNumber === 0) {
        return true;
    }
    return lineNumber >= change.modifiedStartLineNumber && lineNumber <= (change.modifiedEndLineNumber || change.modifiedStartLineNumber);
}
let UIEditorAction = class UIEditorAction extends Action {
    constructor(editor, action, cssClass, keybindingService, instantiationService) {
        const keybinding = keybindingService.lookupKeybinding(action.id);
        const label = action.label + (keybinding ? ` (${keybinding.getLabel()})` : '');
        super(action.id, label, cssClass);
        this.instantiationService = instantiationService;
        this.action = action;
        this.editor = editor;
    }
    run() {
        return Promise.resolve(this.instantiationService.invokeFunction(accessor => this.action.run(accessor, this.editor, null)));
    }
};
UIEditorAction = __decorate([
    __param(3, IKeybindingService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, EditorAction, String, Object, Object])
], UIEditorAction);
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["Modify"] = 0] = "Modify";
    ChangeType[ChangeType["Add"] = 1] = "Add";
    ChangeType[ChangeType["Delete"] = 2] = "Delete";
})(ChangeType || (ChangeType = {}));
function getChangeType(change) {
    if (change.originalEndLineNumber === 0) {
        return ChangeType.Add;
    }
    else if (change.modifiedEndLineNumber === 0) {
        return ChangeType.Delete;
    }
    else {
        return ChangeType.Modify;
    }
}
function getChangeTypeColor(theme, changeType) {
    switch (changeType) {
        case ChangeType.Modify: return theme.getColor(editorGutterModifiedBackground);
        case ChangeType.Add: return theme.getColor(editorGutterAddedBackground);
        case ChangeType.Delete: return theme.getColor(editorGutterDeletedBackground);
    }
}
function getOuterEditorFromDiffEditor(accessor) {
    const diffEditors = accessor.get(ICodeEditorService).listDiffEditors();
    for (const diffEditor of diffEditors) {
        if (diffEditor.hasTextFocus() && diffEditor instanceof EmbeddedDiffEditorWidget) {
            return diffEditor.getParentEditor();
        }
    }
    return getOuterEditor(accessor);
}
let DirtyDiffWidget = class DirtyDiffWidget extends PeekViewWidget {
    constructor(editor, model, themeService, instantiationService, menuService, contextKeyService) {
        super(editor, { isResizeable: true, frameWidth: 1, keepEditorSelection: true, className: 'dirty-diff' }, instantiationService);
        this.model = model;
        this.themeService = themeService;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this._index = 0;
        this._provider = '';
        this.height = undefined;
        this._disposables.add(themeService.onDidColorThemeChange(this._applyTheme, this));
        this._applyTheme(themeService.getColorTheme());
        if (this.model.original.length > 0) {
            contextKeyService = contextKeyService.createOverlay([['originalResourceScheme', this.model.original[0].uri.scheme], ['originalResourceSchemes', this.model.original.map(original => original.uri.scheme)]]);
        }
        this.create();
        if (editor.hasModel()) {
            this.title = basename(editor.getModel().uri);
        }
        else {
            this.title = '';
        }
        this.setTitle(this.title);
    }
    get provider() {
        return this._provider;
    }
    get index() {
        return this._index;
    }
    get visibleRange() {
        const visibleRanges = this.diffEditor.getModifiedEditor().getVisibleRanges();
        return visibleRanges.length >= 0 ? visibleRanges[0] : undefined;
    }
    showChange(index, usePosition = true) {
        const labeledChange = this.model.changes[index];
        const change = labeledChange.change;
        this._index = index;
        this.contextKeyService.createKey('originalResourceScheme', this.model.changes[index].uri.scheme);
        this.updateActions();
        this._provider = labeledChange.label;
        this.change = change;
        const originalModel = this.model.original;
        if (!originalModel) {
            return;
        }
        const onFirstDiffUpdate = Event.once(this.diffEditor.onDidUpdateDiff);
        // TODO@joao TODO@alex need this setTimeout probably because the
        // non-side-by-side diff still hasn't created the view zones
        onFirstDiffUpdate(() => setTimeout(() => this.revealChange(change), 0));
        const diffEditorModel = this.model.getDiffEditorModel(labeledChange.uri.toString());
        if (!diffEditorModel) {
            return;
        }
        this.diffEditor.setModel(diffEditorModel);
        this.dropdown?.setSelection(labeledChange.label);
        const position = new Position(getModifiedEndLineNumber(change), 1);
        const lineHeight = this.editor.getOption(69 /* EditorOption.lineHeight */);
        const editorHeight = this.editor.getLayoutInfo().height;
        const editorHeightInLines = Math.floor(editorHeight / lineHeight);
        const height = Math.min(getChangeHeight(change) + /* padding */ 8, Math.floor(editorHeightInLines / 3));
        this.renderTitle(labeledChange.label);
        const changeType = getChangeType(change);
        const changeTypeColor = getChangeTypeColor(this.themeService.getColorTheme(), changeType);
        this.style({ frameColor: changeTypeColor, arrowColor: changeTypeColor });
        const providerSpecificChanges = [];
        let contextIndex = index;
        for (const change of this.model.changes) {
            if (change.label === this.model.changes[this._index].label) {
                providerSpecificChanges.push(change.change);
                if (labeledChange === change) {
                    contextIndex = providerSpecificChanges.length - 1;
                }
            }
        }
        this._actionbarWidget.context = [diffEditorModel.modified.uri, providerSpecificChanges, contextIndex];
        if (usePosition) {
            this.show(position, height);
            this.editor.setPosition(position);
            this.editor.focus();
        }
    }
    renderTitle(label) {
        const providerChanges = this.model.mapChanges.get(label);
        const providerIndex = providerChanges.indexOf(this._index);
        let detail;
        if (!this.shouldUseDropdown()) {
            detail = this.model.changes.length > 1
                ? nls.localize('changes', "{0} - {1} of {2} changes", label, providerIndex + 1, providerChanges.length)
                : nls.localize('change', "{0} - {1} of {2} change", label, providerIndex + 1, providerChanges.length);
            this.dropdownContainer.style.display = 'none';
        }
        else {
            detail = this.model.changes.length > 1
                ? nls.localize('multiChanges', "{0} of {1} changes", providerIndex + 1, providerChanges.length)
                : nls.localize('multiChange', "{0} of {1} change", providerIndex + 1, providerChanges.length);
            this.dropdownContainer.style.display = 'inherit';
        }
        this.setTitle(this.title, detail);
    }
    switchQuickDiff(event) {
        const newProvider = event?.provider;
        if (newProvider === this.model.changes[this._index].label) {
            return;
        }
        let closestGreaterIndex = this._index < this.model.changes.length - 1 ? this._index + 1 : 0;
        for (let i = closestGreaterIndex; i !== this._index; i < this.model.changes.length - 1 ? i++ : i = 0) {
            if (this.model.changes[i].label === newProvider) {
                closestGreaterIndex = i;
                break;
            }
        }
        let closestLesserIndex = this._index > 0 ? this._index - 1 : this.model.changes.length - 1;
        for (let i = closestLesserIndex; i !== this._index; i >= 0 ? i-- : i = this.model.changes.length - 1) {
            if (this.model.changes[i].label === newProvider) {
                closestLesserIndex = i;
                break;
            }
        }
        const closestIndex = Math.abs(this.model.changes[closestGreaterIndex].change.modifiedEndLineNumber - this.model.changes[this._index].change.modifiedEndLineNumber)
            < Math.abs(this.model.changes[closestLesserIndex].change.modifiedEndLineNumber - this.model.changes[this._index].change.modifiedEndLineNumber)
            ? closestGreaterIndex : closestLesserIndex;
        this.showChange(closestIndex, false);
    }
    shouldUseDropdown() {
        let providersWithChangesCount = 0;
        if (this.model.mapChanges.size > 1) {
            const keys = Array.from(this.model.mapChanges.keys());
            for (let i = 0; (i < keys.length) && (providersWithChangesCount <= 1); i++) {
                if (this.model.mapChanges.get(keys[i]).length > 0) {
                    providersWithChangesCount++;
                }
            }
        }
        return providersWithChangesCount >= 2;
    }
    updateActions() {
        if (!this._actionbarWidget) {
            return;
        }
        const previous = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowPreviousChangeAction(this.editor), ThemeIcon.asClassName(gotoPreviousLocation));
        const next = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowNextChangeAction(this.editor), ThemeIcon.asClassName(gotoNextLocation));
        this._disposables.add(previous);
        this._disposables.add(next);
        const actions = [];
        if (this.menu) {
            this.menu.dispose();
        }
        this.menu = this.menuService.createMenu(MenuId.SCMChangeContext, this.contextKeyService);
        createAndFillInActionBarActions(this.menu, { shouldForwardArgs: true }, actions);
        this._actionbarWidget.clear();
        this._actionbarWidget.push(actions.reverse(), { label: false, icon: true });
        this._actionbarWidget.push([next, previous], { label: false, icon: true });
        this._actionbarWidget.push(new Action('peekview.close', nls.localize('label.close', "Close"), ThemeIcon.asClassName(Codicon.close), true, () => this.dispose()), { label: false, icon: true });
    }
    _fillHead(container) {
        super._fillHead(container, true);
        this.dropdownContainer = dom.prepend(this._titleElement, dom.$('.dropdown'));
        this.dropdown = this.instantiationService.createInstance(SwitchQuickDiffViewItem, new SwitchQuickDiffBaseAction((event) => this.switchQuickDiff(event)), this.model.quickDiffs.map(quickDiffer => quickDiffer.label), this.model.changes[this._index].label);
        this.dropdown.render(this.dropdownContainer);
        this.updateActions();
    }
    _getActionBarOptions() {
        const actionRunner = new DiffActionRunner();
        // close widget on successful action
        actionRunner.onDidRun(e => {
            if (!(e.action instanceof UIEditorAction) && !e.error) {
                this.dispose();
            }
        });
        return {
            ...super._getActionBarOptions(),
            actionRunner
        };
    }
    _fillBody(container) {
        const options = {
            scrollBeyondLastLine: true,
            scrollbar: {
                verticalScrollbarSize: 14,
                horizontal: 'auto',
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false
            },
            overviewRulerLanes: 2,
            fixedOverflowWidgets: true,
            minimap: { enabled: false },
            renderSideBySide: false,
            readOnly: false,
            renderIndicators: false,
            diffAlgorithm: 'advanced',
            ignoreTrimWhitespace: false,
            stickyScroll: { enabled: false }
        };
        this.diffEditor = this.instantiationService.createInstance(EmbeddedDiffEditorWidget, container, options, {}, this.editor);
        this._disposables.add(this.diffEditor);
    }
    _onWidth(width) {
        if (typeof this.height === 'undefined') {
            return;
        }
        this.diffEditor.layout({ height: this.height, width });
    }
    _doLayoutBody(height, width) {
        super._doLayoutBody(height, width);
        this.diffEditor.layout({ height, width });
        if (typeof this.height === 'undefined' && this.change) {
            this.revealChange(this.change);
        }
        this.height = height;
    }
    revealChange(change) {
        let start, end;
        if (change.modifiedEndLineNumber === 0) { // deletion
            start = change.modifiedStartLineNumber;
            end = change.modifiedStartLineNumber + 1;
        }
        else if (change.originalEndLineNumber > 0) { // modification
            start = change.modifiedStartLineNumber - 1;
            end = change.modifiedEndLineNumber + 1;
        }
        else { // insertion
            start = change.modifiedStartLineNumber;
            end = change.modifiedEndLineNumber;
        }
        this.diffEditor.revealLinesInCenter(start, end, 1 /* ScrollType.Immediate */);
    }
    _applyTheme(theme) {
        const borderColor = theme.getColor(peekViewBorder) || Color.transparent;
        this.style({
            arrowColor: borderColor,
            frameColor: borderColor,
            headerBackgroundColor: theme.getColor(peekViewTitleBackground) || Color.transparent,
            primaryHeadingColor: theme.getColor(peekViewTitleForeground),
            secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
        });
    }
    revealRange(range) {
        this.editor.revealLineInCenterIfOutsideViewport(range.endLineNumber, 0 /* ScrollType.Smooth */);
    }
    hasFocus() {
        return this.diffEditor.hasTextFocus();
    }
    dispose() {
        super.dispose();
        this.menu?.dispose();
    }
};
DirtyDiffWidget = __decorate([
    __param(2, IThemeService),
    __param(3, IInstantiationService),
    __param(4, IMenuService),
    __param(5, IContextKeyService),
    __metadata("design:paramtypes", [Object, DirtyDiffModel, Object, Object, Object, Object])
], DirtyDiffWidget);
export class ShowPreviousChangeAction extends EditorAction {
    constructor(outerEditor) {
        super({
            id: 'editor.action.dirtydiff.previous',
            label: nls.localize('show previous change', "Show Previous Change"),
            alias: 'Show Previous Change',
            precondition: TextCompareEditorActiveContext.toNegated(),
            kbOpts: { kbExpr: EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
        });
        this.outerEditor = outerEditor;
    }
    run(accessor) {
        const outerEditor = this.outerEditor ?? getOuterEditorFromDiffEditor(accessor);
        if (!outerEditor) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller) {
            return;
        }
        if (!controller.canNavigate()) {
            return;
        }
        controller.previous();
    }
}
registerEditorAction(ShowPreviousChangeAction);
export class ShowNextChangeAction extends EditorAction {
    constructor(outerEditor) {
        super({
            id: 'editor.action.dirtydiff.next',
            label: nls.localize('show next change', "Show Next Change"),
            alias: 'Show Next Change',
            precondition: TextCompareEditorActiveContext.toNegated(),
            kbOpts: { kbExpr: EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
        });
        this.outerEditor = outerEditor;
    }
    run(accessor) {
        const outerEditor = this.outerEditor ?? getOuterEditorFromDiffEditor(accessor);
        if (!outerEditor) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller) {
            return;
        }
        if (!controller.canNavigate()) {
            return;
        }
        controller.next();
    }
}
registerEditorAction(ShowNextChangeAction);
// Go to menu
MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
    group: '7_change_nav',
    command: {
        id: 'editor.action.dirtydiff.next',
        title: nls.localize({ key: 'miGotoNextChange', comment: ['&& denotes a mnemonic'] }, "Next &&Change")
    },
    order: 1
});
MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
    group: '7_change_nav',
    command: {
        id: 'editor.action.dirtydiff.previous',
        title: nls.localize({ key: 'miGotoPreviousChange', comment: ['&& denotes a mnemonic'] }, "Previous &&Change")
    },
    order: 2
});
export class GotoPreviousChangeAction extends EditorAction {
    constructor() {
        super({
            id: 'workbench.action.editor.previousChange',
            label: nls.localize('move to previous change', "Go to Previous Change"),
            alias: 'Go to Previous Change',
            precondition: TextCompareEditorActiveContext.toNegated(),
            kbOpts: { kbExpr: EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
        });
    }
    async run(accessor) {
        const outerEditor = getOuterEditorFromDiffEditor(accessor);
        const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
        const accessibilityService = accessor.get(IAccessibilityService);
        const codeEditorService = accessor.get(ICodeEditorService);
        if (!outerEditor || !outerEditor.hasModel()) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller || !controller.modelRegistry) {
            return;
        }
        const lineNumber = outerEditor.getPosition().lineNumber;
        const model = controller.modelRegistry.getModel(outerEditor.getModel(), outerEditor);
        if (!model || model.changes.length === 0) {
            return;
        }
        const index = model.findPreviousClosestChange(lineNumber, false);
        const change = model.changes[index];
        await playAccessibilitySymbolForChange(change.change, accessibilitySignalService);
        setPositionAndSelection(change.change, outerEditor, accessibilityService, codeEditorService);
    }
}
registerEditorAction(GotoPreviousChangeAction);
export class GotoNextChangeAction extends EditorAction {
    constructor() {
        super({
            id: 'workbench.action.editor.nextChange',
            label: nls.localize('move to next change', "Go to Next Change"),
            alias: 'Go to Next Change',
            precondition: TextCompareEditorActiveContext.toNegated(),
            kbOpts: { kbExpr: EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
        });
    }
    async run(accessor) {
        const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
        const outerEditor = getOuterEditorFromDiffEditor(accessor);
        const accessibilityService = accessor.get(IAccessibilityService);
        const codeEditorService = accessor.get(ICodeEditorService);
        if (!outerEditor || !outerEditor.hasModel()) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller || !controller.modelRegistry) {
            return;
        }
        const lineNumber = outerEditor.getPosition().lineNumber;
        const model = controller.modelRegistry.getModel(outerEditor.getModel(), outerEditor);
        if (!model || model.changes.length === 0) {
            return;
        }
        const index = model.findNextClosestChange(lineNumber, false);
        const change = model.changes[index].change;
        await playAccessibilitySymbolForChange(change, accessibilitySignalService);
        setPositionAndSelection(change, outerEditor, accessibilityService, codeEditorService);
    }
}
function setPositionAndSelection(change, editor, accessibilityService, codeEditorService) {
    const position = new Position(change.modifiedStartLineNumber, 1);
    editor.setPosition(position);
    editor.revealPositionInCenter(position);
    if (accessibilityService.isScreenReaderOptimized()) {
        editor.setSelection({ startLineNumber: change.modifiedStartLineNumber, startColumn: 0, endLineNumber: change.modifiedStartLineNumber, endColumn: Number.MAX_VALUE });
        codeEditorService.getActiveCodeEditor()?.writeScreenReaderContent('diff-navigation');
    }
}
async function playAccessibilitySymbolForChange(change, accessibilitySignalService) {
    const changeType = getChangeType(change);
    switch (changeType) {
        case ChangeType.Add:
            accessibilitySignalService.playSignal(AccessibilitySignal.diffLineInserted, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
            break;
        case ChangeType.Delete:
            accessibilitySignalService.playSignal(AccessibilitySignal.diffLineDeleted, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
            break;
        case ChangeType.Modify:
            accessibilitySignalService.playSignal(AccessibilitySignal.diffLineModified, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
            break;
    }
}
registerEditorAction(GotoNextChangeAction);
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'closeDirtyDiff',
    weight: 100 /* KeybindingWeight.EditorContrib */ + 50,
    primary: 9 /* KeyCode.Escape */,
    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
    when: ContextKeyExpr.and(isDirtyDiffVisible),
    handler: (accessor) => {
        const outerEditor = getOuterEditorFromDiffEditor(accessor);
        if (!outerEditor) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller) {
            return;
        }
        controller.close();
    }
});
let DirtyDiffController = class DirtyDiffController extends Disposable {
    static { DirtyDiffController_1 = this; }
    static { this.ID = 'editor.contrib.dirtydiff'; }
    static get(editor) {
        return editor.getContribution(DirtyDiffController_1.ID);
    }
    constructor(editor, contextKeyService, configurationService, instantiationService) {
        super();
        this.editor = editor;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.modelRegistry = null;
        this.model = null;
        this.widget = null;
        this.session = Disposable.None;
        this.mouseDownInfo = null;
        this.enabled = false;
        this.gutterActionDisposables = new DisposableStore();
        this.enabled = !contextKeyService.getContextKeyValue('isInDiffEditor');
        this.stylesheet = dom.createStyleSheet(undefined, undefined, this._store);
        if (this.enabled) {
            this.isDirtyDiffVisible = isDirtyDiffVisible.bindTo(contextKeyService);
            this._register(editor.onDidChangeModel(() => this.close()));
            const onDidChangeGutterAction = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterAction'));
            this._register(onDidChangeGutterAction(this.onDidChangeGutterAction, this));
            this.onDidChangeGutterAction();
        }
    }
    onDidChangeGutterAction() {
        const gutterAction = this.configurationService.getValue('scm.diffDecorationsGutterAction');
        this.gutterActionDisposables.clear();
        if (gutterAction === 'diff') {
            this.gutterActionDisposables.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
            this.gutterActionDisposables.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
            this.stylesheet.textContent = `
				.monaco-editor .dirty-diff-glyph {
					cursor: pointer;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-glyph:hover::before {
					height: 100%;
					width: 6px;
					left: -6px;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-deleted:hover::after {
					bottom: 0;
					border-top-width: 0;
					border-bottom-width: 0;
				}
			`;
        }
        else {
            this.stylesheet.textContent = ``;
        }
    }
    canNavigate() {
        return !this.widget || (this.widget?.index === -1) || (!!this.model && this.model.changes.length > 1);
    }
    refresh() {
        this.widget?.showChange(this.widget.index, false);
    }
    next(lineNumber) {
        if (!this.assertWidget()) {
            return;
        }
        if (!this.widget || !this.model) {
            return;
        }
        let index;
        if (this.editor.hasModel() && (typeof lineNumber === 'number' || !this.widget.provider)) {
            index = this.model.findNextClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber, true, this.widget.provider);
        }
        else {
            const providerChanges = this.model.mapChanges.get(this.widget.provider) ?? this.model.mapChanges.values().next().value;
            const mapIndex = providerChanges.findIndex(value => value === this.widget.index);
            index = providerChanges[rot(mapIndex + 1, providerChanges.length)];
        }
        this.widget.showChange(index);
    }
    previous(lineNumber) {
        if (!this.assertWidget()) {
            return;
        }
        if (!this.widget || !this.model) {
            return;
        }
        let index;
        if (this.editor.hasModel() && (typeof lineNumber === 'number')) {
            index = this.model.findPreviousClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber, true, this.widget.provider);
        }
        else {
            const providerChanges = this.model.mapChanges.get(this.widget.provider) ?? this.model.mapChanges.values().next().value;
            const mapIndex = providerChanges.findIndex(value => value === this.widget.index);
            index = providerChanges[rot(mapIndex - 1, providerChanges.length)];
        }
        this.widget.showChange(index);
    }
    close() {
        this.session.dispose();
        this.session = Disposable.None;
    }
    assertWidget() {
        if (!this.enabled) {
            return false;
        }
        if (this.widget) {
            if (!this.model || this.model.changes.length === 0) {
                this.close();
                return false;
            }
            return true;
        }
        if (!this.modelRegistry) {
            return false;
        }
        const editorModel = this.editor.getModel();
        if (!editorModel) {
            return false;
        }
        const model = this.modelRegistry.getModel(editorModel, this.editor);
        if (!model) {
            return false;
        }
        if (model.changes.length === 0) {
            return false;
        }
        this.model = model;
        this.widget = this.instantiationService.createInstance(DirtyDiffWidget, this.editor, model);
        this.isDirtyDiffVisible.set(true);
        const disposables = new DisposableStore();
        disposables.add(Event.once(this.widget.onDidClose)(this.close, this));
        const onDidModelChange = Event.chain(model.onDidChange, $ => $.filter(e => e.diff.length > 0)
            .map(e => e.diff));
        onDidModelChange(this.onDidModelChange, this, disposables);
        disposables.add(this.widget);
        disposables.add(toDisposable(() => {
            this.model = null;
            this.widget = null;
            this.isDirtyDiffVisible.set(false);
            this.editor.focus();
        }));
        this.session = disposables;
        return true;
    }
    onDidModelChange(splices) {
        if (!this.model || !this.widget || this.widget.hasFocus()) {
            return;
        }
        for (const splice of splices) {
            if (splice.start <= this.widget.index) {
                this.next();
                return;
            }
        }
        this.refresh();
    }
    onEditorMouseDown(e) {
        this.mouseDownInfo = null;
        const range = e.target.range;
        if (!range) {
            return;
        }
        if (!e.event.leftButton) {
            return;
        }
        if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
            return;
        }
        if (!e.target.element) {
            return;
        }
        if (e.target.element.className.indexOf('dirty-diff-glyph') < 0) {
            return;
        }
        const data = e.target.detail;
        const offsetLeftInGutter = e.target.element.offsetLeft;
        const gutterOffsetX = data.offsetX - offsetLeftInGutter;
        // TODO@joao TODO@alex TODO@martin this is such that we don't collide with folding
        if (gutterOffsetX < -3 || gutterOffsetX > 3) { // dirty diff decoration on hover is 6px wide
            return;
        }
        this.mouseDownInfo = { lineNumber: range.startLineNumber };
    }
    onEditorMouseUp(e) {
        if (!this.mouseDownInfo) {
            return;
        }
        const { lineNumber } = this.mouseDownInfo;
        this.mouseDownInfo = null;
        const range = e.target.range;
        if (!range || range.startLineNumber !== lineNumber) {
            return;
        }
        if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
            return;
        }
        if (!this.modelRegistry) {
            return;
        }
        const editorModel = this.editor.getModel();
        if (!editorModel) {
            return;
        }
        const model = this.modelRegistry.getModel(editorModel, this.editor);
        if (!model) {
            return;
        }
        const index = model.changes.findIndex(change => lineIntersectsChange(lineNumber, change.change));
        if (index < 0) {
            return;
        }
        if (index === this.widget?.index) {
            this.close();
        }
        else {
            this.next(lineNumber);
        }
    }
    getChanges() {
        if (!this.modelRegistry) {
            return [];
        }
        if (!this.editor.hasModel()) {
            return [];
        }
        const model = this.modelRegistry.getModel(this.editor.getModel(), this.editor);
        if (!model) {
            return [];
        }
        return model.changes.map(change => change.change);
    }
    dispose() {
        this.gutterActionDisposables.dispose();
        super.dispose();
    }
};
DirtyDiffController = DirtyDiffController_1 = __decorate([
    __param(1, IContextKeyService),
    __param(2, IConfigurationService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], DirtyDiffController);
export { DirtyDiffController };
const editorGutterModifiedBackground = registerColor('editorGutter.modifiedBackground', {
    dark: '#1B81A8',
    light: '#2090D3',
    hcDark: '#1B81A8',
    hcLight: '#2090D3'
}, nls.localize('editorGutterModifiedBackground', "Editor gutter background color for lines that are modified."));
const editorGutterAddedBackground = registerColor('editorGutter.addedBackground', {
    dark: '#487E02',
    light: '#48985D',
    hcDark: '#487E02',
    hcLight: '#48985D'
}, nls.localize('editorGutterAddedBackground', "Editor gutter background color for lines that are added."));
const editorGutterDeletedBackground = registerColor('editorGutter.deletedBackground', editorErrorForeground, nls.localize('editorGutterDeletedBackground', "Editor gutter background color for lines that are deleted."));
const minimapGutterModifiedBackground = registerColor('minimapGutter.modifiedBackground', editorGutterModifiedBackground, nls.localize('minimapGutterModifiedBackground', "Minimap gutter background color for lines that are modified."));
const minimapGutterAddedBackground = registerColor('minimapGutter.addedBackground', editorGutterAddedBackground, nls.localize('minimapGutterAddedBackground', "Minimap gutter background color for lines that are added."));
const minimapGutterDeletedBackground = registerColor('minimapGutter.deletedBackground', editorGutterDeletedBackground, nls.localize('minimapGutterDeletedBackground', "Minimap gutter background color for lines that are deleted."));
const overviewRulerModifiedForeground = registerColor('editorOverviewRuler.modifiedForeground', transparent(editorGutterModifiedBackground, 0.6), nls.localize('overviewRulerModifiedForeground', 'Overview ruler marker color for modified content.'));
const overviewRulerAddedForeground = registerColor('editorOverviewRuler.addedForeground', transparent(editorGutterAddedBackground, 0.6), nls.localize('overviewRulerAddedForeground', 'Overview ruler marker color for added content.'));
const overviewRulerDeletedForeground = registerColor('editorOverviewRuler.deletedForeground', transparent(editorGutterDeletedBackground, 0.6), nls.localize('overviewRulerDeletedForeground', 'Overview ruler marker color for deleted content.'));
let DirtyDiffDecorator = DirtyDiffDecorator_1 = class DirtyDiffDecorator extends Disposable {
    static createDecoration(className, tooltip, options) {
        const decorationOptions = {
            description: 'dirty-diff-decoration',
            isWholeLine: options.isWholeLine,
        };
        if (options.gutter) {
            decorationOptions.linesDecorationsClassName = `dirty-diff-glyph ${className}`;
            decorationOptions.linesDecorationsTooltip = tooltip;
        }
        if (options.overview.active) {
            decorationOptions.overviewRuler = {
                color: themeColorFromId(options.overview.color),
                position: OverviewRulerLane.Left
            };
        }
        if (options.minimap.active) {
            decorationOptions.minimap = {
                color: themeColorFromId(options.minimap.color),
                position: 2 /* MinimapPosition.Gutter */
            };
        }
        return ModelDecorationOptions.createDynamic(decorationOptions);
    }
    constructor(editorModel, codeEditor, model, configurationService) {
        super();
        this.codeEditor = codeEditor;
        this.model = model;
        this.configurationService = configurationService;
        this.editorModel = editorModel;
        const decorations = configurationService.getValue('scm.diffDecorations');
        const gutter = decorations === 'all' || decorations === 'gutter';
        const overview = decorations === 'all' || decorations === 'overview';
        const minimap = decorations === 'all' || decorations === 'minimap';
        const diffAdded = nls.localize('diffAdded', 'Added lines');
        this.addedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-added', diffAdded, {
            gutter,
            overview: { active: overview, color: overviewRulerAddedForeground },
            minimap: { active: minimap, color: minimapGutterAddedBackground },
            isWholeLine: true
        });
        this.addedPatternOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-added-pattern', diffAdded, {
            gutter,
            overview: { active: overview, color: overviewRulerAddedForeground },
            minimap: { active: minimap, color: minimapGutterAddedBackground },
            isWholeLine: true
        });
        const diffModified = nls.localize('diffModified', 'Changed lines');
        this.modifiedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-modified', diffModified, {
            gutter,
            overview: { active: overview, color: overviewRulerModifiedForeground },
            minimap: { active: minimap, color: minimapGutterModifiedBackground },
            isWholeLine: true
        });
        this.modifiedPatternOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-modified-pattern', diffModified, {
            gutter,
            overview: { active: overview, color: overviewRulerModifiedForeground },
            minimap: { active: minimap, color: minimapGutterModifiedBackground },
            isWholeLine: true
        });
        this.deletedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-deleted', nls.localize('diffDeleted', 'Removed lines'), {
            gutter,
            overview: { active: overview, color: overviewRulerDeletedForeground },
            minimap: { active: minimap, color: minimapGutterDeletedBackground },
            isWholeLine: false
        });
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('scm.diffDecorationsGutterPattern')) {
                this.onDidChange();
            }
        }));
        this._register(model.onDidChange(this.onDidChange, this));
    }
    onDidChange() {
        if (!this.editorModel) {
            return;
        }
        const pattern = this.configurationService.getValue('scm.diffDecorationsGutterPattern');
        const decorations = this.model.changes.map((labeledChange) => {
            const change = labeledChange.change;
            const changeType = getChangeType(change);
            const startLineNumber = change.modifiedStartLineNumber;
            const endLineNumber = change.modifiedEndLineNumber || startLineNumber;
            switch (changeType) {
                case ChangeType.Add:
                    return {
                        range: {
                            startLineNumber: startLineNumber, startColumn: 1,
                            endLineNumber: endLineNumber, endColumn: 1
                        },
                        options: pattern.added ? this.addedPatternOptions : this.addedOptions
                    };
                case ChangeType.Delete:
                    return {
                        range: {
                            startLineNumber: startLineNumber, startColumn: Number.MAX_VALUE,
                            endLineNumber: startLineNumber, endColumn: Number.MAX_VALUE
                        },
                        options: this.deletedOptions
                    };
                case ChangeType.Modify:
                    return {
                        range: {
                            startLineNumber: startLineNumber, startColumn: 1,
                            endLineNumber: endLineNumber, endColumn: 1
                        },
                        options: pattern.modified ? this.modifiedPatternOptions : this.modifiedOptions
                    };
            }
        });
        if (!this.decorationsCollection) {
            this.decorationsCollection = this.codeEditor.createDecorationsCollection(decorations);
        }
        else {
            this.decorationsCollection.set(decorations);
        }
    }
    dispose() {
        super.dispose();
        if (this.decorationsCollection) {
            this.decorationsCollection?.clear();
        }
        this.editorModel = null;
        this.decorationsCollection = undefined;
    }
};
DirtyDiffDecorator = DirtyDiffDecorator_1 = __decorate([
    __param(3, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, DirtyDiffModel, Object])
], DirtyDiffDecorator);
function compareChanges(a, b) {
    let result = a.modifiedStartLineNumber - b.modifiedStartLineNumber;
    if (result !== 0) {
        return result;
    }
    result = a.modifiedEndLineNumber - b.modifiedEndLineNumber;
    if (result !== 0) {
        return result;
    }
    result = a.originalStartLineNumber - b.originalStartLineNumber;
    if (result !== 0) {
        return result;
    }
    return a.originalEndLineNumber - b.originalEndLineNumber;
}
export async function getOriginalResource(quickDiffService, uri, language, isSynchronized) {
    const quickDiffs = await quickDiffService.getQuickDiffs(uri, language, isSynchronized);
    return quickDiffs.length > 0 ? quickDiffs[0].originalResource : null;
}
let DirtyDiffModel = class DirtyDiffModel extends Disposable {
    get original() { return this._originalTextModels; }
    get changes() { return this._changes; }
    get mapChanges() { return this._mapChanges; }
    constructor(textFileModel, scmService, quickDiffService, editorWorkerService, configurationService, textModelResolverService, progressService) {
        super();
        this.scmService = scmService;
        this.quickDiffService = quickDiffService;
        this.editorWorkerService = editorWorkerService;
        this.configurationService = configurationService;
        this.textModelResolverService = textModelResolverService;
        this.progressService = progressService;
        this._quickDiffs = [];
        this._originalModels = new Map(); // key is uri.toString()
        this._originalTextModels = [];
        this.diffDelayer = new ThrottledDelayer(200);
        this.repositoryDisposables = new Set();
        this.originalModelDisposables = this._register(new DisposableStore());
        this._disposed = false;
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._changes = [];
        this._mapChanges = new Map(); // key is the quick diff name, value is the index of the change in this._changes
        this._model = textFileModel;
        this._register(textFileModel.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
        this._register(Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsIgnoreTrimWhitespace') || e.affectsConfiguration('diffEditor.ignoreTrimWhitespace'))(this.triggerDiff, this));
        this._register(scmService.onDidAddRepository(this.onDidAddRepository, this));
        for (const r of scmService.repositories) {
            this.onDidAddRepository(r);
        }
        this._register(this._model.onDidChangeEncoding(() => {
            this.diffDelayer.cancel();
            this._quickDiffs = [];
            this._originalModels.clear();
            this._originalTextModels = [];
            this._quickDiffsPromise = undefined;
            this.setChanges([], new Map());
            this.triggerDiff();
        }));
        this._register(this.quickDiffService.onDidChangeQuickDiffProviders(() => this.triggerDiff()));
        this.triggerDiff();
    }
    get quickDiffs() {
        return this._quickDiffs;
    }
    getDiffEditorModel(originalUri) {
        if (!this._originalModels.has(originalUri)) {
            return;
        }
        const original = this._originalModels.get(originalUri);
        return {
            modified: this._model.textEditorModel,
            original: original.textEditorModel
        };
    }
    onDidAddRepository(repository) {
        const disposables = new DisposableStore();
        this.repositoryDisposables.add(disposables);
        disposables.add(toDisposable(() => this.repositoryDisposables.delete(disposables)));
        disposables.add(repository.provider.onDidChangeResources(this.triggerDiff, this));
        const onDidRemoveThis = Event.filter(this.scmService.onDidRemoveRepository, r => r === repository);
        disposables.add(onDidRemoveThis(() => dispose(disposables), null));
        this.triggerDiff();
    }
    triggerDiff() {
        if (!this.diffDelayer) {
            return Promise.resolve();
        }
        return this.diffDelayer
            .trigger(() => this.diff())
            .then((result) => {
            const originalModels = Array.from(this._originalModels.values());
            if (!result || this._disposed || this._model.isDisposed() || originalModels.some(originalModel => originalModel.isDisposed())) {
                return; // disposed
            }
            if (originalModels.every(originalModel => originalModel.textEditorModel.getValueLength() === 0)) {
                result.changes = [];
            }
            if (!result.changes) {
                result.changes = [];
            }
            this.setChanges(result.changes, result.mapChanges);
        }, (err) => onUnexpectedError(err));
    }
    setChanges(changes, mapChanges) {
        const diff = sortedDiff(this._changes, changes, (a, b) => compareChanges(a.change, b.change));
        this._changes = changes;
        this._mapChanges = mapChanges;
        this._onDidChange.fire({ changes, diff });
    }
    diff() {
        return this.progressService.withProgress({ location: 3 /* ProgressLocation.Scm */, delay: 250 }, async () => {
            const originalURIs = await this.getQuickDiffsPromise();
            if (this._disposed || this._model.isDisposed() || (originalURIs.length === 0)) {
                return Promise.resolve({ changes: [], mapChanges: new Map() }); // disposed
            }
            const filteredToDiffable = originalURIs.filter(quickDiff => this.editorWorkerService.canComputeDirtyDiff(quickDiff.originalResource, this._model.resource));
            if (filteredToDiffable.length === 0) {
                return Promise.resolve({ changes: [], mapChanges: new Map() }); // All files are too large
            }
            const ignoreTrimWhitespaceSetting = this.configurationService.getValue('scm.diffDecorationsIgnoreTrimWhitespace');
            const ignoreTrimWhitespace = ignoreTrimWhitespaceSetting === 'inherit'
                ? this.configurationService.getValue('diffEditor.ignoreTrimWhitespace')
                : ignoreTrimWhitespaceSetting !== 'false';
            const allDiffs = [];
            for (const quickDiff of filteredToDiffable) {
                const dirtyDiff = await this.editorWorkerService.computeDirtyDiff(quickDiff.originalResource, this._model.resource, ignoreTrimWhitespace);
                if (dirtyDiff) {
                    for (const diff of dirtyDiff) {
                        if (diff) {
                            allDiffs.push({ change: diff, label: quickDiff.label, uri: quickDiff.originalResource });
                        }
                    }
                }
            }
            const sorted = allDiffs.sort((a, b) => compareChanges(a.change, b.change));
            const map = new Map();
            for (let i = 0; i < sorted.length; i++) {
                const label = sorted[i].label;
                if (!map.has(label)) {
                    map.set(label, []);
                }
                map.get(label).push(i);
            }
            return { changes: sorted, mapChanges: map };
        });
    }
    getQuickDiffsPromise() {
        if (this._quickDiffsPromise) {
            return this._quickDiffsPromise;
        }
        this._quickDiffsPromise = this.getOriginalResource().then(async (quickDiffs) => {
            if (this._disposed) { // disposed
                return [];
            }
            if (quickDiffs.length === 0) {
                this._quickDiffs = [];
                this._originalModels.clear();
                this._originalTextModels = [];
                return [];
            }
            if (equals(this._quickDiffs, quickDiffs, (a, b) => a.originalResource.toString() === b.originalResource.toString() && a.label === b.label)) {
                return quickDiffs;
            }
            this.originalModelDisposables.clear();
            this._originalModels.clear();
            this._originalTextModels = [];
            this._quickDiffs = quickDiffs;
            return (await Promise.all(quickDiffs.map(async (quickDiff) => {
                try {
                    const ref = await this.textModelResolverService.createModelReference(quickDiff.originalResource);
                    if (this._disposed) { // disposed
                        ref.dispose();
                        return [];
                    }
                    this._originalModels.set(quickDiff.originalResource.toString(), ref.object);
                    this._originalTextModels.push(ref.object.textEditorModel);
                    if (isTextFileEditorModel(ref.object)) {
                        const encoding = this._model.getEncoding();
                        if (encoding) {
                            ref.object.setEncoding(encoding, 1 /* EncodingMode.Decode */);
                        }
                    }
                    this.originalModelDisposables.add(ref);
                    this.originalModelDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
                    return quickDiff;
                }
                catch (error) {
                    return []; // possibly invalid reference
                }
            }))).flat();
        });
        return this._quickDiffsPromise.finally(() => {
            this._quickDiffsPromise = undefined;
        });
    }
    async getOriginalResource() {
        if (this._disposed) {
            return Promise.resolve([]);
        }
        const uri = this._model.resource;
        return this.quickDiffService.getQuickDiffs(uri, this._model.getLanguageId(), this._model.textEditorModel ? shouldSynchronizeModel(this._model.textEditorModel) : undefined);
    }
    findNextClosestChange(lineNumber, inclusive = true, provider) {
        let preferredProvider;
        if (!provider && inclusive) {
            preferredProvider = this.quickDiffs.find(value => value.isSCM)?.label;
        }
        const possibleChanges = [];
        for (let i = 0; i < this.changes.length; i++) {
            if (provider && this.changes[i].label !== provider) {
                continue;
            }
            const change = this.changes[i];
            const possibleChangesLength = possibleChanges.length;
            if (inclusive) {
                if (getModifiedEndLineNumber(change.change) >= lineNumber) {
                    if (preferredProvider && change.label !== preferredProvider) {
                        possibleChanges.push(i);
                    }
                    else {
                        return i;
                    }
                }
            }
            else {
                if (change.change.modifiedStartLineNumber > lineNumber) {
                    return i;
                }
            }
            if ((possibleChanges.length > 0) && (possibleChanges.length === possibleChangesLength)) {
                return possibleChanges[0];
            }
        }
        return possibleChanges.length > 0 ? possibleChanges[0] : 0;
    }
    findPreviousClosestChange(lineNumber, inclusive = true, provider) {
        for (let i = this.changes.length - 1; i >= 0; i--) {
            if (provider && this.changes[i].label !== provider) {
                continue;
            }
            const change = this.changes[i].change;
            if (inclusive) {
                if (change.modifiedStartLineNumber <= lineNumber) {
                    return i;
                }
            }
            else {
                if (getModifiedEndLineNumber(change) < lineNumber) {
                    return i;
                }
            }
        }
        return this.changes.length - 1;
    }
    dispose() {
        super.dispose();
        this._disposed = true;
        this._quickDiffs = [];
        this._originalModels.clear();
        this._originalTextModels = [];
        this.diffDelayer.cancel();
        this.repositoryDisposables.forEach(d => dispose(d));
        this.repositoryDisposables.clear();
    }
};
DirtyDiffModel = __decorate([
    __param(1, ISCMService),
    __param(2, IQuickDiffService),
    __param(3, IEditorWorkerService),
    __param(4, IConfigurationService),
    __param(5, ITextModelService),
    __param(6, IProgressService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], DirtyDiffModel);
export { DirtyDiffModel };
class DirtyDiffItem {
    constructor(model, decorator) {
        this.model = model;
        this.decorator = decorator;
    }
    dispose() {
        this.decorator.dispose();
        this.model.dispose();
    }
}
let DirtyDiffWorkbenchController = class DirtyDiffWorkbenchController extends Disposable {
    constructor(editorService, instantiationService, configurationService, textFileService) {
        super();
        this.editorService = editorService;
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this.textFileService = textFileService;
        this.enabled = false;
        this.viewState = { width: 3, visibility: 'always' };
        this.items = new ResourceMap(); // resource -> editor id -> DirtyDiffItem
        this.transientDisposables = this._register(new DisposableStore());
        this.stylesheet = dom.createStyleSheet(undefined, undefined, this._store);
        const onDidChangeConfiguration = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorations'));
        this._register(onDidChangeConfiguration(this.onDidChangeConfiguration, this));
        this.onDidChangeConfiguration();
        const onDidChangeDiffWidthConfiguration = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterWidth'));
        this._register(onDidChangeDiffWidthConfiguration(this.onDidChangeDiffWidthConfiguration, this));
        this.onDidChangeDiffWidthConfiguration();
        const onDidChangeDiffVisibilityConfiguration = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterVisibility'));
        this._register(onDidChangeDiffVisibilityConfiguration(this.onDidChangeDiffVisibilityConfiguration, this));
        this.onDidChangeDiffVisibilityConfiguration();
    }
    onDidChangeConfiguration() {
        const enabled = this.configurationService.getValue('scm.diffDecorations') !== 'none';
        if (enabled) {
            this.enable();
        }
        else {
            this.disable();
        }
    }
    onDidChangeDiffWidthConfiguration() {
        let width = this.configurationService.getValue('scm.diffDecorationsGutterWidth');
        if (isNaN(width) || width <= 0 || width > 5) {
            width = 3;
        }
        this.setViewState({ ...this.viewState, width });
    }
    onDidChangeDiffVisibilityConfiguration() {
        const visibility = this.configurationService.getValue('scm.diffDecorationsGutterVisibility');
        this.setViewState({ ...this.viewState, visibility });
    }
    setViewState(state) {
        this.viewState = state;
        this.stylesheet.textContent = `
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-modified {
				border-left-width:${state.width}px;
			}
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-added-pattern:before,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-modified-pattern:before {
				background-size: ${state.width}px ${state.width}px;
			}
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-modified,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-deleted {
				opacity: ${state.visibility === 'always' ? 1 : 0};
			}
		`;
    }
    enable() {
        if (this.enabled) {
            this.disable();
        }
        this.transientDisposables.add(Event.any(this.editorService.onDidCloseEditor, this.editorService.onDidVisibleEditorsChange)(() => this.onEditorsChanged()));
        this.onEditorsChanged();
        this.enabled = true;
    }
    disable() {
        if (!this.enabled) {
            return;
        }
        this.transientDisposables.clear();
        for (const [, dirtyDiff] of this.items) {
            dispose(dirtyDiff.values());
        }
        this.items.clear();
        this.enabled = false;
    }
    onEditorsChanged() {
        for (const editor of this.editorService.visibleTextEditorControls) {
            if (isCodeEditor(editor)) {
                const textModel = editor.getModel();
                const controller = DirtyDiffController.get(editor);
                if (controller) {
                    controller.modelRegistry = this;
                }
                if (textModel && (!this.items.has(textModel.uri) || !this.items.get(textModel.uri).has(editor.getId()))) {
                    const textFileModel = this.textFileService.files.get(textModel.uri);
                    if (textFileModel?.isResolved()) {
                        const dirtyDiffModel = this.instantiationService.createInstance(DirtyDiffModel, textFileModel);
                        const decorator = new DirtyDiffDecorator(textFileModel.textEditorModel, editor, dirtyDiffModel, this.configurationService);
                        if (!this.items.has(textModel.uri)) {
                            this.items.set(textModel.uri, new Map());
                        }
                        this.items.get(textModel.uri)?.set(editor.getId(), new DirtyDiffItem(dirtyDiffModel, decorator));
                    }
                }
            }
        }
        for (const [uri, item] of this.items) {
            for (const editorId of item.keys()) {
                if (!this.editorService.visibleTextEditorControls.find(editor => isCodeEditor(editor) && editor.getModel()?.uri.toString() === uri.toString() && editor.getId() === editorId)) {
                    if (item.has(editorId)) {
                        const dirtyDiffItem = item.get(editorId);
                        dirtyDiffItem?.dispose();
                        item.delete(editorId);
                        if (item.size === 0) {
                            this.items.delete(uri);
                        }
                    }
                }
            }
        }
    }
    getModel(editorModel, codeEditor) {
        return this.items.get(editorModel.uri)?.get(codeEditor.getId())?.model;
    }
    dispose() {
        this.disable();
        super.dispose();
    }
};
DirtyDiffWorkbenchController = __decorate([
    __param(0, IEditorService),
    __param(1, IInstantiationService),
    __param(2, IConfigurationService),
    __param(3, ITextFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], DirtyDiffWorkbenchController);
export { DirtyDiffWorkbenchController };
registerEditorContribution(DirtyDiffController.ID, DirtyDiffController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
