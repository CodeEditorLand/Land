import { IConfigurationPropertySchema } from '../../../../platform/configuration/common/configurationRegistry.js';
export declare function createValidator(prop: IConfigurationPropertySchema): (value: any) => (string | null);
/**
 * Returns an error string if the value is invalid and can't be displayed in the settings UI for the given type.
 */
export declare function getInvalidTypeError(value: any, type: undefined | string | string[]): string | undefined;
