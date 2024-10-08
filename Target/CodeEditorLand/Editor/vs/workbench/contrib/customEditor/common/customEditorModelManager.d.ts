import { IReference } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICustomEditorModel, ICustomEditorModelManager } from './customEditor.js';
export declare class CustomEditorModelManager implements ICustomEditorModelManager {
    private readonly _references;
    getAllModels(resource: URI): Promise<ICustomEditorModel[]>;
    get(resource: URI, viewType: string): Promise<ICustomEditorModel | undefined>;
    tryRetain(resource: URI, viewType: string): Promise<IReference<ICustomEditorModel>> | undefined;
    add(resource: URI, viewType: string, model: Promise<ICustomEditorModel>): Promise<IReference<ICustomEditorModel>>;
    disposeAllModelsForView(viewType: string): void;
    private key;
}
