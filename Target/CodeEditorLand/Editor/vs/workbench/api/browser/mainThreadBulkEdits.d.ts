import { VSBuffer } from '../../../base/common/buffer.js';
import { IBulkEditService } from '../../../editor/browser/services/bulkEditService.js';
import { WorkspaceEdit } from '../../../editor/common/languages.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceEditDto, MainThreadBulkEditsShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
export declare class MainThreadBulkEdits implements MainThreadBulkEditsShape {
    private readonly _bulkEditService;
    private readonly _logService;
    private readonly _uriIdentService;
    constructor(_extHostContext: IExtHostContext, _bulkEditService: IBulkEditService, _logService: ILogService, _uriIdentService: IUriIdentityService);
    dispose(): void;
    $tryApplyWorkspaceEdit(dto: SerializableObjectWithBuffers<IWorkspaceEditDto>, undoRedoGroupId?: number, isRefactoring?: boolean): Promise<boolean>;
}
export declare function reviveWorkspaceEditDto(data: IWorkspaceEditDto, uriIdentityService: IUriIdentityService, resolveDataTransferFile?: (id: string) => Promise<VSBuffer>): WorkspaceEdit;
export declare function reviveWorkspaceEditDto(data: IWorkspaceEditDto | undefined, uriIdentityService: IUriIdentityService, resolveDataTransferFile?: (id: string) => Promise<VSBuffer>): WorkspaceEdit | undefined;
