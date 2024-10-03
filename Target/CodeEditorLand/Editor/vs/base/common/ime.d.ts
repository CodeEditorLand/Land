export declare class IMEImpl {
    private readonly _onDidChange;
    readonly onDidChange: import("./event.js").Event<void>;
    private _enabled;
    get enabled(): boolean;
    enable(): void;
    disable(): void;
}
export declare const IME: IMEImpl;
