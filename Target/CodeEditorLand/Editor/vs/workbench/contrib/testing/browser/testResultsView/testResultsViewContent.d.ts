import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import './testResultsViewContent.css';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { InspectSubject } from './testResultsSubject.js';
import { IObservableValue } from '../../common/observableValue.js';
export interface ITestResultsViewContentUiState {
    splitViewWidths: number[];
}
export declare class TestResultsViewContent extends Disposable {
    private readonly editor;
    private readonly options;
    private readonly instantiationService;
    protected readonly modelService: ITextModelService;
    private readonly contextKeyService;
    private readonly uriIdentityService;
    private static lastSplitWidth?;
    private readonly didReveal;
    private readonly currentSubjectStore;
    private readonly onCloseEmitter;
    private followupWidget;
    private messageContextKeyService;
    private contextKeyTestMessage;
    private contextKeyResultOutdated;
    private stackContainer;
    private callStackWidget;
    private currentTopFrame?;
    private isDoingLayoutUpdate?;
    private dimension?;
    private splitView;
    private messageContainer;
    private contentProviders;
    private contentProvidersUpdateLimiter;
    current?: InspectSubject;
    onDidRequestReveal: Event<InspectSubject>;
    readonly onClose: Event<void>;
    get uiState(): ITestResultsViewContentUiState;
    constructor(editor: ICodeEditor | undefined, options: {
        historyVisible: IObservableValue<boolean>;
        showRevealLocationOnMessages: boolean;
        locationForProgress: string;
    }, instantiationService: IInstantiationService, modelService: ITextModelService, contextKeyService: IContextKeyService, uriIdentityService: IUriIdentityService);
    fillBody(containerElement: HTMLElement): void;
    reveal(opts: {
        subject: InspectSubject;
        preserveFocus: boolean;
    }): Promise<unknown>;
    collapseStack(): void;
    private getCallFrames;
    private prepareTopFrame;
    private layoutContentWidgets;
    private populateFloatingClick;
    onLayoutBody(height: number, width: number): void;
    onWidth(width: number): void;
}
