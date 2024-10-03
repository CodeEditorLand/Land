import { networkInterfaces } from 'os';
const invalidMacAddresses = new Set([
    '00:00:00:00:00:00',
    'ff:ff:ff:ff:ff:ff',
    'ac:de:48:00:11:22'
]);
function validateMacAddress(candidate) {
    const tempCandidate = candidate.replace(/\-/g, ':').toLowerCase();
    return !invalidMacAddresses.has(tempCandidate);
}
export function getMac() {
    const ifaces = networkInterfaces();
    for (const name in ifaces) {
        const networkInterface = ifaces[name];
        if (networkInterface) {
            for (const { mac } of networkInterface) {
                if (validateMacAddress(mac)) {
                    return mac;
                }
            }
        }
    }
    throw new Error('Unable to retrieve mac address (unexpected format)');
}
