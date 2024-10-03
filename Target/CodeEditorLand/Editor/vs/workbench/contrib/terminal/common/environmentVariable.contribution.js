import { EnvironmentVariableService } from './environmentVariableService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IEnvironmentVariableService } from './environmentVariable.js';
registerSingleton(IEnvironmentVariableService, EnvironmentVariableService, 1);
