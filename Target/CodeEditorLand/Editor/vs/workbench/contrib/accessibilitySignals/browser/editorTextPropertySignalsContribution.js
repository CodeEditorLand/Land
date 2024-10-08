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
import { disposableTimeout } from '../../../../base/common/async.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { autorun, autorunWithStore, derived, observableFromEvent, observableFromPromise, observableFromValueWithChangeEvent, observableSignalFromEvent, wasEventTriggeredRecently } from '../../../../base/common/observable.js';
import { isDefined } from '../../../../base/common/types.js';
import { isCodeEditor, isDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { FoldingController } from '../../../../editor/contrib/folding/browser/folding.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IMarkerService, MarkerSeverity } from '../../../../platform/markers/common/markers.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IDebugService } from '../../debug/common/debug.js';
let EditorTextPropertySignalsContribution = class EditorTextPropertySignalsContribution extends Disposable {
    constructor(_editorService, _instantiationService, _accessibilitySignalService) {
        super();
        this._editorService = _editorService;
        this._instantiationService = _instantiationService;
        this._accessibilitySignalService = _accessibilitySignalService;
        this._textProperties = [
            this._instantiationService.createInstance(MarkerTextProperty, AccessibilitySignal.errorAtPosition, AccessibilitySignal.errorOnLine, MarkerSeverity.Error),
            this._instantiationService.createInstance(MarkerTextProperty, AccessibilitySignal.warningAtPosition, AccessibilitySignal.warningOnLine, MarkerSeverity.Warning),
            this._instantiationService.createInstance(FoldedAreaTextProperty),
            this._instantiationService.createInstance(BreakpointTextProperty),
        ];
        this._someAccessibilitySignalIsEnabled = derived(this, reader => this._textProperties
            .flatMap(p => [p.lineSignal, p.positionSignal])
            .filter(isDefined)
            .some(signal => observableFromValueWithChangeEvent(this, this._accessibilitySignalService.getEnabledState(signal, false)).read(reader)));
        this._activeEditorObservable = observableFromEvent(this, this._editorService.onDidActiveEditorChange, (_) => {
            const activeTextEditorControl = this._editorService.activeTextEditorControl;
            const editor = isDiffEditor(activeTextEditorControl)
                ? activeTextEditorControl.getOriginalEditor()
                : isCodeEditor(activeTextEditorControl)
                    ? activeTextEditorControl
                    : undefined;
            return editor && editor.hasModel() ? { editor, model: editor.getModel() } : undefined;
        });
        this._register(autorunWithStore((reader, store) => {
            /** @description updateSignalsEnabled */
            if (!this._someAccessibilitySignalIsEnabled.read(reader)) {
                return;
            }
            const activeEditor = this._activeEditorObservable.read(reader);
            if (activeEditor) {
                this._registerAccessibilitySignalsForEditor(activeEditor.editor, activeEditor.model, store);
            }
        }));
    }
    _registerAccessibilitySignalsForEditor(editor, editorModel, store) {
        let lastLine = -1;
        const ignoredLineSignalsForCurrentLine = new Set();
        const timeouts = store.add(new DisposableStore());
        const propertySources = this._textProperties.map(p => ({ source: p.createSource(editor, editorModel), property: p }));
        const didType = wasEventTriggeredRecently(editor.onDidChangeModelContent, 100, store);
        store.add(editor.onDidChangeCursorPosition(args => {
            timeouts.clear();
            if (args &&
                args.reason !== 3 /* CursorChangeReason.Explicit */ &&
                args.reason !== 0 /* CursorChangeReason.NotSet */) {
                // Ignore cursor changes caused by navigation (e.g. which happens when execution is paused).
                ignoredLineSignalsForCurrentLine.clear();
                return;
            }
            const trigger = (property, source, mode) => {
                const signal = mode === 'line' ? property.lineSignal : property.positionSignal;
                if (!signal
                    || !this._accessibilitySignalService.getEnabledState(signal, false).value
                    || !source.isPresent(position, mode, undefined)) {
                    return;
                }
                for (const modality of ['sound', 'announcement']) {
                    if (this._accessibilitySignalService.getEnabledState(signal, false, modality).value) {
                        const delay = this._accessibilitySignalService.getDelayMs(signal, modality, mode) + (didType.get() ? 1000 : 0);
                        timeouts.add(disposableTimeout(() => {
                            if (source.isPresent(position, mode, undefined)) {
                                if (!(mode === 'line') || !ignoredLineSignalsForCurrentLine.has(property)) {
                                    this._accessibilitySignalService.playSignal(signal, { modality });
                                }
                                ignoredLineSignalsForCurrentLine.add(property);
                            }
                        }, delay));
                    }
                }
            };
            // React to cursor changes
            const position = args.position;
            const lineNumber = position.lineNumber;
            if (lineNumber !== lastLine) {
                ignoredLineSignalsForCurrentLine.clear();
                lastLine = lineNumber;
                for (const p of propertySources) {
                    trigger(p.property, p.source, 'line');
                }
            }
            for (const p of propertySources) {
                trigger(p.property, p.source, 'positional');
            }
            // React to property state changes for the current cursor position
            for (const s of propertySources) {
                if (![s.property.lineSignal, s.property.positionSignal]
                    .some(s => s && this._accessibilitySignalService.getEnabledState(s, false).value)) {
                    return;
                }
                let lastValueAtPosition = undefined;
                let lastValueOnLine = undefined;
                timeouts.add(autorun(reader => {
                    const newValueAtPosition = s.source.isPresentAtPosition(args.position, reader);
                    const newValueOnLine = s.source.isPresentOnLine(args.position.lineNumber, reader);
                    if (lastValueAtPosition !== undefined && lastValueAtPosition !== undefined) {
                        if (!lastValueAtPosition && newValueAtPosition) {
                            trigger(s.property, s.source, 'positional');
                        }
                        if (!lastValueOnLine && newValueOnLine) {
                            trigger(s.property, s.source, 'line');
                        }
                    }
                    lastValueAtPosition = newValueAtPosition;
                    lastValueOnLine = newValueOnLine;
                }));
            }
        }));
    }
};
EditorTextPropertySignalsContribution = __decorate([
    __param(0, IEditorService),
    __param(1, IInstantiationService),
    __param(2, IAccessibilitySignalService),
    __metadata("design:paramtypes", [Object, Object, Object])
], EditorTextPropertySignalsContribution);
export { EditorTextPropertySignalsContribution };
class TextPropertySource {
    static { this.notPresent = new TextPropertySource({ isPresentAtPosition: () => false, isPresentOnLine: () => false }); }
    constructor(options) {
        this.isPresentOnLine = options.isPresentOnLine;
        this.isPresentAtPosition = options.isPresentAtPosition ?? (() => false);
    }
    isPresent(position, mode, reader) {
        return mode === 'line' ? this.isPresentOnLine(position.lineNumber, reader) : this.isPresentAtPosition(position, reader);
    }
}
let MarkerTextProperty = class MarkerTextProperty {
    constructor(positionSignal, lineSignal, severity, markerService) {
        this.positionSignal = positionSignal;
        this.lineSignal = lineSignal;
        this.severity = severity;
        this.markerService = markerService;
        this.debounceWhileTyping = true;
    }
    createSource(editor, model) {
        const obs = observableSignalFromEvent('onMarkerChanged', this.markerService.onMarkerChanged);
        return new TextPropertySource({
            isPresentAtPosition: (position, reader) => {
                obs.read(reader);
                const hasMarker = this.markerService
                    .read({ resource: model.uri })
                    .some((m) => m.severity === this.severity &&
                    m.startLineNumber <= position.lineNumber &&
                    position.lineNumber <= m.endLineNumber &&
                    m.startColumn <= position.column &&
                    position.column <= m.endColumn);
                return hasMarker;
            },
            isPresentOnLine: (lineNumber, reader) => {
                obs.read(reader);
                const hasMarker = this.markerService
                    .read({ resource: model.uri })
                    .some((m) => m.severity === this.severity &&
                    m.startLineNumber <= lineNumber &&
                    lineNumber <= m.endLineNumber);
                return hasMarker;
            }
        });
    }
};
MarkerTextProperty = __decorate([
    __param(3, IMarkerService),
    __metadata("design:paramtypes", [AccessibilitySignal,
        AccessibilitySignal, Number, Object])
], MarkerTextProperty);
class FoldedAreaTextProperty {
    constructor() {
        this.lineSignal = AccessibilitySignal.foldedArea;
    }
    createSource(editor, _model) {
        const foldingController = FoldingController.get(editor);
        if (!foldingController) {
            return TextPropertySource.notPresent;
        }
        const foldingModel = observableFromPromise(foldingController.getFoldingModel() ?? Promise.resolve(undefined));
        return new TextPropertySource({
            isPresentOnLine(lineNumber, reader) {
                const m = foldingModel.read(reader);
                const regionAtLine = m.value?.getRegionAtLine(lineNumber);
                const hasFolding = !regionAtLine
                    ? false
                    : regionAtLine.isCollapsed &&
                        regionAtLine.startLineNumber === lineNumber;
                return hasFolding;
            }
        });
    }
}
let BreakpointTextProperty = class BreakpointTextProperty {
    constructor(debugService) {
        this.debugService = debugService;
        this.lineSignal = AccessibilitySignal.break;
    }
    createSource(editor, model) {
        const signal = observableSignalFromEvent('onDidChangeBreakpoints', this.debugService.getModel().onDidChangeBreakpoints);
        const debugService = this.debugService;
        return new TextPropertySource({
            isPresentOnLine(lineNumber, reader) {
                signal.read(reader);
                const breakpoints = debugService
                    .getModel()
                    .getBreakpoints({ uri: model.uri, lineNumber });
                const hasBreakpoints = breakpoints.length > 0;
                return hasBreakpoints;
            }
        });
    }
};
BreakpointTextProperty = __decorate([
    __param(0, IDebugService),
    __metadata("design:paramtypes", [Object])
], BreakpointTextProperty);
