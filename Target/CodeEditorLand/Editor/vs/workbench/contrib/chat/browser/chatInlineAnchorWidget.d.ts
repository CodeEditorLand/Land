import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ContentRefData } from '../common/annotations.js';
export declare class InlineAnchorWidget extends Disposable {
    static readonly className = "chat-inline-anchor-widget";
    constructor(element: HTMLAnchorElement | HTMLElement, data: ContentRefData, options: {
        handleClick?: (uri: URI) => void;
    } | undefined, originalContextKeyService: IContextKeyService, contextMenuService: IContextMenuService, fileService: IFileService, hoverService: IHoverService, instantiationService: IInstantiationService, labelService: ILabelService, languageFeaturesService: ILanguageFeaturesService, languageService: ILanguageService, menuService: IMenuService, modelService: IModelService, telemetryService: ITelemetryService);
}
