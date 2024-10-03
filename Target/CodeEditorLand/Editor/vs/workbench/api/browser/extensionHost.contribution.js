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
import { registerWorkbenchContribution2 } from '../../common/contributions.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { JSONValidationExtensionPoint } from '../common/jsonValidationExtensionPoint.js';
import { ColorExtensionPoint } from '../../services/themes/common/colorExtensionPoint.js';
import { IconExtensionPoint } from '../../services/themes/common/iconExtensionPoint.js';
import { TokenClassificationExtensionPoints } from '../../services/themes/common/tokenClassificationExtensionPoint.js';
import { LanguageConfigurationFileHandler } from '../../contrib/codeEditor/common/languageConfigurationExtensionPoint.js';
import { StatusBarItemsExtensionPoint } from './statusBarExtensionPoint.js';
import './mainThreadLocalization.js';
import './mainThreadBulkEdits.js';
import './mainThreadLanguageModels.js';
import './mainThreadChatAgents2.js';
import './mainThreadChatVariables.js';
import './mainThreadChatCodeMapper.js';
import './mainThreadLanguageModelTools.js';
import './mainThreadEmbeddings.js';
import './mainThreadCodeInsets.js';
import './mainThreadCLICommands.js';
import './mainThreadClipboard.js';
import './mainThreadCommands.js';
import './mainThreadConfiguration.js';
import './mainThreadConsole.js';
import './mainThreadDebugService.js';
import './mainThreadDecorations.js';
import './mainThreadDiagnostics.js';
import './mainThreadDialogs.js';
import './mainThreadDocumentContentProviders.js';
import './mainThreadDocuments.js';
import './mainThreadDocumentsAndEditors.js';
import './mainThreadEditor.js';
import './mainThreadEditors.js';
import './mainThreadEditorTabs.js';
import './mainThreadErrors.js';
import './mainThreadExtensionService.js';
import './mainThreadFileSystem.js';
import './mainThreadFileSystemEventService.js';
import './mainThreadLanguageFeatures.js';
import './mainThreadLanguages.js';
import './mainThreadLogService.js';
import './mainThreadMessageService.js';
import './mainThreadManagedSockets.js';
import './mainThreadOutputService.js';
import './mainThreadProgress.js';
import './mainThreadQuickDiff.js';
import './mainThreadQuickOpen.js';
import './mainThreadRemoteConnectionData.js';
import './mainThreadSaveParticipant.js';
import './mainThreadSpeech.js';
import './mainThreadEditSessionIdentityParticipant.js';
import './mainThreadSCM.js';
import './mainThreadSearch.js';
import './mainThreadStatusBar.js';
import './mainThreadStorage.js';
import './mainThreadTelemetry.js';
import './mainThreadTerminalService.js';
import './mainThreadTerminalShellIntegration.js';
import './mainThreadTheming.js';
import './mainThreadTreeViews.js';
import './mainThreadDownloadService.js';
import './mainThreadUrls.js';
import './mainThreadUriOpeners.js';
import './mainThreadWindow.js';
import './mainThreadWebviewManager.js';
import './mainThreadWorkspace.js';
import './mainThreadComments.js';
import './mainThreadNotebook.js';
import './mainThreadNotebookKernels.js';
import './mainThreadNotebookDocumentsAndEditors.js';
import './mainThreadNotebookRenderers.js';
import './mainThreadNotebookSaveParticipant.js';
import './mainThreadInteractive.js';
import './mainThreadTask.js';
import './mainThreadLabelService.js';
import './mainThreadTunnelService.js';
import './mainThreadAuthentication.js';
import './mainThreadTimeline.js';
import './mainThreadTesting.js';
import './mainThreadSecretState.js';
import './mainThreadShare.js';
import './mainThreadProfileContentHandlers.js';
import './mainThreadAiRelatedInformation.js';
import './mainThreadAiEmbeddingVector.js';
let ExtensionPoints = class ExtensionPoints {
    static { this.ID = 'workbench.contrib.extensionPoints'; }
    constructor(instantiationService) {
        this.instantiationService = instantiationService;
        this.instantiationService.createInstance(JSONValidationExtensionPoint);
        this.instantiationService.createInstance(ColorExtensionPoint);
        this.instantiationService.createInstance(IconExtensionPoint);
        this.instantiationService.createInstance(TokenClassificationExtensionPoints);
        this.instantiationService.createInstance(LanguageConfigurationFileHandler);
        this.instantiationService.createInstance(StatusBarItemsExtensionPoint);
    }
};
ExtensionPoints = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], ExtensionPoints);
export { ExtensionPoints };
registerWorkbenchContribution2(ExtensionPoints.ID, ExtensionPoints, 1);
