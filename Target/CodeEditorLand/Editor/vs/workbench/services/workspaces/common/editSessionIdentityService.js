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
import { insert } from '../../../../base/common/arrays.js';
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IEditSessionIdentityService } from '../../../../platform/workspace/common/editSessions.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
let EditSessionIdentityService = class EditSessionIdentityService {
    constructor(_extensionService, _logService) {
        this._extensionService = _extensionService;
        this._logService = _logService;
        this._editSessionIdentifierProviders = new Map();
        this._participants = [];
    }
    registerEditSessionIdentityProvider(provider) {
        if (this._editSessionIdentifierProviders.get(provider.scheme)) {
            throw new Error(`A provider has already been registered for scheme ${provider.scheme}`);
        }
        this._editSessionIdentifierProviders.set(provider.scheme, provider);
        return toDisposable(() => {
            this._editSessionIdentifierProviders.delete(provider.scheme);
        });
    }
    async getEditSessionIdentifier(workspaceFolder, token) {
        const { scheme } = workspaceFolder.uri;
        const provider = await this.activateProvider(scheme);
        this._logService.trace(`EditSessionIdentityProvider for scheme ${scheme} available: ${!!provider}`);
        return provider?.getEditSessionIdentifier(workspaceFolder, token);
    }
    async provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
        const { scheme } = workspaceFolder.uri;
        const provider = await this.activateProvider(scheme);
        this._logService.trace(`EditSessionIdentityProvider for scheme ${scheme} available: ${!!provider}`);
        return provider?.provideEditSessionIdentityMatch?.(workspaceFolder, identity1, identity2, cancellationToken);
    }
    async onWillCreateEditSessionIdentity(workspaceFolder, cancellationToken) {
        this._logService.debug('Running onWillCreateEditSessionIdentity participants...');
        for (const participant of this._participants) {
            await participant.participate(workspaceFolder, cancellationToken);
        }
        this._logService.debug(`Done running ${this._participants.length} onWillCreateEditSessionIdentity participants.`);
    }
    addEditSessionIdentityCreateParticipant(participant) {
        const dispose = insert(this._participants, participant);
        return toDisposable(() => dispose());
    }
    async activateProvider(scheme) {
        const transformedScheme = scheme === 'vscode-remote' ? 'file' : scheme;
        const provider = this._editSessionIdentifierProviders.get(scheme);
        if (provider) {
            return provider;
        }
        await this._extensionService.activateByEvent(`onEditSession:${transformedScheme}`);
        return this._editSessionIdentifierProviders.get(scheme);
    }
};
EditSessionIdentityService = __decorate([
    __param(0, IExtensionService),
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], EditSessionIdentityService);
export { EditSessionIdentityService };
registerSingleton(IEditSessionIdentityService, EditSessionIdentityService, 1);
