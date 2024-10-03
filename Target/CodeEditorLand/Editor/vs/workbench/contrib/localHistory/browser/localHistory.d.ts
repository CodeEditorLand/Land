interface ILocalHistoryDateFormatter {
    format: (timestamp: number) => string;
}
export declare function getLocalHistoryDateFormatter(): ILocalHistoryDateFormatter;
export declare const LOCAL_HISTORY_MENU_CONTEXT_VALUE = "localHistory:item";
export declare const LOCAL_HISTORY_MENU_CONTEXT_KEY: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
export declare const LOCAL_HISTORY_ICON_ENTRY: import("../../../../base/common/themables.js").ThemeIcon;
export declare const LOCAL_HISTORY_ICON_RESTORE: import("../../../../base/common/themables.js").ThemeIcon;
export {};
