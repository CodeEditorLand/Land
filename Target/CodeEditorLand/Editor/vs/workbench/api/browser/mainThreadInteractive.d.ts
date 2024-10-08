import { MainThreadInteractiveShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IInteractiveDocumentService } from '../../contrib/interactive/browser/interactiveDocumentService.js';
export declare class MainThreadInteractive implements MainThreadInteractiveShape {
    private readonly _proxy;
    private readonly _disposables;
    constructor(extHostContext: IExtHostContext, interactiveDocumentService: IInteractiveDocumentService);
    dispose(): void;
}
