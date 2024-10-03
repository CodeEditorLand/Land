import { Disposable } from '../../../../base/common/lifecycle.js';
import './links.css';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { Position } from '../../../common/core/position.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { IModelDecorationsChangeAccessor, IModelDeltaDecoration } from '../../../common/model.js';
import { ILanguageFeatureDebounceService } from '../../../common/services/languageFeatureDebounce.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { Link } from './getLinks.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
export declare class LinkDetector extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly openerService;
    private readonly notificationService;
    private readonly languageFeaturesService;
    static readonly ID: string;
    static get(editor: ICodeEditor): LinkDetector | null;
    private readonly providers;
    private readonly debounceInformation;
    private readonly computeLinks;
    private computePromise;
    private activeLinksList;
    private activeLinkDecorationId;
    private currentOccurrences;
    constructor(editor: ICodeEditor, openerService: IOpenerService, notificationService: INotificationService, languageFeaturesService: ILanguageFeaturesService, languageFeatureDebounceService: ILanguageFeatureDebounceService);
    private computeLinksNow;
    private updateDecorations;
    private _onEditorMouseMove;
    private cleanUpActiveLinkDecoration;
    private onEditorMouseUp;
    openLinkOccurrence(occurrence: LinkOccurrence, openToSide: boolean, fromUserGesture?: boolean): void;
    getLinkOccurrence(position: Position | null): LinkOccurrence | null;
    private isEnabled;
    private stop;
    dispose(): void;
}
declare class LinkOccurrence {
    static decoration(link: Link, useMetaKey: boolean): IModelDeltaDecoration;
    private static _getOptions;
    decorationId: string;
    link: Link;
    constructor(link: Link, decorationId: string);
    activate(changeAccessor: IModelDecorationsChangeAccessor, useMetaKey: boolean): void;
    deactivate(changeAccessor: IModelDecorationsChangeAccessor, useMetaKey: boolean): void;
}
export {};
