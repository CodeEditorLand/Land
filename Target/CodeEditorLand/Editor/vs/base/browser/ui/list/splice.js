export class CombinedSpliceable {
    constructor(spliceables) {
        this.spliceables = spliceables;
    }
    splice(start, deleteCount, elements) {
        this.spliceables.forEach(s => s.splice(start, deleteCount, elements));
    }
}
