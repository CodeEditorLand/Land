/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/contributions.js';
import { BrowserResourcePerformanceMarks, BrowserStartupTimings } from './startupTimings.js';
// -- startup timings
Registry.as(Extensions.Workbench).registerWorkbenchContribution(BrowserResourcePerformanceMarks, 4 /* LifecyclePhase.Eventually */);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(BrowserStartupTimings, 4 /* LifecyclePhase.Eventually */);
