import { Emitter } from '../../../../base/common/event.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const OUTPUT_MIME = 'text/x-code-output';
export const OUTPUT_MODE_ID = 'Log';
export const LOG_MIME = 'text/x-code-log-output';
export const LOG_MODE_ID = 'log';
export const OUTPUT_VIEW_ID = 'workbench.panel.output';
export const CONTEXT_IN_OUTPUT = new RawContextKey('inOutput', false);
export const CONTEXT_ACTIVE_FILE_OUTPUT = new RawContextKey('activeLogOutput', false);
export const CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE = new RawContextKey('activeLogOutput.levelSettable', false);
export const CONTEXT_ACTIVE_OUTPUT_LEVEL = new RawContextKey('activeLogOutput.level', '');
export const CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT = new RawContextKey('activeLogOutput.levelIsDefault', false);
export const CONTEXT_OUTPUT_SCROLL_LOCK = new RawContextKey(`outputView.scrollLock`, false);
export const IOutputService = createDecorator('outputService');
export var OutputChannelUpdateMode;
(function (OutputChannelUpdateMode) {
    OutputChannelUpdateMode[OutputChannelUpdateMode["Append"] = 1] = "Append";
    OutputChannelUpdateMode[OutputChannelUpdateMode["Replace"] = 2] = "Replace";
    OutputChannelUpdateMode[OutputChannelUpdateMode["Clear"] = 3] = "Clear";
})(OutputChannelUpdateMode || (OutputChannelUpdateMode = {}));
export const Extensions = {
    OutputChannels: 'workbench.contributions.outputChannels'
};
class OutputChannelRegistry {
    constructor() {
        this.channels = new Map();
        this._onDidRegisterChannel = new Emitter();
        this.onDidRegisterChannel = this._onDidRegisterChannel.event;
        this._onDidRemoveChannel = new Emitter();
        this.onDidRemoveChannel = this._onDidRemoveChannel.event;
    }
    registerChannel(descriptor) {
        if (!this.channels.has(descriptor.id)) {
            this.channels.set(descriptor.id, descriptor);
            this._onDidRegisterChannel.fire(descriptor.id);
        }
    }
    getChannels() {
        const result = [];
        this.channels.forEach(value => result.push(value));
        return result;
    }
    getChannel(id) {
        return this.channels.get(id);
    }
    removeChannel(id) {
        this.channels.delete(id);
        this._onDidRemoveChannel.fire(id);
    }
}
Registry.add(Extensions.OutputChannels, new OutputChannelRegistry());
export const ACTIVE_OUTPUT_CHANNEL_CONTEXT = new RawContextKey('activeOutputChannel', '');
