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
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ChatInputPart } from './chatInputPart.js';
export class PasteImageProvider {
    constructor() {
        this.kind = new HierarchicalKind('image');
        this.pasteMimeTypes = ['image/*'];
    }
    async provideDocumentPasteEdits(_model, _ranges, dataTransfer, context, token) {
        return;
    }
}
let ChatPasteProvidersFeature = class ChatPasteProvidersFeature extends Disposable {
    constructor(languageFeaturesService) {
        super();
        this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, pattern: '*', hasAccessToAllModels: true }, new PasteImageProvider()));
    }
};
ChatPasteProvidersFeature = __decorate([
    __param(0, ILanguageFeaturesService),
    __metadata("design:paramtypes", [Object])
], ChatPasteProvidersFeature);
export { ChatPasteProvidersFeature };
