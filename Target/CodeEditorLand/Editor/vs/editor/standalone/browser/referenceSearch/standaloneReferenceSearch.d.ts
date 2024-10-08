import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { ReferencesController } from '../../../contrib/gotoSymbol/browser/peek/referencesController.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class StandaloneReferencesController extends ReferencesController {
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, editorService: ICodeEditorService, notificationService: INotificationService, instantiationService: IInstantiationService, storageService: IStorageService, configurationService: IConfigurationService);
}
