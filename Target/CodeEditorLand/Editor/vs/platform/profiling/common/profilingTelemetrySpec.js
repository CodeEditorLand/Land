import { errorHandler } from '../../../base/common/errors.js';
export function reportSample(data, telemetryService, logService, sendAsErrorTelemtry) {
    const { sample, perfBaseline, source } = data;
    telemetryService.publicLog2(`unresponsive.sample`, {
        perfBaseline,
        selfTime: sample.selfTime,
        totalTime: sample.totalTime,
        percentage: sample.percentage,
        functionName: sample.location,
        callers: sample.caller.map(c => c.location).join('<'),
        callersAnnotated: sample.caller.map(c => `${c.percentage}|${c.location}`).join('<'),
        source
    });
    const fakeError = new PerformanceError(data);
    if (sendAsErrorTelemtry) {
        errorHandler.onUnexpectedError(fakeError);
    }
    else {
        logService.error(fakeError);
    }
}
class PerformanceError extends Error {
    constructor(data) {
        super(`PerfSampleError: by ${data.source} in ${data.sample.location}`);
        this.name = 'PerfSampleError';
        this.selfTime = data.sample.selfTime;
        const trace = [data.sample.absLocation, ...data.sample.caller.map(c => c.absLocation)];
        this.stack = `\n\t at ${trace.join('\n\t at ')}`;
    }
}
