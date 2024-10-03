import { ThemeIcon, IconIdentifier } from '../../../base/common/themables.js';
import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { URI } from '../../../base/common/uri.js';
export declare const Extensions: {
    IconContribution: string;
};
export type IconDefaults = ThemeIcon | IconDefinition;
export interface IconDefinition {
    font?: IconFontContribution;
    fontCharacter: string;
}
export interface IconContribution {
    readonly id: string;
    description: string | undefined;
    deprecationMessage?: string;
    readonly defaults: IconDefaults;
}
export declare namespace IconContribution {
    function getDefinition(contribution: IconContribution, registry: IIconRegistry): IconDefinition | undefined;
}
export interface IconFontContribution {
    readonly id: string;
    readonly definition: IconFontDefinition;
}
export interface IconFontDefinition {
    readonly weight?: string;
    readonly style?: string;
    readonly src: IconFontSource[];
}
export declare namespace IconFontDefinition {
    function toJSONObject(iconFont: IconFontDefinition): any;
    function fromJSONObject(json: any): IconFontDefinition | undefined;
}
export interface IconFontSource {
    readonly location: URI;
    readonly format: string;
}
export interface IIconRegistry {
    readonly onDidChange: Event<void>;
    registerIcon(id: IconIdentifier, defaults: IconDefaults, description?: string): ThemeIcon;
    deregisterIcon(id: IconIdentifier): void;
    getIcons(): IconContribution[];
    getIcon(id: IconIdentifier): IconContribution | undefined;
    getIconSchema(): IJSONSchema;
    getIconReferenceSchema(): IJSONSchema;
    registerIconFont(id: string, definition: IconFontDefinition): IconFontDefinition;
    deregisterIconFont(id: string): void;
    getIconFont(id: string): IconFontDefinition | undefined;
}
export declare function registerIcon(id: string, defaults: IconDefaults, description: string, deprecationMessage?: string): ThemeIcon;
export declare function getIconRegistry(): IIconRegistry;
export declare const iconsSchemaId = "vscode://schemas/icons";
export declare const widgetClose: ThemeIcon;
export declare const gotoPreviousLocation: ThemeIcon;
export declare const gotoNextLocation: ThemeIcon;
export declare const syncing: ThemeIcon;
export declare const spinningLoading: ThemeIcon;
