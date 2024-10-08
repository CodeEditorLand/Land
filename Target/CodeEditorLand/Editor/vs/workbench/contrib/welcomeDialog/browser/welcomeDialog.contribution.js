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
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { WelcomeWidget } from './welcomeWidget.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { localize } from '../../../../nls.js';
import { applicationConfigurationNodeBase } from '../../../common/configuration.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
const configurationKey = 'workbench.welcome.experimental.dialog';
let WelcomeDialogContribution = class WelcomeDialogContribution extends Disposable {
    constructor(storageService, environmentService, configurationService, contextService, codeEditorService, instantiationService, commandService, telemetryService, openerService, editorService) {
        super();
        this.isRendered = false;
        if (!storageService.isNew(-1 /* StorageScope.APPLICATION */)) {
            return; // do not show if this is not the first session
        }
        const setting = configurationService.inspect(configurationKey);
        if (!setting.value) {
            return;
        }
        const welcomeDialog = environmentService.options?.welcomeDialog;
        if (!welcomeDialog) {
            return;
        }
        this._register(editorService.onDidActiveEditorChange(() => {
            if (!this.isRendered) {
                const codeEditor = codeEditorService.getActiveCodeEditor();
                if (codeEditor?.hasModel()) {
                    const scheduler = new RunOnceScheduler(() => {
                        const notificationsVisible = contextService.contextMatchesRules(ContextKeyExpr.deserialize('notificationCenterVisible')) ||
                            contextService.contextMatchesRules(ContextKeyExpr.deserialize('notificationToastsVisible'));
                        if (codeEditor === codeEditorService.getActiveCodeEditor() && !notificationsVisible) {
                            this.isRendered = true;
                            const welcomeWidget = new WelcomeWidget(codeEditor, instantiationService, commandService, telemetryService, openerService);
                            welcomeWidget.render(welcomeDialog.title, welcomeDialog.message, welcomeDialog.buttonText, welcomeDialog.buttonCommand);
                        }
                    }, 3000);
                    this._register(codeEditor.onDidChangeModelContent((e) => {
                        if (!this.isRendered) {
                            scheduler.schedule();
                        }
                    }));
                }
            }
        }));
    }
};
WelcomeDialogContribution = __decorate([
    __param(0, IStorageService),
    __param(1, IBrowserWorkbenchEnvironmentService),
    __param(2, IConfigurationService),
    __param(3, IContextKeyService),
    __param(4, ICodeEditorService),
    __param(5, IInstantiationService),
    __param(6, ICommandService),
    __param(7, ITelemetryService),
    __param(8, IOpenerService),
    __param(9, IEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WelcomeDialogContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WelcomeDialogContribution, 4 /* LifecyclePhase.Eventually */);
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
    ...applicationConfigurationNodeBase,
    properties: {
        'workbench.welcome.experimental.dialog': {
            scope: 1 /* ConfigurationScope.APPLICATION */,
            type: 'boolean',
            default: false,
            tags: ['experimental'],
            description: localize('workbench.welcome.dialog', "When enabled, a welcome widget is shown in the editor")
        }
    }
});
