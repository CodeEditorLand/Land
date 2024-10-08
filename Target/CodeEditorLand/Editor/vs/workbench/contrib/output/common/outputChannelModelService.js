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
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { createDecorator, IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { toLocalISOString } from '../../../../base/common/date.js';
import { joinPath } from '../../../../base/common/resources.js';
import { DelegatedOutputChannelModel, FileOutputChannelModel } from './outputChannelModel.js';
export const IOutputChannelModelService = createDecorator('outputChannelModelService');
let OutputChannelModelService = class OutputChannelModelService {
    constructor(fileService, instantiationService, environmentService) {
        this.fileService = fileService;
        this.instantiationService = instantiationService;
        this._outputDir = null;
        this.outputLocation = joinPath(environmentService.windowLogsPath, `output_${toLocalISOString(new Date()).replace(/-|:|\.\d+Z$/g, '')}`);
    }
    createOutputChannelModel(id, modelUri, language, file) {
        return file ? this.instantiationService.createInstance(FileOutputChannelModel, modelUri, language, file) : this.instantiationService.createInstance(DelegatedOutputChannelModel, id, modelUri, language, this.outputDir);
    }
    get outputDir() {
        if (!this._outputDir) {
            this._outputDir = this.fileService.createFolder(this.outputLocation).then(() => this.outputLocation);
        }
        return this._outputDir;
    }
};
OutputChannelModelService = __decorate([
    __param(0, IFileService),
    __param(1, IInstantiationService),
    __param(2, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object])
], OutputChannelModelService);
export { OutputChannelModelService };
registerSingleton(IOutputChannelModelService, OutputChannelModelService, 1 /* InstantiationType.Delayed */);
