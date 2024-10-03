import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
interface INativeWindowDriverHelper {
    exitApplication(): Promise<void>;
}
export declare function registerWindowDriver(instantiationService: IInstantiationService, helper: INativeWindowDriverHelper): void;
export {};
