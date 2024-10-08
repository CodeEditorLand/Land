import { ICommonProperties } from './telemetry.js';
export declare function resolveCommonProperties(release: string, hostname: string, arch: string, commit: string | undefined, version: string | undefined, machineId: string | undefined, sqmId: string | undefined, devDeviceId: string | undefined, isInternalTelemetry: boolean, product?: string): ICommonProperties;
export declare function verifyMicrosoftInternalDomain(domainList: readonly string[]): boolean;
