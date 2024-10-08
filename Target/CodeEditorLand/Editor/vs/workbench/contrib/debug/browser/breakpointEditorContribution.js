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
import { isSafari } from '../../../../base/browser/browser.js';
import { BrowserFeatures } from '../../../../base/browser/canIUse.js';
import * as dom from '../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { Action, Separator, SubmenuAction } from '../../../../base/common/actions.js';
import { distinct } from '../../../../base/common/arrays.js';
import { RunOnceScheduler, timeout } from '../../../../base/common/async.js';
import { memoize } from '../../../../base/common/decorators.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { dispose, disposeIfDisposable } from '../../../../base/common/lifecycle.js';
import * as env from '../../../../base/common/platform.js';
import severity from '../../../../base/common/severity.js';
import { noBreakWhitespace } from '../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { GlyphMarginLane, OverviewRulerLane } from '../../../../editor/common/model.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { registerColor } from '../../../../platform/theme/common/colorRegistry.js';
import { registerThemingParticipant, themeColorFromId } from '../../../../platform/theme/common/themeService.js';
import { GutterActionsRegistry } from '../../codeEditor/browser/editorLineNumberMenu.js';
import { getBreakpointMessageAndIcon } from './breakpointsView.js';
import { BreakpointWidget } from './breakpointWidget.js';
import * as icons from './debugIcons.js';
import { BREAKPOINT_EDITOR_CONTRIBUTION_ID, CONTEXT_BREAKPOINT_WIDGET_VISIBLE, DebuggerString, IDebugService } from '../common/debug.js';
const $ = dom.$;
const breakpointHelperDecoration = {
    description: 'breakpoint-helper-decoration',
    glyphMarginClassName: ThemeIcon.asClassName(icons.debugBreakpointHint),
    glyphMargin: { position: GlyphMarginLane.Right },
    glyphMarginHoverMessage: new MarkdownString().appendText(nls.localize('breakpointHelper', "Click to add a breakpoint")),
    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
};
export function createBreakpointDecorations(accessor, model, breakpoints, state, breakpointsActivated, showBreakpointsInOverviewRuler) {
    const result = [];
    breakpoints.forEach((breakpoint) => {
        if (breakpoint.lineNumber > model.getLineCount()) {
            return;
        }
        const hasOtherBreakpointsOnLine = breakpoints.some(bp => bp !== breakpoint && bp.lineNumber === breakpoint.lineNumber);
        const column = model.getLineFirstNonWhitespaceColumn(breakpoint.lineNumber);
        const range = model.validateRange(breakpoint.column ? new Range(breakpoint.lineNumber, breakpoint.column, breakpoint.lineNumber, breakpoint.column + 1)
            : new Range(breakpoint.lineNumber, column, breakpoint.lineNumber, column + 1) // Decoration has to have a width #20688
        );
        result.push({
            options: getBreakpointDecorationOptions(accessor, model, breakpoint, state, breakpointsActivated, showBreakpointsInOverviewRuler, hasOtherBreakpointsOnLine),
            range
        });
    });
    return result;
}
function getBreakpointDecorationOptions(accessor, model, breakpoint, state, breakpointsActivated, showBreakpointsInOverviewRuler, hasOtherBreakpointsOnLine) {
    const debugService = accessor.get(IDebugService);
    const languageService = accessor.get(ILanguageService);
    const labelService = accessor.get(ILabelService);
    const { icon, message, showAdapterUnverifiedMessage } = getBreakpointMessageAndIcon(state, breakpointsActivated, breakpoint, labelService, debugService.getModel());
    let glyphMarginHoverMessage;
    let unverifiedMessage;
    if (showAdapterUnverifiedMessage) {
        let langId;
        unverifiedMessage = debugService.getModel().getSessions().map(s => {
            const dbg = debugService.getAdapterManager().getDebugger(s.configuration.type);
            const message = dbg?.strings?.[DebuggerString.UnverifiedBreakpoints];
            if (message) {
                if (!langId) {
                    // Lazily compute this, only if needed for some debug adapter
                    langId = languageService.guessLanguageIdByFilepathOrFirstLine(breakpoint.uri) ?? undefined;
                }
                return langId && dbg.interestedInLanguage(langId) ? message : undefined;
            }
            return undefined;
        })
            .find(messages => !!messages);
    }
    if (message) {
        glyphMarginHoverMessage = new MarkdownString(undefined, { isTrusted: true, supportThemeIcons: true });
        if (breakpoint.condition || breakpoint.hitCondition) {
            const languageId = model.getLanguageId();
            glyphMarginHoverMessage.appendCodeblock(languageId, message);
            if (unverifiedMessage) {
                glyphMarginHoverMessage.appendMarkdown('$(warning) ' + unverifiedMessage);
            }
        }
        else {
            glyphMarginHoverMessage.appendText(message);
            if (unverifiedMessage) {
                glyphMarginHoverMessage.appendMarkdown('\n\n$(warning) ' + unverifiedMessage);
            }
        }
    }
    else if (unverifiedMessage) {
        glyphMarginHoverMessage = new MarkdownString(undefined, { isTrusted: true, supportThemeIcons: true }).appendMarkdown(unverifiedMessage);
    }
    let overviewRulerDecoration = null;
    if (showBreakpointsInOverviewRuler) {
        overviewRulerDecoration = {
            color: themeColorFromId(debugIconBreakpointForeground),
            position: OverviewRulerLane.Left
        };
    }
    const renderInline = breakpoint.column && (hasOtherBreakpointsOnLine || breakpoint.column > model.getLineFirstNonWhitespaceColumn(breakpoint.lineNumber));
    return {
        description: 'breakpoint-decoration',
        glyphMargin: { position: GlyphMarginLane.Right },
        glyphMarginClassName: ThemeIcon.asClassName(icon),
        glyphMarginHoverMessage,
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        before: renderInline ? {
            content: noBreakWhitespace,
            inlineClassName: `debug-breakpoint-placeholder`,
            inlineClassNameAffectsLetterSpacing: true
        } : undefined,
        overviewRuler: overviewRulerDecoration,
        zIndex: 9999
    };
}
async function requestBreakpointCandidateLocations(model, lineNumbers, session) {
    if (!session.capabilities.supportsBreakpointLocationsRequest) {
        return [];
    }
    return await Promise.all(distinct(lineNumbers, l => l).map(async (lineNumber) => {
        try {
            return { lineNumber, positions: await session.breakpointsLocations(model.uri, lineNumber) };
        }
        catch {
            return { lineNumber, positions: [] };
        }
    }));
}
function createCandidateDecorations(model, breakpointDecorations, lineBreakpoints) {
    const result = [];
    for (const { positions, lineNumber } of lineBreakpoints) {
        if (positions.length === 0) {
            continue;
        }
        // Do not render candidates if there is only one, since it is already covered by the line breakpoint
        const firstColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
        const lastColumn = model.getLineLastNonWhitespaceColumn(lineNumber);
        positions.forEach(p => {
            const range = new Range(p.lineNumber, p.column, p.lineNumber, p.column + 1);
            if ((p.column <= firstColumn && !breakpointDecorations.some(bp => bp.range.startColumn > firstColumn && bp.range.startLineNumber === p.lineNumber)) || p.column > lastColumn) {
                // Do not render candidates on the start of the line if there's no other breakpoint on the line.
                return;
            }
            const breakpointAtPosition = breakpointDecorations.find(bpd => bpd.range.equalsRange(range));
            if (breakpointAtPosition && breakpointAtPosition.inlineWidget) {
                // Space already occupied, do not render candidate.
                return;
            }
            result.push({
                range,
                options: {
                    description: 'breakpoint-placeholder-decoration',
                    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                    before: breakpointAtPosition ? undefined : {
                        content: noBreakWhitespace,
                        inlineClassName: `debug-breakpoint-placeholder`,
                        inlineClassNameAffectsLetterSpacing: true
                    },
                },
                breakpoint: breakpointAtPosition ? breakpointAtPosition.breakpoint : undefined
            });
        });
    }
    return result;
}
let BreakpointEditorContribution = class BreakpointEditorContribution {
    constructor(editor, debugService, contextMenuService, instantiationService, contextKeyService, dialogService, configurationService, labelService) {
        this.editor = editor;
        this.debugService = debugService;
        this.contextMenuService = contextMenuService;
        this.instantiationService = instantiationService;
        this.dialogService = dialogService;
        this.configurationService = configurationService;
        this.labelService = labelService;
        this.breakpointHintDecoration = null;
        this.toDispose = [];
        this.ignoreDecorationsChangedEvent = false;
        this.ignoreBreakpointsChangeEvent = false;
        this.breakpointDecorations = [];
        this.candidateDecorations = [];
        this.breakpointWidgetVisible = CONTEXT_BREAKPOINT_WIDGET_VISIBLE.bindTo(contextKeyService);
        this.setDecorationsScheduler = new RunOnceScheduler(() => this.setDecorations(), 30);
        this.setDecorationsScheduler.schedule();
        this.registerListeners();
    }
    /**
     * Returns context menu actions at the line number if breakpoints can be
     * set. This is used by the {@link TestingDecorations} to allow breakpoint
     * setting on lines where breakpoint "run" actions are present.
     */
    getContextMenuActionsAtPosition(lineNumber, model) {
        if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
            return [];
        }
        if (!this.debugService.canSetBreakpointsIn(model)) {
            return [];
        }
        const breakpoints = this.debugService.getModel().getBreakpoints({ lineNumber, uri: model.uri });
        return this.getContextMenuActions(breakpoints, model.uri, lineNumber);
    }
    registerListeners() {
        this.toDispose.push(this.editor.onMouseDown(async (e) => {
            if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
                return;
            }
            const model = this.editor.getModel();
            if (!e.target.position
                || !model
                || e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */
                || e.target.detail.isAfterLines
                || !this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)
                    // don't return early if there's a breakpoint
                    && !e.target.element?.className.includes('breakpoint')) {
                return;
            }
            const canSetBreakpoints = this.debugService.canSetBreakpointsIn(model);
            const lineNumber = e.target.position.lineNumber;
            const uri = model.uri;
            if (e.event.rightButton || (env.isMacintosh && e.event.leftButton && e.event.ctrlKey)) {
                // handled by editor gutter context menu
                return;
            }
            else {
                const breakpoints = this.debugService.getModel().getBreakpoints({ uri, lineNumber });
                if (breakpoints.length) {
                    const isShiftPressed = e.event.shiftKey;
                    const enabled = breakpoints.some(bp => bp.enabled);
                    if (isShiftPressed) {
                        breakpoints.forEach(bp => this.debugService.enableOrDisableBreakpoints(!enabled, bp));
                    }
                    else if (!env.isLinux && breakpoints.some(bp => !!bp.condition || !!bp.logMessage || !!bp.hitCondition || !!bp.triggeredBy)) {
                        // Show the dialog if there is a potential condition to be accidently lost.
                        // Do not show dialog on linux due to electron issue freezing the mouse #50026
                        const logPoint = breakpoints.every(bp => !!bp.logMessage);
                        const breakpointType = logPoint ? nls.localize('logPoint', "Logpoint") : nls.localize('breakpoint', "Breakpoint");
                        const disabledBreakpointDialogMessage = nls.localize('breakpointHasConditionDisabled', "This {0} has a {1} that will get lost on remove. Consider enabling the {0} instead.", breakpointType.toLowerCase(), logPoint ? nls.localize('message', "message") : nls.localize('condition', "condition"));
                        const enabledBreakpointDialogMessage = nls.localize('breakpointHasConditionEnabled', "This {0} has a {1} that will get lost on remove. Consider disabling the {0} instead.", breakpointType.toLowerCase(), logPoint ? nls.localize('message', "message") : nls.localize('condition', "condition"));
                        await this.dialogService.prompt({
                            type: severity.Info,
                            message: enabled ? enabledBreakpointDialogMessage : disabledBreakpointDialogMessage,
                            buttons: [
                                {
                                    label: nls.localize({ key: 'removeLogPoint', comment: ['&& denotes a mnemonic'] }, "&&Remove {0}", breakpointType),
                                    run: () => breakpoints.forEach(bp => this.debugService.removeBreakpoints(bp.getId()))
                                },
                                {
                                    label: nls.localize('disableLogPoint', "{0} {1}", enabled ? nls.localize({ key: 'disable', comment: ['&& denotes a mnemonic'] }, "&&Disable") : nls.localize({ key: 'enable', comment: ['&& denotes a mnemonic'] }, "&&Enable"), breakpointType),
                                    run: () => breakpoints.forEach(bp => this.debugService.enableOrDisableBreakpoints(!enabled, bp))
                                }
                            ],
                            cancelButton: true
                        });
                    }
                    else {
                        if (!enabled) {
                            breakpoints.forEach(bp => this.debugService.enableOrDisableBreakpoints(!enabled, bp));
                        }
                        else {
                            breakpoints.forEach(bp => this.debugService.removeBreakpoints(bp.getId()));
                        }
                    }
                }
                else if (canSetBreakpoints) {
                    if (e.event.middleButton) {
                        const action = this.configurationService.getValue('debug').gutterMiddleClickAction;
                        if (action !== 'none') {
                            let context;
                            switch (action) {
                                case 'logpoint':
                                    context = 2 /* BreakpointWidgetContext.LOG_MESSAGE */;
                                    break;
                                case 'conditionalBreakpoint':
                                    context = 0 /* BreakpointWidgetContext.CONDITION */;
                                    break;
                                case 'triggeredBreakpoint':
                                    context = 3 /* BreakpointWidgetContext.TRIGGER_POINT */;
                            }
                            this.showBreakpointWidget(lineNumber, undefined, context);
                        }
                    }
                    else {
                        this.debugService.addBreakpoints(uri, [{ lineNumber }]);
                    }
                }
            }
        }));
        if (!(BrowserFeatures.pointerEvents && isSafari)) {
            /**
             * We disable the hover feature for Safari on iOS as
             * 1. Browser hover events are handled specially by the system (it treats first click as hover if there is `:hover` css registered). Below hover behavior will confuse users with inconsistent expeirence.
             * 2. When users click on line numbers, the breakpoint hint displays immediately, however it doesn't create the breakpoint unless users click on the left gutter. On a touch screen, it's hard to click on that small area.
             */
            this.toDispose.push(this.editor.onMouseMove((e) => {
                if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
                    return;
                }
                let showBreakpointHintAtLineNumber = -1;
                const model = this.editor.getModel();
                if (model && e.target.position && (e.target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ || e.target.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */) && this.debugService.canSetBreakpointsIn(model) &&
                    this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)) {
                    const data = e.target.detail;
                    if (!data.isAfterLines) {
                        showBreakpointHintAtLineNumber = e.target.position.lineNumber;
                    }
                }
                this.ensureBreakpointHintDecoration(showBreakpointHintAtLineNumber);
            }));
            this.toDispose.push(this.editor.onMouseLeave(() => {
                this.ensureBreakpointHintDecoration(-1);
            }));
        }
        this.toDispose.push(this.editor.onDidChangeModel(async () => {
            this.closeBreakpointWidget();
            await this.setDecorations();
        }));
        this.toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(() => {
            if (!this.ignoreBreakpointsChangeEvent && !this.setDecorationsScheduler.isScheduled()) {
                this.setDecorationsScheduler.schedule();
            }
        }));
        this.toDispose.push(this.debugService.onDidChangeState(() => {
            // We need to update breakpoint decorations when state changes since the top stack frame and breakpoint decoration might change
            if (!this.setDecorationsScheduler.isScheduled()) {
                this.setDecorationsScheduler.schedule();
            }
        }));
        this.toDispose.push(this.editor.onDidChangeModelDecorations(() => this.onModelDecorationsChanged()));
        this.toDispose.push(this.configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('debug.showBreakpointsInOverviewRuler') || e.affectsConfiguration('debug.showInlineBreakpointCandidates')) {
                await this.setDecorations();
            }
        }));
    }
    getContextMenuActions(breakpoints, uri, lineNumber, column) {
        const actions = [];
        if (breakpoints.length === 1) {
            const breakpointType = breakpoints[0].logMessage ? nls.localize('logPoint', "Logpoint") : nls.localize('breakpoint', "Breakpoint");
            actions.push(new Action('debug.removeBreakpoint', nls.localize('removeBreakpoint', "Remove {0}", breakpointType), undefined, true, async () => {
                await this.debugService.removeBreakpoints(breakpoints[0].getId());
            }));
            actions.push(new Action('workbench.debug.action.editBreakpointAction', nls.localize('editBreakpoint', "Edit {0}...", breakpointType), undefined, true, () => Promise.resolve(this.showBreakpointWidget(breakpoints[0].lineNumber, breakpoints[0].column))));
            actions.push(new Action(`workbench.debug.viewlet.action.toggleBreakpoint`, breakpoints[0].enabled ? nls.localize('disableBreakpoint', "Disable {0}", breakpointType) : nls.localize('enableBreakpoint', "Enable {0}", breakpointType), undefined, true, () => this.debugService.enableOrDisableBreakpoints(!breakpoints[0].enabled, breakpoints[0])));
        }
        else if (breakpoints.length > 1) {
            const sorted = breakpoints.slice().sort((first, second) => (first.column && second.column) ? first.column - second.column : 1);
            actions.push(new SubmenuAction('debug.removeBreakpoints', nls.localize('removeBreakpoints', "Remove Breakpoints"), sorted.map(bp => new Action('removeInlineBreakpoint', bp.column ? nls.localize('removeInlineBreakpointOnColumn', "Remove Inline Breakpoint on Column {0}", bp.column) : nls.localize('removeLineBreakpoint', "Remove Line Breakpoint"), undefined, true, () => this.debugService.removeBreakpoints(bp.getId())))));
            actions.push(new SubmenuAction('debug.editBreakpoints', nls.localize('editBreakpoints', "Edit Breakpoints"), sorted.map(bp => new Action('editBreakpoint', bp.column ? nls.localize('editInlineBreakpointOnColumn', "Edit Inline Breakpoint on Column {0}", bp.column) : nls.localize('editLineBreakpoint', "Edit Line Breakpoint"), undefined, true, () => Promise.resolve(this.showBreakpointWidget(bp.lineNumber, bp.column))))));
            actions.push(new SubmenuAction('debug.enableDisableBreakpoints', nls.localize('enableDisableBreakpoints', "Enable/Disable Breakpoints"), sorted.map(bp => new Action(bp.enabled ? 'disableColumnBreakpoint' : 'enableColumnBreakpoint', bp.enabled ? (bp.column ? nls.localize('disableInlineColumnBreakpoint', "Disable Inline Breakpoint on Column {0}", bp.column) : nls.localize('disableBreakpointOnLine', "Disable Line Breakpoint"))
                : (bp.column ? nls.localize('enableBreakpoints', "Enable Inline Breakpoint on Column {0}", bp.column) : nls.localize('enableBreakpointOnLine', "Enable Line Breakpoint")), undefined, true, () => this.debugService.enableOrDisableBreakpoints(!bp.enabled, bp)))));
        }
        else {
            actions.push(new Action('addBreakpoint', nls.localize('addBreakpoint', "Add Breakpoint"), undefined, true, () => this.debugService.addBreakpoints(uri, [{ lineNumber, column }])));
            actions.push(new Action('addConditionalBreakpoint', nls.localize('addConditionalBreakpoint', "Add Conditional Breakpoint..."), undefined, true, () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 0 /* BreakpointWidgetContext.CONDITION */))));
            actions.push(new Action('addLogPoint', nls.localize('addLogPoint', "Add Logpoint..."), undefined, true, () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 2 /* BreakpointWidgetContext.LOG_MESSAGE */))));
            actions.push(new Action('addTriggeredBreakpoint', nls.localize('addTriggeredBreakpoint', "Add Triggered Breakpoint..."), undefined, true, () => Promise.resolve(this.showBreakpointWidget(lineNumber, column, 3 /* BreakpointWidgetContext.TRIGGER_POINT */))));
        }
        if (this.debugService.state === 2 /* State.Stopped */) {
            actions.push(new Separator());
            actions.push(new Action('runToLine', nls.localize('runToLine', "Run to Line"), undefined, true, () => this.debugService.runTo(uri, lineNumber).catch(onUnexpectedError)));
        }
        return actions;
    }
    marginFreeFromNonDebugDecorations(line) {
        const decorations = this.editor.getLineDecorations(line);
        if (decorations) {
            for (const { options } of decorations) {
                const clz = options.glyphMarginClassName;
                if (!clz) {
                    continue;
                }
                const hasSomeActionableCodicon = !(clz.includes('codicon-') || clz.startsWith('coverage-deco-')) || clz.includes('codicon-testing-') || clz.includes('codicon-merge-') || clz.includes('codicon-arrow-') || clz.includes('codicon-loading') || clz.includes('codicon-fold') || clz.includes('codicon-gutter-lightbulb') || clz.includes('codicon-lightbulb-sparkle');
                if (hasSomeActionableCodicon) {
                    return false;
                }
            }
        }
        return true;
    }
    ensureBreakpointHintDecoration(showBreakpointHintAtLineNumber) {
        this.editor.changeDecorations((accessor) => {
            if (this.breakpointHintDecoration) {
                accessor.removeDecoration(this.breakpointHintDecoration);
                this.breakpointHintDecoration = null;
            }
            if (showBreakpointHintAtLineNumber !== -1) {
                this.breakpointHintDecoration = accessor.addDecoration({
                    startLineNumber: showBreakpointHintAtLineNumber,
                    startColumn: 1,
                    endLineNumber: showBreakpointHintAtLineNumber,
                    endColumn: 1
                }, breakpointHelperDecoration);
            }
        });
    }
    async setDecorations() {
        if (!this.editor.hasModel()) {
            return;
        }
        const setCandidateDecorations = (changeAccessor, desiredCandidatePositions) => {
            const desiredCandidateDecorations = createCandidateDecorations(model, this.breakpointDecorations, desiredCandidatePositions);
            const candidateDecorationIds = changeAccessor.deltaDecorations(this.candidateDecorations.map(c => c.decorationId), desiredCandidateDecorations);
            this.candidateDecorations.forEach(candidate => {
                candidate.inlineWidget.dispose();
            });
            this.candidateDecorations = candidateDecorationIds.map((decorationId, index) => {
                const candidate = desiredCandidateDecorations[index];
                // Candidate decoration has a breakpoint attached when a breakpoint is already at that location and we did not yet set a decoration there
                // In practice this happens for the first breakpoint that was set on a line
                // We could have also rendered this first decoration as part of desiredBreakpointDecorations however at that moment we have no location information
                const icon = candidate.breakpoint ? getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), candidate.breakpoint, this.labelService, this.debugService.getModel()).icon : icons.breakpoint.disabled;
                const contextMenuActions = () => this.getContextMenuActions(candidate.breakpoint ? [candidate.breakpoint] : [], activeCodeEditor.getModel().uri, candidate.range.startLineNumber, candidate.range.startColumn);
                const inlineWidget = new InlineBreakpointWidget(activeCodeEditor, decorationId, ThemeIcon.asClassName(icon), candidate.breakpoint, this.debugService, this.contextMenuService, contextMenuActions);
                return {
                    decorationId,
                    inlineWidget
                };
            });
        };
        const activeCodeEditor = this.editor;
        const model = activeCodeEditor.getModel();
        const breakpoints = this.debugService.getModel().getBreakpoints({ uri: model.uri });
        const debugSettings = this.configurationService.getValue('debug');
        const desiredBreakpointDecorations = this.instantiationService.invokeFunction(accessor => createBreakpointDecorations(accessor, model, breakpoints, this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), debugSettings.showBreakpointsInOverviewRuler));
        // try to set breakpoint location candidates in the same changeDecorations()
        // call to avoid flickering, if the DA responds reasonably quickly.
        const session = this.debugService.getViewModel().focusedSession;
        const desiredCandidatePositions = debugSettings.showInlineBreakpointCandidates && session ? requestBreakpointCandidateLocations(this.editor.getModel(), desiredBreakpointDecorations.map(bp => bp.range.startLineNumber), session) : Promise.resolve([]);
        const desiredCandidatePositionsRaced = await Promise.race([desiredCandidatePositions, timeout(500).then(() => undefined)]);
        if (desiredCandidatePositionsRaced === undefined) { // the timeout resolved first
            desiredCandidatePositions.then(v => activeCodeEditor.changeDecorations(d => setCandidateDecorations(d, v)));
        }
        try {
            this.ignoreDecorationsChangedEvent = true;
            // Set breakpoint decorations
            activeCodeEditor.changeDecorations((changeAccessor) => {
                const decorationIds = changeAccessor.deltaDecorations(this.breakpointDecorations.map(bpd => bpd.decorationId), desiredBreakpointDecorations);
                this.breakpointDecorations.forEach(bpd => {
                    bpd.inlineWidget?.dispose();
                });
                this.breakpointDecorations = decorationIds.map((decorationId, index) => {
                    let inlineWidget = undefined;
                    const breakpoint = breakpoints[index];
                    if (desiredBreakpointDecorations[index].options.before) {
                        const contextMenuActions = () => this.getContextMenuActions([breakpoint], activeCodeEditor.getModel().uri, breakpoint.lineNumber, breakpoint.column);
                        inlineWidget = new InlineBreakpointWidget(activeCodeEditor, decorationId, desiredBreakpointDecorations[index].options.glyphMarginClassName, breakpoint, this.debugService, this.contextMenuService, contextMenuActions);
                    }
                    return {
                        decorationId,
                        breakpoint,
                        range: desiredBreakpointDecorations[index].range,
                        inlineWidget
                    };
                });
                if (desiredCandidatePositionsRaced) {
                    setCandidateDecorations(changeAccessor, desiredCandidatePositionsRaced);
                }
            });
        }
        finally {
            this.ignoreDecorationsChangedEvent = false;
        }
        for (const d of this.breakpointDecorations) {
            if (d.inlineWidget) {
                this.editor.layoutContentWidget(d.inlineWidget);
            }
        }
    }
    async onModelDecorationsChanged() {
        if (this.breakpointDecorations.length === 0 || this.ignoreDecorationsChangedEvent || !this.editor.hasModel()) {
            // I have no decorations
            return;
        }
        let somethingChanged = false;
        const model = this.editor.getModel();
        this.breakpointDecorations.forEach(breakpointDecoration => {
            if (somethingChanged) {
                return;
            }
            const newBreakpointRange = model.getDecorationRange(breakpointDecoration.decorationId);
            if (newBreakpointRange && (!breakpointDecoration.range.equalsRange(newBreakpointRange))) {
                somethingChanged = true;
                breakpointDecoration.range = newBreakpointRange;
            }
        });
        if (!somethingChanged) {
            // nothing to do, my decorations did not change.
            return;
        }
        const data = new Map();
        for (let i = 0, len = this.breakpointDecorations.length; i < len; i++) {
            const breakpointDecoration = this.breakpointDecorations[i];
            const decorationRange = model.getDecorationRange(breakpointDecoration.decorationId);
            // check if the line got deleted.
            if (decorationRange) {
                // since we know it is collapsed, it cannot grow to multiple lines
                if (breakpointDecoration.breakpoint) {
                    data.set(breakpointDecoration.breakpoint.getId(), {
                        lineNumber: decorationRange.startLineNumber,
                        column: breakpointDecoration.breakpoint.column ? decorationRange.startColumn : undefined,
                    });
                }
            }
        }
        try {
            this.ignoreBreakpointsChangeEvent = true;
            await this.debugService.updateBreakpoints(model.uri, data, true);
        }
        finally {
            this.ignoreBreakpointsChangeEvent = false;
        }
    }
    // breakpoint widget
    showBreakpointWidget(lineNumber, column, context) {
        this.breakpointWidget?.dispose();
        this.breakpointWidget = this.instantiationService.createInstance(BreakpointWidget, this.editor, lineNumber, column, context);
        this.breakpointWidget.show({ lineNumber, column: 1 });
        this.breakpointWidgetVisible.set(true);
    }
    closeBreakpointWidget() {
        if (this.breakpointWidget) {
            this.breakpointWidget.dispose();
            this.breakpointWidget = undefined;
            this.breakpointWidgetVisible.reset();
            this.editor.focus();
        }
    }
    dispose() {
        this.breakpointWidget?.dispose();
        this.editor.removeDecorations(this.breakpointDecorations.map(bpd => bpd.decorationId));
        dispose(this.toDispose);
    }
};
BreakpointEditorContribution = __decorate([
    __param(1, IDebugService),
    __param(2, IContextMenuService),
    __param(3, IInstantiationService),
    __param(4, IContextKeyService),
    __param(5, IDialogService),
    __param(6, IConfigurationService),
    __param(7, ILabelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], BreakpointEditorContribution);
export { BreakpointEditorContribution };
GutterActionsRegistry.registerGutterActionsGenerator(({ lineNumber, editor, accessor }, result) => {
    const model = editor.getModel();
    const debugService = accessor.get(IDebugService);
    if (!model || !debugService.getAdapterManager().hasEnabledDebuggers() || !debugService.canSetBreakpointsIn(model)) {
        return;
    }
    const breakpointEditorContribution = editor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID);
    if (!breakpointEditorContribution) {
        return;
    }
    const actions = breakpointEditorContribution.getContextMenuActionsAtPosition(lineNumber, model);
    for (const action of actions) {
        result.push(action, '2_debug');
    }
});
class InlineBreakpointWidget {
    constructor(editor, decorationId, cssClass, breakpoint, debugService, contextMenuService, getContextMenuActions) {
        this.editor = editor;
        this.decorationId = decorationId;
        this.breakpoint = breakpoint;
        this.debugService = debugService;
        this.contextMenuService = contextMenuService;
        this.getContextMenuActions = getContextMenuActions;
        // editor.IContentWidget.allowEditorOverflow
        this.allowEditorOverflow = false;
        this.suppressMouseDown = true;
        this.toDispose = [];
        this.range = this.editor.getModel().getDecorationRange(decorationId);
        this.toDispose.push(this.editor.onDidChangeModelDecorations(() => {
            const model = this.editor.getModel();
            const range = model.getDecorationRange(this.decorationId);
            if (this.range && !this.range.equalsRange(range)) {
                this.range = range;
                this.editor.layoutContentWidget(this);
            }
        }));
        this.create(cssClass);
        this.editor.addContentWidget(this);
        this.editor.layoutContentWidget(this);
    }
    create(cssClass) {
        this.domNode = $('.inline-breakpoint-widget');
        if (cssClass) {
            this.domNode.classList.add(...cssClass.split(' '));
        }
        this.toDispose.push(dom.addDisposableListener(this.domNode, dom.EventType.CLICK, async (e) => {
            switch (this.breakpoint?.enabled) {
                case undefined:
                    await this.debugService.addBreakpoints(this.editor.getModel().uri, [{ lineNumber: this.range.startLineNumber, column: this.range.startColumn }]);
                    break;
                case true:
                    await this.debugService.removeBreakpoints(this.breakpoint.getId());
                    break;
                case false:
                    this.debugService.enableOrDisableBreakpoints(true, this.breakpoint);
                    break;
            }
        }));
        this.toDispose.push(dom.addDisposableListener(this.domNode, dom.EventType.CONTEXT_MENU, e => {
            const event = new StandardMouseEvent(dom.getWindow(this.domNode), e);
            const actions = this.getContextMenuActions();
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => actions,
                getActionsContext: () => this.breakpoint,
                onHide: () => disposeIfDisposable(actions)
            });
        }));
        const updateSize = () => {
            const lineHeight = this.editor.getOption(69 /* EditorOption.lineHeight */);
            this.domNode.style.height = `${lineHeight}px`;
            this.domNode.style.width = `${Math.ceil(0.8 * lineHeight)}px`;
            this.domNode.style.marginLeft = `4px`;
        };
        updateSize();
        this.toDispose.push(this.editor.onDidChangeConfiguration(c => {
            if (c.hasChanged(54 /* EditorOption.fontSize */) || c.hasChanged(69 /* EditorOption.lineHeight */)) {
                updateSize();
            }
        }));
    }
    getId() {
        return generateUuid();
    }
    getDomNode() {
        return this.domNode;
    }
    getPosition() {
        if (!this.range) {
            return null;
        }
        // Workaround: since the content widget can not be placed before the first column we need to force the left position
        this.domNode.classList.toggle('line-start', this.range.startColumn === 1);
        return {
            position: { lineNumber: this.range.startLineNumber, column: this.range.startColumn - 1 },
            preference: [0 /* ContentWidgetPositionPreference.EXACT */]
        };
    }
    dispose() {
        this.editor.removeContentWidget(this);
        dispose(this.toDispose);
    }
}
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], InlineBreakpointWidget.prototype, "getId", null);
registerThemingParticipant((theme, collector) => {
    const scope = '.monaco-editor .glyph-margin-widgets, .monaco-workbench .debug-breakpoints, .monaco-workbench .disassembly-view, .monaco-editor .contentWidgets';
    const debugIconBreakpointColor = theme.getColor(debugIconBreakpointForeground);
    if (debugIconBreakpointColor) {
        collector.addRule(`${scope} {
			${icons.allBreakpoints.map(b => `${ThemeIcon.asCSSSelector(b.regular)}`).join(',\n		')},
			${ThemeIcon.asCSSSelector(icons.debugBreakpointUnsupported)},
			${ThemeIcon.asCSSSelector(icons.debugBreakpointHint)}:not([class*='codicon-debug-breakpoint']):not([class*='codicon-debug-stackframe']),
			${ThemeIcon.asCSSSelector(icons.breakpoint.regular)}${ThemeIcon.asCSSSelector(icons.debugStackframeFocused)}::after,
			${ThemeIcon.asCSSSelector(icons.breakpoint.regular)}${ThemeIcon.asCSSSelector(icons.debugStackframe)}::after {
				color: ${debugIconBreakpointColor} !important;
			}
		}`);
        collector.addRule(`${scope} {
			${ThemeIcon.asCSSSelector(icons.breakpoint.pending)} {
				color: ${debugIconBreakpointColor} !important;
				font-size: 12px !important;
			}
		}`);
    }
    const debugIconBreakpointDisabledColor = theme.getColor(debugIconBreakpointDisabledForeground);
    if (debugIconBreakpointDisabledColor) {
        collector.addRule(`${scope} {
			${icons.allBreakpoints.map(b => ThemeIcon.asCSSSelector(b.disabled)).join(',\n		')} {
				color: ${debugIconBreakpointDisabledColor};
			}
		}`);
    }
    const debugIconBreakpointUnverifiedColor = theme.getColor(debugIconBreakpointUnverifiedForeground);
    if (debugIconBreakpointUnverifiedColor) {
        collector.addRule(`${scope} {
			${icons.allBreakpoints.map(b => ThemeIcon.asCSSSelector(b.unverified)).join(',\n		')} {
				color: ${debugIconBreakpointUnverifiedColor};
			}
		}`);
    }
    const debugIconBreakpointCurrentStackframeForegroundColor = theme.getColor(debugIconBreakpointCurrentStackframeForeground);
    if (debugIconBreakpointCurrentStackframeForegroundColor) {
        collector.addRule(`
		.monaco-editor .debug-top-stack-frame-column {
			color: ${debugIconBreakpointCurrentStackframeForegroundColor} !important;
		}
		${scope} {
			${ThemeIcon.asCSSSelector(icons.debugStackframe)} {
				color: ${debugIconBreakpointCurrentStackframeForegroundColor} !important;
			}
		}
		`);
    }
    const debugIconBreakpointStackframeFocusedColor = theme.getColor(debugIconBreakpointStackframeForeground);
    if (debugIconBreakpointStackframeFocusedColor) {
        collector.addRule(`${scope} {
			${ThemeIcon.asCSSSelector(icons.debugStackframeFocused)} {
				color: ${debugIconBreakpointStackframeFocusedColor} !important;
			}
		}`);
    }
});
export const debugIconBreakpointForeground = registerColor('debugIcon.breakpointForeground', '#E51400', nls.localize('debugIcon.breakpointForeground', 'Icon color for breakpoints.'));
const debugIconBreakpointDisabledForeground = registerColor('debugIcon.breakpointDisabledForeground', '#848484', nls.localize('debugIcon.breakpointDisabledForeground', 'Icon color for disabled breakpoints.'));
const debugIconBreakpointUnverifiedForeground = registerColor('debugIcon.breakpointUnverifiedForeground', '#848484', nls.localize('debugIcon.breakpointUnverifiedForeground', 'Icon color for unverified breakpoints.'));
const debugIconBreakpointCurrentStackframeForeground = registerColor('debugIcon.breakpointCurrentStackframeForeground', { dark: '#FFCC00', light: '#BE8700', hcDark: '#FFCC00', hcLight: '#BE8700' }, nls.localize('debugIcon.breakpointCurrentStackframeForeground', 'Icon color for the current breakpoint stack frame.'));
const debugIconBreakpointStackframeForeground = registerColor('debugIcon.breakpointStackframeForeground', '#89D185', nls.localize('debugIcon.breakpointStackframeForeground', 'Icon color for all breakpoint stack frames.'));
