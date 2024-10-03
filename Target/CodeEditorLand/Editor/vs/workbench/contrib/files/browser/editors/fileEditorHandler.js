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
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ITextEditorService } from '../../../../services/textfile/common/textEditorService.js';
import { isEqual } from '../../../../../base/common/resources.js';
import { NO_TYPE_ID } from '../../../../services/workingCopy/common/workingCopy.js';
import { IWorkingCopyEditorService } from '../../../../services/workingCopy/common/workingCopyEditorService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
export class FileEditorInputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(editorInput) {
        const fileEditorInput = editorInput;
        const resource = fileEditorInput.resource;
        const preferredResource = fileEditorInput.preferredResource;
        const serializedFileEditorInput = {
            resourceJSON: resource.toJSON(),
            preferredResourceJSON: isEqual(resource, preferredResource) ? undefined : preferredResource,
            name: fileEditorInput.getPreferredName(),
            description: fileEditorInput.getPreferredDescription(),
            encoding: fileEditorInput.getEncoding(),
            modeId: fileEditorInput.getPreferredLanguageId()
        };
        return JSON.stringify(serializedFileEditorInput);
    }
    deserialize(instantiationService, serializedEditorInput) {
        return instantiationService.invokeFunction(accessor => {
            const serializedFileEditorInput = JSON.parse(serializedEditorInput);
            const resource = URI.revive(serializedFileEditorInput.resourceJSON);
            const preferredResource = URI.revive(serializedFileEditorInput.preferredResourceJSON);
            const name = serializedFileEditorInput.name;
            const description = serializedFileEditorInput.description;
            const encoding = serializedFileEditorInput.encoding;
            const languageId = serializedFileEditorInput.modeId;
            const fileEditorInput = accessor.get(ITextEditorService).createTextEditor({ resource, label: name, description, encoding, languageId, forceFile: true });
            if (preferredResource) {
                fileEditorInput.setPreferredResource(preferredResource);
            }
            return fileEditorInput;
        });
    }
}
let FileEditorWorkingCopyEditorHandler = class FileEditorWorkingCopyEditorHandler extends Disposable {
    static { this.ID = 'workbench.contrib.fileEditorWorkingCopyEditorHandler'; }
    constructor(workingCopyEditorService, textEditorService, fileService) {
        super();
        this.textEditorService = textEditorService;
        this.fileService = fileService;
        this._register(workingCopyEditorService.registerHandler(this));
    }
    handles(workingCopy) {
        return workingCopy.typeId === NO_TYPE_ID && this.fileService.canHandleResource(workingCopy.resource);
    }
    handlesSync(workingCopy) {
        return workingCopy.typeId === NO_TYPE_ID && this.fileService.hasProvider(workingCopy.resource);
    }
    isOpen(workingCopy, editor) {
        if (!this.handlesSync(workingCopy)) {
            return false;
        }
        return isEqual(workingCopy.resource, editor.resource);
    }
    createEditor(workingCopy) {
        return this.textEditorService.createTextEditor({ resource: workingCopy.resource, forceFile: true });
    }
};
FileEditorWorkingCopyEditorHandler = __decorate([
    __param(0, IWorkingCopyEditorService),
    __param(1, ITextEditorService),
    __param(2, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object])
], FileEditorWorkingCopyEditorHandler);
export { FileEditorWorkingCopyEditorHandler };
