import { CancellationToken } from '../../../base/common/cancellation.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILayoutService } from '../../layout/browser/layoutService.js';
import { IQuickAccessController } from '../common/quickAccess.js';
import { IInputBox, IInputOptions, IKeyMods, IPickOptions, IQuickInputButton, IQuickInputService, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, IQuickWidget, QuickPickInput } from '../common/quickInput.js';
import { IThemeService, Themable } from '../../theme/common/themeService.js';
import { IQuickInputOptions } from './quickInput.js';
import { QuickInputController, IQuickInputControllerHost } from './quickInputController.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
export declare class QuickInputService extends Themable implements IQuickInputService {
    private readonly instantiationService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly layoutService: ILayoutService;
    protected readonly configurationService: IConfigurationService;
    readonly _serviceBrand: undefined;
    get backButton(): IQuickInputButton;
    private readonly _onShow;
    readonly onShow: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    private readonly _onHide;
    readonly onHide: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    private _controller;
    private get controller();
    private get hasController();
    get currentQuickInput(): import("../common/quickInput.js").IQuickInput | undefined;
    private _quickAccess;
    get quickAccess(): IQuickAccessController;
    private readonly contexts;
    constructor(instantiationService: IInstantiationService, contextKeyService: IContextKeyService, themeService: IThemeService, layoutService: ILayoutService, configurationService: IConfigurationService);
    protected createController(host?: IQuickInputControllerHost, options?: Partial<IQuickInputOptions>): QuickInputController;
    private setContextKey;
    private resetContextKeys;
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: O, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
    createQuickPick<T extends IQuickPickItem>(options: {
        useSeparators: true;
    }): IQuickPick<T, {
        useSeparators: true;
    }>;
    createQuickPick<T extends IQuickPickItem>(options?: {
        useSeparators: boolean;
    }): IQuickPick<T, {
        useSeparators: false;
    }>;
    createInputBox(): IInputBox;
    createQuickWidget(): IQuickWidget;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    accept(keyMods?: IKeyMods): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
    updateStyles(): void;
    private computeStyles;
}
