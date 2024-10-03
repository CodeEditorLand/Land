import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IWorkingCopyFileService } from '../../services/workingCopy/common/workingCopyFileService.js';
export declare class SaveParticipant {
    private readonly workingCopyFileService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, workingCopyFileService: IWorkingCopyFileService);
    dispose(): void;
}
