/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { RemoteStartEntry } from './remoteStartEntry.js';
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(RemoteStartEntry, 3 /* LifecyclePhase.Restored */);
