import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Range } from '../../../../editor/common/core/range.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import * as languages from '../../../../editor/common/languages.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { DocumentationExtensionPoint } from '../common/documentationExtensionPoint.js';
import { IExtensionPoint } from '../../../services/extensions/common/extensionsRegistry.js';
export declare class CodeActionDocumentationContribution extends Disposable implements IWorkbenchContribution, languages.CodeActionProvider {
    private readonly contextKeyService;
    private contributions;
    private readonly emptyCodeActionsList;
    constructor(extensionPoint: IExtensionPoint<DocumentationExtensionPoint>, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService);
    provideCodeActions(_model: ITextModel, _range: Range | Selection, context: languages.CodeActionContext, _token: CancellationToken): Promise<languages.CodeActionList>;
    _getAdditionalMenuItems(context: languages.CodeActionContext, actions: readonly languages.CodeAction[]): languages.Command[];
}
