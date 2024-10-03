import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { SideBySideEditor } from './sideBySideEditor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class BinaryResourceDiffEditor extends SideBySideEditor {
    static readonly ID = "workbench.editors.binaryResourceDiffEditor";
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    getMetadata(): string | undefined;
}
