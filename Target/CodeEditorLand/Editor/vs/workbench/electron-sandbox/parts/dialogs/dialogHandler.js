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
import { fromNow } from '../../../../base/common/date.js';
import { isLinuxSnap } from '../../../../base/common/platform.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { AbstractDialogHandler } from '../../../../platform/dialogs/common/dialogs.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { process } from '../../../../base/parts/sandbox/electron-sandbox/globals.js';
import { getActiveWindow } from '../../../../base/browser/dom.js';
let NativeDialogHandler = class NativeDialogHandler extends AbstractDialogHandler {
    constructor(logService, nativeHostService, productService, clipboardService) {
        super();
        this.logService = logService;
        this.nativeHostService = nativeHostService;
        this.productService = productService;
        this.clipboardService = clipboardService;
    }
    async prompt(prompt) {
        this.logService.trace('DialogService#prompt', prompt.message);
        const buttons = this.getPromptButtons(prompt);
        const { response, checkboxChecked } = await this.nativeHostService.showMessageBox({
            type: this.getDialogType(prompt.type),
            title: prompt.title,
            message: prompt.message,
            detail: prompt.detail,
            buttons,
            cancelId: prompt.cancelButton ? buttons.length - 1 : -1,
            checkboxLabel: prompt.checkbox?.label,
            checkboxChecked: prompt.checkbox?.checked,
            targetWindowId: getActiveWindow().vscodeWindowId
        });
        return this.getPromptResult(prompt, response, checkboxChecked);
    }
    async confirm(confirmation) {
        this.logService.trace('DialogService#confirm', confirmation.message);
        const buttons = this.getConfirmationButtons(confirmation);
        const { response, checkboxChecked } = await this.nativeHostService.showMessageBox({
            type: this.getDialogType(confirmation.type) ?? 'question',
            title: confirmation.title,
            message: confirmation.message,
            detail: confirmation.detail,
            buttons,
            cancelId: buttons.length - 1,
            checkboxLabel: confirmation.checkbox?.label,
            checkboxChecked: confirmation.checkbox?.checked,
            targetWindowId: getActiveWindow().vscodeWindowId
        });
        return { confirmed: response === 0, checkboxChecked };
    }
    input() {
        throw new Error('Unsupported');
    }
    async about() {
        let version = this.productService.version;
        if (this.productService.target) {
            version = `${version} (${this.productService.target} setup)`;
        }
        else if (this.productService.darwinUniversalAssetId) {
            version = `${version} (Universal)`;
        }
        const osProps = await this.nativeHostService.getOSProperties();
        const detailString = (useAgo) => {
            return localize({ key: 'aboutDetail', comment: ['Electron, Chromium, Node.js and V8 are product names that need no translation'] }, "Version: {0}\nCommit: {1}\nDate: {2}\nElectron: {3}\nElectronBuildId: {4}\nChromium: {5}\nNode.js: {6}\nV8: {7}\nOS: {8}", version, this.productService.commit || 'Unknown', this.productService.date ? `${this.productService.date}${useAgo ? ' (' + fromNow(new Date(this.productService.date), true) + ')' : ''}` : 'Unknown', process.versions['electron'], process.versions['microsoft-build'], process.versions['chrome'], process.versions['node'], process.versions['v8'], `${osProps.type} ${osProps.arch} ${osProps.release}${isLinuxSnap ? ' snap' : ''}`);
        };
        const detail = detailString(true);
        const detailToCopy = detailString(false);
        const { response } = await this.nativeHostService.showMessageBox({
            type: 'info',
            message: this.productService.nameLong,
            detail: `\n${detail}`,
            buttons: [
                localize({ key: 'copy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
                localize('okButton', "OK")
            ],
            targetWindowId: getActiveWindow().vscodeWindowId
        });
        if (response === 0) {
            this.clipboardService.writeText(detailToCopy);
        }
    }
};
NativeDialogHandler = __decorate([
    __param(0, ILogService),
    __param(1, INativeHostService),
    __param(2, IProductService),
    __param(3, IClipboardService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NativeDialogHandler);
export { NativeDialogHandler };
