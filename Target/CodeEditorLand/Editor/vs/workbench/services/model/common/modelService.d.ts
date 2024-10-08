import { URI } from '../../../../base/common/uri.js';
import { ModelService } from '../../../../editor/common/services/modelService.js';
import { ITextResourcePropertiesService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IUndoRedoService } from '../../../../platform/undoRedo/common/undoRedo.js';
import { IPathService } from '../../path/common/pathService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class WorkbenchModelService extends ModelService {
    private readonly _pathService;
    constructor(configurationService: IConfigurationService, resourcePropertiesService: ITextResourcePropertiesService, undoRedoService: IUndoRedoService, _pathService: IPathService, instantiationService: IInstantiationService);
    protected _schemaShouldMaintainUndoRedoElements(resource: URI): boolean;
}
