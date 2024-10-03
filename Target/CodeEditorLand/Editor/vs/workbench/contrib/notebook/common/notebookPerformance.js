export class NotebookPerfMarks {
    constructor() {
        this._marks = {};
    }
    get value() {
        return { ...this._marks };
    }
    mark(name) {
        if (this._marks[name]) {
            console.error(`Skipping overwrite of notebook perf value: ${name}`);
            return;
        }
        this._marks[name] = Date.now();
    }
}
