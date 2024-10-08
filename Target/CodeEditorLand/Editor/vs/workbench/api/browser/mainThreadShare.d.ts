import { IDocumentFilterDto, MainThreadShareShape } from '../common/extHost.protocol.js';
import { IShareService } from '../../contrib/share/common/share.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadShare implements MainThreadShareShape {
    private readonly shareService;
    private readonly proxy;
    private providers;
    private providerDisposables;
    constructor(extHostContext: IExtHostContext, shareService: IShareService);
    $registerShareProvider(handle: number, selector: IDocumentFilterDto[], id: string, label: string, priority: number): void;
    $unregisterShareProvider(handle: number): void;
    dispose(): void;
}
