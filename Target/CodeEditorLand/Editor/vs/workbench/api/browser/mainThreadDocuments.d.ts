import { IReference, Disposable } from '../../../base/common/lifecycle.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { ITextModel } from '../../../editor/common/model.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { ITextModelService } from '../../../editor/common/services/resolverService.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { MainThreadDocumentsShape } from '../common/extHost.protocol.js';
import { ITextFileService } from '../../services/textfile/common/textfiles.js';
import { IWorkbenchEnvironmentService } from '../../services/environment/common/environmentService.js';
import { IExtUri } from '../../../base/common/resources.js';
import { IWorkingCopyFileService } from '../../services/workingCopy/common/workingCopyFileService.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
import { Event } from '../../../base/common/event.js';
import { IPathService } from '../../services/path/common/pathService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class BoundModelReferenceCollection {
    private readonly _extUri;
    private readonly _maxAge;
    private readonly _maxLength;
    private readonly _maxSize;
    private _data;
    private _length;
    constructor(_extUri: IExtUri, _maxAge?: number, _maxLength?: number, _maxSize?: number);
    dispose(): void;
    remove(uri: URI): void;
    add(uri: URI, ref: IReference<any>, length?: number): void;
    private _cleanup;
}
export declare class MainThreadDocuments extends Disposable implements MainThreadDocumentsShape {
    private readonly _modelService;
    private readonly _textFileService;
    private readonly _fileService;
    private readonly _textModelResolverService;
    private readonly _environmentService;
    private readonly _uriIdentityService;
    private readonly _pathService;
    private _onIsCaughtUpWithContentChanges;
    readonly onIsCaughtUpWithContentChanges: Event<URI>;
    private readonly _proxy;
    private readonly _modelTrackers;
    private readonly _modelReferenceCollection;
    constructor(extHostContext: IExtHostContext, _modelService: IModelService, _textFileService: ITextFileService, _fileService: IFileService, _textModelResolverService: ITextModelService, _environmentService: IWorkbenchEnvironmentService, _uriIdentityService: IUriIdentityService, workingCopyFileService: IWorkingCopyFileService, _pathService: IPathService);
    dispose(): void;
    isCaughtUpWithContentChanges(resource: URI): boolean;
    private _shouldHandleFileEvent;
    handleModelAdded(model: ITextModel): void;
    private _onModelModeChanged;
    handleModelRemoved(modelUrl: URI): void;
    $trySaveDocument(uri: UriComponents): Promise<boolean>;
    $tryOpenDocument(uriData: UriComponents): Promise<URI>;
    $tryCreateDocument(options?: {
        language?: string;
        content?: string;
    }): Promise<URI>;
    private _handleAsResourceInput;
    private _handleUntitledScheme;
    private _doCreateUntitled;
}
