import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
export declare class GettingStartedDetailsRenderer {
    private readonly fileService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly languageService;
    private mdCache;
    private svgCache;
    constructor(fileService: IFileService, notificationService: INotificationService, extensionService: IExtensionService, languageService: ILanguageService);
    renderMarkdown(path: URI, base: URI): Promise<string>;
    renderSVG(path: URI): Promise<string>;
    private readAndCacheSVGFile;
    private readAndCacheStepMarkdown;
    private readContentsOfPath;
}
