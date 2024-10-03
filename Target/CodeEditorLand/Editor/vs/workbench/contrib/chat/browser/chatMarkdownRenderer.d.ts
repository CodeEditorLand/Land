import { MarkdownRenderOptions, MarkedOptions } from '../../../../base/browser/markdownRenderer.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { IMarkdownRendererOptions, IMarkdownRenderResult, MarkdownRenderer } from '../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITrustedDomainService } from '../../url/browser/trustedDomainService.js';
export declare class ChatMarkdownRenderer extends MarkdownRenderer {
    private readonly trustedDomainService;
    private readonly hoverService;
    private readonly fileService;
    private readonly commandService;
    constructor(options: IMarkdownRendererOptions | undefined, languageService: ILanguageService, openerService: IOpenerService, trustedDomainService: ITrustedDomainService, hoverService: IHoverService, fileService: IFileService, commandService: ICommandService);
    render(markdown: IMarkdownString | undefined, options?: MarkdownRenderOptions, markedOptions?: MarkedOptions): IMarkdownRenderResult;
    private attachCustomHover;
    protected openMarkdownLink(link: string, markdown: IMarkdownString): Promise<any>;
}
