import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IPreferencesService } from './preferences.js';
import { Settings2EditorModel } from './preferencesModels.js';
export declare class SettingsEditor2Input extends EditorInput {
    static readonly ID: string;
    private readonly _settingsModel;
    readonly resource: URI;
    constructor(_preferencesService: IPreferencesService);
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    get typeId(): string;
    getName(): string;
    getIcon(): ThemeIcon;
    resolve(): Promise<Settings2EditorModel>;
    dispose(): void;
}
