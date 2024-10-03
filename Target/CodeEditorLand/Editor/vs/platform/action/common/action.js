export function isLocalizedString(thing) {
    return thing
        && typeof thing === 'object'
        && typeof thing.original === 'string'
        && typeof thing.value === 'string';
}
export function isICommandActionToggleInfo(thing) {
    return thing ? thing.condition !== undefined : false;
}
