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
import * as dom from '../../../../base/browser/dom.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { renderIcon } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { Action } from '../../../../base/common/actions.js';
import { mapFindFirst } from '../../../../base/common/arraysFind.js';
import { assert, assertNever } from '../../../../base/common/assert.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { KeyChord } from '../../../../base/common/keyCodes.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { autorun, derived, observableFromEvent } from '../../../../base/common/observable.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { isUriComponents, URI } from '../../../../base/common/uri.js';
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Range } from '../../../../editor/common/core/range.js';
import { InjectedTextCursorStops } from '../../../../editor/common/model.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { observableConfigValue } from '../../../../platform/observable/common/platformObservableUtils.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import * as coverUtils from './codeCoverageDisplayUtils.js';
import { testingCoverageMissingBranch, testingCoverageReport, testingFilterIcon, testingRerunIcon } from './icons.js';
import { ManagedTestCoverageBars } from './testCoverageBars.js';
import { getTestingConfiguration } from '../common/configuration.js';
import { FileCoverage } from '../common/testCoverage.js';
import { ITestCoverageService } from '../common/testCoverageService.js';
import { TestId } from '../common/testId.js';
import { ITestService } from '../common/testService.js';
import { TestingContextKeys } from '../common/testingContextKeys.js';
const CLASS_HIT = 'coverage-deco-hit';
const CLASS_MISS = 'coverage-deco-miss';
const TOGGLE_INLINE_COMMAND_TEXT = localize('testing.toggleInlineCoverage', 'Toggle Inline');
const TOGGLE_INLINE_COMMAND_ID = 'testing.toggleInlineCoverage';
const BRANCH_MISS_INDICATOR_CHARS = 4;
let CodeCoverageDecorations = class CodeCoverageDecorations extends Disposable {
    constructor(editor, instantiationService, coverage, configurationService, log) {
        super();
        this.editor = editor;
        this.coverage = coverage;
        this.log = log;
        this.displayedStore = this._register(new DisposableStore());
        this.hoveredStore = this._register(new DisposableStore());
        this.decorationIds = new Map();
        this.summaryWidget = new Lazy(() => this._register(instantiationService.createInstance(CoverageToolbarWidget, this.editor)));
        const modelObs = observableFromEvent(this, editor.onDidChangeModel, () => editor.getModel());
        const configObs = observableFromEvent(this, editor.onDidChangeConfiguration, i => i);
        const fileCoverage = derived(reader => {
            const report = coverage.selected.read(reader);
            if (!report) {
                return;
            }
            const model = modelObs.read(reader);
            if (!model) {
                return;
            }
            const file = report.getUri(model.uri);
            if (!file) {
                return;
            }
            report.didAddCoverage.read(reader);
            return { file, testId: coverage.filterToTest.read(reader) };
        });
        this._register(autorun(reader => {
            const c = fileCoverage.read(reader);
            if (c) {
                this.apply(editor.getModel(), c.file, c.testId, coverage.showInline.read(reader));
            }
            else {
                this.clear();
            }
        }));
        const toolbarEnabled = observableConfigValue("testing.coverageToolbarEnabled", true, configurationService);
        this._register(autorun(reader => {
            const c = fileCoverage.read(reader);
            if (c && toolbarEnabled.read(reader)) {
                this.summaryWidget.value.setCoverage(c.file, c.testId);
            }
            else {
                this.summaryWidget.rawValue?.clearCoverage();
            }
        }));
        this._register(autorun(reader => {
            const c = fileCoverage.read(reader);
            if (c) {
                const evt = configObs.read(reader);
                if (evt?.hasChanged(69) !== false) {
                    this.updateEditorStyles();
                }
            }
        }));
        this._register(editor.onMouseMove(e => {
            const model = editor.getModel();
            if (e.target.type === 3 && model) {
                this.hoverLineNumber(editor.getModel());
            }
            else if (coverage.showInline.get() && e.target.type === 6 && model) {
                this.hoverInlineDecoration(model, e.target.position);
            }
            else {
                this.hoveredStore.clear();
            }
        }));
        this._register(editor.onWillChangeModel(() => {
            const model = editor.getModel();
            if (!this.details || !model) {
                return;
            }
            for (const decoration of model.getAllDecorations()) {
                const own = this.decorationIds.get(decoration.id);
                if (own) {
                    own.detail.range = decoration.range;
                }
            }
        }));
    }
    updateEditorStyles() {
        const lineHeight = this.editor.getOption(69);
        const { style } = this.editor.getContainerDomNode();
        style.setProperty('--vscode-testing-coverage-lineHeight', `${lineHeight}px`);
    }
    hoverInlineDecoration(model, position) {
        const allDecorations = model.getDecorationsInRange(Range.fromPositions(position));
        const decoration = mapFindFirst(allDecorations, ({ id }) => this.decorationIds.has(id) ? { id, deco: this.decorationIds.get(id) } : undefined);
        if (decoration === this.hoveredSubject) {
            return;
        }
        this.hoveredStore.clear();
        this.hoveredSubject = decoration;
        if (!decoration) {
            return;
        }
        model.changeDecorations(e => {
            e.changeDecorationOptions(decoration.id, {
                ...decoration.deco.options,
                className: `${decoration.deco.options.className} coverage-deco-hovered`,
            });
        });
        this.hoveredStore.add(toDisposable(() => {
            this.hoveredSubject = undefined;
            model.changeDecorations(e => {
                e.changeDecorationOptions(decoration.id, decoration.deco.options);
            });
        }));
    }
    hoverLineNumber(model) {
        if (this.hoveredSubject === 'lineNo' || !this.details || this.coverage.showInline.get()) {
            return;
        }
        this.hoveredStore.clear();
        this.hoveredSubject = 'lineNo';
        model.changeDecorations(e => {
            for (const [id, decoration] of this.decorationIds) {
                const { applyHoverOptions, options } = decoration;
                const dup = { ...options };
                applyHoverOptions(dup);
                e.changeDecorationOptions(id, dup);
            }
        });
        this.hoveredStore.add(this.editor.onMouseLeave(() => {
            this.hoveredStore.clear();
        }));
        this.hoveredStore.add(toDisposable(() => {
            this.hoveredSubject = undefined;
            model.changeDecorations(e => {
                for (const [id, decoration] of this.decorationIds) {
                    e.changeDecorationOptions(id, decoration.options);
                }
            });
        }));
    }
    async apply(model, coverage, testId, showInlineByDefault) {
        const details = this.details = await this.loadDetails(coverage, testId, model);
        if (!details) {
            return this.clear();
        }
        this.displayedStore.clear();
        model.changeDecorations(e => {
            for (const detailRange of details.ranges) {
                const { metadata: { detail, description }, range, primary } = detailRange;
                if (detail.type === 2) {
                    const hits = detail.detail.branches[detail.branch].count;
                    const cls = hits ? CLASS_HIT : CLASS_MISS;
                    const showMissIndicator = !hits && range.isEmpty() && detail.detail.branches.some(b => b.count);
                    const options = {
                        showIfCollapsed: showMissIndicator,
                        description: 'coverage-gutter',
                        lineNumberClassName: `coverage-deco-gutter ${cls}`,
                    };
                    const applyHoverOptions = (target) => {
                        target.hoverMessage = description;
                        if (showMissIndicator) {
                            target.after = {
                                content: '\xa0'.repeat(BRANCH_MISS_INDICATOR_CHARS),
                                inlineClassName: `coverage-deco-branch-miss-indicator ${ThemeIcon.asClassName(testingCoverageMissingBranch)}`,
                                inlineClassNameAffectsLetterSpacing: true,
                                cursorStops: InjectedTextCursorStops.None,
                            };
                        }
                        else {
                            target.className = `coverage-deco-inline ${cls}`;
                            if (primary && typeof hits === 'number') {
                                target.before = countBadge(hits);
                            }
                        }
                    };
                    if (showInlineByDefault) {
                        applyHoverOptions(options);
                    }
                    this.decorationIds.set(e.addDecoration(range, options), { options, applyHoverOptions, detail: detailRange });
                }
                else if (detail.type === 1) {
                    const cls = detail.count ? CLASS_HIT : CLASS_MISS;
                    const options = {
                        showIfCollapsed: false,
                        description: 'coverage-inline',
                        lineNumberClassName: `coverage-deco-gutter ${cls}`,
                    };
                    const applyHoverOptions = (target) => {
                        target.className = `coverage-deco-inline ${cls}`;
                        target.hoverMessage = description;
                        if (primary && typeof detail.count === 'number') {
                            target.before = countBadge(detail.count);
                        }
                    };
                    if (showInlineByDefault) {
                        applyHoverOptions(options);
                    }
                    this.decorationIds.set(e.addDecoration(range, options), { options, applyHoverOptions, detail: detailRange });
                }
            }
        });
        this.displayedStore.add(toDisposable(() => {
            model.changeDecorations(e => {
                for (const decoration of this.decorationIds.keys()) {
                    e.removeDecoration(decoration);
                }
                this.decorationIds.clear();
            });
        }));
    }
    clear() {
        this.loadingCancellation?.cancel();
        this.loadingCancellation = undefined;
        this.displayedStore.clear();
        this.hoveredStore.clear();
    }
    async loadDetails(coverage, testId, textModel) {
        const cts = this.loadingCancellation = new CancellationTokenSource();
        this.displayedStore.add(this.loadingCancellation);
        try {
            const details = testId
                ? await coverage.detailsForTest(testId, this.loadingCancellation.token)
                : await coverage.details(this.loadingCancellation.token);
            if (cts.token.isCancellationRequested) {
                return;
            }
            return new CoverageDetailsModel(details, textModel);
        }
        catch (e) {
            this.log.error('Error loading coverage details', e);
        }
        return undefined;
    }
};
CodeCoverageDecorations = __decorate([
    __param(1, IInstantiationService),
    __param(2, ITestCoverageService),
    __param(3, IConfigurationService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], CodeCoverageDecorations);
export { CodeCoverageDecorations };
const countBadge = (count) => {
    if (count === 0) {
        return undefined;
    }
    return {
        content: `${count > 99 ? '99+' : count}x`,
        cursorStops: InjectedTextCursorStops.None,
        inlineClassName: `coverage-deco-inline-count`,
        inlineClassNameAffectsLetterSpacing: true,
    };
};
export class CoverageDetailsModel {
    constructor(details, textModel) {
        this.details = details;
        this.ranges = [];
        const detailRanges = details.map(detail => ({
            range: tidyLocation(detail.location),
            primary: true,
            metadata: { detail, description: this.describe(detail, textModel) }
        }));
        for (const { range, metadata: { detail } } of detailRanges) {
            if (detail.type === 1 && detail.branches) {
                for (let i = 0; i < detail.branches.length; i++) {
                    const branch = { type: 2, branch: i, detail };
                    detailRanges.push({
                        range: tidyLocation(detail.branches[i].location || Range.fromPositions(range.getEndPosition())),
                        primary: true,
                        metadata: {
                            detail: branch,
                            description: this.describe(branch, textModel),
                        },
                    });
                }
            }
        }
        detailRanges.sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range) || a.metadata.detail.type - b.metadata.detail.type);
        const stack = [];
        const result = this.ranges = [];
        const pop = () => {
            const next = stack.pop();
            const prev = stack[stack.length - 1];
            if (prev) {
                prev.range = prev.range.setStartPosition(next.range.endLineNumber, next.range.endColumn);
            }
            result.push(next);
        };
        for (const item of detailRanges) {
            const start = item.range.getStartPosition();
            while (stack[stack.length - 1]?.range.containsPosition(start) === false) {
                pop();
            }
            if (item.range.isEmpty()) {
                result.push(item);
                continue;
            }
            const prev = stack[stack.length - 1];
            if (prev) {
                const primary = prev.primary;
                const si = prev.range.setEndPosition(start.lineNumber, start.column);
                prev.range = prev.range.setStartPosition(item.range.endLineNumber, item.range.endColumn);
                prev.primary = false;
                if (prev.range.isEmpty()) {
                    stack.pop();
                }
                result.push({ range: si, primary, metadata: prev.metadata });
            }
            stack.push(item);
        }
        while (stack.length) {
            pop();
        }
    }
    describe(detail, model) {
        if (detail.type === 0) {
            return namedDetailLabel(detail.name, detail);
        }
        else if (detail.type === 1) {
            const text = wrapName(model.getValueInRange(tidyLocation(detail.location)).trim() || `<empty statement>`);
            if (detail.branches?.length) {
                const covered = detail.branches.filter(b => !!b.count).length;
                return new MarkdownString().appendMarkdown(localize('coverage.branches', '{0} of {1} of branches in {2} were covered.', covered, detail.branches.length, text));
            }
            else {
                return namedDetailLabel(text, detail);
            }
        }
        else if (detail.type === 2) {
            const text = wrapName(model.getValueInRange(tidyLocation(detail.detail.location)).trim() || `<empty statement>`);
            const { count, label } = detail.detail.branches[detail.branch];
            const label2 = label ? wrapInBackticks(label) : `#${detail.branch + 1}`;
            if (!count) {
                return new MarkdownString().appendMarkdown(localize('coverage.branchNotCovered', 'Branch {0} in {1} was not covered.', label2, text));
            }
            else if (count === true) {
                return new MarkdownString().appendMarkdown(localize('coverage.branchCoveredYes', 'Branch {0} in {1} was executed.', label2, text));
            }
            else {
                return new MarkdownString().appendMarkdown(localize('coverage.branchCovered', 'Branch {0} in {1} was executed {2} time(s).', label2, text, count));
            }
        }
        assertNever(detail);
    }
}
function namedDetailLabel(name, detail) {
    return new MarkdownString().appendMarkdown(!detail.count
        ? localize('coverage.declExecutedNo', '`{0}` was not executed.', name)
        : typeof detail.count === 'number'
            ? localize('coverage.declExecutedCount', '`{0}` was executed {1} time(s).', name, detail.count)
            : localize('coverage.declExecutedYes', '`{0}` was executed.', name));
}
function tidyLocation(location) {
    if (location instanceof Position) {
        return Range.fromPositions(location, new Position(location.lineNumber, 0x7FFFFFFF));
    }
    return location;
}
function wrapInBackticks(str) {
    return '`' + str.replace(/[\n\r`]/g, '') + '`';
}
function wrapName(functionNameOrCode) {
    if (functionNameOrCode.length > 50) {
        functionNameOrCode = functionNameOrCode.slice(0, 40) + '...';
    }
    return wrapInBackticks(functionNameOrCode);
}
let CoverageToolbarWidget = class CoverageToolbarWidget extends Disposable {
    constructor(editor, configurationService, contextMenuService, testService, keybindingService, commandService, coverage, instaService) {
        super();
        this.editor = editor;
        this.configurationService = configurationService;
        this.contextMenuService = contextMenuService;
        this.testService = testService;
        this.keybindingService = keybindingService;
        this.commandService = commandService;
        this.coverage = coverage;
        this.registered = false;
        this.isRunning = false;
        this.showStore = this._register(new DisposableStore());
        this._domNode = dom.h('div.coverage-summary-widget', [
            dom.h('div', [
                dom.h('span.bars@bars'),
                dom.h('span.toolbar@toolbar'),
            ]),
        ]);
        this.bars = this._register(instaService.createInstance(ManagedTestCoverageBars, {
            compact: false,
            overall: false,
            container: this._domNode.bars,
        }));
        this.actionBar = this._register(instaService.createInstance(ActionBar, this._domNode.toolbar, {
            orientation: 0,
            actionViewItemProvider: (action, options) => {
                const vm = new CodiconActionViewItem(undefined, action, options);
                if (action instanceof ActionWithIcon) {
                    vm.themeIcon = action.icon;
                }
                return vm;
            }
        }));
        this._register(autorun(reader => {
            coverage.showInline.read(reader);
            this.setActions();
        }));
        this._register(dom.addStandardDisposableListener(this._domNode.root, dom.EventType.CONTEXT_MENU, e => {
            this.contextMenuService.showContextMenu({
                menuId: MenuId.StickyScrollContext,
                getAnchor: () => e,
            });
        }));
    }
    getId() {
        return 'coverage-summary-widget';
    }
    getDomNode() {
        return this._domNode.root;
    }
    getPosition() {
        return {
            preference: 2,
            stackOridinal: 9,
        };
    }
    clearCoverage() {
        this.current = undefined;
        this.bars.setCoverageInfo(undefined);
        this.hide();
    }
    setCoverage(coverage, testId) {
        this.current = { coverage, testId };
        this.bars.setCoverageInfo(coverage);
        if (!coverage) {
            this.hide();
        }
        else {
            this.setActions();
            this.show();
        }
    }
    setActions() {
        this.actionBar.clear();
        const current = this.current;
        if (!current) {
            return;
        }
        const toggleAction = new ActionWithIcon('toggleInline', this.coverage.showInline.get()
            ? localize('testing.hideInlineCoverage', 'Hide Inline Coverage')
            : localize('testing.showInlineCoverage', 'Show Inline Coverage'), testingCoverageReport, undefined, () => this.coverage.showInline.set(!this.coverage.showInline.get(), undefined));
        const kb = this.keybindingService.lookupKeybinding(TOGGLE_INLINE_COMMAND_ID);
        if (kb) {
            toggleAction.tooltip = `${TOGGLE_INLINE_COMMAND_TEXT} (${kb.getLabel()})`;
        }
        this.actionBar.push(toggleAction);
        if (current.testId) {
            const testItem = current.coverage.fromResult.getTestById(current.testId.toString());
            assert(!!testItem, 'got coverage for an unreported test');
            this.actionBar.push(new ActionWithIcon('perTestFilter', coverUtils.labels.showingFilterFor(testItem.label), testingFilterIcon, undefined, () => this.commandService.executeCommand("testing.coverageFilterToTestInEditor", this.current, this.editor)));
        }
        else if (current.coverage.perTestData?.size) {
            this.actionBar.push(new ActionWithIcon('perTestFilter', localize('testing.coverageForTestAvailable', "{0} test(s) ran code in this file", current.coverage.perTestData.size), testingFilterIcon, undefined, () => this.commandService.executeCommand("testing.coverageFilterToTestInEditor", this.current, this.editor)));
        }
        this.actionBar.push(new ActionWithIcon('rerun', localize('testing.rerun', 'Rerun'), testingRerunIcon, !this.isRunning, () => this.rerunTest()));
    }
    show() {
        if (this.registered) {
            return;
        }
        this.registered = true;
        let viewZoneId;
        const ds = this.showStore;
        this.editor.addOverlayWidget(this);
        this.editor.changeViewZones(accessor => {
            viewZoneId = accessor.addZone({
                afterLineNumber: 0,
                afterColumn: 0,
                domNode: document.createElement('div'),
                heightInPx: 30,
                ordinal: -1,
            });
        });
        ds.add(toDisposable(() => {
            this.registered = false;
            this.editor.removeOverlayWidget(this);
            this.editor.changeViewZones(accessor => {
                accessor.removeZone(viewZoneId);
            });
        }));
        ds.add(this.configurationService.onDidChangeConfiguration(e => {
            if (this.current && (e.affectsConfiguration("testing.coverageBarThresholds") || e.affectsConfiguration("testing.displayedCoveragePercent"))) {
                this.setCoverage(this.current.coverage, this.current.testId);
            }
        }));
    }
    rerunTest() {
        const current = this.current;
        if (current) {
            this.isRunning = true;
            this.setActions();
            this.testService.runResolvedTests(current.coverage.fromResult.request).finally(() => {
                this.isRunning = false;
                this.setActions();
            });
        }
    }
    hide() {
        this.showStore.clear();
    }
};
CoverageToolbarWidget = __decorate([
    __param(1, IConfigurationService),
    __param(2, IContextMenuService),
    __param(3, ITestService),
    __param(4, IKeybindingService),
    __param(5, ICommandService),
    __param(6, ITestCoverageService),
    __param(7, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], CoverageToolbarWidget);
registerAction2(class ToggleInlineCoverage extends Action2 {
    constructor() {
        super({
            id: TOGGLE_INLINE_COMMAND_ID,
            title: localize2('coverage.toggleInline', "Toggle Inline Coverage"),
            category: Categories.Test,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 1024 | 39),
            },
            toggled: {
                condition: TestingContextKeys.inlineCoverageEnabled,
                title: localize('coverage.hideInline', "Hide Inline Coverage"),
            },
            icon: testingCoverageReport,
            menu: [
                { id: MenuId.CommandPalette, when: TestingContextKeys.isTestCoverageOpen },
                { id: MenuId.EditorTitle, when: ContextKeyExpr.and(TestingContextKeys.isTestCoverageOpen, TestingContextKeys.coverageToolbarEnabled.notEqualsTo(true)), group: 'navigation' },
            ]
        });
    }
    run(accessor) {
        const coverage = accessor.get(ITestCoverageService);
        coverage.showInline.set(!coverage.showInline.get(), undefined);
    }
});
registerAction2(class ToggleCoverageToolbar extends Action2 {
    constructor() {
        super({
            id: "testing.coverageToggleToolbar",
            title: localize2('testing.toggleToolbarTitle', "Test Coverage Toolbar"),
            metadata: {
                description: localize2('testing.toggleToolbarDesc', 'Toggle the sticky coverage bar in the editor.')
            },
            category: Categories.Test,
            toggled: {
                condition: TestingContextKeys.coverageToolbarEnabled,
            },
            menu: [
                { id: MenuId.CommandPalette, when: TestingContextKeys.isTestCoverageOpen },
                { id: MenuId.StickyScrollContext, when: TestingContextKeys.isTestCoverageOpen },
                { id: MenuId.EditorTitle, when: TestingContextKeys.isTestCoverageOpen, group: 'coverage@1' },
            ]
        });
    }
    run(accessor) {
        const config = accessor.get(IConfigurationService);
        const value = getTestingConfiguration(config, "testing.coverageToolbarEnabled");
        config.updateValue("testing.coverageToolbarEnabled", !value);
    }
});
registerAction2(class FilterCoverageToTestInEditor extends Action2 {
    constructor() {
        super({
            id: "testing.coverageFilterToTestInEditor",
            title: localize2('testing.filterActionLabel', "Filter Coverage to Test"),
            category: Categories.Test,
            icon: Codicon.filter,
            toggled: {
                icon: Codicon.filterFilled,
                condition: TestingContextKeys.isCoverageFilteredToTest,
            },
            menu: [
                { id: MenuId.EditorTitle, when: ContextKeyExpr.and(TestingContextKeys.isTestCoverageOpen, TestingContextKeys.coverageToolbarEnabled.notEqualsTo(true)), group: 'navigation' },
            ]
        });
    }
    run(accessor, coverageOrUri, editor) {
        const testCoverageService = accessor.get(ITestCoverageService);
        const quickInputService = accessor.get(IQuickInputService);
        const activeEditor = isCodeEditor(editor) ? editor : accessor.get(ICodeEditorService).getActiveCodeEditor();
        let coverage;
        if (coverageOrUri instanceof FileCoverage) {
            coverage = coverageOrUri;
        }
        else if (isUriComponents(coverageOrUri)) {
            coverage = testCoverageService.selected.get()?.getUri(URI.from(coverageOrUri));
        }
        else {
            const uri = activeEditor?.getModel()?.uri;
            coverage = uri && testCoverageService.selected.get()?.getUri(uri);
        }
        if (!coverage || !coverage.perTestData?.size) {
            return;
        }
        const tests = [...coverage.perTestData].map(TestId.fromString);
        const commonPrefix = TestId.getLengthOfCommonPrefix(tests.length, i => tests[i]);
        const result = coverage.fromResult;
        const previousSelection = testCoverageService.filterToTest.get();
        const items = [
            { label: coverUtils.labels.allTests, testId: undefined },
            { type: 'separator' },
            ...tests.map(id => ({ label: coverUtils.getLabelForItem(result, id, commonPrefix), testId: id })),
        ];
        const scrollTop = activeEditor?.getScrollTop() || 0;
        const revealScrollCts = new MutableDisposable();
        quickInputService.pick(items, {
            activeItem: items.find((item) => 'item' in item && item.item === coverage),
            placeHolder: coverUtils.labels.pickShowCoverage,
            onDidFocus: (entry) => {
                if (!entry.testId) {
                    revealScrollCts.clear();
                    activeEditor?.setScrollTop(scrollTop);
                    testCoverageService.filterToTest.set(undefined, undefined);
                }
                else {
                    const cts = revealScrollCts.value = new CancellationTokenSource();
                    coverage.detailsForTest(entry.testId, cts.token).then(details => {
                        const first = details.find(d => d.type === 1);
                        if (!cts.token.isCancellationRequested && first) {
                            activeEditor?.revealLineNearTop(first.location instanceof Position ? first.location.lineNumber : first.location.startLineNumber);
                        }
                    }, () => { });
                    testCoverageService.filterToTest.set(entry.testId, undefined);
                }
            },
        }).then(selected => {
            if (!selected) {
                activeEditor?.setScrollTop(scrollTop);
            }
            revealScrollCts.dispose();
            testCoverageService.filterToTest.set(selected ? selected.testId : previousSelection, undefined);
        });
    }
});
class ActionWithIcon extends Action {
    constructor(id, title, icon, enabled, run) {
        super(id, title, undefined, enabled, run);
        this.icon = icon;
    }
}
class CodiconActionViewItem extends ActionViewItem {
    updateLabel() {
        if (this.options.label && this.label && this.themeIcon) {
            dom.reset(this.label, renderIcon(this.themeIcon), this.action.label);
        }
    }
}
