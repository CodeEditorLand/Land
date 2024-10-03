import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { EditorAction2 } from '../../../../editor/browser/editorExtensions.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { InspectSubject } from './testResultsView/testResultsSubject.js';
import { MutableObservableValue } from '../common/observableValue.js';
import { ITestResult } from '../common/testResult.js';
import { ITestResultService } from '../common/testResultService.js';
import { ITestService } from '../common/testService.js';
import { TestResultItem } from '../common/testTypes.js';
import { IShowResultOptions, ITestingPeekOpener } from '../common/testingPeekOpener.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
export declare class TestingPeekOpener extends Disposable implements ITestingPeekOpener {
    private readonly configuration;
    private readonly editorService;
    private readonly codeEditorService;
    private readonly testResults;
    private readonly testService;
    private readonly storageService;
    private readonly viewsService;
    private readonly commandService;
    private readonly notificationService;
    _serviceBrand: undefined;
    private lastUri?;
    readonly historyVisible: MutableObservableValue<boolean>;
    constructor(configuration: IConfigurationService, editorService: IEditorService, codeEditorService: ICodeEditorService, testResults: ITestResultService, testService: ITestService, storageService: IStorageService, viewsService: IViewsService, commandService: ICommandService, notificationService: INotificationService);
    open(): Promise<boolean>;
    tryPeekFirstError(result: ITestResult, test: TestResultItem, options?: Partial<ITextEditorOptions>): boolean;
    peekUri(uri: URI, options?: IShowResultOptions): boolean;
    closeAllPeeks(): void;
    openCurrentInEditor(): void;
    private getActiveControl;
    private showPeekFromUri;
    private openPeekOnFailure;
    private getFileCandidateMessage;
    private getAnyCandidateMessage;
    private getFailedCandidateMessage;
}
export declare class TestingOutputPeekController extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly codeEditorService;
    private readonly instantiationService;
    private readonly testResults;
    static get(editor: ICodeEditor): TestingOutputPeekController | null;
    private readonly peek;
    private readonly visible;
    get subject(): InspectSubject | undefined;
    constructor(editor: ICodeEditor, codeEditorService: ICodeEditorService, instantiationService: IInstantiationService, testResults: ITestResultService, contextKeyService: IContextKeyService);
    show(uri: URI): Promise<void>;
    showSubject(subject: InspectSubject): Promise<void>;
    openAndShow(uri: URI): Promise<void>;
    removePeek(): void;
    collapseStack(): void;
    next(): void;
    previous(): void;
    removeIfPeekingForTest(testId: string): void;
    private closePeekOnTestChange;
    private closePeekOnCertainResultEvents;
    private retrieveTest;
}
export declare class TestResultsView extends ViewPane {
    private readonly resultService;
    private readonly content;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, resultService: ITestResultService);
    get subject(): InspectSubject | undefined;
    showLatestRun(preserveFocus?: boolean): void;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    private renderContent;
}
export declare class CloseTestPeek extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GoToNextMessageAction extends Action2 {
    static readonly ID = "testing.goToNextMessage";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class GoToPreviousMessageAction extends Action2 {
    static readonly ID = "testing.goToPreviousMessage";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class CollapsePeekStack extends Action2 {
    static readonly ID = "testing.collapsePeekStack";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class OpenMessageInEditorAction extends Action2 {
    static readonly ID = "testing.openMessageInEditor";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ToggleTestingPeekHistory extends Action2 {
    static readonly ID = "testing.toggleTestingPeekHistory";
    constructor();
    run(accessor: ServicesAccessor): void;
}
