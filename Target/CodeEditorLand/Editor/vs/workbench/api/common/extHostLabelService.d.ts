import { ResourceLabelFormatter } from '../../../platform/label/common/label.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ExtHostLabelServiceShape, IMainContext } from './extHost.protocol.js';
export declare class ExtHostLabelService implements ExtHostLabelServiceShape {
    private readonly _proxy;
    private _handlePool;
    constructor(mainContext: IMainContext);
    $registerResourceLabelFormatter(formatter: ResourceLabelFormatter): IDisposable;
}
