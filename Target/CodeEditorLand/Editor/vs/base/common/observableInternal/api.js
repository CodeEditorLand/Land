import { ObservableValue } from './base.js';
import { DebugNameData } from './debugName.js';
import { strictEquals } from './commonFacade/deps.js';
import { LazyObservableValue } from './lazyObservableValue.js';
export function observableValueOpts(options, initialValue) {
    if (options.lazy) {
        return new LazyObservableValue(new DebugNameData(options.owner, options.debugName, undefined), initialValue, options.equalsFn ?? strictEquals);
    }
    return new ObservableValue(new DebugNameData(options.owner, options.debugName, undefined), initialValue, options.equalsFn ?? strictEquals);
}
