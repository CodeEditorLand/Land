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
import { MainContext } from './extHost.protocol.js';
import { ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { WorkspaceEdit } from './extHostTypeConverters.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
let ExtHostBulkEdits = class ExtHostBulkEdits {
    constructor(extHostRpc, extHostDocumentsAndEditors) {
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadBulkEdits);
        this._versionInformationProvider = {
            getTextDocumentVersion: uri => extHostDocumentsAndEditors.getDocument(uri)?.version,
            getNotebookDocumentVersion: () => undefined
        };
    }
    applyWorkspaceEdit(edit, extension, metadata) {
        const dto = new SerializableObjectWithBuffers(WorkspaceEdit.from(edit, this._versionInformationProvider));
        return this._proxy.$tryApplyWorkspaceEdit(dto, undefined, metadata?.isRefactoring ?? false);
    }
};
ExtHostBulkEdits = __decorate([
    __param(0, IExtHostRpcService),
    __metadata("design:paramtypes", [Object, ExtHostDocumentsAndEditors])
], ExtHostBulkEdits);
export { ExtHostBulkEdits };
