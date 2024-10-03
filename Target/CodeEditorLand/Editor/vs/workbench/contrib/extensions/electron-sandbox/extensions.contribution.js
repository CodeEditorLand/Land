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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IExtensionRecommendationNotificationService } from '../../../../platform/extensionRecommendations/common/extensionRecommendations.js';
import { ExtensionRecommendationNotificationServiceChannel } from '../../../../platform/extensionRecommendations/common/extensionRecommendationsIpc.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { EditorExtensions } from '../../../common/editor.js';
import { RuntimeExtensionsInput } from '../common/runtimeExtensionsInput.js';
import { DebugExtensionHostAction, DebugExtensionsContribution } from './debugExtensionHostAction.js';
import { ExtensionHostProfileService } from './extensionProfileService.js';
import { CleanUpExtensionsFolderAction, OpenExtensionsFolderAction } from './extensionsActions.js';
import { ExtensionsAutoProfiler } from './extensionsAutoProfiler.js';
import { RemoteExtensionsInitializerContribution } from './remoteExtensionsInit.js';
import { IExtensionHostProfileService, OpenExtensionHostProfileACtion, RuntimeExtensionsEditor, SaveExtensionHostProfileAction, StartExtensionHostProfileAction, StopExtensionHostProfileAction } from './runtimeExtensionsEditor.js';
registerSingleton(IExtensionHostProfileService, ExtensionHostProfileService, 1);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(RuntimeExtensionsEditor, RuntimeExtensionsEditor.ID, localize('runtimeExtension', "Running Extensions")), [new SyncDescriptor(RuntimeExtensionsInput)]);
class RuntimeExtensionsInputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(editorInput) {
        return '';
    }
    deserialize(instantiationService) {
        return RuntimeExtensionsInput.instance;
    }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(RuntimeExtensionsInput.ID, RuntimeExtensionsInputSerializer);
let ExtensionsContributions = class ExtensionsContributions extends Disposable {
    constructor(extensionRecommendationNotificationService, sharedProcessService) {
        super();
        sharedProcessService.registerChannel('extensionRecommendationNotification', new ExtensionRecommendationNotificationServiceChannel(extensionRecommendationNotificationService));
        this._register(registerAction2(OpenExtensionsFolderAction));
        this._register(registerAction2(CleanUpExtensionsFolderAction));
    }
};
ExtensionsContributions = __decorate([
    __param(0, IExtensionRecommendationNotificationService),
    __param(1, ISharedProcessService),
    __metadata("design:paramtypes", [Object, Object])
], ExtensionsContributions);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 3);
workbenchRegistry.registerWorkbenchContribution(ExtensionsAutoProfiler, 4);
workbenchRegistry.registerWorkbenchContribution(RemoteExtensionsInitializerContribution, 3);
workbenchRegistry.registerWorkbenchContribution(DebugExtensionsContribution, 3);
registerAction2(DebugExtensionHostAction);
registerAction2(StartExtensionHostProfileAction);
registerAction2(StopExtensionHostProfileAction);
registerAction2(SaveExtensionHostProfileAction);
registerAction2(OpenExtensionHostProfileACtion);
