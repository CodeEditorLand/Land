import Severity from '../../../base/common/severity.js';
import { URI } from '../../../base/common/uri.js';
import { IExtensionManifest } from './extensions.js';
export interface IParsedVersion {
    hasCaret: boolean;
    hasGreaterEquals: boolean;
    majorBase: number;
    majorMustEqual: boolean;
    minorBase: number;
    minorMustEqual: boolean;
    patchBase: number;
    patchMustEqual: boolean;
    preRelease: string | null;
}
export interface INormalizedVersion {
    majorBase: number;
    majorMustEqual: boolean;
    minorBase: number;
    minorMustEqual: boolean;
    patchBase: number;
    patchMustEqual: boolean;
    notBefore: number;
    isMinimum: boolean;
}
export declare function isValidVersionStr(version: string): boolean;
export declare function parseVersion(version: string): IParsedVersion | null;
export declare function normalizeVersion(version: IParsedVersion | null): INormalizedVersion | null;
export declare function isValidVersion(_inputVersion: string | INormalizedVersion, _inputDate: ProductDate, _desiredVersion: string | INormalizedVersion): boolean;
type ProductDate = string | Date | undefined;
export declare function validateExtensionManifest(productVersion: string, productDate: ProductDate, extensionLocation: URI, extensionManifest: IExtensionManifest, extensionIsBuiltin: boolean, validateApiVersion: boolean): readonly [Severity, string][];
export declare function isValidExtensionVersion(productVersion: string, productDate: ProductDate, extensionManifest: IExtensionManifest, extensionIsBuiltin: boolean, notices: string[]): boolean;
export declare function isEngineValid(engine: string, version: string, date: ProductDate): boolean;
export declare function areApiProposalsCompatible(apiProposals: string[]): boolean;
export declare function areApiProposalsCompatible(apiProposals: string[], notices: string[]): boolean;
export declare function areApiProposalsCompatible(apiProposals: string[], productApiProposals: Readonly<{
    [proposalName: string]: Readonly<{
        proposal: string;
        version?: number;
    }>;
}>): boolean;
export {};
