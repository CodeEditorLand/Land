import { ListView } from '../../../../../base/browser/ui/list/listView.js';
import { ConstantTimePrefixSumComputer } from '../../../../../editor/common/model/prefixSumComputer.js';
export class NotebookCellsLayout {
    get paddingTop() {
        return this._paddingTop;
    }
    set paddingTop(paddingTop) {
        this._size = this._size + paddingTop - this._paddingTop;
        this._paddingTop = paddingTop;
    }
    get count() {
        return this._items.length;
    }
    get size() {
        return this._size;
    }
    constructor(topPadding) {
        this._items = [];
        this._whitespace = [];
        this._prefixSumComputer = new ConstantTimePrefixSumComputer([]);
        this._size = 0;
        this._paddingTop = 0;
        this._paddingTop = topPadding ?? 0;
        this._size = this._paddingTop;
    }
    getWhitespaces() {
        return this._whitespace;
    }
    restoreWhitespace(items) {
        this._whitespace = items;
        this._size = this._paddingTop + this._items.reduce((total, item) => total + item.size, 0) + this._whitespace.reduce((total, ws) => total + ws.size, 0);
    }
    splice(index, deleteCount, items) {
        const inserts = items ?? [];
        this._items.splice(index, deleteCount, ...inserts);
        this._size = this._paddingTop + this._items.reduce((total, item) => total + item.size, 0) + this._whitespace.reduce((total, ws) => total + ws.size, 0);
        this._prefixSumComputer.removeValues(index, deleteCount);
        const newSizes = [];
        for (let i = 0; i < inserts.length; i++) {
            const insertIndex = i + index;
            const existingWhitespaces = this._whitespace.filter(ws => ws.afterPosition === insertIndex + 1);
            if (existingWhitespaces.length > 0) {
                newSizes.push(inserts[i].size + existingWhitespaces.reduce((acc, ws) => acc + ws.size, 0));
            }
            else {
                newSizes.push(inserts[i].size);
            }
        }
        this._prefixSumComputer.insertValues(index, newSizes);
        for (let i = index; i < this._items.length; i++) {
            const existingWhitespaces = this._whitespace.filter(ws => ws.afterPosition === i + 1);
            if (existingWhitespaces.length > 0) {
                this._prefixSumComputer.setValue(i, this._items[i].size + existingWhitespaces.reduce((acc, ws) => acc + ws.size, 0));
            }
            else {
                this._prefixSumComputer.setValue(i, this._items[i].size);
            }
        }
    }
    insertWhitespace(id, afterPosition, size) {
        let priority = 0;
        const existingWhitespaces = this._whitespace.filter(ws => ws.afterPosition === afterPosition);
        if (existingWhitespaces.length > 0) {
            priority = Math.max(...existingWhitespaces.map(ws => ws.priority)) + 1;
        }
        this._whitespace.push({ id, afterPosition: afterPosition, size, priority });
        this._size += size;
        this._whitespace.sort((a, b) => {
            if (a.afterPosition === b.afterPosition) {
                return a.priority - b.priority;
            }
            return a.afterPosition - b.afterPosition;
        });
        if (afterPosition > 0) {
            const index = afterPosition - 1;
            const itemSize = this._items[index].size;
            const accSize = itemSize + size;
            this._prefixSumComputer.setValue(index, accSize);
        }
    }
    changeOneWhitespace(id, afterPosition, size) {
        const whitespaceIndex = this._whitespace.findIndex(ws => ws.id === id);
        if (whitespaceIndex !== -1) {
            const whitespace = this._whitespace[whitespaceIndex];
            const oldAfterPosition = whitespace.afterPosition;
            whitespace.afterPosition = afterPosition;
            const oldSize = whitespace.size;
            const delta = size - oldSize;
            whitespace.size = size;
            this._size += delta;
            if (oldAfterPosition > 0 && oldAfterPosition <= this._items.length) {
                const index = oldAfterPosition - 1;
                const itemSize = this._items[index].size;
                const accSize = itemSize;
                this._prefixSumComputer.setValue(index, accSize);
            }
            if (afterPosition > 0 && afterPosition <= this._items.length) {
                const index = afterPosition - 1;
                const itemSize = this._items[index].size;
                const accSize = itemSize + size;
                this._prefixSumComputer.setValue(index, accSize);
            }
        }
    }
    removeWhitespace(id) {
        const whitespaceIndex = this._whitespace.findIndex(ws => ws.id === id);
        if (whitespaceIndex !== -1) {
            const whitespace = this._whitespace[whitespaceIndex];
            this._whitespace.splice(whitespaceIndex, 1);
            this._size -= whitespace.size;
            if (whitespace.afterPosition > 0) {
                const index = whitespace.afterPosition - 1;
                const itemSize = this._items[index].size;
                const remainingWhitespaces = this._whitespace.filter(ws => ws.afterPosition === whitespace.afterPosition);
                const accSize = itemSize + remainingWhitespaces.reduce((acc, ws) => acc + ws.size, 0);
                this._prefixSumComputer.setValue(index, accSize);
            }
        }
    }
    getWhitespacePosition(id) {
        const whitespace = this._whitespace.find(ws => ws.id === id);
        if (!whitespace) {
            throw new Error('Whitespace not found');
        }
        const afterPosition = whitespace.afterPosition;
        if (afterPosition === 0) {
            const whitespaces = this._whitespace.filter(ws => ws.afterPosition === afterPosition && ws.priority < whitespace.priority);
            return whitespaces.reduce((acc, ws) => acc + ws.size, 0) + this.paddingTop;
        }
        const whitespaceBeforeFirstItem = this._whitespace.filter(ws => ws.afterPosition === 0).reduce((acc, ws) => acc + ws.size, 0);
        const index = afterPosition - 1;
        const previousItemPosition = this._prefixSumComputer.getPrefixSum(index);
        const previousItemSize = this._items[index].size;
        const previousWhitespace = this._whitespace.filter(ws => (ws.afterPosition <= afterPosition - 1 && ws.afterPosition > 0));
        const whitespaceBefore = previousWhitespace.reduce((acc, ws) => acc + ws.size, 0);
        return previousItemPosition + previousItemSize + whitespaceBeforeFirstItem + this.paddingTop + whitespaceBefore;
    }
    indexAt(position) {
        if (position < 0) {
            return -1;
        }
        const whitespaceBeforeFirstItem = this._whitespace.filter(ws => ws.afterPosition === 0).reduce((acc, ws) => acc + ws.size, 0);
        const offset = position - (this._paddingTop + whitespaceBeforeFirstItem);
        if (offset <= 0) {
            return 0;
        }
        if (offset >= (this._size - this._paddingTop - whitespaceBeforeFirstItem)) {
            return this.count;
        }
        return this._prefixSumComputer.getIndexOf(Math.trunc(offset)).index;
    }
    indexAfter(position) {
        const index = this.indexAt(position);
        return Math.min(index + 1, this._items.length);
    }
    positionAt(index) {
        if (index < 0) {
            return -1;
        }
        if (this.count === 0) {
            return -1;
        }
        if (index >= this.count) {
            return -1;
        }
        const whitespaceBeforeFirstItem = this._whitespace.filter(ws => ws.afterPosition === 0).reduce((acc, ws) => acc + ws.size, 0);
        return this._prefixSumComputer.getPrefixSum(index) + this._paddingTop + whitespaceBeforeFirstItem;
    }
}
export class NotebookCellListView extends ListView {
    constructor() {
        super(...arguments);
        this._lastWhitespaceId = 0;
        this._renderingStack = 0;
    }
    get inRenderingTransaction() {
        return this._renderingStack > 0;
    }
    get notebookRangeMap() {
        return this.rangeMap;
    }
    render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM) {
        this._renderingStack++;
        super.render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM);
        this._renderingStack--;
    }
    _rerender(renderTop, renderHeight, inSmoothScrolling) {
        this._renderingStack++;
        super._rerender(renderTop, renderHeight, inSmoothScrolling);
        this._renderingStack--;
    }
    createRangeMap(paddingTop) {
        const existingMap = this.rangeMap;
        if (existingMap) {
            const layout = new NotebookCellsLayout(paddingTop);
            layout.restoreWhitespace(existingMap.getWhitespaces());
            return layout;
        }
        else {
            return new NotebookCellsLayout(paddingTop);
        }
    }
    insertWhitespace(afterPosition, size) {
        const scrollTop = this.scrollTop;
        const id = `${++this._lastWhitespaceId}`;
        const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
        const elementPosition = this.elementTop(afterPosition);
        const aboveScrollTop = scrollTop > elementPosition;
        this.notebookRangeMap.insertWhitespace(id, afterPosition, size);
        const newScrolltop = aboveScrollTop ? scrollTop + size : scrollTop;
        this.render(previousRenderRange, newScrolltop, this.lastRenderHeight, undefined, undefined, false);
        this._rerender(newScrolltop, this.renderHeight, false);
        this.eventuallyUpdateScrollDimensions();
        return id;
    }
    changeOneWhitespace(id, newAfterPosition, newSize) {
        const scrollTop = this.scrollTop;
        const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
        const currentPosition = this.notebookRangeMap.getWhitespacePosition(id);
        if (currentPosition > scrollTop) {
            this.notebookRangeMap.changeOneWhitespace(id, newAfterPosition, newSize);
            this.render(previousRenderRange, scrollTop, this.lastRenderHeight, undefined, undefined, false);
            this._rerender(scrollTop, this.renderHeight, false);
            this.eventuallyUpdateScrollDimensions();
        }
        else {
            this.notebookRangeMap.changeOneWhitespace(id, newAfterPosition, newSize);
            this.eventuallyUpdateScrollDimensions();
        }
    }
    removeWhitespace(id) {
        const scrollTop = this.scrollTop;
        const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
        const currentPosition = this.notebookRangeMap.getWhitespacePosition(id);
        if (currentPosition > scrollTop) {
            this.notebookRangeMap.removeWhitespace(id);
            this.render(previousRenderRange, scrollTop, this.lastRenderHeight, undefined, undefined, false);
            this._rerender(scrollTop, this.renderHeight, false);
            this.eventuallyUpdateScrollDimensions();
        }
        else {
            this.notebookRangeMap.removeWhitespace(id);
            this.eventuallyUpdateScrollDimensions();
        }
    }
    getWhitespacePosition(id) {
        return this.notebookRangeMap.getWhitespacePosition(id);
    }
}
