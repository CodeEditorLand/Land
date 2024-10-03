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
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { basename } from '../../../../../base/common/path.js';
import { isWindows } from '../../../../../base/common/platform.js';
import { localize } from '../../../../../nls.js';
import { IExtensionManagementService } from '../../../../../platform/extensionManagement/common/extensionManagement.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, NeverShowAgainScope, Severity } from '../../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { registerWorkbenchContribution2 } from '../../../../common/contributions.js';
import { InstallRecommendedExtensionAction } from '../../../extensions/browser/extensionsActions.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
let TerminalWslRecommendationContribution = class TerminalWslRecommendationContribution extends Disposable {
    static { this.ID = 'terminalWslRecommendation'; }
    constructor(instantiationService, productService, notificationService, extensionManagementService, terminalService) {
        super();
        if (!isWindows) {
            return;
        }
        const exeBasedExtensionTips = productService.exeBasedExtensionTips;
        if (!exeBasedExtensionTips || !exeBasedExtensionTips.wsl) {
            return;
        }
        let listener = terminalService.onDidCreateInstance(async (instance) => {
            async function isExtensionInstalled(id) {
                const extensions = await extensionManagementService.getInstalled();
                return extensions.some(e => e.identifier.id === id);
            }
            if (!instance.shellLaunchConfig.executable || basename(instance.shellLaunchConfig.executable).toLowerCase() !== 'wsl.exe') {
                return;
            }
            listener?.dispose();
            listener = undefined;
            const extId = Object.keys(exeBasedExtensionTips.wsl.recommendations).find(extId => exeBasedExtensionTips.wsl.recommendations[extId].important);
            if (!extId || await isExtensionInstalled(extId)) {
                return;
            }
            notificationService.prompt(Severity.Info, localize('useWslExtension.title', "The '{0}' extension is recommended for opening a terminal in WSL.", exeBasedExtensionTips.wsl.friendlyName), [
                {
                    label: localize('install', 'Install'),
                    run: () => {
                        instantiationService.createInstance(InstallRecommendedExtensionAction, extId).run();
                    }
                }
            ], {
                sticky: true,
                neverShowAgain: { id: 'terminalConfigHelper/launchRecommendationsIgnore', scope: NeverShowAgainScope.APPLICATION },
                onCancel: () => { }
            });
        });
    }
};
TerminalWslRecommendationContribution = __decorate([
    __param(0, IInstantiationService),
    __param(1, IProductService),
    __param(2, INotificationService),
    __param(3, IExtensionManagementService),
    __param(4, ITerminalService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TerminalWslRecommendationContribution);
export { TerminalWslRecommendationContribution };
registerWorkbenchContribution2(TerminalWslRecommendationContribution.ID, TerminalWslRecommendationContribution, 4);
