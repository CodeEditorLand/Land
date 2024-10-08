/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ShowCandidateContribution } from './showCandidate.js';
import { TunnelFactoryContribution } from './tunnelFactory.js';
import { RemoteAgentConnectionStatusListener, RemoteMarkers } from './remote.js';
import { RemoteStatusIndicator } from './remoteIndicator.js';
import { AutomaticPortForwarding, ForwardedPortsView, PortRestore } from './remoteExplorer.js';
import { InitialRemoteConnectionHealthContribution } from './remoteConnectionHealth.js';
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(ShowCandidateContribution.ID, ShowCandidateContribution, 2 /* WorkbenchPhase.BlockRestore */);
registerWorkbenchContribution2(TunnelFactoryContribution.ID, TunnelFactoryContribution, 2 /* WorkbenchPhase.BlockRestore */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteAgentConnectionStatusListener, 4 /* LifecyclePhase.Eventually */);
registerWorkbenchContribution2(RemoteStatusIndicator.ID, RemoteStatusIndicator, 1 /* WorkbenchPhase.BlockStartup */);
workbenchContributionsRegistry.registerWorkbenchContribution(ForwardedPortsView, 3 /* LifecyclePhase.Restored */);
workbenchContributionsRegistry.registerWorkbenchContribution(PortRestore, 4 /* LifecyclePhase.Eventually */);
workbenchContributionsRegistry.registerWorkbenchContribution(AutomaticPortForwarding, 4 /* LifecyclePhase.Eventually */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteMarkers, 4 /* LifecyclePhase.Eventually */);
workbenchContributionsRegistry.registerWorkbenchContribution(InitialRemoteConnectionHealthContribution, 3 /* LifecyclePhase.Restored */);
