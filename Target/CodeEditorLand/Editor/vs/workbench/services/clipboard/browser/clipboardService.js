var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { localize } from '../../../../nls.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { BrowserClipboardService as BaseBrowserClipboardService } from '../../../../platform/clipboard/browser/clipboardService.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { getActiveWindow } from '../../../../base/browser/dom.js';
let BrowserClipboardService = class BrowserClipboardService extends BaseBrowserClipboardService {
    constructor(notificationService, openerService, environmentService, logService, layoutService) {
        super(layoutService, logService);
        this.notificationService = notificationService;
        this.openerService = openerService;
        this.environmentService = environmentService;
    }
    async writeText(text, type) {
        if (!!this.environmentService.extensionTestsLocationURI && typeof type !== 'string') {
            type = 'vscode-tests';
        }
        return super.writeText(text, type);
    }
    async readText(type) {
        if (!!this.environmentService.extensionTestsLocationURI && typeof type !== 'string') {
            type = 'vscode-tests';
        }
        if (type) {
            return super.readText(type);
        }
        try {
            return await getActiveWindow().navigator.clipboard.readText();
        }
        catch (error) {
            return new Promise(resolve => {
                const listener = new DisposableStore();
                const handle = this.notificationService.prompt(Severity.Error, localize('clipboardError', "Unable to read from the browser's clipboard. Please make sure you have granted access for this website to read from the clipboard."), [{
                        label: localize('retry', "Retry"),
                        run: async () => {
                            listener.dispose();
                            resolve(await this.readText(type));
                        }
                    }, {
                        label: localize('learnMore', "Learn More"),
                        run: () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2151362')
                    }], {
                    sticky: true
                });
                listener.add(Event.once(handle.onDidClose)(() => resolve('')));
            });
        }
    }
};
BrowserClipboardService = __decorate([
    __param(0, INotificationService),
    __param(1, IOpenerService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, ILogService),
    __param(4, ILayoutService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], BrowserClipboardService);
export { BrowserClipboardService };
registerSingleton(IClipboardService, BrowserClipboardService, 1);
