import { URI } from '../../../base/common/uri.js';
export declare function getRemoteAuthority(uri: URI): string | undefined;
export declare function getRemoteName(authority: string): string;
export declare function getRemoteName(authority: undefined): undefined;
export declare function getRemoteName(authority: string | undefined): string | undefined;
export declare function parseAuthorityWithPort(authority: string): {
    host: string;
    port: number;
};
export declare function parseAuthorityWithOptionalPort(authority: string, defaultPort: number): {
    host: string;
    port: number;
};
