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
import { raceCancellation } from '../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { LinkedList } from '../../../../base/common/linkedList.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { NotificationPriority } from '../../../../platform/notification/common/notification.js';
import { localize } from '../../../../nls.js';
let StoredFileWorkingCopySaveParticipant = class StoredFileWorkingCopySaveParticipant extends Disposable {
    get length() { return this.saveParticipants.size; }
    constructor(logService, progressService) {
        super();
        this.logService = logService;
        this.progressService = progressService;
        this.saveParticipants = new LinkedList();
    }
    addSaveParticipant(participant) {
        const remove = this.saveParticipants.push(participant);
        return toDisposable(() => remove());
    }
    async participate(workingCopy, context, progress, token) {
        const cts = new CancellationTokenSource(token);
        // undoStop before participation
        workingCopy.model?.pushStackElement();
        // report to the "outer" progress
        progress.report({
            message: localize('saveParticipants1', "Running Code Actions and Formatters...")
        });
        // create an "inner" progress to allow to skip over long running save participants
        await this.progressService.withProgress({
            priority: NotificationPriority.URGENT,
            location: 15 /* ProgressLocation.Notification */,
            cancellable: localize('skip', "Skip"),
            delay: workingCopy.isDirty() ? 5000 : 3000
        }, async (progress) => {
            for (const saveParticipant of this.saveParticipants) {
                if (cts.token.isCancellationRequested || workingCopy.isDisposed()) {
                    break;
                }
                try {
                    const promise = saveParticipant.participate(workingCopy, context, progress, cts.token);
                    await raceCancellation(promise, cts.token);
                }
                catch (err) {
                    if (!isCancellationError(err)) {
                        this.logService.error(err);
                    }
                }
            }
        }, () => {
            cts.cancel();
        });
        // undoStop after participation
        workingCopy.model?.pushStackElement();
        cts.dispose();
    }
    dispose() {
        this.saveParticipants.clear();
        super.dispose();
    }
};
StoredFileWorkingCopySaveParticipant = __decorate([
    __param(0, ILogService),
    __param(1, IProgressService),
    __metadata("design:paramtypes", [Object, Object])
], StoredFileWorkingCopySaveParticipant);
export { StoredFileWorkingCopySaveParticipant };
