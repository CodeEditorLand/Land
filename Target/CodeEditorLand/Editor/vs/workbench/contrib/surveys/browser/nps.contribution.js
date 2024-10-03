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
import * as nls from '../../../../nls.js';
import { language } from '../../../../base/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Severity, INotificationService, NotificationPriority } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { URI } from '../../../../base/common/uri.js';
import { platform } from '../../../../base/common/process.js';
const PROBABILITY = 0.15;
const SESSION_COUNT_KEY = 'nps/sessionCount';
const LAST_SESSION_DATE_KEY = 'nps/lastSessionDate';
const SKIP_VERSION_KEY = 'nps/skipVersion';
const IS_CANDIDATE_KEY = 'nps/isCandidate';
let NPSContribution = class NPSContribution {
    constructor(storageService, notificationService, telemetryService, openerService, productService) {
        if (!productService.npsSurveyUrl) {
            return;
        }
        const skipVersion = storageService.get(SKIP_VERSION_KEY, -1, '');
        if (skipVersion) {
            return;
        }
        const date = new Date().toDateString();
        const lastSessionDate = storageService.get(LAST_SESSION_DATE_KEY, -1, new Date(0).toDateString());
        if (date === lastSessionDate) {
            return;
        }
        const sessionCount = (storageService.getNumber(SESSION_COUNT_KEY, -1, 0) || 0) + 1;
        storageService.store(LAST_SESSION_DATE_KEY, date, -1, 0);
        storageService.store(SESSION_COUNT_KEY, sessionCount, -1, 0);
        if (sessionCount < 9) {
            return;
        }
        const isCandidate = storageService.getBoolean(IS_CANDIDATE_KEY, -1, false)
            || Math.random() < PROBABILITY;
        storageService.store(IS_CANDIDATE_KEY, isCandidate, -1, 0);
        if (!isCandidate) {
            storageService.store(SKIP_VERSION_KEY, productService.version, -1, 0);
            return;
        }
        notificationService.prompt(Severity.Info, nls.localize('surveyQuestion', "Do you mind taking a quick feedback survey?"), [{
                label: nls.localize('takeSurvey', "Take Survey"),
                run: () => {
                    openerService.open(URI.parse(`${productService.npsSurveyUrl}?o=${encodeURIComponent(platform)}&v=${encodeURIComponent(productService.version)}&m=${encodeURIComponent(telemetryService.machineId)}`));
                    storageService.store(IS_CANDIDATE_KEY, false, -1, 0);
                    storageService.store(SKIP_VERSION_KEY, productService.version, -1, 0);
                }
            }, {
                label: nls.localize('remindLater', "Remind Me Later"),
                run: () => storageService.store(SESSION_COUNT_KEY, sessionCount - 3, -1, 0)
            }, {
                label: nls.localize('neverAgain', "Don't Show Again"),
                run: () => {
                    storageService.store(IS_CANDIDATE_KEY, false, -1, 0);
                    storageService.store(SKIP_VERSION_KEY, productService.version, -1, 0);
                }
            }], { sticky: true, priority: NotificationPriority.URGENT });
    }
};
NPSContribution = __decorate([
    __param(0, IStorageService),
    __param(1, INotificationService),
    __param(2, ITelemetryService),
    __param(3, IOpenerService),
    __param(4, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], NPSContribution);
if (language === 'en') {
    const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(NPSContribution, 3);
}
