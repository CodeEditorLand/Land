import './media/editorquickaccess.css';
import { IQuickPickSeparator, IQuickPickItemWithResource, IQuickPick } from '../../../../platform/quickinput/common/quickInput.js';
import { PickerQuickAccessProvider, IPickerQuickAccessItem } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorIdentifier, GroupIdentifier } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
interface IEditorQuickPickItem extends IQuickPickItemWithResource, IPickerQuickAccessItem {
    groupId: GroupIdentifier;
}
export declare abstract class BaseEditorQuickAccessProvider extends PickerQuickAccessProvider<IEditorQuickPickItem> {
    protected readonly editorGroupService: IEditorGroupsService;
    protected readonly editorService: IEditorService;
    private readonly modelService;
    private readonly languageService;
    private readonly pickState;
    constructor(prefix: string, editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    provide(picker: IQuickPick<IEditorQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken): IDisposable;
    protected _getPicks(filter: string): Array<IEditorQuickPickItem | IQuickPickSeparator>;
    private doGetEditorPickItems;
    protected abstract doGetEditors(): IEditorIdentifier[];
}
export declare class ActiveGroupEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export declare class AllEditorsByAppearanceQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export declare class AllEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export {};
