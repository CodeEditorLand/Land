import { IHeaders } from '../../../base/parts/request/common/request.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IProductService } from '../../product/common/productService.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export declare function resolveMarketplaceHeaders(version: string, productService: IProductService, environmentService: IEnvironmentService, configurationService: IConfigurationService, fileService: IFileService, storageService: IStorageService | undefined, telemetryService: ITelemetryService): Promise<IHeaders>;
