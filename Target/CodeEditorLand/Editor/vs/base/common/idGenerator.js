export class IdGenerator {
    constructor(prefix) {
        this._prefix = prefix;
        this._lastId = 0;
    }
    nextId() {
        return this._prefix + (++this._lastId);
    }
}
export const defaultGenerator = new IdGenerator('id#');
