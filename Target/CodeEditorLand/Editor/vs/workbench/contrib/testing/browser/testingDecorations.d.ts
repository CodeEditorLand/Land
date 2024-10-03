import { IAction } from '../../../../base/common/actions.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IReference } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditor, IEditorMouseEvent } from '../../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IModelDecorationOptions, IModelDeltaDecoration, ITextModel } from '../../../../editor/common/model.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ITestProfileService } from '../common/testProfileService.js';
import { ITestResult } from '../common/testResult.js';
import { ITestResultService } from '../common/testResultService.js';
import { ITestService } from '../common/testService.js';
import { IRichLocation, ITestMessage, IncrementalTestCollectionItem, InternalTestItem, TestResultItem, TestResultState, TestRunProfileBitset } from '../common/testTypes.js';
import { ITestDecoration as IPublicTestDecoration, ITestingDecorationsService } from '../common/testingDecorations.js';
import { ITestingPeekOpener } from '../common/testingPeekOpener.js';
interface ITestDecoration extends IPublicTestDecoration {
    id: string;
    click(e: IEditorMouseEvent): boolean;
}
declare class CachedDecorations {
    private readonly runByIdKey;
    private readonly messages;
    get size(): number;
    getForExactTests(testIds: string[]): RunTestDecoration | undefined;
    getMessage(message: ITestMessage): TestMessageDecoration | undefined;
    removeMessage(message: ITestMessage): void;
    addMessage(d: TestMessageDecoration): void;
    addTest(d: RunTestDecoration): void;
    getById(decorationId: string): RunTestDecoration | TestMessageDecoration | undefined;
    [Symbol.iterator](): IterableIterator<ITestDecoration>;
}
export declare class TestingDecorationService extends Disposable implements ITestingDecorationsService {
    private readonly configurationService;
    private readonly testService;
    private readonly results;
    private readonly instantiationService;
    private readonly modelService;
    _serviceBrand: undefined;
    private generation;
    private readonly changeEmitter;
    private readonly decorationCache;
    private readonly invalidatedMessages;
    readonly onDidChange: Event<void>;
    constructor(codeEditorService: ICodeEditorService, configurationService: IConfigurationService, testService: ITestService, results: ITestResultService, instantiationService: IInstantiationService, modelService: IModelService);
    invalidateResultMessage(message: ITestMessage): void;
    syncDecorations(resource: URI): CachedDecorations;
    getDecoratedTestPosition(resource: URI, testId: string): import("../../../../editor/common/core/position.js").Position | undefined;
    private invalidate;
    updateDecorationsAlternateAction(resource: URI, isAlt: boolean): void;
    private applyDecorations;
    private applyDecorationsFromResult;
}
export declare class TestingDecorations extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly codeEditorService;
    private readonly testService;
    private readonly decorations;
    private readonly uriIdentityService;
    static get(editor: ICodeEditor): TestingDecorations | null;
    get currentUri(): URI | undefined;
    private _currentUri?;
    private readonly expectedWidget;
    private readonly actualWidget;
    constructor(editor: ICodeEditor, codeEditorService: ICodeEditorService, testService: ITestService, decorations: ITestingDecorationsService, uriIdentityService: IUriIdentityService);
    private attachModel;
}
declare abstract class RunTestDecoration {
    protected tests: readonly {
        test: IncrementalTestCollectionItem;
        resultItem: TestResultItem | undefined;
    }[];
    private visible;
    protected readonly model: ITextModel;
    private readonly codeEditorService;
    protected readonly testService: ITestService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly commandService: ICommandService;
    protected readonly configurationService: IConfigurationService;
    protected readonly testProfileService: ITestProfileService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly menuService: IMenuService;
    id: string;
    get line(): number;
    get testIds(): string[];
    editorDecoration: IModelDeltaDecoration & {
        alternate?: IModelDecorationOptions;
    };
    displayedStates: readonly (TestResultState | undefined)[];
    constructor(tests: readonly {
        test: IncrementalTestCollectionItem;
        resultItem: TestResultItem | undefined;
    }[], visible: boolean, model: ITextModel, codeEditorService: ICodeEditorService, testService: ITestService, contextMenuService: IContextMenuService, commandService: ICommandService, configurationService: IConfigurationService, testProfileService: ITestProfileService, contextKeyService: IContextKeyService, menuService: IMenuService);
    click(e: IEditorMouseEvent): boolean;
    replaceOptions(newTests: readonly {
        test: IncrementalTestCollectionItem;
        resultItem: TestResultItem | undefined;
    }[], visible: boolean): boolean;
    isForTest(testId: string): boolean;
    abstract getContextMenuActions(): IReference<IAction[]>;
    protected runWith(profile: TestRunProfileBitset): Promise<ITestResult>;
    private showContextMenu;
    private getGutterLabel;
    protected getTestContextMenuActions(test: InternalTestItem, resultItem?: TestResultItem): IReference<IAction[]>;
    private getContributedTestActions;
}
declare class TestMessageDecoration implements ITestDecoration {
    readonly testMessage: ITestMessage;
    private readonly messageUri;
    private readonly peekOpener;
    static readonly inlineClassName = "test-message-inline-content";
    static readonly decorationId: string;
    id: string;
    readonly editorDecoration: IModelDeltaDecoration;
    readonly location: IRichLocation;
    readonly line: number;
    private readonly contentIdClass;
    constructor(testMessage: ITestMessage, messageUri: URI | undefined, textModel: ITextModel, peekOpener: ITestingPeekOpener, editorService: ICodeEditorService);
    click(e: IEditorMouseEvent): boolean;
    getContextMenuActions(): {
        object: never[];
        dispose: () => void;
    };
}
export {};
