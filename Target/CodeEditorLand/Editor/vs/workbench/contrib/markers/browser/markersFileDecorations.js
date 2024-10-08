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
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { IMarkerService, MarkerSeverity } from '../../../../platform/markers/common/markers.js';
import { IDecorationsService } from '../../../services/decorations/common/decorations.js';
import { dispose } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { listErrorForeground, listWarningForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
class MarkersDecorationsProvider {
    constructor(_markerService) {
        this._markerService = _markerService;
        this.label = localize('label', "Problems");
        this.onDidChange = _markerService.onMarkerChanged;
    }
    provideDecorations(resource) {
        const markers = this._markerService.read({
            resource,
            severities: MarkerSeverity.Error | MarkerSeverity.Warning
        });
        let first;
        for (const marker of markers) {
            if (!first || marker.severity > first.severity) {
                first = marker;
            }
        }
        if (!first) {
            return undefined;
        }
        return {
            weight: 100 * first.severity,
            bubble: true,
            tooltip: markers.length === 1 ? localize('tooltip.1', "1 problem in this file") : localize('tooltip.N', "{0} problems in this file", markers.length),
            letter: markers.length < 10 ? markers.length.toString() : '9+',
            color: first.severity === MarkerSeverity.Error ? listErrorForeground : listWarningForeground,
        };
    }
}
let MarkersFileDecorations = class MarkersFileDecorations {
    constructor(_markerService, _decorationsService, _configurationService) {
        this._markerService = _markerService;
        this._decorationsService = _decorationsService;
        this._configurationService = _configurationService;
        this._disposables = [
            this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('problems.visibility')) {
                    this._updateEnablement();
                }
            }),
        ];
        this._updateEnablement();
    }
    dispose() {
        dispose(this._provider);
        dispose(this._disposables);
    }
    _updateEnablement() {
        const problem = this._configurationService.getValue('problems.visibility');
        if (problem === undefined) {
            return;
        }
        const value = this._configurationService.getValue('problems');
        const shouldEnable = (problem && value.decorations.enabled);
        if (shouldEnable === this._enabled) {
            if (!problem || !value.decorations.enabled) {
                this._provider?.dispose();
                this._provider = undefined;
            }
            return;
        }
        this._enabled = shouldEnable;
        if (this._enabled) {
            const provider = new MarkersDecorationsProvider(this._markerService);
            this._provider = this._decorationsService.registerDecorationsProvider(provider);
        }
        else if (this._provider) {
            this._provider.dispose();
        }
    }
};
MarkersFileDecorations = __decorate([
    __param(0, IMarkerService),
    __param(1, IDecorationsService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MarkersFileDecorations);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    'id': 'problems',
    'order': 101,
    'type': 'object',
    'properties': {
        'problems.decorations.enabled': {
            'markdownDescription': localize('markers.showOnFile', "Show Errors & Warnings on files and folder. Overwritten by {0} when it is off.", '`#problems.visibility#`'),
            'type': 'boolean',
            'default': true
        }
    }
});
// register file decorations
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(MarkersFileDecorations, 3 /* LifecyclePhase.Restored */);
