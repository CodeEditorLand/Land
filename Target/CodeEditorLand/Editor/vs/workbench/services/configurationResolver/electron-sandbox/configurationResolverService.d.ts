import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { BaseConfigurationResolverService } from '../browser/baseConfigurationResolverService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IShellEnvironmentService } from '../../environment/electron-sandbox/shellEnvironmentService.js';
import { IPathService } from '../../path/common/pathService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class ConfigurationResolverService extends BaseConfigurationResolverService {
    constructor(editorService: IEditorService, environmentService: INativeWorkbenchEnvironmentService, configurationService: IConfigurationService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, quickInputService: IQuickInputService, labelService: ILabelService, shellEnvironmentService: IShellEnvironmentService, pathService: IPathService, extensionService: IExtensionService, storageService: IStorageService);
}
