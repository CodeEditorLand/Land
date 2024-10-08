import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Variable } from './debugModel.js';
/**
 * Gets a context key overlay that has context for the given variable.
 */
export declare function getContextForVariable(parentContext: IContextKeyService, variable: Variable, additionalContext?: [string, unknown][]): IContextKeyService;
