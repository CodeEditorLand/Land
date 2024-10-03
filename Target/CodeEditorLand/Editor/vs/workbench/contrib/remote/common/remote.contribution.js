var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { isWeb, OS } from '../../../../base/common/platform.js';
import { Schemas } from '../../../../base/common/network.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { ILoggerService } from '../../../../platform/log/common/log.js';
import { localize, localize2 } from '../../../../nls.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { PersistentConnection } from '../../../../platform/remote/common/remoteAgentConnection.js';
import { IDownloadService } from '../../../../platform/download/common/download.js';
import { DownloadServiceChannel } from '../../../../platform/download/common/downloadIpc.js';
import { RemoteLoggerChannelClient } from '../../../../platform/log/common/logIpc.js';
let LabelContribution = class LabelContribution {
    static { this.ID = 'workbench.contrib.remoteLabel'; }
    constructor(labelService, remoteAgentService) {
        this.labelService = labelService;
        this.remoteAgentService = remoteAgentService;
        this.registerFormatters();
    }
    registerFormatters() {
        this.remoteAgentService.getEnvironment().then(remoteEnvironment => {
            const os = remoteEnvironment?.os || OS;
            const formatting = {
                label: '${path}',
                separator: os === 1 ? '\\' : '/',
                tildify: os !== 1,
                normalizeDriveLetter: os === 1,
                workspaceSuffix: isWeb ? undefined : Schemas.vscodeRemote
            };
            this.labelService.registerFormatter({
                scheme: Schemas.vscodeRemote,
                formatting
            });
            if (remoteEnvironment) {
                this.labelService.registerFormatter({
                    scheme: Schemas.vscodeUserData,
                    formatting
                });
            }
        });
    }
};
LabelContribution = __decorate([
    __param(0, ILabelService),
    __param(1, IRemoteAgentService),
    __metadata("design:paramtypes", [Object, Object])
], LabelContribution);
export { LabelContribution };
let RemoteChannelsContribution = class RemoteChannelsContribution extends Disposable {
    constructor(remoteAgentService, downloadService, loggerService) {
        super();
        const connection = remoteAgentService.getConnection();
        if (connection) {
            connection.registerChannel('download', new DownloadServiceChannel(downloadService));
            connection.withChannel('logger', async (channel) => this._register(new RemoteLoggerChannelClient(loggerService, channel)));
        }
    }
};
RemoteChannelsContribution = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IDownloadService),
    __param(2, ILoggerService),
    __metadata("design:paramtypes", [Object, Object, Object])
], RemoteChannelsContribution);
let RemoteInvalidWorkspaceDetector = class RemoteInvalidWorkspaceDetector extends Disposable {
    static { this.ID = 'workbench.contrib.remoteInvalidWorkspaceDetector'; }
    constructor(fileService, dialogService, environmentService, contextService, fileDialogService, remoteAgentService) {
        super();
        this.fileService = fileService;
        this.dialogService = dialogService;
        this.environmentService = environmentService;
        this.contextService = contextService;
        this.fileDialogService = fileDialogService;
        if (this.environmentService.remoteAuthority) {
            remoteAgentService.getEnvironment().then(remoteEnv => {
                if (remoteEnv) {
                    this.validateRemoteWorkspace();
                }
            });
        }
    }
    async validateRemoteWorkspace() {
        const workspace = this.contextService.getWorkspace();
        const workspaceUriToStat = workspace.configuration ?? workspace.folders.at(0)?.uri;
        if (!workspaceUriToStat) {
            return;
        }
        const exists = await this.fileService.exists(workspaceUriToStat);
        if (exists) {
            return;
        }
        const res = await this.dialogService.confirm({
            type: 'warning',
            message: localize('invalidWorkspaceMessage', "Workspace does not exist"),
            detail: localize('invalidWorkspaceDetail', "Please select another workspace to open."),
            primaryButton: localize({ key: 'invalidWorkspacePrimary', comment: ['&& denotes a mnemonic'] }, "&&Open Workspace...")
        });
        if (res.confirmed) {
            if (workspace.configuration) {
                return this.fileDialogService.pickWorkspaceAndOpen({});
            }
            return this.fileDialogService.pickFolderAndOpen({});
        }
    }
};
RemoteInvalidWorkspaceDetector = __decorate([
    __param(0, IFileService),
    __param(1, IDialogService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, IWorkspaceContextService),
    __param(4, IFileDialogService),
    __param(5, IRemoteAgentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], RemoteInvalidWorkspaceDetector);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(LabelContribution.ID, LabelContribution, 1);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteChannelsContribution, 3);
