import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IAssignmentService } from '../../../../platform/assignment/common/assignment.js';
import { BaseAssignmentService } from '../../../../platform/assignment/common/assignmentService.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
export declare const IWorkbenchAssignmentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchAssignmentService>;
export interface IWorkbenchAssignmentService extends IAssignmentService {
    getCurrentExperiments(): Promise<string[] | undefined>;
}
export declare class WorkbenchAssignmentService extends BaseAssignmentService {
    private telemetryService;
    constructor(telemetryService: ITelemetryService, storageService: IStorageService, configurationService: IConfigurationService, productService: IProductService, environmentService: IEnvironmentService);
    protected get experimentsEnabled(): boolean;
    getTreatment<T extends string | number | boolean>(name: string): Promise<T | undefined>;
    getCurrentExperiments(): Promise<string[] | undefined>;
}
