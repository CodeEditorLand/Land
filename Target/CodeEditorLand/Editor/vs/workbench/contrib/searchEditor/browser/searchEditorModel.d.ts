import { URI } from '../../../../base/common/uri.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { SearchConfiguration } from './searchEditorInput.js';
import { ResourceMap } from '../../../../base/common/map.js';
export type SearchEditorData = {
    resultsModel: ITextModel;
    configurationModel: SearchConfigurationModel;
};
export declare class SearchConfigurationModel {
    config: Readonly<SearchConfiguration>;
    private _onConfigDidUpdate;
    readonly onConfigDidUpdate: import("../../../workbench.web.main.internal.js").Event<SearchConfiguration>;
    constructor(config: Readonly<SearchConfiguration>);
    updateConfig(config: SearchConfiguration): void;
}
export declare class SearchEditorModel {
    private resource;
    constructor(resource: URI);
    resolve(): Promise<SearchEditorData>;
}
declare class SearchEditorModelFactory {
    models: ResourceMap<{
        resolve: () => Promise<SearchEditorData>;
    }>;
    constructor();
    initializeModelFromExistingModel(accessor: ServicesAccessor, resource: URI, config: SearchConfiguration): void;
    initializeModelFromRawData(accessor: ServicesAccessor, resource: URI, config: SearchConfiguration, contents: string | undefined): void;
    initializeModelFromExistingFile(accessor: ServicesAccessor, resource: URI, existingFile: URI): void;
    private tryFetchModelFromBackupService;
}
export declare const searchEditorModelFactory: SearchEditorModelFactory;
export {};
