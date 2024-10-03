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
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import * as marked from '../../../../base/common/marked/marked.js';
import { Schemas } from '../../../../base/common/network.js';
import { Range } from '../../../../editor/common/core/range.js';
import { createTextBufferFactory } from '../../../../editor/common/model/textModel.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
class WalkThroughContentProviderRegistry {
    constructor() {
        this.providers = new Map();
    }
    registerProvider(moduleId, provider) {
        this.providers.set(moduleId, provider);
    }
    getProvider(moduleId) {
        return this.providers.get(moduleId);
    }
}
export const walkThroughContentRegistry = new WalkThroughContentProviderRegistry();
export async function moduleToContent(instantiationService, resource) {
    if (!resource.query) {
        throw new Error('Walkthrough: invalid resource');
    }
    const query = JSON.parse(resource.query);
    if (!query.moduleId) {
        throw new Error('Walkthrough: invalid resource');
    }
    const provider = walkThroughContentRegistry.getProvider(query.moduleId);
    if (!provider) {
        throw new Error(`Walkthrough: no provider registered for ${query.moduleId}`);
    }
    return instantiationService.invokeFunction(provider);
}
let WalkThroughSnippetContentProvider = class WalkThroughSnippetContentProvider {
    static { this.ID = 'workbench.contrib.walkThroughSnippetContentProvider'; }
    constructor(textModelResolverService, languageService, modelService, instantiationService) {
        this.textModelResolverService = textModelResolverService;
        this.languageService = languageService;
        this.modelService = modelService;
        this.instantiationService = instantiationService;
        this.loads = new Map();
        this.textModelResolverService.registerTextModelContentProvider(Schemas.walkThroughSnippet, this);
    }
    async textBufferFactoryFromResource(resource) {
        let ongoing = this.loads.get(resource.toString());
        if (!ongoing) {
            ongoing = moduleToContent(this.instantiationService, resource)
                .then(content => createTextBufferFactory(content))
                .finally(() => this.loads.delete(resource.toString()));
            this.loads.set(resource.toString(), ongoing);
        }
        return ongoing;
    }
    async provideTextContent(resource) {
        const factory = await this.textBufferFactoryFromResource(resource.with({ fragment: '' }));
        let codeEditorModel = this.modelService.getModel(resource);
        if (!codeEditorModel) {
            const j = parseInt(resource.fragment);
            let i = 0;
            const renderer = new marked.marked.Renderer();
            renderer.code = ({ text, lang }) => {
                i++;
                const languageId = typeof lang === 'string' ? this.languageService.getLanguageIdByLanguageName(lang) || '' : '';
                const languageSelection = this.languageService.createById(languageId);
                const model = this.modelService.createModel(text, languageSelection, resource.with({ fragment: `${i}.${lang}` }));
                if (i === j) {
                    codeEditorModel = model;
                }
                return '';
            };
            const textBuffer = factory.create(1).textBuffer;
            const lineCount = textBuffer.getLineCount();
            const range = new Range(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
            const markdown = textBuffer.getValueInRange(range, 0);
            marked.marked(markdown, { renderer });
        }
        return assertIsDefined(codeEditorModel);
    }
};
WalkThroughSnippetContentProvider = __decorate([
    __param(0, ITextModelService),
    __param(1, ILanguageService),
    __param(2, IModelService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WalkThroughSnippetContentProvider);
export { WalkThroughSnippetContentProvider };
