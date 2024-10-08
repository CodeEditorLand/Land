/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EnvironmentVariableService } from './environmentVariableService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IEnvironmentVariableService } from './environmentVariable.js';
registerSingleton(IEnvironmentVariableService, EnvironmentVariableService, 1 /* InstantiationType.Delayed */);
