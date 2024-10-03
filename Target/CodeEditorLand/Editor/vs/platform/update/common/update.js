import { createDecorator } from '../../instantiation/common/instantiation.js';
export const State = {
    Uninitialized: { type: "uninitialized" },
    Disabled: (reason) => ({ type: "disabled", reason }),
    Idle: (updateType, error) => ({ type: "idle", updateType, error }),
    CheckingForUpdates: (explicit) => ({ type: "checking for updates", explicit }),
    AvailableForDownload: (update) => ({ type: "available for download", update }),
    Downloading: { type: "downloading" },
    Downloaded: (update) => ({ type: "downloaded", update }),
    Updating: (update) => ({ type: "updating", update }),
    Ready: (update) => ({ type: "ready", update }),
};
export const IUpdateService = createDecorator('updateService');
