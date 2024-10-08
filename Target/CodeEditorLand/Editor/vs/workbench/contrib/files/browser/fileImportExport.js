/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BrowserFileUpload_1, FileDownload_1;
import { localize } from '../../../../nls.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { getFileNamesMessage, IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ByteSize, IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IExplorerService } from './files.js';
import { VIEW_ID } from '../common/files.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Limiter, Promises, RunOnceWorker } from '../../../../base/common/async.js';
import { newWriteableBufferStream, VSBuffer } from '../../../../base/common/buffer.js';
import { basename, dirname, joinPath } from '../../../../base/common/resources.js';
import { ResourceFileEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { ExplorerItem } from '../common/explorerModel.js';
import { URI } from '../../../../base/common/uri.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { extractEditorsAndFilesDropData } from '../../../../platform/dnd/browser/dnd.js';
import { IWorkspaceEditingService } from '../../../services/workspaces/common/workspaceEditing.js';
import { isWeb } from '../../../../base/common/platform.js';
import { getActiveWindow, isDragEvent, triggerDownload } from '../../../../base/browser/dom.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { FileAccess, Schemas } from '../../../../base/common/network.js';
import { mnemonicButtonLabel } from '../../../../base/common/labels.js';
import { listenStream } from '../../../../base/common/stream.js';
import { DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { createSingleCallFunction } from '../../../../base/common/functional.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { canceled } from '../../../../base/common/errors.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { WebFileSystemAccess } from '../../../../platform/files/browser/webFileSystemAccess.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
let BrowserFileUpload = class BrowserFileUpload {
    static { BrowserFileUpload_1 = this; }
    static { this.MAX_PARALLEL_UPLOADS = 20; }
    constructor(progressService, dialogService, explorerService, editorService, fileService) {
        this.progressService = progressService;
        this.dialogService = dialogService;
        this.explorerService = explorerService;
        this.editorService = editorService;
        this.fileService = fileService;
    }
    upload(target, source) {
        const cts = new CancellationTokenSource();
        // Indicate progress globally
        const uploadPromise = this.progressService.withProgress({
            location: 10 /* ProgressLocation.Window */,
            delay: 800,
            cancellable: true,
            title: localize('uploadingFiles', "Uploading")
        }, async (progress) => this.doUpload(target, this.toTransfer(source), progress, cts.token), () => cts.dispose(true));
        // Also indicate progress in the files view
        this.progressService.withProgress({ location: VIEW_ID, delay: 500 }, () => uploadPromise);
        return uploadPromise;
    }
    toTransfer(source) {
        if (isDragEvent(source)) {
            return source.dataTransfer;
        }
        const transfer = { items: [] };
        // We want to reuse the same code for uploading from
        // Drag & Drop as well as input element based upload
        // so we convert into webkit data transfer when the
        // input element approach is used (simplified).
        for (const file of source) {
            transfer.items.push({
                webkitGetAsEntry: () => {
                    return {
                        name: file.name,
                        isDirectory: false,
                        isFile: true,
                        createReader: () => { throw new Error('Unsupported for files'); },
                        file: resolve => resolve(file)
                    };
                }
            });
        }
        return transfer;
    }
    async doUpload(target, source, progress, token) {
        const items = source.items;
        // Somehow the items thing is being modified at random, maybe as a security
        // measure since this is a DND operation. As such, we copy the items into
        // an array we own as early as possible before using it.
        const entries = [];
        for (const item of items) {
            entries.push(item.webkitGetAsEntry());
        }
        const results = [];
        const operation = {
            startTime: Date.now(),
            progressScheduler: new RunOnceWorker(steps => { progress.report(steps[steps.length - 1]); }, 1000),
            filesTotal: entries.length,
            filesUploaded: 0,
            totalBytesUploaded: 0
        };
        // Upload all entries in parallel up to a
        // certain maximum leveraging the `Limiter`
        const uploadLimiter = new Limiter(BrowserFileUpload_1.MAX_PARALLEL_UPLOADS);
        await Promises.settled(entries.map(entry => {
            return uploadLimiter.queue(async () => {
                if (token.isCancellationRequested) {
                    return;
                }
                // Confirm overwrite as needed
                if (target && entry.name && target.getChild(entry.name)) {
                    const { confirmed } = await this.dialogService.confirm(getFileOverwriteConfirm(entry.name));
                    if (!confirmed) {
                        return;
                    }
                    await this.explorerService.applyBulkEdit([new ResourceFileEdit(joinPath(target.resource, entry.name), undefined, { recursive: true, folder: target.getChild(entry.name)?.isDirectory })], {
                        undoLabel: localize('overwrite', "Overwrite {0}", entry.name),
                        progressLabel: localize('overwriting', "Overwriting {0}", entry.name),
                    });
                    if (token.isCancellationRequested) {
                        return;
                    }
                }
                // Upload entry
                const result = await this.doUploadEntry(entry, target.resource, target, progress, operation, token);
                if (result) {
                    results.push(result);
                }
            });
        }));
        operation.progressScheduler.dispose();
        // Open uploaded file in editor only if we upload just one
        const firstUploadedFile = results[0];
        if (!token.isCancellationRequested && firstUploadedFile?.isFile) {
            await this.editorService.openEditor({ resource: firstUploadedFile.resource, options: { pinned: true } });
        }
    }
    async doUploadEntry(entry, parentResource, target, progress, operation, token) {
        if (token.isCancellationRequested || !entry.name || (!entry.isFile && !entry.isDirectory)) {
            return undefined;
        }
        // Report progress
        let fileBytesUploaded = 0;
        const reportProgress = (fileSize, bytesUploaded) => {
            fileBytesUploaded += bytesUploaded;
            operation.totalBytesUploaded += bytesUploaded;
            const bytesUploadedPerSecond = operation.totalBytesUploaded / ((Date.now() - operation.startTime) / 1000);
            // Small file
            let message;
            if (fileSize < ByteSize.MB) {
                if (operation.filesTotal === 1) {
                    message = `${entry.name}`;
                }
                else {
                    message = localize('uploadProgressSmallMany', "{0} of {1} files ({2}/s)", operation.filesUploaded, operation.filesTotal, ByteSize.formatSize(bytesUploadedPerSecond));
                }
            }
            // Large file
            else {
                message = localize('uploadProgressLarge', "{0} ({1} of {2}, {3}/s)", entry.name, ByteSize.formatSize(fileBytesUploaded), ByteSize.formatSize(fileSize), ByteSize.formatSize(bytesUploadedPerSecond));
            }
            // Report progress but limit to update only once per second
            operation.progressScheduler.work({ message });
        };
        operation.filesUploaded++;
        reportProgress(0, 0);
        // Handle file upload
        const resource = joinPath(parentResource, entry.name);
        if (entry.isFile) {
            const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Chrome/Edge/Firefox support stream method, but only use it for
            // larger files to reduce the overhead of the streaming approach
            if (typeof file.stream === 'function' && file.size > ByteSize.MB) {
                await this.doUploadFileBuffered(resource, file, reportProgress, token);
            }
            // Fallback to unbuffered upload for other browsers or small files
            else {
                await this.doUploadFileUnbuffered(resource, file, reportProgress);
            }
            return { isFile: true, resource };
        }
        // Handle folder upload
        else {
            // Create target folder
            await this.fileService.createFolder(resource);
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Recursive upload files in this directory
            const dirReader = entry.createReader();
            const childEntries = [];
            let done = false;
            do {
                const childEntriesChunk = await new Promise((resolve, reject) => dirReader.readEntries(resolve, reject));
                if (childEntriesChunk.length > 0) {
                    childEntries.push(...childEntriesChunk);
                }
                else {
                    done = true; // an empty array is a signal that all entries have been read
                }
            } while (!done && !token.isCancellationRequested);
            // Update operation total based on new counts
            operation.filesTotal += childEntries.length;
            // Split up files from folders to upload
            const folderTarget = target && target.getChild(entry.name) || undefined;
            const fileChildEntries = [];
            const folderChildEntries = [];
            for (const childEntry of childEntries) {
                if (childEntry.isFile) {
                    fileChildEntries.push(childEntry);
                }
                else if (childEntry.isDirectory) {
                    folderChildEntries.push(childEntry);
                }
            }
            // Upload files (up to `MAX_PARALLEL_UPLOADS` in parallel)
            const fileUploadQueue = new Limiter(BrowserFileUpload_1.MAX_PARALLEL_UPLOADS);
            await Promises.settled(fileChildEntries.map(fileChildEntry => {
                return fileUploadQueue.queue(() => this.doUploadEntry(fileChildEntry, resource, folderTarget, progress, operation, token));
            }));
            // Upload folders (sequentially give we don't know their sizes)
            for (const folderChildEntry of folderChildEntries) {
                await this.doUploadEntry(folderChildEntry, resource, folderTarget, progress, operation, token);
            }
            return { isFile: false, resource };
        }
    }
    async doUploadFileBuffered(resource, file, progressReporter, token) {
        const writeableStream = newWriteableBufferStream({
            // Set a highWaterMark to prevent the stream
            // for file upload to produce large buffers
            // in-memory
            highWaterMark: 10
        });
        const writeFilePromise = this.fileService.writeFile(resource, writeableStream);
        // Read the file in chunks using File.stream() web APIs
        try {
            const reader = file.stream().getReader();
            let res = await reader.read();
            while (!res.done) {
                if (token.isCancellationRequested) {
                    break;
                }
                // Write buffer into stream but make sure to wait
                // in case the `highWaterMark` is reached
                const buffer = VSBuffer.wrap(res.value);
                await writeableStream.write(buffer);
                if (token.isCancellationRequested) {
                    break;
                }
                // Report progress
                progressReporter(file.size, buffer.byteLength);
                res = await reader.read();
            }
            writeableStream.end(undefined);
        }
        catch (error) {
            writeableStream.error(error);
            writeableStream.end();
        }
        if (token.isCancellationRequested) {
            return undefined;
        }
        // Wait for file being written to target
        await writeFilePromise;
    }
    doUploadFileUnbuffered(resource, file, progressReporter) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    if (event.target?.result instanceof ArrayBuffer) {
                        const buffer = VSBuffer.wrap(new Uint8Array(event.target.result));
                        await this.fileService.writeFile(resource, buffer);
                        // Report progress
                        progressReporter(file.size, buffer.byteLength);
                    }
                    else {
                        throw new Error('Could not read from dropped file.');
                    }
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            };
            // Start reading the file to trigger `onload`
            reader.readAsArrayBuffer(file);
        });
    }
};
BrowserFileUpload = BrowserFileUpload_1 = __decorate([
    __param(0, IProgressService),
    __param(1, IDialogService),
    __param(2, IExplorerService),
    __param(3, IEditorService),
    __param(4, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], BrowserFileUpload);
export { BrowserFileUpload };
//#endregion
//#region External File Import (drag and drop)
let ExternalFileImport = class ExternalFileImport {
    constructor(fileService, hostService, contextService, configurationService, dialogService, workspaceEditingService, explorerService, editorService, progressService, notificationService, instantiationService) {
        this.fileService = fileService;
        this.hostService = hostService;
        this.contextService = contextService;
        this.configurationService = configurationService;
        this.dialogService = dialogService;
        this.workspaceEditingService = workspaceEditingService;
        this.explorerService = explorerService;
        this.editorService = editorService;
        this.progressService = progressService;
        this.notificationService = notificationService;
        this.instantiationService = instantiationService;
    }
    async import(target, source, targetWindow) {
        const cts = new CancellationTokenSource();
        // Indicate progress globally
        const importPromise = this.progressService.withProgress({
            location: 10 /* ProgressLocation.Window */,
            delay: 800,
            cancellable: true,
            title: localize('copyingFiles', "Copying...")
        }, async () => await this.doImport(target, source, targetWindow, cts.token), () => cts.dispose(true));
        // Also indicate progress in the files view
        this.progressService.withProgress({ location: VIEW_ID, delay: 500 }, () => importPromise);
        return importPromise;
    }
    async doImport(target, source, targetWindow, token) {
        // Activate all providers for the resources dropped
        const candidateFiles = coalesce((await this.instantiationService.invokeFunction(accessor => extractEditorsAndFilesDropData(accessor, source))).map(editor => editor.resource));
        await Promise.all(candidateFiles.map(resource => this.fileService.activateProvider(resource.scheme)));
        // Check for dropped external files to be folders
        const files = coalesce(candidateFiles.filter(resource => this.fileService.hasProvider(resource)));
        const resolvedFiles = await this.fileService.resolveAll(files.map(file => ({ resource: file })));
        if (token.isCancellationRequested) {
            return;
        }
        // Pass focus to window
        this.hostService.focus(targetWindow);
        // Handle folders by adding to workspace if we are in workspace context and if dropped on top
        const folders = resolvedFiles.filter(resolvedFile => resolvedFile.success && resolvedFile.stat?.isDirectory).map(resolvedFile => ({ uri: resolvedFile.stat.resource }));
        if (folders.length > 0 && target.isRoot) {
            let ImportChoice;
            (function (ImportChoice) {
                ImportChoice[ImportChoice["Copy"] = 1] = "Copy";
                ImportChoice[ImportChoice["Add"] = 2] = "Add";
            })(ImportChoice || (ImportChoice = {}));
            const buttons = [
                {
                    label: folders.length > 1 ?
                        localize('copyFolders', "&&Copy Folders") :
                        localize('copyFolder', "&&Copy Folder"),
                    run: () => ImportChoice.Copy
                }
            ];
            let message;
            // We only allow to add a folder to the workspace if there is already a workspace folder with that scheme
            const workspaceFolderSchemas = this.contextService.getWorkspace().folders.map(folder => folder.uri.scheme);
            if (folders.some(folder => workspaceFolderSchemas.indexOf(folder.uri.scheme) >= 0)) {
                buttons.unshift({
                    label: folders.length > 1 ?
                        localize('addFolders', "&&Add Folders to Workspace") :
                        localize('addFolder', "&&Add Folder to Workspace"),
                    run: () => ImportChoice.Add
                });
                message = folders.length > 1 ?
                    localize('dropFolders', "Do you want to copy the folders or add the folders to the workspace?") :
                    localize('dropFolder', "Do you want to copy '{0}' or add '{0}' as a folder to the workspace?", basename(folders[0].uri));
            }
            else {
                message = folders.length > 1 ?
                    localize('copyfolders', "Are you sure to want to copy folders?") :
                    localize('copyfolder', "Are you sure to want to copy '{0}'?", basename(folders[0].uri));
            }
            const { result } = await this.dialogService.prompt({
                type: Severity.Info,
                message,
                buttons,
                cancelButton: true
            });
            // Add folders
            if (result === ImportChoice.Add) {
                return this.workspaceEditingService.addFolders(folders);
            }
            // Copy resources
            if (result === ImportChoice.Copy) {
                return this.importResources(target, files, token);
            }
        }
        // Handle dropped files (only support FileStat as target)
        else if (target instanceof ExplorerItem) {
            return this.importResources(target, files, token);
        }
    }
    async importResources(target, resources, token) {
        if (resources && resources.length > 0) {
            // Resolve target to check for name collisions and ask user
            const targetStat = await this.fileService.resolve(target.resource);
            if (token.isCancellationRequested) {
                return;
            }
            // Check for name collisions
            const targetNames = new Set();
            const caseSensitive = this.fileService.hasCapability(target.resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
            if (targetStat.children) {
                targetStat.children.forEach(child => {
                    targetNames.add(caseSensitive ? child.name : child.name.toLowerCase());
                });
            }
            let inaccessibleFileCount = 0;
            const resourcesFiltered = coalesce((await Promises.settled(resources.map(async (resource) => {
                const fileDoesNotExist = !(await this.fileService.exists(resource));
                if (fileDoesNotExist) {
                    inaccessibleFileCount++;
                    return undefined;
                }
                if (targetNames.has(caseSensitive ? basename(resource) : basename(resource).toLowerCase())) {
                    const confirmationResult = await this.dialogService.confirm(getFileOverwriteConfirm(basename(resource)));
                    if (!confirmationResult.confirmed) {
                        return undefined;
                    }
                }
                return resource;
            }))));
            if (inaccessibleFileCount > 0) {
                this.notificationService.error(inaccessibleFileCount > 1 ? localize('filesInaccessible', "Some or all of the dropped files could not be accessed for import.") : localize('fileInaccessible', "The dropped file could not be accessed for import."));
            }
            // Copy resources through bulk edit API
            const resourceFileEdits = resourcesFiltered.map(resource => {
                const sourceFileName = basename(resource);
                const targetFile = joinPath(target.resource, sourceFileName);
                return new ResourceFileEdit(resource, targetFile, { overwrite: true, copy: true });
            });
            const undoLevel = this.configurationService.getValue().explorer.confirmUndo;
            await this.explorerService.applyBulkEdit(resourceFileEdits, {
                undoLabel: resourcesFiltered.length === 1 ?
                    localize({ comment: ['substitution will be the name of the file that was imported'], key: 'importFile' }, "Import {0}", basename(resourcesFiltered[0])) :
                    localize({ comment: ['substitution will be the number of files that were imported'], key: 'importnFile' }, "Import {0} resources", resourcesFiltered.length),
                progressLabel: resourcesFiltered.length === 1 ?
                    localize({ comment: ['substitution will be the name of the file that was copied'], key: 'copyingFile' }, "Copying {0}", basename(resourcesFiltered[0])) :
                    localize({ comment: ['substitution will be the number of files that were copied'], key: 'copyingnFile' }, "Copying {0} resources", resourcesFiltered.length),
                progressLocation: 10 /* ProgressLocation.Window */,
                confirmBeforeUndo: undoLevel === "verbose" /* UndoConfirmLevel.Verbose */ || undoLevel === "default" /* UndoConfirmLevel.Default */,
            });
            // if we only add one file, just open it directly
            const autoOpen = this.configurationService.getValue().explorer.autoOpenDroppedFile;
            if (autoOpen && resourceFileEdits.length === 1) {
                const item = this.explorerService.findClosest(resourceFileEdits[0].newResource);
                if (item && !item.isDirectory) {
                    this.editorService.openEditor({ resource: item.resource, options: { pinned: true } });
                }
            }
        }
    }
};
ExternalFileImport = __decorate([
    __param(0, IFileService),
    __param(1, IHostService),
    __param(2, IWorkspaceContextService),
    __param(3, IConfigurationService),
    __param(4, IDialogService),
    __param(5, IWorkspaceEditingService),
    __param(6, IExplorerService),
    __param(7, IEditorService),
    __param(8, IProgressService),
    __param(9, INotificationService),
    __param(10, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ExternalFileImport);
export { ExternalFileImport };
let FileDownload = class FileDownload {
    static { FileDownload_1 = this; }
    static { this.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY = 'workbench.explorer.downloadPath'; }
    constructor(fileService, explorerService, progressService, logService, fileDialogService, storageService) {
        this.fileService = fileService;
        this.explorerService = explorerService;
        this.progressService = progressService;
        this.logService = logService;
        this.fileDialogService = fileDialogService;
        this.storageService = storageService;
    }
    download(source) {
        const cts = new CancellationTokenSource();
        // Indicate progress globally
        const downloadPromise = this.progressService.withProgress({
            location: 10 /* ProgressLocation.Window */,
            delay: 800,
            cancellable: isWeb,
            title: localize('downloadingFiles', "Downloading")
        }, async (progress) => this.doDownload(source, progress, cts), () => cts.dispose(true));
        // Also indicate progress in the files view
        this.progressService.withProgress({ location: VIEW_ID, delay: 500 }, () => downloadPromise);
        return downloadPromise;
    }
    async doDownload(sources, progress, cts) {
        for (const source of sources) {
            if (cts.token.isCancellationRequested) {
                return;
            }
            // Web: use DOM APIs to download files with optional support
            // for folders and large files
            if (isWeb) {
                await this.doDownloadBrowser(source.resource, progress, cts);
            }
            // Native: use working copy file service to get at the contents
            else {
                await this.doDownloadNative(source, progress, cts);
            }
        }
    }
    async doDownloadBrowser(resource, progress, cts) {
        const stat = await this.fileService.resolve(resource, { resolveMetadata: true });
        if (cts.token.isCancellationRequested) {
            return;
        }
        const maxBlobDownloadSize = 32 * ByteSize.MB; // avoid to download via blob-trick >32MB to avoid memory pressure
        const preferFileSystemAccessWebApis = stat.isDirectory || stat.size > maxBlobDownloadSize;
        // Folder: use FS APIs to download files and folders if available and preferred
        const activeWindow = getActiveWindow();
        if (preferFileSystemAccessWebApis && WebFileSystemAccess.supported(activeWindow)) {
            try {
                const parentFolder = await activeWindow.showDirectoryPicker();
                const operation = {
                    startTime: Date.now(),
                    progressScheduler: new RunOnceWorker(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                    filesTotal: stat.isDirectory ? 0 : 1, // folders increment filesTotal within downloadFolder method
                    filesDownloaded: 0,
                    totalBytesDownloaded: 0,
                    fileBytesDownloaded: 0
                };
                if (stat.isDirectory) {
                    const targetFolder = await parentFolder.getDirectoryHandle(stat.name, { create: true });
                    await this.downloadFolderBrowser(stat, targetFolder, operation, cts.token);
                }
                else {
                    await this.downloadFileBrowser(parentFolder, stat, operation, cts.token);
                }
                operation.progressScheduler.dispose();
            }
            catch (error) {
                this.logService.warn(error);
                cts.cancel(); // `showDirectoryPicker` will throw an error when the user cancels
            }
        }
        // File: use traditional download to circumvent browser limitations
        else if (stat.isFile) {
            let bufferOrUri;
            try {
                bufferOrUri = (await this.fileService.readFile(stat.resource, { limits: { size: maxBlobDownloadSize } }, cts.token)).value.buffer;
            }
            catch (error) {
                bufferOrUri = FileAccess.uriToBrowserUri(stat.resource);
            }
            if (!cts.token.isCancellationRequested) {
                triggerDownload(bufferOrUri, stat.name);
            }
        }
    }
    async downloadFileBufferedBrowser(resource, target, operation, token) {
        const contents = await this.fileService.readFileStream(resource, undefined, token);
        if (token.isCancellationRequested) {
            target.close();
            return;
        }
        return new Promise((resolve, reject) => {
            const sourceStream = contents.value;
            const disposables = new DisposableStore();
            disposables.add(toDisposable(() => target.close()));
            disposables.add(createSingleCallFunction(token.onCancellationRequested)(() => {
                disposables.dispose();
                reject(canceled());
            }));
            listenStream(sourceStream, {
                onData: data => {
                    target.write(data.buffer);
                    this.reportProgress(contents.name, contents.size, data.byteLength, operation);
                },
                onError: error => {
                    disposables.dispose();
                    reject(error);
                },
                onEnd: () => {
                    disposables.dispose();
                    resolve();
                }
            }, token);
        });
    }
    async downloadFileUnbufferedBrowser(resource, target, operation, token) {
        const contents = await this.fileService.readFile(resource, undefined, token);
        if (!token.isCancellationRequested) {
            target.write(contents.value.buffer);
            this.reportProgress(contents.name, contents.size, contents.value.byteLength, operation);
        }
        target.close();
    }
    async downloadFileBrowser(targetFolder, file, operation, token) {
        // Report progress
        operation.filesDownloaded++;
        operation.fileBytesDownloaded = 0; // reset for this file
        this.reportProgress(file.name, 0, 0, operation);
        // Start to download
        const targetFile = await targetFolder.getFileHandle(file.name, { create: true });
        const targetFileWriter = await targetFile.createWritable();
        // For large files, write buffered using streams
        if (file.size > ByteSize.MB) {
            return this.downloadFileBufferedBrowser(file.resource, targetFileWriter, operation, token);
        }
        // For small files prefer to write unbuffered to reduce overhead
        return this.downloadFileUnbufferedBrowser(file.resource, targetFileWriter, operation, token);
    }
    async downloadFolderBrowser(folder, targetFolder, operation, token) {
        if (folder.children) {
            operation.filesTotal += (folder.children.map(child => child.isFile)).length;
            for (const child of folder.children) {
                if (token.isCancellationRequested) {
                    return;
                }
                if (child.isFile) {
                    await this.downloadFileBrowser(targetFolder, child, operation, token);
                }
                else {
                    const childFolder = await targetFolder.getDirectoryHandle(child.name, { create: true });
                    const resolvedChildFolder = await this.fileService.resolve(child.resource, { resolveMetadata: true });
                    await this.downloadFolderBrowser(resolvedChildFolder, childFolder, operation, token);
                }
            }
        }
    }
    reportProgress(name, fileSize, bytesDownloaded, operation) {
        operation.fileBytesDownloaded += bytesDownloaded;
        operation.totalBytesDownloaded += bytesDownloaded;
        const bytesDownloadedPerSecond = operation.totalBytesDownloaded / ((Date.now() - operation.startTime) / 1000);
        // Small file
        let message;
        if (fileSize < ByteSize.MB) {
            if (operation.filesTotal === 1) {
                message = name;
            }
            else {
                message = localize('downloadProgressSmallMany', "{0} of {1} files ({2}/s)", operation.filesDownloaded, operation.filesTotal, ByteSize.formatSize(bytesDownloadedPerSecond));
            }
        }
        // Large file
        else {
            message = localize('downloadProgressLarge', "{0} ({1} of {2}, {3}/s)", name, ByteSize.formatSize(operation.fileBytesDownloaded), ByteSize.formatSize(fileSize), ByteSize.formatSize(bytesDownloadedPerSecond));
        }
        // Report progress but limit to update only once per second
        operation.progressScheduler.work({ message });
    }
    async doDownloadNative(explorerItem, progress, cts) {
        progress.report({ message: explorerItem.name });
        let defaultUri;
        const lastUsedDownloadPath = this.storageService.get(FileDownload_1.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
        if (lastUsedDownloadPath) {
            defaultUri = joinPath(URI.file(lastUsedDownloadPath), explorerItem.name);
        }
        else {
            defaultUri = joinPath(explorerItem.isDirectory ?
                await this.fileDialogService.defaultFolderPath(Schemas.file) :
                await this.fileDialogService.defaultFilePath(Schemas.file), explorerItem.name);
        }
        const destination = await this.fileDialogService.showSaveDialog({
            availableFileSystems: [Schemas.file],
            saveLabel: mnemonicButtonLabel(localize('downloadButton', "Download")),
            title: localize('chooseWhereToDownload', "Choose Where to Download"),
            defaultUri
        });
        if (destination) {
            // Remember as last used download folder
            this.storageService.store(FileDownload_1.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY, dirname(destination).fsPath, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            // Perform download
            await this.explorerService.applyBulkEdit([new ResourceFileEdit(explorerItem.resource, destination, { overwrite: true, copy: true })], {
                undoLabel: localize('downloadBulkEdit', "Download {0}", explorerItem.name),
                progressLabel: localize('downloadingBulkEdit', "Downloading {0}", explorerItem.name),
                progressLocation: 10 /* ProgressLocation.Window */
            });
        }
        else {
            cts.cancel(); // User canceled a download. In case there were multiple files selected we should cancel the remainder of the prompts #86100
        }
    }
};
FileDownload = FileDownload_1 = __decorate([
    __param(0, IFileService),
    __param(1, IExplorerService),
    __param(2, IProgressService),
    __param(3, ILogService),
    __param(4, IFileDialogService),
    __param(5, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], FileDownload);
export { FileDownload };
//#endregion
//#region Helpers
export function getFileOverwriteConfirm(name) {
    return {
        message: localize('confirmOverwrite', "A file or folder with the name '{0}' already exists in the destination folder. Do you want to replace it?", name),
        detail: localize('irreversible', "This action is irreversible!"),
        primaryButton: localize({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
        type: 'warning'
    };
}
export function getMultipleFilesOverwriteConfirm(files) {
    if (files.length > 1) {
        return {
            message: localize('confirmManyOverwrites', "The following {0} files and/or folders already exist in the destination folder. Do you want to replace them?", files.length),
            detail: getFileNamesMessage(files) + '\n' + localize('irreversible', "This action is irreversible!"),
            primaryButton: localize({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
            type: 'warning'
        };
    }
    return getFileOverwriteConfirm(basename(files[0]));
}
//#endregion
