import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import * as languages from '../../../common/languages.js';
import { ITextModel } from '../../../common/model.js';
import { ILanguageFeatureDebounceService } from '../../../common/services/languageFeatureDebounce.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { InlayHintItem } from './inlayHints.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
declare class InlayHintsCache {
    readonly _serviceBrand: undefined;
    private readonly _entries;
    get(model: ITextModel): InlayHintItem[] | undefined;
    set(model: ITextModel, value: InlayHintItem[]): void;
    private static _key;
}
interface IInlayHintsCache extends InlayHintsCache {
}
declare const IInlayHintsCache: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInlayHintsCache>;
export declare class RenderedInlayHintLabelPart {
    readonly item: InlayHintItem;
    readonly index: number;
    constructor(item: InlayHintItem, index: number);
    get part(): languages.InlayHintLabelPart | undefined;
}
export declare class InlayHintsController implements IEditorContribution {
    private readonly _editor;
    private readonly _languageFeaturesService;
    private readonly _inlayHintsCache;
    private readonly _commandService;
    private readonly _notificationService;
    private readonly _instaService;
    static readonly ID: string;
    private static readonly _MAX_DECORATORS;
    private static readonly _whitespaceData;
    static get(editor: ICodeEditor): InlayHintsController | undefined;
    private readonly _disposables;
    private readonly _sessionDisposables;
    private readonly _debounceInfo;
    private readonly _decorationsMetadata;
    private readonly _ruleFactory;
    private _cursorInfo?;
    private _activeRenderMode;
    private _activeInlayHintPart?;
    constructor(_editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService, _featureDebounce: ILanguageFeatureDebounceService, _inlayHintsCache: IInlayHintsCache, _commandService: ICommandService, _notificationService: INotificationService, _instaService: IInstantiationService);
    dispose(): void;
    private _update;
    private _installLinkGesture;
    private _getInlineHintsForRange;
    private _installDblClickGesture;
    private _installContextMenu;
    private _getInlayHintLabelPart;
    private _invokeCommand;
    private _cacheHintsForFastRestore;
    private _copyInlayHintsWithCurrentAnchor;
    private _getHintsRanges;
    private _updateHintsDecorators;
    private _fillInColors;
    private _getLayoutInfo;
    private _removeAllDecorations;
    getInlayHintsForLine(line: number): InlayHintItem[];
}
export {};
