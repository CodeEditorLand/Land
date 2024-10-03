export declare const enum KeyboardSupport {
    Always = 0,
    FullScreen = 1,
    None = 2
}
export declare const BrowserFeatures: {
    clipboard: {
        writeText: true;
        readText: boolean;
    };
    keyboard: KeyboardSupport;
    touch: boolean;
    pointerEvents: boolean;
};
