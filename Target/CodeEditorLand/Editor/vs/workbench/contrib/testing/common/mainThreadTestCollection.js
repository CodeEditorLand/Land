import { Emitter } from '../../../../base/common/event.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { AbstractIncrementalTestCollection } from './testTypes.js';
export class MainThreadTestCollection extends AbstractIncrementalTestCollection {
    get busyProviders() {
        return this.busyControllerCount;
    }
    get rootItems() {
        return this.roots;
    }
    get all() {
        return this.getIterator();
    }
    get rootIds() {
        return Iterable.map(this.roots.values(), r => r.item.extId);
    }
    constructor(uriIdentityService, expandActual) {
        super(uriIdentityService);
        this.expandActual = expandActual;
        this.testsByUrl = new ResourceMap();
        this.busyProvidersChangeEmitter = new Emitter();
        this.expandPromises = new WeakMap();
        this.onBusyProvidersChange = this.busyProvidersChangeEmitter.event;
        this.changeCollector = {
            add: node => {
                if (!node.item.uri) {
                    return;
                }
                const s = this.testsByUrl.get(node.item.uri);
                if (!s) {
                    this.testsByUrl.set(node.item.uri, new Set([node]));
                }
                else {
                    s.add(node);
                }
            },
            remove: node => {
                if (!node.item.uri) {
                    return;
                }
                const s = this.testsByUrl.get(node.item.uri);
                if (!s) {
                    return;
                }
                s.delete(node);
                if (s.size === 0) {
                    this.testsByUrl.delete(node.item.uri);
                }
            },
        };
    }
    expand(testId, levels) {
        const test = this.items.get(testId);
        if (!test) {
            return Promise.resolve();
        }
        const existing = this.expandPromises.get(test);
        if (existing && existing.pendingLvl >= levels) {
            return existing.prom;
        }
        const prom = this.expandActual(test.item.extId, levels);
        const record = { doneLvl: existing ? existing.doneLvl : -1, pendingLvl: levels, prom };
        this.expandPromises.set(test, record);
        return prom.then(() => {
            record.doneLvl = levels;
        });
    }
    getNodeById(id) {
        return this.items.get(id);
    }
    getNodeByUrl(uri) {
        return this.testsByUrl.get(uri) || Iterable.empty();
    }
    getReviverDiff() {
        const ops = [{ op: 4, amount: this.pendingRootCount }];
        const queue = [this.rootIds];
        while (queue.length) {
            for (const child of queue.pop()) {
                const item = this.items.get(child);
                ops.push({
                    op: 0,
                    item: {
                        controllerId: item.controllerId,
                        expand: item.expand,
                        item: item.item,
                    }
                });
                queue.push(item.children);
            }
        }
        return ops;
    }
    apply(diff) {
        const prevBusy = this.busyControllerCount;
        super.apply(diff);
        if (prevBusy !== this.busyControllerCount) {
            this.busyProvidersChangeEmitter.fire(this.busyControllerCount);
        }
    }
    clear() {
        const ops = [];
        for (const root of this.roots) {
            ops.push({ op: 3, itemId: root.item.extId });
        }
        this.roots.clear();
        this.items.clear();
        return ops;
    }
    createItem(internal) {
        return { ...internal, children: new Set() };
    }
    createChangeCollector() {
        return this.changeCollector;
    }
    *getIterator() {
        const queue = [this.rootIds];
        while (queue.length) {
            for (const id of queue.pop()) {
                const node = this.getNodeById(id);
                yield node;
                queue.push(node.children);
            }
        }
    }
}
