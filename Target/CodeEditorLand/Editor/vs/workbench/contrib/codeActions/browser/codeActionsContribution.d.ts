import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IConfigurationNode } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { CodeActionsExtensionPoint } from '../common/codeActionsExtensionPoint.js';
import { IExtensionPoint } from '../../../services/extensions/common/extensionsRegistry.js';
export declare const editorConfiguration: Readonly<IConfigurationNode>;
export declare const notebookEditorConfiguration: Readonly<IConfigurationNode>;
export declare class CodeActionsContribution extends Disposable implements IWorkbenchContribution {
    private readonly languageFeatures;
    private _contributedCodeActions;
    private settings;
    private readonly _onDidChangeContributions;
    constructor(codeActionsExtensionPoint: IExtensionPoint<CodeActionsExtensionPoint[]>, keybindingService: IKeybindingService, languageFeatures: ILanguageFeaturesService);
    private updateSettingsFromCodeActionProviders;
    private updateConfigurationSchema;
    private updateConfigurationSchemaFromContribs;
    private getSourceActions;
    private getSchemaAdditions;
}
