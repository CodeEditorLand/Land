import { NativeParsedArgs } from '../common/argv.js';
declare const helpCategories: {
    o: string;
    e: string;
    t: string;
};
export interface Option<OptionType> {
    type: OptionType;
    alias?: string;
    deprecates?: string[];
    args?: string | string[];
    description?: string;
    deprecationMessage?: string;
    allowEmptyValue?: boolean;
    cat?: keyof typeof helpCategories;
    global?: boolean;
}
export interface Subcommand<T> {
    type: 'subcommand';
    description?: string;
    deprecationMessage?: string;
    options: OptionDescriptions<Required<T>>;
}
export type OptionDescriptions<T> = {
    [P in keyof T]: T[P] extends boolean | undefined ? Option<'boolean'> : T[P] extends string | undefined ? Option<'string'> : T[P] extends string[] | undefined ? Option<'string[]'> : Subcommand<T[P]>;
};
export declare const NATIVE_CLI_COMMANDS: readonly ["tunnel", "serve-web"];
export declare const OPTIONS: OptionDescriptions<Required<NativeParsedArgs>>;
export interface ErrorReporter {
    onUnknownOption(id: string): void;
    onMultipleValues(id: string, usedValue: string): void;
    onEmptyValue(id: string): void;
    onDeprecatedOption(deprecatedId: string, message: string): void;
    getSubcommandReporter?(command: string): ErrorReporter;
}
export declare function parseArgs<T>(args: string[], options: OptionDescriptions<T>, errorReporter?: ErrorReporter): T;
export declare function formatOptions(options: OptionDescriptions<any>, columns: number): string[];
export declare function buildHelpMessage(productName: string, executableName: string, version: string, options: OptionDescriptions<any>, capabilities?: {
    noPipe?: boolean;
    noInputFiles: boolean;
}): string;
export declare function buildVersionMessage(version: string | undefined, commit: string | undefined): string;
export {};
