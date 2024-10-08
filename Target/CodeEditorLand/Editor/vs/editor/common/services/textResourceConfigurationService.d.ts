import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IPosition } from '../core/position.js';
import { ILanguageService } from '../languages/language.js';
import { IModelService } from './model.js';
import { ITextResourceConfigurationService, ITextResourceConfigurationChangeEvent } from './textResourceConfiguration.js';
import { IConfigurationService, ConfigurationTarget, IConfigurationValue } from '../../../platform/configuration/common/configuration.js';
export declare class TextResourceConfigurationService extends Disposable implements ITextResourceConfigurationService {
    private readonly configurationService;
    private readonly modelService;
    private readonly languageService;
    _serviceBrand: undefined;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<ITextResourceConfigurationChangeEvent>;
    constructor(configurationService: IConfigurationService, modelService: IModelService, languageService: ILanguageService);
    getValue<T>(resource: URI | undefined, section?: string): T;
    getValue<T>(resource: URI | undefined, at?: IPosition, section?: string): T;
    updateValue(resource: URI, key: string, value: any, configurationTarget?: ConfigurationTarget): Promise<void>;
    private deriveConfigurationTarget;
    private _getValue;
    inspect<T>(resource: URI | undefined, position: IPosition | null, section: string): IConfigurationValue<Readonly<T>>;
    private getLanguage;
    private toResourceConfigurationChangeEvent;
}
