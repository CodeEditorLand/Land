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
import { EditorModel } from './editorModel.js';
import { URI } from '../../../base/common/uri.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { Mimes } from '../../../base/common/mime.js';
let BinaryEditorModel = class BinaryEditorModel extends EditorModel {
    constructor(resource, name, fileService) {
        super();
        this.resource = resource;
        this.name = name;
        this.fileService = fileService;
        this.mime = Mimes.binary;
    }
    getName() {
        return this.name;
    }
    getSize() {
        return this.size;
    }
    getMime() {
        return this.mime;
    }
    getETag() {
        return this.etag;
    }
    async resolve() {
        if (this.fileService.hasProvider(this.resource)) {
            const stat = await this.fileService.stat(this.resource);
            this.etag = stat.etag;
            if (typeof stat.size === 'number') {
                this.size = stat.size;
            }
        }
        return super.resolve();
    }
};
BinaryEditorModel = __decorate([
    __param(2, IFileService),
    __metadata("design:paramtypes", [URI, String, Object])
], BinaryEditorModel);
export { BinaryEditorModel };
