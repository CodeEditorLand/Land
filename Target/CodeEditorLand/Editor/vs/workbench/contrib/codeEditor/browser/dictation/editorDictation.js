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
var EditorDictation_1;
import './editorDictation.css';
import { localize, localize2 } from '../../../../../nls.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { HasSpeechProvider, ISpeechService, SpeechToTextInProgress, SpeechToTextStatus } from '../../../speech/common/speechService.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { EditorAction2, registerEditorContribution } from '../../../../../editor/browser/editorExtensions.js';
import { EditorContextKeys } from '../../../../../editor/common/editorContextKeys.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { EditOperation } from '../../../../../editor/common/core/editOperation.js';
import { Selection } from '../../../../../editor/common/core/selection.js';
import { Position } from '../../../../../editor/common/core/position.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { assertIsDefined } from '../../../../../base/common/types.js';
import { ActionBar } from '../../../../../base/browser/ui/actionbar/actionbar.js';
import { toAction } from '../../../../../base/common/actions.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { isWindows } from '../../../../../base/common/platform.js';
const EDITOR_DICTATION_IN_PROGRESS = new RawContextKey('editorDictation.inProgress', false);
const VOICE_CATEGORY = localize2('voiceCategory', "Voice");
export class EditorDictationStartAction extends EditorAction2 {
    constructor() {
        super({
            id: 'workbench.action.editorDictation.start',
            title: localize2('startDictation', "Start Dictation in Editor"),
            category: VOICE_CATEGORY,
            precondition: ContextKeyExpr.and(HasSpeechProvider, SpeechToTextInProgress.toNegated(), EditorContextKeys.readOnly.toNegated()),
            f1: true,
            keybinding: {
                primary: 2048 | 512 | 52,
                weight: 200,
                secondary: isWindows ? [
                    512 | 91
                ] : undefined
            }
        });
    }
    runEditorCommand(accessor, editor) {
        const keybindingService = accessor.get(IKeybindingService);
        const holdMode = keybindingService.enableKeybindingHoldMode(this.desc.id);
        if (holdMode) {
            let shouldCallStop = false;
            const handle = setTimeout(() => {
                shouldCallStop = true;
            }, 500);
            holdMode.finally(() => {
                clearTimeout(handle);
                if (shouldCallStop) {
                    EditorDictation.get(editor)?.stop();
                }
            });
        }
        EditorDictation.get(editor)?.start();
    }
}
export class EditorDictationStopAction extends EditorAction2 {
    static { this.ID = 'workbench.action.editorDictation.stop'; }
    constructor() {
        super({
            id: EditorDictationStopAction.ID,
            title: localize2('stopDictation', "Stop Dictation in Editor"),
            category: VOICE_CATEGORY,
            precondition: EDITOR_DICTATION_IN_PROGRESS,
            f1: true,
            keybinding: {
                primary: 9,
                weight: 200 + 100
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        EditorDictation.get(editor)?.stop();
    }
}
export class DictationWidget extends Disposable {
    constructor(editor, keybindingService) {
        super();
        this.editor = editor;
        this.suppressMouseDown = true;
        this.allowEditorOverflow = true;
        this.domNode = document.createElement('div');
        const actionBar = this._register(new ActionBar(this.domNode));
        const stopActionKeybinding = keybindingService.lookupKeybinding(EditorDictationStopAction.ID)?.getLabel();
        actionBar.push(toAction({
            id: EditorDictationStopAction.ID,
            label: stopActionKeybinding ? localize('stopDictationShort1', "Stop Dictation ({0})", stopActionKeybinding) : localize('stopDictationShort2', "Stop Dictation"),
            class: ThemeIcon.asClassName(Codicon.micFilled),
            run: () => EditorDictation.get(editor)?.stop()
        }), { icon: true, label: false, keybinding: stopActionKeybinding });
        this.domNode.classList.add('editor-dictation-widget');
        this.domNode.appendChild(actionBar.domNode);
    }
    getId() {
        return 'editorDictation';
    }
    getDomNode() {
        return this.domNode;
    }
    getPosition() {
        if (!this.editor.hasModel()) {
            return null;
        }
        const selection = this.editor.getSelection();
        return {
            position: selection.getPosition(),
            preference: [
                selection.getPosition().equals(selection.getStartPosition()) ? 1 : 2,
                0
            ]
        };
    }
    beforeRender() {
        const lineHeight = this.editor.getOption(69);
        const width = this.editor.getLayoutInfo().contentWidth * 0.7;
        this.domNode.style.setProperty('--vscode-editor-dictation-widget-height', `${lineHeight}px`);
        this.domNode.style.setProperty('--vscode-editor-dictation-widget-width', `${width}px`);
        return null;
    }
    show() {
        this.editor.addContentWidget(this);
    }
    layout() {
        this.editor.layoutContentWidget(this);
    }
    active() {
        this.domNode.classList.add('recording');
    }
    hide() {
        this.domNode.classList.remove('recording');
        this.editor.removeContentWidget(this);
    }
}
let EditorDictation = class EditorDictation extends Disposable {
    static { EditorDictation_1 = this; }
    static { this.ID = 'editorDictation'; }
    static get(editor) {
        return editor.getContribution(EditorDictation_1.ID);
    }
    constructor(editor, speechService, contextKeyService, keybindingService) {
        super();
        this.editor = editor;
        this.speechService = speechService;
        this.contextKeyService = contextKeyService;
        this.keybindingService = keybindingService;
        this.widget = this._register(new DictationWidget(this.editor, this.keybindingService));
        this.editorDictationInProgress = EDITOR_DICTATION_IN_PROGRESS.bindTo(this.contextKeyService);
        this.sessionDisposables = this._register(new MutableDisposable());
    }
    async start() {
        const disposables = new DisposableStore();
        this.sessionDisposables.value = disposables;
        this.widget.show();
        disposables.add(toDisposable(() => this.widget.hide()));
        this.editorDictationInProgress.set(true);
        disposables.add(toDisposable(() => this.editorDictationInProgress.reset()));
        const collection = this.editor.createDecorationsCollection();
        disposables.add(toDisposable(() => collection.clear()));
        disposables.add(this.editor.onDidChangeCursorPosition(() => this.widget.layout()));
        let previewStart = undefined;
        let lastReplaceTextLength = 0;
        const replaceText = (text, isPreview) => {
            if (!previewStart) {
                previewStart = assertIsDefined(this.editor.getPosition());
            }
            const endPosition = new Position(previewStart.lineNumber, previewStart.column + text.length);
            this.editor.executeEdits(EditorDictation_1.ID, [
                EditOperation.replace(Range.fromPositions(previewStart, previewStart.with(undefined, previewStart.column + lastReplaceTextLength)), text)
            ], [
                Selection.fromPositions(endPosition)
            ]);
            if (isPreview) {
                collection.set([
                    {
                        range: Range.fromPositions(previewStart, previewStart.with(undefined, previewStart.column + text.length)),
                        options: {
                            description: 'editor-dictation-preview',
                            inlineClassName: 'ghost-text-decoration-preview'
                        }
                    }
                ]);
            }
            else {
                collection.clear();
            }
            lastReplaceTextLength = text.length;
            if (!isPreview) {
                previewStart = undefined;
                lastReplaceTextLength = 0;
            }
            this.editor.revealPositionInCenterIfOutsideViewport(endPosition);
        };
        const cts = new CancellationTokenSource();
        disposables.add(toDisposable(() => cts.dispose(true)));
        const session = await this.speechService.createSpeechToTextSession(cts.token, 'editor');
        disposables.add(session.onDidChange(e => {
            if (cts.token.isCancellationRequested) {
                return;
            }
            switch (e.status) {
                case SpeechToTextStatus.Started:
                    this.widget.active();
                    break;
                case SpeechToTextStatus.Stopped:
                    disposables.dispose();
                    break;
                case SpeechToTextStatus.Recognizing: {
                    if (!e.text) {
                        return;
                    }
                    replaceText(e.text, true);
                    break;
                }
                case SpeechToTextStatus.Recognized: {
                    if (!e.text) {
                        return;
                    }
                    replaceText(`${e.text} `, false);
                    break;
                }
            }
        }));
    }
    stop() {
        this.sessionDisposables.clear();
    }
};
EditorDictation = EditorDictation_1 = __decorate([
    __param(1, ISpeechService),
    __param(2, IContextKeyService),
    __param(3, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], EditorDictation);
export { EditorDictation };
registerEditorContribution(EditorDictation.ID, EditorDictation, 4);
registerAction2(EditorDictationStartAction);
registerAction2(EditorDictationStopAction);
