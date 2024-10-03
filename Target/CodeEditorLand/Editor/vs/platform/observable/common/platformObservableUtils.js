import { autorunOpts, observableFromEventOpts } from '../../../base/common/observable.js';
export function observableConfigValue(key, defaultValue, configurationService) {
    return observableFromEventOpts({ debugName: () => `Configuration Key "${key}"`, }, (handleChange) => configurationService.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(key)) {
            handleChange(e);
        }
    }), () => configurationService.getValue(key) ?? defaultValue);
}
export function bindContextKey(key, service, computeValue) {
    const boundKey = key.bindTo(service);
    return autorunOpts({ debugName: () => `Set Context Key "${key.key}"` }, reader => {
        boundKey.set(computeValue(reader));
    });
}
