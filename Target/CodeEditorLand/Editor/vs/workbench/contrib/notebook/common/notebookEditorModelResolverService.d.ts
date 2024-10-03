import { URI } from '../../../../base/common/uri.js';
import { IResolvedNotebookEditorModel, NotebookEditorModelCreationOptions } from './notebookCommon.js';
import { IReference } from '../../../../base/common/lifecycle.js';
import { Event, IWaitUntil } from '../../../../base/common/event.js';
import { NotebookTextModel } from './model/notebookTextModel.js';
export declare const INotebookEditorModelResolverService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookEditorModelResolverService>;
export interface INotebookConflictEvent extends IWaitUntil {
    resource: URI;
    viewType: string;
}
export interface IUntitledNotebookResource {
    untitledResource: URI | undefined;
}
export interface INotebookEditorModelResolverService {
    readonly _serviceBrand: undefined;
    readonly onDidSaveNotebook: Event<URI>;
    readonly onDidChangeDirty: Event<IResolvedNotebookEditorModel>;
    readonly onWillFailWithConflict: Event<INotebookConflictEvent>;
    isDirty(resource: URI): boolean;
    createUntitledNotebookTextModel(viewType: string): Promise<NotebookTextModel>;
    resolve(resource: URI, viewType?: string, creationOptions?: NotebookEditorModelCreationOptions): Promise<IReference<IResolvedNotebookEditorModel>>;
    resolve(resource: IUntitledNotebookResource, viewType: string, creationOtions?: NotebookEditorModelCreationOptions): Promise<IReference<IResolvedNotebookEditorModel>>;
}
