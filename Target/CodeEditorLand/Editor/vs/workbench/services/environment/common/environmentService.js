/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
export const IWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);
