import { URI } from '../../../../base/common/uri.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IQuickDiffService, QuickDiff, QuickDiffProvider } from './quickDiff.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
export declare class QuickDiffService extends Disposable implements IQuickDiffService {
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private quickDiffProviders;
    private readonly _onDidChangeQuickDiffProviders;
    readonly onDidChangeQuickDiffProviders: import("../../../workbench.web.main.internal.js").Event<void>;
    constructor(uriIdentityService: IUriIdentityService);
    addQuickDiffProvider(quickDiff: QuickDiffProvider): IDisposable;
    private isQuickDiff;
    getQuickDiffs(uri: URI, language?: string, isSynchronized?: boolean): Promise<QuickDiff[]>;
}
