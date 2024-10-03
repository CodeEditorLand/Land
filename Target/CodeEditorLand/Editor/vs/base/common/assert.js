import { BugIndicatingError, onUnexpectedError } from './errors.js';
export function ok(value, message) {
    if (!value) {
        throw new Error(message ? `Assertion failed (${message})` : 'Assertion Failed');
    }
}
export function assertNever(value, message = 'Unreachable') {
    throw new Error(message);
}
export function assert(condition, message = 'unexpected state') {
    if (!condition) {
        throw new BugIndicatingError(`Assertion Failed: ${message}`);
    }
}
export function softAssert(condition) {
    if (!condition) {
        onUnexpectedError(new BugIndicatingError('Soft Assertion Failed'));
    }
}
export function assertFn(condition) {
    if (!condition()) {
        debugger;
        condition();
        onUnexpectedError(new BugIndicatingError('Assertion Failed'));
    }
}
export function checkAdjacentItems(items, predicate) {
    let i = 0;
    while (i < items.length - 1) {
        const a = items[i];
        const b = items[i + 1];
        if (!predicate(a, b)) {
            return false;
        }
        i++;
    }
    return true;
}
