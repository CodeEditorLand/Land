import electron from 'electron';
import { Event } from '../../../common/event.js';
type ipcMainListener = (event: electron.IpcMainEvent, ...args: any[]) => void;
declare class ValidatedIpcMain implements Event.NodeEventEmitter {
    private readonly mapListenerToWrapper;
    on(channel: string, listener: ipcMainListener): this;
    once(channel: string, listener: ipcMainListener): this;
    handle(channel: string, listener: (event: electron.IpcMainInvokeEvent, ...args: any[]) => Promise<unknown>): this;
    removeHandler(channel: string): this;
    removeListener(channel: string, listener: ipcMainListener): this;
    private validateEvent;
}
export declare const validatedIpcMain: ValidatedIpcMain;
export {};
