import { LegacyLinesDiffComputer } from './legacyLinesDiffComputer.js';
import { DefaultLinesDiffComputer } from './defaultLinesDiffComputer/defaultLinesDiffComputer.js';
export declare const linesDiffComputers: {
    getLegacy: () => LegacyLinesDiffComputer;
    getDefault: () => DefaultLinesDiffComputer;
};
