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
import { bufferToStream, newWriteableBufferStream, VSBuffer } from '../../../../base/common/buffer.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isDefined } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { StoredValue } from './storedValue.js';
import { HydratedTestResult } from './testResult.js';
export const RETAIN_MAX_RESULTS = 128;
const RETAIN_MIN_RESULTS = 16;
const RETAIN_MAX_BYTES = 1024 * 128;
const CLEANUP_PROBABILITY = 0.2;
export const ITestResultStorage = createDecorator('ITestResultStorage');
/**
 * Data revision this version of VS Code deals with. Should be bumped whenever
 * a breaking change is made to the stored results, which will cause previous
 * revisions to be discarded.
 */
const currentRevision = 1;
let BaseTestResultStorage = class BaseTestResultStorage extends Disposable {
    constructor(uriIdentityService, storageService, logService) {
        super();
        this.uriIdentityService = uriIdentityService;
        this.storageService = storageService;
        this.logService = logService;
        this.stored = this._register(new StoredValue({
            key: 'storedTestResults',
            scope: 1 /* StorageScope.WORKSPACE */,
            target: 1 /* StorageTarget.MACHINE */
        }, this.storageService));
    }
    /**
     * @override
     */
    async read() {
        const results = await Promise.all(this.stored.get([]).map(async (rec) => {
            if (rec.rev !== currentRevision) {
                return undefined;
            }
            try {
                const contents = await this.readForResultId(rec.id);
                if (!contents) {
                    return undefined;
                }
                return { rec, result: new HydratedTestResult(this.uriIdentityService, contents) };
            }
            catch (e) {
                this.logService.warn(`Error deserializing stored test result ${rec.id}`, e);
                return undefined;
            }
        }));
        const defined = results.filter(isDefined);
        if (defined.length !== results.length) {
            this.stored.store(defined.map(({ rec }) => rec));
        }
        return defined.map(({ result }) => result);
    }
    /**
     * @override
     */
    getResultOutputWriter(resultId) {
        const stream = newWriteableBufferStream();
        this.storeOutputForResultId(resultId, stream);
        return stream;
    }
    /**
     * @override
     */
    async persist(results) {
        const toDelete = new Map(this.stored.get([]).map(({ id, bytes }) => [id, bytes]));
        const toStore = [];
        const todo = [];
        let budget = RETAIN_MAX_BYTES;
        // Run until either:
        // 1. We store all results
        // 2. We store the max results
        // 3. We store the min results, and have no more byte budget
        for (let i = 0; i < results.length && i < RETAIN_MAX_RESULTS && (budget > 0 || toStore.length < RETAIN_MIN_RESULTS); i++) {
            const result = results[i];
            const existingBytes = toDelete.get(result.id);
            if (existingBytes !== undefined) {
                toDelete.delete(result.id);
                toStore.push({ id: result.id, rev: currentRevision, bytes: existingBytes });
                budget -= existingBytes;
                continue;
            }
            const obj = result.toJSON();
            if (!obj) {
                continue;
            }
            const contents = VSBuffer.fromString(JSON.stringify(obj));
            todo.push(this.storeForResultId(result.id, obj));
            toStore.push({ id: result.id, rev: currentRevision, bytes: contents.byteLength });
            budget -= contents.byteLength;
        }
        for (const id of toDelete.keys()) {
            todo.push(this.deleteForResultId(id).catch(() => undefined));
        }
        this.stored.store(toStore);
        await Promise.all(todo);
    }
};
BaseTestResultStorage = __decorate([
    __param(0, IUriIdentityService),
    __param(1, IStorageService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], BaseTestResultStorage);
export { BaseTestResultStorage };
export class InMemoryResultStorage extends BaseTestResultStorage {
    constructor() {
        super(...arguments);
        this.cache = new Map();
    }
    async readForResultId(id) {
        return Promise.resolve(this.cache.get(id));
    }
    storeForResultId(id, contents) {
        this.cache.set(id, contents);
        return Promise.resolve();
    }
    deleteForResultId(id) {
        this.cache.delete(id);
        return Promise.resolve();
    }
    readOutputForResultId(id) {
        throw new Error('Method not implemented.');
    }
    storeOutputForResultId(id, input) {
        throw new Error('Method not implemented.');
    }
    readOutputRangeForResultId(id, offset, length) {
        throw new Error('Method not implemented.');
    }
}
let TestResultStorage = class TestResultStorage extends BaseTestResultStorage {
    constructor(uriIdentityService, storageService, logService, workspaceContext, fileService, environmentService) {
        super(uriIdentityService, storageService, logService);
        this.fileService = fileService;
        this.directory = URI.joinPath(environmentService.workspaceStorageHome, workspaceContext.getWorkspace().id, 'testResults');
    }
    async readForResultId(id) {
        const contents = await this.fileService.readFile(this.getResultJsonPath(id));
        return JSON.parse(contents.value.toString());
    }
    storeForResultId(id, contents) {
        return this.fileService.writeFile(this.getResultJsonPath(id), VSBuffer.fromString(JSON.stringify(contents)));
    }
    deleteForResultId(id) {
        return this.fileService.del(this.getResultJsonPath(id)).catch(() => undefined);
    }
    async readOutputRangeForResultId(id, offset, length) {
        try {
            const { value } = await this.fileService.readFile(this.getResultOutputPath(id), { position: offset, length });
            return value;
        }
        catch {
            return VSBuffer.alloc(0);
        }
    }
    async readOutputForResultId(id) {
        try {
            const { value } = await this.fileService.readFileStream(this.getResultOutputPath(id));
            return value;
        }
        catch {
            return bufferToStream(VSBuffer.alloc(0));
        }
    }
    async storeOutputForResultId(id, input) {
        await this.fileService.createFile(this.getResultOutputPath(id), input);
    }
    /**
     * @inheritdoc
     */
    async persist(results) {
        await super.persist(results);
        if (Math.random() < CLEANUP_PROBABILITY) {
            await this.cleanupDereferenced();
        }
    }
    /**
     * Cleans up orphaned files. For instance, output can get orphaned if it's
     * written but the editor is closed before the test run is complete.
     */
    async cleanupDereferenced() {
        const { children } = await this.fileService.resolve(this.directory);
        if (!children) {
            return;
        }
        const stored = new Set(this.stored.get([]).filter(s => s.rev === currentRevision).map(s => s.id));
        await Promise.all(children
            .filter(child => !stored.has(child.name.replace(/\.[a-z]+$/, '')))
            .map(child => this.fileService.del(child.resource).catch(() => undefined)));
    }
    getResultJsonPath(id) {
        return URI.joinPath(this.directory, `${id}.json`);
    }
    getResultOutputPath(id) {
        return URI.joinPath(this.directory, `${id}.output`);
    }
};
TestResultStorage = __decorate([
    __param(0, IUriIdentityService),
    __param(1, IStorageService),
    __param(2, ILogService),
    __param(3, IWorkspaceContextService),
    __param(4, IFileService),
    __param(5, IEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], TestResultStorage);
export { TestResultStorage };
