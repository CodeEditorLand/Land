export class EditorTheme {
    get type() {
        return this._theme.type;
    }
    get value() {
        return this._theme;
    }
    constructor(theme) {
        this._theme = theme;
    }
    update(theme) {
        this._theme = theme;
    }
    getColor(color) {
        return this._theme.getColor(color);
    }
}
