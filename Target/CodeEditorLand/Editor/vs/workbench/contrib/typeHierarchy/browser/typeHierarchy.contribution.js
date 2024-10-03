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
var TypeHierarchyController_1;
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { EditorAction2, registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { Range } from '../../../../editor/common/core/range.js';
import { PeekContext } from '../../../../editor/contrib/peekView/browser/peekView.js';
import { localize, localize2 } from '../../../../nls.js';
import { MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { TypeHierarchyTreePeekWidget } from './typeHierarchyPeek.js';
import { TypeHierarchyModel, TypeHierarchyProviderRegistry } from '../common/typeHierarchy.js';
const _ctxHasTypeHierarchyProvider = new RawContextKey('editorHasTypeHierarchyProvider', false, localize('editorHasTypeHierarchyProvider', 'Whether a type hierarchy provider is available'));
const _ctxTypeHierarchyVisible = new RawContextKey('typeHierarchyVisible', false, localize('typeHierarchyVisible', 'Whether type hierarchy peek is currently showing'));
const _ctxTypeHierarchyDirection = new RawContextKey('typeHierarchyDirection', undefined, { type: 'string', description: localize('typeHierarchyDirection', 'whether type hierarchy shows super types or subtypes') });
function sanitizedDirection(candidate) {
    return candidate === "subtypes" || candidate === "supertypes"
        ? candidate
        : "subtypes";
}
let TypeHierarchyController = class TypeHierarchyController {
    static { TypeHierarchyController_1 = this; }
    static { this.Id = 'typeHierarchy'; }
    static get(editor) {
        return editor.getContribution(TypeHierarchyController_1.Id);
    }
    static { this._storageDirectionKey = 'typeHierarchy/defaultDirection'; }
    constructor(_editor, _contextKeyService, _storageService, _editorService, _instantiationService) {
        this._editor = _editor;
        this._contextKeyService = _contextKeyService;
        this._storageService = _storageService;
        this._editorService = _editorService;
        this._instantiationService = _instantiationService;
        this._disposables = new DisposableStore();
        this._sessionDisposables = new DisposableStore();
        this._ctxHasProvider = _ctxHasTypeHierarchyProvider.bindTo(this._contextKeyService);
        this._ctxIsVisible = _ctxTypeHierarchyVisible.bindTo(this._contextKeyService);
        this._ctxDirection = _ctxTypeHierarchyDirection.bindTo(this._contextKeyService);
        this._disposables.add(Event.any(_editor.onDidChangeModel, _editor.onDidChangeModelLanguage, TypeHierarchyProviderRegistry.onDidChange)(() => {
            this._ctxHasProvider.set(_editor.hasModel() && TypeHierarchyProviderRegistry.has(_editor.getModel()));
        }));
        this._disposables.add(this._sessionDisposables);
    }
    dispose() {
        this._disposables.dispose();
    }
    async startTypeHierarchyFromEditor() {
        this._sessionDisposables.clear();
        if (!this._editor.hasModel()) {
            return;
        }
        const document = this._editor.getModel();
        const position = this._editor.getPosition();
        if (!TypeHierarchyProviderRegistry.has(document)) {
            return;
        }
        const cts = new CancellationTokenSource();
        const model = TypeHierarchyModel.create(document, position, cts.token);
        const direction = sanitizedDirection(this._storageService.get(TypeHierarchyController_1._storageDirectionKey, 0, "subtypes"));
        this._showTypeHierarchyWidget(position, direction, model, cts);
    }
    _showTypeHierarchyWidget(position, direction, model, cts) {
        this._ctxIsVisible.set(true);
        this._ctxDirection.set(direction);
        Event.any(this._editor.onDidChangeModel, this._editor.onDidChangeModelLanguage)(this.endTypeHierarchy, this, this._sessionDisposables);
        this._widget = this._instantiationService.createInstance(TypeHierarchyTreePeekWidget, this._editor, position, direction);
        this._widget.showLoading();
        this._sessionDisposables.add(this._widget.onDidClose(() => {
            this.endTypeHierarchy();
            this._storageService.store(TypeHierarchyController_1._storageDirectionKey, this._widget.direction, 0, 0);
        }));
        this._sessionDisposables.add({ dispose() { cts.dispose(true); } });
        this._sessionDisposables.add(this._widget);
        model.then(model => {
            if (cts.token.isCancellationRequested) {
                return;
            }
            if (model) {
                this._sessionDisposables.add(model);
                this._widget.showModel(model);
            }
            else {
                this._widget.showMessage(localize('no.item', "No results"));
            }
        }).catch(err => {
            if (isCancellationError(err)) {
                this.endTypeHierarchy();
                return;
            }
            this._widget.showMessage(localize('error', "Failed to show type hierarchy"));
        });
    }
    async startTypeHierarchyFromTypeHierarchy() {
        if (!this._widget) {
            return;
        }
        const model = this._widget.getModel();
        const typeItem = this._widget.getFocused();
        if (!typeItem || !model) {
            return;
        }
        const newEditor = await this._editorService.openCodeEditor({ resource: typeItem.item.uri }, this._editor);
        if (!newEditor) {
            return;
        }
        const newModel = model.fork(typeItem.item);
        this._sessionDisposables.clear();
        TypeHierarchyController_1.get(newEditor)?._showTypeHierarchyWidget(Range.lift(newModel.root.selectionRange).getStartPosition(), this._widget.direction, Promise.resolve(newModel), new CancellationTokenSource());
    }
    showSupertypes() {
        this._widget?.updateDirection("supertypes");
        this._ctxDirection.set("supertypes");
    }
    showSubtypes() {
        this._widget?.updateDirection("subtypes");
        this._ctxDirection.set("subtypes");
    }
    endTypeHierarchy() {
        this._sessionDisposables.clear();
        this._ctxIsVisible.set(false);
        this._editor.focus();
    }
};
TypeHierarchyController = TypeHierarchyController_1 = __decorate([
    __param(1, IContextKeyService),
    __param(2, IStorageService),
    __param(3, ICodeEditorService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TypeHierarchyController);
registerEditorContribution(TypeHierarchyController.Id, TypeHierarchyController, 0);
registerAction2(class PeekTypeHierarchyAction extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.showTypeHierarchy',
            title: localize2('title', 'Peek Type Hierarchy'),
            menu: {
                id: MenuId.EditorContextPeek,
                group: 'navigation',
                order: 1000,
                when: ContextKeyExpr.and(_ctxHasTypeHierarchyProvider, PeekContext.notInPeekEditor),
            },
            precondition: ContextKeyExpr.and(_ctxHasTypeHierarchyProvider, PeekContext.notInPeekEditor),
            f1: true
        });
    }
    async runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.startTypeHierarchyFromEditor();
    }
});
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.showSupertypes',
            title: localize2('title.supertypes', 'Show Supertypes'),
            icon: Codicon.typeHierarchySuper,
            precondition: ContextKeyExpr.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("subtypes")),
            keybinding: {
                weight: 200,
                primary: 1024 + 512 + 38,
            },
            menu: {
                id: TypeHierarchyTreePeekWidget.TitleMenu,
                when: _ctxTypeHierarchyDirection.isEqualTo("subtypes"),
                order: 1,
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.showSupertypes();
    }
});
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.showSubtypes',
            title: localize2('title.subtypes', 'Show Subtypes'),
            icon: Codicon.typeHierarchySub,
            precondition: ContextKeyExpr.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("supertypes")),
            keybinding: {
                weight: 200,
                primary: 1024 + 512 + 38,
            },
            menu: {
                id: TypeHierarchyTreePeekWidget.TitleMenu,
                when: _ctxTypeHierarchyDirection.isEqualTo("supertypes"),
                order: 1,
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.showSubtypes();
    }
});
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.refocusTypeHierarchy',
            title: localize2('title.refocusTypeHierarchy', 'Refocus Type Hierarchy'),
            precondition: _ctxTypeHierarchyVisible,
            keybinding: {
                weight: 200,
                primary: 1024 + 3
            }
        });
    }
    async runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.startTypeHierarchyFromTypeHierarchy();
    }
});
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.closeTypeHierarchy',
            title: localize('close', 'Close'),
            icon: Codicon.close,
            precondition: _ctxTypeHierarchyVisible,
            keybinding: {
                weight: 200 + 10,
                primary: 9,
                when: ContextKeyExpr.not('config.editor.stablePeek')
            },
            menu: {
                id: TypeHierarchyTreePeekWidget.TitleMenu,
                order: 1000
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.endTypeHierarchy();
    }
});
