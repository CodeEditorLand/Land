export var inputLatency;
(function (inputLatency) {
    const totalKeydownTime = { total: 0, min: Number.MAX_VALUE, max: 0 };
    const totalInputTime = { ...totalKeydownTime };
    const totalRenderTime = { ...totalKeydownTime };
    const totalInputLatencyTime = { ...totalKeydownTime };
    let measurementsCount = 0;
    const state = {
        keydown: 0,
        input: 0,
        render: 0,
    };
    function onKeyDown() {
        recordIfFinished();
        performance.mark('inputlatency/start');
        performance.mark('keydown/start');
        state.keydown = 1;
        queueMicrotask(markKeyDownEnd);
    }
    inputLatency.onKeyDown = onKeyDown;
    function markKeyDownEnd() {
        if (state.keydown === 1) {
            performance.mark('keydown/end');
            state.keydown = 2;
        }
    }
    function onBeforeInput() {
        performance.mark('input/start');
        state.input = 1;
        scheduleRecordIfFinishedTask();
    }
    inputLatency.onBeforeInput = onBeforeInput;
    function onInput() {
        if (state.input === 0) {
            onBeforeInput();
        }
        queueMicrotask(markInputEnd);
    }
    inputLatency.onInput = onInput;
    function markInputEnd() {
        if (state.input === 1) {
            performance.mark('input/end');
            state.input = 2;
        }
    }
    function onKeyUp() {
        recordIfFinished();
    }
    inputLatency.onKeyUp = onKeyUp;
    function onSelectionChange() {
        recordIfFinished();
    }
    inputLatency.onSelectionChange = onSelectionChange;
    function onRenderStart() {
        if (state.keydown === 2 && state.input === 2 && state.render === 0) {
            performance.mark('render/start');
            state.render = 1;
            queueMicrotask(markRenderEnd);
            scheduleRecordIfFinishedTask();
        }
    }
    inputLatency.onRenderStart = onRenderStart;
    function markRenderEnd() {
        if (state.render === 1) {
            performance.mark('render/end');
            state.render = 2;
        }
    }
    function scheduleRecordIfFinishedTask() {
        setTimeout(recordIfFinished);
    }
    function recordIfFinished() {
        if (state.keydown === 2 && state.input === 2 && state.render === 2) {
            performance.mark('inputlatency/end');
            performance.measure('keydown', 'keydown/start', 'keydown/end');
            performance.measure('input', 'input/start', 'input/end');
            performance.measure('render', 'render/start', 'render/end');
            performance.measure('inputlatency', 'inputlatency/start', 'inputlatency/end');
            addMeasure('keydown', totalKeydownTime);
            addMeasure('input', totalInputTime);
            addMeasure('render', totalRenderTime);
            addMeasure('inputlatency', totalInputLatencyTime);
            measurementsCount++;
            reset();
        }
    }
    function addMeasure(entryName, cumulativeMeasurement) {
        const duration = performance.getEntriesByName(entryName)[0].duration;
        cumulativeMeasurement.total += duration;
        cumulativeMeasurement.min = Math.min(cumulativeMeasurement.min, duration);
        cumulativeMeasurement.max = Math.max(cumulativeMeasurement.max, duration);
    }
    function reset() {
        performance.clearMarks('keydown/start');
        performance.clearMarks('keydown/end');
        performance.clearMarks('input/start');
        performance.clearMarks('input/end');
        performance.clearMarks('render/start');
        performance.clearMarks('render/end');
        performance.clearMarks('inputlatency/start');
        performance.clearMarks('inputlatency/end');
        performance.clearMeasures('keydown');
        performance.clearMeasures('input');
        performance.clearMeasures('render');
        performance.clearMeasures('inputlatency');
        state.keydown = 0;
        state.input = 0;
        state.render = 0;
    }
    function getAndClearMeasurements() {
        if (measurementsCount === 0) {
            return undefined;
        }
        const result = {
            keydown: cumulativeToFinalMeasurement(totalKeydownTime),
            input: cumulativeToFinalMeasurement(totalInputTime),
            render: cumulativeToFinalMeasurement(totalRenderTime),
            total: cumulativeToFinalMeasurement(totalInputLatencyTime),
            sampleCount: measurementsCount
        };
        clearCumulativeMeasurement(totalKeydownTime);
        clearCumulativeMeasurement(totalInputTime);
        clearCumulativeMeasurement(totalRenderTime);
        clearCumulativeMeasurement(totalInputLatencyTime);
        measurementsCount = 0;
        return result;
    }
    inputLatency.getAndClearMeasurements = getAndClearMeasurements;
    function cumulativeToFinalMeasurement(cumulative) {
        return {
            average: cumulative.total / measurementsCount,
            max: cumulative.max,
            min: cumulative.min,
        };
    }
    function clearCumulativeMeasurement(cumulative) {
        cumulative.total = 0;
        cumulative.min = Number.MAX_VALUE;
        cumulative.max = 0;
    }
})(inputLatency || (inputLatency = {}));
