import { Disposable } from '../../../../base/common/lifecycle.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ChatInputPart } from './chatInputPart.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare class ChatImageDropAndPaste extends Disposable {
    private readonly inputPart;
    private readonly clipboardService;
    private readonly configurationService;
    constructor(inputPart: ChatInputPart, clipboardService: IClipboardService, configurationService: IConfigurationService);
    private _handlePaste;
}
export declare function imageToHash(data: Uint8Array): Promise<string>;
export declare function isImage(array: Uint8Array): boolean;
