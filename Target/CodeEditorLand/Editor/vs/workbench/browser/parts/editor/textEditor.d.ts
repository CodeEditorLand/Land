import { URI } from '../../../../base/common/uri.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorOpenContext, IEditorPaneSelection, EditorPaneSelectionCompareResult, IEditorPaneWithSelection, IEditorPaneSelectionChangeEvent, IEditorPaneScrollPosition, IEditorPaneWithScrolling } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { AbstractEditorWithViewState } from './editorWithViewState.js';
import { IEditorViewState } from '../../../../editor/common/editorCommon.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ITextResourceConfigurationChangeEvent, ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IEditorOptions as ICodeEditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IEditorOptions, ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
export interface IEditorConfiguration {
    editor: object;
    diffEditor: object;
    accessibility?: {
        verbosity?: {
            diffEditor?: boolean;
        };
    };
    problems?: {
        visibility?: boolean;
    };
}
export declare abstract class AbstractTextEditor<T extends IEditorViewState> extends AbstractEditorWithViewState<T> implements IEditorPaneWithSelection, IEditorPaneWithScrolling {
    protected readonly fileService: IFileService;
    private static readonly VIEW_STATE_PREFERENCE_KEY;
    protected readonly _onDidChangeSelection: Emitter<IEditorPaneSelectionChangeEvent>;
    readonly onDidChangeSelection: Event<IEditorPaneSelectionChangeEvent>;
    protected readonly _onDidChangeScroll: Emitter<void>;
    readonly onDidChangeScroll: Event<void>;
    private editorContainer;
    private hasPendingConfigurationChange;
    private lastAppliedEditorOptions?;
    private readonly inputListener;
    constructor(id: string, group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorService: IEditorService, editorGroupService: IEditorGroupsService, fileService: IFileService);
    private handleConfigurationChangeEvent;
    protected shouldHandleConfigurationChangeEvent(e: ITextResourceConfigurationChangeEvent, resource: URI | undefined): boolean;
    private consumePendingConfigurationChangeEvent;
    protected computeConfiguration(configuration: IEditorConfiguration): ICodeEditorOptions;
    protected computeAriaLabel(): string;
    private onDidChangeFileSystemProvider;
    private onDidChangeInputCapabilities;
    protected updateReadonly(input: EditorInput): void;
    protected getReadonlyConfiguration(isReadonly: boolean | IMarkdownString | undefined): {
        readOnly: boolean;
        readOnlyMessage: IMarkdownString | undefined;
    };
    protected getConfigurationOverrides(configuration: IEditorConfiguration): ICodeEditorOptions;
    protected createEditor(parent: HTMLElement): void;
    private registerCodeEditorListeners;
    private toEditorPaneSelectionChangeReason;
    getSelection(): IEditorPaneSelection | undefined;
    protected abstract createEditorControl(parent: HTMLElement, initialOptions: ICodeEditorOptions): void;
    protected abstract updateEditorControlOptions(options: ICodeEditorOptions): void;
    protected abstract getMainControl(): ICodeEditor | undefined;
    setInput(input: EditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    clearInput(): void;
    getScrollPosition(): IEditorPaneScrollPosition;
    setScrollPosition(scrollPosition: IEditorPaneScrollPosition): void;
    protected setEditorVisible(visible: boolean): void;
    protected toEditorViewStateResource(input: EditorInput): URI | undefined;
    private updateEditorConfiguration;
    private getActiveResource;
    dispose(): void;
}
export declare class TextEditorPaneSelection implements IEditorPaneSelection {
    private readonly textSelection;
    private static readonly TEXT_EDITOR_SELECTION_THRESHOLD;
    constructor(textSelection: Selection);
    compare(other: IEditorPaneSelection): EditorPaneSelectionCompareResult;
    restore(options: IEditorOptions): ITextEditorOptions;
    log(): string;
}
