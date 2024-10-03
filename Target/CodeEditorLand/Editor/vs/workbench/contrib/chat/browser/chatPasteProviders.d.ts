import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IReadonlyVSDataTransfer } from '../../../../base/common/dataTransfer.js';
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { DocumentPasteContext, DocumentPasteEditProvider, DocumentPasteEditsSession } from '../../../../editor/common/languages.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare class PasteImageProvider implements DocumentPasteEditProvider {
    readonly kind: HierarchicalKind;
    readonly pasteMimeTypes: string[];
    provideDocumentPasteEdits(_model: ITextModel, _ranges: readonly IRange[], dataTransfer: IReadonlyVSDataTransfer, context: DocumentPasteContext, token: CancellationToken): Promise<DocumentPasteEditsSession | undefined>;
}
export declare class ChatPasteProvidersFeature extends Disposable {
    constructor(languageFeaturesService: ILanguageFeaturesService);
}
