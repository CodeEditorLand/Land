import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { BaseConfigurationResolverService } from './baseConfigurationResolverService.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IPathService } from '../../path/common/pathService.js';
export declare class ConfigurationResolverService extends BaseConfigurationResolverService {
    constructor(editorService: IEditorService, configurationService: IConfigurationService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, quickInputService: IQuickInputService, labelService: ILabelService, pathService: IPathService, extensionService: IExtensionService, storageService: IStorageService);
}
