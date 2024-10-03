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
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IConfigurationResolverService } from '../common/configurationResolver.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { BaseConfigurationResolverService } from '../browser/baseConfigurationResolverService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IShellEnvironmentService } from '../../environment/electron-sandbox/shellEnvironmentService.js';
import { IPathService } from '../../path/common/pathService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
let ConfigurationResolverService = class ConfigurationResolverService extends BaseConfigurationResolverService {
    constructor(editorService, environmentService, configurationService, commandService, workspaceContextService, quickInputService, labelService, shellEnvironmentService, pathService, extensionService, storageService) {
        super({
            getAppRoot: () => {
                return environmentService.appRoot;
            },
            getExecPath: () => {
                return environmentService.execPath;
            },
        }, shellEnvironmentService.getShellEnv(), editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService, storageService);
    }
};
ConfigurationResolverService = __decorate([
    __param(0, IEditorService),
    __param(1, INativeWorkbenchEnvironmentService),
    __param(2, IConfigurationService),
    __param(3, ICommandService),
    __param(4, IWorkspaceContextService),
    __param(5, IQuickInputService),
    __param(6, ILabelService),
    __param(7, IShellEnvironmentService),
    __param(8, IPathService),
    __param(9, IExtensionService),
    __param(10, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ConfigurationResolverService);
export { ConfigurationResolverService };
registerSingleton(IConfigurationResolverService, ConfigurationResolverService, 1);
