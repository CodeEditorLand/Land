import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { OperatingSystem } from '../../../base/common/platform.js';
import { IExtensionTerminalProfile, ITerminalProfile } from './terminal.js';
export declare const terminalColorSchema: IJSONSchema;
export declare const terminalIconSchema: IJSONSchema;
export declare function registerTerminalPlatformConfiguration(): void;
export declare function registerTerminalDefaultProfileConfiguration(detectedProfiles?: {
    os: OperatingSystem;
    profiles: ITerminalProfile[];
}, extensionContributedProfiles?: readonly IExtensionTerminalProfile[]): void;
