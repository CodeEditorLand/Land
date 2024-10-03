export const allCharCodes = (() => {
    const v = [];
    for (let i = 32; i <= 126; i++) {
        v.push(i);
    }
    v.push(65533);
    return v;
})();
export const getCharIndex = (chCode, fontScale) => {
    chCode -= 32;
    if (chCode < 0 || chCode > 96) {
        if (fontScale <= 2) {
            return (chCode + 96) % 96;
        }
        return 96 - 1;
    }
    return chCode;
};
