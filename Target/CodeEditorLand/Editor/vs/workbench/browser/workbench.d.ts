import './style.js';
import { Event } from '../../base/common/event.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../platform/instantiation/common/serviceCollection.js';
import { WillShutdownEvent } from '../services/lifecycle/common/lifecycle.js';
import { ILogService } from '../../platform/log/common/log.js';
import { Layout } from './layout.js';
export interface IWorkbenchOptions {
    /**
     * Extra classes to be added to the workbench container.
     */
    extraClasses?: string[];
}
export declare class Workbench extends Layout {
    private readonly options;
    private readonly serviceCollection;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<WillShutdownEvent>;
    private readonly _onDidShutdown;
    readonly onDidShutdown: Event<void>;
    constructor(parent: HTMLElement, options: IWorkbenchOptions | undefined, serviceCollection: ServiceCollection, logService: ILogService);
    private registerErrorHandler;
    private previousUnexpectedError;
    private handleUnexpectedError;
    startup(): IInstantiationService;
    private initServices;
    private registerListeners;
    private fontAliasing;
    private updateFontAliasing;
    private restoreFontInfo;
    private storeFontInfo;
    private renderWorkbench;
    private createPart;
    private createNotificationsHandlers;
    private restore;
}
