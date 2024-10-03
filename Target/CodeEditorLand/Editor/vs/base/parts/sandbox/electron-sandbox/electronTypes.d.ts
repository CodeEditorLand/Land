type Event<Params extends object = {}> = {
    preventDefault: () => void;
    readonly defaultPrevented: boolean;
} & Params;
export interface IpcRendererEvent extends Event {
    sender: IpcRenderer;
}
export interface IpcRenderer {
    invoke(channel: string, ...args: any[]): Promise<any>;
    on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): this;
    once(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): this;
    removeListener(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): this;
    send(channel: string, ...args: any[]): void;
}
export interface WebFrame {
    setZoomLevel(level: number): void;
}
export interface ProcessMemoryInfo {
    private: number;
    residentSet: number;
    shared: number;
}
export interface AuthInfo {
    isProxy: boolean;
    scheme: string;
    host: string;
    port: number;
    realm: string;
}
export interface WebUtils {
    getPathForFile(file: File): string;
}
export {};
