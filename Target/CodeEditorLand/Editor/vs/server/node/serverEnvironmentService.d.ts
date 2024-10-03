import { NativeEnvironmentService } from '../../platform/environment/node/environmentService.js';
import { OptionDescriptions } from '../../platform/environment/node/argv.js';
import { INativeEnvironmentService } from '../../platform/environment/common/environment.js';
import { URI } from '../../base/common/uri.js';
export declare const serverOptions: OptionDescriptions<Required<ServerParsedArgs>>;
export interface ServerParsedArgs {
    host?: string;
    port?: string;
    'socket-path'?: string;
    'server-base-path'?: string;
    'connection-token'?: string;
    'connection-token-file'?: string;
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
    workspace: string;
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