registerWorkbenchContribution2(RemoteInvalidWorkspaceDetector.ID, RemoteInvalidWorkspaceDetector, 1);
const enableDiagnostics = true;
if (enableDiagnostics) {
    class TriggerReconnectAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.triggerReconnect',
                title: localize2('triggerReconnect', 'Connection: Trigger Reconnect'),
                category: Categories.Developer,
                f1: true,
            });
        }
        async run(accessor) {
            PersistentConnection.debugTriggerReconnection();
        }
    }
    class PauseSocketWriting extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.pauseSocketWriting',
                title: localize2('pauseSocketWriting', 'Connection: Pause socket writing'),
                category: Categories.Developer,
                f1: true,
            });
        }
        async run(accessor) {
            PersistentConnection.debugPauseSocketWriting();
        }
    }
    registerAction2(TriggerReconnectAction);
    registerAction2(PauseSocketWriting);
}
const extensionKindSchema = {
    type: 'string',
    enum: [
        'ui',
        'workspace'
    ],
    enumDescriptions: [
        localize('ui', "UI extension kind. In a remote window, such extensions are enabled only when available on the local machine."),
        localize('workspace', "Workspace extension kind. In a remote window, such extensions are enabled only when available on the remote.")
    ],
};
Registry.as(ConfigurationExtensions.Configuration)
    .registerConfiguration({
    id: 'remote',
    title: localize('remote', "Remote"),
    type: 'object',
    properties: {
        'remote.extensionKind': {
            type: 'object',
            markdownDescription: localize('remote.extensionKind', "Override the kind of an extension. `ui` extensions are installed and run on the local machine while `workspace` extensions are run on the remote. By overriding an extension's default kind using this setting, you specify if that extension should be installed and enabled locally or remotely."),
            patternProperties: {
                '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                    oneOf: [{ type: 'array', items: extensionKindSchema }, extensionKindSchema],
                    default: ['ui'],
                },
            },
            default: {
                'pub.name': ['ui']
            }
        },
        'remote.restoreForwardedPorts': {
            type: 'boolean',
            markdownDescription: localize('remote.restoreForwardedPorts', "Restores the ports you forwarded in a workspace."),
            default: true
        },
        'remote.autoForwardPorts': {
            type: 'boolean',
            markdownDescription: localize('remote.autoForwardPorts', "When enabled, new running processes are detected and ports that they listen on are automatically forwarded. Disabling this setting will not prevent all ports from being forwarded. Even when disabled, extensions will still be able to cause ports to be forwarded, and opening some URLs will still cause ports to forwarded. Also see {0}.", '`#remote.autoForwardPortsSource#`'),
            default: true
        },
        'remote.autoForwardPortsSource': {
            type: 'string',
            markdownDescription: localize('remote.autoForwardPortsSource', "Sets the source from which ports are automatically forwarded when {0} is true. When {0} is false, {1} will be used to find information about ports that have already been forwarded. On Windows and macOS remotes, the `process` and `hybrid` options have no effect and `output` will be used.", '`#remote.autoForwardPorts#`', '`#remote.autoForwardPortsSource#`'),
            enum: ['process', 'output', 'hybrid'],
            enumDescriptions: [
                localize('remote.autoForwardPortsSource.process', "Ports will be automatically forwarded when discovered by watching for processes that are started and include a port."),
                localize('remote.autoForwardPortsSource.output', "Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports forwarded based on output will not be \"un-forwarded\" until reload or until the port is closed by the user in the Ports view."),
                localize('remote.autoForwardPortsSource.hybrid', "Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports will be \"un-forwarded\" by watching for processes that listen on that port to be terminated.")
            ],
            default: 'process'
        },
        'remote.autoForwardPortsFallback': {
            type: 'number',
            default: 20,
            markdownDescription: localize('remote.autoForwardPortFallback', "The number of auto forwarded ports that will trigger the switch from `process` to `hybrid` when automatically forwarding ports and `remote.autoForwardPortsSource` is set to `process` by default. Set to `0` to disable the fallback. When `remote.autoForwardPortsFallback` hasn't been configured, but `remote.autoForwardPortsSource` has, `remote.autoForwardPortsFallback` will be treated as though it's set to `0`.")
        },
        'remote.forwardOnOpen': {
            type: 'boolean',
            description: localize('remote.forwardOnClick', "Controls whether local URLs with a port will be forwarded when opened from the terminal and the debug console."),
            default: true
        },
        'remote.portsAttributes': {
            type: 'object',
            patternProperties: {
                '(^\\d+(-\\d+)?$)|(.+)': {
                    type: 'object',
                    description: localize('remote.portsAttributes.port', "A port, range of ports (ex. \"40000-55000\"), host and port (ex. \"db:1234\"), or regular expression (ex. \".+\\\\/server.js\").  For a port number or range, the attributes will apply to that port number or range of port numbers. Attributes which use a regular expression will apply to ports whose associated process command line matches the expression."),
                    properties: {
                        'onAutoForward': {
                            type: 'string',
                            enum: ['notify', 'openBrowser', 'openBrowserOnce', 'openPreview', 'silent', 'ignore'],
                            enumDescriptions: [
                                localize('remote.portsAttributes.notify', "Shows a notification when a port is automatically forwarded."),
                                localize('remote.portsAttributes.openBrowser', "Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),
                                localize('remote.portsAttributes.openBrowserOnce', "Opens the browser when the port is automatically forwarded, but only the first time the port is forward during a session. Depending on your settings, this could open an embedded browser."),
                                localize('remote.portsAttributes.openPreview', "Opens a preview in the same window when the port is automatically forwarded."),
                                localize('remote.portsAttributes.silent', "Shows no notification and takes no action when this port is automatically forwarded."),
                                localize('remote.portsAttributes.ignore', "This port will not be automatically forwarded.")
                            ],
                            description: localize('remote.portsAttributes.onForward', "Defines the action that occurs when the port is discovered for automatic forwarding"),
                            default: 'notify'
                        },
                        'elevateIfNeeded': {
                            type: 'boolean',
                            description: localize('remote.portsAttributes.elevateIfNeeded', "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),
                            default: false
                        },
                        'label': {
                            type: 'string',
                            description: localize('remote.portsAttributes.label', "Label that will be shown in the UI for this port."),
                            default: localize('remote.portsAttributes.labelDefault', "Application")
                        },
                        'requireLocalPort': {
                            type: 'boolean',
                            markdownDescription: localize('remote.portsAttributes.requireLocalPort', "When true, a modal dialog will show if the chosen local port isn't used for forwarding."),
                            default: false
                        },
                        'protocol': {
                            type: 'string',
                            enum: ['http', 'https'],
                            description: localize('remote.portsAttributes.protocol', "The protocol to use when forwarding this port.")
                        }
                    },
                    default: {
                        'label': localize('remote.portsAttributes.labelDefault', "Application"),
                        'onAutoForward': 'notify'
                    }
                }
            },
            markdownDescription: localize('remote.portsAttributes', "Set properties that are applied when a specific port number is forwarded. For example:\n\n```\n\"3000\": {\n  \"label\": \"Application\"\n},\n\"40000-55000\": {\n  \"onAutoForward\": \"ignore\"\n},\n\".+\\\\/server.js\": {\n \"onAutoForward\": \"openPreview\"\n}\n```"),
            defaultSnippets: [{ body: { '${1:3000}': { label: '${2:Application}', onAutoForward: 'openPreview' } } }],
            errorMessage: localize('remote.portsAttributes.patternError', "Must be a port number, range of port numbers, or regular expression."),
            additionalProperties: false,
            default: {
                '443': {
                    'protocol': 'https'
                },
                '8443': {
                    'protocol': 'https'
                }
            }
        },
        'remote.otherPortsAttributes': {
            type: 'object',
            properties: {
                'onAutoForward': {
                    type: 'string',
                    enum: ['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'],
                    enumDescriptions: [
                        localize('remote.portsAttributes.notify', "Shows a notification when a port is automatically forwarded."),
                        localize('remote.portsAttributes.openBrowser', "Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),
                        localize('remote.portsAttributes.openPreview', "Opens a preview in the same window when the port is automatically forwarded."),
                        localize('remote.portsAttributes.silent', "Shows no notification and takes no action when this port is automatically forwarded."),
                        localize('remote.portsAttributes.ignore', "This port will not be automatically forwarded.")
                    ],
                    description: localize('remote.portsAttributes.onForward', "Defines the action that occurs when the port is discovered for automatic forwarding"),
                    default: 'notify'
                },
                'elevateIfNeeded': {
                    type: 'boolean',
                    description: localize('remote.portsAttributes.elevateIfNeeded', "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),
                    default: false
                },
                'label': {
                    type: 'string',
                    description: localize('remote.portsAttributes.label', "Label that will be shown in the UI for this port."),
                    default: localize('remote.portsAttributes.labelDefault', "Application")
                },
                'requireLocalPort': {
                    type: 'boolean',
                    markdownDescription: localize('remote.portsAttributes.requireLocalPort', "When true, a modal dialog will show if the chosen local port isn't used for forwarding."),
                    default: false
                },
                'protocol': {
                    type: 'string',
                    enum: ['http', 'https'],
                    description: localize('remote.portsAttributes.protocol', "The protocol to use when forwarding this port.")
                }
            },
            defaultSnippets: [{ body: { onAutoForward: 'ignore' } }],
            markdownDescription: localize('remote.portsAttributes.defaults', "Set default properties that are applied to all ports that don't get properties from the setting {0}. For example:\n\n```\n{\n  \"onAutoForward\": \"ignore\"\n}\n```", '`#remote.portsAttributes#`'),
            additionalProperties: false
        },
        'remote.localPortHost': {
            type: 'string',
            enum: ['localhost', 'allInterfaces'],
            default: 'localhost',
            description: localize('remote.localPortHost', "Specifies the local host name that will be used for port forwarding.")
        }
    }
});
