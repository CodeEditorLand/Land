import { onUnexpectedError } from '../common/errors.js';
export function createTrustedTypesPolicy(policyName, policyOptions) {
    const monacoEnvironment = globalThis.MonacoEnvironment;
    if (monacoEnvironment?.createTrustedTypesPolicy) {
        try {
            return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
        }
        catch (err) {
            onUnexpectedError(err);
            return undefined;
        }
    }
    try {
        return globalThis.trustedTypes?.createPolicy(policyName, policyOptions);
    }
    catch (err) {
        onUnexpectedError(err);
        return undefined;
    }
}
