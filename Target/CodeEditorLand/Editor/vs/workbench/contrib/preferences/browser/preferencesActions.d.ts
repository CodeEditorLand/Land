import { Action } from '../../../../base/common/actions.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import * as nls from '../../../../nls.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
export declare class ConfigureLanguageBasedSettingsAction extends Action {
    private readonly modelService;
    private readonly languageService;
    private readonly quickInputService;
    private readonly preferencesService;
    static readonly ID = "workbench.action.configureLanguageBasedSettings";
    static readonly LABEL: nls.ILocalizedString;
    constructor(id: string, label: string, modelService: IModelService, languageService: ILanguageService, quickInputService: IQuickInputService, preferencesService: IPreferencesService);
    run(): Promise<void>;
}
