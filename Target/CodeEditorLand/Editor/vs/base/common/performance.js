function _definePolyfillMarks(timeOrigin) {
    const _data = [];
    if (typeof timeOrigin === 'number') {
        _data.push('code/timeOrigin', timeOrigin);
    }
    function mark(name) {
        _data.push(name, Date.now());
    }
    function getMarks() {
        const result = [];
        for (let i = 0; i < _data.length; i += 2) {
            result.push({
                name: _data[i],
                startTime: _data[i + 1],
            });
        }
        return result;
    }
    return { mark, getMarks };
}
function _define() {
    if (typeof performance === 'object' && typeof performance.mark === 'function' && !performance.nodeTiming) {
        if (typeof performance.timeOrigin !== 'number' && !performance.timing) {
            return _definePolyfillMarks();
        }
        else {
            return {
                mark(name) {
                    performance.mark(name);
                },
                getMarks() {
                    let timeOrigin = performance.timeOrigin;
                    if (typeof timeOrigin !== 'number') {
                        timeOrigin = performance.timing.navigationStart || performance.timing.redirectStart || performance.timing.fetchStart;
                    }
                    const result = [{ name: 'code/timeOrigin', startTime: Math.round(timeOrigin) }];
                    for (const entry of performance.getEntriesByType('mark')) {
                        result.push({
                            name: entry.name,
                            startTime: Math.round(timeOrigin + entry.startTime)
                        });
                    }
                    return result;
                }
            };
        }
    }
    else if (typeof process === 'object') {
        const timeOrigin = performance?.timeOrigin;
        return _definePolyfillMarks(timeOrigin);
    }
    else {
        console.trace('perf-util loaded in UNKNOWN environment');
        return _definePolyfillMarks();
    }
}
function _factory(sharedObj) {
    if (!sharedObj.MonacoPerformanceMarks) {
        sharedObj.MonacoPerformanceMarks = _define();
    }
    return sharedObj.MonacoPerformanceMarks;
}
const perf = _factory(globalThis);
export const mark = perf.mark;
export const getMarks = perf.getMarks;
