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
import { Event } from '../../../../base/common/event.js';
import { dispose } from '../../../../base/common/lifecycle.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IDebugService, VIEWLET_ID } from '../common/debug.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
let DebugProgressContribution = class DebugProgressContribution {
    constructor(debugService, progressService, viewsService) {
        this.toDispose = [];
        let progressListener;
        const listenOnProgress = (session) => {
            if (progressListener) {
                progressListener.dispose();
                progressListener = undefined;
            }
            if (session) {
                progressListener = session.onDidProgressStart(async (progressStartEvent) => {
                    const promise = new Promise(r => {
                        // Show progress until a progress end event comes or the session ends
                        const listener = Event.any(Event.filter(session.onDidProgressEnd, e => e.body.progressId === progressStartEvent.body.progressId), session.onDidEndAdapter)(() => {
                            listener.dispose();
                            r();
                        });
                    });
                    if (viewsService.isViewContainerVisible(VIEWLET_ID)) {
                        progressService.withProgress({ location: VIEWLET_ID }, () => promise);
                    }
                    const source = debugService.getAdapterManager().getDebuggerLabel(session.configuration.type);
                    progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: progressStartEvent.body.title,
                        cancellable: progressStartEvent.body.cancellable,
                        source,
                        delay: 500
                    }, progressStep => {
                        let total = 0;
                        const reportProgress = (progress) => {
                            let increment = undefined;
                            if (typeof progress.percentage === 'number') {
                                increment = progress.percentage - total;
                                total += increment;
                            }
                            progressStep.report({
                                message: progress.message,
                                increment,
                                total: typeof increment === 'number' ? 100 : undefined,
                            });
                        };
                        if (progressStartEvent.body.message) {
                            reportProgress(progressStartEvent.body);
                        }
                        const progressUpdateListener = session.onDidProgressUpdate(e => {
                            if (e.body.progressId === progressStartEvent.body.progressId) {
                                reportProgress(e.body);
                            }
                        });
                        return promise.then(() => progressUpdateListener.dispose());
                    }, () => session.cancel(progressStartEvent.body.progressId));
                });
            }
        };
        this.toDispose.push(debugService.getViewModel().onDidFocusSession(listenOnProgress));
        listenOnProgress(debugService.getViewModel().focusedSession);
        this.toDispose.push(debugService.onWillNewSession(session => {
            if (!progressListener) {
                listenOnProgress(session);
            }
        }));
    }
    dispose() {
        dispose(this.toDispose);
    }
};
DebugProgressContribution = __decorate([
    __param(0, IDebugService),
    __param(1, IProgressService),
    __param(2, IViewsService),
    __metadata("design:paramtypes", [Object, Object, Object])
], DebugProgressContribution);
export { DebugProgressContribution };
