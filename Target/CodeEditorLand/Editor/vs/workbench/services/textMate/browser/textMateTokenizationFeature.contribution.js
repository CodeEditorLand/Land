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
import { ITextMateTokenizationService } from './textMateTokenizationFeature.js';
import { TextMateTokenizationFeature } from './textMateTokenizationFeatureImpl.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
let TextMateTokenizationInstantiator = class TextMateTokenizationInstantiator {
    static { this.ID = 'workbench.contrib.textMateTokenizationInstantiator'; }
    constructor(_textMateTokenizationService) { }
};
TextMateTokenizationInstantiator = __decorate([
    __param(0, ITextMateTokenizationService),
    __metadata("design:paramtypes", [Object])
], TextMateTokenizationInstantiator);
registerSingleton(ITextMateTokenizationService, TextMateTokenizationFeature, 0);
registerWorkbenchContribution2(TextMateTokenizationInstantiator.ID, TextMateTokenizationInstantiator, 2);
