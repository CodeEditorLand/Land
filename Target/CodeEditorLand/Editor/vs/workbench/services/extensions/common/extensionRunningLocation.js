export class LocalProcessRunningLocation {
    constructor(affinity) {
        this.affinity = affinity;
        this.kind = 1;
    }
    equals(other) {
        return (this.kind === other.kind && this.affinity === other.affinity);
    }
    asString() {
        if (this.affinity === 0) {
            return 'LocalProcess';
        }
        return `LocalProcess${this.affinity}`;
    }
}
export class LocalWebWorkerRunningLocation {
    constructor(affinity) {
        this.affinity = affinity;
        this.kind = 2;
    }
    equals(other) {
        return (this.kind === other.kind && this.affinity === other.affinity);
    }
    asString() {
        if (this.affinity === 0) {
            return 'LocalWebWorker';
        }
        return `LocalWebWorker${this.affinity}`;
    }
}
export class RemoteRunningLocation {
    constructor() {
        this.kind = 3;
        this.affinity = 0;
    }
    equals(other) {
        return (this.kind === other.kind);
    }
    asString() {
        return 'Remote';
    }
}
