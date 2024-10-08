import { ColorIdentifier, ColorDefaults } from '../../../../platform/theme/common/colorRegistry.js';
/**
 * The color identifiers for the terminal's ansi colors. The index in the array corresponds to the index
 * of the color in the terminal color table.
 */
export declare const ansiColorIdentifiers: ColorIdentifier[];
export declare const TERMINAL_BACKGROUND_COLOR: string;
export declare const TERMINAL_FOREGROUND_COLOR: string;
export declare const TERMINAL_CURSOR_FOREGROUND_COLOR: string;
export declare const TERMINAL_CURSOR_BACKGROUND_COLOR: string;
export declare const TERMINAL_SELECTION_BACKGROUND_COLOR: string;
export declare const TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR: string;
export declare const TERMINAL_SELECTION_FOREGROUND_COLOR: string;
export declare const TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR: string;
export declare const TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR: string;
export declare const TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR: string;
export declare const TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR: string;
export declare const TERMINAL_BORDER_COLOR: string;
export declare const TERMINAL_OVERVIEW_RULER_BORDER_COLOR: string;
export declare const TERMINAL_FIND_MATCH_BACKGROUND_COLOR: string;
export declare const TERMINAL_HOVER_HIGHLIGHT_BACKGROUND_COLOR: string;
export declare const TERMINAL_FIND_MATCH_BORDER_COLOR: string;
export declare const TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR: string;
export declare const TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR: string;
export declare const TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR: string;
export declare const TERMINAL_DRAG_AND_DROP_BACKGROUND: string;
export declare const TERMINAL_TAB_ACTIVE_BORDER: string;
export declare const TERMINAL_INITIAL_HINT_FOREGROUND: string;
export declare const ansiColorMap: {
    [key: string]: {
        index: number;
        defaults: ColorDefaults;
    };
};
export declare function registerColors(): void;
