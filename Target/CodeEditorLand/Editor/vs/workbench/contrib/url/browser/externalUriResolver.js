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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
let ExternalUriResolverContribution = class ExternalUriResolverContribution extends Disposable {
    static { this.ID = 'workbench.contrib.externalUriResolver'; }
    constructor(_openerService, _workbenchEnvironmentService) {
        super();
        if (_workbenchEnvironmentService.options?.resolveExternalUri) {
            this._register(_openerService.registerExternalUriResolver({
                resolveExternalUri: async (resource) => {
                    return {
                        resolved: await _workbenchEnvironmentService.options.resolveExternalUri(resource),
                        dispose: () => {
                            // TODO@mjbvz - do we need to do anything here?
                        }
                    };
                }
            }));
        }
    }
};
ExternalUriResolverContribution = __decorate([
    __param(0, IOpenerService),
    __param(1, IBrowserWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object])
], ExternalUriResolverContribution);
export { ExternalUriResolverContribution };
