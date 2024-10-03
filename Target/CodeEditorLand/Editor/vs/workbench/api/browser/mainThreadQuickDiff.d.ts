import { UriComponents } from '../../../base/common/uri.js';
import { IDocumentFilterDto, MainThreadQuickDiffShape } from '../common/extHost.protocol.js';
import { IQuickDiffService } from '../../contrib/scm/common/quickDiff.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadQuickDiff implements MainThreadQuickDiffShape {
    private readonly quickDiffService;
    private readonly proxy;
    private providerDisposables;
    constructor(extHostContext: IExtHostContext, quickDiffService: IQuickDiffService);
    $registerQuickDiffProvider(handle: number, selector: IDocumentFilterDto[], label: string, rootUri: UriComponents | undefined): Promise<void>;
    $unregisterQuickDiffProvider(handle: number): Promise<void>;
    dispose(): void;
}
