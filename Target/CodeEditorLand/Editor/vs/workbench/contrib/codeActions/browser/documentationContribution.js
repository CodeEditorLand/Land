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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { CodeActionKind } from '../../../../editor/contrib/codeAction/common/types.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
let CodeActionDocumentationContribution = class CodeActionDocumentationContribution extends Disposable {
    constructor(extensionPoint, contextKeyService, languageFeaturesService) {
        super();
        this.contextKeyService = contextKeyService;
        this.contributions = [];
        this.emptyCodeActionsList = {
            actions: [],
            dispose: () => { }
        };
        this._register(languageFeaturesService.codeActionProvider.register('*', this));
        extensionPoint.setHandler(points => {
            this.contributions = [];
            for (const documentation of points) {
                if (!documentation.value.refactoring) {
                    continue;
                }
                for (const contribution of documentation.value.refactoring) {
                    const precondition = ContextKeyExpr.deserialize(contribution.when);
                    if (!precondition) {
                        continue;
                    }
                    this.contributions.push({
                        title: contribution.title,
                        when: precondition,
                        command: contribution.command
                    });
                }
            }
        });
    }
    async provideCodeActions(_model, _range, context, _token) {
        return this.emptyCodeActionsList;
    }
    _getAdditionalMenuItems(context, actions) {
        if (context.only !== CodeActionKind.Refactor.value) {
            if (!actions.some(action => action.kind && CodeActionKind.Refactor.contains(new HierarchicalKind(action.kind)))) {
                return [];
            }
        }
        return this.contributions
            .filter(contribution => this.contextKeyService.contextMatchesRules(contribution.when))
            .map(contribution => {
            return {
                id: contribution.command,
                title: contribution.title
            };
        });
    }
};
CodeActionDocumentationContribution = __decorate([
    __param(1, IContextKeyService),
    __param(2, ILanguageFeaturesService),
    __metadata("design:paramtypes", [Object, Object, Object])
], CodeActionDocumentationContribution);
export { CodeActionDocumentationContribution };
