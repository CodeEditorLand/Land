var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Language, LANGUAGE_DEFAULT } from '../../../../base/common/platform.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IJSONEditingService } from '../../configuration/common/jsonEditing.js';
import { IActiveLanguagePackService, ILocaleService } from '../common/locale.js';
import { ILanguagePackService } from '../../../../platform/languagePacks/common/languagePacks.js';
import { IPaneCompositePartService } from '../../panecomposite/browser/panecomposite.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { localize } from '../../../../nls.js';
import { toAction } from '../../../../base/common/actions.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { parse } from '../../../../base/common/jsonc.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IHostService } from '../../host/browser/host.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
const EXTENSIONS_VIEWLET_ID = 'workbench.view.extensions';
let NativeLocaleService = class NativeLocaleService {
    constructor(jsonEditingService, environmentService, notificationService, languagePackService, paneCompositePartService, extensionManagementService, progressService, textFileService, editorService, dialogService, hostService, productService) {
        this.jsonEditingService = jsonEditingService;
        this.environmentService = environmentService;
        this.notificationService = notificationService;
        this.languagePackService = languagePackService;
        this.paneCompositePartService = paneCompositePartService;
        this.extensionManagementService = extensionManagementService;
        this.progressService = progressService;
        this.textFileService = textFileService;
        this.editorService = editorService;
        this.dialogService = dialogService;
        this.hostService = hostService;
        this.productService = productService;
    }
    async validateLocaleFile() {
        try {
            const content = await this.textFileService.read(this.environmentService.argvResource, { encoding: 'utf8' });
            parse(content.value);
        }
        catch (error) {
            this.notificationService.notify({
                severity: Severity.Error,
                message: localize('argvInvalid', 'Unable to write display language. Please open the runtime settings, correct errors/warnings in it and try again.'),
                actions: {
                    primary: [
                        toAction({
                            id: 'openArgv',
                            label: localize('openArgv', "Open Runtime Settings"),
                            run: () => this.editorService.openEditor({ resource: this.environmentService.argvResource })
                        })
                    ]
                }
            });
            return false;
        }
        return true;
    }
    async writeLocaleValue(locale) {
        if (!(await this.validateLocaleFile())) {
            return false;
        }
        await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['locale'], value: locale }], true);
        return true;
    }
    async setLocale(languagePackItem, skipDialog = false) {
        const locale = languagePackItem.id;
        if (locale === Language.value() || (!locale && Language.isDefaultVariant())) {
            return;
        }
        const installedLanguages = await this.languagePackService.getInstalledLanguages();
        try {
            if (!installedLanguages.some(installedLanguage => installedLanguage.id === languagePackItem.id)) {
                if (languagePackItem.galleryExtension?.publisher.toLowerCase() !== 'ms-ceintl') {
                    const viewlet = await this.paneCompositePartService.openPaneComposite(EXTENSIONS_VIEWLET_ID, 0);
                    (viewlet?.getViewPaneContainer()).search(`@id:${languagePackItem.extensionId}`);
                    return;
                }
                await this.progressService.withProgress({
                    location: 15,
                    title: localize('installing', "Installing {0} language support...", languagePackItem.label),
                }, progress => this.extensionManagementService.installFromGallery(languagePackItem.galleryExtension, {
                    isMachineScoped: false,
                }));
            }
            if (!skipDialog && !await this.showRestartDialog(languagePackItem.label)) {
                return;
            }
            await this.writeLocaleValue(locale);
            await this.hostService.restart();
        }
        catch (err) {
            this.notificationService.error(err);
        }
    }
    async clearLocalePreference() {
        try {
            await this.writeLocaleValue(undefined);
            if (!Language.isDefaultVariant()) {
                await this.showRestartDialog('English');
            }
        }
        catch (err) {
            this.notificationService.error(err);
        }
    }
    async showRestartDialog(languageName) {
        const { confirmed } = await this.dialogService.confirm({
            message: localize('restartDisplayLanguageMessage1', "Restart {0} to switch to {1}?", this.productService.nameLong, languageName),
            detail: localize('restartDisplayLanguageDetail1', "To change the display language to {0}, {1} needs to restart.", languageName, this.productService.nameLong),
            primaryButton: localize({ key: 'restart', comment: ['&& denotes a mnemonic character'] }, "&&Restart"),
        });
        return confirmed;
    }
};
NativeLocaleService = __decorate([
    __param(0, IJSONEditingService),
    __param(1, IEnvironmentService),
    __param(2, INotificationService),
    __param(3, ILanguagePackService),
    __param(4, IPaneCompositePartService),
    __param(5, IExtensionManagementService),
    __param(6, IProgressService),
    __param(7, ITextFileService),
    __param(8, IEditorService),
    __param(9, IDialogService),
    __param(10, IHostService),
    __param(11, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeLocaleService);
let NativeActiveLanguagePackService = class NativeActiveLanguagePackService {
    constructor(languagePackService) {
        this.languagePackService = languagePackService;
    }
    async getExtensionIdProvidingCurrentLocale() {
        const language = Language.value();
        if (language === LANGUAGE_DEFAULT) {
            return undefined;
        }
        const languages = await this.languagePackService.getInstalledLanguages();
        const languagePack = languages.find(l => l.id === language);
        return languagePack?.extensionId;
    }
};
NativeActiveLanguagePackService = __decorate([
    __param(0, ILanguagePackService),
    __metadata("design:paramtypes", [Object])
], NativeActiveLanguagePackService);
registerSingleton(ILocaleService, NativeLocaleService, 1);
registerSingleton(IActiveLanguagePackService, NativeActiveLanguagePackService, 1);
