import electron from 'electron';
import { Event } from '../../../common/event.js';
type ipcMainListener = (event: electron.IpcMainEvent, ...args: any[]) => void;
declare class ValidatedIpcMain implements Event.NodeEventEmitter {
    private readonly mapListenerToWrapper;
    /**
     * Listens to `channel`, when a new message arrives `listener` would be called with
     * `listener(event, args...)`.
     */
    on(channel: string, listener: ipcMainListener): this;
    /**
     * Adds a one time `listener` function for the event. This `listener` is invoked
     * only the next time a message is sent to `channel`, after which it is removed.
     */
    once(channel: string, listener: ipcMainListener): this;
    /**
     * Adds a handler for an `invoke`able IPC. This handler will be called whenever a
     * renderer calls `ipcRenderer.invoke(channel, ...args)`.
     *
     * If `listener` returns a Promise, the eventual result of the promise will be
     * returned as a reply to the remote caller. Otherwise, the return value of the
     * listener will be used as the value of the reply.
     *
     * The `event` that is passed as the first argument to the handler is the same as
     * that passed to a regular event listener. It includes information about which
     * WebContents is the source of the invoke request.
     *
     * Errors thrown through `handle` in the main process are not transparent as they
     * are serialized and only the `message` property from the original error is
     * provided to the renderer process. Please refer to #24427 for details.
     */
    handle(channel: string, listener: (event: electron.IpcMainInvokeEvent, ...args: any[]) => Promise<unknown>): this;
    /**
     * Removes any handler for `channel`, if present.
     */
    removeHandler(channel: string): this;
    /**
     * Removes the specified `listener` from the listener array for the specified
     * `channel`.
     */
    removeListener(channel: string, listener: ipcMainListener): this;
    private validateEvent;
}
/**
 * A drop-in replacement of `ipcMain` that validates the sender of a message
 * according to https://github.com/electron/electron/blob/main/docs/tutorial/security.md
 *
 * @deprecated direct use of Electron IPC is not encouraged. We have utilities in place
 * to create services on top of IPC, see `ProxyChannel` for more information.
 */
export declare const validatedIpcMain: ValidatedIpcMain;
export {};
