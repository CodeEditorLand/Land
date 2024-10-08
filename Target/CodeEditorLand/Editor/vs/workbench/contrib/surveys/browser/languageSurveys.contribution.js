/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { localize } from '../../../../nls.js';
import { language } from '../../../../base/common/platform.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Severity, INotificationService } from '../../../../platform/notification/common/notification.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { URI } from '../../../../base/common/uri.js';
import { platform } from '../../../../base/common/process.js';
import { RunOnceWorker } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
class LanguageSurvey extends Disposable {
    constructor(data, storageService, notificationService, telemetryService, languageService, textFileService, openerService, productService) {
        super();
        const SESSION_COUNT_KEY = `${data.surveyId}.sessionCount`;
        const LAST_SESSION_DATE_KEY = `${data.surveyId}.lastSessionDate`;
        const SKIP_VERSION_KEY = `${data.surveyId}.skipVersion`;
        const IS_CANDIDATE_KEY = `${data.surveyId}.isCandidate`;
        const EDITED_LANGUAGE_COUNT_KEY = `${data.surveyId}.editedCount`;
        const EDITED_LANGUAGE_DATE_KEY = `${data.surveyId}.editedDate`;
        const skipVersion = storageService.get(SKIP_VERSION_KEY, -1 /* StorageScope.APPLICATION */, '');
        if (skipVersion) {
            return;
        }
        const date = new Date().toDateString();
        if (storageService.getNumber(EDITED_LANGUAGE_COUNT_KEY, -1 /* StorageScope.APPLICATION */, 0) < data.editCount) {
            // Process model-save event every 250ms to reduce load
            const onModelsSavedWorker = this._register(new RunOnceWorker(models => {
                models.forEach(m => {
                    if (m.getLanguageId() === data.languageId && date !== storageService.get(EDITED_LANGUAGE_DATE_KEY, -1 /* StorageScope.APPLICATION */)) {
                        const editedCount = storageService.getNumber(EDITED_LANGUAGE_COUNT_KEY, -1 /* StorageScope.APPLICATION */, 0) + 1;
                        storageService.store(EDITED_LANGUAGE_COUNT_KEY, editedCount, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                        storageService.store(EDITED_LANGUAGE_DATE_KEY, date, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    }
                });
            }, 250));
            this._register(textFileService.files.onDidSave(e => onModelsSavedWorker.work(e.model)));
        }
        const lastSessionDate = storageService.get(LAST_SESSION_DATE_KEY, -1 /* StorageScope.APPLICATION */, new Date(0).toDateString());
        if (date === lastSessionDate) {
            return;
        }
        const sessionCount = storageService.getNumber(SESSION_COUNT_KEY, -1 /* StorageScope.APPLICATION */, 0) + 1;
        storageService.store(LAST_SESSION_DATE_KEY, date, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        storageService.store(SESSION_COUNT_KEY, sessionCount, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        if (sessionCount < 9) {
            return;
        }
        if (storageService.getNumber(EDITED_LANGUAGE_COUNT_KEY, -1 /* StorageScope.APPLICATION */, 0) < data.editCount) {
            return;
        }
        const isCandidate = storageService.getBoolean(IS_CANDIDATE_KEY, -1 /* StorageScope.APPLICATION */, false)
            || Math.random() < data.userProbability;
        storageService.store(IS_CANDIDATE_KEY, isCandidate, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        if (!isCandidate) {
            storageService.store(SKIP_VERSION_KEY, productService.version, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
            return;
        }
        notificationService.prompt(Severity.Info, localize('helpUs', "Help us improve our support for {0}", languageService.getLanguageName(data.languageId) ?? data.languageId), [{
                label: localize('takeShortSurvey', "Take Short Survey"),
                run: () => {
                    telemetryService.publicLog(`${data.surveyId}.survey/takeShortSurvey`);
                    openerService.open(URI.parse(`${data.surveyUrl}?o=${encodeURIComponent(platform)}&v=${encodeURIComponent(productService.version)}&m=${encodeURIComponent(telemetryService.machineId)}`));
                    storageService.store(IS_CANDIDATE_KEY, false, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    storageService.store(SKIP_VERSION_KEY, productService.version, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                }
            }, {
                label: localize('remindLater', "Remind Me Later"),
                run: () => {
                    telemetryService.publicLog(`${data.surveyId}.survey/remindMeLater`);
                    storageService.store(SESSION_COUNT_KEY, sessionCount - 3, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                }
            }, {
                label: localize('neverAgain', "Don't Show Again"),
                isSecondary: true,
                run: () => {
                    telemetryService.publicLog(`${data.surveyId}.survey/dontShowAgain`);
                    storageService.store(IS_CANDIDATE_KEY, false, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    storageService.store(SKIP_VERSION_KEY, productService.version, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                }
            }], { sticky: true });
    }
}
let LanguageSurveysContribution = class LanguageSurveysContribution {
    constructor(storageService, notificationService, telemetryService, textFileService, openerService, productService, languageService, extensionService) {
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.telemetryService = telemetryService;
        this.textFileService = textFileService;
        this.openerService = openerService;
        this.productService = productService;
        this.languageService = languageService;
        this.extensionService = extensionService;
        this.handleSurveys();
    }
    async handleSurveys() {
        if (!this.productService.surveys) {
            return;
        }
        // Make sure to wait for installed extensions
        // being registered to show notifications
        // properly (https://github.com/microsoft/vscode/issues/121216)
        await this.extensionService.whenInstalledExtensionsRegistered();
        // Handle surveys
        this.productService.surveys
            .filter(surveyData => surveyData.surveyId && surveyData.editCount && surveyData.languageId && surveyData.surveyUrl && surveyData.userProbability)
            .map(surveyData => new LanguageSurvey(surveyData, this.storageService, this.notificationService, this.telemetryService, this.languageService, this.textFileService, this.openerService, this.productService));
    }
};
LanguageSurveysContribution = __decorate([
    __param(0, IStorageService),
    __param(1, INotificationService),
    __param(2, ITelemetryService),
    __param(3, ITextFileService),
    __param(4, IOpenerService),
    __param(5, IProductService),
    __param(6, ILanguageService),
    __param(7, IExtensionService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], LanguageSurveysContribution);
if (language === 'en') {
    const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(LanguageSurveysContribution, 3 /* LifecyclePhase.Restored */);
}
