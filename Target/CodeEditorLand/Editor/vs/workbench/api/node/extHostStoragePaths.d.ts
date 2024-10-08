import { URI } from '../../../base/common/uri.js';
import { ExtensionStoragePaths as CommonExtensionStoragePaths } from '../common/extHostStoragePaths.js';
export declare class ExtensionStoragePaths extends CommonExtensionStoragePaths {
    private _workspaceStorageLock;
    protected _getWorkspaceStorageURI(storageName: string): Promise<URI>;
    onWillDeactivateAll(): void;
}
