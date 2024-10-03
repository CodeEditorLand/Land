export function onObservableChange(observable, callback) {
    const o = {
        beginUpdate() { },
        endUpdate() { },
        handlePossibleChange(observable) {
            observable.reportChanges();
        },
        handleChange(_observable, change) {
            callback(change);
        }
    };
    observable.addObserver(o);
    return {
        dispose() {
            observable.removeObserver(o);
        }
    };
}
