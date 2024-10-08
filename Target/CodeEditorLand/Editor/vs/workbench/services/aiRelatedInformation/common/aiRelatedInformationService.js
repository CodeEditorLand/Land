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
var AiRelatedInformationService_1;
import { createCancelablePromise, raceTimeout } from '../../../../base/common/async.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IAiRelatedInformationService } from './aiRelatedInformation.js';
let AiRelatedInformationService = class AiRelatedInformationService {
    static { AiRelatedInformationService_1 = this; }
    static { this.DEFAULT_TIMEOUT = 1000 * 10; } // 10 seconds
    constructor(logService) {
        this.logService = logService;
        this._providers = new Map();
    }
    isEnabled() {
        return this._providers.size > 0;
    }
    registerAiRelatedInformationProvider(type, provider) {
        const providers = this._providers.get(type) ?? [];
        providers.push(provider);
        this._providers.set(type, providers);
        return {
            dispose: () => {
                const providers = this._providers.get(type) ?? [];
                const index = providers.indexOf(provider);
                if (index !== -1) {
                    providers.splice(index, 1);
                }
                if (providers.length === 0) {
                    this._providers.delete(type);
                }
            }
        };
    }
    async getRelatedInformation(query, types, token) {
        if (this._providers.size === 0) {
            throw new Error('No related information providers registered');
        }
        // get providers for each type
        const providers = [];
        for (const type of types) {
            const typeProviders = this._providers.get(type);
            if (typeProviders) {
                providers.push(...typeProviders);
            }
        }
        if (providers.length === 0) {
            throw new Error('No related information providers registered for the given types');
        }
        const stopwatch = StopWatch.create();
        const cancellablePromises = providers.map((provider) => {
            return createCancelablePromise(async (t) => {
                try {
                    const result = await provider.provideAiRelatedInformation(query, t);
                    // double filter just in case
                    return result.filter(r => types.includes(r.type));
                }
                catch (e) {
                    // logged in extension host
                }
                return [];
            });
        });
        try {
            const results = await raceTimeout(Promise.allSettled(cancellablePromises), AiRelatedInformationService_1.DEFAULT_TIMEOUT, () => {
                cancellablePromises.forEach(p => p.cancel());
                this.logService.warn('[AiRelatedInformationService]: Related information provider timed out');
            });
            if (!results) {
                return [];
            }
            const result = results
                .filter(r => r.status === 'fulfilled')
                .flatMap(r => r.value);
            return result;
        }
        finally {
            stopwatch.stop();
            this.logService.trace(`[AiRelatedInformationService]: getRelatedInformation took ${stopwatch.elapsed()}ms`);
        }
    }
};
AiRelatedInformationService = AiRelatedInformationService_1 = __decorate([
    __param(0, ILogService),
    __metadata("design:paramtypes", [Object])
], AiRelatedInformationService);
export { AiRelatedInformationService };
registerSingleton(IAiRelatedInformationService, AiRelatedInformationService, 1 /* InstantiationType.Delayed */);
