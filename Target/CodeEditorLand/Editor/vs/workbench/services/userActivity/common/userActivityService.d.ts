import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export interface IMarkActiveOptions {
    whenHeldFor?: number;
}
export interface IUserActivityService {
    _serviceBrand: undefined;
    readonly isActive: boolean;
    readonly onDidChangeIsActive: Event<boolean>;
    markActive(opts?: IMarkActiveOptions): IDisposable;
}
export declare const IUserActivityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUserActivityService>;
export declare class UserActivityService extends Disposable implements IUserActivityService {
    readonly _serviceBrand: undefined;
    private readonly markInactive;
    private readonly changeEmitter;
    private active;
    isActive: boolean;
    onDidChangeIsActive: Event<boolean>;
    constructor(instantiationService: IInstantiationService);
    markActive(opts?: IMarkActiveOptions): IDisposable;
}
