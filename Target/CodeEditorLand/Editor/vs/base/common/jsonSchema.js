/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function getCompressedContent(schema) {
    let hasDups = false;
    // visit all schema nodes and collect the ones that are equal
    const equalsByString = new Map();
    const nodeToEquals = new Map();
    const visitSchemas = (next) => {
        if (schema === next) {
            return true;
        }
        const val = JSON.stringify(next);
        if (val.length < 30) {
            // the $ref takes around 25 chars, so we don't save anything
            return true;
        }
        const eq = equalsByString.get(val);
        if (!eq) {
            const newEq = { schemas: [next] };
            equalsByString.set(val, newEq);
            nodeToEquals.set(next, newEq);
            return true;
        }
        eq.schemas.push(next);
        nodeToEquals.set(next, eq);
        hasDups = true;
        return false;
    };
    traverseNodes(schema, visitSchemas);
    equalsByString.clear();
    if (!hasDups) {
        return JSON.stringify(schema);
    }
    let defNodeName = '$defs';
    while (schema.hasOwnProperty(defNodeName)) {
        defNodeName += '_';
    }
    // used to collect all schemas that are later put in `$defs`. The index in the array is the id of the schema.
    const definitions = [];
    function stringify(root) {
        return JSON.stringify(root, (_key, value) => {
            if (value !== root) {
                const eq = nodeToEquals.get(value);
                if (eq && eq.schemas.length > 1) {
                    if (!eq.id) {
                        eq.id = `_${definitions.length}`;
                        definitions.push(eq.schemas[0]);
                    }
                    return { $ref: `#/${defNodeName}/${eq.id}` };
                }
            }
            return value;
        });
    }
    // stringify the schema and replace duplicate subtrees with $ref
    // this will add new items to the definitions array
    const str = stringify(schema);
    // now stringify the definitions. Each invication of stringify cann add new items to the definitions array, so the length can grow while we iterate
    const defStrings = [];
    for (let i = 0; i < definitions.length; i++) {
        defStrings.push(`"_${i}":${stringify(definitions[i])}`);
    }
    if (defStrings.length) {
        return `${str.substring(0, str.length - 1)},"${defNodeName}":{${defStrings.join(',')}}}`;
    }
    return str;
}
function isObject(thing) {
    return typeof thing === 'object' && thing !== null;
}
/*
 * Traverse a JSON schema and visit each schema node
*/
function traverseNodes(root, visit) {
    if (!root || typeof root !== 'object') {
        return;
    }
    const collectEntries = (...entries) => {
        for (const entry of entries) {
            if (isObject(entry)) {
                toWalk.push(entry);
            }
        }
    };
    const collectMapEntries = (...maps) => {
        for (const map of maps) {
            if (isObject(map)) {
                for (const key in map) {
                    const entry = map[key];
                    if (isObject(entry)) {
                        toWalk.push(entry);
                    }
                }
            }
        }
    };
    const collectArrayEntries = (...arrays) => {
        for (const array of arrays) {
            if (Array.isArray(array)) {
                for (const entry of array) {
                    if (isObject(entry)) {
                        toWalk.push(entry);
                    }
                }
            }
        }
    };
    const collectEntryOrArrayEntries = (items) => {
        if (Array.isArray(items)) {
            for (const entry of items) {
                if (isObject(entry)) {
                    toWalk.push(entry);
                }
            }
        }
        else if (isObject(items)) {
            toWalk.push(items);
        }
    };
    const toWalk = [root];
    let next = toWalk.pop();
    while (next) {
        const visitChildern = visit(next);
        if (visitChildern) {
            collectEntries(next.additionalItems, next.additionalProperties, next.not, next.contains, next.propertyNames, next.if, next.then, next.else, next.unevaluatedItems, next.unevaluatedProperties);
            collectMapEntries(next.definitions, next.$defs, next.properties, next.patternProperties, next.dependencies, next.dependentSchemas);
            collectArrayEntries(next.anyOf, next.allOf, next.oneOf, next.prefixItems);
            collectEntryOrArrayEntries(next.items);
        }
        next = toWalk.pop();
    }
}
