import { URI } from '../../../../../base/common/uri.js';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
export interface IDiffEditorHeightCalculatorService {
    diffAndComputeHeight(original: URI, modified: URI): Promise<number>;
    computeHeightFromLines(lineCount: number): number;
}
export declare class DiffEditorHeightCalculatorService {
    private readonly lineHeight;
    private readonly textModelResolverService;
    private readonly editorWorkerService;
    private readonly configurationService;
    constructor(lineHeight: number, textModelResolverService: ITextModelService, editorWorkerService: IEditorWorkerService, configurationService: IConfigurationService);
    diffAndComputeHeight(original: URI, modified: URI): Promise<number>;
    computeHeightFromLines(lineCount: number): number;
}
