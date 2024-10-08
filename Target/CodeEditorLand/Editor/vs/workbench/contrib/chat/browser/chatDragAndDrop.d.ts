import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { ChatInputPart } from './chatInputPart.js';
import { IChatWidgetStyles } from './chatWidget.js';
export declare class ChatDragAndDrop extends Themable {
    private readonly contianer;
    private readonly inputPart;
    private readonly styles;
    private readonly configurationService;
    private readonly overlay;
    private overlayText?;
    private overlayTextBackground;
    constructor(contianer: HTMLElement, inputPart: ChatInputPart, styles: IChatWidgetStyles, themeService: IThemeService, configurationService: IConfigurationService);
    private onDragEnter;
    private onDragLeave;
    private onDrop;
    private updateDropFeedback;
    private isImageDnd;
    private guessDropType;
    private isDragEventSupported;
    private getDropTypeName;
    private getAttachContext;
    private resolveAttachContext;
    private setOverlay;
    updateStyles(): void;
}
