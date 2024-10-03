var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { URI } from '../../../../base/common/uri.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
let DefaultConfigurationExportHelper = class DefaultConfigurationExportHelper {
    constructor(environmentService, extensionService, commandService, fileService, productService) {
        this.extensionService = extensionService;
        this.commandService = commandService;
        this.fileService = fileService;
        this.productService = productService;
        const exportDefaultConfigurationPath = environmentService.args['export-default-configuration'];
        if (exportDefaultConfigurationPath) {
            this.writeConfigModelAndQuit(URI.file(exportDefaultConfigurationPath));
        }
    }
    async writeConfigModelAndQuit(target) {
        try {
            await this.extensionService.whenInstalledExtensionsRegistered();
            await this.writeConfigModel(target);
        }
        finally {
            this.commandService.executeCommand('workbench.action.quit');
        }
    }
    async writeConfigModel(target) {
        const config = this.getConfigModel();
        const resultString = JSON.stringify(config, undefined, '  ');
        await this.fileService.writeFile(target, VSBuffer.fromString(resultString));
    }
    getConfigModel() {
        const configRegistry = Registry.as(Extensions.Configuration);
        const configurations = configRegistry.getConfigurations().slice();
        const settings = [];
        const processedNames = new Set();
        const processProperty = (name, prop) => {
            if (processedNames.has(name)) {
                console.warn('Setting is registered twice: ' + name);
                return;
            }
            processedNames.add(name);
            const propDetails = {
                name,
                description: prop.description || prop.markdownDescription || '',
                default: prop.default,
                type: prop.type
            };
            if (prop.enum) {
                propDetails.enum = prop.enum;
            }
            if (prop.enumDescriptions || prop.markdownEnumDescriptions) {
                propDetails.enumDescriptions = prop.enumDescriptions || prop.markdownEnumDescriptions;
            }
            settings.push(propDetails);
        };
        const processConfig = (config) => {
            if (config.properties) {
                for (const name in config.properties) {
                    processProperty(name, config.properties[name]);
                }
            }
            config.allOf?.forEach(processConfig);
        };
        configurations.forEach(processConfig);
        const excludedProps = configRegistry.getExcludedConfigurationProperties();
        for (const name in excludedProps) {
            processProperty(name, excludedProps[name]);
        }
        const result = {
            settings: settings.sort((a, b) => a.name.localeCompare(b.name)),
            buildTime: Date.now(),
            commit: this.productService.commit,
            buildNumber: this.productService.settingsSearchBuildId
        };
        return result;
    }
};
DefaultConfigurationExportHelper = __decorate([
    __param(0, INativeWorkbenchEnvironmentService),
    __param(1, IExtensionService),
    __param(2, ICommandService),
    __param(3, IFileService),
    __param(4, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], DefaultConfigurationExportHelper);
export { DefaultConfigurationExportHelper };
