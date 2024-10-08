/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import * as nls from '../../../nls.js';
import { toAction } from '../../../base/common/actions.js';
import { MainContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { Event } from '../../../base/common/event.js';
import { ICommandService } from '../../../platform/commands/common/commands.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
let MainThreadMessageService = class MainThreadMessageService {
    constructor(extHostContext, _notificationService, _commandService, _dialogService, extensionService) {
        this._notificationService = _notificationService;
        this._commandService = _commandService;
        this._dialogService = _dialogService;
        this.extensionsListener = extensionService.onDidChangeExtensions(e => {
            for (const extension of e.removed) {
                this._notificationService.removeFilter(extension.identifier.value);
            }
        });
    }
    dispose() {
        this.extensionsListener.dispose();
    }
    $showMessage(severity, message, options, commands) {
        if (options.modal) {
            return this._showModalMessage(severity, message, options.detail, commands, options.useCustom);
        }
        else {
            return this._showMessage(severity, message, commands, options);
        }
    }
    _showMessage(severity, message, commands, options) {
        return new Promise(resolve => {
            const primaryActions = commands.map(command => toAction({
                id: `_extension_message_handle_${command.handle}`,
                label: command.title,
                enabled: true,
                run: () => {
                    resolve(command.handle);
                    return Promise.resolve();
                }
            }));
            let source;
            if (options.source) {
                source = {
                    label: options.source.label,
                    id: options.source.identifier.value
                };
            }
            if (!source) {
                source = nls.localize('defaultSource', "Extension");
            }
            const secondaryActions = [];
            if (options.source) {
                secondaryActions.push(toAction({
                    id: options.source.identifier.value,
                    label: nls.localize('manageExtension', "Manage Extension"),
                    run: () => {
                        return this._commandService.executeCommand('_extensions.manage', options.source.identifier.value);
                    }
                }));
            }
            const messageHandle = this._notificationService.notify({
                severity,
                message,
                actions: { primary: primaryActions, secondary: secondaryActions },
                source
            });
            // if promise has not been resolved yet, now is the time to ensure a return value
            // otherwise if already resolved it means the user clicked one of the buttons
            Event.once(messageHandle.onDidClose)(() => {
                resolve(undefined);
            });
        });
    }
    async _showModalMessage(severity, message, detail, commands, useCustom) {
        const buttons = [];
        let cancelButton = undefined;
        for (const command of commands) {
            const button = {
                label: command.title,
                run: () => command.handle
            };
            if (command.isCloseAffordance) {
                cancelButton = button;
            }
            else {
                buttons.push(button);
            }
        }
        if (!cancelButton) {
            if (buttons.length > 0) {
                cancelButton = {
                    label: nls.localize('cancel', "Cancel"),
                    run: () => undefined
                };
            }
            else {
                cancelButton = {
                    label: nls.localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                    run: () => undefined
                };
            }
        }
        const { result } = await this._dialogService.prompt({
            type: severity,
            message,
            detail,
            buttons,
            cancelButton,
            custom: useCustom
        });
        return result;
    }
};
MainThreadMessageService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadMessageService),
    __param(1, INotificationService),
    __param(2, ICommandService),
    __param(3, IDialogService),
    __param(4, IExtensionService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], MainThreadMessageService);
export { MainThreadMessageService };
