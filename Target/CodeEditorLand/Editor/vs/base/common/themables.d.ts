export type ColorIdentifier = string;
export type IconIdentifier = string;
export interface ThemeColor {
    id: string;
}
export declare namespace ThemeColor {
    function isThemeColor(obj: any): obj is ThemeColor;
}
export declare function themeColorFromId(id: ColorIdentifier): {
    id: string;
};
export interface ThemeIcon {
    readonly id: string;
    readonly color?: ThemeColor;
}
export declare namespace ThemeIcon {
    const iconNameSegment = "[A-Za-z0-9]+";
    const iconNameExpression = "[A-Za-z0-9-]+";
    const iconModifierExpression = "~[A-Za-z]+";
    const iconNameCharacter = "[A-Za-z0-9~-]";
    function asClassNameArray(icon: ThemeIcon): string[];
    function asClassName(icon: ThemeIcon): string;
    function asCSSSelector(icon: ThemeIcon): string;
    function isThemeIcon(obj: any): obj is ThemeIcon;
    function fromString(str: string): ThemeIcon | undefined;
    function fromId(id: string): ThemeIcon;
    function modify(icon: ThemeIcon, modifier: 'disabled' | 'spin' | undefined): ThemeIcon;
    function getModifier(icon: ThemeIcon): string | undefined;
    function isEqual(ti1: ThemeIcon, ti2: ThemeIcon): boolean;
}
