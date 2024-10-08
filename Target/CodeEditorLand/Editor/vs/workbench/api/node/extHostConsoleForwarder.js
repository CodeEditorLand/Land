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
import { AbstractExtHostConsoleForwarder } from '../common/extHostConsoleForwarder.js';
import { IExtHostInitDataService } from '../common/extHostInitDataService.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';
const MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;
let ExtHostConsoleForwarder = class ExtHostConsoleForwarder extends AbstractExtHostConsoleForwarder {
    constructor(extHostRpc, initData) {
        super(extHostRpc, initData);
        this._isMakingConsoleCall = false;
        this._wrapStream('stderr', 'error');
        this._wrapStream('stdout', 'log');
    }
    _nativeConsoleLogMessage(method, original, args) {
        const stream = method === 'error' || method === 'warn' ? process.stderr : process.stdout;
        this._isMakingConsoleCall = true;
        stream.write(`\n${"START_NATIVE_LOG" /* NativeLogMarkers.Start */}\n`);
        original.apply(console, args);
        stream.write(`\n${"END_NATIVE_LOG" /* NativeLogMarkers.End */}\n`);
        this._isMakingConsoleCall = false;
    }
    /**
     * Wraps process.stderr/stdout.write() so that it is transmitted to the
     * renderer or CLI. It both calls through to the original method as well
     * as to console.log with complete lines so that they're made available
     * to the debugger/CLI.
     */
    _wrapStream(streamName, severity) {
        const stream = process[streamName];
        const original = stream.write;
        let buf = '';
        Object.defineProperty(stream, 'write', {
            set: () => { },
            get: () => (chunk, encoding, callback) => {
                if (!this._isMakingConsoleCall) {
                    buf += chunk.toString(encoding);
                    const eol = buf.length > MAX_STREAM_BUFFER_LENGTH ? buf.length : buf.lastIndexOf('\n');
                    if (eol !== -1) {
                        console[severity](buf.slice(0, eol));
                        buf = buf.slice(eol + 1);
                    }
                }
                original.call(stream, chunk, encoding, callback);
            },
        });
    }
};
ExtHostConsoleForwarder = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostInitDataService),
    __metadata("design:paramtypes", [Object, Object])
], ExtHostConsoleForwarder);
export { ExtHostConsoleForwarder };
