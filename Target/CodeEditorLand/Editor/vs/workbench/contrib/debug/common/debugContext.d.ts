import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Variable } from './debugModel.js';
export declare function getContextForVariable(parentContext: IContextKeyService, variable: Variable, additionalContext?: [string, unknown][]): IContextKeyService;
