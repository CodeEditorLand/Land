import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { Event } from '../../../../base/common/event.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { StickyElement, StickyRange } from './stickyScrollElement.js';
export declare class StickyLineCandidate {
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    readonly nestingDepth: number;
    constructor(startLineNumber: number, endLineNumber: number, nestingDepth: number);
}
export interface IStickyLineCandidateProvider {
    dispose(): void;
    getVersionId(): number | undefined;
    update(): Promise<void>;
    getCandidateStickyLinesIntersecting(range: StickyRange): StickyLineCandidate[];
    onDidChangeStickyScroll: Event<void>;
}
export declare class StickyLineCandidateProvider extends Disposable implements IStickyLineCandidateProvider {
    private readonly _languageFeaturesService;
    private readonly _languageConfigurationService;
    static readonly ID = "store.contrib.stickyScrollController";
    private readonly _onDidChangeStickyScroll;
    readonly onDidChangeStickyScroll: Event<void>;
    private readonly _editor;
    private readonly _updateSoon;
    private readonly _sessionStore;
    private _model;
    private _cts;
    private _stickyModelProvider;
    constructor(editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService, _languageConfigurationService: ILanguageConfigurationService);
    private readConfiguration;
    getVersionId(): number | undefined;
    private updateStickyModelProvider;
    update(): Promise<void>;
    private updateStickyModel;
    private updateIndex;
    getCandidateStickyLinesIntersectingFromStickyModel(range: StickyRange, outlineModel: StickyElement, result: StickyLineCandidate[], depth: number, lastStartLineNumber: number): void;
    getCandidateStickyLinesIntersecting(range: StickyRange): StickyLineCandidate[];
}
