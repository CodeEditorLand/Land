import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IReadonlyVSDataTransfer } from '../../../../base/common/dataTransfer.js';
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { DocumentPasteContext, DocumentPasteEditProvider, DocumentPasteEditsSession } from '../../../../editor/common/languages.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IChatWidgetService } from './chat.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare class PasteImageProvider implements DocumentPasteEditProvider {
    private readonly chatWidgetService;
    private readonly configurationService;
    readonly kind: HierarchicalKind;
    readonly pasteMimeTypes: string[];
    constructor(chatWidgetService: IChatWidgetService, configurationService: IConfigurationService);
    provideDocumentPasteEdits(_model: ITextModel, _ranges: readonly IRange[], dataTransfer: IReadonlyVSDataTransfer, context: DocumentPasteContext, token: CancellationToken): Promise<DocumentPasteEditsSession | undefined>;
}
export declare function imageToHash(data: Uint8Array): Promise<string>;
export declare function isImage(array: Uint8Array): boolean;
export declare class ChatPasteProvidersFeature extends Disposable {
    constructor(languageFeaturesService: ILanguageFeaturesService, chatWidgetService: IChatWidgetService, configurationService: IConfigurationService);
}
