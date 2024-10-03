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
import { Emitter } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { IEditorService } from '../../editor/common/editorService.js';
export const IWorkingCopyEditorService = createDecorator('workingCopyEditorService');
let WorkingCopyEditorService = class WorkingCopyEditorService extends Disposable {
    constructor(editorService) {
        super();
        this.editorService = editorService;
        this._onDidRegisterHandler = this._register(new Emitter());
        this.onDidRegisterHandler = this._onDidRegisterHandler.event;
        this.handlers = new Set();
    }
    registerHandler(handler) {
        this.handlers.add(handler);
        this._onDidRegisterHandler.fire(handler);
        return toDisposable(() => this.handlers.delete(handler));
    }
    findEditor(workingCopy) {
        for (const editorIdentifier of this.editorService.getEditors(0)) {
            if (this.isOpen(workingCopy, editorIdentifier.editor)) {
                return editorIdentifier;
            }
        }
        return undefined;
    }
    isOpen(workingCopy, editor) {
        for (const handler of this.handlers) {
            if (handler.isOpen(workingCopy, editor)) {
                return true;
            }
        }
        return false;
    }
};
WorkingCopyEditorService = __decorate([
    __param(0, IEditorService),
    __metadata("design:paramtypes", [Object])
], WorkingCopyEditorService);
export { WorkingCopyEditorService };
registerSingleton(IWorkingCopyEditorService, WorkingCopyEditorService, 1);
