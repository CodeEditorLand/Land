import { IConfigurationPropertySchema } from '../../../../platform/configuration/common/configurationRegistry.js';
export declare function createValidator(prop: IConfigurationPropertySchema): (value: any) => (string | null);
export declare function getInvalidTypeError(value: any, type: undefined | string | string[]): string | undefined;
