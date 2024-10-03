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
import { ILogService } from '../../../../platform/log/common/log.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { insert } from '../../../../base/common/arrays.js';
let TextFileSaveParticipant = class TextFileSaveParticipant extends Disposable {
    constructor(logService) {
        super();
        this.logService = logService;
        this.saveParticipants = [];
    }
    addSaveParticipant(participant) {
        const remove = insert(this.saveParticipants, participant);
        return toDisposable(() => remove());
    }
    async participate(model, context, progress, token) {
        model.textEditorModel?.pushStackElement();
        for (const saveParticipant of this.saveParticipants) {
            if (token.isCancellationRequested || !model.textEditorModel) {
                break;
            }
            try {
                const promise = saveParticipant.participate(model, context, progress, token);
                await raceCancellation(promise, token);
            }
            catch (err) {
                this.logService.error(err);
            }
        }
        model.textEditorModel?.pushStackElement();
    }
    dispose() {
        this.saveParticipants.splice(0, this.saveParticipants.length);
        super.dispose();
    }
};
TextFileSaveParticipant = __decorate([
    __param(0, ILogService),
    __metadata("design:paramtypes", [Object])
], TextFileSaveParticipant);
export { TextFileSaveParticipant };
