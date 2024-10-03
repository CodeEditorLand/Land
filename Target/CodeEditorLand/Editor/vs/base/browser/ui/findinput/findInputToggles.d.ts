import { IHoverDelegate } from '../hover/hoverDelegate.js';
import { Toggle } from '../toggle/toggle.js';
export interface IFindInputToggleOpts {
    readonly appendTitle: string;
    readonly isChecked: boolean;
    readonly inputActiveOptionBorder: string | undefined;
    readonly inputActiveOptionForeground: string | undefined;
    readonly inputActiveOptionBackground: string | undefined;
    readonly hoverDelegate?: IHoverDelegate;
}
export declare class CaseSensitiveToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}
export declare class WholeWordsToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}
export declare class RegexToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}
