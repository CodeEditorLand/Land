import { createFastDomNode } from '../../../../../base/browser/fastDomNode.js';
import { onUnexpectedError } from '../../../../../base/common/errors.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
const invalidFunc = () => { throw new Error(`Invalid notebook view zone change accessor`); };
export class NotebookViewZones extends Disposable {
    constructor(listView, coordinator) {
        super();
        this.listView = listView;
        this.coordinator = coordinator;
        this.domNode = createFastDomNode(document.createElement('div'));
        this.domNode.setClassName('view-zones');
        this.domNode.setPosition('absolute');
        this.domNode.setAttribute('role', 'presentation');
        this.domNode.setAttribute('aria-hidden', 'true');
        this.domNode.setWidth('100%');
        this._zones = {};
        this.listView.containerDomNode.appendChild(this.domNode.domNode);
    }
    changeViewZones(callback) {
        let zonesHaveChanged = false;
        const changeAccessor = {
            addZone: (zone) => {
                zonesHaveChanged = true;
                return this._addZone(zone);
            },
            removeZone: (id) => {
                zonesHaveChanged = true;
                this._removeZone(id);
            },
            layoutZone: (id) => {
                zonesHaveChanged = true;
                this._layoutZone(id);
            }
        };
        safeInvoke1Arg(callback, changeAccessor);
        changeAccessor.addZone = invalidFunc;
        changeAccessor.removeZone = invalidFunc;
        changeAccessor.layoutZone = invalidFunc;
        return zonesHaveChanged;
    }
    onCellsChanged(e) {
        const splices = e.splices.slice().reverse();
        splices.forEach(splice => {
            const [start, deleted, newCells] = splice;
            const fromIndex = start;
            const toIndex = start + deleted;
            for (const id in this._zones) {
                const zone = this._zones[id].zone;
                const cellBeforeWhitespaceIndex = zone.afterModelPosition - 1;
                if (cellBeforeWhitespaceIndex >= fromIndex && cellBeforeWhitespaceIndex < toIndex) {
                    zone.afterModelPosition = fromIndex;
                    this._updateWhitespace(this._zones[id]);
                }
                else if (cellBeforeWhitespaceIndex >= toIndex) {
                    const insertLength = newCells.length;
                    const offset = insertLength - deleted;
                    zone.afterModelPosition += offset;
                    this._updateWhitespace(this._zones[id]);
                }
            }
        });
    }
    onHiddenRangesChange() {
        for (const id in this._zones) {
            this._updateWhitespace(this._zones[id]);
        }
    }
    _updateWhitespace(zone) {
        const whitespaceId = zone.whitespaceId;
        const viewPosition = this.coordinator.convertModelIndexToViewIndex(zone.zone.afterModelPosition);
        const isInHiddenArea = this._isInHiddenRanges(zone.zone);
        zone.isInHiddenArea = isInHiddenArea;
        this.listView.changeOneWhitespace(whitespaceId, viewPosition, isInHiddenArea ? 0 : zone.zone.heightInPx);
    }
    layout() {
        for (const id in this._zones) {
            this._layoutZone(id);
        }
    }
    _addZone(zone) {
        const viewPosition = this.coordinator.convertModelIndexToViewIndex(zone.afterModelPosition);
        const whitespaceId = this.listView.insertWhitespace(viewPosition, zone.heightInPx);
        const isInHiddenArea = this._isInHiddenRanges(zone);
        const myZone = {
            whitespaceId: whitespaceId,
            zone: zone,
            domNode: createFastDomNode(zone.domNode),
            isInHiddenArea: isInHiddenArea
        };
        this._zones[whitespaceId] = myZone;
        myZone.domNode.setPosition('absolute');
        myZone.domNode.domNode.style.width = '100%';
        myZone.domNode.setDisplay('none');
        myZone.domNode.setAttribute('notebook-view-zone', whitespaceId);
        this.domNode.appendChild(myZone.domNode);
        return whitespaceId;
    }
    _removeZone(id) {
        this.listView.removeWhitespace(id);
        delete this._zones[id];
    }
    _layoutZone(id) {
        const zoneWidget = this._zones[id];
        if (!zoneWidget) {
            return;
        }
        this._updateWhitespace(this._zones[id]);
        const isInHiddenArea = this._isInHiddenRanges(zoneWidget.zone);
        if (isInHiddenArea) {
            zoneWidget.domNode.setDisplay('none');
        }
        else {
            const top = this.listView.getWhitespacePosition(zoneWidget.whitespaceId);
            zoneWidget.domNode.setTop(top);
            zoneWidget.domNode.setDisplay('block');
            zoneWidget.domNode.setHeight(zoneWidget.zone.heightInPx);
        }
    }
    _isInHiddenRanges(zone) {
        const afterIndex = zone.afterModelPosition;
        return !this.coordinator.modelIndexIsVisible(afterIndex);
    }
    dispose() {
        super.dispose();
        this._zones = {};
    }
}
function safeInvoke1Arg(func, arg1) {
    try {
        func(arg1);
    }
    catch (e) {
        onUnexpectedError(e);
    }
}
