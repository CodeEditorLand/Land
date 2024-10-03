export function createSingleCallFunction(fn, fnDidRunCallback) {
    const _this = this;
    let didCall = false;
    let result;
    return function () {
        if (didCall) {
            return result;
        }
        didCall = true;
        if (fnDidRunCallback) {
            try {
                result = fn.apply(_this, arguments);
            }
            finally {
                fnDidRunCallback();
            }
        }
        else {
            result = fn.apply(_this, arguments);
        }
        return result;
    };
}
