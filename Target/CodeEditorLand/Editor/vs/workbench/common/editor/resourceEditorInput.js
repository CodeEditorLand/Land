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
import { EditorInput } from './editorInput.js';
import { URI } from '../../../base/common/uri.js';
import { ByteSize, IFileService, getLargeFileConfirmationLimit } from '../../../platform/files/common/files.js';
import { ILabelService } from '../../../platform/label/common/label.js';
import { dirname, isEqual } from '../../../base/common/resources.js';
import { IFilesConfigurationService } from '../../services/filesConfiguration/common/filesConfigurationService.js';
import { isConfigured } from '../../../platform/configuration/common/configuration.js';
import { ITextResourceConfigurationService } from '../../../editor/common/services/textResourceConfiguration.js';
import { ICustomEditorLabelService } from '../../services/editor/common/customEditorLabelService.js';
/**
 * The base class for all editor inputs that open resources.
 */
let AbstractResourceEditorInput = class AbstractResourceEditorInput extends EditorInput {
    get capabilities() {
        let capabilities = 32 /* EditorInputCapabilities.CanSplitInGroup */;
        if (this.fileService.hasProvider(this.resource)) {
            if (this.filesConfigurationService.isReadonly(this.resource)) {
                capabilities |= 2 /* EditorInputCapabilities.Readonly */;
            }
        }
        else {
            capabilities |= 4 /* EditorInputCapabilities.Untitled */;
        }
        if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
            capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
        }
        return capabilities;
    }
    get preferredResource() { return this._preferredResource; }
    constructor(resource, preferredResource, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
        super();
        this.resource = resource;
        this.labelService = labelService;
        this.fileService = fileService;
        this.filesConfigurationService = filesConfigurationService;
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.customEditorLabelService = customEditorLabelService;
        this._name = undefined;
        this._shortDescription = undefined;
        this._mediumDescription = undefined;
        this._longDescription = undefined;
        this._shortTitle = undefined;
        this._mediumTitle = undefined;
        this._longTitle = undefined;
        this._preferredResource = preferredResource || resource;
        this.registerListeners();
    }
    registerListeners() {
        // Clear our labels on certain label related events
        this._register(this.labelService.onDidChangeFormatters(e => this.onLabelEvent(e.scheme)));
        this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onLabelEvent(e.scheme)));
        this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onLabelEvent(e.scheme)));
        this._register(this.customEditorLabelService.onDidChange(() => this.updateLabel()));
    }
    onLabelEvent(scheme) {
        if (scheme === this._preferredResource.scheme) {
            this.updateLabel();
        }
    }
    updateLabel() {
        // Clear any cached labels from before
        this._name = undefined;
        this._shortDescription = undefined;
        this._mediumDescription = undefined;
        this._longDescription = undefined;
        this._shortTitle = undefined;
        this._mediumTitle = undefined;
        this._longTitle = undefined;
        // Trigger recompute of label
        this._onDidChangeLabel.fire();
    }
    setPreferredResource(preferredResource) {
        if (!isEqual(preferredResource, this._preferredResource)) {
            this._preferredResource = preferredResource;
            this.updateLabel();
        }
    }
    getName() {
        if (typeof this._name !== 'string') {
            this._name = this.customEditorLabelService.getName(this._preferredResource) ?? this.labelService.getUriBasenameLabel(this._preferredResource);
        }
        return this._name;
    }
    getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
        switch (verbosity) {
            case 0 /* Verbosity.SHORT */:
                return this.shortDescription;
            case 2 /* Verbosity.LONG */:
                return this.longDescription;
            case 1 /* Verbosity.MEDIUM */:
            default:
                return this.mediumDescription;
        }
    }
    get shortDescription() {
        if (typeof this._shortDescription !== 'string') {
            this._shortDescription = this.labelService.getUriBasenameLabel(dirname(this._preferredResource));
        }
        return this._shortDescription;
    }
    get mediumDescription() {
        if (typeof this._mediumDescription !== 'string') {
            this._mediumDescription = this.labelService.getUriLabel(dirname(this._preferredResource), { relative: true });
        }
        return this._mediumDescription;
    }
    get longDescription() {
        if (typeof this._longDescription !== 'string') {
            this._longDescription = this.labelService.getUriLabel(dirname(this._preferredResource));
        }
        return this._longDescription;
    }
    get shortTitle() {
        if (typeof this._shortTitle !== 'string') {
            this._shortTitle = this.getName();
        }
        return this._shortTitle;
    }
    get mediumTitle() {
        if (typeof this._mediumTitle !== 'string') {
            this._mediumTitle = this.labelService.getUriLabel(this._preferredResource, { relative: true });
        }
        return this._mediumTitle;
    }
    get longTitle() {
        if (typeof this._longTitle !== 'string') {
            this._longTitle = this.labelService.getUriLabel(this._preferredResource);
        }
        return this._longTitle;
    }
    getTitle(verbosity) {
        switch (verbosity) {
            case 0 /* Verbosity.SHORT */:
                return this.shortTitle;
            case 2 /* Verbosity.LONG */:
                return this.longTitle;
            default:
            case 1 /* Verbosity.MEDIUM */:
                return this.mediumTitle;
        }
    }
    isReadonly() {
        return this.filesConfigurationService.isReadonly(this.resource);
    }
    ensureLimits(options) {
        if (options?.limits) {
            return options.limits; // respect passed in limits if any
        }
        // We want to determine the large file configuration based on the best defaults
        // for the resource but also respecting user settings. We only apply user settings
        // if explicitly configured by the user. Otherwise we pick the best limit for the
        // resource scheme.
        const defaultSizeLimit = getLargeFileConfirmationLimit(this.resource);
        let configuredSizeLimit = undefined;
        const configuredSizeLimitMb = this.textResourceConfigurationService.inspect(this.resource, null, 'workbench.editorLargeFileConfirmation');
        if (isConfigured(configuredSizeLimitMb)) {
            configuredSizeLimit = configuredSizeLimitMb.value * ByteSize.MB; // normalize to MB
        }
        return {
            size: configuredSizeLimit ?? defaultSizeLimit
        };
    }
};
AbstractResourceEditorInput = __decorate([
    __param(2, ILabelService),
    __param(3, IFileService),
    __param(4, IFilesConfigurationService),
    __param(5, ITextResourceConfigurationService),
    __param(6, ICustomEditorLabelService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object, Object, Object])
], AbstractResourceEditorInput);
export { AbstractResourceEditorInput };
