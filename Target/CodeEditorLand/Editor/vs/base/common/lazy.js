export class Lazy {
    constructor(executor) {
        this.executor = executor;
        this._didRun = false;
    }
    get hasValue() { return this._didRun; }
    get value() {
        if (!this._didRun) {
            try {
                this._value = this.executor();
            }
            catch (err) {
                this._error = err;
            }
            finally {
                this._didRun = true;
            }
        }
        if (this._error) {
            throw this._error;
        }
        return this._value;
    }
    get rawValue() { return this._value; }
}
