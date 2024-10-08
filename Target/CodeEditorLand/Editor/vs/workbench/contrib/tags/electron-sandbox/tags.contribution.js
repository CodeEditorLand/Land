/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { WorkspaceTags } from './workspaceTags.js';
// Register Workspace Tags Contribution
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkspaceTags, 4 /* LifecyclePhase.Eventually */);
