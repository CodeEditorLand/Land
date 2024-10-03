import { isThenable, Promises } from '../../../base/common/async.js';
export function handleVetos(vetos, onError) {
    if (vetos.length === 0) {
        return Promise.resolve(false);
    }
    const promises = [];
    let lazyValue = false;
    for (const valueOrPromise of vetos) {
        if (valueOrPromise === true) {
            return Promise.resolve(true);
        }
        if (isThenable(valueOrPromise)) {
            promises.push(valueOrPromise.then(value => {
                if (value) {
                    lazyValue = true;
                }
            }, err => {
                onError(err);
                lazyValue = true;
            }));
        }
    }
    return Promises.settled(promises).then(() => lazyValue);
}
