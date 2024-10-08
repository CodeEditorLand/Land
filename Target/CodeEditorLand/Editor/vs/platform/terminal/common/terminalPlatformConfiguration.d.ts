import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { OperatingSystem } from '../../../base/common/platform.js';
import { IExtensionTerminalProfile, ITerminalProfile } from './terminal.js';
export declare const terminalColorSchema: IJSONSchema;
export declare const terminalIconSchema: IJSONSchema;
/**
 * Registers terminal configurations required by shared process and remote server.
 */
export declare function registerTerminalPlatformConfiguration(): void;
export declare function registerTerminalDefaultProfileConfiguration(detectedProfiles?: {
    os: OperatingSystem;
    profiles: ITerminalProfile[];
}, extensionContributedProfiles?: readonly IExtensionTerminalProfile[]): void;
