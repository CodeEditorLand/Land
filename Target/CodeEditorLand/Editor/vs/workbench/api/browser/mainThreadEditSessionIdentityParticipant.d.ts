import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IEditSessionIdentityService } from '../../../platform/workspace/common/editSessions.js';
export declare class EditSessionIdentityCreateParticipant {
    private readonly _editSessionIdentityService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _editSessionIdentityService: IEditSessionIdentityService);
    dispose(): void;
}
