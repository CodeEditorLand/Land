import { IEditorOptions } from '../../common/config/editorOptions.js';
export interface ISettingsReader {
    (key: string): any;
}
export interface ISettingsWriter {
    (key: string, value: any): void;
}
export declare class EditorSettingMigration {
    readonly key: string;
    readonly migrate: (value: any, read: ISettingsReader, write: ISettingsWriter) => void;
    static items: EditorSettingMigration[];
    constructor(key: string, migrate: (value: any, read: ISettingsReader, write: ISettingsWriter) => void);
    apply(options: any): void;
    private static _read;
    private static _write;
}
/**
 * Compatibility with old options
 */
export declare function migrateOptions(options: IEditorOptions): void;
