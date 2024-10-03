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
import { IMarkerService } from '../../../platform/markers/common/markers.js';
import { URI } from '../../../base/common/uri.js';
import { MainContext, ExtHostContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
let MainThreadDiagnostics = class MainThreadDiagnostics {
    constructor(extHostContext, _markerService, _uriIdentService) {
        this._markerService = _markerService;
        this._uriIdentService = _uriIdentService;
        this._activeOwners = new Set();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDiagnostics);
        this._markerListener = this._markerService.onMarkerChanged(this._forwardMarkers, this);
    }
    dispose() {
        this._markerListener.dispose();
        this._activeOwners.forEach(owner => this._markerService.changeAll(owner, []));
        this._activeOwners.clear();
    }
    _forwardMarkers(resources) {
        const data = [];
        for (const resource of resources) {
            const allMarkerData = this._markerService.read({ resource });
            if (allMarkerData.length === 0) {
                data.push([resource, []]);
            }
            else {
                const forgeinMarkerData = allMarkerData.filter(marker => !this._activeOwners.has(marker.owner));
                if (forgeinMarkerData.length > 0) {
                    data.push([resource, forgeinMarkerData]);
                }
            }
        }
        if (data.length > 0) {
            this._proxy.$acceptMarkersChange(data);
        }
    }
    $changeMany(owner, entries) {
        for (const entry of entries) {
            const [uri, markers] = entry;
            if (markers) {
                for (const marker of markers) {
                    if (marker.relatedInformation) {
                        for (const relatedInformation of marker.relatedInformation) {
                            relatedInformation.resource = URI.revive(relatedInformation.resource);
                        }
                    }
                    if (marker.code && typeof marker.code !== 'string') {
                        marker.code.target = URI.revive(marker.code.target);
                    }
                }
            }
            this._markerService.changeOne(owner, this._uriIdentService.asCanonicalUri(URI.revive(uri)), markers);
        }
        this._activeOwners.add(owner);
    }
    $clear(owner) {
        this._markerService.changeAll(owner, []);
        this._activeOwners.delete(owner);
    }
};
MainThreadDiagnostics = __decorate([
    extHostNamedCustomer(MainContext.MainThreadDiagnostics),
    __param(1, IMarkerService),
    __param(2, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MainThreadDiagnostics);
export { MainThreadDiagnostics };
