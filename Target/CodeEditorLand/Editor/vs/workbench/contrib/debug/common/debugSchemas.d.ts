import * as extensionsRegistry from '../../../services/extensions/common/extensionsRegistry.js';
import { IDebuggerContribution, IBreakpointContribution } from './debug.js';
import { IJSONSchema } from '../../../../base/common/jsonSchema.js';
export declare const debuggersExtPoint: extensionsRegistry.IExtensionPoint<IDebuggerContribution[]>;
export declare const breakpointsExtPoint: extensionsRegistry.IExtensionPoint<IBreakpointContribution[]>;
export declare const presentationSchema: IJSONSchema;
export declare const launchSchema: IJSONSchema;
