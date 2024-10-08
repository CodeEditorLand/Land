import './media/bannerpart.css';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { Part } from '../../part.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IBannerItem, IBannerService } from '../../../services/banner/browser/bannerService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
export declare class BannerPart extends Part implements IBannerService {
    private readonly contextKeyService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    readonly height: number;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    private _onDidChangeSize;
    get onDidChange(): import("../../../workbench.web.main.internal").Event<{
        width: number;
        height: number;
    } | undefined>;
    private item;
    private readonly markdownRenderer;
    private visible;
    private actionBar;
    private messageActionsContainer;
    private focusedActionIndex;
    constructor(themeService: IThemeService, layoutService: IWorkbenchLayoutService, storageService: IStorageService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService);
    protected createContentArea(parent: HTMLElement): HTMLElement;
    private close;
    private focusActionLink;
    private getAriaLabel;
    private getBannerMessage;
    private setVisibility;
    focus(): void;
    focusNextAction(): void;
    focusPreviousAction(): void;
    hide(id: string): void;
    show(item: IBannerItem): void;
    toJSON(): object;
}
