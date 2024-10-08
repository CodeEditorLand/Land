/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from '../../../../nls.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { RawContextKey, ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
export const CustomExecutionSupportedContext = new RawContextKey('customExecutionSupported', false, nls.localize('tasks.customExecutionSupported', "Whether CustomExecution tasks are supported. Consider using in the when clause of a \'taskDefinition\' contribution."));
export const ShellExecutionSupportedContext = new RawContextKey('shellExecutionSupported', false, nls.localize('tasks.shellExecutionSupported', "Whether ShellExecution tasks are supported. Consider using in the when clause of a \'taskDefinition\' contribution."));
export const TaskCommandsRegistered = new RawContextKey('taskCommandsRegistered', false, nls.localize('tasks.taskCommandsRegistered', "Whether the task commands have been registered yet"));
export const ProcessExecutionSupportedContext = new RawContextKey('processExecutionSupported', false, nls.localize('tasks.processExecutionSupported', "Whether ProcessExecution tasks are supported. Consider using in the when clause of a \'taskDefinition\' contribution."));
export const ServerlessWebContext = new RawContextKey('serverlessWebContext', false, nls.localize('tasks.serverlessWebContext', "True when in the web with no remote authority."));
export const TaskExecutionSupportedContext = ContextKeyExpr.or(ContextKeyExpr.and(ShellExecutionSupportedContext, ProcessExecutionSupportedContext), CustomExecutionSupportedContext);
export const ITaskService = createDecorator('taskService');
