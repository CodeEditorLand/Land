import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
export declare class ContributedExternalUriOpenersStore extends Disposable {
    private readonly _extensionService;
    private static readonly STORAGE_ID;
    private readonly _openers;
    private readonly _memento;
    private _mementoObject;
    constructor(storageService: IStorageService, _extensionService: IExtensionService);
    didRegisterOpener(id: string, extensionId: string): void;
    private add;
    delete(id: string): void;
    private invalidateOpenersOnExtensionsChanged;
    private updateSchema;
}
