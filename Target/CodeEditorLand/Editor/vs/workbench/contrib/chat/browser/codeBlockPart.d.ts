import './codeBlockPart.css';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IRange, Range } from '../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IResolvedTextEditorModel, ITextModelContentProvider, ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IMarkdownVulnerability } from '../common/annotations.js';
import { IChatResponseModel, IChatTextEditGroup } from '../common/chatModel.js';
import { IChatResponseViewModel } from '../common/chatViewModel.js';
import { ChatTreeItem } from './chat.js';
import { IChatRendererDelegate } from './chatListRenderer.js';
import { ChatEditorOptions } from './chatOptions.js';
export interface ICodeBlockData {
    readonly codeBlockIndex: number;
    readonly element: unknown;
    readonly textModel: Promise<IResolvedTextEditorModel>;
    readonly languageId: string;
    readonly codemapperUri?: URI;
    readonly vulns?: readonly IMarkdownVulnerability[];
    readonly range?: Range;
    readonly parentContextKeyService?: IContextKeyService;
    readonly hideToolbar?: boolean;
}
export declare const localFileLanguageId = "vscode-local-file";
export declare function parseLocalFileData(text: string): {
    uri: URI;
    range: IRange | undefined;
};
export interface ICodeBlockActionContext {
    code: string;
    codemapperUri?: URI;
    languageId?: string;
    codeBlockIndex: number;
    element: unknown;
}
export declare class CodeBlockPart extends Disposable {
    private readonly options;
    readonly menuId: MenuId;
    protected readonly modelService: IModelService;
    private readonly configurationService;
    private readonly accessibilityService;
    protected readonly _onDidChangeContentHeight: Emitter<void>;
    readonly onDidChangeContentHeight: Event<void>;
    readonly editor: CodeEditorWidget;
    protected readonly toolbar: MenuWorkbenchToolBar;
    private readonly contextKeyService;
    readonly element: HTMLElement;
    private readonly vulnsButton;
    private readonly vulnsListElement;
    private currentCodeBlockData;
    private currentScrollWidth;
    private readonly disposableStore;
    private isDisposed;
    private resourceContextKey;
    constructor(options: ChatEditorOptions, menuId: MenuId, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, modelService: IModelService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService);
    dispose(): void;
    get uri(): URI | undefined;
    private createEditor;
    focus(): void;
    private updatePaddingForLayout;
    private _configureForScreenReader;
    private getEditorOptionsFromConfig;
    layout(width: number): void;
    private getContentHeight;
    render(data: ICodeBlockData, width: number, editable: boolean | undefined): Promise<void>;
    reset(): void;
    private clearWidgets;
    private updateEditor;
    private getVulnerabilitiesLabel;
}
export declare class ChatCodeBlockContentProvider extends Disposable implements ITextModelContentProvider {
    private readonly _modelService;
    constructor(textModelService: ITextModelService, _modelService: IModelService);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
export interface ICodeCompareBlockActionContext {
    readonly element: IChatResponseViewModel;
    readonly diffEditor: IDiffEditor;
    readonly edit: IChatTextEditGroup;
}
export interface ICodeCompareBlockDiffData {
    modified: ITextModel;
    original: ITextModel;
    originalSha1: string;
}
export interface ICodeCompareBlockData {
    readonly element: ChatTreeItem;
    readonly edit: IChatTextEditGroup;
    readonly diffData: Promise<ICodeCompareBlockDiffData | undefined>;
    readonly parentContextKeyService?: IContextKeyService;
}
export declare class CodeCompareBlockPart extends Disposable {
    private readonly options;
    readonly menuId: MenuId;
    protected readonly modelService: IModelService;
    private readonly configurationService;
    private readonly accessibilityService;
    private readonly labelService;
    private readonly openerService;
    protected readonly _onDidChangeContentHeight: Emitter<void>;
    readonly onDidChangeContentHeight: Event<void>;
    private readonly contextKeyService;
    private readonly diffEditor;
    private readonly resourceLabel;
    private readonly toolbar;
    readonly element: HTMLElement;
    private readonly messageElement;
    private readonly _lastDiffEditorViewModel;
    private currentScrollWidth;
    constructor(options: ChatEditorOptions, menuId: MenuId, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, modelService: IModelService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService, labelService: ILabelService, openerService: IOpenerService);
    get uri(): URI | undefined;
    private createDiffEditor;
    focus(): void;
    private updatePaddingForLayout;
    private _configureForScreenReader;
    private getEditorOptionsFromConfig;
    layout(width: number): void;
    render(data: ICodeCompareBlockData, width: number, token: CancellationToken): Promise<void>;
    reset(): void;
    private clearWidgets;
    private updateEditor;
}
export declare class DefaultChatTextEditor {
    private readonly modelService;
    private readonly editorService;
    private readonly dialogService;
    private readonly _sha1;
    constructor(modelService: ITextModelService, editorService: ICodeEditorService, dialogService: IDialogService);
    apply(response: IChatResponseModel | IChatResponseViewModel, item: IChatTextEditGroup, diffEditor: IDiffEditor | undefined): Promise<void>;
    private _applyWithDiffEditor;
    private _apply;
    private _checkSha1;
    discard(response: IChatResponseModel | IChatResponseViewModel, item: IChatTextEditGroup): void;
}
