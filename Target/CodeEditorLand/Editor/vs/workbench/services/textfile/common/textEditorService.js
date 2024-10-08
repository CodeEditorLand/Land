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
import { Event } from '../../../../base/common/event.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { createDecorator, IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { EditorExtensions, isResourceDiffEditorInput, isResourceSideBySideEditorInput, DEFAULT_EDITOR_ASSOCIATION, isResourceMergeEditorInput } from '../../../common/editor.js';
import { IUntitledTextEditorService } from '../../untitled/common/untitledTextEditorService.js';
import { Schemas } from '../../../../base/common/network.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { TextResourceEditorInput } from '../../../common/editor/textResourceEditorInput.js';
import { UntitledTextEditorInput } from '../../untitled/common/untitledTextEditorInput.js';
import { basename } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../editor/common/editorResolverService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
export const ITextEditorService = createDecorator('textEditorService');
let TextEditorService = class TextEditorService extends Disposable {
    constructor(untitledTextEditorService, instantiationService, uriIdentityService, fileService, editorResolverService) {
        super();
        this.untitledTextEditorService = untitledTextEditorService;
        this.instantiationService = instantiationService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.editorResolverService = editorResolverService;
        this.editorInputCache = new ResourceMap();
        this.fileEditorFactory = Registry.as(EditorExtensions.EditorFactory).getFileEditorFactory();
        // Register the default editor to the editor resolver
        // service so that it shows up in the editors picker
        this.registerDefaultEditor();
    }
    registerDefaultEditor() {
        this._register(this.editorResolverService.registerEditor('*', {
            id: DEFAULT_EDITOR_ASSOCIATION.id,
            label: DEFAULT_EDITOR_ASSOCIATION.displayName,
            detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
            priority: RegisteredEditorPriority.builtin
        }, {}, {
            createEditorInput: editor => ({ editor: this.createTextEditor(editor) }),
            createUntitledEditorInput: untitledEditor => ({ editor: this.createTextEditor(untitledEditor) }),
            createDiffEditorInput: diffEditor => ({ editor: this.createTextEditor(diffEditor) })
        }));
    }
    async resolveTextEditor(input) {
        return this.createTextEditor(input);
    }
    createTextEditor(input) {
        // Merge Editor Not Supported (we fallback to showing the result only)
        if (isResourceMergeEditorInput(input)) {
            return this.createTextEditor(input.result);
        }
        // Diff Editor Support
        if (isResourceDiffEditorInput(input)) {
            const original = this.createTextEditor(input.original);
            const modified = this.createTextEditor(input.modified);
            return this.instantiationService.createInstance(DiffEditorInput, input.label, input.description, original, modified, undefined);
        }
        // Side by Side Editor Support
        if (isResourceSideBySideEditorInput(input)) {
            const primary = this.createTextEditor(input.primary);
            const secondary = this.createTextEditor(input.secondary);
            return this.instantiationService.createInstance(SideBySideEditorInput, input.label, input.description, secondary, primary);
        }
        // Untitled text file support
        const untitledInput = input;
        if (untitledInput.forceUntitled || !untitledInput.resource || (untitledInput.resource.scheme === Schemas.untitled)) {
            const untitledOptions = {
                languageId: untitledInput.languageId,
                initialValue: untitledInput.contents,
                encoding: untitledInput.encoding
            };
            // Untitled resource: use as hint for an existing untitled editor
            let untitledModel;
            if (untitledInput.resource?.scheme === Schemas.untitled) {
                untitledModel = this.untitledTextEditorService.create({ untitledResource: untitledInput.resource, ...untitledOptions });
            }
            // Other resource: use as hint for associated filepath
            else {
                untitledModel = this.untitledTextEditorService.create({ associatedResource: untitledInput.resource, ...untitledOptions });
            }
            return this.createOrGetCached(untitledModel.resource, () => this.instantiationService.createInstance(UntitledTextEditorInput, untitledModel));
        }
        // Text File/Resource Editor Support
        const textResourceEditorInput = input;
        if (textResourceEditorInput.resource instanceof URI) {
            // Derive the label from the path if not provided explicitly
            const label = textResourceEditorInput.label || basename(textResourceEditorInput.resource);
            // We keep track of the preferred resource this input is to be created
            // with but it may be different from the canonical resource (see below)
            const preferredResource = textResourceEditorInput.resource;
            // From this moment on, only operate on the canonical resource
            // to ensure we reduce the chance of opening the same resource
            // with different resource forms (e.g. path casing on Windows)
            const canonicalResource = this.uriIdentityService.asCanonicalUri(preferredResource);
            return this.createOrGetCached(canonicalResource, () => {
                // File
                if (textResourceEditorInput.forceFile || this.fileService.hasProvider(canonicalResource)) {
                    return this.fileEditorFactory.createFileEditor(canonicalResource, preferredResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.encoding, textResourceEditorInput.languageId, textResourceEditorInput.contents, this.instantiationService);
                }
                // Resource
                return this.instantiationService.createInstance(TextResourceEditorInput, canonicalResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.languageId, textResourceEditorInput.contents);
            }, cachedInput => {
                // Untitled
                if (cachedInput instanceof UntitledTextEditorInput) {
                    return;
                }
                // Files
                else if (!(cachedInput instanceof TextResourceEditorInput)) {
                    cachedInput.setPreferredResource(preferredResource);
                    if (textResourceEditorInput.label) {
                        cachedInput.setPreferredName(textResourceEditorInput.label);
                    }
                    if (textResourceEditorInput.description) {
                        cachedInput.setPreferredDescription(textResourceEditorInput.description);
                    }
                    if (textResourceEditorInput.encoding) {
                        cachedInput.setPreferredEncoding(textResourceEditorInput.encoding);
                    }
                    if (textResourceEditorInput.languageId) {
                        cachedInput.setPreferredLanguageId(textResourceEditorInput.languageId);
                    }
                    if (typeof textResourceEditorInput.contents === 'string') {
                        cachedInput.setPreferredContents(textResourceEditorInput.contents);
                    }
                }
                // Resources
                else {
                    if (label) {
                        cachedInput.setName(label);
                    }
                    if (textResourceEditorInput.description) {
                        cachedInput.setDescription(textResourceEditorInput.description);
                    }
                    if (textResourceEditorInput.languageId) {
                        cachedInput.setPreferredLanguageId(textResourceEditorInput.languageId);
                    }
                    if (typeof textResourceEditorInput.contents === 'string') {
                        cachedInput.setPreferredContents(textResourceEditorInput.contents);
                    }
                }
            });
        }
        throw new Error(`ITextEditorService: Unable to create texteditor from ${JSON.stringify(input)}`);
    }
    createOrGetCached(resource, factoryFn, cachedFn) {
        // Return early if already cached
        let input = this.editorInputCache.get(resource);
        if (input) {
            cachedFn?.(input);
            return input;
        }
        // Otherwise create and add to cache
        input = factoryFn();
        this.editorInputCache.set(resource, input);
        Event.once(input.onWillDispose)(() => this.editorInputCache.delete(resource));
        return input;
    }
};
TextEditorService = __decorate([
    __param(0, IUntitledTextEditorService),
    __param(1, IInstantiationService),
    __param(2, IUriIdentityService),
    __param(3, IFileService),
    __param(4, IEditorResolverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TextEditorService);
export { TextEditorService };
registerSingleton(ITextEditorService, TextEditorService, 0 /* InstantiationType.Eager */);
