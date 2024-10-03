export function toUint8(v) {
    if (v < 0) {
        return 0;
    }
    if (v > 255) {
        return 255;
    }
    return v | 0;
}
export function toUint32(v) {
    if (v < 0) {
        return 0;
    }
    if (v > 4294967295) {
        return 4294967295;
    }
    return v | 0;
}
