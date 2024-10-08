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
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
let SleepResumeRepaintMinimap = class SleepResumeRepaintMinimap extends Disposable {
    constructor(codeEditorService, nativeHostService) {
        super();
        this._register(nativeHostService.onDidResumeOS(() => {
            codeEditorService.listCodeEditors().forEach(editor => editor.render(true));
        }));
    }
};
SleepResumeRepaintMinimap = __decorate([
    __param(0, ICodeEditorService),
    __param(1, INativeHostService),
    __metadata("design:paramtypes", [Object, Object])
], SleepResumeRepaintMinimap);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(SleepResumeRepaintMinimap, 4 /* LifecyclePhase.Eventually */);
