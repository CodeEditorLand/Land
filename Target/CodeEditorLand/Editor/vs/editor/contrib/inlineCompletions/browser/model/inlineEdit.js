export class InlineEdit {
    constructor(edit) {
        this.edit = edit;
    }
    get range() {
        return this.edit.range;
    }
    get text() {
        return this.edit.text;
    }
}
