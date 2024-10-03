export function randomPort() {
    const min = 1025;
    const max = 65535;
    return min + Math.floor((max - min) * Math.random());
}
