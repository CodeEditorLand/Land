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
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
let BracketPairColorizer2TelemetryContribution = class BracketPairColorizer2TelemetryContribution {
    constructor(configurationService, extensionsWorkbenchService, telemetryService) {
        this.configurationService = configurationService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.telemetryService = telemetryService;
        this.init().catch(onUnexpectedError);
    }
    async init() {
        const bracketPairColorizerId = 'coenraads.bracket-pair-colorizer-2';
        await this.extensionsWorkbenchService.queryLocal();
        const extension = this.extensionsWorkbenchService.installed.find(e => e.identifier.id === bracketPairColorizerId);
        if (!extension ||
            ((extension.enablementState !== 9) &&
                (extension.enablementState !== 10))) {
            return;
        }
        const nativeBracketPairColorizationEnabledKey = 'editor.bracketPairColorization.enabled';
        const nativeColorizationEnabled = !!this.configurationService.getValue(nativeBracketPairColorizationEnabledKey);
        this.telemetryService.publicLog2('bracketPairColorizerTwoUsage', {
            nativeColorizationEnabled
        });
    }
};
BracketPairColorizer2TelemetryContribution = __decorate([
    __param(0, IConfigurationService),
    __param(1, IExtensionsWorkbenchService),
    __param(2, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object])
], BracketPairColorizer2TelemetryContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(BracketPairColorizer2TelemetryContribution, 3);
