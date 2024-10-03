import { Disposable } from '../../../base/common/lifecycle.js';
import { MainThreadProfileContentHandlersShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IUserDataProfileImportExportService } from '../../services/userDataProfile/common/userDataProfile.js';
export declare class MainThreadProfileContentHandlers extends Disposable implements MainThreadProfileContentHandlersShape {
    private readonly userDataProfileImportExportService;
    private readonly proxy;
    private readonly registeredHandlers;
    constructor(context: IExtHostContext, userDataProfileImportExportService: IUserDataProfileImportExportService);
    $registerProfileContentHandler(id: string, name: string, description: string | undefined, extensionId: string): Promise<void>;
    $unregisterProfileContentHandler(id: string): Promise<void>;
}
