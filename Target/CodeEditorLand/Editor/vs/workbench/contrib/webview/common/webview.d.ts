import { URI } from '../../../../base/common/uri.js';
export interface WebviewRemoteInfo {
    readonly isRemote: boolean;
    readonly authority: string | undefined;
}
export declare const webviewResourceBaseHost = "vscode-cdn.net";
export declare const webviewRootResourceAuthority = "vscode-resource.vscode-cdn.net";
export declare const webviewGenericCspSource = "'self' https://*.vscode-cdn.net";
export declare function asWebviewUri(resource: URI, remoteInfo?: WebviewRemoteInfo): URI;
export declare function decodeAuthority(authority: string): string;
