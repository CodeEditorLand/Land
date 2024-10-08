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
import { decodeBase64 } from '../../../base/common/buffer.js';
import { revive } from '../../../base/common/marshalling.js';
import { IBulkEditService, ResourceFileEdit, ResourceTextEdit } from '../../../editor/browser/services/bulkEditService.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
import { MainContext } from '../common/extHost.protocol.js';
import { ResourceNotebookCellEdit } from '../../contrib/bulkEdit/browser/bulkCellEdits.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
let MainThreadBulkEdits = class MainThreadBulkEdits {
    constructor(_extHostContext, _bulkEditService, _logService, _uriIdentService) {
        this._bulkEditService = _bulkEditService;
        this._logService = _logService;
        this._uriIdentService = _uriIdentService;
    }
    dispose() { }
    $tryApplyWorkspaceEdit(dto, undoRedoGroupId, isRefactoring) {
        const edits = reviveWorkspaceEditDto(dto.value, this._uriIdentService);
        return this._bulkEditService.apply(edits, { undoRedoGroupId, respectAutoSaveConfig: isRefactoring }).then((res) => res.isApplied, err => {
            this._logService.warn(`IGNORING workspace edit: ${err}`);
            return false;
        });
    }
};
MainThreadBulkEdits = __decorate([
    extHostNamedCustomer(MainContext.MainThreadBulkEdits),
    __param(1, IBulkEditService),
    __param(2, ILogService),
    __param(3, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], MainThreadBulkEdits);
export { MainThreadBulkEdits };
export function reviveWorkspaceEditDto(data, uriIdentityService, resolveDataTransferFile) {
    if (!data || !data.edits) {
        return data;
    }
    const result = revive(data);
    for (const edit of result.edits) {
        if (ResourceTextEdit.is(edit)) {
            edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
        }
        if (ResourceFileEdit.is(edit)) {
            if (edit.options) {
                const inContents = edit.options?.contents;
                if (inContents) {
                    if (inContents.type === 'base64') {
                        edit.options.contents = Promise.resolve(decodeBase64(inContents.value));
                    }
                    else {
                        if (resolveDataTransferFile) {
                            edit.options.contents = resolveDataTransferFile(inContents.id);
                        }
                        else {
                            throw new Error('Could not revive data transfer file');
                        }
                    }
                }
            }
            edit.newResource = edit.newResource && uriIdentityService.asCanonicalUri(edit.newResource);
            edit.oldResource = edit.oldResource && uriIdentityService.asCanonicalUri(edit.oldResource);
        }
        if (ResourceNotebookCellEdit.is(edit)) {
            edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
            const cellEdit = edit.cellEdit;
            if (cellEdit.editType === 1 /* CellEditType.Replace */) {
                edit.cellEdit = {
                    ...cellEdit,
                    cells: cellEdit.cells.map(cell => ({
                        ...cell,
                        outputs: cell.outputs.map(output => ({
                            ...output,
                            outputs: output.items.map(item => {
                                return {
                                    mime: item.mime,
                                    data: item.valueBytes
                                };
                            })
                        }))
                    }))
                };
            }
        }
    }
    return data;
}
