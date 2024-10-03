import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export interface IAccessibleViewInformationService {
    _serviceBrand: undefined;
    hasShownAccessibleView(viewId: string): boolean;
}
export declare const IAccessibleViewInformationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAccessibleViewInformationService>;
export declare class AccessibleViewInformationService extends Disposable implements IAccessibleViewInformationService {
    private readonly _storageService;
    readonly _serviceBrand: undefined;
    constructor(_storageService: IStorageService);
    hasShownAccessibleView(viewId: string): boolean;
}
