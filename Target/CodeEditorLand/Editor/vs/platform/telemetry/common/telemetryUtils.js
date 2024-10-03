import { cloneAndChange, safeStringify } from '../../../base/common/objects.js';
import { isObject } from '../../../base/common/types.js';
import { getRemoteName } from '../../remote/common/remoteHosts.js';
import { verifyMicrosoftInternalDomain } from './commonProperties.js';
import { TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SETTING_ID } from './telemetry.js';
export class TelemetryTrustedValue {
    constructor(value) {
        this.value = value;
        this.isTrustedTelemetryValue = true;
    }
}
export class NullTelemetryServiceShape {
    constructor() {
        this.telemetryLevel = 0;
        this.sessionId = 'someValue.sessionId';
        this.machineId = 'someValue.machineId';
        this.sqmId = 'someValue.sqmId';
        this.devDeviceId = 'someValue.devDeviceId';
        this.firstSessionDate = 'someValue.firstSessionDate';
        this.sendErrorTelemetry = false;
    }
    publicLog() { }
    publicLog2() { }
    publicLogError() { }
    publicLogError2() { }
    setExperimentProperty() { }
}
export const NullTelemetryService = new NullTelemetryServiceShape();
export class NullEndpointTelemetryService {
    async publicLog(_endpoint, _eventName, _data) {
    }
    async publicLogError(_endpoint, _errorEventName, _data) {
    }
}
export const telemetryLogId = 'telemetry';
export const extensionTelemetryLogChannelId = 'extensionTelemetryLog';
export const NullAppender = { log: () => null, flush: () => Promise.resolve(undefined) };
export function supportsTelemetry(productService, environmentService) {
    if (!environmentService.isBuilt && !environmentService.disableTelemetry) {
        return true;
    }
    return !(environmentService.disableTelemetry || !productService.enableTelemetry);
}
export function isLoggingOnly(productService, environmentService) {
    if (environmentService.extensionTestsLocationURI) {
        return true;
    }
    if (environmentService.isBuilt) {
        return false;
    }
    if (environmentService.disableTelemetry) {
        return false;
    }
    if (productService.enableTelemetry && productService.aiConfig?.ariaKey) {
        return false;
    }
    return true;
}
export function getTelemetryLevel(configurationService) {
    const newConfig = configurationService.getValue(TELEMETRY_SETTING_ID);
    const crashReporterConfig = configurationService.getValue(TELEMETRY_CRASH_REPORTER_SETTING_ID);
    const oldConfig = configurationService.getValue(TELEMETRY_OLD_SETTING_ID);
    if (oldConfig === false || crashReporterConfig === false) {
        return 0;
    }
    switch (newConfig ?? "all") {
        case "all":
            return 3;
        case "error":
            return 2;
        case "crash":
            return 1;
        case "off":
            return 0;
    }
}
export function validateTelemetryData(data) {
    const properties = {};
    const measurements = {};
    const flat = {};
    flatten(data, flat);
    for (let prop in flat) {
        prop = prop.length > 150 ? prop.substr(prop.length - 149) : prop;
        const value = flat[prop];
        if (typeof value === 'number') {
            measurements[prop] = value;
        }
        else if (typeof value === 'boolean') {
            measurements[prop] = value ? 1 : 0;
        }
        else if (typeof value === 'string') {
            if (value.length > 8192) {
                console.warn(`Telemetry property: ${prop} has been trimmed to 8192, the original length is ${value.length}`);
            }
            properties[prop] = value.substring(0, 8191);
        }
        else if (typeof value !== 'undefined' && value !== null) {
            properties[prop] = value;
        }
    }
    return {
        properties,
        measurements
    };
}
const telemetryAllowedAuthorities = new Set(['ssh-remote', 'dev-container', 'attached-container', 'wsl', 'tunnel', 'codespaces', 'amlext']);
export function cleanRemoteAuthority(remoteAuthority) {
    if (!remoteAuthority) {
        return 'none';
    }
    const remoteName = getRemoteName(remoteAuthority);
    return telemetryAllowedAuthorities.has(remoteName) ? remoteName : 'other';
}
function flatten(obj, result, order = 0, prefix) {
    if (!obj) {
        return;
    }
    for (const item of Object.getOwnPropertyNames(obj)) {
        const value = obj[item];
        const index = prefix ? prefix + item : item;
        if (Array.isArray(value)) {
            result[index] = safeStringify(value);
        }
        else if (value instanceof Date) {
            result[index] = value.toISOString();
        }
        else if (isObject(value)) {
            if (order < 2) {
                flatten(value, result, order + 1, index + '.');
            }
            else {
                result[index] = safeStringify(value);
            }
        }
        else {
            result[index] = value;
        }
    }
}
export function isInternalTelemetry(productService, configService) {
    const msftInternalDomains = productService.msftInternalDomains || [];
    const internalTesting = configService.getValue('telemetry.internalTesting');
    return verifyMicrosoftInternalDomain(msftInternalDomains) || internalTesting;
}
export function getPiiPathsFromEnvironment(paths) {
    return [paths.appRoot, paths.extensionsPath, paths.userHome.fsPath, paths.tmpDir.fsPath, paths.userDataPath];
}
function anonymizeFilePaths(stack, cleanupPatterns) {
    if (!stack || (!stack.includes('/') && !stack.includes('\\'))) {
        return stack;
    }
    let updatedStack = stack;
    const cleanUpIndexes = [];
    for (const regexp of cleanupPatterns) {
        while (true) {
            const result = regexp.exec(stack);
            if (!result) {
                break;
            }
            cleanUpIndexes.push([result.index, regexp.lastIndex]);
        }
    }
    const nodeModulesRegex = /^[\\\/]?(node_modules|node_modules\.asar)[\\\/]/;
    const fileRegex = /(file:\/\/)?([a-zA-Z]:(\\\\|\\|\/)|(\\\\|\\|\/))?([\w-\._]+(\\\\|\\|\/))+[\w-\._]*/g;
    let lastIndex = 0;
    updatedStack = '';
    while (true) {
        const result = fileRegex.exec(stack);
        if (!result) {
            break;
        }
        const overlappingRange = cleanUpIndexes.some(([start, end]) => result.index < end && start < fileRegex.lastIndex);
        if (!nodeModulesRegex.test(result[0]) && !overlappingRange) {
            updatedStack += stack.substring(lastIndex, result.index) + '<REDACTED: user-file-path>';
            lastIndex = fileRegex.lastIndex;
        }
    }
    if (lastIndex < stack.length) {
        updatedStack += stack.substr(lastIndex);
    }
    return updatedStack;
}
function removePropertiesWithPossibleUserInfo(property) {
    if (!property) {
        return property;
    }
    const userDataRegexes = [
        { label: 'Google API Key', regex: /AIza[A-Za-z0-9_\\\-]{35}/ },
        { label: 'Slack Token', regex: /xox[pbar]\-[A-Za-z0-9]/ },
        { label: 'GitHub Token', regex: /(gh[psuro]_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})/ },
        { label: 'Generic Secret', regex: /(key|token|sig|secret|signature|password|passwd|pwd|android:value)[^a-zA-Z0-9]/i },
        { label: 'CLI Credentials', regex: /((login|psexec|(certutil|psexec)\.exe).{1,50}(\s-u(ser(name)?)?\s+.{3,100})?\s-(admin|user|vm|root)?p(ass(word)?)?\s+["']?[^$\-\/\s]|(^|[\s\r\n\\])net(\.exe)?.{1,5}(user\s+|share\s+\/user:| user -? secrets ? set) \s + [^ $\s \/])/ },
        { label: 'Email', regex: /@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/ }
    ];
    for (const secretRegex of userDataRegexes) {
        if (secretRegex.regex.test(property)) {
            return `<REDACTED: ${secretRegex.label}>`;
        }
    }
    return property;
}
export function cleanData(data, cleanUpPatterns) {
    return cloneAndChange(data, value => {
        if (value instanceof TelemetryTrustedValue || Object.hasOwnProperty.call(value, 'isTrustedTelemetryValue')) {
            return value.value;
        }
        if (typeof value === 'string') {
            let updatedProperty = value.replaceAll('%20', ' ');
            updatedProperty = anonymizeFilePaths(updatedProperty, cleanUpPatterns);
            for (const regexp of cleanUpPatterns) {
                updatedProperty = updatedProperty.replace(regexp, '');
            }
            updatedProperty = removePropertiesWithPossibleUserInfo(updatedProperty);
            return updatedProperty;
        }
        return undefined;
    });
}
