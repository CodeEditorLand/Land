import { NativeParsedArgs } from '../common/argv.js';
import { IDebugParams } from '../common/environment.js';
import { AbstractNativeEnvironmentService } from '../common/environmentService.js';
import { IProductService } from '../../product/common/productService.js';
export declare class NativeEnvironmentService extends AbstractNativeEnvironmentService {
    constructor(args: NativeParsedArgs, productService: IProductService);
}
export declare function parsePtyHostDebugPort(args: NativeParsedArgs, isBuilt: boolean): IDebugParams;
export declare function parseSharedProcessDebugPort(args: NativeParsedArgs, isBuilt: boolean): IDebugParams;
