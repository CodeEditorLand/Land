import { URI } from '../../../../base/common/uri.js';
export interface WebviewRemoteInfo {
    readonly isRemote: boolean;
    readonly authority: string | undefined;
}
/**
 * Root from which resources in webviews are loaded.
 *
 * This is hardcoded because we never expect to actually hit it. Instead these requests
 * should always go to a service worker.
 */
export declare const webviewResourceBaseHost = "vscode-cdn.net";
export declare const webviewRootResourceAuthority = "vscode-resource.vscode-cdn.net";
export declare const webviewGenericCspSource = "'self' https://*.vscode-cdn.net";
/**
 * Construct a uri that can load resources inside a webview
 *
 * We encode the resource component of the uri so that on the main thread
 * we know where to load the resource from (remote or truly local):
 *
 * ```txt
 * ${scheme}+${resource-authority}.vscode-resource.vscode-cdn.net/${path}
 * ```
 *
 * @param resource Uri of the resource to load.
 * @param remoteInfo Optional information about the remote that specifies where `resource` should be resolved from.
 */
export declare function asWebviewUri(resource: URI, remoteInfo?: WebviewRemoteInfo): URI;
export declare function decodeAuthority(authority: string): string;
