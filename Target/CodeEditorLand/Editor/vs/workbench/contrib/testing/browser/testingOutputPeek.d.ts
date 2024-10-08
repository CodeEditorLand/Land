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
    /** @inheritdoc */
    readonly historyVisible: MutableObservableValue<boolean>;
    constructor(configuration: IConfigurationService, editorService: IEditorService, codeEditorService: ICodeEditorService, testResults: ITestResultService, testService: ITestService, storageService: IStorageService, viewsService: IViewsService, commandService: ICommandService, notificationService: INotificationService);
    /** @inheritdoc */
    open(): Promise<boolean>;
    /** @inheritdoc */
    tryPeekFirstError(result: ITestResult, test: TestResultItem, options?: Partial<ITextEditorOptions>): boolean;
    /** @inheritdoc */
    peekUri(uri: URI, options?: IShowResultOptions): boolean;
    /** @inheritdoc */
    closeAllPeeks(): void;
    openCurrentInEditor(): void;
    private getActiveControl;
    /** @inheritdoc */
    private showPeekFromUri;
    /**
     * Opens the peek view on a test failure, based on user preferences.
     */
    private openPeekOnFailure;
    /**
     * Gets the message closest to the given position from a test in the file.
     */
    private getFileCandidateMessage;
    /**
     * Gets any possible still-relevant message from the results.
     */
    private getAnyCandidateMessage;
    /**
     * Gets the first failed message that can be displayed from the result.
     */
    private getFailedCandidateMessage;
}
/**
 * Adds output/message peek functionality to code editors.
 */
export declare class TestingOutputPeekController extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly codeEditorService;
    private readonly instantiationService;
    private readonly testResults;
    /**
     * Gets the controller associated with the given code editor.
     */
    static get(editor: ICodeEditor): TestingOutputPeekController | null;
    /**
     * Currently-shown peek view.
     */
    private readonly peek;
    /**
     * Context key updated when the peek is visible/hidden.
     */
    private readonly visible;
    /**
     * Gets the currently display subject. Undefined if the peek is not open.
     */
    get subject(): InspectSubject | undefined;
    constructor(editor: ICodeEditor, codeEditorService: ICodeEditorService, instantiationService: IInstantiationService, testResults: ITestResultService, contextKeyService: IContextKeyService);
    /**
     * Shows a peek for the message in the editor.
     */
    show(uri: URI): Promise<void>;
    /**
     * Shows a peek for the existing inspect subject.
     */
    showSubject(subject: InspectSubject): Promise<void>;
    openAndShow(uri: URI): Promise<void>;
    /**
     * Disposes the peek view, if any.
     */
    removePeek(): void;
    /**
     * Collapses all displayed stack frames.
     */
    collapseStack(): void;
    /**
     * Shows the next message in the peek, if possible.
     */
    next(): void;
    /**
     * Shows the previous message in the peek, if possible.
     */
    previous(): void;
    /**
     * Removes the peek view if it's being displayed on the given test ID.
     */
    removeIfPeekingForTest(testId: string): void;
    /**
     * If the test we're currently showing has its state change to something
     * else, then clear the peek.
     */
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
