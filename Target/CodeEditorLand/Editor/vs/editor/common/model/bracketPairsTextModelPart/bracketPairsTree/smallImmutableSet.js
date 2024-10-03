const emptyArr = [];
export class SmallImmutableSet {
    static { this.cache = new Array(129); }
    static create(items, additionalItems) {
        if (items <= 128 && additionalItems.length === 0) {
            let cached = SmallImmutableSet.cache[items];
            if (!cached) {
                cached = new SmallImmutableSet(items, additionalItems);
                SmallImmutableSet.cache[items] = cached;
            }
            return cached;
        }
        return new SmallImmutableSet(items, additionalItems);
    }
    static { this.empty = SmallImmutableSet.create(0, emptyArr); }
    static getEmpty() {
        return this.empty;
    }
    constructor(items, additionalItems) {
        this.items = items;
        this.additionalItems = additionalItems;
    }
    add(value, keyProvider) {
        const key = keyProvider.getKey(value);
        let idx = key >> 5;
        if (idx === 0) {
            const newItem = (1 << key) | this.items;
            if (newItem === this.items) {
                return this;
            }
            return SmallImmutableSet.create(newItem, this.additionalItems);
        }
        idx--;
        const newItems = this.additionalItems.slice(0);
        while (newItems.length < idx) {
            newItems.push(0);
        }
        newItems[idx] |= 1 << (key & 31);
        return SmallImmutableSet.create(this.items, newItems);
    }
    has(value, keyProvider) {
        const key = keyProvider.getKey(value);
        let idx = key >> 5;
        if (idx === 0) {
            return (this.items & (1 << key)) !== 0;
        }
        idx--;
        return ((this.additionalItems[idx] || 0) & (1 << (key & 31))) !== 0;
    }
    merge(other) {
        const merged = this.items | other.items;
        if (this.additionalItems === emptyArr && other.additionalItems === emptyArr) {
            if (merged === this.items) {
                return this;
            }
            if (merged === other.items) {
                return other;
            }
            return SmallImmutableSet.create(merged, emptyArr);
        }
        const newItems = [];
        for (let i = 0; i < Math.max(this.additionalItems.length, other.additionalItems.length); i++) {
            const item1 = this.additionalItems[i] || 0;
            const item2 = other.additionalItems[i] || 0;
            newItems.push(item1 | item2);
        }
        return SmallImmutableSet.create(merged, newItems);
    }
    intersects(other) {
        if ((this.items & other.items) !== 0) {
            return true;
        }
        for (let i = 0; i < Math.min(this.additionalItems.length, other.additionalItems.length); i++) {
            if ((this.additionalItems[i] & other.additionalItems[i]) !== 0) {
                return true;
            }
        }
        return false;
    }
    equals(other) {
        if (this.items !== other.items) {
            return false;
        }
        if (this.additionalItems.length !== other.additionalItems.length) {
            return false;
        }
        for (let i = 0; i < this.additionalItems.length; i++) {
            if (this.additionalItems[i] !== other.additionalItems[i]) {
                return false;
            }
        }
        return true;
    }
}
export const identityKeyProvider = {
    getKey(value) {
        return value;
    }
};
export class DenseKeyProvider {
    constructor() {
        this.items = new Map();
    }
    getKey(value) {
        let existing = this.items.get(value);
        if (existing === undefined) {
            existing = this.items.size;
            this.items.set(value, existing);
        }
        return existing;
    }
    reverseLookup(value) {
        return [...this.items].find(([_key, v]) => v === value)?.[0];
    }
    reverseLookupSet(set) {
        const result = [];
        for (const [key] of this.items) {
            if (set.has(key, this)) {
                result.push(key);
            }
        }
        return result;
    }
    keys() {
        return this.items.keys();
    }
}
