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
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { OpenWindowSessionLogFileAction } from '../common/logsActions.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { LogsDataCleaner } from '../common/logsDataCleaner.js';
let WebLogOutputChannels = class WebLogOutputChannels extends Disposable {
    constructor(instantiationService) {
        super();
        this.instantiationService = instantiationService;
        this.registerWebContributions();
    }
    registerWebContributions() {
        this.instantiationService.createInstance(LogsDataCleaner);
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: OpenWindowSessionLogFileAction.ID,
                    title: OpenWindowSessionLogFileAction.TITLE,
                    category: Categories.Developer,
                    f1: true
                });
            }
            run(servicesAccessor) {
                return servicesAccessor.get(IInstantiationService).createInstance(OpenWindowSessionLogFileAction, OpenWindowSessionLogFileAction.ID, OpenWindowSessionLogFileAction.TITLE.value).run();
            }
        }));
    }
};
WebLogOutputChannels = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], WebLogOutputChannels);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WebLogOutputChannels, 3 /* LifecyclePhase.Restored */);
