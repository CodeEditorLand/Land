export declare const enum Constants {
    START_CH_CODE = 32,// Space
    END_CH_CODE = 126,// Tilde (~)
    UNKNOWN_CODE = 65533,// UTF placeholder code
    CHAR_COUNT = 96,
    SAMPLED_CHAR_HEIGHT = 16,
    SAMPLED_CHAR_WIDTH = 10,
    BASE_CHAR_HEIGHT = 2,
    BASE_CHAR_WIDTH = 1,
    RGBA_CHANNELS_CNT = 4,
    RGBA_SAMPLED_ROW_WIDTH = 3840
}
export declare const allCharCodes: ReadonlyArray<number>;
export declare const getCharIndex: (chCode: number, fontScale: number) => number;
