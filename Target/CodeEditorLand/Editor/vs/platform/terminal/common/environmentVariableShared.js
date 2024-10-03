export function serializeEnvironmentVariableCollection(collection) {
    return [...collection.entries()];
}
export function serializeEnvironmentDescriptionMap(descriptionMap) {
    return descriptionMap ? [...descriptionMap.entries()] : [];
}
export function deserializeEnvironmentVariableCollection(serializedCollection) {
    return new Map(serializedCollection);
}
export function deserializeEnvironmentDescriptionMap(serializableEnvironmentDescription) {
    return new Map(serializableEnvironmentDescription ?? []);
}
export function serializeEnvironmentVariableCollections(collections) {
    return Array.from(collections.entries()).map(e => {
        return [e[0], serializeEnvironmentVariableCollection(e[1].map), serializeEnvironmentDescriptionMap(e[1].descriptionMap)];
    });
}
export function deserializeEnvironmentVariableCollections(serializedCollection) {
    return new Map(serializedCollection.map(e => {
        return [e[0], { map: deserializeEnvironmentVariableCollection(e[1]), descriptionMap: deserializeEnvironmentDescriptionMap(e[2]) }];
    }));
}
