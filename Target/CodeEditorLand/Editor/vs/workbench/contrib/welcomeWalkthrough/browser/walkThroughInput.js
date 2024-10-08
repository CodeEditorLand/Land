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
var WalkThroughInput_1;
import * as marked from '../../../../base/common/marked/marked.js';
import { Schemas } from '../../../../base/common/network.js';
import { isEqual } from '../../../../base/common/resources.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { markedGfmHeadingIdPlugin } from '../../markdown/browser/markedGfmHeadingIdPlugin.js';
import { moduleToContent } from '../common/walkThroughContentProvider.js';
class WalkThroughModel extends EditorModel {
    constructor(mainRef, snippetRefs) {
        super();
        this.mainRef = mainRef;
        this.snippetRefs = snippetRefs;
    }
    get main() {
        return this.mainRef;
    }
    get snippets() {
        return this.snippetRefs.map(snippet => snippet.object);
    }
    dispose() {
        this.snippetRefs.forEach(ref => ref.dispose());
        super.dispose();
    }
}
let WalkThroughInput = WalkThroughInput_1 = class WalkThroughInput extends EditorInput {
    get capabilities() {
        return 8 /* EditorInputCapabilities.Singleton */ | super.capabilities;
    }
    get resource() { return this.options.resource; }
    constructor(options, instantiationService, textModelResolverService) {
        super();
        this.options = options;
        this.instantiationService = instantiationService;
        this.textModelResolverService = textModelResolverService;
        this.promise = null;
        this.maxTopScroll = 0;
        this.maxBottomScroll = 0;
    }
    get typeId() {
        return this.options.typeId;
    }
    getName() {
        return this.options.name;
    }
    getDescription() {
        return this.options.description || '';
    }
    getTelemetryFrom() {
        return this.options.telemetryFrom;
    }
    getTelemetryDescriptor() {
        const descriptor = super.getTelemetryDescriptor();
        descriptor['target'] = this.getTelemetryFrom();
        /* __GDPR__FRAGMENT__
            "EditorTelemetryDescriptor" : {
                "target" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        return descriptor;
    }
    get onReady() {
        return this.options.onReady;
    }
    get layout() {
        return this.options.layout;
    }
    resolve() {
        if (!this.promise) {
            this.promise = moduleToContent(this.instantiationService, this.options.resource)
                .then(content => {
                if (this.resource.path.endsWith('.html')) {
                    return new WalkThroughModel(content, []);
                }
                const snippets = [];
                let i = 0;
                const renderer = new marked.marked.Renderer();
                renderer.code = ({ lang }) => {
                    i++;
                    const resource = this.options.resource.with({ scheme: Schemas.walkThroughSnippet, fragment: `${i}.${lang}` });
                    snippets.push(this.textModelResolverService.createModelReference(resource));
                    return `<div id="snippet-${resource.fragment}" class="walkThroughEditorContainer" ></div>`;
                };
                const m = new marked.Marked({ renderer }, markedGfmHeadingIdPlugin());
                content = m.parse(content, { async: false });
                return Promise.all(snippets)
                    .then(refs => new WalkThroughModel(content, refs));
            });
        }
        return this.promise;
    }
    matches(otherInput) {
        if (super.matches(otherInput)) {
            return true;
        }
        if (otherInput instanceof WalkThroughInput_1) {
            return isEqual(otherInput.options.resource, this.options.resource);
        }
        return false;
    }
    dispose() {
        if (this.promise) {
            this.promise.then(model => model.dispose());
            this.promise = null;
        }
        super.dispose();
    }
    relativeScrollPosition(topScroll, bottomScroll) {
        this.maxTopScroll = Math.max(this.maxTopScroll, topScroll);
        this.maxBottomScroll = Math.max(this.maxBottomScroll, bottomScroll);
    }
};
WalkThroughInput = WalkThroughInput_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, ITextModelService),
    __metadata("design:paramtypes", [Object, Object, Object])
], WalkThroughInput);
export { WalkThroughInput };
