/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { timeout } from '../../../../base/common/async.js';
export const IRemoteAgentService = createDecorator('remoteAgentService');
export const remoteConnectionLatencyMeasurer = new class {
    constructor() {
        this.maxSampleCount = 5;
        this.sampleDelay = 2000;
        this.initial = [];
        this.maxInitialCount = 3;
        this.average = [];
        this.maxAverageCount = 100;
        this.highLatencyMultiple = 2;
        this.highLatencyMinThreshold = 500;
        this.highLatencyMaxThreshold = 1500;
        this.lastMeasurement = undefined;
    }
    get latency() { return this.lastMeasurement; }
    async measure(remoteAgentService) {
        let currentLatency = Infinity;
        // Measure up to samples count
        for (let i = 0; i < this.maxSampleCount; i++) {
            const rtt = await remoteAgentService.getRoundTripTime();
            if (rtt === undefined) {
                return undefined;
            }
            currentLatency = Math.min(currentLatency, rtt / 2 /* we want just one way, not round trip time */);
            await timeout(this.sampleDelay);
        }
        // Keep track of average latency
        this.average.push(currentLatency);
        if (this.average.length > this.maxAverageCount) {
            this.average.shift();
        }
        // Keep track of initial latency
        let initialLatency = undefined;
        if (this.initial.length < this.maxInitialCount) {
            this.initial.push(currentLatency);
        }
        else {
            initialLatency = this.initial.reduce((sum, value) => sum + value, 0) / this.initial.length;
        }
        // Remember as last measurement
        this.lastMeasurement = {
            initial: initialLatency,
            current: currentLatency,
            average: this.average.reduce((sum, value) => sum + value, 0) / this.average.length,
            high: (() => {
                // based on the initial, average and current latency, try to decide
                // if the connection has high latency
                // Some rules:
                // - we require the initial latency to be computed
                // - we only consider latency above highLatencyMinThreshold as potentially high
                // - we require the current latency to be above the average latency by a factor of highLatencyMultiple
                // - but not if the latency is actually above highLatencyMaxThreshold
                if (typeof initialLatency === 'undefined') {
                    return false;
                }
                if (currentLatency > this.highLatencyMaxThreshold) {
                    return true;
                }
                if (currentLatency > this.highLatencyMinThreshold && currentLatency > initialLatency * this.highLatencyMultiple) {
                    return true;
                }
                return false;
            })()
        };
        return this.lastMeasurement;
    }
};
