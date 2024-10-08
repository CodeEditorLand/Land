declare const enum DisplayProtocolType {
    Wayland = "wayland",
    XWayland = "xwayland",
    X11 = "x11",
    Unknown = "unknown"
}
export declare function getDisplayProtocol(errorLogger: (error: any) => void): Promise<DisplayProtocolType>;
export declare function getCodeDisplayProtocol(displayProtocol: DisplayProtocolType, ozonePlatform: string | undefined): DisplayProtocolType;
export {};
