import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IDisposable, IReference, Disposable } from '../../../../base/common/lifecycle.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService, ITextModelContentProvider, IResolvedTextEditorModel } from '../../../../editor/common/services/resolverService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IUndoRedoService } from '../../../../platform/undoRedo/common/undoRedo.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
export declare class TextModelResolverService extends Disposable implements ITextModelService {
    private readonly instantiationService;
    private readonly fileService;
    private readonly undoRedoService;
    private readonly modelService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private _resourceModelCollection;
    private get resourceModelCollection();
    private _asyncModelCollection;
    private get asyncModelCollection();
    constructor(instantiationService: IInstantiationService, fileService: IFileService, undoRedoService: IUndoRedoService, modelService: IModelService, uriIdentityService: IUriIdentityService);
    createModelReference(resource: URI): Promise<IReference<IResolvedTextEditorModel>>;
    registerTextModelContentProvider(scheme: string, provider: ITextModelContentProvider): IDisposable;
    canHandleResource(resource: URI): boolean;
}
