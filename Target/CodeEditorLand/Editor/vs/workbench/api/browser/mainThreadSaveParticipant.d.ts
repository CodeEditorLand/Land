import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { ITextFileService } from '../../services/textfile/common/textfiles.js';
export declare class SaveParticipant {
    private readonly _textFileService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _textFileService: ITextFileService);
    dispose(): void;
}
