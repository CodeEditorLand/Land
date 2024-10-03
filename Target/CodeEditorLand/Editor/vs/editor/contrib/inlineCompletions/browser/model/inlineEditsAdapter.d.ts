import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../../browser/editorBrowser.js';
import { ILanguageFeaturesService } from '../../../../common/services/languageFeatures.js';
export declare class InlineEditsAdapterContribution extends Disposable {
    private readonly instantiationService;
    static ID: string;
    static isFirst: boolean;
    constructor(_editor: ICodeEditor, instantiationService: IInstantiationService);
}
export declare class InlineEditsAdapter extends Disposable {
    private readonly _languageFeaturesService;
    private readonly _configurationService;
    static experimentalInlineEditsEnabled: string;
    private readonly _inlineCompletionInlineEdits;
    constructor(_languageFeaturesService: ILanguageFeaturesService, _configurationService: IConfigurationService);
}
