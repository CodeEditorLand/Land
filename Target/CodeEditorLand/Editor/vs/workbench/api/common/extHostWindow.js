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
var ExtHostWindow_1;
import { Emitter } from '../../../base/common/event.js';
import { Schemas } from '../../../base/common/network.js';
import { isFalsyOrWhitespace } from '../../../base/common/strings.js';
import { URI } from '../../../base/common/uri.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { MainContext } from './extHost.protocol.js';
let ExtHostWindow = class ExtHostWindow {
    static { ExtHostWindow_1 = this; }
    static { this.InitialState = {
        focused: true,
        active: true,
    }; }
    getState() {
        const state = this._state;
        return {
            get focused() {
                return state.focused;
            },
            get active() {
                return state.active;
            },
        };
    }
    constructor(extHostRpc) {
        this._onDidChangeWindowState = new Emitter();
        this.onDidChangeWindowState = this._onDidChangeWindowState.event;
        this._state = ExtHostWindow_1.InitialState;
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadWindow);
        this._proxy.$getInitialState().then(({ isFocused, isActive }) => {
            this.onDidChangeWindowProperty('focused', isFocused);
            this.onDidChangeWindowProperty('active', isActive);
        });
    }
    $onDidChangeWindowFocus(value) {
        this.onDidChangeWindowProperty('focused', value);
    }
    $onDidChangeWindowActive(value) {
        this.onDidChangeWindowProperty('active', value);
    }
    onDidChangeWindowProperty(property, value) {
        if (value === this._state[property]) {
            return;
        }
        this._state = { ...this._state, [property]: value };
        this._onDidChangeWindowState.fire(this._state);
    }
    openUri(stringOrUri, options) {
        let uriAsString;
        if (typeof stringOrUri === 'string') {
            uriAsString = stringOrUri;
            try {
                stringOrUri = URI.parse(stringOrUri);
            }
            catch (e) {
                return Promise.reject(`Invalid uri - '${stringOrUri}'`);
            }
        }
        if (isFalsyOrWhitespace(stringOrUri.scheme)) {
            return Promise.reject('Invalid scheme - cannot be empty');
        }
        else if (stringOrUri.scheme === Schemas.command) {
            return Promise.reject(`Invalid scheme '${stringOrUri.scheme}'`);
        }
        return this._proxy.$openUri(stringOrUri, uriAsString, options);
    }
    async asExternalUri(uri, options) {
        if (isFalsyOrWhitespace(uri.scheme)) {
            return Promise.reject('Invalid scheme - cannot be empty');
        }
        const result = await this._proxy.$asExternalUri(uri, options);
        return URI.from(result);
    }
};
ExtHostWindow = ExtHostWindow_1 = __decorate([
    __param(0, IExtHostRpcService),
    __metadata("design:paramtypes", [Object])
], ExtHostWindow);
export { ExtHostWindow };
export const IExtHostWindow = createDecorator('IExtHostWindow');
