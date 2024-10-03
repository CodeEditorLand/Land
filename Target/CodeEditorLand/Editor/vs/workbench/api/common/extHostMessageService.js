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
import { MainContext } from './extHost.protocol.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
function isMessageItem(item) {
    return item && item.title;
}
let ExtHostMessageService = class ExtHostMessageService {
    constructor(mainContext, _logService) {
        this._logService = _logService;
        this._proxy = mainContext.getProxy(MainContext.MainThreadMessageService);
    }
    showMessage(extension, severity, message, optionsOrFirstItem, rest) {
        const options = {
            source: { identifier: extension.identifier, label: extension.displayName || extension.name }
        };
        let items;
        if (typeof optionsOrFirstItem === 'string' || isMessageItem(optionsOrFirstItem)) {
            items = [optionsOrFirstItem, ...rest];
        }
        else {
            options.modal = optionsOrFirstItem?.modal;
            options.useCustom = optionsOrFirstItem?.useCustom;
            options.detail = optionsOrFirstItem?.detail;
            items = rest;
        }
        if (options.useCustom) {
            checkProposedApiEnabled(extension, 'resolvers');
        }
        const commands = [];
        let hasCloseAffordance = false;
        for (let handle = 0; handle < items.length; handle++) {
            const command = items[handle];
            if (typeof command === 'string') {
                commands.push({ title: command, handle, isCloseAffordance: false });
            }
            else if (typeof command === 'object') {
                const { title, isCloseAffordance } = command;
                commands.push({ title, isCloseAffordance: !!isCloseAffordance, handle });
                if (isCloseAffordance) {
                    if (hasCloseAffordance) {
                        this._logService.warn(`[${extension.identifier}] Only one message item can have 'isCloseAffordance':`, command);
                    }
                    else {
                        hasCloseAffordance = true;
                    }
                }
            }
            else {
                this._logService.warn(`[${extension.identifier}] Invalid message item:`, command);
            }
        }
        return this._proxy.$showMessage(severity, message, options, commands).then(handle => {
            if (typeof handle === 'number') {
                return items[handle];
            }
            return undefined;
        });
    }
};
ExtHostMessageService = __decorate([
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], ExtHostMessageService);
export { ExtHostMessageService };
