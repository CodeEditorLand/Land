import { UriComponents } from '../../../base/common/uri.js';
import { IExtensionTerminalProfile, ITerminalProfile, TerminalIcon } from './terminal.js';
export declare function createProfileSchemaEnums(detectedProfiles: ITerminalProfile[], extensionProfiles?: readonly IExtensionTerminalProfile[]): {
    values: (string | null)[] | undefined;
    markdownDescriptions: string[] | undefined;
};
export declare function terminalProfileArgsMatch(args1: string | string[] | undefined, args2: string | string[] | undefined): boolean;
export declare function terminalIconsEqual(a?: TerminalIcon, b?: TerminalIcon): boolean;
export declare function isUriComponents(thing: unknown): thing is UriComponents;
