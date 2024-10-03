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
var RangeHighlightDecorations_1;
import { Emitter } from '../../base/common/event.js';
import { Disposable, DisposableStore } from '../../base/common/lifecycle.js';
import { isEqual } from '../../base/common/resources.js';
import { isCodeEditor, isCompositeEditor } from '../../editor/browser/editorBrowser.js';
import { EmbeddedCodeEditorWidget } from '../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js';
import { ModelDecorationOptions } from '../../editor/common/model/textModel.js';
import { AbstractFloatingClickMenu, FloatingClickWidget } from '../../platform/actions/browser/floatingMenu.js';
import { IMenuService, MenuId } from '../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../platform/keybinding/common/keybinding.js';
import { IEditorService } from '../services/editor/common/editorService.js';
let RangeHighlightDecorations = class RangeHighlightDecorations extends Disposable {
    static { RangeHighlightDecorations_1 = this; }
    constructor(editorService) {
        super();
        this.editorService = editorService;
        this._onHighlightRemoved = this._register(new Emitter());
        this.onHighlightRemoved = this._onHighlightRemoved.event;
        this.rangeHighlightDecorationId = null;
        this.editor = null;
        this.editorDisposables = this._register(new DisposableStore());
    }
    removeHighlightRange() {
        if (this.editor && this.rangeHighlightDecorationId) {
            const decorationId = this.rangeHighlightDecorationId;
            this.editor.changeDecorations((accessor) => {
                accessor.removeDecoration(decorationId);
            });
            this._onHighlightRemoved.fire();
        }
        this.rangeHighlightDecorationId = null;
    }
    highlightRange(range, editor) {
        editor = editor ?? this.getEditor(range);
        if (isCodeEditor(editor)) {
            this.doHighlightRange(editor, range);
        }
        else if (isCompositeEditor(editor) && isCodeEditor(editor.activeCodeEditor)) {
            this.doHighlightRange(editor.activeCodeEditor, range);
        }
    }
    doHighlightRange(editor, selectionRange) {
        this.removeHighlightRange();
        editor.changeDecorations((changeAccessor) => {
            this.rangeHighlightDecorationId = changeAccessor.addDecoration(selectionRange.range, this.createRangeHighlightDecoration(selectionRange.isWholeLine));
        });
        this.setEditor(editor);
    }
    getEditor(resourceRange) {
        const resource = this.editorService.activeEditor?.resource;
        if (resource && isEqual(resource, resourceRange.resource) && isCodeEditor(this.editorService.activeTextEditorControl)) {
            return this.editorService.activeTextEditorControl;
        }
        return undefined;
    }
    setEditor(editor) {
        if (this.editor !== editor) {
            this.editorDisposables.clear();
            this.editor = editor;
            this.editorDisposables.add(this.editor.onDidChangeCursorPosition((e) => {
                if (e.reason === 0
                    || e.reason === 3
                    || e.reason === 5
                    || e.reason === 6) {
                    this.removeHighlightRange();
                }
            }));
            this.editorDisposables.add(this.editor.onDidChangeModel(() => { this.removeHighlightRange(); }));
            this.editorDisposables.add(this.editor.onDidDispose(() => {
                this.removeHighlightRange();
                this.editor = null;
            }));
        }
    }
    static { this._WHOLE_LINE_RANGE_HIGHLIGHT = ModelDecorationOptions.register({
        description: 'codeeditor-range-highlight-whole',
        stickiness: 1,
        className: 'rangeHighlight',
        isWholeLine: true
    }); }
    static { this._RANGE_HIGHLIGHT = ModelDecorationOptions.register({
        description: 'codeeditor-range-highlight',
        stickiness: 1,
        className: 'rangeHighlight'
    }); }
    createRangeHighlightDecoration(isWholeLine = true) {
        return (isWholeLine ? RangeHighlightDecorations_1._WHOLE_LINE_RANGE_HIGHLIGHT : RangeHighlightDecorations_1._RANGE_HIGHLIGHT);
    }
    dispose() {
        super.dispose();
        if (this.editor?.getModel()) {
            this.removeHighlightRange();
            this.editor = null;
        }
    }
};
RangeHighlightDecorations = RangeHighlightDecorations_1 = __decorate([
    __param(0, IEditorService),
    __metadata("design:paramtypes", [Object])
], RangeHighlightDecorations);
export { RangeHighlightDecorations };
let FloatingEditorClickWidget = class FloatingEditorClickWidget extends FloatingClickWidget {
    constructor(editor, label, keyBindingAction, keybindingService) {
        super(keyBindingAction && keybindingService.lookupKeybinding(keyBindingAction)
            ? `${label} (${keybindingService.lookupKeybinding(keyBindingAction).getLabel()})`
            : label);
        this.editor = editor;
    }
    getId() {
        return 'editor.overlayWidget.floatingClickWidget';
    }
    getPosition() {
        return {
            preference: 1
        };
    }
    render() {
        super.render();
        this.editor.addOverlayWidget(this);
    }
    dispose() {
        this.editor.removeOverlayWidget(this);
        super.dispose();
    }
};
FloatingEditorClickWidget = __decorate([
    __param(3, IKeybindingService),
    __metadata("design:paramtypes", [Object, String, Object, Object])
], FloatingEditorClickWidget);
export { FloatingEditorClickWidget };
let FloatingEditorClickMenu = class FloatingEditorClickMenu extends AbstractFloatingClickMenu {
    static { this.ID = 'editor.contrib.floatingClickMenu'; }
    constructor(editor, instantiationService, menuService, contextKeyService) {
        super(MenuId.EditorContent, menuService, contextKeyService);
        this.editor = editor;
        this.instantiationService = instantiationService;
        this.render();
    }
    createWidget(action) {
        return this.instantiationService.createInstance(FloatingEditorClickWidget, this.editor, action.label, action.id);
    }
    isVisible() {
        return !(this.editor instanceof EmbeddedCodeEditorWidget) && this.editor?.hasModel() && !this.editor.getOption(63);
    }
    getActionArg() {
        return this.editor.getModel()?.uri;
    }
};
FloatingEditorClickMenu = __decorate([
    __param(1, IInstantiationService),
    __param(2, IMenuService),
    __param(3, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], FloatingEditorClickMenu);
export { FloatingEditorClickMenu };
