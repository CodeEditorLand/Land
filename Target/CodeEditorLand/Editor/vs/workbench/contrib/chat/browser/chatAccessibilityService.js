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
import { status } from '../../../../base/browser/ui/aria/aria.js';
import { Disposable, DisposableMap } from '../../../../base/common/lifecycle.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { AccessibilityProgressSignalScheduler } from '../../../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.js';
import { renderStringAsPlaintext } from '../../../../base/browser/markdownRenderer.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
const CHAT_RESPONSE_PENDING_ALLOWANCE_MS = 4000;
let ChatAccessibilityService = class ChatAccessibilityService extends Disposable {
    constructor(_accessibilitySignalService, _instantiationService, _configurationService) {
        super();
        this._accessibilitySignalService = _accessibilitySignalService;
        this._instantiationService = _instantiationService;
        this._configurationService = _configurationService;
        this._pendingSignalMap = this._register(new DisposableMap());
        this._requestId = 0;
    }
    acceptRequest() {
        this._requestId++;
        this._accessibilitySignalService.playSignal(AccessibilitySignal.chatRequestSent, { allowManyInParallel: true });
        this._pendingSignalMap.set(this._requestId, this._instantiationService.createInstance(AccessibilityProgressSignalScheduler, CHAT_RESPONSE_PENDING_ALLOWANCE_MS, undefined));
        return this._requestId;
    }
    acceptResponse(response, requestId, isVoiceInput) {
        this._pendingSignalMap.deleteAndDispose(requestId);
        const isPanelChat = typeof response !== 'string';
        const responseContent = typeof response === 'string' ? response : response?.response.toString();
        this._accessibilitySignalService.playSignal(AccessibilitySignal.chatResponseReceived, { allowManyInParallel: true });
        if (!response || !responseContent) {
            return;
        }
        const errorDetails = isPanelChat && response.errorDetails ? ` ${response.errorDetails.message}` : '';
        const plainTextResponse = renderStringAsPlaintext(new MarkdownString(responseContent));
        if (!isVoiceInput || this._configurationService.getValue("accessibility.voice.autoSynthesize") !== 'on') {
            status(plainTextResponse + errorDetails);
        }
    }
};
ChatAccessibilityService = __decorate([
    __param(0, IAccessibilitySignalService),
    __param(1, IInstantiationService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatAccessibilityService);
export { ChatAccessibilityService };
