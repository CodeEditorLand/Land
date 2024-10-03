import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { mark } from '../../../../base/common/performance.js';
import { URI } from '../../../../base/common/uri.js';
export class BasePty extends Disposable {
    constructor(id, shouldPersist) {
        super();
        this.id = id;
        this.shouldPersist = shouldPersist;
        this._properties = {
            cwd: '',
            initialCwd: '',
            fixedDimensions: { cols: undefined, rows: undefined },
            title: '',
            shellType: undefined,
            hasChildProcesses: true,
            resolvedShellLaunchConfig: {},
            overrideDimensions: undefined,
            failedShellIntegrationActivation: false,
            usedShellIntegrationInjection: undefined
        };
        this._lastDimensions = { cols: -1, rows: -1 };
        this._inReplay = false;
        this._onProcessData = this._register(new Emitter());
        this.onProcessData = this._onProcessData.event;
        this._onProcessReplayComplete = this._register(new Emitter());
        this.onProcessReplayComplete = this._onProcessReplayComplete.event;
        this._onProcessReady = this._register(new Emitter());
        this.onProcessReady = this._onProcessReady.event;
        this._onDidChangeProperty = this._register(new Emitter());
        this.onDidChangeProperty = this._onDidChangeProperty.event;
        this._onProcessExit = this._register(new Emitter());
        this.onProcessExit = this._onProcessExit.event;
        this._onRestoreCommands = this._register(new Emitter());
        this.onRestoreCommands = this._onRestoreCommands.event;
    }
    async getInitialCwd() {
        return this._properties.initialCwd;
    }
    async getCwd() {
        return this._properties.cwd || this._properties.initialCwd;
    }
    handleData(e) {
        this._onProcessData.fire(e);
    }
    handleExit(e) {
        this._onProcessExit.fire(e);
    }
    handleReady(e) {
        this._onProcessReady.fire(e);
    }
    handleDidChangeProperty({ type, value }) {
        switch (type) {
            case "cwd":
                this._properties.cwd = value;
                break;
            case "initialCwd":
                this._properties.initialCwd = value;
                break;
            case "resolvedShellLaunchConfig":
                if (value.cwd && typeof value.cwd !== 'string') {
                    value.cwd = URI.revive(value.cwd);
                }
        }
        this._onDidChangeProperty.fire({ type, value });
    }
    async handleReplay(e) {
        mark(`code/terminal/willHandleReplay/${this.id}`);
        try {
            this._inReplay = true;
            for (const innerEvent of e.events) {
                if (innerEvent.cols !== 0 || innerEvent.rows !== 0) {
                    this._onDidChangeProperty.fire({ type: "overrideDimensions", value: { cols: innerEvent.cols, rows: innerEvent.rows, forceExactSize: true } });
                }
                const e = { data: innerEvent.data, trackCommit: true };
                this._onProcessData.fire(e);
                await e.writePromise;
            }
        }
        finally {
            this._inReplay = false;
        }
        if (e.commands) {
            this._onRestoreCommands.fire(e.commands);
        }
        this._onDidChangeProperty.fire({ type: "overrideDimensions", value: undefined });
        mark(`code/terminal/didHandleReplay/${this.id}`);
        this._onProcessReplayComplete.fire();
    }
}
