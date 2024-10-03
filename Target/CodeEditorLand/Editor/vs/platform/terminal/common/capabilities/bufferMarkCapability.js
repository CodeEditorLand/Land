import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export class BufferMarkCapability extends Disposable {
    constructor(_terminal) {
        super();
        this._terminal = _terminal;
        this.type = 4;
        this._idToMarkerMap = new Map();
        this._anonymousMarkers = new Map();
        this._onMarkAdded = this._register(new Emitter());
        this.onMarkAdded = this._onMarkAdded.event;
    }
    *markers() {
        for (const m of this._idToMarkerMap.values()) {
            yield m;
        }
        for (const m of this._anonymousMarkers.values()) {
            yield m;
        }
    }
    addMark(properties) {
        const marker = properties?.marker || this._terminal.registerMarker();
        const id = properties?.id;
        if (!marker) {
            return;
        }
        if (id) {
            this._idToMarkerMap.set(id, marker);
            marker.onDispose(() => this._idToMarkerMap.delete(id));
        }
        else {
            this._anonymousMarkers.set(marker.id, marker);
            marker.onDispose(() => this._anonymousMarkers.delete(marker.id));
        }
        this._onMarkAdded.fire({ marker, id, hidden: properties?.hidden, hoverMessage: properties?.hoverMessage });
    }
    getMark(id) {
        return this._idToMarkerMap.get(id);
    }
}
