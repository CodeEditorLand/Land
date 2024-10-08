import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
/**
 * Trust Context Keys
 */
export declare const WorkspaceTrustContext: {
    IsEnabled: RawContextKey<boolean>;
    IsTrusted: RawContextKey<boolean>;
};
export declare const MANAGE_TRUST_COMMAND_ID = "workbench.trust.manage";
