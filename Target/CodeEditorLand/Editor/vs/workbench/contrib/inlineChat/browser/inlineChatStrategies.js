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
var EditModeStrategy_1;
import { getTotalWidth, WindowIntervalTimer } from '../../../../base/browser/dom.js';
import { coalesceInPlace } from '../../../../base/common/arrays.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { themeColorFromId, ThemeIcon } from '../../../../base/common/themables.js';
import { StableEditorScrollState } from '../../../../editor/browser/stableEditorScroll.js';
import { LineSource, RenderOptions, renderLines } from '../../../../editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js';
import { LineRange } from '../../../../editor/common/core/lineRange.js';
import { Range } from '../../../../editor/common/core/range.js';
import { OverviewRulerLane } from '../../../../editor/common/model.js';
import { ModelDecorationOptions } from '../../../../editor/common/model/textModel.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { InlineDecoration } from '../../../../editor/common/viewModel.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Progress } from '../../../../platform/progress/common/progress.js';
import { countWords } from '../../chat/common/chatWordCounter.js';
import { Session } from './inlineChatSession.js';
import { InlineChatZoneWidget } from './inlineChatZoneWidget.js';
import { ACTION_TOGGLE_DIFF, CTX_INLINE_CHAT_CHANGE_HAS_DIFF, CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF, CTX_INLINE_CHAT_DOCUMENT_CHANGED, MENU_INLINE_CHAT_ZONE, minimapInlineChatDiffInserted, overviewRulerInlineChatDiffInserted } from '../common/inlineChat.js';
import { assertType } from '../../../../base/common/types.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { performAsyncTextEdit, asProgressiveEdit } from './utils.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { Schemas } from '../../../../base/common/network.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { DefaultChatTextEditor } from '../../chat/browser/codeBlockPart.js';
import { isEqual } from '../../../../base/common/resources.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { MenuWorkbenchButtonBar } from '../../../../platform/actions/browser/buttonbar.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { ConflictActionsFactory } from '../../mergeEditor/browser/view/conflictActions.js';
import { observableValue } from '../../../../base/common/observable.js';
import { IMenuService, MenuItemAction } from '../../../../platform/actions/common/actions.js';
let EditModeStrategy = class EditModeStrategy {
    static { EditModeStrategy_1 = this; }
    static { this._decoBlock = ModelDecorationOptions.register({
        description: 'inline-chat',
        showIfCollapsed: false,
        isWholeLine: true,
    }); }
    constructor(_session, _editor, _zone, _textFileService, _instaService) {
        this._session = _session;
        this._editor = _editor;
        this._zone = _zone;
        this._textFileService = _textFileService;
        this._instaService = _instaService;
        this._store = new DisposableStore();
        this._onDidAccept = this._store.add(new Emitter());
        this._onDidDiscard = this._store.add(new Emitter());
        this.onDidAccept = this._onDidAccept.event;
        this.onDidDiscard = this._onDidDiscard.event;
    }
    dispose() {
        this._store.dispose();
    }
    performHunkAction(_hunk, action) {
        if (action === 0 /* HunkAction.Accept */) {
            this._onDidAccept.fire();
        }
        else if (action === 1 /* HunkAction.Discard */) {
            this._onDidDiscard.fire();
        }
    }
    async _doApplyChanges(ignoreLocal) {
        const untitledModels = [];
        const editor = this._instaService.createInstance(DefaultChatTextEditor);
        for (const request of this._session.chatModel.getRequests()) {
            if (!request.response?.response) {
                continue;
            }
            for (const item of request.response.response.value) {
                if (item.kind !== 'textEditGroup') {
                    continue;
                }
                if (ignoreLocal && isEqual(item.uri, this._session.textModelN.uri)) {
                    continue;
                }
                await editor.apply(request.response, item, undefined);
                if (item.uri.scheme === Schemas.untitled) {
                    const untitled = this._textFileService.untitled.get(item.uri);
                    if (untitled) {
                        untitledModels.push(untitled);
                    }
                }
            }
        }
        for (const untitledModel of untitledModels) {
            if (!untitledModel.isDisposed()) {
                await untitledModel.resolve();
                await untitledModel.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
    }
    cancel() {
        return this._session.hunkData.discardAll();
    }
    getWholeRangeDecoration() {
        const ranges = [this._session.wholeRange.value];
        const newDecorations = ranges.map(range => range.isEmpty() ? undefined : ({ range, options: EditModeStrategy_1._decoBlock }));
        coalesceInPlace(newDecorations);
        return newDecorations;
    }
};
EditModeStrategy = EditModeStrategy_1 = __decorate([
    __param(3, ITextFileService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Session, Object, InlineChatZoneWidget, Object, Object])
], EditModeStrategy);
export { EditModeStrategy };
let PreviewStrategy = class PreviewStrategy extends EditModeStrategy {
    constructor(session, editor, zone, modelService, contextKeyService, textFileService, instaService) {
        super(session, editor, zone, textFileService, instaService);
        this._ctxDocumentChanged = CTX_INLINE_CHAT_DOCUMENT_CHANGED.bindTo(contextKeyService);
        const baseModel = modelService.getModel(session.targetUri);
        Event.debounce(baseModel.onDidChangeContent.bind(baseModel), () => { }, 350)(_ => {
            if (!baseModel.isDisposed() && !session.textModel0.isDisposed()) {
                this._ctxDocumentChanged.set(session.hasChangedText);
            }
        }, undefined, this._store);
    }
    dispose() {
        this._ctxDocumentChanged.reset();
        super.dispose();
    }
    async apply() {
        await super._doApplyChanges(false);
    }
    async makeChanges() {
    }
    async makeProgressiveChanges() {
    }
    async renderChanges() { }
    hasFocus() {
        return this._zone.widget.hasFocus();
    }
};
PreviewStrategy = __decorate([
    __param(3, IModelService),
    __param(4, IContextKeyService),
    __param(5, ITextFileService),
    __param(6, IInstantiationService),
    __metadata("design:paramtypes", [Session, Object, InlineChatZoneWidget, Object, Object, Object, Object])
], PreviewStrategy);
export { PreviewStrategy };
let LiveStrategy = class LiveStrategy extends EditModeStrategy {
    constructor(session, editor, zone, _showOverlayToolbar, contextKeyService, _editorWorkerService, _accessibilityService, _configService, _menuService, _contextService, textFileService, instaService) {
        super(session, editor, zone, textFileService, instaService);
        this._showOverlayToolbar = _showOverlayToolbar;
        this._editorWorkerService = _editorWorkerService;
        this._accessibilityService = _accessibilityService;
        this._configService = _configService;
        this._menuService = _menuService;
        this._contextService = _contextService;
        this._decoInsertedText = ModelDecorationOptions.register({
            description: 'inline-modified-line',
            className: 'inline-chat-inserted-range-linehighlight',
            isWholeLine: true,
            overviewRuler: {
                position: OverviewRulerLane.Full,
                color: themeColorFromId(overviewRulerInlineChatDiffInserted),
            },
            minimap: {
                position: 1 /* MinimapPosition.Inline */,
                color: themeColorFromId(minimapInlineChatDiffInserted),
            }
        });
        this._decoInsertedTextRange = ModelDecorationOptions.register({
            description: 'inline-chat-inserted-range-linehighlight',
            className: 'inline-chat-inserted-range',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        });
        this._editCount = 0;
        this._hunkDisplayData = new Map();
        this._ctxCurrentChangeHasDiff = CTX_INLINE_CHAT_CHANGE_HAS_DIFF.bindTo(contextKeyService);
        this._ctxCurrentChangeShowsDiff = CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF.bindTo(contextKeyService);
        this._progressiveEditingDecorations = this._editor.createDecorationsCollection();
        this._lensActionsFactory = this._store.add(new ConflictActionsFactory(this._editor));
    }
    dispose() {
        this._resetDiff();
        super.dispose();
    }
    _resetDiff() {
        this._ctxCurrentChangeHasDiff.reset();
        this._ctxCurrentChangeShowsDiff.reset();
        this._zone.widget.updateStatus('');
        this._progressiveEditingDecorations.clear();
        for (const data of this._hunkDisplayData.values()) {
            data.remove();
        }
    }
    async apply() {
        this._resetDiff();
        if (this._editCount > 0) {
            this._editor.pushUndoStop();
        }
        await super._doApplyChanges(true);
    }
    cancel() {
        this._resetDiff();
        return super.cancel();
    }
    async makeChanges(edits, obs, undoStopBefore) {
        return this._makeChanges(edits, obs, undefined, undefined, undoStopBefore);
    }
    async makeProgressiveChanges(edits, obs, opts, undoStopBefore) {
        // add decorations once per line that got edited
        const progress = new Progress(edits => {
            const newLines = new Set();
            for (const edit of edits) {
                LineRange.fromRange(edit.range).forEach(line => newLines.add(line));
            }
            const existingRanges = this._progressiveEditingDecorations.getRanges().map(LineRange.fromRange);
            for (const existingRange of existingRanges) {
                existingRange.forEach(line => newLines.delete(line));
            }
            const newDecorations = [];
            for (const line of newLines) {
                newDecorations.push({ range: new Range(line, 1, line, Number.MAX_VALUE), options: this._decoInsertedText });
            }
            this._progressiveEditingDecorations.append(newDecorations);
        });
        return this._makeChanges(edits, obs, opts, progress, undoStopBefore);
    }
    async _makeChanges(edits, obs, opts, progress, undoStopBefore) {
        // push undo stop before first edit
        if (undoStopBefore) {
            this._editor.pushUndoStop();
        }
        this._editCount++;
        if (opts) {
            // ASYNC
            const durationInSec = opts.duration / 1000;
            for (const edit of edits) {
                const wordCount = countWords(edit.text ?? '');
                const speed = wordCount / durationInSec;
                // console.log({ durationInSec, wordCount, speed: wordCount / durationInSec });
                const asyncEdit = asProgressiveEdit(new WindowIntervalTimer(this._zone.domNode), edit, speed, opts.token);
                await performAsyncTextEdit(this._session.textModelN, asyncEdit, progress, obs);
            }
        }
        else {
            // SYNC
            obs.start();
            this._session.textModelN.pushEditOperations(null, edits, (undoEdits) => {
                progress?.report(undoEdits);
                return null;
            });
            obs.stop();
        }
    }
    performHunkAction(hunk, action) {
        const displayData = this._findDisplayData(hunk);
        if (!displayData) {
            // no hunks (left or not yet) found, make sure to
            // finish the sessions
            if (action === 0 /* HunkAction.Accept */) {
                this._onDidAccept.fire();
            }
            else if (action === 1 /* HunkAction.Discard */) {
                this._onDidDiscard.fire();
            }
            return;
        }
        if (action === 0 /* HunkAction.Accept */) {
            displayData.acceptHunk();
        }
        else if (action === 1 /* HunkAction.Discard */) {
            displayData.discardHunk();
        }
        else if (action === 2 /* HunkAction.MoveNext */) {
            displayData.move(true);
        }
        else if (action === 3 /* HunkAction.MovePrev */) {
            displayData.move(false);
        }
        else if (action === 4 /* HunkAction.ToggleDiff */) {
            displayData.toggleDiff?.();
        }
    }
    _findDisplayData(hunkInfo) {
        let result;
        if (hunkInfo) {
            // use context hunk (from tool/buttonbar)
            result = this._hunkDisplayData.get(hunkInfo);
        }
        if (!result && this._zone.position) {
            // find nearest from zone position
            const zoneLine = this._zone.position.lineNumber;
            let distance = Number.MAX_SAFE_INTEGER;
            for (const candidate of this._hunkDisplayData.values()) {
                if (candidate.hunk.getState() !== 0 /* HunkState.Pending */) {
                    continue;
                }
                const hunkRanges = candidate.hunk.getRangesN();
                const myDistance = zoneLine <= hunkRanges[0].startLineNumber
                    ? hunkRanges[0].startLineNumber - zoneLine
                    : zoneLine - hunkRanges[0].endLineNumber;
                if (myDistance < distance) {
                    distance = myDistance;
                    result = candidate;
                }
            }
        }
        if (!result) {
            // fallback: first hunk that is pending
            result = Iterable.first(Iterable.filter(this._hunkDisplayData.values(), candidate => candidate.hunk.getState() === 0 /* HunkState.Pending */));
        }
        return result;
    }
    async renderChanges() {
        this._progressiveEditingDecorations.clear();
        const renderHunks = () => {
            let widgetData;
            changeDecorationsAndViewZones(this._editor, (decorationsAccessor, viewZoneAccessor) => {
                const keysNow = new Set(this._hunkDisplayData.keys());
                widgetData = undefined;
                for (const hunkData of this._session.hunkData.getInfo()) {
                    keysNow.delete(hunkData);
                    const hunkRanges = hunkData.getRangesN();
                    let data = this._hunkDisplayData.get(hunkData);
                    if (!data) {
                        // first time -> create decoration
                        const decorationIds = [];
                        for (let i = 0; i < hunkRanges.length; i++) {
                            decorationIds.push(decorationsAccessor.addDecoration(hunkRanges[i], i === 0
                                ? this._decoInsertedText
                                : this._decoInsertedTextRange));
                        }
                        const acceptHunk = () => {
                            hunkData.acceptChanges();
                            renderHunks();
                        };
                        const discardHunk = () => {
                            hunkData.discardChanges();
                            renderHunks();
                        };
                        // original view zone
                        const mightContainNonBasicASCII = this._session.textModel0.mightContainNonBasicASCII();
                        const mightContainRTL = this._session.textModel0.mightContainRTL();
                        const renderOptions = RenderOptions.fromEditor(this._editor);
                        const originalRange = hunkData.getRanges0()[0];
                        const source = new LineSource(LineRange.fromRangeInclusive(originalRange).mapToLineArray(l => this._session.textModel0.tokenization.getLineTokens(l)), [], mightContainNonBasicASCII, mightContainRTL);
                        const domNode = document.createElement('div');
                        domNode.className = 'inline-chat-original-zone2';
                        const result = renderLines(source, renderOptions, [new InlineDecoration(new Range(originalRange.startLineNumber, 1, originalRange.startLineNumber, 1), '', 0 /* InlineDecorationType.Regular */)], domNode);
                        const viewZoneData = {
                            afterLineNumber: -1,
                            heightInLines: result.heightInLines,
                            domNode,
                            ordinal: 50000 + 2 // more than https://github.com/microsoft/vscode/blob/bf52a5cfb2c75a7327c9adeaefbddc06d529dcad/src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts#L42
                        };
                        const toggleDiff = () => {
                            const scrollState = StableEditorScrollState.capture(this._editor);
                            changeDecorationsAndViewZones(this._editor, (_decorationsAccessor, viewZoneAccessor) => {
                                assertType(data);
                                if (!data.diffViewZoneId) {
                                    const [hunkRange] = hunkData.getRangesN();
                                    viewZoneData.afterLineNumber = hunkRange.startLineNumber - 1;
                                    data.diffViewZoneId = viewZoneAccessor.addZone(viewZoneData);
                                    overlay?.updateExtraTop(result.heightInLines);
                                }
                                else {
                                    viewZoneAccessor.removeZone(data.diffViewZoneId);
                                    overlay?.updateExtraTop(0);
                                    data.diffViewZoneId = undefined;
                                }
                            });
                            this._ctxCurrentChangeShowsDiff.set(typeof data?.diffViewZoneId === 'string');
                            scrollState.restore(this._editor);
                        };
                        const overlay = this._showOverlayToolbar && false
                            ? this._instaService.createInstance(InlineChangeOverlay, this._editor, hunkData)
                            : undefined;
                        let lensActions;
                        const lensActionsViewZoneIds = [];
                        if (this._showOverlayToolbar && hunkData.getState() === 0 /* HunkState.Pending */) {
                            lensActions = new DisposableStore();
                            const menu = this._menuService.createMenu(MENU_INLINE_CHAT_ZONE, this._contextService);
                            const makeActions = () => {
                                const actions = [];
                                const tuples = menu.getActions({ arg: hunkData });
                                for (const [, group] of tuples) {
                                    for (const item of group) {
                                        if (item instanceof MenuItemAction) {
                                            let text = item.label;
                                            if (item.id === ACTION_TOGGLE_DIFF) {
                                                text = item.checked ? 'Hide Changes' : 'Show Changes';
                                            }
                                            else if (ThemeIcon.isThemeIcon(item.item.icon)) {
                                                text = `$(${item.item.icon.id}) ${text}`;
                                            }
                                            actions.push({
                                                text,
                                                tooltip: item.tooltip,
                                                action: async () => item.run(),
                                            });
                                        }
                                    }
                                }
                                return actions;
                            };
                            const obs = observableValue(this, makeActions());
                            lensActions.add(menu.onDidChange(() => obs.set(makeActions(), undefined)));
                            lensActions.add(menu);
                            lensActions.add(this._lensActionsFactory.createWidget(viewZoneAccessor, hunkRanges[0].startLineNumber - 1, obs, lensActionsViewZoneIds));
                        }
                        const remove = () => {
                            changeDecorationsAndViewZones(this._editor, (decorationsAccessor, viewZoneAccessor) => {
                                assertType(data);
                                for (const decorationId of data.decorationIds) {
                                    decorationsAccessor.removeDecoration(decorationId);
                                }
                                if (data.diffViewZoneId) {
                                    viewZoneAccessor.removeZone(data.diffViewZoneId);
                                }
                                data.decorationIds = [];
                                data.diffViewZoneId = undefined;
                                data.lensActionsViewZoneIds?.forEach(viewZoneAccessor.removeZone);
                                data.lensActionsViewZoneIds = undefined;
                            });
                            lensActions?.dispose();
                            overlay?.dispose();
                        };
                        const move = (next) => {
                            const keys = Array.from(this._hunkDisplayData.keys());
                            const idx = keys.indexOf(hunkData);
                            const nextIdx = (idx + (next ? 1 : -1) + keys.length) % keys.length;
                            if (nextIdx !== idx) {
                                const nextData = this._hunkDisplayData.get(keys[nextIdx]);
                                this._zone.updatePositionAndHeight(nextData?.position);
                                renderHunks();
                            }
                        };
                        const zoneLineNumber = this._zone.position?.lineNumber ?? this._editor.getPosition().lineNumber;
                        const myDistance = zoneLineNumber <= hunkRanges[0].startLineNumber
                            ? hunkRanges[0].startLineNumber - zoneLineNumber
                            : zoneLineNumber - hunkRanges[0].endLineNumber;
                        data = {
                            hunk: hunkData,
                            decorationIds,
                            diffViewZoneId: '',
                            diffViewZone: viewZoneData,
                            lensActionsViewZoneIds,
                            distance: myDistance,
                            position: hunkRanges[0].getStartPosition().delta(-1),
                            acceptHunk,
                            discardHunk,
                            toggleDiff: !hunkData.isInsertion() ? toggleDiff : undefined,
                            remove,
                            move,
                        };
                        this._hunkDisplayData.set(hunkData, data);
                    }
                    else if (hunkData.getState() !== 0 /* HunkState.Pending */) {
                        data.remove();
                    }
                    else {
                        // update distance and position based on modifiedRange-decoration
                        const zoneLineNumber = this._zone.position?.lineNumber ?? this._editor.getPosition().lineNumber;
                        const modifiedRangeNow = hunkRanges[0];
                        data.position = modifiedRangeNow.getStartPosition().delta(-1);
                        data.distance = zoneLineNumber <= modifiedRangeNow.startLineNumber
                            ? modifiedRangeNow.startLineNumber - zoneLineNumber
                            : zoneLineNumber - modifiedRangeNow.endLineNumber;
                    }
                    if (hunkData.getState() === 0 /* HunkState.Pending */ && (!widgetData || data.distance < widgetData.distance)) {
                        widgetData = data;
                    }
                }
                for (const key of keysNow) {
                    const data = this._hunkDisplayData.get(key);
                    if (data) {
                        this._hunkDisplayData.delete(key);
                        data.remove();
                    }
                }
            });
            if (widgetData) {
                this._zone.reveal(widgetData.position);
                const mode = this._configService.getValue("inlineChat.accessibleDiffView" /* InlineChatConfigKeys.AccessibleDiffView */);
                if (mode === 'on' || mode === 'auto' && this._accessibilityService.isScreenReaderOptimized()) {
                    this._zone.widget.showAccessibleHunk(this._session, widgetData.hunk);
                }
                this._ctxCurrentChangeHasDiff.set(Boolean(widgetData.toggleDiff));
            }
            else if (this._hunkDisplayData.size > 0) {
                // everything accepted or rejected
                let oneAccepted = false;
                for (const hunkData of this._session.hunkData.getInfo()) {
                    if (hunkData.getState() === 1 /* HunkState.Accepted */) {
                        oneAccepted = true;
                        break;
                    }
                }
                if (oneAccepted) {
                    this._onDidAccept.fire();
                }
                else {
                    this._onDidDiscard.fire();
                }
            }
            return widgetData;
        };
        return renderHunks()?.position;
    }
    hasFocus() {
        return this._zone.widget.hasFocus();
    }
    getWholeRangeDecoration() {
        // don't render the blue in live mode
        return [];
    }
};
LiveStrategy = __decorate([
    __param(4, IContextKeyService),
    __param(5, IEditorWorkerService),
    __param(6, IAccessibilityService),
    __param(7, IConfigurationService),
    __param(8, IMenuService),
    __param(9, IContextKeyService),
    __param(10, ITextFileService),
    __param(11, IInstantiationService),
    __metadata("design:paramtypes", [Session, Object, InlineChatZoneWidget, Boolean, Object, Object, Object, Object, Object, Object, Object, Object])
], LiveStrategy);
export { LiveStrategy };
function changeDecorationsAndViewZones(editor, callback) {
    editor.changeDecorations(decorationsAccessor => {
        editor.changeViewZones(viewZoneAccessor => {
            callback(decorationsAccessor, viewZoneAccessor);
        });
    });
}
let InlineChangeOverlay = class InlineChangeOverlay {
    constructor(_editor, _hunkInfo, _instaService) {
        this._editor = _editor;
        this._hunkInfo = _hunkInfo;
        this._instaService = _instaService;
        this.allowEditorOverflow = false;
        this._id = `inline-chat-diff-overlay-` + generateUuid();
        this._domNode = document.createElement('div');
        this._store = new DisposableStore();
        this._extraTopLines = 0;
        this._domNode.classList.add('inline-chat-diff-overlay');
        if (_hunkInfo.getState() === 0 /* HunkState.Pending */) {
            const menuBar = this._store.add(this._instaService.createInstance(MenuWorkbenchButtonBar, this._domNode, MENU_INLINE_CHAT_ZONE, {
                menuOptions: { arg: _hunkInfo },
                telemetrySource: 'inlineChat-changesZone',
                buttonConfigProvider: (_action, idx) => {
                    return {
                        isSecondary: idx > 0,
                        showIcon: true,
                        showLabel: false
                    };
                },
            }));
            this._store.add(menuBar.onDidChange(() => this._editor.layoutOverlayWidget(this)));
        }
        this._editor.addOverlayWidget(this);
        this._store.add(Event.any(this._editor.onDidLayoutChange, this._editor.onDidScrollChange)(() => this._editor.layoutOverlayWidget(this)));
        queueMicrotask(() => this._editor.layoutOverlayWidget(this)); // FUNKY but needed to get the initial layout right
    }
    dispose() {
        this._editor.removeOverlayWidget(this);
        this._store.dispose();
    }
    getId() {
        return this._id;
    }
    getDomNode() {
        return this._domNode;
    }
    getPosition() {
        const line = this._hunkInfo.getRangesN()[0].startLineNumber;
        const info = this._editor.getLayoutInfo();
        const top = this._editor.getTopForLineNumber(line) - this._editor.getScrollTop();
        const left = info.contentLeft + info.contentWidth - info.verticalScrollbarWidth;
        const extraTop = this._editor.getOption(69 /* EditorOption.lineHeight */) * this._extraTopLines;
        const width = getTotalWidth(this._domNode);
        return { preference: { top: top - extraTop, left: left - width } };
    }
    updateExtraTop(value) {
        if (this._extraTopLines !== value) {
            this._extraTopLines = value;
            this._editor.layoutOverlayWidget(this);
        }
    }
};
InlineChangeOverlay = __decorate([
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], InlineChangeOverlay);
