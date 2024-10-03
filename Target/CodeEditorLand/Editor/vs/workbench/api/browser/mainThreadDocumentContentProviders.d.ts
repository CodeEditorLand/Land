import { UriComponents } from '../../../base/common/uri.js';
import { IEditorWorkerService } from '../../../editor/common/services/editorWorker.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { ILanguageService } from '../../../editor/common/languages/language.js';
import { ITextModelService } from '../../../editor/common/services/resolverService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadDocumentContentProvidersShape } from '../common/extHost.protocol.js';
export declare class MainThreadDocumentContentProviders implements MainThreadDocumentContentProvidersShape {
    private readonly _textModelResolverService;
    private readonly _languageService;
    private readonly _modelService;
    private readonly _editorWorkerService;
    private readonly _resourceContentProvider;
    private readonly _pendingUpdate;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _textModelResolverService: ITextModelService, _languageService: ILanguageService, _modelService: IModelService, _editorWorkerService: IEditorWorkerService);
    dispose(): void;
    $registerTextContentProvider(handle: number, scheme: string): void;
    $unregisterTextContentProvider(handle: number): void;
    $onVirtualDocumentChange(uri: UriComponents, value: string): Promise<void>;
}
