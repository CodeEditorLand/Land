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
import { Schemas } from '../../../../base/common/network.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ITextEditorService } from '../../textfile/common/textEditorService.js';
import { isEqual, toLocalResource } from '../../../../base/common/resources.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../editor/common/languages/modesRegistry.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { IPathService } from '../../path/common/pathService.js';
import { UntitledTextEditorInput } from './untitledTextEditorInput.js';
import { NO_TYPE_ID } from '../../workingCopy/common/workingCopy.js';
import { IWorkingCopyEditorService } from '../../workingCopy/common/workingCopyEditorService.js';
import { IUntitledTextEditorService } from './untitledTextEditorService.js';
let UntitledTextEditorInputSerializer = class UntitledTextEditorInputSerializer {
    constructor(filesConfigurationService, environmentService, pathService) {
        this.filesConfigurationService = filesConfigurationService;
        this.environmentService = environmentService;
        this.pathService = pathService;
    }
    canSerialize(editorInput) {
        return this.filesConfigurationService.isHotExitEnabled && !editorInput.isDisposed();
    }
    serialize(editorInput) {
        if (!this.canSerialize(editorInput)) {
            return undefined;
        }
        const untitledTextEditorInput = editorInput;
        let resource = untitledTextEditorInput.resource;
        if (untitledTextEditorInput.hasAssociatedFilePath) {
            resource = toLocalResource(resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme); // untitled with associated file path use the local schema
        }
        // Language: only remember language if it is either specific (not text)
        // or if the language was explicitly set by the user. We want to preserve
        // this information across restarts and not set the language unless
        // this is the case.
        let languageId;
        const languageIdCandidate = untitledTextEditorInput.getLanguageId();
        if (languageIdCandidate !== PLAINTEXT_LANGUAGE_ID) {
            languageId = languageIdCandidate;
        }
        else if (untitledTextEditorInput.hasLanguageSetExplicitly) {
            languageId = languageIdCandidate;
        }
        const serialized = {
            resourceJSON: resource.toJSON(),
            modeId: languageId,
            encoding: untitledTextEditorInput.getEncoding()
        };
        return JSON.stringify(serialized);
    }
    deserialize(instantiationService, serializedEditorInput) {
        return instantiationService.invokeFunction(accessor => {
            const deserialized = JSON.parse(serializedEditorInput);
            const resource = URI.revive(deserialized.resourceJSON);
            const languageId = deserialized.modeId;
            const encoding = deserialized.encoding;
            return accessor.get(ITextEditorService).createTextEditor({ resource, languageId, encoding, forceUntitled: true });
        });
    }
};
UntitledTextEditorInputSerializer = __decorate([
    __param(0, IFilesConfigurationService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IPathService),
    __metadata("design:paramtypes", [Object, Object, Object])
], UntitledTextEditorInputSerializer);
export { UntitledTextEditorInputSerializer };
let UntitledTextEditorWorkingCopyEditorHandler = class UntitledTextEditorWorkingCopyEditorHandler extends Disposable {
    static { this.ID = 'workbench.contrib.untitledTextEditorWorkingCopyEditorHandler'; }
    constructor(workingCopyEditorService, environmentService, pathService, textEditorService, untitledTextEditorService) {
        super();
        this.environmentService = environmentService;
        this.pathService = pathService;
        this.textEditorService = textEditorService;
        this.untitledTextEditorService = untitledTextEditorService;
        this._register(workingCopyEditorService.registerHandler(this));
    }
    handles(workingCopy) {
        return workingCopy.resource.scheme === Schemas.untitled && workingCopy.typeId === NO_TYPE_ID;
    }
    isOpen(workingCopy, editor) {
        if (!this.handles(workingCopy)) {
            return false;
        }
        return editor instanceof UntitledTextEditorInput && isEqual(workingCopy.resource, editor.resource);
    }
    createEditor(workingCopy) {
        let editorInputResource;
        // If the untitled has an associated resource,
        // ensure to restore the local resource it had
        if (this.untitledTextEditorService.isUntitledWithAssociatedResource(workingCopy.resource)) {
            editorInputResource = toLocalResource(workingCopy.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
        }
        else {
            editorInputResource = workingCopy.resource;
        }
        return this.textEditorService.createTextEditor({ resource: editorInputResource, forceUntitled: true });
    }
};
UntitledTextEditorWorkingCopyEditorHandler = __decorate([
    __param(0, IWorkingCopyEditorService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IPathService),
    __param(3, ITextEditorService),
    __param(4, IUntitledTextEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], UntitledTextEditorWorkingCopyEditorHandler);
export { UntitledTextEditorWorkingCopyEditorHandler };
