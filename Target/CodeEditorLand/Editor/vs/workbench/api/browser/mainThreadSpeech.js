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
import { raceCancellation } from '../../../base/common/async.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { ISpeechService, TextToSpeechStatus } from '../../contrib/speech/common/speechService.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
let MainThreadSpeech = class MainThreadSpeech {
    constructor(extHostContext, speechService, logService) {
        this.speechService = speechService;
        this.logService = logService;
        this.providerRegistrations = new Map();
        this.speechToTextSessions = new Map();
        this.textToSpeechSessions = new Map();
        this.keywordRecognitionSessions = new Map();
        this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostSpeech);
    }
    $registerProvider(handle, identifier, metadata) {
        this.logService.trace('[Speech] extension registered provider', metadata.extension.value);
        const registration = this.speechService.registerSpeechProvider(identifier, {
            metadata,
            createSpeechToTextSession: (token, options) => {
                if (token.isCancellationRequested) {
                    return {
                        onDidChange: Event.None
                    };
                }
                const disposables = new DisposableStore();
                const session = Math.random();
                this.proxy.$createSpeechToTextSession(handle, session, options?.language);
                const onDidChange = disposables.add(new Emitter());
                this.speechToTextSessions.set(session, { onDidChange });
                disposables.add(token.onCancellationRequested(() => {
                    this.proxy.$cancelSpeechToTextSession(session);
                    this.speechToTextSessions.delete(session);
                    disposables.dispose();
                }));
                return {
                    onDidChange: onDidChange.event
                };
            },
            createTextToSpeechSession: (token, options) => {
                if (token.isCancellationRequested) {
                    return {
                        onDidChange: Event.None,
                        synthesize: async () => { }
                    };
                }
                const disposables = new DisposableStore();
                const session = Math.random();
                this.proxy.$createTextToSpeechSession(handle, session, options?.language);
                const onDidChange = disposables.add(new Emitter());
                this.textToSpeechSessions.set(session, { onDidChange });
                disposables.add(token.onCancellationRequested(() => {
                    this.proxy.$cancelTextToSpeechSession(session);
                    this.textToSpeechSessions.delete(session);
                    disposables.dispose();
                }));
                return {
                    onDidChange: onDidChange.event,
                    synthesize: async (text) => {
                        await this.proxy.$synthesizeSpeech(session, text);
                        await raceCancellation(Event.toPromise(Event.filter(onDidChange.event, e => e.status === TextToSpeechStatus.Stopped)), token);
                    }
                };
            },
            createKeywordRecognitionSession: token => {
                if (token.isCancellationRequested) {
                    return {
                        onDidChange: Event.None
                    };
                }
                const disposables = new DisposableStore();
                const session = Math.random();
                this.proxy.$createKeywordRecognitionSession(handle, session);
                const onDidChange = disposables.add(new Emitter());
                this.keywordRecognitionSessions.set(session, { onDidChange });
                disposables.add(token.onCancellationRequested(() => {
                    this.proxy.$cancelKeywordRecognitionSession(session);
                    this.keywordRecognitionSessions.delete(session);
                    disposables.dispose();
                }));
                return {
                    onDidChange: onDidChange.event
                };
            }
        });
        this.providerRegistrations.set(handle, {
            dispose: () => {
                registration.dispose();
            }
        });
    }
    $unregisterProvider(handle) {
        const registration = this.providerRegistrations.get(handle);
        if (registration) {
            registration.dispose();
            this.providerRegistrations.delete(handle);
        }
    }
    $emitSpeechToTextEvent(session, event) {
        const providerSession = this.speechToTextSessions.get(session);
        providerSession?.onDidChange.fire(event);
    }
    $emitTextToSpeechEvent(session, event) {
        const providerSession = this.textToSpeechSessions.get(session);
        providerSession?.onDidChange.fire(event);
    }
    $emitKeywordRecognitionEvent(session, event) {
        const providerSession = this.keywordRecognitionSessions.get(session);
        providerSession?.onDidChange.fire(event);
    }
    dispose() {
        this.providerRegistrations.forEach(disposable => disposable.dispose());
        this.providerRegistrations.clear();
        this.speechToTextSessions.forEach(session => session.onDidChange.dispose());
        this.speechToTextSessions.clear();
        this.textToSpeechSessions.forEach(session => session.onDidChange.dispose());
        this.textToSpeechSessions.clear();
        this.keywordRecognitionSessions.forEach(session => session.onDidChange.dispose());
        this.keywordRecognitionSessions.clear();
    }
};
MainThreadSpeech = __decorate([
    extHostNamedCustomer(MainContext.MainThreadSpeech),
    __param(1, ISpeechService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MainThreadSpeech);
export { MainThreadSpeech };
