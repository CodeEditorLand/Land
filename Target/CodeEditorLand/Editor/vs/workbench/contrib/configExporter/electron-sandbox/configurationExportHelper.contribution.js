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
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { DefaultConfigurationExportHelper } from './configurationExportHelper.js';
let ExtensionPoints = class ExtensionPoints {
    constructor(instantiationService, environmentService) {
        if (environmentService.args['export-default-configuration']) {
            instantiationService.createInstance(DefaultConfigurationExportHelper);
        }
    }
};
ExtensionPoints = __decorate([
    __param(0, IInstantiationService),
    __param(1, INativeWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object])
], ExtensionPoints);
export { ExtensionPoints };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ExtensionPoints, 3);
