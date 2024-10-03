import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUserActivityService } from './userActivityService.js';
declare class UserActivityRegistry {
    private todo;
    add: (ctor: {
        new (s: IUserActivityService, ...args: any[]): unknown;
    }) => void;
    take(userActivityService: IUserActivityService, instantiation: IInstantiationService): void;
}
export declare const userActivityRegistry: UserActivityRegistry;
export {};
