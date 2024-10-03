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
import { localize } from '../../../../nls.js';
import { getLocation, parse } from '../../../../base/common/json.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
let ExtensionsCompletionItemsProvider = class ExtensionsCompletionItemsProvider extends Disposable {
    constructor(extensionManagementService, languageFeaturesService) {
        super();
        this.extensionManagementService = extensionManagementService;
        this._register(languageFeaturesService.completionProvider.register({ language: 'jsonc', pattern: '**/settings.json' }, {
            _debugDisplayName: 'extensionsCompletionProvider',
            provideCompletionItems: async (model, position, _context, token) => {
                const getWordRangeAtPosition = (model, position) => {
                    const wordAtPosition = model.getWordAtPosition(position);
                    return wordAtPosition ? new Range(position.lineNumber, wordAtPosition.startColumn, position.lineNumber, wordAtPosition.endColumn) : null;
                };
                const location = getLocation(model.getValue(), model.getOffsetAt(position));
                const range = getWordRangeAtPosition(model, position) ?? Range.fromPositions(position, position);
                if (location.path[0] === 'extensions.supportUntrustedWorkspaces' && location.path.length === 2 && location.isAtPropertyKey) {
                    let alreadyConfigured = [];
                    try {
                        alreadyConfigured = Object.keys(parse(model.getValue())['extensions.supportUntrustedWorkspaces']);
                    }
                    catch (e) { }
                    return { suggestions: await this.provideSupportUntrustedWorkspacesExtensionProposals(alreadyConfigured, range) };
                }
                return { suggestions: [] };
            }
        }));
    }
    async provideSupportUntrustedWorkspacesExtensionProposals(alreadyConfigured, range) {
        const suggestions = [];
        const installedExtensions = (await this.extensionManagementService.getInstalled()).filter(e => e.manifest.main);
        const proposedExtensions = installedExtensions.filter(e => alreadyConfigured.indexOf(e.identifier.id) === -1);
        if (proposedExtensions.length) {
            suggestions.push(...proposedExtensions.map(e => {
                const text = `"${e.identifier.id}": {\n\t"supported": true,\n\t"version": "${e.manifest.version}"\n},`;
                return { label: e.identifier.id, kind: 13, insertText: text, filterText: text, range };
            }));
        }
        else {
            const text = '"vscode.csharp": {\n\t"supported": true,\n\t"version": "0.0.0"\n},';
            suggestions.push({ label: localize('exampleExtension', "Example"), kind: 13, insertText: text, filterText: text, range });
        }
        return suggestions;
    }
};
ExtensionsCompletionItemsProvider = __decorate([
    __param(0, IExtensionManagementService),
    __param(1, ILanguageFeaturesService),
    __metadata("design:paramtypes", [Object, Object])
], ExtensionsCompletionItemsProvider);
export { ExtensionsCompletionItemsProvider };
