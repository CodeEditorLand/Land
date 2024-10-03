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
import { timeout } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
let ResourceWorkingCopy = class ResourceWorkingCopy extends Disposable {
    constructor(resource, fileService) {
        super();
        this.resource = resource;
        this.fileService = fileService;
        this._onDidChangeOrphaned = this._register(new Emitter());
        this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
        this.orphaned = false;
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
    }
    isOrphaned() {
        return this.orphaned;
    }
    async onDidFilesChange(e) {
        let fileEventImpactsUs = false;
        let newInOrphanModeGuess;
        if (this.orphaned) {
            const fileWorkingCopyResourceAdded = e.contains(this.resource, 1);
            if (fileWorkingCopyResourceAdded) {
                newInOrphanModeGuess = false;
                fileEventImpactsUs = true;
            }
        }
        else {
            const fileWorkingCopyResourceDeleted = e.contains(this.resource, 2);
            if (fileWorkingCopyResourceDeleted) {
                newInOrphanModeGuess = true;
                fileEventImpactsUs = true;
            }
        }
        if (fileEventImpactsUs && this.orphaned !== newInOrphanModeGuess) {
            let newInOrphanModeValidated = false;
            if (newInOrphanModeGuess) {
                await timeout(100, CancellationToken.None);
                if (this.isDisposed()) {
                    newInOrphanModeValidated = true;
                }
                else {
                    const exists = await this.fileService.exists(this.resource);
                    newInOrphanModeValidated = !exists;
                }
            }
            if (this.orphaned !== newInOrphanModeValidated && !this.isDisposed()) {
                this.setOrphaned(newInOrphanModeValidated);
            }
        }
    }
    setOrphaned(orphaned) {
        if (this.orphaned !== orphaned) {
            this.orphaned = orphaned;
            this._onDidChangeOrphaned.fire();
        }
    }
    isDisposed() {
        return this._store.isDisposed;
    }
    dispose() {
        this.orphaned = false;
        this._onWillDispose.fire();
        super.dispose();
    }
    isModified() {
        return this.isDirty();
    }
};
ResourceWorkingCopy = __decorate([
    __param(1, IFileService),
    __metadata("design:paramtypes", [URI, Object])
], ResourceWorkingCopy);
export { ResourceWorkingCopy };
