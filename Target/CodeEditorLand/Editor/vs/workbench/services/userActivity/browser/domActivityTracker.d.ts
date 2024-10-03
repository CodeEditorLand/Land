import { Disposable } from '../../../../base/common/lifecycle.js';
import { IUserActivityService } from '../common/userActivityService.js';
export declare class DomActivityTracker extends Disposable {
    constructor(userActivityService: IUserActivityService);
}
