import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
export declare class LargeFileOptimizationsWarner extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _notificationService;
    private readonly _configurationService;
    static readonly ID = "editor.contrib.largeFileOptimizationsWarner";
    constructor(_editor: ICodeEditor, _notificationService: INotificationService, _configurationService: IConfigurationService);
    private _update;
}
