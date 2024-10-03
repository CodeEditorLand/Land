export function VSCodeSequence(osc, data) {
    return oscSequence(633, osc, data);
}
export function ITermSequence(osc, data) {
    return oscSequence(1337, osc, data);
}
function oscSequence(ps, pt, data) {
    let result = `\x1b]${ps};${pt}`;
    if (data) {
        result += `;${data}`;
    }
    result += `\x07`;
    return result;
}
