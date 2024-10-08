import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IBreakpointContribution } from './debug.js';
export declare class Breakpoints {
    private readonly breakpointContribution;
    private readonly contextKeyService;
    private breakpointsWhen;
    constructor(breakpointContribution: IBreakpointContribution, contextKeyService: IContextKeyService);
    get language(): string;
    get enabled(): boolean;
}
