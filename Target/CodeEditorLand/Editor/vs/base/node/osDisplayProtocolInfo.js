import { constants as FSConstants, promises as FSPromises } from 'fs';
import { join } from '../common/path.js';
import { env } from '../common/process.js';
const XDG_SESSION_TYPE = 'XDG_SESSION_TYPE';
const WAYLAND_DISPLAY = 'WAYLAND_DISPLAY';
const XDG_RUNTIME_DIR = 'XDG_RUNTIME_DIR';
export async function getDisplayProtocol(errorLogger) {
    const xdgSessionType = env[XDG_SESSION_TYPE];
    if (xdgSessionType) {
        return xdgSessionType === "wayland" || xdgSessionType === "x11" ? xdgSessionType : "unknown";
    }
    else {
        const waylandDisplay = env[WAYLAND_DISPLAY];
        if (!waylandDisplay) {
            return "x11";
        }
        else {
            const xdgRuntimeDir = env[XDG_RUNTIME_DIR];
            if (!xdgRuntimeDir) {
                return "unknown";
            }
            else {
                const waylandServerPipe = join(xdgRuntimeDir, 'wayland-0');
                try {
                    await FSPromises.access(waylandServerPipe, FSConstants.R_OK);
                    return "wayland";
                }
                catch (err) {
                    errorLogger(err);
                    return "unknown";
                }
            }
        }
    }
}
export function getCodeDisplayProtocol(displayProtocol, ozonePlatform) {
    if (!ozonePlatform) {
        return displayProtocol === "wayland" ? "xwayland" : "x11";
    }
    else {
        switch (ozonePlatform) {
            case 'auto':
                return displayProtocol;
            case 'x11':
                return displayProtocol === "wayland" ? "xwayland" : "x11";
            case 'wayland':
                return "wayland";
            default:
                return "unknown";
        }
    }
}
