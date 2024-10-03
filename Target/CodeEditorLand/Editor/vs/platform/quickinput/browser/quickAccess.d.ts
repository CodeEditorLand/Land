import { Disposable } from '../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { IQuickAccessController, IQuickAccessOptions } from '../common/quickAccess.js';
import { IQuickInputService, IQuickPickItem } from '../common/quickInput.js';
export declare class QuickAccessController extends Disposable implements IQuickAccessController {
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly registry;
    private readonly mapProviderToDescriptor;
    private readonly lastAcceptedPickerValues;
    private visibleQuickAccess;
    constructor(quickInputService: IQuickInputService, instantiationService: IInstantiationService);
    pick(value?: string, options?: IQuickAccessOptions): Promise<IQuickPickItem[] | undefined>;
    show(value?: string, options?: IQuickAccessOptions): void;
    private doShowOrPick;
    private adjustValueSelection;
    private registerPickerListeners;
    private getOrInstantiateProvider;
}
