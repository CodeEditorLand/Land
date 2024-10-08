/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class LocalProcessRunningLocation {
    constructor(affinity) {
        this.affinity = affinity;
        this.kind = 1 /* ExtensionHostKind.LocalProcess */;
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
        this.kind = 2 /* ExtensionHostKind.LocalWebWorker */;
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
        this.kind = 3 /* ExtensionHostKind.Remote */;
        this.affinity = 0;
    }
    equals(other) {
        return (this.kind === other.kind);
    }
    asString() {
        return 'Remote';
    }
}
