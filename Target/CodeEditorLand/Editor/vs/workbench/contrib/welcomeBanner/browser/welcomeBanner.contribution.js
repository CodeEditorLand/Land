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
var WelcomeBannerContribution_1;
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { IBannerService } from '../../../services/banner/browser/bannerService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { URI } from '../../../../base/common/uri.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
let WelcomeBannerContribution = class WelcomeBannerContribution {
    static { WelcomeBannerContribution_1 = this; }
    static { this.WELCOME_BANNER_DISMISSED_KEY = 'workbench.banner.welcome.dismissed'; }
    constructor(bannerService, storageService, environmentService) {
        const welcomeBanner = environmentService.options?.welcomeBanner;
        if (!welcomeBanner) {
            return;
        }
        if (storageService.getBoolean(WelcomeBannerContribution_1.WELCOME_BANNER_DISMISSED_KEY, 0, false)) {
            return;
        }
        let icon = undefined;
        if (typeof welcomeBanner.icon === 'string') {
            icon = ThemeIcon.fromId(welcomeBanner.icon);
        }
        else if (welcomeBanner.icon) {
            icon = URI.revive(welcomeBanner.icon);
        }
        bannerService.show({
            id: 'welcome.banner',
            message: welcomeBanner.message,
            icon,
            actions: welcomeBanner.actions,
            onClose: () => {
                storageService.store(WelcomeBannerContribution_1.WELCOME_BANNER_DISMISSED_KEY, true, 0, 1);
            }
        });
    }
};
WelcomeBannerContribution = WelcomeBannerContribution_1 = __decorate([
    __param(0, IBannerService),
    __param(1, IStorageService),
    __param(2, IBrowserWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object])
], WelcomeBannerContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WelcomeBannerContribution, 3);
