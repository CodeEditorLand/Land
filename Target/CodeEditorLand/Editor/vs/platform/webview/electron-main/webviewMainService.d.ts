import { Disposable } from '../../../base/common/lifecycle.js';
import { FoundInFrameResult, IWebviewManagerService, WebviewWebContentsId, WebviewWindowId } from '../common/webviewManagerService.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
export declare class WebviewMainService extends Disposable implements IWebviewManagerService {
    private readonly windowsMainService;
    readonly _serviceBrand: undefined;
    private readonly _onFoundInFrame;
    onFoundInFrame: import("../../../workbench/workbench.web.main.internal.js").Event<FoundInFrameResult>;
    constructor(windowsMainService: IWindowsMainService);
    setIgnoreMenuShortcuts(id: WebviewWebContentsId | WebviewWindowId, enabled: boolean): Promise<void>;
    findInFrame(windowId: WebviewWindowId, frameName: string, text: string, options: {
        findNext?: boolean;
        forward?: boolean;
    }): Promise<void>;
    stopFindInFrame(windowId: WebviewWindowId, frameName: string, options: {
        keepSelection?: boolean;
    }): Promise<void>;
    private getFrameByName;
}
