import { URI } from '../../../../base/common/uri.js';
import { TextResourceEditorInput } from '../../../common/editor/textResourceEditorInput.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { ICustomEditorLabelService } from '../../../services/editor/common/customEditorLabelService.js';
export declare class PerfviewContrib {
    private readonly _instaService;
    static get(): PerfviewContrib;
    static readonly ID = "workbench.contrib.perfview";
    private readonly _inputUri;
    private readonly _registration;
    constructor(_instaService: IInstantiationService, textModelResolverService: ITextModelService);
    dispose(): void;
    getInputUri(): URI;
    getEditorInput(): PerfviewInput;
}
export declare class PerfviewInput extends TextResourceEditorInput {
    static readonly Id = "PerfviewInput";
    get typeId(): string;
    constructor(textModelResolverService: ITextModelService, textFileService: ITextFileService, editorService: IEditorService, fileService: IFileService, labelService: ILabelService, filesConfigurationService: IFilesConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
}
