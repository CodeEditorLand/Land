import { Emitter } from '../../../../base/common/event.js';
export class DebugCompoundRoot {
    constructor() {
        this.stopped = false;
        this.stopEmitter = new Emitter();
        this.onDidSessionStop = this.stopEmitter.event;
    }
    sessionStopped() {
        if (!this.stopped) {
            this.stopped = true;
            this.stopEmitter.fire();
        }
    }
}
