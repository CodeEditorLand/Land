/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import * as nls from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import { IInstantiationService, createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITunnelService } from '../../../../platform/tunnel/common/tunnel.js';
import { TunnelModel } from './tunnelModel.js';
import { ExtensionsRegistry } from '../../extensions/common/extensionsRegistry.js';
export const IRemoteExplorerService = createDecorator('remoteExplorerService');
export const REMOTE_EXPLORER_TYPE_KEY = 'remote.explorerType';
export const TUNNEL_VIEW_ID = '~remote.forwardedPorts';
export const TUNNEL_VIEW_CONTAINER_ID = '~remote.forwardedPortsContainer';
export const PORT_AUTO_FORWARD_SETTING = 'remote.autoForwardPorts';
export const PORT_AUTO_SOURCE_SETTING = 'remote.autoForwardPortsSource';
export const PORT_AUTO_FALLBACK_SETTING = 'remote.autoForwardPortsFallback';
export const PORT_AUTO_SOURCE_SETTING_PROCESS = 'process';
export const PORT_AUTO_SOURCE_SETTING_OUTPUT = 'output';
export const PORT_AUTO_SOURCE_SETTING_HYBRID = 'hybrid';
export var TunnelType;
(function (TunnelType) {
    TunnelType["Candidate"] = "Candidate";
    TunnelType["Detected"] = "Detected";
    TunnelType["Forwarded"] = "Forwarded";
    TunnelType["Add"] = "Add";
})(TunnelType || (TunnelType = {}));
export var TunnelEditId;
(function (TunnelEditId) {
    TunnelEditId[TunnelEditId["None"] = 0] = "None";
    TunnelEditId[TunnelEditId["New"] = 1] = "New";
    TunnelEditId[TunnelEditId["Label"] = 2] = "Label";
    TunnelEditId[TunnelEditId["LocalPort"] = 3] = "LocalPort";
})(TunnelEditId || (TunnelEditId = {}));
const getStartedWalkthrough = {
    type: 'object',
    required: ['id'],
    properties: {
        id: {
            description: nls.localize('getStartedWalkthrough.id', 'The ID of a Get Started walkthrough to open.'),
            type: 'string'
        },
    }
};
const remoteHelpExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'remoteHelp',
    jsonSchema: {
        description: nls.localize('RemoteHelpInformationExtPoint', 'Contributes help information for Remote'),
        type: 'object',
        properties: {
            'getStarted': {
                description: nls.localize('RemoteHelpInformationExtPoint.getStarted', "The url, or a command that returns the url, to your project's Getting Started page, or a walkthrough ID contributed by your project's extension"),
                oneOf: [
                    { type: 'string' },
                    getStartedWalkthrough
                ]
            },
            'documentation': {
                description: nls.localize('RemoteHelpInformationExtPoint.documentation', "The url, or a command that returns the url, to your project's documentation page"),
                type: 'string'
            },
            'feedback': {
                description: nls.localize('RemoteHelpInformationExtPoint.feedback', "The url, or a command that returns the url, to your project's feedback reporter"),
                type: 'string',
                markdownDeprecationMessage: nls.localize('RemoteHelpInformationExtPoint.feedback.deprecated', "Use {0} instead", '`reportIssue`')
            },
            'reportIssue': {
                description: nls.localize('RemoteHelpInformationExtPoint.reportIssue', "The url, or a command that returns the url, to your project's issue reporter"),
                type: 'string'
            },
            'issues': {
                description: nls.localize('RemoteHelpInformationExtPoint.issues', "The url, or a command that returns the url, to your project's issues list"),
                type: 'string'
            }
        }
    }
});
export var PortsEnablement;
(function (PortsEnablement) {
    PortsEnablement[PortsEnablement["Disabled"] = 0] = "Disabled";
    PortsEnablement[PortsEnablement["ViewOnly"] = 1] = "ViewOnly";
    PortsEnablement[PortsEnablement["AdditionalFeatures"] = 2] = "AdditionalFeatures";
})(PortsEnablement || (PortsEnablement = {}));
let RemoteExplorerService = class RemoteExplorerService {
    constructor(storageService, tunnelService, instantiationService) {
        this.storageService = storageService;
        this.tunnelService = tunnelService;
        this._targetType = [];
        this._onDidChangeTargetType = new Emitter();
        this.onDidChangeTargetType = this._onDidChangeTargetType.event;
        this._onDidChangeHelpInformation = new Emitter();
        this.onDidChangeHelpInformation = this._onDidChangeHelpInformation.event;
        this._helpInformation = [];
        this._onDidChangeEditable = new Emitter();
        this.onDidChangeEditable = this._onDidChangeEditable.event;
        this._onEnabledPortsFeatures = new Emitter();
        this.onEnabledPortsFeatures = this._onEnabledPortsFeatures.event;
        this._portsFeaturesEnabled = PortsEnablement.Disabled;
        this.namedProcesses = new Map();
        this._tunnelModel = instantiationService.createInstance(TunnelModel);
        remoteHelpExtPoint.setHandler((extensions) => {
            this._helpInformation.push(...extensions);
            this._onDidChangeHelpInformation.fire(extensions);
        });
    }
    get helpInformation() {
        return this._helpInformation;
    }
    set targetType(name) {
        // Can just compare the first element of the array since there are no target overlaps
        const current = this._targetType.length > 0 ? this._targetType[0] : '';
        const newName = name.length > 0 ? name[0] : '';
        if (current !== newName) {
            this._targetType = name;
            this.storageService.store(REMOTE_EXPLORER_TYPE_KEY, this._targetType.toString(), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.storageService.store(REMOTE_EXPLORER_TYPE_KEY, this._targetType.toString(), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            this._onDidChangeTargetType.fire(this._targetType);
        }
    }
    get targetType() {
        return this._targetType;
    }
    get tunnelModel() {
        return this._tunnelModel;
    }
    forward(tunnelProperties, attributes) {
        return this.tunnelModel.forward(tunnelProperties, attributes);
    }
    close(remote, reason) {
        return this.tunnelModel.close(remote.host, remote.port, reason);
    }
    setTunnelInformation(tunnelInformation) {
        if (tunnelInformation?.features) {
            this.tunnelService.setTunnelFeatures(tunnelInformation.features);
        }
        this.tunnelModel.addEnvironmentTunnels(tunnelInformation?.environmentTunnels);
    }
    setEditable(tunnelItem, editId, data) {
        if (!data) {
            this._editable = undefined;
        }
        else {
            this._editable = { tunnelItem, data, editId };
        }
        this._onDidChangeEditable.fire(tunnelItem ? { tunnel: tunnelItem, editId } : undefined);
    }
    getEditableData(tunnelItem, editId) {
        return (this._editable &&
            ((!tunnelItem && (tunnelItem === this._editable.tunnelItem)) ||
                (tunnelItem && (this._editable.tunnelItem?.remotePort === tunnelItem.remotePort) && (this._editable.tunnelItem.remoteHost === tunnelItem.remoteHost)
                    && (this._editable.editId === editId)))) ?
            this._editable.data : undefined;
    }
    setCandidateFilter(filter) {
        if (!filter) {
            return {
                dispose: () => { }
            };
        }
        this.tunnelModel.setCandidateFilter(filter);
        return {
            dispose: () => {
                this.tunnelModel.setCandidateFilter(undefined);
            }
        };
    }
    onFoundNewCandidates(candidates) {
        this.tunnelModel.setCandidates(candidates);
    }
    restore() {
        return this.tunnelModel.restoreForwarded();
    }
    enablePortsFeatures(viewOnly) {
        this._portsFeaturesEnabled = viewOnly ? PortsEnablement.ViewOnly : PortsEnablement.AdditionalFeatures;
        this._onEnabledPortsFeatures.fire();
    }
    get portsFeaturesEnabled() {
        return this._portsFeaturesEnabled;
    }
};
RemoteExplorerService = __decorate([
    __param(0, IStorageService),
    __param(1, ITunnelService),
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], RemoteExplorerService);
registerSingleton(IRemoteExplorerService, RemoteExplorerService, 1 /* InstantiationType.Delayed */);
