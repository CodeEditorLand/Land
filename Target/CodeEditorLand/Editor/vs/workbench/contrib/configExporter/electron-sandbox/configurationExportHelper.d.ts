import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare class DefaultConfigurationExportHelper {
    private readonly extensionService;
    private readonly commandService;
    private readonly fileService;
    private readonly productService;
    constructor(environmentService: INativeWorkbenchEnvironmentService, extensionService: IExtensionService, commandService: ICommandService, fileService: IFileService, productService: IProductService);
    private writeConfigModelAndQuit;
    private writeConfigModel;
    private getConfigModel;
}
