import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILanguagePackItem } from '../../../../platform/languagePacks/common/languagePacks.js';
import { ILocaleService } from '../common/locale.js';
import { IHostService } from '../../host/browser/host.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare class WebLocaleService implements ILocaleService {
    private readonly dialogService;
    private readonly hostService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(dialogService: IDialogService, hostService: IHostService, productService: IProductService);
    setLocale(languagePackItem: ILanguagePackItem, _skipDialog?: boolean): Promise<void>;
    clearLocalePreference(): Promise<void>;
}
