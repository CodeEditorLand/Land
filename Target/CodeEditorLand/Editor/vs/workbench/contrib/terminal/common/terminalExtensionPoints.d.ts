import { IExtensionTerminalProfile } from '../../../../platform/terminal/common/terminal.js';
export interface ITerminalContributionService {
    readonly _serviceBrand: undefined;
    readonly terminalProfiles: ReadonlyArray<IExtensionTerminalProfile>;
}
export declare const ITerminalContributionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalContributionService>;
export declare class TerminalContributionService implements ITerminalContributionService {
    _serviceBrand: undefined;
    private _terminalProfiles;
    get terminalProfiles(): readonly IExtensionTerminalProfile[];
    constructor();
}
