import { networkInterfaces } from 'os';
import { TernarySearchTree } from '../common/ternarySearchTree.js';
import * as uuid from '../common/uuid.js';
import { getMac } from './macAddress.js';
import { isWindows } from '../common/platform.js';
export const virtualMachineHint = new class {
    _isVirtualMachineMacAddress(mac) {
        if (!this._virtualMachineOUIs) {
            this._virtualMachineOUIs = TernarySearchTree.forStrings();
            this._virtualMachineOUIs.set('00-50-56', true);
            this._virtualMachineOUIs.set('00-0C-29', true);
            this._virtualMachineOUIs.set('00-05-69', true);
            this._virtualMachineOUIs.set('00-03-FF', true);
            this._virtualMachineOUIs.set('00-1C-42', true);
            this._virtualMachineOUIs.set('00-16-3E', true);
            this._virtualMachineOUIs.set('08-00-27', true);
            this._virtualMachineOUIs.set('00:50:56', true);
            this._virtualMachineOUIs.set('00:0C:29', true);
            this._virtualMachineOUIs.set('00:05:69', true);
            this._virtualMachineOUIs.set('00:03:FF', true);
            this._virtualMachineOUIs.set('00:1C:42', true);
            this._virtualMachineOUIs.set('00:16:3E', true);
            this._virtualMachineOUIs.set('08:00:27', true);
        }
        return !!this._virtualMachineOUIs.findSubstr(mac);
    }
    value() {
        if (this._value === undefined) {
            let vmOui = 0;
            let interfaceCount = 0;
            const interfaces = networkInterfaces();
            for (const name in interfaces) {
                const networkInterface = interfaces[name];
                if (networkInterface) {
                    for (const { mac, internal } of networkInterface) {
                        if (!internal) {
                            interfaceCount += 1;
                            if (this._isVirtualMachineMacAddress(mac.toUpperCase())) {
                                vmOui += 1;
                            }
                        }
                    }
                }
            }
            this._value = interfaceCount > 0
                ? vmOui / interfaceCount
                : 0;
        }
        return this._value;
    }
};
let machineId;
export async function getMachineId(errorLogger) {
    if (!machineId) {
        machineId = (async () => {
            const id = await getMacMachineId(errorLogger);
            return id || uuid.generateUuid();
        })();
    }
    return machineId;
}
async function getMacMachineId(errorLogger) {
    try {
        const crypto = await import('crypto');
        const macAddress = getMac();
        return crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
    }
    catch (err) {
        errorLogger(err);
        return undefined;
    }
}
const SQM_KEY = 'Software\\Microsoft\\SQMClient';
export async function getSqmMachineId(errorLogger) {
    if (isWindows) {
        const Registry = await import('@vscode/windows-registry');
        try {
            return Registry.GetStringRegKey('HKEY_LOCAL_MACHINE', SQM_KEY, 'MachineId') || '';
        }
        catch (err) {
            errorLogger(err);
            return '';
        }
    }
    return '';
}
export async function getdevDeviceId(errorLogger) {
    try {
        const deviceIdPackage = await import('@vscode/deviceid');
        const id = await deviceIdPackage.getDeviceId();
        return id;
    }
    catch (err) {
        errorLogger(err);
        return '';
    }
}
