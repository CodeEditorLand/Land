import './countBadge.css';
export interface ICountBadgeOptions {
    readonly count?: number;
    readonly countFormat?: string;
    readonly titleFormat?: string;
}
export interface ICountBadgeStyles {
    readonly badgeBackground: string | undefined;
    readonly badgeForeground: string | undefined;
    readonly badgeBorder: string | undefined;
}
export declare const unthemedCountStyles: ICountBadgeStyles;
export declare class CountBadge {
    private readonly options;
    private readonly styles;
    private element;
    private count;
    private countFormat;
    private titleFormat;
    constructor(container: HTMLElement, options: ICountBadgeOptions, styles: ICountBadgeStyles);
    setCount(count: number): void;
    setCountFormat(countFormat: string): void;
    setTitleFormat(titleFormat: string): void;
    private render;
}
