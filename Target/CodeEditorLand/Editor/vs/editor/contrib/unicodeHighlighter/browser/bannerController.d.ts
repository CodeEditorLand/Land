import './bannerController.css';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILinkDescriptor } from '../../../../platform/opener/browser/link.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
export declare class BannerController extends Disposable {
    private readonly _editor;
    private readonly instantiationService;
    private readonly banner;
    constructor(_editor: ICodeEditor, instantiationService: IInstantiationService);
    hide(): void;
    show(item: IBannerItem): void;
}
export interface IBannerItem {
    readonly id: string;
    readonly icon: ThemeIcon | undefined;
    readonly message: string | MarkdownString;
    readonly actions?: ILinkDescriptor[];
    readonly ariaLabel?: string;
    readonly onClose?: () => void;
}
