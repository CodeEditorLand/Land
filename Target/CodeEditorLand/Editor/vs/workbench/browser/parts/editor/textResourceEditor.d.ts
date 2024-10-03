import { IEditorOpenContext } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { AbstractTextResourceEditorInput } from '../../../common/editor/textResourceEditorInput.js';
import { AbstractTextCodeEditor } from './textCodeEditor.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ICodeEditorViewState } from '../../../../editor/common/editorCommon.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IEditorOptions as ICodeEditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IFileService } from '../../../../platform/files/common/files.js';
export declare abstract class AbstractTextResourceEditor extends AbstractTextCodeEditor<ICodeEditorViewState> {
    constructor(id: string, group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorGroupService: IEditorGroupsService, editorService: IEditorService, fileService: IFileService);
    setInput(input: AbstractTextResourceEditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    revealLastLine(): void;
    clearInput(): void;
    protected tracksEditorViewState(input: EditorInput): boolean;
}
export declare class TextResourceEditor extends AbstractTextResourceEditor {
    private readonly modelService;
    private readonly languageService;
    static readonly ID = "workbench.editors.textResourceEditor";
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorService: IEditorService, editorGroupService: IEditorGroupsService, modelService: IModelService, languageService: ILanguageService, fileService: IFileService);
    protected createEditorControl(parent: HTMLElement, configuration: ICodeEditorOptions): void;
    private onDidEditorPaste;
}
