import { Event } from '../../../base/common/event.js';
import { URI } from '../../../base/common/uri.js';
import { IPosition } from '../core/position.js';
import { ConfigurationTarget, IConfigurationValue } from '../../../platform/configuration/common/configuration.js';
export declare const ITextResourceConfigurationService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextResourceConfigurationService>;
export interface ITextResourceConfigurationChangeEvent {
    readonly affectedKeys: ReadonlySet<string>;
    affectsConfiguration(resource: URI | undefined, section: string): boolean;
}
export interface ITextResourceConfigurationService {
    readonly _serviceBrand: undefined;
    onDidChangeConfiguration: Event<ITextResourceConfigurationChangeEvent>;
    getValue<T>(resource: URI | undefined, section?: string): T;
    getValue<T>(resource: URI | undefined, position?: IPosition, section?: string): T;
    inspect<T>(resource: URI | undefined, position: IPosition | null, section: string): IConfigurationValue<Readonly<T>>;
    updateValue(resource: URI, key: string, value: any, configurationTarget?: ConfigurationTarget): Promise<void>;
}
export declare const ITextResourcePropertiesService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextResourcePropertiesService>;
export interface ITextResourcePropertiesService {
    readonly _serviceBrand: undefined;
    getEOL(resource: URI, language?: string): string;
}
