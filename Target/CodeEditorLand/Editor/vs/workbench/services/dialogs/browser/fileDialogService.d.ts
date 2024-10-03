import { IPickAndOpenOptions, ISaveDialogOptions, IOpenDialogOptions, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { URI } from '../../../../base/common/uri.js';
import { AbstractFileDialogService } from './abstractFileDialogService.js';
export declare class FileDialogService extends AbstractFileDialogService implements IFileDialogService {
    private get fileSystemProvider();
    pickFileFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    protected addFileSchemaIfNeeded(schema: string, isFolder: boolean): string[];
    pickFileAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickWorkspaceAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickFileToSave(defaultUri: URI, availableFileSystems?: string[]): Promise<URI | undefined>;
    private getFilePickerTypes;
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
    showOpenDialog(options: IOpenDialogOptions): Promise<URI[] | undefined>;
    private showUnsupportedBrowserWarning;
    private shouldUseSimplified;
}
