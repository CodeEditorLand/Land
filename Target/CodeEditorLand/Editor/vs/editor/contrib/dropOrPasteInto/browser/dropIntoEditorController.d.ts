import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { ITreeViewsDnDService } from '../../../common/services/treeViewsDndService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare const defaultProviderConfig = "editor.experimental.dropIntoEditor.defaultProvider";
export declare const changeDropTypeCommandId = "editor.changeDropType";
export declare const dropWidgetVisibleCtx: RawContextKey<boolean>;
export declare class DropIntoEditorController extends Disposable implements IEditorContribution {
    private readonly _configService;
    private readonly _languageFeaturesService;
    private readonly _treeViewsDragAndDropService;
    static readonly ID = "editor.contrib.dropIntoEditorController";
    static get(editor: ICodeEditor): DropIntoEditorController | null;
    private _currentOperation?;
    private readonly _dropProgressManager;
    private readonly _postDropWidgetManager;
    private readonly treeItemsTransfer;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, _configService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _treeViewsDragAndDropService: ITreeViewsDnDService);
    clearWidgets(): void;
    changeDropType(): void;
    private onDropIntoEditor;
    private getDropEdits;
    private getInitialActiveEditIndex;
    private extractDataTransferData;
}
