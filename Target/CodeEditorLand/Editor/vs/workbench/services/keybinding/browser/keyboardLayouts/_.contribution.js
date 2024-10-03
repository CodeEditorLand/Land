export class KeyboardLayoutContribution {
    static { this.INSTANCE = new KeyboardLayoutContribution(); }
    get layoutInfos() {
        return this._layoutInfos;
    }
    constructor() {
        this._layoutInfos = [];
    }
    registerKeyboardLayout(layout) {
        this._layoutInfos.push(layout);
    }
}
