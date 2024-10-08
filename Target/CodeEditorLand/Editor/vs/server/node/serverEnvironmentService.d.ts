import { NativeEnvironmentService } from '../../platform/environment/node/environmentService.js';
import { OptionDescriptions } from '../../platform/environment/node/argv.js';
import { INativeEnvironmentService } from '../../platform/environment/common/environment.js';
import { URI } from '../../base/common/uri.js';
export declare const serverOptions: OptionDescriptions<Required<ServerParsedArgs>>;
export interface ServerParsedArgs {
    host?: string;
    /**
     * A port or a port range
     */
    port?: string;
    'socket-path'?: string;
    /**
     * The path under which the web UI and the code server is provided.
     * By defaults it is '/'.`
     */
    'server-base-path'?: string;
    /**
     * A secret token that must be provided by the web client with all requests.
     * Use only `[0-9A-Za-z\-]`.
     *
     * By default, a UUID will be generated every time the server starts up.
     *
     * If the server is running on a multi-user system, then consider
     * using `--connection-token-file` which has the advantage that the token cannot
     * be seen by other users using `ps` or similar commands.
     */
    'connection-token'?: string;
    /**
     * A path to a filename which will be read on startup.
     * Consider placing this file in a folder readable only by the same user (a `chmod 0700` directory).
     *
     * The contents of the file will be used as the connection token. Use only `[0-9A-Z\-]` as contents in the file.
     * The file can optionally end in a `\n` which will be ignored.
     *
     * This secret must be communicated to any vscode instance via the resolver or embedder API.
     */
    'connection-token-file'?: string;
    /**
     * Run the server without a connection token
     */
    'without-connection-token'?: boolean;
    'disable-websocket-compression'?: boolean;
    'print-startup-performance'?: boolean;
    'print-ip-address'?: boolean;
    'accept-server-license-terms': boolean;
    'server-data-dir'?: string;
    'telemetry-level'?: string;
    'disable-workspace-trust'?: boolean;
    'user-data-dir'?: string;
    'enable-smoke-test-driver'?: boolean;
    'disable-telemetry'?: boolean;
    'file-watcher-polling'?: string;
    'log'?: string[];
    'logsPath'?: string;
    'force-disable-user-env'?: boolean;
    'default-workspace'?: string;
    'default-folder'?: string;
    /** @deprecated use default-workspace instead */
    workspace: string;
    /** @deprecated use default-folder instead */
    folder: string;
    'enable-sync'?: boolean;
    'github-auth'?: string;
    'use-test-resolver'?: boolean;
    'extensions-dir'?: string;
    'extensions-download-dir'?: string;
    'builtin-extensions-dir'?: string;
    'install-extension'?: string[];
    'install-builtin-extension'?: string[];
    'update-extensions'?: boolean;
    'uninstall-extension'?: string[];
    'list-extensions'?: boolean;
    'locate-extension'?: string[];
    'show-versions'?: boolean;
    'category'?: string;
    force?: boolean;
    'do-not-sync'?: boolean;
    'pre-release'?: boolean;
    'start-server'?: boolean;
    'enable-remote-auto-shutdown'?: boolean;
    'remote-auto-shutdown-without-delay'?: boolean;
    'use-host-proxy'?: boolean;
    'without-browser-env-var'?: boolean;
    help: boolean;
    version: boolean;
    'locate-shell-integration-path'?: string;
    compatibility: string;
    _: string[];
}
export declare const IServerEnvironmentService: import("../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IServerEnvironmentService>;
export interface IServerEnvironmentService extends INativeEnvironmentService {
    readonly args: ServerParsedArgs;
}
export declare class ServerEnvironmentService extends NativeEnvironmentService implements IServerEnvironmentService {
    get userRoamingDataHome(): URI;
    get args(): ServerParsedArgs;
}
