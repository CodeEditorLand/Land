import { URI, UriComponents } from '../../../base/common/uri.js';
import { NotebookTextModel } from '../../contrib/notebook/common/model/notebookTextModel.js';
import { INotebookEditorModelResolverService } from '../../contrib/notebook/common/notebookEditorModelResolverService.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
import { MainThreadNotebookDocumentsShape, NotebookDataDto } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadNotebookDocuments implements MainThreadNotebookDocumentsShape {
    private readonly _notebookEditorModelResolverService;
    private readonly _uriIdentityService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _documentEventListenersMapping;
    private readonly _modelReferenceCollection;
    constructor(extHostContext: IExtHostContext, _notebookEditorModelResolverService: INotebookEditorModelResolverService, _uriIdentityService: IUriIdentityService);
    dispose(): void;
    handleNotebooksAdded(notebooks: readonly NotebookTextModel[]): void;
    handleNotebooksRemoved(uris: URI[]): void;
    $tryCreateNotebook(options: {
        viewType: string;
        content?: NotebookDataDto;
    }): Promise<UriComponents>;
    $tryOpenNotebook(uriComponents: UriComponents): Promise<URI>;
    $trySaveNotebook(uriComponents: UriComponents): Promise<boolean>;
}
