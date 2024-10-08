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
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { codeActionsExtensionPointDescriptor } from '../common/codeActionsExtensionPoint.js';
import { documentationExtensionPointDescriptor } from '../common/documentationExtensionPoint.js';
import { ExtensionsRegistry } from '../../../services/extensions/common/extensionsRegistry.js';
import { CodeActionsContribution, editorConfiguration, notebookEditorConfiguration } from './codeActionsContribution.js';
import { CodeActionDocumentationContribution } from './documentationContribution.js';
const codeActionsExtensionPoint = ExtensionsRegistry.registerExtensionPoint(codeActionsExtensionPointDescriptor);
const documentationExtensionPoint = ExtensionsRegistry.registerExtensionPoint(documentationExtensionPointDescriptor);
Registry.as(Extensions.Configuration)
    .registerConfiguration(editorConfiguration);
Registry.as(Extensions.Configuration)
    .registerConfiguration(notebookEditorConfiguration);
let WorkbenchConfigurationContribution = class WorkbenchConfigurationContribution {
    constructor(instantiationService) {
        instantiationService.createInstance(CodeActionsContribution, codeActionsExtensionPoint);
        instantiationService.createInstance(CodeActionDocumentationContribution, documentationExtensionPoint);
    }
};
WorkbenchConfigurationContribution = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], WorkbenchConfigurationContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WorkbenchConfigurationContribution, 4 /* LifecyclePhase.Eventually */);
