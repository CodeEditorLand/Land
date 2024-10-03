import { IConfigurationNode } from '../../../../platform/configuration/common/configurationRegistry.js';
export declare const defaultExternalUriOpenerId = "default";
export declare const externalUriOpenersSettingId = "workbench.externalUriOpeners";
export interface ExternalUriOpenersConfiguration {
    readonly [uriGlob: string]: string;
}
export declare const externalUriOpenersConfigurationNode: IConfigurationNode;
export declare function updateContributedOpeners(enumValues: string[], enumDescriptions: string[]): void;
