import { GroupIdentifier, IRevertOptions, IUntypedEditorInput } from '../editor.js';
import { EditorInput } from './editorInput.js';
import { AbstractResourceEditorInput } from './resourceEditorInput.js';
import { URI } from '../../../base/common/uri.js';
import { ITextFileService, ITextFileSaveOptions, ILanguageSupport } from '../../services/textfile/common/textfiles.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { ILabelService } from '../../../platform/label/common/label.js';
import { ITextEditorModel, ITextModelService } from '../../../editor/common/services/resolverService.js';
import { IFilesConfigurationService } from '../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextResourceConfigurationService } from '../../../editor/common/services/textResourceConfiguration.js';
import { ICustomEditorLabelService } from '../../services/editor/common/customEditorLabelService.js';
export declare abstract class AbstractTextResourceEditorInput extends AbstractResourceEditorInput {
    protected readonly editorService: IEditorService;
    protected readonly textFileService: ITextFileService;
    constructor(resource: URI, preferredResource: URI | undefined, editorService: IEditorService, textFileService: ITextFileService, labelService: ILabelService, fileService: IFileService, filesConfigurationService: IFilesConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
    save(group: GroupIdentifier, options?: ITextFileSaveOptions): Promise<IUntypedEditorInput | undefined>;
    saveAs(group: GroupIdentifier, options?: ITextFileSaveOptions): Promise<IUntypedEditorInput | undefined>;
    private doSave;
    revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
}
export declare class TextResourceEditorInput extends AbstractTextResourceEditorInput implements ILanguageSupport {
    private name;
    private description;
    private preferredLanguageId;
    private preferredContents;
    private readonly textModelService;
    static readonly ID: string;
    get typeId(): string;
    get editorId(): string | undefined;
    private cachedModel;
    private modelReference;
    constructor(resource: URI, name: string | undefined, description: string | undefined, preferredLanguageId: string | undefined, preferredContents: string | undefined, textModelService: ITextModelService, textFileService: ITextFileService, editorService: IEditorService, fileService: IFileService, labelService: ILabelService, filesConfigurationService: IFilesConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
    getName(): string;
    setName(name: string): void;
    getDescription(): string | undefined;
    setDescription(description: string): void;
    setLanguageId(languageId: string, source?: string): void;
    setPreferredLanguageId(languageId: string): void;
    setPreferredContents(contents: string): void;
    resolve(): Promise<ITextEditorModel>;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
