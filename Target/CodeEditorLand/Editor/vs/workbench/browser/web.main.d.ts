import { Disposable } from '../../base/common/lifecycle.js';
import { IWorkbenchConstructionOptions, IWorkbench } from './web.api.js';
export declare class BrowserMain extends Disposable {
    private readonly domElement;
    private readonly configuration;
    private readonly onWillShutdownDisposables;
    private readonly indexedDBFileSystemProviders;
    constructor(domElement: HTMLElement, configuration: IWorkbenchConstructionOptions);
    private init;
    open(): Promise<IWorkbench>;
    private registerListeners;
    private initServices;
    private initializeUserData;
    private registerIndexedDBFileSystemProviders;
    private registerDeveloperActions;
    private createStorageService;
    private createWorkspaceService;
    private getCurrentProfile;
    private resolveWorkspace;
}
