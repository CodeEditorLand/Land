var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { AbstractFileDialogService } from './abstractFileDialogService.js';
import { Schemas } from '../../../../base/common/network.js';
import { memoize } from '../../../../base/common/decorators.js';
import { HTMLFileSystemProvider } from '../../../../platform/files/browser/htmlFileSystemProvider.js';
import { localize } from '../../../../nls.js';
import { getMediaOrTextMime } from '../../../../base/common/mime.js';
import { basename } from '../../../../base/common/resources.js';
import { getActiveWindow, triggerDownload, triggerUpload } from '../../../../base/browser/dom.js';
import Severity from '../../../../base/common/severity.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { extractFileListData } from '../../../../platform/dnd/browser/dnd.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { WebFileSystemAccess } from '../../../../platform/files/browser/webFileSystemAccess.js';
import { EmbeddedCodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js';
export class FileDialogService extends AbstractFileDialogService {
    get fileSystemProvider() {
        return this.fileService.getProvider(Schemas.file);
    }
    async pickFileFolderAndOpen(options) {
        const schema = this.getFileSystemSchema(options);
        if (!options.defaultUri) {
            options.defaultUri = await this.defaultFilePath(schema);
        }
        if (this.shouldUseSimplified(schema)) {
            return super.pickFileFolderAndOpenSimplified(schema, options, false);
        }
        throw new Error(localize('pickFolderAndOpen', "Can't open folders, try adding a folder to the workspace instead."));
    }
    addFileSchemaIfNeeded(schema, isFolder) {
        return (schema === Schemas.untitled) ? [Schemas.file]
            : (((schema !== Schemas.file) && (!isFolder || (schema !== Schemas.vscodeRemote))) ? [schema, Schemas.file] : [schema]);
    }
    async pickFileAndOpen(options) {
        const schema = this.getFileSystemSchema(options);
        if (!options.defaultUri) {
            options.defaultUri = await this.defaultFilePath(schema);
        }
        if (this.shouldUseSimplified(schema)) {
            return super.pickFileAndOpenSimplified(schema, options, false);
        }
        const activeWindow = getActiveWindow();
        if (!WebFileSystemAccess.supported(activeWindow)) {
            return this.showUnsupportedBrowserWarning('open');
        }
        let fileHandle = undefined;
        try {
            ([fileHandle] = await activeWindow.showOpenFilePicker({ multiple: false }));
        }
        catch (error) {
            return;
        }
        if (!WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
            return;
        }
        const uri = await this.fileSystemProvider.registerFileHandle(fileHandle);
        this.addFileToRecentlyOpened(uri);
        await this.openerService.open(uri, { fromUserGesture: true, editorOptions: { pinned: true } });
    }
    async pickFolderAndOpen(options) {
        const schema = this.getFileSystemSchema(options);
        if (!options.defaultUri) {
            options.defaultUri = await this.defaultFolderPath(schema);
        }
        if (this.shouldUseSimplified(schema)) {
            return super.pickFolderAndOpenSimplified(schema, options);
        }
        throw new Error(localize('pickFolderAndOpen', "Can't open folders, try adding a folder to the workspace instead."));
    }
    async pickWorkspaceAndOpen(options) {
        options.availableFileSystems = this.getWorkspaceAvailableFileSystems(options);
        const schema = this.getFileSystemSchema(options);
        if (!options.defaultUri) {
            options.defaultUri = await this.defaultWorkspacePath(schema);
        }
        if (this.shouldUseSimplified(schema)) {
            return super.pickWorkspaceAndOpenSimplified(schema, options);
        }
        throw new Error(localize('pickWorkspaceAndOpen', "Can't open workspaces, try adding a folder to the workspace instead."));
    }
    async pickFileToSave(defaultUri, availableFileSystems) {
        const schema = this.getFileSystemSchema({ defaultUri, availableFileSystems });
        const options = this.getPickFileToSaveDialogOptions(defaultUri, availableFileSystems);
        if (this.shouldUseSimplified(schema)) {
            return super.pickFileToSaveSimplified(schema, options);
        }
        const activeWindow = getActiveWindow();
        if (!WebFileSystemAccess.supported(activeWindow)) {
            return this.showUnsupportedBrowserWarning('save');
        }
        let fileHandle = undefined;
        const startIn = Iterable.first(this.fileSystemProvider.directories);
        try {
            fileHandle = await activeWindow.showSaveFilePicker({ types: this.getFilePickerTypes(options.filters), ...{ suggestedName: basename(defaultUri), startIn } });
        }
        catch (error) {
            return;
        }
        if (!WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
            return undefined;
        }
        return this.fileSystemProvider.registerFileHandle(fileHandle);
    }
    getFilePickerTypes(filters) {
        return filters?.filter(filter => {
            return !((filter.extensions.length === 1) && ((filter.extensions[0] === '*') || filter.extensions[0] === ''));
        }).map(filter => {
            const accept = {};
            const extensions = filter.extensions.filter(ext => (ext.indexOf('-') < 0) && (ext.indexOf('*') < 0) && (ext.indexOf('_') < 0));
            accept[getMediaOrTextMime(`fileName.${filter.extensions[0]}`) ?? 'text/plain'] = extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
            return {
                description: filter.name,
                accept
            };
        });
    }
    async showSaveDialog(options) {
        const schema = this.getFileSystemSchema(options);
        if (this.shouldUseSimplified(schema)) {
            return super.showSaveDialogSimplified(schema, options);
        }
        const activeWindow = getActiveWindow();
        if (!WebFileSystemAccess.supported(activeWindow)) {
            return this.showUnsupportedBrowserWarning('save');
        }
        let fileHandle = undefined;
        const startIn = Iterable.first(this.fileSystemProvider.directories);
        try {
            fileHandle = await activeWindow.showSaveFilePicker({ types: this.getFilePickerTypes(options.filters), ...options.defaultUri ? { suggestedName: basename(options.defaultUri) } : undefined, ...{ startIn } });
        }
        catch (error) {
            return undefined;
        }
        if (!WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
            return undefined;
        }
        return this.fileSystemProvider.registerFileHandle(fileHandle);
    }
    async showOpenDialog(options) {
        const schema = this.getFileSystemSchema(options);
        if (this.shouldUseSimplified(schema)) {
            return super.showOpenDialogSimplified(schema, options);
        }
        const activeWindow = getActiveWindow();
        if (!WebFileSystemAccess.supported(activeWindow)) {
            return this.showUnsupportedBrowserWarning('open');
        }
        let uri;
        const startIn = Iterable.first(this.fileSystemProvider.directories) ?? 'documents';
        try {
            if (options.canSelectFiles) {
                const handle = await activeWindow.showOpenFilePicker({ multiple: false, types: this.getFilePickerTypes(options.filters), ...{ startIn } });
                if (handle.length === 1 && WebFileSystemAccess.isFileSystemFileHandle(handle[0])) {
                    uri = await this.fileSystemProvider.registerFileHandle(handle[0]);
                }
            }
            else {
                const handle = await activeWindow.showDirectoryPicker({ ...{ startIn } });
                uri = await this.fileSystemProvider.registerDirectoryHandle(handle);
            }
        }
        catch (error) {
        }
        return uri ? [uri] : undefined;
    }
    async showUnsupportedBrowserWarning(context) {
        if (context === 'save') {
            const activeCodeEditor = this.codeEditorService.getActiveCodeEditor();
            if (!(activeCodeEditor instanceof EmbeddedCodeEditorWidget)) {
                const activeTextModel = activeCodeEditor?.getModel();
                if (activeTextModel) {
                    triggerDownload(VSBuffer.fromString(activeTextModel.getValue()).buffer, basename(activeTextModel.uri));
                    return;
                }
            }
        }
        const buttons = [
            {
                label: localize({ key: 'openRemote', comment: ['&& denotes a mnemonic'] }, "&&Open Remote..."),
                run: async () => { await this.commandService.executeCommand('workbench.action.remote.showMenu'); }
            },
            {
                label: localize({ key: 'learnMore', comment: ['&& denotes a mnemonic'] }, "&&Learn More"),
                run: async () => { await this.openerService.open('https://aka.ms/VSCodeWebLocalFileSystemAccess'); }
            }
        ];
        if (context === 'open') {
            buttons.push({
                label: localize({ key: 'openFiles', comment: ['&& denotes a mnemonic'] }, "Open &&Files..."),
                run: async () => {
                    const files = await triggerUpload();
                    if (files) {
                        const filesData = (await this.instantiationService.invokeFunction(accessor => extractFileListData(accessor, files))).filter(fileData => !fileData.isDirectory);
                        if (filesData.length > 0) {
                            this.editorService.openEditors(filesData.map(fileData => {
                                return {
                                    resource: fileData.resource,
                                    contents: fileData.contents?.toString(),
                                    options: { pinned: true }
                                };
                            }));
                        }
                    }
                }
            });
        }
        await this.dialogService.prompt({
            type: Severity.Warning,
            message: localize('unsupportedBrowserMessage', "Opening Local Folders is Unsupported"),
            detail: localize('unsupportedBrowserDetail', "Your browser doesn't support opening local folders.\nYou can either open single files or open a remote repository."),
            buttons
        });
        return undefined;
    }
    shouldUseSimplified(scheme) {
        return ![Schemas.file, Schemas.vscodeUserData, Schemas.tmp].includes(scheme);
    }
}
__decorate([
    memoize,
    __metadata("design:type", HTMLFileSystemProvider),
    __metadata("design:paramtypes", [])
], FileDialogService.prototype, "fileSystemProvider", null);
registerSingleton(IFileDialogService, FileDialogService, 1);
