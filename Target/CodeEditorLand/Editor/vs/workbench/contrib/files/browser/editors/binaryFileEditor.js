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
var BinaryFileEditor_1;
import { localize } from '../../../../../nls.js';
import { BaseBinaryResourceEditor } from '../../../../browser/parts/editor/binaryEditor.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { FileEditorInput } from './fileEditorInput.js';
import { BINARY_FILE_EDITOR_ID, BINARY_TEXT_FILE_MODE } from '../../common/files.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { EditorResolution } from '../../../../../platform/editor/common/editor.js';
import { IEditorResolverService } from '../../../../services/editor/common/editorResolverService.js';
import { isEditorInputWithOptions } from '../../../../common/editor.js';
import { DiffEditorInput } from '../../../../common/editor/diffEditorInput.js';
let BinaryFileEditor = class BinaryFileEditor extends BaseBinaryResourceEditor {
    static { BinaryFileEditor_1 = this; }
    static { this.ID = BINARY_FILE_EDITOR_ID; }
    constructor(group, telemetryService, themeService, editorResolverService, storageService) {
        super(BinaryFileEditor_1.ID, group, {
            openInternal: (input, options) => this.openInternal(input, options)
        }, telemetryService, themeService, storageService);
        this.editorResolverService = editorResolverService;
    }
    async openInternal(input, options) {
        if (input instanceof FileEditorInput && this.group.activeEditor) {
            const activeEditor = this.group.activeEditor;
            const untypedActiveEditor = activeEditor?.toUntyped();
            if (!untypedActiveEditor) {
                return;
            }
            let resolvedEditor = await this.editorResolverService.resolveEditor({
                ...untypedActiveEditor,
                options: {
                    ...options,
                    override: EditorResolution.PICK
                }
            }, this.group);
            if (resolvedEditor === 2) {
                resolvedEditor = undefined;
            }
            else if (resolvedEditor === 1) {
                return;
            }
            if (isEditorInputWithOptions(resolvedEditor)) {
                for (const editor of resolvedEditor.editor instanceof DiffEditorInput ? [resolvedEditor.editor.original, resolvedEditor.editor.modified] : [resolvedEditor.editor]) {
                    if (editor instanceof FileEditorInput) {
                        editor.setForceOpenAsText();
                        editor.setPreferredLanguageId(BINARY_TEXT_FILE_MODE);
                    }
                }
            }
            await this.group.replaceEditors([{
                    editor: activeEditor,
                    replacement: resolvedEditor?.editor ?? input,
                    options: {
                        ...resolvedEditor?.options ?? options
                    }
                }]);
        }
    }
    getTitle() {
        return this.input ? this.input.getName() : localize('binaryFileEditor', "Binary File Viewer");
    }
};
BinaryFileEditor = BinaryFileEditor_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IThemeService),
    __param(3, IEditorResolverService),
    __param(4, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], BinaryFileEditor);
export { BinaryFileEditor };
