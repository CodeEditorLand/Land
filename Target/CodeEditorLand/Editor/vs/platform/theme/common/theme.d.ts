export declare enum ColorScheme {
    DARK = "dark",
    LIGHT = "light",
    HIGH_CONTRAST_DARK = "hcDark",
    HIGH_CONTRAST_LIGHT = "hcLight"
}
export declare function isHighContrast(scheme: ColorScheme): boolean;
export declare function isDark(scheme: ColorScheme): boolean;
